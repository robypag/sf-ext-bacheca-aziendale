using {
    managed,
    cuid
} from '@sap/cds/common';

namespace sf.ext.bachecaziendale;

/**
 * List of Pubblications, handled by Administrator users,
 * browsed by Employees
 */
@Common : {
    ChangedAt : modifiedAt,
    ChangedBy : modifiedBy,
    CreatedAt : createdAt,
    CreatedBy : createdBy,
    Heading   : '{i18n>pubblicationList}',
    Label     : '{i18n>pubblicationList}'
}
entity Pubblication : cuid, managed {
    title       : String(120);
    description : String(1000);
    criticality : Integer enum {
        Important   = 1;
        Medium      = 2;
        Advice      = 3;
        Informative = 0;
    };
    notifyUsers : Boolean;
    area        : Association to Area;
    attachment  : Composition of many Attachment
                      on attachment.pubblication = $self;
}

/**
 * Geographical Area: collects location groups into a
 * geographical area managed by an Administrator
 */
@Common : {
    ChangedAt : modifiedAt,
    ChangedBy : modifiedBy,
    CreatedAt : createdAt,
    CreatedBy : createdBy,
    Heading   : '{i18n>areaList}',
    Label     : '{i18n>areaList}'
}
entity Area : managed {
    key id            : String(20);
        name          : String(100);
        locationGroup : Composition of many LocationGroup
                            on locationGroup.area = $self;
        pubblications : Association to many Pubblication
                            on pubblications.area = $self;
}

/**
 * LocationGroups: taken from SuccessFactors, collects
 * Locations
 */
@Common : {
    ChangedAt : modifiedAt,
    ChangedBy : modifiedBy,
    CreatedAt : createdAt,
    CreatedBy : createdBy,
    Heading   : '{i18n>locationGroupList}',
    Label     : '{i18n>locationGroupList}'
}
entity LocationGroup : managed {
    key id        : String(20);
        area      : Association to Area;
        name      : String;
        locations : Composition of many Location
                        on locations.group = $self;
}

/**
 * Location: taken from SuccessFactors, represents a subset of
 * FOLocation foundation object
 */
@Common : {
    ChangedAt : modifiedAt,
    ChangedBy : modifiedBy,
    CreatedAt : createdAt,
    CreatedBy : createdBy,
    Heading   : '{i18n>locationList}',
    Label     : '{i18n>locationList}'
}
entity Location : managed {
    key id    : String(20);
        name  : String;
        group : Association to LocationGroup;
}

/**
 * Attachment: BLOB table, contains binary data of any
 * attachment for each Pubblication
 */
@Common : {
    ChangedAt : modifiedAt,
    ChangedBy : modifiedBy,
    CreatedAt : createdAt,
    CreatedBy : createdBy,
    Heading   : '{i18n>attachmentList}',
    Label     : '{i18n>attachmentList}'
}
entity Attachment : cuid, managed {
    name         : String(100);
    pubblication : Association to Pubblication;
    @Core.IsMediaType
    mimeType     : String(80);
    @Core.MediaType : mimeType
    value        : LargeBinary;
}
