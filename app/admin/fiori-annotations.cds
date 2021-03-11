using {AdminService} from '../../srv/admin-service';

annotate AdminService.Pubblications with @odata.draft.enabled;
annotate AdminService.Pubblications with @fiori.draft.enabled;

annotate AdminService.Pubblications with @(
    Common.SemanticKey : [ID],
    UI                 : {
        Identification                  : [{
            $Type : 'UI.DataField',
            Value : title,
        }, ],
        HeaderInfo                      : {
            $Type          : 'UI.HeaderInfoType',
            TypeName       : '{i18n>pubblication}',
            TypeNamePlural : '{i18n>pubblicationPlural}',
            Title          : {
                $Type : 'UI.DataField',
                Value : title,
            },
            Description    : {
                $Type : 'UI.DataField',
                Value : description,
            },
        },
        HeaderFacets                    : [{
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#AdminInfo',
            Label  : '{i18n>administrativeInfo}'
        }, ],
        FieldGroup #AdminInfo           : {
            $Type : 'UI.FieldGroupType',
            Data  : [
                {
                    $Type : 'UI.DataField',
                    Value : createdAt,
                },
                {
                    $Type : 'UI.DataField',
                    Value : createdBy,
                }
            ],
        },
        FieldGroup #PubblicationDetails : {
            $Type : 'UI.FieldGroupType',
            Data  : [
                {
                    $Type : 'UI.DataField',
                    Value : area_id,
                    Label : '{i18n>validFor}',
                },
                {
                    $Type : 'UI.DataField',
                    Value : type_code,
                    Label : '{i18n>pubblicationType}'
                },
                {
                    $Type : 'UI.DataField',
                    Value : originalDate,
                    Label : '{i18n>originalDate}',
                },
            ],
        },
        Facets                          : [
            {
                $Type  : 'UI.ReferenceFacet',
                Target : '@UI.FieldGroup#PubblicationDetails',
                Label  : '{i18n>pubblicationDetails}'
            },
            {
                $Type  : 'UI.ReferenceFacet',
                Target : 'attachment/@UI.LineItem',
                Label  : '{i18n>attachmentList}'
            },
        ],
        LineItem                        : [
            {
                $Type : 'UI.DataField',
                Value : title,
            },
            {
                $Type : 'UI.DataField',
                Value : type.name,
            },
            {
                $Type : 'UI.DataField',
                Value : area.name,
            },
            {
                $Type : 'UI.DataField',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Value : createdBy
            },
        ],
        SelectionFields                 : [
            title,
            type_code,
            area_id
        ],
    }
) {
    area @Common.ValueList : {
        CollectionPath : 'Areas',
        Parameters: [{
            $Type : 'Common.ValueListParameterInOut',
            LocalDataProperty : area_id,
            ValueListProperty : 'id',
        }]
    } @Common.ValueListWithFixedValues;
    type @Common.ValueList : {
        CollectionPath : 'PubblicationType',
        Parameters: [{
            $Type : 'Common.ValueListParameterInOut',
            LocalDataProperty : type_code,
            ValueListProperty : 'code',
        }]
    } @Common.ValueListWithFixedValues;
}

annotate AdminService.Pubblications with {
    ID           @title : '{i18n>pubblicationId}'  @UI.HiddenFilter  @Core.Computed;
    title        @title : '{i18n>pubblicationTitle}'  @mandatory;
    area         @title : '{i18n>assignedArea}'  @Common     : {
        Text            : area.name,
        TextArrangement : #TextOnly
    }            @mandatory;
    type         @title : '{i18n>pubblicationType}'  @Common : {
        Text            : type.name,
        TextArrangement : #TextOnly
    }            @mandatory;
    description  @UI.MultiLineText  @mandatory;
    originalDate @mandatory;
    area_id      @title : '{i18n>validFor}'  @mandatory;
    type_code    @mandatory;
}

annotate AdminService.Attachments with @(UI : {
    Identification : [
        {
            $Type : 'UI.DataField',
            Value : ID,
        },
        {
            $Type : 'UI.DataField',
            Value : name
        }
    ],
    HeaderInfo     : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : '{i18n>attachment}',
        TypeNamePlural : '{i18n>attachmentInfo}',
        Title          : {
            $Type : 'UI.DataField',
            Value : name,
        },
    },
    LineItem       : [
        {
            $Type          : 'UI.DataFieldWithUrl',
            Value          : name,
            Label          : '{i18n>attachmentName}',
            Url            : attachmentUrl,
            UrlContentType : mimeType,
        },
        {
            $Type : 'UI.DataField',
            Value : createdBy,
            Label : '{i18n>attachmentAuthor}'
        },
        {
            $Type : 'UI.DataField',
            Value : createdAt,
            Label : '{i18n>attachmentCreatedAt}'
        }
    ]
}) {

};

annotate AdminService.Areas with @(
    Common.SemanticKey : [id],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : name
    }],
    UI.SelectionFields : [name],
) {
    id   @Common : {
        Text            : name,
        TextArrangement : #TextLast
    };
    name @title  : '{i18n>assignedArea}'
}

annotate AdminService.PubblicationType with @(
    Common.SemanticKey : [code],
    Identification     : [{Value : code}],
    UI                 : {SelectionFields : [name, descr]}
) {
    code @Common : {
        Text            : name,
        TextArrangement : #TextLast
    };
}
