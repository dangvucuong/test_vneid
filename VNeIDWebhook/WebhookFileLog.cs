using System;
using System.Configuration;
using System.IO;
using System.Text;

namespace VNeIDWebhook
{
    internal static class WebhookFileLog
    {
        private static readonly object Gate = new object();

        public static string Write(string method, string path, string requestId, string signature, bool signatureValid, int httpStatus, string body)
        {
            var now = DateTimeOffset.Now;
            var configured = ConfigurationManager.AppSettings["LogDirectory"];
            var directory = string.IsNullOrWhiteSpace(configured)
                ? Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "logs"))
                : Path.GetFullPath(configured);
            var filePath = Path.Combine(directory, "vneid-webhook-" + now.ToString("yyyyMMdd") + ".log");
            var block = new StringBuilder();
            block.AppendLine("===== " + now.ToString("yyyy-MM-dd HH:mm:ss.fff zzz") + " " + method + " " + path + " =====");
            block.AppendLine("X-Request-Id: " + (requestId ?? ""));
            block.AppendLine("X-Webhook-Signature: " + (signature ?? ""));
            block.AppendLine("Chữ ký hợp lệ: " + (signatureValid ? "có" : "không"));
            block.AppendLine("HTTP trả về: " + httpStatus);
            block.AppendLine("--- body ---");
            block.AppendLine(string.IsNullOrEmpty(body) ? "(trống)" : body);
            block.AppendLine();

            lock (Gate)
            {
                Directory.CreateDirectory(directory);
                File.AppendAllText(filePath, block.ToString(), Encoding.UTF8);
            }

            return filePath;
        }
    }
}
