using Microsoft.Extensions.Options;
using VNeIDSignGateway.Configurations;

namespace VNeIDSignGateway.Services;

public class UniversalLinkBuilder : IUniversalLinkBuilder
{
    private readonly VNeIDGatewayOptions _options;

    public UniversalLinkBuilder(IOptions<VNeIDGatewayOptions> options)
    {
        _options = options.Value;
    }

    public string BuildShareConsentUrl(string txnId)
    {
        var baseUrl = _options.UniversalLinkShareBaseUrl.TrimEnd('/');
        return $"{baseUrl}/{txnId}";
    }

    public string BuildReactivateUrl(string txnId)
    {
        var baseUrl = _options.UniversalLinkActiveBaseUrl;
        return $"{baseUrl}{txnId}";
    }

    public string? BuildPartnerCallbackUrl(string txnId)
    {
        if (string.IsNullOrWhiteSpace(_options.AppCallbackUrl))
            return null;

        var baseUrl = _options.AppCallbackUrl.TrimEnd('/');
        return $"{baseUrl}/{txnId}";
    }
}
