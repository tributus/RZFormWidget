/**
 * Created by Anderson on 12/01/2016.
 * Widget Interface Definition
 */
rz.widgets.RZFormWidgetHelpers = {
    FormWidgetInterface : [
        "fieldCount",
        "getFieldIdAt",
        {name:"addField", description:"Adiciona um novo campo de entrada de dados ao formulário", friendlyName:"Adicionar campo",
            params:[
                {name:"fielddata", friendlyName:"Dados do campo",description:"Dados do campo que será adicionado (ver especificação)",type:"object"}
            ]
        },
        "insertField",
        "removeFieldAt",
        "removeFieldById",
        "getValueAt",
        "getValueOf",
        "setValueAt",
        "setValueOf",
        "setValueOfModel",
        "getValueOfModel",
        "getFormData",
        "setFormData",
        "clearFormData",
        "validateForm",
        "validateFieldAt",
        "validateFieldOf",
        "getFieldParams",
        "getFieldValue",
        "getGroupDefinition",
        "getFieldsOfGroup",
        "getFieldsOfRuleset",
        "getFieldDefinitions",
        "disableFields",
        "enableFields",
        "hideFields",
        "displayFields"
    ],
    FormWidgetEventHandlers : [
        "data-changed",
        {
            name:"field-added",
            friendlyName:"Campo adicionado",
            description:"Evento disparado após a adição de um novo campo ao formulário",
            params:[
                {name:"sender",friendlyName:"Remetente", description:"Objeto que provocou o evento",type:"object"},
                {name:"args",friendlyName:"Informações adicionais", description:"Informações e dados do evento",type:"object"}
            ]
        }
    ]
};



