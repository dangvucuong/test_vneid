using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using VNeIDSignGateway.Models.Certificate;
using VNeIDSignGateway.Models.Common;
using VNeIDSignGateway.Models.Provider;
using VNeIDSignGateway.Models.Signing;
using VNeIDSignGateway.Models.Webhook;
using VNeIDSignGateway.Services;

namespace VNeIDSignGateway.Controllers;

[ApiController]
[Route("api/vneid")]
[Produces("application/json")]
public class VNeIDSignController : ControllerBase
{
    private readonly IVNeIDGatewayClient _gatewayClient;
    private readonly IVNeIDAuthService _authService;
    private readonly IUniversalLinkBuilder _linkBuilder;
    private readonly IWebhookEventStore _eventStore;
    private readonly ILogger<VNeIDSignController> _logger;

    public VNeIDSignController(
        IVNeIDGatewayClient gatewayClient,
        IVNeIDAuthService authService,
        IUniversalLinkBuilder linkBuilder,
        IWebhookEventStore eventStore,
        ILogger<VNeIDSignController> logger)
    {
        _gatewayClient = gatewayClient;
        _authService = authService;
        _linkBuilder = linkBuilder;
        _eventStore = eventStore;
        _logger = logger;
    }

    #region Auth & Health

    /// <summary>
    /// Check current Gateway access token status and expiration
    /// </summary>
    [HttpGet("auth/token-status")]
    public IActionResult GetTokenStatus()
    {
        var tokenInfo = _authService.GetCurrentTokenInfo();
        if (tokenInfo == null)
        {
            return Ok(new { authenticated = false, message = "No active token in cache." });
        }

        return Ok(new
        {
            authenticated = true,
            expiresInSeconds = tokenInfo.ExpireInSeconds,
            refreshTokenExpiresInSeconds = tokenInfo.RefreshTokenExpireInSeconds
        });
    }

    /// <summary>
    /// Force acquire a new token from Gateway using configured credentials
    /// </summary>
    [HttpPost("auth/login")]
    public async Task<IActionResult> LoginAsync(CancellationToken cancellationToken)
    {
        var result = await _authService.AuthenticateAsync(cancellationToken: cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Refresh the cached access token
    /// </summary>
    [HttpPost("auth/refresh")]
    public async Task<IActionResult> RefreshAsync(CancellationToken cancellationToken)
    {
        var result = await _authService.RefreshTokenAsync(cancellationToken: cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    #endregion

    /// <summary>
    /// Recent webhook events stored in memory for the test console.
    /// </summary>
    [HttpGet("events")]
    [ProducesResponseType(typeof(WebhookEventListResponse), StatusCodes.Status200OK)]
    public IActionResult GetWebhookEvents(
        [FromQuery] DateTimeOffset? since,
        [FromQuery] int limit = 100)
    {
        var events = _eventStore.Query(since, limit);
        return Ok(new WebhookEventListResponse
        {
            ServerTime = DateTimeOffset.UtcNow,
            Events = events
        });
    }

    #region Providers & Service Packs

    /// <summary>
    /// API 03: Get list of CA providers and their service packages
    /// </summary>
    [HttpGet("providers")]
    [ProducesResponseType(typeof(ApiResponse<List<ProviderItem>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProvidersAsync(
        [FromHeader(Name = "X-Request-Id")] string? requestId,
        CancellationToken cancellationToken)
    {
        var response = await _gatewayClient.GetProvidersAsync(requestId, cancellationToken);
        return Ok(response);
    }

    #endregion

    #region Certificate Lifecycle

    /// <summary>
    /// API 04: Register a new digital certificate for citizen via VNeID
    /// </summary>
    [HttpPost("certificates/register")]
    [ProducesResponseType(typeof(ApiResponse<RegisterCertificateResponseData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RegisterCertificateAsync(
        [FromBody] RegisterCertificateRequest request,
        [FromHeader(Name = "X-Request-Id")] string? requestId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserInfo.CitizenPid))
        {
            return BadRequest(new ErrorResponse { Error = "02", ErrorDescription = "CitizenPid is required." });
        }

        var response = await _gatewayClient.RegisterCertificateAsync(request, requestId, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// API 05: Check registration status and retrieve issued certificate details
    /// </summary>
    [HttpGet("certificates/status/{transactionCode}")]
    [ProducesResponseType(typeof(ApiResponse<CertificateStatusResponseData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCertificateStatusAsync(
        string transactionCode,
        [FromHeader(Name = "X-Request-Id")] string? requestId,
        CancellationToken cancellationToken)
    {
        var response = await _gatewayClient.GetCertificateStatusAsync(transactionCode, requestId, cancellationToken);
        return Ok(response);
    }

    #endregion

    #region Signing Operations

    /// <summary>
    /// API 06: Get list of valid, active digital certificates for a citizen by CCCD (citizenPid)
    /// </summary>
    [HttpGet("certificates/list/{citizenPid}")]
    [ProducesResponseType(typeof(ApiResponse<CertificateListResponseData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCredentialsAsync(
        string citizenPid,
        [FromHeader(Name = "X-Request-Id")] string? requestId,
        CancellationToken cancellationToken)
    {
        try
        {
            var (statusCode, body) = await _gatewayClient.GetCredentialsRawAsync(citizenPid, requestId, cancellationToken);
            if (statusCode >= 200 && statusCode < 300 && body.TrimStart().StartsWith("{"))
            {
                return Content(body, "application/json");
            }

            var description = statusCode == 504
                ? "Máy chủ RSVAN hết thời gian chờ khi lấy danh sách chứng thư. Hãy thử lại."
                : $"RSVAN trả HTTP {statusCode}.";
            return StatusCode(statusCode == 0 ? 502 : statusCode, new ApiResponse<CertificateListResponseData>
            {
                Status = statusCode.ToString(),
                Description = description
            });
        }
        catch (TimeoutException ex)
        {
            return StatusCode(StatusCodes.Status504GatewayTimeout, new ApiResponse<CertificateListResponseData>
            {
                Status = "504",
                Description = ex.Message
            });
        }
    }

    /// <summary>
    /// API 07: Submit document digest hashes to initiate a remote signing transaction on VNeID
    /// </summary>
    [HttpPost("signings/hash")]
    [ProducesResponseType(typeof(ApiResponse<SignHashResponseData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateSignHashAsync(
        [FromBody] SignHashRequest request,
        [FromHeader(Name = "X-Request-Id")] string? requestId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.CredentialID))
        {
            return BadRequest(new ErrorResponse { Error = "02", ErrorDescription = "CredentialID is required." });
        }

        if (request.Documents == null || request.Documents.Count == 0)
        {
            return BadRequest(new ErrorResponse { Error = "02", ErrorDescription = "At least one document is required." });
        }

        var response = await _gatewayClient.CreateSignHashAsync(request, requestId, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// API 08: Poll signature results using transaction handle
    /// </summary>
    [HttpGet("signings/polling/{handle}")]
    [ProducesResponseType(typeof(ApiResponse<SignHashPollingResponseData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> PollSignHashAsync(
        string handle,
        [FromHeader(Name = "X-Request-Id")] string? requestId,
        CancellationToken cancellationToken)
    {
        var response = await _gatewayClient.PollSignHashStatusAsync(handle, requestId, cancellationToken);
        return Ok(response);
    }

    #endregion

    #region Utilities & Universal Links

    /// <summary>
    /// Helper: Generate App-to-App Universal Links for opening VNeID app
    /// </summary>
    [HttpGet("universal-links/{txnId}")]
    public IActionResult GetUniversalLinks(string txnId)
    {
        var consentUrl = _linkBuilder.BuildShareConsentUrl(txnId);
        var reactivateUrl = _linkBuilder.BuildReactivateUrl(txnId);
        var callbackUrl = _linkBuilder.BuildPartnerCallbackUrl(txnId);

        return Ok(new
        {
            txnId,
            shareConsentUrl = consentUrl,
            reactivateUrl = reactivateUrl,
            partnerCallbackUrl = callbackUrl
        });
    }

    /// <summary>
    /// Helper utility: Calculate SHA-256 Base64 digest of input text/file for testing sign hash
    /// </summary>
    [HttpPost("signings/calculate-digest")]
    public IActionResult CalculateDigest([FromBody] CalculateDigestRequest request)
    {
        if (string.IsNullOrEmpty(request.Content))
        {
            return BadRequest("Content is required");
        }

        byte[] bytes = request.IsBase64 
            ? Convert.FromBase64String(request.Content) 
            : Encoding.UTF8.GetBytes(request.Content);

        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(bytes);
        var digestValue = Convert.ToBase64String(hashBytes);

        return Ok(new
        {
            documentName = request.DocumentName ?? "sample.pdf",
            digestValue = digestValue
        });
    }

    #endregion
}

public class CalculateDigestRequest
{
    public string? DocumentName { get; set; } = "sample.pdf";
    public string Content { get; set; } = string.Empty;
    public bool IsBase64 { get; set; } = false;
}
