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
        },
        addField: function (fielddata) {
            var sb = new StringBuilder();
            $this.renderer.renderDataField(sb, fielddata);
            $("#" + $this.renderer.target + "base_form .form-row").last().parent().append(sb.toString());
        },
        insertField: function (fielddata, position) {
            var sb = new StringBuilder();
            $this.renderer.renderDataField(sb, fielddata);
            $("#" + $this.renderer.target + "base_form .form-row").eq(position).before(sb.toString());
        },
        removeFieldAt: function (position) {
            var p = position;
            if (p >= 0 && p < $this.fieldCount()) {
                $("#" + $this.renderer.target + "base_form .form-row").eq(p).remove();
            }
        },
        removeFieldById: function (fieldid) {
            if (!fieldid.startsWith($this.renderer.target + "_")) {
                fieldid = $this.renderer.target + "_" + fieldid;
            }
            $("#" + fieldid).remove();
        },
        getValueAt: function (position) {
            var p = position;
            if (p >= 0 && p < $this.fieldCount()) {
                var id = $("#" + $this.renderer.target + "base_form .form-row").eq(p).attr("id");
                return rz.widgets.formHelpers.getValueOfField("#" + id);
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
        ensureHandler("addField")(fielddata);
        rz.widgets.formHelpers.bindEventHandlersOfField(fielddata.type, fielddata.id, $this);
        rz.widgets.formHelpers.doPosRenderActionsOfField(fielddata.type, fielddata.id, $this);
        $this.raiseEvent("field-added", fielddata, $this);
    };

    this.insertField = function (fielddata, position) {
        ensureHandler("insertField")(fielddata, position);
        rz.widgets.formHelpers.bindEventHandlersOfField(fielddata.type, fielddata.id, $this);
        rz.widgets.formHelpers.doPosRenderActionsOfField(fielddata.type, fielddata.id, $this);
    };

    this.removeFieldAt = function (position) {
        ensureHandler("removeFieldAt")(position);
    };

    this.removeFieldById = function (fieldid) {
        ensureHandler("removeFieldById")(fieldid);
    };

    this.getValueAt = function (position) {
        return ensureHandler("getValueAt")(position);
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