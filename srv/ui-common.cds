using {sf.ext.bachecaziendale as db} from '../db/schema';

/*
annotate db.Pubblications with {
    description  @UI.MultiLineText;
    notifyUsers  @title : '{i18n>sendNotification}';
    originalDate @title : '{i18n>originalDate}';
}
*/
annotate db.Attachments with {
    ID       @title : '{i18n>attachmentId}'  @Core.Computed  @UI.HiddenFilter;
    name     @title : '{i18n>attachmentName}';
    mimeType @UI.Hidden;
    value    @UI.Hidden;
}

annotate db.Areas with {
    id   @title : '{i18n>areaId}'  @UI.HiddenFilter;
    name @title : '{i18n>areaName}';
}

annotate db.PubblicationType with {
    code @title : '{i18n>typeCode}'  @UI.HiddenFilter;
    name @title : '{i18n>typeName}';
}
