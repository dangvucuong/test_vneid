using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.InteropServices;
using System.Security.Cryptography;


namespace AppGenActiveLink


{
    internal static class Native
    {
        [DllImport("bcrypt.dll")]
        public static extern uint BCryptOpenAlgorithmProvider(out IntPtr phAlgorithm, [MarshalAs(UnmanagedType.LPWStr)] string pszAlgId, [MarshalAs(UnmanagedType.LPWStr)] string pszImplementation, uint dwFlags);

        [DllImport("bcrypt.dll")]
        public static extern uint BCryptCloseAlgorithmProvider(IntPtr hAlgorithm, uint dwFlags);

        [DllImport("bcrypt.dll")]
        public static extern uint BCryptSetProperty(IntPtr hObject, [MarshalAs(UnmanagedType.LPWStr)] string pszProperty, byte[] pbInput, int cbInput, uint dwFlags);

        [DllImport("bcrypt.dll")]
        public static extern uint BCryptGetProperty(IntPtr hObject, [MarshalAs(UnmanagedType.LPWStr)] string pszProperty, byte[] pbOutput, int cbOutput, out int pcbResult, uint dwFlags);

        [DllImport("bcrypt.dll")]
        public static extern uint BCryptGenerateSymmetricKey(IntPtr hAlgorithm, out IntPtr phKey, IntPtr pbKeyObject, int cbKeyObject, byte[] pbSecret, int cbSecret, uint dwFlags);

        [DllImport("bcrypt.dll")]
        public static extern uint BCryptDestroyKey(IntPtr hKey);

        [DllImport("bcrypt.dll")]
        public static extern uint BCryptEncrypt(IntPtr hKey, byte[] pbInput, int cbInput, ref BCRYPT_AUTHENTICATED_CIPHER_MODE_INFO pPaddingInfo, IntPtr pbIV, int cbIV, byte[] pbOutput, int cbOutput, out int pcbResult, uint dwFlags);
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct BCRYPT_AUTHENTICATED_CIPHER_MODE_INFO
    {
        public int cbSize;
        public int dwInfoVersion;
        public IntPtr pbNonce;
        public int cbNonce;
        public IntPtr pbAuthData;
        public int cbAuthData;
        public IntPtr pbTag;
        public int cbTag;
        public IntPtr pbMacContext;
        public int cbMacContext;
        public int cbAAD;
        public long cbData;
        public int dwFlags;
    }

    internal class Program
    {
        static void Main(string[] args)
        {
            var code = "199877";
            string link = ActivationLink.Create(code);
            Console.WriteLine(link);
            Console.ReadKey();
        }
    }

    public static class ActivationLink
    {
        const string KeyHex = "d3a9ebbcec5ae7c2c1e9c3d22a40c392dc98787b02fd716a8331d731098dc1e6";

        public static string Create(string code)
        {
            if (string.IsNullOrEmpty(code))
                throw new ArgumentException("Mã kích hoạt phải là chữ số.");
            for (int i = 0; i < code.Length; i++)
            {
                if (code[i] < '0' || code[i] > '9')
                    throw new ArgumentException("Mã kích hoạt phải là chữ số.");
            }

            byte[] key = FromHex(KeyHex);
            byte[] nonce = new byte[12];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(nonce);

            byte[] plain = Encoding.UTF8.GetBytes(code);
            byte[] cipher = new byte[plain.Length];
            byte[] tag = new byte[16];
            Encrypt(key, nonce, plain, cipher, tag);

            byte[] packed = new byte[nonce.Length + cipher.Length + tag.Length];
            Buffer.BlockCopy(nonce, 0, packed, 0, nonce.Length);
            Buffer.BlockCopy(cipher, 0, packed, nonce.Length, cipher.Length);
            Buffer.BlockCopy(tag, 0, packed, nonce.Length + cipher.Length, tag.Length);

            string token = Convert.ToBase64String(packed).TrimEnd('=').Replace('+', '-').Replace('/', '_');
            return "https://applink.nacencomm.vn/activate?c=" + Uri.EscapeDataString(token);
        }

        static void Encrypt(byte[] key, byte[] nonce, byte[] plain, byte[] cipher, byte[] tag)
        {
            IntPtr alg;
            uint status = Native.BCryptOpenAlgorithmProvider(out alg, "AES", null, 0);
            if (status != 0) throw new CryptographicException("BCryptOpenAlgorithmProvider: " + status.ToString("X8"));

            IntPtr hKey = IntPtr.Zero;
            IntPtr keyObject = IntPtr.Zero;
            GCHandle nonceHandle = default(GCHandle);
            GCHandle tagHandle = default(GCHandle);
            try
            {
                byte[] mode = Encoding.Unicode.GetBytes("ChainingModeGCM\0");
                status = Native.BCryptSetProperty(alg, "ChainingMode", mode, mode.Length, 0);
                if (status != 0) throw new CryptographicException("BCryptSetProperty: " + status.ToString("X8"));

                byte[] lengthBuffer = new byte[4];
                int ignored;
                status = Native.BCryptGetProperty(alg, "ObjectLength", lengthBuffer, lengthBuffer.Length, out ignored, 0);
                if (status != 0) throw new CryptographicException("BCryptGetProperty: " + status.ToString("X8"));
                int objectLength = BitConverter.ToInt32(lengthBuffer, 0);
                keyObject = Marshal.AllocHGlobal(objectLength);

                status = Native.BCryptGenerateSymmetricKey(alg, out hKey, keyObject, objectLength, key, key.Length, 0);
                if (status != 0) throw new CryptographicException("BCryptGenerateSymmetricKey: " + status.ToString("X8"));

                nonceHandle = GCHandle.Alloc(nonce, GCHandleType.Pinned);
                tagHandle = GCHandle.Alloc(tag, GCHandleType.Pinned);
                BCRYPT_AUTHENTICATED_CIPHER_MODE_INFO info = new BCRYPT_AUTHENTICATED_CIPHER_MODE_INFO();
                info.cbSize = Marshal.SizeOf(typeof(BCRYPT_AUTHENTICATED_CIPHER_MODE_INFO));
                info.dwInfoVersion = 1;
                info.pbNonce = nonceHandle.AddrOfPinnedObject();
                info.cbNonce = nonce.Length;
                info.pbTag = tagHandle.AddrOfPinnedObject();
                info.cbTag = tag.Length;

                int written;
                status = Native.BCryptEncrypt(hKey, plain, plain.Length, ref info, IntPtr.Zero, 0, cipher, cipher.Length, out written, 0);
                if (status != 0) throw new CryptographicException("BCryptEncrypt: " + status.ToString("X8"));
            }
            finally
            {
                if (nonceHandle.IsAllocated) nonceHandle.Free();
                if (tagHandle.IsAllocated) tagHandle.Free();
                if (hKey != IntPtr.Zero) Native.BCryptDestroyKey(hKey);
                if (keyObject != IntPtr.Zero) Marshal.FreeHGlobal(keyObject);
                Native.BCryptCloseAlgorithmProvider(alg, 0);
            }
        }

        static byte[] FromHex(string hex)
        {
            byte[] data = new byte[hex.Length / 2];
            for (int i = 0; i < data.Length; i++)
                data[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
            return data;
        }
    }
}
