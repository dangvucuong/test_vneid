namespace VNeIDSignGateway.Services;

public interface IWebhookValidator
{
    /// <summary>
    /// Validates the X-Webhook-Signature header using HMAC-SHA256 against raw body
    /// </summary>
    /// <param name="rawBody">Exact raw request payload</param>
    /// <param name="signatureHeader">Value of header X-Webhook-Signature (e.g. "sha256=abcdef...")</param>
    /// <returns>True if signature matches, false otherwise</returns>
    bool ValidateSignature(string rawBody, string? signatureHeader);

    bool ValidateSignature(byte[] rawBodyBytes, string? signatureHeader);
}
