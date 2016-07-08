/**
 * Created by Anderson on 12/01/2016.
 * Widget Namespace
 */
rz.widgets.FormRenderers = {};
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
        "validateFieldOf"
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




/**
 * Created by Anderson on 13/01/2016.
 */
rz.widgets.formHelpers = {
    fieldRenderers: {},
    dataValidators: {},
    renderDataRows: function (sb, params, renderDataRow) {
        if (params.fields !== undefined) {
            params.fields.forEach(function (it, ix) {
                renderDataRow(sb, it, ix);
            });
        }
    },
    renderDataFieldByType: function (sb, field, containerID) {
        this.fieldRenderers[field.type].render(sb, field, containerID);
    },
    resolveModelName: function (field, generatedID) {
        var hasGetAndSet = (rz.widgets.formHelpers.fieldRenderers[field.type].getValue !==undefined && rz.widgets.formHelpers.fieldRenderers[field.type].setValue !==undefined);
        if(hasGetAndSet){
            return (field.model !== undefined && field.model.match(/^[a-zA-Z]+[0-9]*(\.[a-zA-Z]+[0-9]*)*$/) != null) ? field.model : generatedID + "_data";
        }
        else{
            return "***";
        }

    },
    getInitialValueData: function (field) {
        var data = field.initialValue;
        if (data === undefined) {
            return "";
        }
        else {
            return (typeof(data) === "object") ? "object-data:[" + btoa(JSON.stringify(data)) + "]" : data;
        }
    },
    createFieldRenderer: function (n, d) {
        this.fieldRenderers[n] = d;
    },
    createFormValidator: function (n, d) {
        this.dataValidators[n] = d;
    },
    validateField: function (n, s, v, p, h) {
        this.dataValidators[n](s, v, p, h);
    },
    bindEventHandlers: function (sender) {
        var rcount = sender.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = sender.getFieldIdAt(i);
            var type = $("#" + id).data("fieldtype");
            this.fieldRenderers[type].bindEvents(id, this.emit, sender);
        }
    },
    bindEventHandlersOfField: function (type, id, sender) {
        this.fieldRenderers[type].bindEvents(id, this.emit, sender);
    },
    doPosRenderActions: function (sender) {
        var rcount = sender.fieldCount();
        $("#" + sender.baseID + " .rz-tabpanel .item").tab();
        $("#" + sender.baseID + " .ui.accordion").accordion();

        for (var i = 0; i < rcount; i++) {
            var id = sender.getFieldIdAt(i);
            var type = $("#" + id).data("fieldtype");
            if (this.fieldRenderers[type].doPosRenderActions !== undefined) {
                this.fieldRenderers[type].doPosRenderActions(id, sender);
            }
        }
    },
    doPosRenderActionsOfField: function (type, id, sender) {
        if (this.fieldRenderers[type].doPosRenderActions !== undefined) {
            this.fieldRenderers[type].doPosRenderActions(id, sender);
        }
    },
    getValueOfField: function (id) {
        var fieldType = $(id).data("fieldtype");
        if(this.fieldRenderers[fieldType].getValue){
            return this.fieldRenderers[fieldType].getValue(id + "_" + fieldType);
        }
        else{
            return undefined;
        }

    },
    setValueOfField: function (id, newValue) {
        var fieldType = $(id).data("fieldtype");
        if(this.fieldRenderers[fieldType].setValue){
            this.fieldRenderers[fieldType].setValue(id + "_" + fieldType, newValue);
        }
    },
    emit: function (n, d, sender) {
        var handlers = sender.getEventHandlers();
        if (handlers[n] !== undefined && handlers[n].length > 0) {
            handlers[n].forEach(function (it) {
                it(sender, d);
            });
        }
    },
    validateFormImpl: function ($this, params, validationResultHandler,fieldsetRule,forceSuccess) {
        validationResultHandler = rz.helpers.ensureFunction(validationResultHandler);
        var formData = $this.sender.getFormData();
        var $that = this;

        if (params.validation.enabled) {
            $this.sender.validationReport = [];
            params.validation.rules.forEach(function (rule) {
                var fieldID = $("#" + $this.target +  "base_form .field[data-model='"+rule.model+"']").attr("id");
                if((fieldsetRule!==undefined && $that.fieldMatchFieldSetRule(fieldID,fieldsetRule)) || fieldsetRule===undefined){
                    if(!forceSuccess){
                        rz.widgets.formHelpers.validateField(rule.type, $this.sender, formData[rule.model], rule, function (result, params) {
                            if (!result) {
                                $this.sender.validationReport.push({failedRule: rule});
                            }
                        });
                    }
                }
            });
            $this.sender.isFormInvalid = $this.sender.validationReport.length > 0;
            $this.displayValidationReport();
            validationResultHandler($this.sender, {validated: !$this.sender.isFormInvalid});
        }
        else {
            validationResultHandler($this.sender, {validated: true});
        }
    },
    displayValidationReportImpl: function ($this) {
        var fieldsSelector = '#* .field'.replace('*', $this.target);
        $(fieldsSelector).removeClass("error");
        var fieldSelector = '#* [data-model="*"]'.replace('*', $this.target);
        var reportTarget = $this.params.validation.reportTarget || "#" + $this.target + "_validation_report";
        if ($this.sender.validationReport !== undefined && $this.sender.validationReport.length > 0) {
            var sb = new StringBuilder();
            sb.appendFormat('<div class="ui error message">');
            sb.appendFormat('	<ul class="list">');
            $this.sender.validationReport.forEach(function (item) {
                sb.appendFormat('<li>{0}</li>', item.failedRule.message);
                $(fieldSelector.replace('*', item.failedRule.model)).addClass("error");
            });
            sb.appendFormat('	</ul>');
            sb.appendFormat('</div>');
            $(reportTarget).html(sb.toString());
        }
        else {
            $(reportTarget).empty();
        }
    },
    getFormDataImpl: function ($this,fieldsetRule) {
        var root = {};
        var rcount = $this.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var model = $("#" + id).data("model");
            if(model!==undefined && model !="***"){
                if(fieldsetRule!==undefined){
                    if(this.fieldMatchFieldSetRule(id,fieldsetRule)){
                        rz.helpers.jsonUtils.setDataAtPath(root, $this.getValueOf(id), model);
                    }
                }
                else{
                    rz.helpers.jsonUtils.setDataAtPath(root, $this.getValueOf(id), model);
                }
            }

        }
        return root;
    },
    setFormDataImpl: function (formData, $this,fieldsetRule) {
        var rcount = $this.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            if((fieldsetRule!==undefined && this.fieldMatchFieldSetRule(id,fieldsetRule)) || fieldsetRule===undefined){
                var model = $("#" + id).data("model");
                if(model !==undefined && model !="***"){
                    var value = rz.helpers.jsonUtils.getDataAtPath(formData, model);
                    $this.setValueOfModel(model, value);
                }
            }
        }
    },
    clearFormDataImpl:function($this,fieldsetRule){
        var rcount = $this.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            if((fieldsetRule!==undefined && this.fieldMatchFieldSetRule(id,fieldsetRule)) || fieldsetRule===undefined){
                var initialValue = $("#" + id).data("initial-value");
                if (initialValue !== undefined && initialValue.toString().match(/^object-data:\[.*]$/) != null) {
                    initialValue = initialValue.replace(/^object-data:\[/, "").replace(/]$/, "");
                    initialValue = JSON.parse(atob(initialValue));
                }
                $this.setValueAt(i, initialValue);
            }
        }
    },
    resolveFieldSet : function(field){
        if(field.fieldSetName !==undefined){
            if(field.fieldSetName.match(/^[a-zA-Z 0-9]+$/)){
                var fieldSets = field.fieldSetName.split(" ");
                var ret = [];
                fieldSets.forEach(function(item){
                    if(item !==""){
                        ret.push("-FIELDSET-" + item);
                    }
                });
                if(ret.length > 0){
                    return " FIELDSET_MEMBER " + ret.join(" ");
                }
                else{
                    return "";
                }

            }
            else{
                throw "invalid fieldset name";
            }
        }
        else{
            return "";
        }
    },
    fieldMatchFieldSetRule:function(fieldID,fieldsetRule){
        var result = (fieldsetRule.rule=="exclude");
        fieldsetRule.fieldsets.every(function(item){
            var fsName = "-FIELDSET-" + item;
            if(fieldsetRule.rule=="exclude"){
                if($("#" + fieldID).hasClass(fsName)){
                    result=false;
                    return false;
                }
                else{
                    return true;
                }
            }
            else if(fieldsetRule.rule=="restrict"){
                if($("#" + fieldID).hasClass(fsName)){
                    result=true;
                    return false;
                }
                else{
                    return true;
                }
            }

        });
        return result;
    }

};
/**
 * Created by anderson.santos on 06/07/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("actions", {
    actionRenderers : {
        button:function(actionData, sb,containerID){
            sb.appendFormat('<button id="{3}_action-button" class="ui {2} button rz-action-handler" data-action="{0}">{1}</button>',
                actionData.name,
                actionData.label || "",
                actionData.cssClass || "primary",
                containerID
            );
        }
    },
    render: function (sb, field, containerID) {
        var $this = this;
        if(field.actions !==undefined){
            field.actions.forEach(function(action){
                $this.actionRenderers[action.type](action,sb,containerID);
            });
        }
        return containerID + "_collection";
    },
    bindEvents: function (id, emit, sender) {
            $("#" + id + " .button.rz-action-handler").click(function (e) {
                try{
                    var action  = $(e.currentTarget).data("action");
                    if(action!==undefined){
                        emit(action, {field: id,targetElement: e,action:action,src: "usr"},sender);
                    }
                    return false;
                }
                catch (e){
                    console.error(e);
                    return false;
                }
            });
    },
    doPosRenderActions: function (id, $this) {}

});
/**
 * Created by anderson.santos on 06/07/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("collection", {
    render: function (sb, field, containerID) {

        sb.appendFormat('<div class="{0}">',field.maineElementCss || "ui raised secondary segment");
        sb.appendFormat('   <div id="{0}_collection_container" class="ui {1} list collection-container">', containerID,field.collectionContainerCssClsss || "middle aligned divided");
        sb.appendFormat('   </div>');
        sb.appendFormat('</div>');

        return containerID + "_collection";
    },
    getValue: function (id) {
        //return $(id).val();
    },
    setValue: function (id, newValue) {
        //$(id).val(newValue || "");
        var sb = new StringBuilder();
        sb.appendFormat('       <div class="item">');
        sb.appendFormat('           <div class="right floated content">');
        sb.appendFormat('               <div class="ui icon top right pointing dropdown button">');
        sb.appendFormat('                   <i class="ellipsis vertical icon"></i>');
        sb.appendFormat('                   <div class="menu">');
        sb.appendFormat('                       <div class="header">Ações</div>');
        sb.appendFormat('                       <div class="item"><i class="edit icon"></i> Editar item</div>');
        sb.appendFormat('                       <div class="item"><i class="delete icon"></i> Excluir item</div>');
        sb.appendFormat('                   </div>');
        sb.appendFormat('               </div>');
        sb.appendFormat('           </div>');
        sb.appendFormat('           <div class="content">');
        sb.appendFormat('               Lindsay');
        sb.appendFormat('           </div>');
        sb.appendFormat('       </div>');
        sb.appendFormat('<script>$(".ui.dropdown").dropdown()</script>');
        $(id + "_collection_container").append(sb.toString());


    },
    bindEvents: function (id, emit, sender) {
        var fieldParams = JSON.parse(atob($("#" + id).data("field-params")));
        var fieldsets = {
            rule:'restrict',
            fieldsets: fieldParams.itemsSource.source.split(' ')
        };

        if(fieldParams.itemsSource.type=="fieldset"){
            sender.on(fieldParams.itemsSource.trigger,function(sender){
                sender.validateForm(function(sender,result){
                    if(result.validated){
                        var newItem = sender.getFormData(fieldsets);
                        sender.clearFormData(fieldsets);
                        sender.setValueOf(id,newItem);
                        //emit aqui ? ou lá?
                    }
                },fieldsets);
            });
        }

        //***************************************************registrar o datachange:*******************************
    //     $("#" + id).change(function (e) {
    //         emit("data-changed", {field: id,value: e.target.value,src: "usr"},sender);
    //     });
    },
    doPosRenderActions: function (id, $this) {}

});
/**
 * Created by Anderson on 13/01/2016.
 * Simple list renderer
 */
rz.widgets.formHelpers.createFieldRenderer("list", {
    activeInstances:{},
    helpers: {
        getElementID:function(id,suffix){
            if(suffix===undefined){
                suffix="";
            }
            return suffix + id + "_list";
        }
    },
    render: function (sb, field, containerID) {
        sb.appendFormat('<select id="{0}" name="{0}" class="form-control">', containerID);
        field.listItems.forEach(function (it) {
            sb.appendFormat('   <option value="{1}" {2}>{0}</option>', it.label, it.value, (it.value == field.value) ? "selected" : "");
        });
        sb.appendFormat('</select>');
    },
    getValue: function (id) {
        return $(id).val();
    },
    setValue: function (id, newValue) {
        if(newValue==null){
            $(id).dropdown("restore default value");
        }
        else{
            $(id).dropdown("set selected",newValue);
        }
    },
    bindEvents: function (id, emit, sender) {
        var id = this.helpers.getElementID(id,"#");

        var handler = function(id,value,text){
            emit("data-changed", {fieldid: id,value: value,src: "usr",text:text},sender);
        };
        this.activeInstances[id].push(handler);
    },
    doPosRenderActions: function (id) {
        var $this = this;
        var elID = this.helpers.getElementID(id,"#");
        $(elID).dropdown({
            onChange:function(value, text, $selectedItem){
                var elInst = $this.activeInstances[elID];
                if(elInst !==undefined && elInst.length > 0){
                    elInst.forEach(function(item){
                        item(elID,value,text);
                    })
                }

            }
        });
        this.activeInstances[elID] = [];
    }
});
/**
 * Created by anderson.santos on 17/06/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("password", {
    render: function (sb, field, containerID) {
        var resolveAttributes = function(){
            var attr = field.attributes;
            if(attr===undefined || attr.length <= 0){
                return "";
            }
            else{
                var ret = " ";
                attr.forEach(function(at){
                    ret += at.name + '="' + at.value + '" ';
                });
                return ret;
            }
        };
        sb.appendFormat('<input id="{1}" name="{1}" type="password" value="{0}" class="form-control"{2}>', field.value || "", containerID,resolveAttributes());
        return containerID + "_input_pwd";
    },
    getValue: function (id) {
        return $(id).val();
    },
    setValue: function (id, newValue) {
        $(id).val(newValue || "");
    },
    bindEvents: function (id, emit, sender) {
        $("#" + id).change(function (e) {
            emit("data-changed", {field: id,value: e.target.value,src: "usr"},sender);
        });
    },
    doPosRenderActions: function (id, $this) {}

});
/**
 * Created by Anderson on 13/01/2016.
 * Input text renderer
 */
rz.widgets.formHelpers.createFieldRenderer("text", {
    render: function (sb, field, containerID) {
        var resolveAttributes = function(){
            var attr = field.attributes;
            if(attr===undefined || attr.length <= 0){
                return "";
            }
            else{
                var ret = " ";
                attr.forEach(function(at){
                    ret += at.name + '="' + at.value + '" ';
                });
                return ret;
            }
        };
        sb.appendFormat('<input id="{1}" name="{1}" type="text" value="{0}" class="form-control"{2}>', field.value || "", containerID,resolveAttributes());
        return containerID + "_input";
    },
    getValue: function (id) {
        return $(id).val();
    },
    setValue: function (id, newValue) {
        $(id).val(newValue || "");
    },
    bindEvents: function (id, emit, sender) {
        $("#" + id).change(function (e) {
            emit("data-changed", {field: id,value: e.target.value,src: "usr"},sender);
        });
    },
    doPosRenderActions: function (id, $this) {}

});
/**
 * Created by Anderson on 12/01/2016.
 * Widget default renderer
 */
rz.widgets.FormRenderers["default"] = function (params, sender) {
    var $this = this;
    var initialize = function () {
        var defaultParams = {
            horizontal : false,
            formLabelSizeClass:"col-sm-2",
            formValueSizeClass:"col-sm-10",
            validation:{
                enabled:true,
                rules:[]
            }
        };

        $this.params = $.extend(true, {}, defaultParams, params);
        $this.sender = sender;
    };

    /**
     * renderizes the widget
     * @param {string} target
     * @param {object} params
     */
    this.render = function (target, params) {
        $this.params = params;
        $this.target = target;
        var baseID = target+"base_form";
        var sb = new StringBuilder();
        sb.append('<div class="form-widget">');
        sb.appendFormat('  <form id="{0}" class="{1} ui form">', baseID, (params.horizontal) ? "form-horizontal" : "");
        var hasTabs = isElegibleFormTabPanel();
        if (hasTabs) {
            renderTabPanels(sb);
        }

        rz.widgets.formHelpers.renderDataRows(sb, params, renderDataField);
        sb.append('  </form>');
        sb.appendFormat('<div id="{0}_validation_report" class="validation-report-container"></div>',target);
        sb.append('</div>');
        $("#" + target).append(sb.toString());
        $this.sender.baseID = baseID;
        rz.widgets.formHelpers.doPosRenderActions($this.sender);
        rz.widgets.formHelpers.bindEventHandlers($this.sender);
    };

    var isElegibleFormTabPanel = function () {
        var elegible = true;
        $this.params.fields.forEach(function (it) {
            if (!it.fieldGroup) {
                elegible = false;
                return null;
            }
        });
        return elegible;
    };

    var activeTabIndex = function () {
        var index = 0;
        $this.params.fields.forEach(function (it, id) {
            if (it.active) index = id;
        });
        return index;
    };

    var renderTabPanels = function (sb) {
        var actidx = activeTabIndex();
        sb.appendFormat('<div class="ui top attached tabular menu rz-tabpanel">');
        $this.params.fields.forEach(function (it, id) {
            var targetID = generateRandomID(12);
            sb.appendFormat('<a class="item {2}" data-tab="{1}">{0}</a>'
                , it.groupLabel
                , targetID
                , (id == actidx) ? "active" : "");
            it.groupID = targetID;
            it.active = (id == actidx);
        });
        sb.appendFormat('</div>');
    };

    var renderCollapseContainer = function (sb, fieldID, field) {
        sb.appendFormat('<div class="ui styled fluid accordion">');
        sb.appendFormat('    <div class="active title">');
        sb.appendFormat('    <i class="dropdown icon"></i>');
        sb.appendFormat('    {0}',field.groupLabel || "");
        sb.appendFormat('</div>');
        sb.appendFormat('<div class="active content">');

        field.fields.forEach(function (it) {
            renderDataField(sb, it);
        });

        sb.appendFormat('</div>');
        sb.appendFormat('</div>');
    };

    var renderTabContainer = function (sb, field) {
        sb.appendFormat('<div class="ui bottom attached tab segment {1}" data-tab="{0}">',
            field.groupID,
            (field.active) ? "active" : ""
        );
        field.fields.forEach(function (it) {
            renderDataField(sb, it);
        });
        sb.appendFormat('</div>');
    };

    var renderFieldGroupContainer = function(sb, fieldID, field){
        var c = ["zero", "one","two","three","four","five","six","seven", "eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen"];
        var fieldCount =  field.fields.count;
        if(fieldCount===undefined || fieldCount > 16) fieldCount=2;
        var fieldCountName = field.columCount ||c[fieldCount];
        sb.appendFormat('<div class="{0} fields">',fieldCountName);
        field.fields.forEach(function (it) {
            renderDataField(sb, it);
        });
        sb.appendFormat('</div>');
    };

    var renderDataField = function (sb, field) {
        var fieldID = (field.id || field.model || "field_" + generateRandomID(8)).replace(/\./g, "_");
        if (field.fieldGroup) {
            var groupType = field.groupType || "tabpanel";
            if (groupType == "tabpanel") {
                renderTabContainer(sb, field);
            }
            else if (groupType == "collapse") {
                renderCollapseContainer(sb, fieldID, field);
            }
            else if(groupType =="fieldgroup"){
                renderFieldGroupContainer(sb,fieldID, field);
            }
        }
        else {
            var h = $this.params.horizontal;
            field.type = field.type || "text";
            field.id = "*_*".replace("*", $this.target).replace("*",fieldID);
            sb.appendFormat('<div id="{0}" data-fieldtype="{1}" data-model="{2}" data-initial-value="{3}" class="form-row {4}{5}{6}" data-field-params="{7}">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field),
                (h)? "inline fields":"field",
                (field.wide !==undefined)? " " + field.wide + " wide":"",
                rz.widgets.formHelpers.resolveFieldSet(field),
                btoa(JSON.stringify(field))
            );
            var inputID = $this.target + "_" + fieldID + "_" + field.type;
            if(h) sb.appendFormat('<div class="sixteen wide field">');

            if(field.label !==undefined){
                sb.appendFormat('<label for="{1}" class="{2}">{0}</label>',
                    field.label,
                    inputID,
                    "control-label"
                );
            }

            rz.widgets.formHelpers.renderDataFieldByType(sb, field, inputID, $this);
            if(h) {
                sb.appendFormat('</div>');
            }
            sb.append('</div>');
        }
    };

    this.fieldCount = function () {
        return $("#" + $this.target + "base_form .form-row").length;
    };

    this.getFieldIdAt = function (position) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            return $("#" + $this.target + "base_form .form-row").eq(p).attr("id");
        }
        else {
            return undefined;
        }
    };

    this.addField = function (fielddata) {
        var sb = new StringBuilder();
        renderDataField(sb, fielddata);
        $("#" + $this.target + "base_form .form-row").last().parent().append(sb.toString());
    };

    this.insertField = function (fielddata, position) {
        var sb = new StringBuilder();
        renderDataField(sb, fielddata);
        $("#" + $this.target + "base_form .form-row").eq(position).before(sb.toString());
    };

    this.removeFieldAt = function (position) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            $("#" + $this.target + "base_form .form-row").eq(p).remove();
        }
    };

    this.removeFieldById = function (fieldid) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        $("#" + fieldid).remove();
    };

    this.getValueAt = function (position) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            var id = $("#" + $this.target + "base_form .form-row").eq(p).attr("id");
            return rz.widgets.formHelpers.getValueOfField("#" + id);
        }
    };

    this.getValueOf = function (fieldid) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        return rz.widgets.formHelpers.getValueOfField("#" + fieldid);
    };

    this.getValueOfModel = function (model) {
        var id = $("#" + $this.target +  "base_form .field[data-model='"+model+"']").attr("id");
        return $this.getValueOf(id);
    };

    this.setValueOfModel = function (model,value) {
        var id = $("#" + $this.target +  "base_form .field[data-model='"+model+"']").attr("id");
        return $this.setValueOf(id,value);
    };

    this.setValueAt = function (position, value) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            var id = $("#" + $this.target + "base_form .form-row").eq(p).attr("id");
            var formerValue = rz.widgets.formHelpers.getValueOfField("#" + id);
            if (formerValue != value) {
                rz.widgets.formHelpers.setValueOfField("#" + id, value);
                rz.widgets.formHelpers.emit("data-changed", {fieldid: id, value: value, src: "code"}, $this.sender);
            }
        }
    };

    this.setValueOf = function (fieldid, value) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        var formerValue = rz.widgets.formHelpers.getValueOfField("#" + fieldid);
        if (formerValue != value) {
            rz.widgets.formHelpers.setValueOfField("#" + fieldid, value);
            rz.widgets.formHelpers.emit("data-changed", {fieldid: fieldid, value: value, src: "code"}, $this.sender);
        }
    };

    this.getFormData = function (fieldsetRule) {
        return rz.widgets.formHelpers.getFormDataImpl($this,fieldsetRule);
    };

    this.setFormData = function(formData,fieldsetRule){
        rz.widgets.formHelpers.setFormDataImpl(formData,$this,fieldsetRule);
    };

    this.clearFormData = function (fieldsetRule) {
        rz.widgets.formHelpers.clearFormDataImpl($this,fieldsetRule);
    };

    /**
     * validates de form data
     * @param {function } validationResultHandler - method invoked after validation
     */
    this.validateForm = function(validationResultHandler,fieldsetRule,forceSuccess){
        rz.widgets.formHelpers.validateFormImpl($this,params,validationResultHandler,fieldsetRule,forceSuccess);
    };

    this.displayValidationReport = function(){
        rz.widgets.formHelpers.displayValidationReportImpl($this);
    };

    initialize();
};
/**
 * Created by Anderson on 12/01/2016.
 * Widget Grid Row Renderer
 */
rz.widgets.FormRenderers["grid-row"] = function (params, sender) {
    var $this = this;
    var initialize = function () {
        $this.params = params;
        $this.sender = sender;
    };

    this.render = function (target, params) {
        $this.target = target;
        var sb = new StringBuilder();
        sb.appendFormat('    <tr id="{0}base_form">', target);
        rz.widgets.formHelpers.renderDataRows(sb, params, renderDataField);

        sb.appendFormat('    </tr>');
        $("#" + target).append(sb.toString());
        rz.widgets.formHelpers.doPosRenderActions($this.sender);
        rz.widgets.formHelpers.bindEventHandlers($this.sender);


    };

    var renderDataField = function (sb, field) {
        var fieldID = (field.id || field.model || "row_" + generateRandomID(8)).replace(/\./g, "_");
        if (field.fieldGroup) {
            field.fields.forEach(function (it) {
                renderDataField(sb, it);
            });
        }
        else {
            field.type = field.type || "text";
            field.id = "*_*".replace("*", $this.target).replace("*",fieldID);

            sb.appendFormat('<td id="{0}" data-fieldtype="{1}" data-model="{2}" data-initial-value="{3}" class="row-form-field field{4}" data-field-params="{5}">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field),
                rz.widgets.formHelpers.resolveFieldSet(field),
                btoa(JSON.stringify(field))
            );
            var inputID = $this.target + "_" + fieldID + "_" + field.type;
            rz.widgets.formHelpers.renderDataFieldByType(sb, field, inputID, $this);
            sb.append('</td>');
        }

    };

    this.fieldCount = function () {
        return $("#" + $this.target + "base_form > .row-form-field").length;
    };

    this.getFieldIdAt = function (position) {
        var p = position;
        if (p >= 0 && p < $this.sender.fieldCount()) {
            return $("#" + $this.target + "base_form > .row-form-field").eq(p).attr("id");
        }
    };

    this.addField = function (fielddata) {
        var sb = new StringBuilder();
        renderDataField(sb, fielddata);
        $(sb.toString()).appendTo("#" + $this.target + "base_form");
    };

    this.insertField = function (fielddata, position) {
        var sb = new StringBuilder();
        renderDataField(sb, fielddata);
        $("#" + $this.target + "base_form > .row-form-field").eq(position).before(sb.toString());
    };

    this.removeFieldAt = function (position) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            $("#" + $this.target + "base_form > .row-form-field").eq(p).remove();
        }
    };

    this.removeFieldById = function (fieldid) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        $("#" + fieldid).remove();
    };

    this.getValueAt = function (position) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            var id = $("#" + $this.target + "base_form > .row-form-field").eq(p).attr("id");
            return rz.widgets.formHelpers.getValueOfField("#" + id);
        }
    };

    this.getValueOfModel = function (model) {
        var id = $("#" + $this.target +  "base_form .field[data-model='"+model+"']").attr("id");
        return $this.getValueOf(id);
    };

    this.setValueOfModel = function (model,value) {
        var id = $("#" + $this.target +  "base_form .field[data-model='"+model+"']").attr("id");
        return $this.setValueOf(id,value);
    };

    this.getValueOf = function (fieldid) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        return rz.widgets.formHelpers.getValueOfField("#" + fieldid);
    };

    this.setValueAt = function (position, value) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            var id = $("#" + $this.target + "base_form > .row-form-field").eq(p).attr("id");
            rz.widgets.formHelpers.setValueOfField("#" + id, value);
            rz.widgets.formHelpers.emit("data-changed", {fieldid: id, value: value, src: "code"}, $this.sender);
        }
    };

    this.setValueOf = function (fieldid, value) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        rz.widgets.formHelpers.setValueOfField("#" + fieldid, value);
        rz.widgets.formHelpers.emit("data-changed", {fieldid: fieldid, value: value, src: "code"}, $this.sender);
    };

    this.getFormData = function (fieldsetRule) {
        return rz.widgets.formHelpers.getFormDataImpl($this,fieldsetRule);
    };
    
    this.setFormData = function(formData,fieldsetRule){
        rz.widgets.formHelpers.setFormDataImpl(formData,$this,fieldsetRule);
    };

    this.clearFormData = function (fieldsetRule) {
        rz.widgets.formHelpers.clearFormDataImpl($this,fieldsetRule);
    };

    /**
     * validates de form data
     * @param {function } validationResultHandler - method invoked after validation
     */
    this.validateForm = function(validationResultHandler,fieldsetRule,forceSuccess){
        rz.widgets.formHelpers.validateFormImpl($this,params,validationResultHandler,fieldsetRule,forceSuccess);
    };

    this.displayValidationReport = function(){
        rz.widgets.formHelpers.displayValidationReportImpl($this);
    };
    
    initialize();
};
/**
 * Created by Anderson on 12/01/2016.
 * Widget Vertical Grid Renderer
 */
rz.widgets.FormRenderers["v-grid"] = function (params, sender) {
    var $this = this;
    var initialize = function () {
        var defaultParams = {
            displayHeader : false,
            headerLabel:"Label",
            headerValue:"Value"
        };
        $this.params = $.extend(true, {}, defaultParams, params);
        $this.sender = sender;
    };

    this.render = function (target, params) {
        $this.target = target;
        var sb = new StringBuilder();
        sb.append('<div class="grid-form">');
        sb.append('<form class="ui form">');
        sb.appendFormat('  <table id="{0}base_form" class="ui celled table">', target);
        renderHeader(sb, params);
        sb.append('    <tbody>');
        rz.widgets.formHelpers.renderDataRows(sb, params, renderDataField);

        sb.append('    </tbody>');
        sb.append('  </table>');
        sb.append('</form>');
        sb.append('</div>');
        $("#" + target).append(sb.toString());
        rz.widgets.formHelpers.doPosRenderActions($this.sender);
        rz.widgets.formHelpers.bindEventHandlers($this.sender);
        bindCollapseButtonEvents();
    };

    var bindCollapseButtonEvents = function () {
        var fid = "#" + $this.target + " .collapse-toggle-button";
        $(fid).click(function (e) {
            e.preventDefault();
            var baseRow = $(e.currentTarget).parent().parent();
            var pid = baseRow.attr("id");
            baseRow.toggleClass("collapsed");
            var selector = 'tr[data-groupingid="*"]'.replace("*",pid);
            if(baseRow.hasClass('collapsed')){
                $(selector).hide();
            }
            else{
                $(selector).show();
            }
        })
    };

    var renderHeader = function (sb, params) {
        if (params.displayHeader) {
            sb.append("<thead>");
            sb.append("  <tr>");
            sb.appendFormat("  <th>{0}</th>", params.headerLabel);
            sb.appendFormat("  <th>{0}</th>", params.headerValue);
            sb.append("  </tr>");
            sb.append("</thead>");
        }
    };

    var renderFieldGroup = function (field, fieldID, sb,parentGroup) {
        if(field.groupType !="fieldgroup") {
            field.collapsible = (field.collapsible === undefined) ? true : field.collapsible;
            var gid = "*_*".replace("*", $this.target).replace("*", fieldID);
            sb.appendFormat('<tr id="{0}" class="vdgrid-group-header">', gid);

            if (field.collapsible) {
                sb.appendFormat('<td colspan="2"><a href="#" class="collapse-toggle-button">{0}</a></td>', field.groupLabel);
            }
            else {
                sb.appendFormat('<td colspan="2"><span>{0}</span></td>', field.groupLabel);
            }
            sb.appendFormat('</tr>');
            var groupInfoData = 'data-groupingid="*"'.replace('*', gid);

            field.fields.forEach(function (it) {
                renderDataField(sb, it, groupInfoData);
            });
        }
        else{
            field.fields.forEach(function (it) {
                renderDataField(sb, it, parentGroup);
            });
        }
    };

    var renderDataField = function (sb, field,gidata) {
        var fieldID = (field.id || field.model || "row_" + generateRandomID(8)).replace(/\./g, "_");
        if (field.fieldGroup) {
            renderFieldGroup(field, fieldID, sb,gidata);
        }
        else{
            field.type = field.type || "text";
            field.id = "*_*".replace("*", $this.target).replace("*",fieldID);

            sb.appendFormat('<tr id="{0}" data-fieldtype="{1}" data-model="{2}" data-initial-value="{3}" {4} class="field field-row{5}" data-field-params="{6}">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field),
                gidata || "",
                rz.widgets.formHelpers.resolveFieldSet(field),
                btoa(JSON.stringify(field))
            );
            var inputID = $this.target + "_" + fieldID + "_" + field.type;
            sb.appendFormat('<td><label for="{1}">{0}</label></td>', field.label, inputID);
            sb.appendFormat('<td>');
            rz.widgets.formHelpers.renderDataFieldByType(sb, field, inputID, $this);
            sb.append('</td>');
            sb.append('</tr>');
        }

    };

    this.fieldCount = function () {
        return $("#" + $this.target + "base_form tbody > .field-row").length;
    };

    this.getFieldIdAt = function (position) {
        var p = position;
        if (p >= 0 && p < $this.sender.fieldCount()) {
            return $("#" + $this.target + "base_form tbody > .field-row").eq(p).attr("id");
        }
    };

    this.addField = function (fielddata) {
        var sb = new StringBuilder();
        renderDataField(sb, fielddata);
        $(sb.toString()).appendTo("#" + $this.target + "base_form tbody");

    };

    this.insertField = function (fielddata, position) {
        var sb = new StringBuilder();
        renderDataField(sb, fielddata);
        $("#" + $this.target + "base_form tbody > .field-row").eq(position).before(sb.toString());
    };

    this.removeFieldAt = function (position) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            $("#" + $this.target + "base_form tbody > .field-row").eq(p).remove();
        }
    };

    this.removeFieldById = function (fieldid) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        $("#" + fieldid).remove();
    };

    this.getValueAt = function (position) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            var id = $("#" + $this.target + "base_form tbody > .field-row").eq(p).attr("id");
            return rz.widgets.formHelpers.getValueOfField("#" + id);
        }
    };

    this.getValueOfModel = function (model) {
        var id = $("#" + $this.target + "base_form .field[data-model='"+model+"']").attr("id");
        return $this.getValueOf(id);
    };

    this.setValueOfModel = function (model,value) {
        var id = $("#" + $this.target +  "base_form .field[data-model='"+model+"']").attr("id");
        return $this.setValueOf(id,value);
    };

    this.getValueOf = function (fieldid) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        return rz.widgets.formHelpers.getValueOfField("#" + fieldid);
    };

    this.setValueAt = function (position, value) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            var id = $("#" + $this.target + "base_form tbody > .field-row").eq(p).attr("id");
            rz.widgets.formHelpers.setValueOfField("#" + id, value);
            rz.widgets.formHelpers.emit("data-changed", {fieldid: id, value: value, src: "code"}, $this.sender);
        }
    };

    this.setValueOf = function (fieldid, value) {
        if (!fieldid.startsWith($this.target + "_")) {
            fieldid = $this.target + "_" + fieldid;
        }
        rz.widgets.formHelpers.setValueOfField("#" + fieldid, value);
        rz.widgets.formHelpers.emit("data-changed", {fieldid: fieldid, value: value, src: "code"}, $this.sender);
    };

    this.getFormData = function (fieldsetRule) {
        return rz.widgets.formHelpers.getFormDataImpl($this,fieldsetRule);
    };

    this.setFormData = function(formData,fieldsetRule){
        rz.widgets.formHelpers.setFormDataImpl(formData,$this,fieldsetRule);
    };

    this.clearFormData = function (fieldsetRule) {
        rz.widgets.formHelpers.clearFormDataImpl($this,fieldsetRule);
    };

    this.validateForm = function(validationResultHandler,fieldsetRule,forceSuccess){
        rz.widgets.formHelpers.validateFormImpl($this,params,validationResultHandler,fieldsetRule,forceSuccess);
    };

    this.displayValidationReport = function(){
        rz.widgets.formHelpers.displayValidationReportImpl($this);
    };

    initialize();
};
/**
 * Created by anderson.santos on 17/06/2016.
 *
 * Parâmetros:
 * {
 *    type:"compare",
 *    model: "password",
 *    modelToCompare:"passwordConfirm",
 *    valueType:"text",
 *    operator:"==",
 *    message:"message"
 * }
 */
rz.widgets.formHelpers.createFormValidator("compare",function(sender,value,validationParams,validationHandler){
    var resolveType = function(v,tp){
        if(v===undefined || v==null) return v;
        switch (tp){
            case "number": return parseFloat(v);
            case "date":return new Date(v);
            case "text":return v.toString();
            default: return v;
        }
    };
    var callback = rz.helpers.ensureFunction(validationHandler);
    var operations = {};
    var op = validationParams.operator || "==";
    var tp = validationParams.valueType || "text";
    var vA = resolveType(value,tp);
    var vB = resolveType(sender.getValueOfModel(validationParams.modelToCompare),tp);

    operations["=="] = function (a, b) {return a==b};
    operations["==="] = function (a, b) {return a===b};
    operations["!="] = function (a, b) {return a!=b};
    operations["!=="] = function (a, b) {return a!==b};
    operations[">"] = function (a, b) {return a>b};
    operations[">="] = function (a, b) {return a>=b};
    operations["<"] = function (a, b) {return a<b};
    operations["<="] = function (a, b) {return a<=b};
    callback(operations[op](vA,vB));
});
/**
 * Created by anderson.santos on 09/06/2016.
 */
rz.widgets.formHelpers.createFormValidator("custom",function(sender,value,validationParams,validationHandler){
    var callback = rz.helpers.ensureFunction(validationHandler);
    if(validationParams.validationFunction !==undefined){
        validationParams.validationFunction(sender,value,callback,validationParams);

    }
    else{
        console.warn("validation function not defined. Validation bypassed");
        validationHandler(true);
    }
});
/**
 * Created by anderson.santos on 09/06/2016.
 */
rz.widgets.formHelpers.createFormValidator("range",function(sender,value,validationParams,validationHandler){
    var callback = rz.helpers.ensureFunction(validationHandler);
    /*{
        model: "Idade",
            type:"range",
        message:"A idade deve estar entre 18 e 35 anos",
        minValue:18,
        maxValue:35,
        valueType:"number"
    }*/
    if(validationParams.valueType=="number"){
        if(value==undefined || value=="" ||  value==null){
            callback(true);
        }
        else{
            var cVal = parseFloat(value);
            var vmin = (validationParams.minValue !==undefined)? cVal >= validationParams.minValue:true;
            var vmax = (validationParams.maxValue !==undefined)? cVal <= validationParams.maxValue:true;
            callback(vmin && vmax);
        }
    }

});
/**
 * Created by anderson.santos on 08/06/2016.
 */
rz.widgets.formHelpers.createFormValidator("regex",function(sender,value,validationParams,validationHandler){
    var validateEmptyValues = validationParams.validateEmptyValues == true;

    if(value==undefined || value==null || (value=="" && !validateEmptyValues)){
        validationHandler(true);
    }
    else{
        var result = value.toString().match(validationParams.regularExpression);
        validationHandler(result!=null && result.length!=0);
    }
});


/**
 * Created by anderson.santos on 08/06/2016.
 */
rz.widgets.formHelpers.createFormValidator("required",function(sender,value,validationParams,validationHandler){
    var allowEmpty = validationParams.allowEmpty == true;
    var callback = rz.helpers.ensureFunction(validationHandler);
    if(value==undefined || value==null || (value=="" && !allowEmpty)){
        callback(false,validationParams);
    }
    else{
        callback(true,validationParams);
    }
});
/**
 * Created by Anderson on 12/01/2016.
 */
rz.widgets.FormWidget = ruteZangada.widget("Form",rz.widgets.RZFormWidgetHelpers.FormWidgetInterface,rz.widgets.RZFormWidgetHelpers.FormWidgetEventHandlers,function () {
    var $this = this;
    this.validationReport = [];
    $this.lastFieldsetRules = undefined;
    this.initialize = function (params, initialized) {
        var renderer = params.renderer || "default";
        $this.renderer = new rz.widgets.FormRenderers[renderer](params, $this);

        $this.on("data-changed", function (sender, e) {
            updateValidationStatus();
        });

        initialized($this.renderer.params);
    };

    var updateValidationStatus = function(){
        if($this.isFormInvalid){
            $this.validateForm(undefined, $this.lastFieldsetRules);
        }
    };

    this.render = function (target, params) {
        $this.renderer.render(target, params);
    };

    this.fieldCount = function () {
        return $this.renderer.fieldCount();
    };

    this.getFieldIdAt = function (position) {
        return $this.renderer.getFieldIdAt(position);
    };

    this.addField = function (fielddata) {
        $this.renderer.addField(fielddata);
        rz.widgets.formHelpers.bindEventHandlersOfField(fielddata.type,fielddata.id,$this);
        rz.widgets.formHelpers.doPosRenderActionsOfField(fielddata.type,fielddata.id,$this);
        $this.raiseEvent("field-added",fielddata,$this);

    };

    this.insertField = function (fielddata, position) {
        $this.renderer.insertField(fielddata, position);
        rz.widgets.formHelpers.bindEventHandlersOfField(fielddata.type,fielddata.id,$this);
        rz.widgets.formHelpers.doPosRenderActionsOfField(fielddata.type,fielddata.id,$this);
    };

    this.removeFieldAt = function (position) {
        $this.renderer.removeFieldAt(position);
    };

    this.removeFieldById = function (fieldid) {
        $this.renderer.removeFieldById(fieldid);
    };

    this.getValueAt = function (position) {
        return $this.renderer.getValueAt(position);
    };

    this.getValueOf = function (fieldid) {
        return $this.renderer.getValueOf(fieldid);
    };

    this.setValueAt = function (position, value) {
        $this.renderer.setValueAt(position, value);
    };

    this.setValueOf = function (fieldid, value) {
        $this.renderer.setValueOf(fieldid, value);
    };

    this.getValueOfModel = function (model) {
         return $this.renderer.getValueOfModel(model);
    };

    this.setValueOfModel = function (model,value) {
        return $this.renderer.setValueOfModel(model,value);
    };

    this.getFormData = function (fieldsetRule) {
        return $this.renderer.getFormData(fieldsetRule);
    };
    
    this.setFormData = function(formData,fieldsetRule){
        $this.lastFieldsetRules = fieldsetRule;
        $this.renderer.setFormData(formData,fieldsetRule);
    };

    this.clearFormData = function (fieldsetRule,preserveValidationStatus) {
        if(!preserveValidationStatus){
            $this.renderer.validateForm(undefined,undefined,true);
        }
        $this.lastFieldsetRules = fieldsetRule;
        $this.renderer.clearFormData(fieldsetRule);
    };

    /**
     * validates de form data
     * @param {function } validationResultHandler - method invoked after validation
     * @fieldsetRule {object} optional - fieldset rules
     */
    this.validateForm = function(validationResultHandler,fieldsetRule){
        $this.lastFieldsetRules = fieldsetRule;
        $this.renderer.validateForm(validationResultHandler,fieldsetRule)
    }
});