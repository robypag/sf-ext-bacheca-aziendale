using {PubblicationService} from '../../srv/user-service';

annotate PubblicationService.Pubblications with @odata.draft.enabled : false;
annotate PubblicationService.Pubblications with @fiori.draft.enabled : false;

annotate PubblicationService.Pubblications with @(UI : {
    Identification                  : [{
        $Type : 'UI.DataField',
        Value : title
    }],
    HeaderInfo                      : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : '{i18n>pubblication}',
        TypeNamePlural : '{i18n>pubblicationPlural}',
        Title          : {
            $Type : 'UI.DataField',
            Value : title,
        }
    },
    SelectionFields                 : [
        originalDate,
        area_id
    ],
    LineItem                        : [
        {
            $Type             : 'UI.DataField',
            Value             : iconUrl,
            ![@UI.Importance] : #High,
        },
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
            Value : originalDate,
        },
    ],
    FieldGroup #Description         : {
        $Type : 'UI.FieldGroupType',
        Data  : [{
            $Type : 'UI.DataField',
            Value : description,
        }, ]
    },
    FieldGroup #Details             : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {
                $Type : 'UI.DataField',
                Value : areaName,
            },
            {
                $Type : 'UI.DataField',
                Value : type_code
            },
            {
                $Type : 'UI.DataField',
                Value : originalDate
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
                    Target : '@UI.FieldGroup#Details',
                },
            ],
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Target : 'attachment/@UI.LineItem',
            Label  : '{i18n>attachmentList}'
        },
    ],
    SelectionVariant #Comunicazioni : {
        $Type         : 'UI.SelectionVariantType',
        Text          : '{i18n>selVarComunicazioni}',
        SelectOptions : [{
            $Type        : 'UI.SelectOptionType',
            PropertyName : type_code,
            Ranges       : [{
                $Type  : 'UI.SelectionRangeType',
                Sign   : #I,
                Option : #EQ,
                Low    : '2',
            }, ],
        }, ]
    },
    SelectionVariant #Accordi       : {
        $Type         : 'UI.SelectionVariantType',
        Text          : '{i18n>selVarAccordi}',
        SelectOptions : [{
            $Type        : 'UI.SelectOptionType',
            PropertyName : type_code,
            Ranges       : [{
                $Type  : 'UI.SelectionRangeType',
                Sign   : #I,
                Option : #EQ,
                Low    : '1',
            }, ],
        }, ]
    },
    SelectionVariant #Tutte         : {
        $Type         : 'UI.SelectionVariantType',
        Text          : '{i18n>selVarTutti}',
        SelectOptions : [{
            $Type        : 'UI.SelectOptionType',
            PropertyName : type_code,
            Ranges       : [{
                $Type  : 'UI.SelectionRangeType',
                Sign   : #I,
                Option : #BT,
                Low    : '1',
                High   : '2',
            }],
        }, ]
    },
    PresentationVariant : {
    $Type : 'UI.PresentationVariantType',
    SortOrder : [
        {
            $Type : 'Common.SortOrderType',
            Property : modifiedAt,
            Descending : true,
        }, ],
    },
}) {
    notifyUsers  @UI.Hidden;
    title        @title            :                '{i18n>pubblicationTitle}';
    originalDate @title            :                '{i18n>originalDate}';
    areaName     @title            :                '{i18n>validFor}';
    area_id      @title            :                '{i18n>validFor}';
    area         @Common.ValueList :                {
        $Type           : 'Common.ValueListType',
        CollectionPath  : 'Areas',
        SearchSupported : true,
        Parameters      : [
            {
                $Type             : 'Common.ValueListParameterOut',
                LocalDataProperty : area_id,
                ValueListProperty : 'id',
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name',
            },
        ],
    }            @Common.ValueListWithFixedValues : true  @title : '{i18n>validFor}';
    description  @UI.MultiLineText  @title        : '{i18n>description}';
    iconUrl      @UI.IsImageURL;
    type    @title : '{i18n>pubblicationType}'  @Common : {
        Text            : type.name,
        TextArrangement : #TextOnly
    };
}

annotate PubblicationService.Areas with @(
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : name
    }],
    UI.SelectionFields : [name],
) {
    id   @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    };
    name @title  : '{i18n>assignedArea}'
}

annotate PubblicationService.Attachments with @(UI : {
    Identification : [
        {
            $Type : 'UI.DataField',
            Value : ID,
        },
        {
            $Type : 'UI.DataField',
            Value : name
        },
    ],
    HeaderInfo     : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : '{i18n>attachmentType}',
        TypeNamePlural : '{i18n>attachmentTypePlural}',
        Title          : {
            $Type : 'UI.DataField',
            Value : name,
        },
    },
    LineItem       : [
        {
            $Type          : 'UI.DataFieldWithUrl',
            Value          : name,
            UrlContentType : mimeType,
            Url            : attachmentUrl
        },
        {
            $Type : 'UI.DataField',
            Value : createdAt,
        },
    ],
}) {
    mimeType @UI.Hidden;
    value    @UI.Hidden;
    name     @title : '{i18n>attachmentName}';
}
