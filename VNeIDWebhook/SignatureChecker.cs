using System;
using System.Security.Cryptography;
using System.Text;

namespace VNeIDWebhook
{
    internal static class SignatureChecker
    {
        public static bool IsValid(byte[] rawBody, string signatureHeader, string secret)
        {
            if (rawBody == null || string.IsNullOrWhiteSpace(signatureHeader) || string.IsNullOrWhiteSpace(secret))
            {
                return false;
            }

            var separator = signatureHeader.IndexOf('=');
            var actualHash = separator >= 0
                ? signatureHeader.Substring(separator + 1).Trim()
                : signatureHeader.Trim();

            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret)))
            {
                var computed = hmac.ComputeHash(rawBody);
                var computedHex = BitConverter.ToString(computed).Replace("-", "").ToLowerInvariant();
                var computedBase64 = Convert.ToBase64String(computed);
                return string.Equals(actualHash, computedHex, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(actualHash, computedBase64, StringComparison.Ordinal);
            }
        }
    }
}
