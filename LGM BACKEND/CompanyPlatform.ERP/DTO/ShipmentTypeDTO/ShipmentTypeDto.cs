using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ShipmentTypeDTO
{
    public class ShipmentTypeDto
    {
        public int Id { get; set; }

        public int ShipmentModeId { get; set; }

        public string ShipmentModeName { get; set; }

        public string TypeName { get; set; }

        public string TypeCode { get; set; }
    }

    public class CreateShipmentTypeDto
    {
        public int ShipmentModeId { get; set; }

        public string TypeName { get; set; }

        public string TypeCode { get; set; }
    }

    public class UpdateShipmentTypeDto
    {
        public int Id { get; set; }

        public int ShipmentModeId { get; set; }

        public string TypeName { get; set; }

        public string TypeCode { get; set; }
    }
}
