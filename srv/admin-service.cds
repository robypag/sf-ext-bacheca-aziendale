using {sf.ext.bachecaziendale as db} from '../db/schema';
using {PLTUserManagement as UserInfo} from './external/PLTUserManagement.csn';

service AdminService @(
    path     : 'admin',
    impl     : './handlers/admin-service.js',
    requires : 'admin-user'
) {

    @Capabilities : {
        Insertable : true,
        Updatable  : true,
        Deletable  : true
    }
    entity Pubblications @(restrict : [
        {
            grant : ['READ'],
            to    : 'admin-user',
        // where : 'area_id = $user.Area'
        },
        {
            grant : ['WRITE'],
            to    : 'admin-user'
        }
    ])                       as projection on db.Pubblication;


    @Capabilities : {
        Insertable : false,
        Updatable  : false,
        Deletable  : true
    }
    entity Attachments       as projection on db.Attachment {
        * , null as attachmentUrl : String
    }

    @cds.autoexpose
    entity Areas @(restrict : [{
        grant : 'READ',
        to    : 'admin-user',
    // where : 'ID = $user.Area'
    }])                      as projection on db.Area;

    @cds.autoexpose
    entity PubblicationTypes as projection on db.PubblicationType;

    @cds.autoexpose
    entity LocationGroups    as projection on db.LocationGroup;

    @cds.autoexpose
    entity Locations         as projection on db.Location;

    @cds.persistence.skip
    entity SFUserInfo        as projection on UserInfo.SFUser;

}
