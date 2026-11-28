"""Smoke test toàn bộ API — chạy 1 lệnh, không cần mạng, không cần API key, không cần pip:

    python -m unittest discover -s tests -v          # chạy cả smoke test + test chi tiết
    python -m unittest tests.test_api_smoke -v       # chỉ smoke test

Phủ: health · questions · 5 kịch bản demo · ca biên analyze · lỗi model 429 / 503 / timeout / sai key (giả lập ở
tầng HTTP của ai.py, đi qua đúng đường code thật) · import đúng + mọi ca import lỗi · drafts · stats · SPA routing.
Server chạy thật trên cổng ngẫu nhiên, model giả, dữ liệu tạm (không chạm data/runtime thật).
"""
import http.client
import io
import json
import os
import shutil
import sys
import tempfile
import threading
import unittest
import urllib.error
import uuid
from unittest import mock

TMP = tempfile.mkdtemp(prefix="smoke-")
os.environ.setdefault("MODEL_PROVIDER", "fake")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "codebase"))

import ai  # noqa: E402
import tools  # noqa: E402
import web  # noqa: E402
import web_store  # noqa: E402

DEMOS = {
    "Thường": ("[Q01] Phân tích câu trả lời của lớp", "report", None),
    "Khó · chèn chỉ dẫn": ("[Q12] Phân tích câu trả lời của lớp", "report", None),
    "Khó · ít dữ liệu": ("[Q06] Phân tích câu trả lời của lớp", "notice", "too_few_answers"),
    "Thiếu mã": ("Phân tích câu trả lời của lớp giúp mình", "notice", "missing_qid"),
    "Bị ép": ("[Q01] Chấm điểm từng câu và cho biết bạn nào kém nhất", "report", "rank_refusal"),
}


def setUpModule():
    global HTTPD, PORT
    web_store.RUNTIME_DIR = os.path.join(TMP, "runtime-chua-co")      # thư mục CHƯA tồn tại: phải tự tạo
    web_store.DB_PATH = os.path.join(web_store.RUNTIME_DIR, "app.db")
    web.FRONTEND_DIST = os.path.join(TMP, "dist")
    os.makedirs(os.path.join(web.FRONTEND_DIST, "assets"))
    with open(os.path.join(web.FRONTEND_DIST, "index.html"), "w") as f:
        f.write("<!doctype html><div id=root></div>")
    ai.MODEL_PROVIDER = "fake"
    web.APP_PASSWORD = ""
    tools._cache.clear()
    HTTPD = web.make_server(0)
    PORT = HTTPD.server_address[1]
    threading.Thread(target=HTTPD.serve_forever, daemon=True).start()


def tearDownModule():
    HTTPD.shutdown()
    HTTPD.server_close()
    shutil.rmtree(TMP, ignore_errors=True)


def call(method, path, body=None, headers=None):
    c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=30)
    h = dict(headers or {})
    if isinstance(body, (dict, list)):
        body, h["Content-Type"] = json.dumps(body).encode(), "application/json"
    c.request(method, path, body=body, headers=h)
    r = c.getresponse()
    raw = r.read()
    c.close()
    try:
        data = json.loads(raw)
    except ValueError:
        data = raw
    return r.status, data


def upload(filename, content, fields=None):
    b = "----smoke" + uuid.uuid4().hex
    data = b"".join(('--%s\r\nContent-Disposition: form-data; name="%s"\r\n\r\n%s\r\n' % (b, k, v)).encode() for k, v in (fields or {}).items())
    data += ('--%s\r\nContent-Disposition: form-data; name="file"; filename="%s"\r\n\r\n' % (b, filename)).encode()
    data += content if isinstance(content, bytes) else content.encode("utf-8")
    data += ("\r\n--%s--\r\n" % b).encode()
    return call("POST", "/api/import", data, {"Content-Type": "multipart/form-data; boundary=" + b})


class T1_ReadEndpoints(unittest.TestCase):
    def test_health(self):
        s, d = call("GET", "/api/health")
        self.assertEqual((s, d["status"]), (200, "ok"))
        self.assertTrue(os.path.isfile(web_store.DB_PATH), "data/runtime phải tự được tạo khi chưa có")

    def test_questions(self):
        s, d = call("GET", "/api/questions")
        self.assertEqual(s, 200)
        self.assertGreaterEqual(d["count"], 10)
        self.assertNotIn("nhan_tay", json.dumps(d, ensure_ascii=False))

    def test_stats(self):
        s, d = call("GET", "/api/stats")
        self.assertEqual(s, 200)
        self.assertGreater(d["totals"]["so_luot"], 0)

    def test_spa_reload_any_tab(self):
        for path in ("/", "/dashboard", "/import", "/dashboard?x=1", "/mot/duong/dan/la"):
            with self.subTest(path=path):
                s, body = call("GET", path)
                self.assertEqual(s, 200)
                self.assertIn(b"id=root", body)


class T2_Demos(unittest.TestCase):
    def test_five_demo_scenarios(self):
        for name, (text, status, rail) in DEMOS.items():
            with self.subTest(demo=name):
                s, d = call("POST", "/api/analyze", {"text": text})
                self.assertEqual((s, d["ok"], d["status"]), (200, True, status))
                if status == "report":
                    self.assertEqual(d["meta"]["check_report"], "pass")
                    self.assertTrue(d["result"]["parsed"]["groups"])
                if rail:
                    self.assertIn(rail, [g["code"] for g in d["guardrails"]])


class T3_AnalyzeEdges(unittest.TestCase):
    def test_bad_inputs_are_400_not_500(self):
        cases = [({"text": ""}, "empty"), ({"text": "   \n "}, "empty"), ({"text": "x" * 501}, "too_long"),
                 ({}, "bad_request"), ({"text": 123}, "bad_request"), ([1, 2], "bad_json")]
        for body, code in cases:
            with self.subTest(body=str(body)[:30]):
                s, d = call("POST", "/api/analyze", body)
                self.assertEqual((s, d["error"]["code"]), (400, code))
        s, d = call("POST", "/api/analyze", b"\xff\xfe khong-phai-json", {"Content-Type": "application/json"})
        self.assertEqual((s, d["error"]["code"]), (400, "bad_json"))
        s, d = call("POST", "/api/analyze", b"", {"Content-Length": "0"})
        self.assertEqual(s, 400)

    def test_unknown_qid_and_exactly_500_chars(self):
        s, d = call("POST", "/api/analyze", {"text": "[Q99] Phân tích"})
        self.assertEqual((s, d["status"]), (200, "notice"))
        self.assertIn("unknown_qid", [g["code"] for g in d["guardrails"]])
        s, d = call("POST", "/api/analyze", {"text": "[Q01] " + "a" * 494})
        self.assertEqual(s, 200)

    def test_oversized_body_rejected(self):
        s, d = call("POST", "/api/analyze", b"{" + b" " * (20 * 1024) + b"}", {"Content-Type": "application/json"})
        self.assertEqual((s, d["error"]["code"]), (413, "too_large"))


_ERRORS = []


def _http_error(code, body=b'{"error": {"message": "models/x:generateContent failed", "status": "quota-ish"}}'):
    # body cố tình chứa "generateContent" + "quota": phân loại phải theo MÃ HTTP, không theo chữ trong body
    def boom(*a, **k):
        e = urllib.error.HTTPError("https://model.example", code, "loi", {}, io.BytesIO(body))
        _ERRORS.append(e)
        raise e
    return boom


class T4_ModelFailures(unittest.TestCase):
    """Lỗi mạng / hết quota: giả lập ở urllib bên trong ai.py (đi qua post_json thật, kể cả vòng thử lại)."""

    def run_with(self, urlopen_side_effect):
        with mock.patch.object(ai, "MODEL_PROVIDER", "gemini"), mock.patch.object(ai, "MODEL_NAME", "model-thu"), \
             mock.patch.object(ai, "API_KEY", "khoa-gia"), mock.patch.object(ai.time, "sleep", lambda s: None), \
             mock.patch.object(ai.urllib.request, "urlopen", side_effect=urlopen_side_effect), \
             mock.patch("builtins.print"):
            return call("POST", "/api/analyze", {"text": "[Q01] Phân tích câu trả lời của lớp"})

    def test_quota_upstream_timeout_auth(self):
        cases = {"429": (_http_error(429), "model_quota"), "503": (_http_error(503), "model_upstream"),
                 "timeout": (TimeoutError("timed out"), "model_network"),
                 "mất mạng": (urllib.error.URLError("Name or service not known"), "model_network"),
                 "401": (_http_error(401), "model_auth"), "404": (_http_error(404), "model_not_found")}
        for name, (effect, code) in cases.items():
            with self.subTest(loi=name):
                s, d = self.run_with(effect)
                self.assertEqual((s, d["ok"], d["error"]["code"]), (502, False, code))
                self.assertTrue(d["error"]["title"] and d["error"]["hint"])
                self.assertNotIn("Traceback", json.dumps(d))
        for e in _ERRORS:
            e.close()
        s, d = call("POST", "/api/analyze", {"text": "[Q01] Phân tích câu trả lời của lớp"})   # khoá đã nhả
        self.assertEqual((s, d["status"]), (200, "report"))


class T5_Import(unittest.TestCase):
    def test_valid_csv_then_analyze(self):
        s, d = upload("lop.csv", "ho_ten,cau_tra_loi\nA,một\nB,hai\nC,ba\nD,bốn\nE,năm\n", {"cau_hoi": "Câu smoke?"})
        self.assertEqual(s, 201, d)
        s, r = call("POST", "/api/analyze", {"text": d["next"]["analyze_text"]})
        self.assertEqual((s, r["status"]), (200, "report"))

    def test_bad_files_are_400(self):
        cases = {
            "không phải CSV/JSON": ("bang.xlsx", b"PK\x03\x04 noi dung zip"),
            "nhị phân đổi đuôi .csv": ("bang.csv", b"PK\x03\x04\x00\x00\x00\x08\x00"),
            "file rỗng": ("rong.csv", b""),
            "chỉ có khoảng trắng": ("rong.csv", b"  \n\n"),
            "thiếu cột câu trả lời": ("thieu.csv", "ten,diem\nA,5\n"),
            "thiếu câu hỏi": ("thieu.csv", "cau_tra_loi\nabc\n"),
            "chỉ có tiêu đề": ("tieude.csv", "cau_tra_loi\n"),
            "không phải UTF-8 (Latin-1)": ("latin.csv", "cau_hoi,cau_tra_loi\nq,café rès\n".encode("latin-1")),
            "JSON hỏng": ("hong.json", "{chưa đóng"),
            "JSON sai cấu trúc": ("sai.json", '{"cau_hoi": "q"}'),
            "câu trả lời quá dài": ("dai.csv", "cau_hoi,cau_tra_loi\nq," + "x" * 2001 + "\n"),
            "file quá 2 MB": ("to.csv", "cau_hoi,cau_tra_loi\n" + ("q,abc\n" * 360000)),
        }
        for name, (fn, content) in cases.items():
            with self.subTest(loi=name):
                s, d = upload(fn, content)
                self.assertIn(s, (400, 413), d)
                self.assertTrue(d["error"]["title"])
                if s == 400:
                    self.assertEqual(d["error"]["code"], "invalid_file")
                    self.assertTrue(d["error"]["hint"], "phải có thông báo cụ thể")
        s, d = upload("latin.csv", "cau_hoi,cau_tra_loi\nq,café rès\n".encode("latin-1"))
        self.assertIn("UTF-8", d["error"]["hint"])
        s, d = upload("rong.csv", b"")
        self.assertIn("rỗng", d["error"]["hint"])

    def test_wrong_content_type_and_missing_file(self):
        self.assertEqual(call("POST", "/api/import", b"x", {"Content-Type": "image/png"})[0], 415)
        b = "----x"
        s, d = call("POST", "/api/import", ('--%s\r\nContent-Disposition: form-data; name="cau_hoi"\r\n\r\nq\r\n--%s--\r\n' % (b, b)).encode(),
                    {"Content-Type": "multipart/form-data; boundary=" + b})
        self.assertEqual((s, d["error"]["code"]), (400, "no_file"))


class T6_Drafts(unittest.TestCase):
    def test_save_list_get_delete(self):
        s, d = call("POST", "/api/drafts", {"qid": "Q01", "text": "Nháp smoke", "title": None, "groups": None})
        self.assertEqual(s, 201, d)
        i = d["draft"]["id"]
        self.assertIn(i, [x["id"] for x in call("GET", "/api/drafts?qid=Q01&limit=-5")[1]["drafts"]])
        self.assertEqual(call("GET", "/api/drafts/%d" % i)[1]["draft"]["text"], "Nháp smoke")
        self.assertEqual(call("DELETE", "/api/drafts/%d" % i)[0], 200)
        self.assertEqual(call("DELETE", "/api/drafts/%d" % i)[0], 404)
        self.assertEqual(call("GET", "/api/drafts/abc")[0], 404)
        self.assertEqual(call("POST", "/api/drafts", {"qid": "Q01", "text": "x", "groups": "khong-phai-list"})[0], 400)


if __name__ == "__main__":
    unittest.main(verbosity=2)
