using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

namespace VNeIDWebhook
{
    internal static class Program
    {
        private static readonly UTF8Encoding Utf8 = new UTF8Encoding(false);

        private static int Main()
        {
            var prefix = ConfigurationManager.AppSettings["ListenPrefix"];
            if (string.IsNullOrWhiteSpace(prefix))
            {
                prefix = "http://localhost:5255/";
            }
            if (!prefix.EndsWith("/"))
            {
                prefix += "/";
            }

            var secret = ConfigurationManager.AppSettings["WebhookSecretKey"] ?? "";
            if (string.IsNullOrWhiteSpace(secret))
            {
                Console.Error.WriteLine("Thiếu WebhookSecretKey trong App.config.");
                return 1;
            }

            var listener = new HttpListener();
            listener.Prefixes.Add(prefix);
            listener.Start();
            Console.WriteLine("Webhook VNeID đang nghe tại " + prefix);
            Console.WriteLine("POST /api/webhook/vneid/txn-id");
            Console.WriteLine("POST /api/webhook/vneid/cert-result");
            Console.WriteLine("POST /api/webhook/vneid/sign-transcode");
            Console.WriteLine("POST /api/webhook/vneid/sign-result");
            Console.WriteLine("POST /api/webhook/vneid/unified");

            var stopped = new ManualResetEvent(false);
            Console.CancelKeyPress += (sender, args) =>
            {
                args.Cancel = true;
                stopped.Set();
            };

            while (!stopped.WaitOne(0))
            {
                HttpListenerContext context;
                try
                {
                    var asyncResult = listener.BeginGetContext(null, null);
                    var index = WaitHandle.WaitAny(new[] { asyncResult.AsyncWaitHandle, stopped });
                    if (index == 1)
                    {
                        break;
                    }
                    context = listener.EndGetContext(asyncResult);
                }
                catch (HttpListenerException)
                {
                    break;
                }
                catch (ObjectDisposedException)
                {
                    break;
                }

                ThreadPool.QueueUserWorkItem(_ => Handle(context, secret));
            }

            listener.Close();
            return 0;
        }

        private static void Handle(HttpListenerContext context, string secret)
        {
            var request = context.Request;
            var path = request.Url == null ? "/" : request.Url.AbsolutePath;
            try
            {
                if (string.Equals(request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase)
                    && (path == "/" || string.Equals(path, "/api/webhook/vneid/health", StringComparison.OrdinalIgnoreCase)))
                {
                    WriteText(context.Response, 200, "Webhook VNeID đang chạy.");
                    return;
                }

                if (!string.Equals(request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase) || !IsWebhookPath(path))
                {
                    WriteJson(context.Response, 404, "{\"error\":\"03\",\"errorDescription\":\"Không tìm thấy webhook.\"}");
                    return;
                }

                byte[] rawBody;
                using (var buffer = new MemoryStream())
                {
                    request.InputStream.CopyTo(buffer);
                    rawBody = buffer.ToArray();
                }

                var body = Utf8.GetString(rawBody);
                var requestId = request.Headers["X-Request-Id"] ?? "";
                var signature = request.Headers["X-Webhook-Signature"] ?? "";
                var valid = SignatureChecker.IsValid(rawBody, signature, secret);
                int status;
                string responseBody;
                if (rawBody.Length == 0)
                {
                    status = 400;
                    responseBody = "{\"error\":\"02\",\"errorDescription\":\"Payload rỗng.\"}";
                    valid = false;
                }
                else if (!valid)
                {
                    status = 400;
                    responseBody = "{\"error\":\"26\",\"errorDescription\":\"Chữ ký webhook không hợp lệ.\"}";
                }
                else
                {
                    status = 200;
                    responseBody = "{}";
                }

                var logPath = WebhookFileLog.Write(request.HttpMethod, path, requestId, signature, valid, status, body);
                Console.WriteLine(DateTime.Now.ToString("HH:mm:ss") + " " + request.HttpMethod + " " + path + " -> " + status + " log=" + logPath);
                WriteJson(context.Response, status, responseBody);
            }
            catch (Exception ex)
            {
                try
                {
                    WebhookFileLog.Write(request.HttpMethod, path, request.Headers["X-Request-Id"], "", false, 500, ex.ToString());
                    WriteJson(context.Response, 500, "{\"error\":\"99\",\"errorDescription\":\"Lỗi hệ thống khi nhận webhook.\"}");
                }
                catch
                {
                    context.Response.Abort();
                }
            }
        }

        private static bool IsWebhookPath(string path)
        {
            return string.Equals(path, "/api/webhook/vneid/txn-id", StringComparison.OrdinalIgnoreCase)
                || string.Equals(path, "/api/webhook/vneid/cert-result", StringComparison.OrdinalIgnoreCase)
                || string.Equals(path, "/api/webhook/vneid/sign-transcode", StringComparison.OrdinalIgnoreCase)
                || string.Equals(path, "/api/webhook/vneid/sign-result", StringComparison.OrdinalIgnoreCase)
                || string.Equals(path, "/api/webhook/vneid/unified", StringComparison.OrdinalIgnoreCase);
        }

        private static void WriteJson(HttpListenerResponse response, int status, string json)
        {
            Write(response, status, "application/json; charset=utf-8", json);
        }

        private static void WriteText(HttpListenerResponse response, int status, string text)
        {
            Write(response, status, "text/plain; charset=utf-8", text);
        }

        private static void Write(HttpListenerResponse response, int status, string contentType, string text)
        {
            var bytes = Utf8.GetBytes(text ?? "");
            response.StatusCode = status;
            response.ContentType = contentType;
            response.ContentLength64 = bytes.Length;
            response.OutputStream.Write(bytes, 0, bytes.Length);
            response.OutputStream.Close();
        }
    }
}
