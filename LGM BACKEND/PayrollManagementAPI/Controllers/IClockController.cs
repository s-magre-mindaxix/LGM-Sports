using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CompanyPlatform.Core.Data; // Ensure this matches your namespace
using Microsoft.EntityFrameworkCore;
using PayrollManagementAPI.Services.Attendance;

namespace PayrollManagementAPI.Controllers
{
    [AllowAnonymous]
    [Route("iclock")]
    [ApiController]
    public class IClockController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly IAttendanceService _attendanceService;

        public IClockController(ApplicationDBContext context, IAttendanceService attendanceService)
        {
            _context = context;
            _attendanceService = attendanceService;
        }

        // 1. HANDSHAKE: Handles both /iclock/cdata AND /iclock/cdata.aspx
        //[HttpGet("cdata")]
        //[HttpGet("cdata.aspx")]
        //public async Task<IActionResult> Handshake([FromQuery] string SN)
        //{
        //    await LogToDb(SN, "GET-HANDSHAKE", Request.Path);

        //    string response = $"GET OPTION FROM: {SN}\nStamp=9999\nOpStamp=0\nErrorDelay=30\nDelay=30\nTransTimes=00:00;14:00\nTransInterval=1\nTransFlag=1111000000\nRealtime=1\nEncrypt=0";
        //    return Content(response, "text/plain");
        //}

        [HttpGet("cdata")]
        [HttpGet("cdata.aspx")]
        public async Task<IActionResult> Handshake([FromQuery] string SN)
        {
            await LogToDb(SN, "GET-HANDSHAKE", Request.Path);

            DateTime utcTime = DateTime.UtcNow;
            TimeZoneInfo istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            DateTime istTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, istTimeZone);
            string serverTime = istTime.ToString("yyyy-MM-dd HH:mm:ss");

            var responseLines = new List<string>
    {
        $"GET OPTION FROM: {SN}",
        "Stamp=9999",
        "OpStamp=0",
        "ErrorDelay=30",
        "Delay=30",
        "Realtime=1",
        "TransInterval=1",
        "TransFlag=1111000000",
        "Encrypt=0",
        $"ServerTime={serverTime}",
        "TimeZone=330" 
    };

            string responseBody = string.Join("\r\n", responseLines) + "\r\n";
            return Content(responseBody, "text/plain");
        }

        // 2. HEARTBEAT: Handles both /iclock/getrequest AND /iclock/getrequest.aspx
        [HttpGet("getrequest")]
        [HttpGet("getrequest.aspx")]
        public async Task<IActionResult> Heartbeat([FromQuery] string SN)
        {
            await LogToDb(SN, "GET-HEARTBEAT", Request.Path);
            return Content("OK", "text/plain");
        }

        // 3. DATA UPLOAD: Handles both /iclock/cdata AND /iclock/cdata.aspx
        [HttpPost("cdata")]
        [HttpPost("cdata.aspx")]
        public async Task<IActionResult> Post([FromQuery] string SN, [FromQuery] string table)
        {
            using var reader = new StreamReader(Request.Body);
            var content = await reader.ReadToEndAsync();

            await LogToDb(SN, "POST-DATA", table, content);

            if (table == "ATTLOG")
            {
                var lines = content.Split(new[] { "\n", "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    if (!line.Contains("\t")) continue;
                    var parts = line.Split('\t');
                    if (parts.Length >= 2)
                    {
                        string biometricId = parts[0].Trim();
                        if (DateTime.TryParse(parts[1], out DateTime punchTime))
                        {
                            // Remove leading zeros if necessary (ProBio Plus often sends 000000001)
                            string cleanedId = biometricId.TrimStart('0');
                            if (string.IsNullOrEmpty(cleanedId)) cleanedId = "0";

                            await _attendanceService.ProcessBiometricPunchAsync(cleanedId, punchTime, SN);
                        }
                    }
                }
            }
            return Content("OK", "text/plain");
        }

        private async Task LogToDb(string sn, string method, string path, string payload = "")
        {
            try
            {
                string sql = "INSERT INTO Tbl_ZK_DebugLog (SN, Method, Path, Payload) VALUES (@p0, @p1, @p2, @p3)";
                await _context.Database.ExecuteSqlRawAsync(sql, sn ?? "", method ?? "", path ?? "", payload ?? "");
            }
            catch { /* Prevent logging errors from crashing the API */ }
        }
    }
}
