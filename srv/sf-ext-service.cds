using {ECEmploymentInformation} from './external/ECEmploymentInformation.csn';
using {ECFoundationOrganization} from './external/ECFoundationOrganization.csn';
using {PLTUserManagement} from './external/PLTUserManagement.csn';

extend service ECFoundationOrganization with {
    @mashup
    entity SFLocation as projection on ECFoundationOrganization.FOLocation {
        key externalCode, key startDate as startDate : String, name, description, locationGroup, locationGroupNav
    }
}

extend service ECEmploymentInformation with {
    @mashup
    entity SFJobInfo as projection on ECEmploymentInformation.EmpJob {
        key userId, key startDate as startDate : String, key seqNumber, location, department, division, businessUnit, company
    }
}

extend service PLTUserManagement with {
    @mashup
    entity SFUser as projection on PLTUserManagement.User {
        key userId, username, defaultFullName, location
    }
}
