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
            throw "Fiel part renderer \"*\" not found".replace("*",name);
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