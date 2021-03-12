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
            }
        },
        HeaderFacets                    : [{
            $Type  : 'UI.CollectionFacet',
            Facets : [{
                $Type  : 'UI.ReferenceFacet',
                Target : '@UI.FieldGroup#AdminInfo',
            }, ],
        }, ],
        FieldGroup #AdminInfo           : {
            $Type : 'UI.FieldGroupType',
            Data  : [{
                $Type : 'UI.DataField',
                Value : createdAt,
            }],
        },
        FieldGroup #Description         : {
            $Type : 'UI.FieldGroupType',
            Data  : [{
                $Type : 'UI.DataField',
                Value : description,
            }, ]
        },
        FieldGroup #PubblicationDetails : {
            $Type : 'UI.FieldGroupType',
            Data  : [
                {
                    $Type              : 'UI.DataField',
                    Value              : area_id,
                    Label              : '{i18n>validFor}',
                    ![@Common.Label]   : '{i18n>validFor}',
                    ![@Common.Heading] : '{i18n>validFor}',
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
                $Type  : 'UI.CollectionFacet',
                Label  : '{i18n>pubblicationDetails}',
                Facets : [
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Target : '@UI.FieldGroup#Description',
                    },
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Target : '@UI.FieldGroup#PubblicationDetails'
                    },
                ],
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
                Value : ID,
            },
            {
                $Type             : 'UI.DataField',
                Value             : title,
                ![@UI.Importance] : #High,
            },
            {
                $Type             : 'UI.DataField',
                Value             : type_code,
                ![@UI.Importance] : #High,
            },
            {
                $Type             : 'UI.DataField',
                Value             : area_id,
                ![@UI.Importance] : #High,
            },
            {
                $Type : 'UI.DataField',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Value : createdBy
            }
        ],
        SelectionFields                 : [
            type_code,
            area_id
        ],
    }
) {
    area @Common.ValueList : {
        CollectionPath : 'Areas',
        Parameters     : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : area_id,
            ValueListProperty : 'id',
        }]
    }    @Common.ValueListWithFixedValues;
    type @Common.ValueList : {
        CollectionPath : 'PubblicationTypes',
        Parameters     : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : type_code,
            ValueListProperty : 'code',
        }]
    }    @Common.ValueListWithFixedValues;
}

annotate AdminService.Pubblications with {
    ID           @title : '{i18n>pubblicationId}'  @UI.HiddenFilter  @Core.Computed;
    title        @title : '{i18n>pubblicationTitle}';
    area         @title : '{i18n>assignedArea}'  @Common     : {
        Text            : area.name,
        TextArrangement : #TextOnly
    };
    type         @title : '{i18n>pubblicationType}'  @Common : {
        Text            : type.name,
        TextArrangement : #TextOnly
    };
    description  @UI.MultiLineText  @title                   : '{i18n>description}';
    originalDate @title : '{i18n>originalDate}';
    area_id      @title : '{i18n>validFor}';
    type_code    @title : '{i18n>pubblicationType}';
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

annotate AdminService.PubblicationTypes with @(
    Common.SemanticKey : [code],
    Identification     : [{Value : code}],
    UI                 : {SelectionFields : [
        name,
        descr
    ]}
) {
    code @Common : {
        Text            : name,
        TextArrangement : #TextLast
    };
}
