using System.Text;
using System.Text.Json;

namespace VNeIDSignGateway.Services;

public interface ISignFlowLogger
{
    void WriteExchange(
        string method,
        string url,
        string requestId,
        string? responseRequestId,
        int? httpStatus,
        string? requestBody,
        string? responseBody,
        string? error = null);
}

public class SignFlowLogger : ISignFlowLogger
{
    private readonly string _directory;
    private readonly ILogger<SignFlowLogger> _logger;
    private readonly object _gate = new();

    private static readonly JsonSerializerOptions Pretty = new()
    {
        WriteIndented = true
    };

    public SignFlowLogger(IWebHostEnvironment environment, ILogger<SignFlowLogger> logger)
    {
        _directory = Path.Combine(environment.ContentRootPath, "logs");
        _logger = logger;
    }

    public void WriteExchange(
        string method,
        string url,
        string requestId,
        string? responseRequestId,
        int? httpStatus,
        string? requestBody,
        string? responseBody,
        string? error = null)
    {
        var now = DateTimeOffset.Now;
        var path = Path.Combine(_directory, $"vneid-sign-{now:yyyyMMdd}.log");
        var block = new StringBuilder();
        block.AppendLine($"===== {now:yyyy-MM-dd HH:mm:ss.fff zzz} {method} {url} =====");
        block.AppendLine($"X-Request-Id gửi: {requestId}");
        block.AppendLine($"X-Request-Id nhận: {responseRequestId ?? ""}");
        block.AppendLine($"HTTP: {httpStatus?.ToString() ?? ""}");
        if (!string.IsNullOrWhiteSpace(error))
        {
            block.AppendLine($"Lỗi: {error}");
        }
        block.AppendLine("--- request ---");
        block.AppendLine(FormatBody(requestBody));
        block.AppendLine("--- response ---");
        block.AppendLine(FormatBody(responseBody));
        block.AppendLine();

        lock (_gate)
        {
            Directory.CreateDirectory(_directory);
            File.AppendAllText(path, block.ToString(), Encoding.UTF8);
        }

        _logger.LogInformation(
            "Đã ghi log ký {Method} {Url} requestId={RequestId} http={HttpStatus} file={Path}",
            method, url, requestId, httpStatus, path);
    }

    private static string FormatBody(string? body)
    {
        if (string.IsNullOrWhiteSpace(body))
        {
            return "(trống)";
        }

        try
        {
            using var document = JsonDocument.Parse(body);
            return JsonSerializer.Serialize(document.RootElement, Pretty);
        }
        catch (JsonException)
        {
            return body;
        }
    }
}
