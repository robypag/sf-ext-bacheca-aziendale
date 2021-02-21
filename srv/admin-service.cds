using {sf.ext.bachecaziendale as db} from '../db/schema';

service AdminService @(
    path     : 'admin',
    impl     : './handlers/admin-service.js',
    requires : 'admin-user'
) {

    @odata.draft.enabled
    @Capabilities : {
        Insertable : true,
        Updatable  : true,
        Deletable  : true
    }
    entity Pubblications @(restrict : [{
        grant : [
            'READ',
            'WRITE'
        ],
        to    : 'admin-user',
        where : 'area_id = $user.Area'
    }])                   as projection on db.Pubblication {
        * , area.name as areaName
    };

    entity Attachments    as projection on db.Attachment;

    entity Areas @(restrict : [{
        grant : ['READ'],
        to    : 'admin-user',
        where : 'id = $user.Area'
    }])                   as projection on db.Area;

    entity LocationGroups as projection on db.LocationGroup;
    entity Locations      as projection on db.Location;
    // Functions to enable SF Data Replication:
    function createLocation(location : Locations) returns String;
    function createGroup(locationGroup : LocationGroups) returns String;

}
