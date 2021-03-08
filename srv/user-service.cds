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

    @Capabilities : {
        Insertable : false,
        Updatable  : false,
        Deletable  : false
    }
    entity Pubblications @(restrict : [{
        grant : ['READ'],
        to    : 'authenticated-user'
    }])                   as projection on db.Pubblication {
        * , area.name as areaName
    };

    @Capabilities : {
        Insertable : false,
        Updatable  : false,
        Deletable  : false
    }
    entity Attachments    as projection on db.Attachment {
        * , null as attachmentUrl : String
    }

    @cds.autoexpose
    entity Areas          as projection on db.Area;

    // Project external entities:

    @cds.persistence.skip
    entity SFUserInfo     as projection on UserInfo.SFUser;

    @cds.persistence.skip
    entity SFLocationInfo as projection on FoundationInfo.SFLocation;

    @cds.persistence.skip
    entity SFJobInfo      as projection on EmploymentInfo.SFJobInfo;

}
