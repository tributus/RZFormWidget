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
        "validateFieldOf",
        "getFieldParams",
        
        "getFieldValue"
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
    fieldPartRenderers:{},
    renderDataRows: function (sb, params, renderDataRow) {
        if (params.fields !== undefined) {
            params.fields.forEach(function (it, ix) {
                renderDataRow(sb, it, ix);
            });
        }
    },
    renderDataFieldByType: function (sb, field, containerID,sender) {
        this.fieldRenderers[field.type].render(sb, field, containerID,sender);
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
            var d = (typeof(data) === "object") ? "object-data:[" + btoa(JSON.stringify(data)) + "]" : data;
            return 'data-initial-value="*"'.replace("*",d);
        }
    },
    createFieldRenderer: function (n, d) {
        this.fieldRenderers[n] = d;
    },
    createFieldPartRenderer:function(n,d,t){
        var name = (t===undefined)? n: t+"."+n;
        this.fieldPartRenderers[name] = d;
    },
    getFieldPartRenderer: function(n,t){
        var name = (t===undefined)? n: t+"."+n;
        var renderer = this.fieldPartRenderers[name];
        if(renderer !==undefined){
            return renderer;
        }
        else{
            throw "Field part renderer \"*\" not found".replace("*",name);
        }
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
    getValueOfField: function (id,sender) {
        var fieldType = $(id).data("fieldtype");
        if(fieldType !== undefined && this.fieldRenderers[fieldType].getValue){
            return this.fieldRenderers[fieldType].getValue(id + "_" + fieldType,sender);
        }
        else{
            return undefined;
        }

    },
    setValueOfField: function (id, newValue,sender) {
        var fieldType = $(id).data("fieldtype");
        if(this.fieldRenderers[fieldType].setValue){
            this.fieldRenderers[fieldType].setValue(id + "_" + fieldType, newValue,sender);
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
    render: function (sb, field, containerID,sender) {
        field.widgetInstance = ruteZangada.renderWidget("rz-actions-bar", "actionsBar",field.params,function(renderData,eventArgs,callback){
            eventArgs.cancel = true;
            sb.append(renderData.data.toString());
            sender.sender.innerWidgetInitializeData.push(renderData);
            callback(eventArgs);
        });
    },
    bindEvents: function (id, emit, sender) {
        var fparams = rz.widgets.formHelpers.getFieldParams(id, sender.renderer.params.fields);
        fparams.widgetInstance.on("action-raised",function(s,e){
            emit(e.action, {field: id,targetElement: e,action:e.action,src: "usr"},sender);
            //emit("data-changed", {fieldid: id,value: value,src: "usr",text:text},sender);
        });
    },
    doPosRenderActions: function (id, $this) {}

});
/**
 * Created by anderson.santos on 06/07/2016.
 */

//Helpers
rz.widgets.formHelpers.getFieldParams = function (id, fieldDefinitions) {
    for (var i = 0; i < fieldDefinitions.length; i++) {
        var fieldDefinition = fieldDefinitions[i];
        if (fieldDefinition.fieldGroup) {
            var fieldDefinition = this.getFieldParams(id, fieldDefinition.fields);
            if (fieldDefinition !== undefined) return fieldDefinition;
        }
        else {
            if (fieldDefinition.id == id) {
                return fieldDefinition;
            }
        }
    }
};

rz.widgets.formHelpers.createFieldRenderer("collection", {
    getContentRenderer: function (params) {
        var itemsRenderer = rz.helpers.jsonUtils.getDataAtPath(params, "itemsSource.itemsRenderer");
        if (itemsRenderer == undefined) {
            itemsRenderer = {
                renderer: "default-list",
                rendererParams: {
                    editingText: "editing"
                }
            }
        }
        var contentRenderer = itemsRenderer.renderer;
        if (contentRenderer === undefined) {
            return rz.widgets.formHelpers.getFieldPartRenderer("default-list", "collection");
        }
        else {
            if (typeof(contentRenderer) == "string") {
                return rz.widgets.formHelpers.getFieldPartRenderer(contentRenderer, "collection");
            }
            else {
                return contentRenderer;
            }
        }
    },
    render: function (sb, field, containerID) {
        sb.appendFormat('<div class="{0}">', field.mainElementCss || "ui raised secondary segment");
        sb.appendFormat('   <div id="{0}_collection_container" class="ui {1} list collection-container">', containerID, field.collectionContainerCssClsss || "middle aligned divided");
        sb.appendFormat('   </div>');
        sb.appendFormat('</div>');
        return containerID + "_collection";
    },
    getValue: function (id) {
        var results = [];
        id = id.substring(0, id.lastIndexOf("_collection"));
        $(id + " .collection-dataitem").each(function (idx, item) {
            var data = $(item).data("value");
            results.push(JSON.parse(atob(data)));
        });
        return results;
    },
    setValue: function (fid, newValue, sender) {
        var newElementIDS = [];
        var id = fid.substring(0, fid.lastIndexOf("_collection"));
        /*particular for non input controls*/
        var fieldParams = rz.widgets.formHelpers.getFieldParams(id.replace("#", ""), sender.renderer.params.fields);
        var sb = new StringBuilder();
        var $this = this;
        var processAddValue = function (item) {
            var itemid = id.replace("#", "") + rz.helpers.generateRandomID();
            sb.appendFormat('       <div id="{1}" class="item collection-dataitem" data-value="{0}">',
                (item !== undefined && item !== null) ? btoa(JSON.stringify(item)) : item,
                itemid
            );
            newElementIDS.push(itemid);
            fieldParams.__uid = itemid;
            if (!fieldParams.itemActions.hideActionsMenu) {
                var actionsRenderer = fieldParams.itemActions.renderer || "default";
                if (typeof(actionsRenderer) == "string") {
                    actionsRenderer = rz.widgets.formHelpers.getFieldPartRenderer(actionsRenderer, "collection")
                }
                actionsRenderer(sb, fieldParams);
            }
            sb.appendFormat('           <div class="data-area content">');
            var contentRenderer = $this.getContentRenderer(fieldParams);
            contentRenderer(sb, fieldParams, item);
            sb.appendFormat('           </div>');
            sb.appendFormat('       </div>');
        };

        var clearCollectionData = function () {
            $(fid + "_collection_container").empty();
        };

        var initializeActionsDropdown = function () {
            setTimeout(function () {
                newElementIDS.forEach(function (item) {
                    var id = "#" + item + " .ui.dropdown";
                    $(id).dropdown({
                        action: "hide",
                        onChange: function (item) {
                            var $item = $("#" + item);
                            var action = $item.data("action");
                            var rowID = $item.data("rowid");
                            var fieldid = $item.data("targetfield");
                            var rowData = JSON.parse(atob($("#" + rowID).data("value")));
                            sender.raiseEvent("collection-request-change", {
                                action: action,
                                fieldid: fieldid,
                                rowid: rowID,
                                rowData: rowData
                            }, sender);
                        }
                    });

                });
                newElementIDS = [];
            }, 100);
        };

        if (newValue !== undefined && newValue != null && typeof(newValue) === "object" && newValue.length !== undefined) {
            newValue.forEach(function (item) {
                processAddValue(item);
            });
        }
        else if (newValue === undefined || newValue === null) {
            clearCollectionData();
        }
        else {
            processAddValue(newValue);
        }

        $(fid + "_collection_container").append(sb.toString());
        initializeActionsDropdown();

    },

    bindEvents: function (id, emit, sender) {
        var fieldParams = rz.widgets.formHelpers.getFieldParams(id, sender.renderer.params.fields);
        var source = rz.helpers.jsonUtils.getDataAtPath(fieldParams,"itemsSource.type") || "fieldset";
        var stateChangedHandler = fieldParams.stateChangedHandler || function(){};
        var fieldsets = {
            rule: 'restrict',
            fieldsets: fieldParams.itemsSource.source.split(' ')
        };

        sender.on(fieldParams.itemsSource.addToCollectiontrigger, function (sender) {
            if (source=="fieldset") {
                sender.validateForm(function (sender, result) {
                    if (result.validated) {
                        var newItem = sender.getFormData(fieldsets);
                        sender.clearFormData(fieldsets);
                        sender.setValueOf(id, newItem);
                        stateChangedHandler(sender,{state:"added",fieldParams:fieldParams});
                        //emit aqui ? ou lá?
                    }
                }, fieldsets);
            }
            else if(source=="xxxxxxxxxxx"){
                throw "NOT_IMPLEMENTED";
            }
        });
        
        sender.on(fieldParams.itemsSource.clearCollectionTrigger,function(sender){
            var confirmMethod = rz.helpers.jsonUtils.getDataAtPath(fieldParams,"itemsSource.confirmClearMethod");
            if(confirmMethod !==undefined){
                confirmMethod(sender,{params:fieldParams},function(confirm){
                    if(confirm){
                        sender.setValueOf(fieldParams.id,null,sender);
                        stateChangedHandler(sender,{state:"empty",fieldParams:fieldParams});
                    }
                });
            }
            else{
                sender.setValueOf(fieldParams.id,null,sender);
                stateChangedHandler(sender,{state:"empty",fieldParams:fieldParams});
            }
        });

        sender.on(fieldParams.itemsSource.updateCollectionTrigger,function(sender){
            if (source=="fieldset") {
                sender.validateForm(function (sender, result) {
                    if (result.validated) {
                        var newItem = sender.getFormData(fieldsets);
                        sender.clearFormData(fieldsets);
                        //sender.setValueOf(id, newItem);
                        var el = $("#" + fieldParams.id + " .edit-mode");
                        el.data("value",btoa(JSON.stringify(newItem)));
                        el.removeClass("edit-mode");
                        var contentRenderer = rz.widgets.formHelpers.fieldRenderers["collection"].getContentRenderer(fieldParams);
                        var sb = new StringBuilder();
                        contentRenderer(sb,fieldParams,newItem,"edit-mode");
                        el.find(".data-area").html(sb.toString());
                        stateChangedHandler(sender,{state:"edited",fieldParams:fieldParams});

                        //emit aqui ? ou lá?
                    }
                }, fieldsets);
            }
            else if(source=="xxxxxxxxxxx"){
                throw "NOT_IMPLEMENTED";
            }
        });
        
        sender.on(fieldParams.itemsSource.cancelUpdateCollectionTrigger,function(sender){
            if (source=="fieldset") {
                sender.clearFormData(fieldsets);
                var el = $("#" + fieldParams.id + " .edit-mode");
                el.removeClass("edit-mode");
                stateChangedHandler(sender,{state:"editCancel",fieldParams:fieldParams});
            }
            else if(source=="xxxxxxxxxxx"){
                throw "NOT_IMPLEMENTED";
            }
        });

        sender.on("collection-request-change", function (sender, e) {
            var fieldid = e.fieldid;
            var fieldParams = rz.widgets.formHelpers.getFieldParams(fieldid, sender.renderer.params.fields);
            var deleteRow = function () {

                $("#" + e.rowid).fadeOut("fast", function () {
                    $("#" + e.rowid).detach();
                    var count = $("#" + e.fieldid + " .collection-dataitem").length;
                    if(count > 0){
                        stateChangedHandler(sender,{state:"deleted",fieldParams:fieldParams});
                    }
                    else{
                        stateChangedHandler(sender,{state:"empty",fieldParams:fieldParams});
                    }
                });
                //todo emit (changed)
            };

            if (e.action == "edit-item") {
                if (fieldParams.itemsSource.type == "fieldset") {
                    $("#" + e.fieldid + " .collection-dataitem").removeClass("edit-mode");
                    $("#" + e.rowid).addClass("edit-mode");
                    sender.setFormData(e.rowData, {
                        rule: "restrict",
                        fieldsets: fieldParams.itemsSource.source.split(' ')
                    });
                    stateChangedHandler(sender,{state:"enterEditMode",fieldParams:fieldParams});
                }
                else { //if form
                    throw "not implemented yeeeeeet";
                }
            }
            else if (e.action == "remove-item") {
                var confirmMethod = rz.helpers.jsonUtils.getDataAtPath(fieldParams, "itemActions.confirmDeleteItemMethod");
                if (confirmMethod !== undefined) {
                    confirmMethod(sender, {fieldParams: fieldParams, originalEventArgs: e}, function (confirm) {
                        if (confirm) {
                            deleteRow();
                        }
                    });
                }
                else {
                    deleteRow();
                }
            }
        });
    },
    doPosRenderActions: function (id, $this) {
    }
});
rz.widgets.formHelpers.createFieldPartRenderer("default-actions", function (sb, params) {
    var ensureActions = function () {
        if (params.itemActions === undefined) params.itemActions = {};
        if (params.itemActions.actions === undefined) {
            params.itemActions.actions = [
                {name: "Delete item", action: "remove-item", icon: "delete"},
                {name: "Edit item", action: "edit-item", icon: "edit"}
            ]
        }
    };
    var title = rz.helpers.jsonUtils.getDataAtPath(params, "itemActions.properties.title") || "Actions";
    ensureActions();
    sb.appendFormat('<div class="right floated content">');
    sb.appendFormat('    <div class="ui icon top right pointing dropdown button">');
    sb.appendFormat('        <i class="ellipsis vertical icon"></i>');
    sb.appendFormat('        <div class="menu">');
    sb.appendFormat('            <div class="header">{0}</div>', title);
    var actindex = 0;
    params.itemActions.actions.forEach(function (action) {
        sb.appendFormat('            <div id="itemfor_{3}{5}" class="item" data-value="itemfor_{3}{5}" data-rowid="{3}" data-action="{1}" data-targetfield="{4}"><i class="{0} icon"></i> {2}</div>',
            action.icon,
            action.action,
            action.name,
            params.__uid,
            params.id,
            actindex++
        );
    });
    sb.appendFormat('        </div>');
    sb.appendFormat('    </div>');
    sb.appendFormat('</div>');
}, "collection");

rz.widgets.formHelpers.createFieldPartRenderer("default-list", function (sb, params, data) {
    var dmp = rz.helpers.jsonUtils.getDataAtPath(params, "itemsSource.displayMemberPath");
    var text = "";
    if (dmp !== undefined) {
        text = (data !== undefined) ? rz.helpers.jsonUtils.getDataAtPath(data, dmp) : "";
    }
    else {
        text = (data !== undefined) ? data.toString() : "";
    }
    sb.appendFormat('<div class="{0} collectionitem-edition-indicator">', rz.helpers.jsonUtils.getDataAtPath(params, 'itemsSource.itemsRenderer.rendererParams["editingLabelClass"]') || "ui red ribbon label");
    sb.appendFormat('  <i class="edit icon"></i> {0}', rz.helpers.jsonUtils.getDataAtPath(params, 'itemsSource.itemsRenderer.rendererParams["editingText"]') || "");
    sb.appendFormat('</div>');
    sb.appendFormat(text);
}, 'collection');

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
    this.render = function (target, params,createDomElement) {
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
        $this.sender.baseID = baseID;

        createDomElement({
            target: "#" + target,
            data:sb,
            method: "append",
            doAfterRenderAction:function(){
                rz.widgets.formHelpers.doPosRenderActions($this.sender);
                rz.widgets.formHelpers.bindEventHandlers($this.sender);
            }
        });
        $this.sender.innerWidgetInitializeData.forEach(function(data){
            if(data.doAfterRenderAction!==undefined) data.doAfterRenderAction();
        });
        $this.sender.innerWidgetInitializeData = [];

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
            if(field.horizontal !==undefined){
                h = field.horizontal;
            }
            field.type = field.type || "text";
            field.id = "*_*".replace("*", $this.target).replace("*",fieldID);
            sb.appendFormat('<div id="{0}" data-fieldtype="{1}" data-model="{2}" {3} class="form-row {4}{5}{6} {7}">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field),
                (h)? "inline fields field":"field",
                (field.wide !==undefined)? " " + field.wide + " wide":"",
                rz.widgets.formHelpers.resolveFieldSet(field),
                field.containerCssClass || ""

            );
            var inputID = $this.target + "_" + fieldID + "_" + field.type;
            if(h) sb.appendFormat('<div class="sixteen wide field">');

            if(field.label !==undefined || field.preserveLabelOffset){
                sb.appendFormat('<label for="{1}" class="{2} {3}">{0}</label>',
                    field.label || "&nbsp;",
                    inputID,
                    "control-label",
                    field.labelCssClass || ""
                );
            }

            rz.widgets.formHelpers.renderDataFieldByType(sb, field, inputID, $this);
            if(h) {
                sb.appendFormat('</div>');
            }
            sb.append('</div>');
        }
    };

    // this.fieldCount = function () {
    //     return $("#" + $this.target + "base_form .form-row").length;
    // };

    // this.getFieldIdAt = function (position) {
    //     var p = position;
    //     if (p >= 0 && p < this.fieldCount()) {
    //         return $("#" + $this.target + "base_form .form-row").eq(p).attr("id");
    //     }
    //     else {
    //         return undefined;
    //     }
    // };

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
                rz.widgets.formHelpers.setValueOfField("#" + id, value,$this.sender);
                rz.widgets.formHelpers.emit("data-changed", {fieldid: id, value: value, src: "code"}, $this.sender);
            }
        }
    };

    this.setValueOf = function (fieldid, value) {
        if(fieldid !==undefined){
            if (!fieldid.startsWith($this.target + "_")) {
                fieldid = $this.target + "_" + fieldid;
            }
            var formerValue = rz.widgets.formHelpers.getValueOfField("#" + fieldid);
            if (formerValue != value) {
                rz.widgets.formHelpers.setValueOfField("#" + fieldid, value,$this.sender);
                rz.widgets.formHelpers.emit("data-changed", {fieldid: fieldid, value: value, src: "code"}, $this.sender);
            }
        }
    };

    this.getFormData = function (fieldsetRule) {
        return rz.widgets.formHelpers.getFormDataImpl($this,fieldsetRule);
    };

    this.setFormData = function(formData,fieldsetRule){
        rz.widgets.formHelpers.setFormDataImpl(formData,$this,fieldsetRule,$this);
    };

    this.clearFormData = function (fieldsetRule) {
        rz.widgets.formHelpers.clearFormDataImpl($this,fieldsetRule,$this.sender);
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
 * Created by Anderson on 12/01/2016.
 * Widget Grid Row Renderer
 */
rz.widgets.FormRenderers["grid-row"] = function (params, sender) {
    var $this = this;
    var initialize = function () {
        $this.params = params;
        $this.sender = sender;
    };

    this.render = function (target, params,createDomElement) {
        $this.target = target;
        var sb = new StringBuilder();
        sb.appendFormat('    <tr id="{0}base_form">', target);
        rz.widgets.formHelpers.renderDataRows(sb, params, renderDataField);

        sb.appendFormat('    </tr>');

        createDomElement({
            target: "#" + target,
            data:sb,
            method: "append",
            doAfterRenderAction:function(){
                rz.widgets.formHelpers.doPosRenderActions($this.sender);
                rz.widgets.formHelpers.bindEventHandlers($this.sender);
            }
        });
        $this.sender.innerWidgetInitializeData.forEach(function(data){
            if(data.doAfterRenderAction!==undefined) data.doAfterRenderAction();
        });
        $this.sender.innerWidgetInitializeData = [];
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

            sb.appendFormat('<td id="{0}" data-fieldtype="{1}" data-model="{2}" data-initial-value="{3}" class="row-form-field field{4} {5}">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field),
                rz.widgets.formHelpers.resolveFieldSet(field),
                field.containerCssClass || ""
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

    //*****************************REFATORAÇÃO DO PADRÃO 1: override de campos comuns (todo fazer isto para os outros casos (e renderers)
    // this.getfieldIdOfModel = function(model){
    //     return $("#" + $this.target + "base_form .field[data-model='"+model+"']").attr("id");
    //
    // };
    //
    // this.getValueOfModel = function (model) {
    //     return $this.getValueOf($this.getfieldIdOfModel(model));
    // };

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
            rz.widgets.formHelpers.setValueOfField("#" + id, value,$this.sender);
            rz.widgets.formHelpers.emit("data-changed", {fieldid: id, value: value, src: "code"}, $this.sender);
        }
    };

    this.setValueOf = function (fieldid, value) {
        if(fieldid !==undefined){
            if (!fieldid.startsWith($this.target + "_")) {
                fieldid = $this.target + "_" + fieldid;
            }
            rz.widgets.formHelpers.setValueOfField("#" + fieldid, value,$this.sender);
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

    this.render = function (target, params,createDomElement) {
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


        createDomElement({
            target: "#" + target,
            data:sb,
            method: "append",
            doAfterRenderAction:function(){
                rz.widgets.formHelpers.doPosRenderActions($this.sender);
                rz.widgets.formHelpers.bindEventHandlers($this.sender);
                bindCollapseButtonEvents();
            }
        });
        $this.sender.innerWidgetInitializeData.forEach(function(data){
            if(data.doAfterRenderAction!==undefined) data.doAfterRenderAction();
        });
        $this.sender.innerWidgetInitializeData = [];

        // $("#" + target).append(sb.toString());
        // rz.widgets.formHelpers.doPosRenderActions($this.sender);
        // rz.widgets.formHelpers.bindEventHandlers($this.sender);
        // bindCollapseButtonEvents();
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

            sb.appendFormat('<tr id="{0}" data-fieldtype="{1}" data-model="{2}" {3} {4} class="field field-row{5} {6}">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field),
                gidata || "",
                rz.widgets.formHelpers.resolveFieldSet(field),
                field.containerCssClass || ""
            );
            var inputID = $this.target + "_" + fieldID + "_" + field.type;
            sb.appendFormat('<td><label for="{1}" class="{2}">{0}</label></td>', field.label||"&nbsp;", inputID,field.labelCssClass||"");
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
    this.getfieldIdOfModel = function(model){
        return $("#" + $this.target + "base_form .field[data-model='"+model+"']").attr("id");
    };
    this.getValueOfModel = function (model) {
        return $this.getValueOf($this.getfieldIdOfModel(model));
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
        if(fieldid !==undefined){
            if (!fieldid.startsWith($this.target + "_")) {
                fieldid = $this.target + "_" + fieldid;
            }
            rz.widgets.formHelpers.setValueOfField("#" + fieldid, value,$this.sender);
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
 * FormWidget.js
 */
rz.widgets.FormWidget = ruteZangada.widget("Form", rz.widgets.RZFormWidgetHelpers.FormWidgetInterface, rz.widgets.RZFormWidgetHelpers.FormWidgetEventHandlers, function () {
    var $this = this;
    this.validationReport = [];
    this.innerWidgetInitializeData = [];
    $this.lastFieldsetRules = undefined;
    this.initialize = function (params, initialized) {
        var renderer = params.renderer || "default";
        $this.renderer = new rz.widgets.FormRenderers[renderer](params, $this);

        $this.on("data-changed", function (sender, e) {
            updateValidationStatus();
        });

        initialized($this.renderer.params);
    };

    this.render = function (target, params, createDomElement) {
        $this.renderer.render(target, params, createDomElement);
    };

    var updateValidationStatus = function () {
        if ($this.isFormInvalid) {
            $this.validateForm(undefined, $this.lastFieldsetRules);
        }
    };

    var impl = {
            getValueOfModel: function (model) {
                return $this.getValueOf($this.getfieldIdOfModel(model));
            },
            getfieldIdOfModel: function (model) {
                return $("#" + $this.renderer.target + "base_form .field[data-model='" + model + "']").attr("id");
            },
            fieldCount: function () {
                return $("#" + $this.renderer.target + "base_form .form-row").length;
            },
            getFieldIdAt: function (position) {
                var p = position;
                if (p >= 0 && p < $this.fieldCount()) {
                    return $("#" + $this.renderer.target + "base_form .form-row").eq(p).attr("id");
                }
                else {
                    return undefined;
                }
            }
        };

    var ensureHandler = function (n) {
        return $this.renderer[n] || impl[n];
    };

    this.fieldCount = function () {
        return ensureHandler("fieldCount")();
    };

    this.getFieldIdAt = function (position) {
        return ensureHandler("getFieldIdAt")(position);
    };

    this.addField = function (fielddata) {
        $this.renderer.addField(fielddata);
        rz.widgets.formHelpers.bindEventHandlersOfField(fielddata.type, fielddata.id, $this);
        rz.widgets.formHelpers.doPosRenderActionsOfField(fielddata.type, fielddata.id, $this);
        $this.raiseEvent("field-added", fielddata, $this);

    };

    this.insertField = function (fielddata, position) {
        $this.renderer.insertField(fielddata, position);
        rz.widgets.formHelpers.bindEventHandlersOfField(fielddata.type, fielddata.id, $this);
        rz.widgets.formHelpers.doPosRenderActionsOfField(fielddata.type, fielddata.id, $this);
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

    /**
     * get a fieldid of field model(refatorado padrão 1)
     * @param model
     */
    this.getfieldIdOfModel = function (model) {
        return ensureHandler("getfieldIdOfModel")(model);
    };

    /**
     * get value of model (refatorado padrão 1)
     * @param model
     */
    this.getValueOfModel = function (model) {
        return ensureHandler("getValueOfModel")(model);
    };

    this.setValueOfModel = function (model, value) {
        return $this.renderer.setValueOfModel(model, value);
    };

    this.getFormData = function (fieldsetRule) {
        return $this.renderer.getFormData(fieldsetRule);
    };

    this.setFormData = function (formData, fieldsetRule) {
        $this.lastFieldsetRules = fieldsetRule;
        $this.renderer.setFormData(formData, fieldsetRule);
    };

    this.clearFormData = function (fieldsetRule, preserveValidationStatus) {
        if (!preserveValidationStatus) {
            $this.renderer.validateForm(undefined, undefined, true);
        }
        $this.lastFieldsetRules = fieldsetRule;
        $this.renderer.clearFormData(fieldsetRule);
    };

    this.validateForm = function (validationResultHandler, fieldsetRule) {
        $this.lastFieldsetRules = fieldsetRule;
        $this.renderer.validateForm(validationResultHandler, fieldsetRule)
    };

    this.getFieldParams = function (filterValue, filterBy) {
        //filterBy = id,model,position
        var handler = $this.renderer.getFieldParams;
        if (handler !== undefined) {
            return handler(filterValue, filterBy);
        }
        else {
            //defaultHandler
            var fieldid = undefined;
            if (filterBy === undefined) filterBy = "model";
            if (filterBy == "id") {
                if (!filterValue.startsWith($this.renderer.target + "_")) {
                    fieldid = $this.renderer.target + "_" + filterValue;
                }
                else {
                    fieldid = filterValue;
                }
            }
            else if (filterBy == "position") {
                fieldid = $this.renderer.getFieldIdAt(parseInt(filterValue));
            }
            else {
                fieldid = $this.renderer.getfieldIdOfModel(filterValue);
            }
            //return $this.renderer.getFieldParams(filterValue,filterBy);
            return rz.widgets.formHelpers.getFieldParams(fieldid, $this.renderer.params.fields);
        }

    };

    /***************************************************************************************************************/

    /***
     * gets the field value
     * @param filterValue field name
     * @param filterBy [optional] the filter type (id, position ou model); The default value is model
     * @returns {*}
     */
    this.getFieldValue = function (field, filterBy) {
        if (filterBy == "id") {
            return this.getValueOf(field);
        }
        else if (filterBy == "position") {
            return this.getValueAt(parseInt(field));
        }
        else {
            return this.getValueOfModel(field);
        }
    };

    this.setFieldValue = function (field, value, filterBy) {
        if (filterBy == "id") {
            return this.setValueOf(field, value);
        }
        else if (filterBy == "position") {
            return this.setValueAt(parseInt(field), value);
        }
        else {
            return this.setValueOfModel(field, value);
        }
    }


});