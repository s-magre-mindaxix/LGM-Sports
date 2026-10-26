using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ShipmentModeDTO
{
    public class ShipmentModeDto
    {
        public int Id { get; set; }

        public string ModeName { get; set; }

        public string ModeCode { get; set; }
    }

    public class CreateShipmentModeDto
    {
        public string ModeName { get; set; }

        public string ModeCode { get; set; }
    }

    public class UpdateShipmentModeDto
    {
        public int Id { get; set; }

        public string ModeName { get; set; }

        public string ModeCode { get; set; }
    }
}
