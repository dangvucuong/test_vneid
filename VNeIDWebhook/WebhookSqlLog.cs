using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Script.Serialization;

namespace VNeIDWebhook
{
    internal static class WebhookSqlLog
    {
        public static void Write(string requestId, int httpStatus, bool signatureValid, string body, string responseBody)
        {
            var connectionString = System.Configuration.ConfigurationManager.AppSettings["SignFlatformConnectionString"];
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                Console.WriteLine("Chưa cấu hình SignFlatformConnectionString, bỏ qua ghi SQL.");
                return;
            }

            try
            {
                using (var connection = new SqlConnection(connectionString))
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
INSERT INTO dbo.VneIdNhatKy
    (Loai, RequestId, Handle, TransactionCode, TxnId, TrangThai, MoTa, HttpStatus, ChuKyHopLe, NoiDungNhan, NoiDungGui)
VALUES
    (@Loai, @RequestId, @Handle, @TransactionCode, @TxnId, @TrangThai, @MoTa, @HttpStatus, @ChuKyHopLe, @NoiDungNhan, @NoiDungGui)";
                    command.Parameters.Add("@Loai", SqlDbType.NVarChar, 30).Value = "Webhook";
                    command.Parameters.Add("@RequestId", SqlDbType.NVarChar, 64).Value = Db(requestId);
                    command.Parameters.Add("@Handle", SqlDbType.NVarChar, 64).Value = Db(ReadData(body, "handle"));
                    command.Parameters.Add("@TransactionCode", SqlDbType.NVarChar, 64).Value = Db(ReadData(body, "transactionCode"));
                    command.Parameters.Add("@TxnId", SqlDbType.NVarChar, 64).Value = Db(ReadData(body, "txnId"));
                    command.Parameters.Add("@TrangThai", SqlDbType.NVarChar, 50).Value = Db(ReadData(body, "status"));
                    command.Parameters.Add("@MoTa", SqlDbType.NVarChar, 1000).Value = Db(Cut(ReadData(body, "description"), 1000));
                    command.Parameters.Add("@HttpStatus", SqlDbType.Int).Value = httpStatus;
                    command.Parameters.Add("@ChuKyHopLe", SqlDbType.Bit).Value = signatureValid;
                    command.Parameters.Add("@NoiDungNhan", SqlDbType.NVarChar, -1).Value = Db(body);
                    command.Parameters.Add("@NoiDungGui", SqlDbType.NVarChar, -1).Value = Db(responseBody);
                    connection.Open();
                    command.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Không ghi được VneIdNhatKy: " + ex.Message);
            }
        }

        private static string ReadData(string json, string name)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return null;
            }
            try
            {
                var root = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(json);
                object dataValue;
                if (root == null || !root.TryGetValue("data", out dataValue))
                {
                    return null;
                }
                var data = dataValue as Dictionary<string, object>;
                if (data == null)
                {
                    return null;
                }
                foreach (var pair in data)
                {
                    if (string.Equals(pair.Key, name, StringComparison.OrdinalIgnoreCase) && pair.Value != null)
                    {
                        return Convert.ToString(pair.Value);
                    }
                }
            }
            catch (InvalidOperationException)
            {
                return null;
            }
            catch (ArgumentException)
            {
                return null;
            }
            return null;
        }

        private static string Cut(string value, int max)
        {
            if (string.IsNullOrEmpty(value) || value.Length <= max)
            {
                return value;
            }
            return value.Substring(0, max);
        }

        private static object Db(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? (object)DBNull.Value : value;
        }
    }
}
