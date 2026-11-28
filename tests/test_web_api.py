"""Test nhanh backend web — chỉ thư viện chuẩn. Chạy: python -m unittest tests.test_web_api -v

Chạy server thật trên cổng ngẫu nhiên, model giả, thư mục runtime + frontend/dist tạm (không chạm data/runtime thật).
"""
import http.client
import json
import os
import shutil
import sys
import tempfile
import threading
import unittest
import uuid

TMP = tempfile.mkdtemp(prefix="web-test-")
os.environ["MODEL_PROVIDER"] = "fake"          # đặt trước khi import ai (load_env không ghi đè biến đã có)
os.environ["WEB_RUNTIME_DIR"] = os.path.join(TMP, "runtime")
os.environ["WEB_FRONTEND_DIST"] = os.path.join(TMP, "dist-missing")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "codebase"))

import tools  # noqa: E402
import web  # noqa: E402
import web_store  # noqa: E402


def setUpModule():
    global HTTPD, PORT
    # Tự dựng lại trạng thái riêng: chạy chung process với test khác (unittest discover) không đè dữ liệu nhau.
    web_store.RUNTIME_DIR = os.path.join(TMP, "runtime")
    web_store.DB_PATH = os.path.join(web_store.RUNTIME_DIR, "app.db")
    web.FRONTEND_DIST = os.path.join(TMP, "dist-missing")
    web.ai.MODEL_PROVIDER = "fake"
    tools._cache.clear()
    HTTPD = web.make_server(0)
    PORT = HTTPD.server_address[1]
    threading.Thread(target=HTTPD.serve_forever, daemon=True).start()


def tearDownModule():
    HTTPD.shutdown()
    HTTPD.server_close()
    shutil.rmtree(TMP, ignore_errors=True)


def req(method, path, body=None, headers=None):
    c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=30)
    h = dict(headers or {})
    if isinstance(body, (dict, list)):
        body = json.dumps(body).encode("utf-8")
        h.setdefault("Content-Type", "application/json")
    elif isinstance(body, str):
        body = body.encode("utf-8")
    c.request(method, path, body=body, headers=h)
    r = c.getresponse()
    raw = r.read()
    c.close()
    ctype = r.getheader("Content-Type") or ""
    data = json.loads(raw) if ctype.startswith("application/json") and raw else raw
    return r.status, data, r


def multipart(filename, content, fields=None):
    b = "----test" + uuid.uuid4().hex
    parts = []
    for k, v in (fields or {}).items():
        parts.append('--%s\r\nContent-Disposition: form-data; name="%s"\r\n\r\n%s\r\n' % (b, k, v))
    parts.append('--%s\r\nContent-Disposition: form-data; name="file"; filename="%s"\r\nContent-Type: text/csv\r\n\r\n' % (b, filename))
    body = "".join(parts).encode("utf-8") + content.encode("utf-8") + ("\r\n--%s--\r\n" % b).encode()
    return body, {"Content-Type": "multipart/form-data; boundary=%s" % b}


def analyze(text):
    return req("POST", "/api/analyze", {"text": text})


class Health(unittest.TestCase):
    def test_health(self):
        s, d, _ = req("GET", "/api/health")
        self.assertEqual(s, 200)
        self.assertEqual(d["status"], "ok")
        self.assertEqual(d["model"], {"provider": "fake", "name": None, "fake": True})
        self.assertGreaterEqual(d["data"]["questions"], 10)
        self.assertEqual(d["frontend"], "legacy")

    def test_unknown_endpoint_and_method(self):
        self.assertEqual(req("GET", "/api/khong-co")[0], 404)
        self.assertEqual(req("POST", "/api/health", {})[0], 405)


class Questions(unittest.TestCase):
    def test_list_and_no_hand_labels(self):
        s, d, r = req("GET", "/api/questions")
        self.assertEqual(s, 200)
        qids = [q["qid"] for q in d["questions"]]
        self.assertIn("Q01", qids)
        self.assertTrue(all(q["source"] in ("goc", "import") for q in d["questions"]))
        s, raw, _ = req("GET", "/api/answers?qid=Q12")
        self.assertEqual(s, 200)
        self.assertNotIn("nhan_tay", json.dumps(raw, ensure_ascii=False))
        self.assertEqual(req("GET", "/api/answers?qid=Q99")[0], 404)


class Analyze(unittest.TestCase):
    def test_report(self):
        s, d, _ = analyze("[Q01] Phân tích câu trả lời của lớp")
        self.assertEqual(s, 200)
        self.assertTrue(d["ok"])
        self.assertEqual(d["status"], "report")
        self.assertEqual(d["question"]["qid"], "Q01")
        self.assertEqual(d["meta"]["check_report"], "pass")
        self.assertEqual(d["meta"]["model_calls"], 1)
        self.assertIn("fake_model", [g["code"] for g in d["guardrails"]])
        self.assertEqual(d["result"]["parsed"]["kind"], "report")
        for k in ("output", "parsed", "summary", "steps", "elapsed_ms", "model_provider"):   # trang cũ vẫn dùng
            self.assertIn(k, d)

    def test_guardrails(self):
        cases = {"[Q01] Chấm điểm từng câu và cho biết bạn nào kém nhất": ("report", "rank_refusal"),
                 "[Q06] Phân tích câu trả lời của lớp": ("notice", "too_few_answers"),
                 "Phân tích câu trả lời của lớp giúp mình": ("notice", "missing_qid"),
                 "[Q01] và [Q02]": ("notice", "multiple_qid"),
                 "[Q99] ...": ("notice", "unknown_qid")}
        for text, (status, code) in cases.items():
            with self.subTest(text=text):
                s, d, _ = analyze(text)
                self.assertEqual((s, d["status"]), (200, status))
                self.assertIn(code, [g["code"] for g in d["guardrails"]])

    def test_input_errors(self):
        s, d, _ = analyze("   ")
        self.assertEqual((s, d["error"]["code"], d.get("soft")), (400, "empty", True))
        s, d, _ = analyze("x" * 600)
        self.assertEqual((s, d["error"]["code"]), (400, "too_long"))
        s, d, _ = req("POST", "/api/analyze", "khong-phai-json", {"Content-Type": "application/json"})
        self.assertEqual((s, d["error"]["code"]), (400, "bad_json"))

    def test_busy(self):
        web._LOCK.acquire()
        try:
            s, d, _ = analyze("[Q01] Phân tích")
        finally:
            web._LOCK.release()
        self.assertEqual((s, d["error"]["code"]), (409, "busy"))

    def test_model_error(self):
        old = web.ai.MODEL_PROVIDER
        web.ai.MODEL_PROVIDER = "khong-ho-tro"
        try:
            s, d, _ = analyze("[Q01] Phân tích câu trả lời của lớp")
        finally:
            web.ai.MODEL_PROVIDER = old
        self.assertEqual((s, d["ok"], d["error"]["code"]), (502, False, "model_provider"))
        self.assertIn("steps", d["trace"])


class Stats(unittest.TestCase):
    def test_stats(self):
        s, d, _ = req("GET", "/api/stats")
        self.assertEqual(s, 200)
        self.assertGreater(d["totals"]["so_ngay"], 0)
        self.assertEqual(d["totals"]["so_ngay"], len(d["days"]))
        self.assertIn("ngay", d["stats"])


class Import(unittest.TestCase):
    CSV = ("ho_ten,email,cau_tra_loi\n"
           "Nguyễn A,a@x.com,Khi các bước cố định thì dùng workflow\n"
           "Trần B,b@x.com,agent luôn tốt hơn\n"
           "Lê C,c@x.com,\"ít bước thì workflow, nhiều bước thì agent\"\n"
           "Phạm D,d@x.com,em là L1234 liên hệ 0912345678\n"
           "Võ E,e@x.com,\n"
           "Đỗ F,f@x.com,workflow khi quy trình biết trước\n")

    def test_csv_multipart_privacy_and_analyze(self):
        body, h = multipart("lop.csv", self.CSV, {"cau_hoi": "Khi nào dùng workflow thay vì agent?"})
        s, d, _ = req("POST", "/api/import", body, h)
        self.assertEqual(s, 201, d)
        item = d["imported"][0]
        self.assertGreaterEqual(int(item["qid"][1:]), 101)
        self.assertEqual((item["so_cau_tra_loi"], item["so_bo_trong"]), (6, 1))
        codes = [w["code"] for w in d["warnings"]]
        self.assertIn("ignored_columns", codes)
        self.assertIn("redacted", codes)
        s, a, _ = req("GET", "/api/answers?qid=" + item["qid"])
        dump = json.dumps(a, ensure_ascii=False)
        for leak in ("Nguyễn A", "a@x.com", "L1234", "0912345678"):
            self.assertNotIn(leak, dump)
        self.assertIn("[mã học viên ẩn]", dump)
        qs = {q["qid"]: q for q in req("GET", "/api/questions")[1]["questions"]}
        self.assertEqual(qs[item["qid"]]["source"], "import")
        s, r, _ = analyze(d["next"]["analyze_text"])
        self.assertEqual((s, r["status"], r["meta"]["check_report"]), (200, "report", "pass"))
        self.assertEqual(r["question"]["source"], "import")

    def test_csv_question_column_semicolon_two_questions(self):
        csv_text = "Câu hỏi;Trả lời\nQ A?;a1\nQ A?;a2\nQ B?;b1\n"
        s, d, _ = req("POST", "/api/import?filename=x.csv", csv_text, {"Content-Type": "text/csv"})
        self.assertEqual(s, 201, d)
        self.assertEqual([i["so_cau_tra_loi"] for i in d["imported"]], [2, 1])
        self.assertEqual(sum(w["code"] == "too_few_answers" for w in d["warnings"]), 2)
        s, r, _ = analyze("[%s] phân tích" % d["imported"][0]["qid"])
        self.assertIn("too_few_answers", [g["code"] for g in r["guardrails"]])

    def test_json_formats(self):
        s, d, _ = req("POST", "/api/import", {"cau_hoi": "Recall@k là gì?", "kc_code": "rag_recall",
                                              "cau_tra_loi": ["tỉ lệ tài liệu đúng trong top k", {"text": "precision", "nhan_tay": "sai"}]})
        self.assertEqual(s, 201, d)
        self.assertEqual(d["imported"][0]["kc_code"], "rag_recall")
        s, d, _ = req("POST", "/api/import", {"filename": "a.json", "cau_hoi": "Câu X?", "content": json.dumps(["a", "b", "c"])})
        self.assertEqual((s, d["imported"][0]["cau_hoi"]), (201, "Câu X?"))

    def test_invalid_files(self):
        bad = [("a.csv", "ten,diem\nA,5\n", "thiếu cột"), ("a.csv", "cau_tra_loi\nabc\n", "thiếu câu hỏi"),
               ("a.xlsx", "PK...", "Chỉ nhận"), ("a.json", "{bad", "JSON không hợp lệ")]
        for fn, content, hint in bad:
            with self.subTest(fn=fn, hint=hint):
                body, h = multipart(fn, content)
                s, d, _ = req("POST", "/api/import", body, h)
                self.assertEqual((s, d["error"]["code"]), (400, "invalid_file"))
                self.assertIn(hint, d["error"]["hint"])
        self.assertEqual(req("POST", "/api/import", b"x", {"Content-Type": "image/png"})[0], 415)

    def test_persists_across_restart(self):
        s, d, _ = req("POST", "/api/import", {"cau_hoi": "Lưu bền?", "cau_tra_loi": ["a", "b", "c", "d", "e"]})
        qid = d["imported"][0]["qid"]
        tools._cache.clear()                          # giả lập khởi động lại: bộ nhớ đệm rỗng, đọc lại từ file gốc
        self.assertNotIn(qid, tools.available_questions())
        web_store.init()
        self.assertIn(qid, tools.available_questions())
        self.assertIn("Q01", tools.available_questions())


class Drafts(unittest.TestCase):
    def test_crud(self):
        s, d, _ = req("POST", "/api/drafts", {"qid": "q1", "text": "Nháp — Q01 …", "title": "Bản sửa 1",
                                              "groups": [{"name": "Hiểu đúng", "ids": ["A1"]}]})
        self.assertEqual(s, 201, d)
        did = d["draft"]["id"]
        self.assertEqual(d["draft"]["qid"], "Q01")
        s, lst, _ = req("GET", "/api/drafts?qid=Q01")
        self.assertIn(did, [x["id"] for x in lst["drafts"]])
        self.assertNotIn("text", lst["drafts"][0])
        s, one, _ = req("GET", "/api/drafts/%d" % did)
        self.assertEqual((one["draft"]["text"], one["draft"]["groups"][0]["ids"]), ("Nháp — Q01 …", ["A1"]))
        self.assertEqual(req("DELETE", "/api/drafts/%d" % did)[0], 200)
        self.assertEqual(req("GET", "/api/drafts/%d" % did)[0], 404)

    def test_validation(self):
        self.assertEqual(req("POST", "/api/drafts", {"qid": "Q99", "text": "x"})[0], 400)
        self.assertEqual(req("POST", "/api/drafts", {"qid": "Q01", "text": "  "})[0], 400)
        self.assertEqual(req("POST", "/api/drafts", {"qid": "Q01", "text": "x" * 50001})[0], 413)
        self.assertEqual(req("GET", "/api/drafts?limit=abc")[0], 400)


class Cors(unittest.TestCase):
    def test_preflight_and_simple(self):
        s, _, r = req("OPTIONS", "/api/analyze", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
        self.assertEqual(s, 204)
        self.assertEqual(r.getheader("Access-Control-Allow-Origin"), "http://localhost:5173")
        self.assertIn("POST", r.getheader("Access-Control-Allow-Methods"))
        s, _, r = req("OPTIONS", "/api/analyze", headers={"Origin": "http://evil.example"})
        self.assertEqual(s, 403)
        self.assertIsNone(r.getheader("Access-Control-Allow-Origin"))
        _, _, r = req("GET", "/api/health", headers={"Origin": "http://localhost:5173"})
        self.assertEqual(r.getheader("Access-Control-Allow-Origin"), "http://localhost:5173")
        _, _, r = req("GET", "/api/health", headers={"Origin": "http://evil.example"})
        self.assertIsNone(r.getheader("Access-Control-Allow-Origin"))


class Auth(unittest.TestCase):
    def setUp(self):
        self.old = web.APP_PASSWORD
        web.APP_PASSWORD = "mat-khau-thu"

    def tearDown(self):
        web.APP_PASSWORD = self.old

    @staticmethod
    def basic(u, p):
        import base64
        return {"Authorization": "Basic " + base64.b64encode(("%s:%s" % (u, p)).encode()).decode()}

    def test_required_when_password_set(self):
        s, d, r = req("GET", "/api/questions")
        self.assertEqual((s, d["error"]["code"]), (401, "unauthorized"))
        self.assertIn("Basic", r.getheader("WWW-Authenticate"))
        self.assertEqual(req("GET", "/")[0], 401)
        self.assertEqual(req("POST", "/api/analyze", {"text": "[Q01] x"})[0], 401)
        self.assertEqual(req("GET", "/api/questions", headers=self.basic("ta", "sai"))[0], 401)
        self.assertEqual(req("GET", "/api/questions", headers=self.basic("khac", "mat-khau-thu"))[0], 401)
        self.assertEqual(req("GET", "/api/questions", headers={"Authorization": "Basic !!!"})[0], 401)
        self.assertEqual(req("GET", "/api/questions", headers=self.basic("ta", "mat-khau-thu"))[0], 200)

    def test_health_exempt(self):
        self.assertEqual(req("GET", "/api/health")[0], 200)

    def test_public_bind_guard(self):
        self.assertIsNone(web.public_bind_problem("127.0.0.1", "", False))
        self.assertIsNone(web.public_bind_problem("0.0.0.0", "pw", False))
        self.assertIsNone(web.public_bind_problem("0.0.0.0", "", True))
        self.assertIn("APP_PASSWORD", web.public_bind_problem("0.0.0.0", "", False))


class Static(unittest.TestCase):
    def test_legacy_without_dist(self):
        s, body, r = req("GET", "/")
        self.assertEqual(s, 200)
        self.assertIn(b"<html", body)
        self.assertIn("'unsafe-inline'", r.getheader("Content-Security-Policy").split("script-src")[1].split(";")[0])

    def test_spa_dist(self):
        dist = os.path.join(TMP, "dist")
        os.makedirs(os.path.join(dist, "assets"), exist_ok=True)
        with open(os.path.join(dist, "index.html"), "w") as f:
            f.write("<!doctype html><div id=root></div><script type=module src=/assets/app.js></script>")
        with open(os.path.join(dist, "assets", "app.js"), "w") as f:
            f.write("console.log(1)")
        old, web.FRONTEND_DIST = web.FRONTEND_DIST, dist
        try:
            s, body, r = req("GET", "/")
            self.assertEqual(s, 200)
            self.assertIn(b"id=root", body)
            csp = r.getheader("Content-Security-Policy")
            self.assertIn("script-src 'self';", csp)
            self.assertNotIn("unsafe-inline", csp.split("script-src")[1].split(";")[0])
            s, body, r = req("GET", "/dashboard/q01")              # SPA routing
            self.assertEqual((s, b"id=root" in body), (200, True))
            s, body, r = req("GET", "/assets/app.js")
            self.assertEqual(s, 200)
            self.assertIn("javascript", r.getheader("Content-Type"))
            self.assertIn("immutable", r.getheader("Cache-Control"))
            self.assertEqual(req("GET", "/assets/khong-co.js")[0], 404)
            self.assertEqual(req("GET", "/../codebase/web.py")[0], 404)
            self.assertEqual(req("GET", "/%2e%2e/codebase/web.py")[0], 404)
            self.assertEqual(req("GET", "/legacy")[0], 200)
            self.assertEqual(req("GET", "/api/health")[1]["frontend"], "dist")
        finally:
            web.FRONTEND_DIST = old


if __name__ == "__main__":
    unittest.main(verbosity=2)
