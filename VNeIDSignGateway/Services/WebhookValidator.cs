using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using VNeIDSignGateway.Configurations;

namespace VNeIDSignGateway.Services;

public class WebhookValidator : IWebhookValidator
{
    private readonly VNeIDGatewayOptions _options;
    private readonly ILogger<WebhookValidator> _logger;

    public WebhookValidator(IOptions<VNeIDGatewayOptions> options, ILogger<WebhookValidator> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public bool ValidateSignature(string rawBody, string? signatureHeader)
    {
        var bytes = Encoding.UTF8.GetBytes(rawBody);
        return ValidateSignature(bytes, signatureHeader);
    }

    public bool ValidateSignature(byte[] rawBodyBytes, string? signatureHeader)
    {
        if (string.IsNullOrWhiteSpace(signatureHeader))
        {
            _logger.LogWarning("Webhook signature header 'X-Webhook-Signature' is missing.");
            return false;
        }

        if (string.IsNullOrWhiteSpace(_options.WebhookSecretKey))
        {
            _logger.LogWarning("Webhook secret key is not configured in VNeIDGatewayOptions.");
            return false;
        }

        // Expected format: sha256=<hash> or sha256 = <hash>
        var parts = signatureHeader.Split('=', 2);
        var actualHash = parts.Length == 2 ? parts[1].Trim() : signatureHeader.Trim();

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.WebhookSecretKey));
        var computedHashBytes = hmac.ComputeHash(rawBodyBytes);
        
        var computedHex = Convert.ToHexString(computedHashBytes).ToLowerInvariant();
        var computedBase64 = Convert.ToBase64String(computedHashBytes);

        var match = string.Equals(actualHash, computedHex, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(actualHash, computedBase64, StringComparison.Ordinal);

        if (!match)
        {
            _logger.LogWarning("Webhook signature mismatch. Expected Hex: {ComputedHex}, Provided: {ActualHash}", computedHex, actualHash);
        }

        return match;
    }
}
