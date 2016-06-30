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
        return (field.model !== undefined && field.model.match(/^[a-zA-Z]+[0-9]*(\.[a-zA-Z]+[0-9]*)*$/) != null) ? field.model : generatedID + "_data";
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
        return this.fieldRenderers[fieldType].getValue(id + "_" + fieldType);
    },
    setValueOfField: function (id, newValue) {
        var fieldType = $(id).data("fieldtype");
        this.fieldRenderers[fieldType].setValue(id + "_" + fieldType, newValue);
    },
    emit: function (n, d, sender) {
        var handlers = sender.getEventHandlers();
        if (handlers[n] !== undefined && handlers[n].length > 0) {
            handlers[n].forEach(function (it) {
                it(sender, d);
            });
        }
    },
    validateFormImpl: function ($this, params, validationResultHandler) {
        validationResultHandler = rz.helpers.ensureFunction(validationResultHandler);
        var formData = $this.sender.getFormData();
        //ao final: if(validationResultHandler !==undefined) validationResultHandler(sender,{result:false, errors:[...]})
        if (params.validation.enabled) {
            $this.sender.validationReport = [];
            params.validation.rules.forEach(function (rule) {
                rz.widgets.formHelpers.validateField(rule.type, $this.sender, formData[rule.model], rule, function (result, params) {
                    if (!result) {
                        $this.sender.validationReport.push({failedRule: rule});
                    }
                });
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
    getFormDataImpl: function ($this) {
        var root = {};
        var rcount = $this.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var model = $("#" + id).data("model");
            rz.helpers.jsonUtils.setDataAtPath(root, $this.getValueOf(id), model)
        }
        return root;
    },
    setFormDataImpl: function (formData, $this) {
        var rcount = $this.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var model = $("#" + id).data("model");
            var value = rz.helpers.jsonUtils.getDataAtPath(formData, model);
            $this.setValueOfModel(model, value);
        }
    }

};