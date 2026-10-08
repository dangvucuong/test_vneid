using System.Data;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using VNeIDSignGateway.Configurations;

namespace VNeIDSignGateway.Services;

public interface IVneIdSqlLog
{
    void WriteExchange(string url, string requestId, int? httpStatus, string? requestBody, string? responseBody, string? error);
}

public class VneIdSqlLog : IVneIdSqlLog
{
    private readonly string _connectionString;
    private readonly ILogger<VneIdSqlLog> _logger;

    public VneIdSqlLog(IOptions<VNeIDGatewayOptions> options, ILogger<VneIdSqlLog> logger)
    {
        _connectionString = options.Value.SignFlatformConnectionString ?? string.Empty;
        _logger = logger;
    }

    public void WriteExchange(string url, string requestId, int? httpStatus, string? requestBody, string? responseBody, string? error)
    {
        var loai = LoaiCua(url);
        if (loai == null || string.IsNullOrWhiteSpace(_connectionString))
        {
            return;
        }

        try
        {
            using var connection = new SqlConnection(_connectionString);
            using var command = connection.CreateCommand();
            command.CommandText = @"
INSERT INTO dbo.VneIdNhatKy
    (Loai, RequestId, Handle, TransactionCode, TxnId, CitizenPid, OriginatorCode, TrangThai, MoTa, HttpStatus, NoiDungGui, NoiDungNhan)
VALUES
    (@Loai, @RequestId, @Handle, @TransactionCode, @TxnId, @CitizenPid, @OriginatorCode, @TrangThai, @MoTa, @HttpStatus, @NoiDungGui, @NoiDungNhan)";
            command.Parameters.Add("@Loai", SqlDbType.NVarChar, 30).Value = loai;
            command.Parameters.Add("@RequestId", SqlDbType.NVarChar, 64).Value = Db(requestId);
            command.Parameters.Add("@Handle", SqlDbType.NVarChar, 64).Value = Db(First(requestBody, responseBody, "handle"));
            command.Parameters.Add("@TransactionCode", SqlDbType.NVarChar, 64).Value = Db(First(requestBody, responseBody, "transactionCode"));
            command.Parameters.Add("@TxnId", SqlDbType.NVarChar, 64).Value = Db(First(requestBody, responseBody, "txnId"));
            command.Parameters.Add("@CitizenPid", SqlDbType.NVarChar, 20).Value = Db(ReadCitizen(requestBody));
            command.Parameters.Add("@OriginatorCode", SqlDbType.NVarChar, 64).Value = Db(Read(requestBody, "originatorCode"));
            command.Parameters.Add("@TrangThai", SqlDbType.NVarChar, 50).Value = Db(ReadStatus(responseBody));
            command.Parameters.Add("@MoTa", SqlDbType.NVarChar, 1000).Value = Db(Cut(error ?? ReadDescription(responseBody), 1000));
            command.Parameters.Add("@HttpStatus", SqlDbType.Int).Value = httpStatus.HasValue ? httpStatus.Value : DBNull.Value;
            command.Parameters.Add("@NoiDungGui", SqlDbType.NVarChar, -1).Value = Db(requestBody);
            command.Parameters.Add("@NoiDungNhan", SqlDbType.NVarChar, -1).Value = Db(responseBody);
            connection.Open();
            command.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Không ghi được VneIdNhatKy cho {Url}", url);
        }
    }

    private static string? LoaiCua(string url)
    {
        if (url.Contains("/certificates/register", StringComparison.OrdinalIgnoreCase)) return "DangKyCTS";
        if (url.Contains("/certificates/get-status", StringComparison.OrdinalIgnoreCase)) return "TrangThaiCTS";
        if (url.Contains("/signings/hash", StringComparison.OrdinalIgnoreCase)) return "GuiKy";
        if (url.Contains("/signings/polling", StringComparison.OrdinalIgnoreCase)) return "KetQuaKy";
        return null;
    }

    private static string? ReadCitizen(string? json)
    {
        return Read(json, "citizenPid") ?? ReadNested(json, "userInfo", "citizenPid");
    }

    private static string? ReadStatus(string? json)
    {
        return ReadNested(json, "data", "statusCode")
            ?? ReadNested(json, "data", "status")
            ?? Read(json, "status");
    }

    private static string? ReadDescription(string? json)
    {
        return ReadNested(json, "data", "description")
            ?? ReadNested(json, "data", "resultCode")
            ?? Read(json, "description");
    }

    private static string? First(string? requestBody, string? responseBody, string name)
    {
        return Read(requestBody, name)
            ?? ReadNested(requestBody, "data", name)
            ?? ReadNested(responseBody, "data", name)
            ?? Read(responseBody, name);
    }

    private static string? Read(string? json, string name)
    {
        var root = Parse(json);
        return root == null ? null : Text(Child(root.Value, name));
    }

    private static string? ReadNested(string? json, string parent, string name)
    {
        var root = Parse(json);
        if (root == null)
        {
            return null;
        }
        var node = Child(root.Value, parent);
        return node == null ? null : Text(Child(node.Value, name));
    }

    private static JsonElement? Parse(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }
        try
        {
            using var document = JsonDocument.Parse(json);
            return document.RootElement.Clone();
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static JsonElement? Child(JsonElement element, string name)
    {
        if (element.ValueKind != JsonValueKind.Object)
        {
            return null;
        }
        foreach (var property in element.EnumerateObject())
        {
            if (string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase))
            {
                return property.Value;
            }
        }
        return null;
    }

    private static string? Text(JsonElement? element)
    {
        if (element == null)
        {
            return null;
        }
        var value = element.Value;
        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number => value.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => null
        };
    }

    private static string? Cut(string? value, int max)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= max)
        {
            return value;
        }
        return value.Substring(0, max);
    }

    private static object Db(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value;
    }
}
