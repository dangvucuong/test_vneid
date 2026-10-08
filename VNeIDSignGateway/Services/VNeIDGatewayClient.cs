using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using VNeIDSignGateway.Configurations;
using VNeIDSignGateway.Models.Certificate;
using VNeIDSignGateway.Models.Common;
using VNeIDSignGateway.Models.Provider;
using VNeIDSignGateway.Models.Signing;

namespace VNeIDSignGateway.Services;

public class VNeIDGatewayClient : IVNeIDGatewayClient
{
    private readonly HttpClient _httpClient;
    private readonly IVNeIDAuthService _authService;
    private readonly VNeIDGatewayOptions _options;
    private readonly ISignFlowLogger _signFlowLogger;
    private readonly IVneIdSqlLog _sqlLog;
    private readonly ILogger<VNeIDGatewayClient> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public VNeIDGatewayClient(
        HttpClient httpClient,
        IVNeIDAuthService authService,
        IOptions<VNeIDGatewayOptions> options,
        ISignFlowLogger signFlowLogger,
        IVneIdSqlLog sqlLog,
        ILogger<VNeIDGatewayClient> logger)
    {
        _httpClient = httpClient;
        _authService = authService;
        _options = options.Value;
        _signFlowLogger = signFlowLogger;
        _sqlLog = sqlLog;
        _logger = logger;

        if (!string.IsNullOrWhiteSpace(_options.BaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/'));
        }
    }

    public async Task<ApiResponse<List<ProviderItem>>> GetProvidersAsync(
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        return await SendRequestAsync<object, List<ProviderItem>>(
            HttpMethod.Get, 
            "/api/v1/providers", 
            null, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<RegisterCertificateResponseData>> RegisterCertificateAsync(
        RegisterCertificateRequest request, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.OriginatorCode))
        {
            request.OriginatorCode = _options.OriginatorCode;
        }

        return await SendRequestAsync<RegisterCertificateRequest, RegisterCertificateResponseData>(
            HttpMethod.Post, 
            "/api/v1/certificates/register", 
            request, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<CertificateStatusResponseData>> GetCertificateStatusAsync(
        string transactionCode, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        var request = new CertificateStatusRequest { TransactionCode = transactionCode };
        return await SendRequestAsync<CertificateStatusRequest, CertificateStatusResponseData>(
            HttpMethod.Post, 
            "/api/v1/certificates/get-status", 
            request, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<CertificateListResponseData>> GetCredentialsAsync(
        string citizenPid, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        var request = new CertificateListRequest { CitizenPid = citizenPid };
        return await SendRequestAsync<CertificateListRequest, CertificateListResponseData>(
            HttpMethod.Post, 
            "/api/v1/certificates/list", 
            request, 
            requestId, 
            cancellationToken);
    }

    public async Task<(int StatusCode, string Body)> GetCredentialsRawAsync(
        string citizenPid,
        string? requestId = null,
        CancellationToken cancellationToken = default)
    {
        var request = new CertificateListRequest { CitizenPid = citizenPid };
        var first = await SendRawAsync(
            HttpMethod.Post,
            "/api/v1/certificates/list",
            request,
            requestId,
            cancellationToken);
        if (!LaLoiDanhSachChungThu(first.StatusCode, first.Body))
        {
            return first;
        }

        _logger.LogWarning(
            "Lấy danh sách chứng thư lỗi HTTP {StatusCode}. Refresh token rồi gọi lại.",
            first.StatusCode);
        await _authService.ForceRefreshAccessTokenAsync(cancellationToken);
        return await SendRawAsync(
            HttpMethod.Post,
            "/api/v1/certificates/list",
            request,
            requestId,
            cancellationToken);
    }

    private static bool LaLoiDanhSachChungThu(int statusCode, string body)
    {
        if (statusCode < 200 || statusCode >= 300)
        {
            return true;
        }

        try
        {
            using var document = JsonDocument.Parse(body);
            if (!document.RootElement.TryGetProperty("status", out var status))
            {
                return true;
            }

            var text = status.ValueKind == JsonValueKind.String ? status.GetString() : status.GetRawText();
            return text != "01" && text != "1";
        }
        catch (JsonException)
        {
            return true;
        }
    }

    public async Task<ApiResponse<SignHashResponseData>> CreateSignHashAsync(
        SignHashRequest request, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.OriginatorCode))
        {
            request.OriginatorCode = _options.OriginatorCode;
        }

        return await SendRequestAsync<SignHashRequest, SignHashResponseData>(
            HttpMethod.Post, 
            "/api/v1/signings/hash", 
            request, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<SignHashPollingResponseData>> PollSignHashStatusAsync(
        string handle, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        var request = new SignHashPollingRequest { Handle = handle };
        return await SendRequestAsync<SignHashPollingRequest, SignHashPollingResponseData>(
            HttpMethod.Post, 
            "/api/v1/signings/polling", 
            request, 
            requestId, 
            cancellationToken);
    }

    #region Helper Methods

    private async Task<ApiResponse<TResponse>> SendRequestAsync<TRequest, TResponse>(
        HttpMethod method,
        string url,
        TRequest? body,
        string? requestId,
        CancellationToken cancellationToken,
        bool isRetry = false)
    {
        var token = await _authService.GetValidAccessTokenAsync(cancellationToken);
        var actualRequestId = string.IsNullOrWhiteSpace(requestId) ? Guid.NewGuid().ToString() : requestId;

        using var httpRequest = new HttpRequestMessage(method, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        httpRequest.Headers.Add("X-Request-Id", actualRequestId);

        string? requestBodyJson = null;
        if (body != null)
        {
            requestBodyJson = JsonSerializer.Serialize(body, JsonOptions);
            httpRequest.Content = new StringContent(requestBodyJson, Encoding.UTF8, "application/json");
        }

        // Apply partner HMAC signature headers if configured
        ApplyPartnerHmacHeaders(httpRequest, requestBodyJson);

        _logger.LogInformation("Sending {Method} {Url} [RequestId: {RequestId}]", method, url, actualRequestId);

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            WriteSignLog(method, url, actualRequestId, null, null, requestBodyJson, null, $"RSVAN không phản hồi kịp khi gọi {url}.");
            _sqlLog.WriteExchange(url, actualRequestId, null, requestBodyJson, null, $"RSVAN không phản hồi kịp khi gọi {url}.");
            throw new TimeoutException($"RSVAN không phản hồi kịp khi gọi {url}.");
        }
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
        var echoedRequestId = response.Headers.TryGetValues("X-Request-Id", out var echoedIds)
            ? echoedIds.FirstOrDefault()
            : null;
        var trackedRequestId = string.IsNullOrWhiteSpace(echoedRequestId) ? actualRequestId : echoedRequestId;
        WriteSignLog(method, url, actualRequestId, trackedRequestId, (int)response.StatusCode, requestBodyJson, responseContent);
        _sqlLog.WriteExchange(url, trackedRequestId, (int)response.StatusCode, requestBodyJson, responseContent, null);

        // Handle 401 Unauthorized by retrying once after invalidating cached token
        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized && !isRetry)
        {
            _logger.LogWarning("Received 401 Unauthorized from Gateway. Invalidating token and retrying request...");
            _authService.InvalidateToken();
            return await SendRequestAsync<TRequest, TResponse>(method, url, body, actualRequestId, cancellationToken, isRetry: true);
        }

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Gateway returned HTTP {StatusCode}: {Content}", response.StatusCode, responseContent);
        }

        try
        {
            var apiResult = JsonSerializer.Deserialize<ApiResponse<TResponse>>(responseContent, JsonOptions);
            if (apiResult != null)
            {
                apiResult.RequestId = trackedRequestId;
                return apiResult;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize Gateway response: {Content}", responseContent);
        }

        return new ApiResponse<TResponse>
        {
            Status = ((int)response.StatusCode).ToString(),
            Description = $"HTTP {response.StatusCode}: {responseContent}",
            RequestId = trackedRequestId
        };
    }

    private async Task<(int StatusCode, string Body)> SendRawAsync<TRequest>(
        HttpMethod method,
        string url,
        TRequest? body,
        string? requestId,
        CancellationToken cancellationToken)
    {
        var token = await _authService.GetValidAccessTokenAsync(cancellationToken);
        var actualRequestId = string.IsNullOrWhiteSpace(requestId) ? Guid.NewGuid().ToString() : requestId;

        using var httpRequest = new HttpRequestMessage(method, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        httpRequest.Headers.Add("X-Request-Id", actualRequestId);

        string? requestBodyJson = null;
        if (body != null)
        {
            requestBodyJson = JsonSerializer.Serialize(body, JsonOptions);
            httpRequest.Content = new StringContent(requestBodyJson, Encoding.UTF8, "application/json");
        }

        ApplyPartnerHmacHeaders(httpRequest, requestBodyJson);
        _logger.LogInformation("Sending {Method} {Url} [RequestId: {RequestId}]", method, url, actualRequestId);

        try
        {
            var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            return ((int)response.StatusCode, responseContent);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new TimeoutException($"RSVAN không phản hồi kịp khi gọi {url}.");
        }
    }

    private void WriteSignLog(
        HttpMethod method,
        string url,
        string requestId,
        string? responseRequestId,
        int? httpStatus,
        string? requestBody,
        string? responseBody,
        string? error = null)
    {
        if (!url.Contains("/signings/", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        _signFlowLogger.WriteExchange(
            method.Method,
            url,
            requestId,
            responseRequestId,
            httpStatus,
            requestBody,
            responseBody,
            error);
    }

    private void ApplyPartnerHmacHeaders(HttpRequestMessage httpRequest, string? bodyJson)
    {
        if (string.IsNullOrWhiteSpace(_options.PartnerCode) || string.IsNullOrWhiteSpace(_options.PartnerSecretKey))
        {
            return;
        }

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var nonce = Guid.NewGuid().ToString("N");

        httpRequest.Headers.Add("X-Partner-Code", _options.PartnerCode);
        httpRequest.Headers.Add("X-Timestamp", timestamp);
        httpRequest.Headers.Add("X-Nonce", nonce);

        // Sign body with HMAC-SHA256
        var payloadToSign = $"{_options.PartnerCode}:{timestamp}:{nonce}:{bodyJson ?? string.Empty}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.PartnerSecretKey));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadToSign));
        var signature = Convert.ToHexString(hashBytes).ToLowerInvariant();

        httpRequest.Headers.Add("X-Signature", signature);
    }

    #endregion
}
