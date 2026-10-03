using VNeIDSignGateway.Models.Certificate;
using VNeIDSignGateway.Models.Common;
using VNeIDSignGateway.Models.Provider;
using VNeIDSignGateway.Models.Signing;

namespace VNeIDSignGateway.Services;

public interface IVNeIDGatewayClient
{
    /// <summary>
    /// API 03: GET /api/v1/providers
    /// Get list of CA providers and their service packs
    /// </summary>
    Task<ApiResponse<List<ProviderItem>>> GetProvidersAsync(string? requestId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// API 04: POST /api/v1/certificates/register
    /// Submit user identity info to register a new digital certificate via VNeID
    /// </summary>
    Task<ApiResponse<RegisterCertificateResponseData>> RegisterCertificateAsync(
        RegisterCertificateRequest request, 
        string? requestId = null, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// API 05: POST /api/v1/certificates/get-status
    /// Query certificate registration status and retrieve issued certificate details
    /// </summary>
    Task<ApiResponse<CertificateStatusResponseData>> GetCertificateStatusAsync(
        string transactionCode, 
        string? requestId = null, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// API 06: POST /api/v1/certificates/list
    /// Retrieve list of valid, active digital certificates for a citizen by CCCD (citizenPid)
    /// </summary>
    Task<ApiResponse<CertificateListResponseData>> GetCredentialsAsync(
        string citizenPid, 
        string? requestId = null, 
        CancellationToken cancellationToken = default);

    Task<(int StatusCode, string Body)> GetCredentialsRawAsync(
        string citizenPid,
        string? requestId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// API 07: POST /api/v1/signings/hash
    /// Submit document digest hashes to initiate a remote signing transaction on VNeID
    /// </summary>
    Task<ApiResponse<SignHashResponseData>> CreateSignHashAsync(
        SignHashRequest request, 
        string? requestId = null, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// API 08: POST /api/v1/signings/polling
    /// Poll transaction result and retrieve digital signatures once citizen confirmed on VNeID
    /// </summary>
    Task<ApiResponse<SignHashPollingResponseData>> PollSignHashStatusAsync(
        string handle, 
        string? requestId = null, 
        CancellationToken cancellationToken = default);
}
