using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.AgencyTypeDTO
{
    public class AgencyTypeDto
    {
        public int Id { get; set; }

        public string AgencyTypeName { get; set; }

        public bool IsDeleted { get; set; }
    }

    public class CreateAgencyTypeDto
    {
        public string AgencyTypeName { get; set; }
    }

    public class UpdateAgencyTypeDto
    {
        public int Id { get; set; }
        public string AgencyTypeName { get; set; }
    }
}
