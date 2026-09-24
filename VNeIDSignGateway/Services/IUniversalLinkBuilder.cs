namespace VNeIDSignGateway.Services;

public interface IUniversalLinkBuilder
{
    string BuildShareConsentUrl(string txnId);
    string BuildReactivateUrl(string txnId);
    string? BuildPartnerCallbackUrl(string txnId);
}
