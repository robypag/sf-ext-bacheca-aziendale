using {sf.ext.bachecaziendale as db} from '../db/schema';
using {
    ECEmploymentInformation  as EmploymentInfo,
    PLTUserManagement        as UserInfo,
    ECFoundationOrganization as FoundationInfo
} from './sf-ext-service';

service PubblicationService @(
    path     : 'browse',
    impl     : './handlers/user-service.js',
    requires : 'authenticated-user'
) {

    entity Pubblications @(restrict : [{
        grant : ['READ'],
        to    : 'authenticated-user'
    }])                   as projection on db.Pubblication {
        * , area.name as areaName
    };

    entity Attachments    as projection on db.Attachment {
        * , mimeType, value, name
    }

    // Project external entities:

    @cds.persistence.skip
    entity SFUserInfo     as projection on UserInfo.SFUser;

    @cds.persistence.skip
    entity SFLocationInfo as projection on FoundationInfo.SFLocation;

    @cds.persistence.skip
    entity SFJobInfo      as projection on EmploymentInfo.SFJobInfo;

}
