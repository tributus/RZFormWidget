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

    this.getAllFieldDefinitions = function(){
        var fieldList = [];
        var traverseFields = function(fields){
            fields.forEach(function(f){
                if(f.fieldGroup){
                        traverseFields(f.fields);
                }
                else{
                    fieldList.push(f);
                }
            });
        };
        traverseFields($this.renderer.params.fields);
        return fieldList;
    };
    this.getAllGroupDefinitions = function(){
        var fieldList = [];
        var traverseFields = function(fields){
            fields.forEach(function(f){
                if(f.fieldGroup){
                    fieldList.push(f);
                    traverseFields(f.fields);
                }
            });
        };
        traverseFields($this.renderer.params.fields);
        return fieldList;
    };


    var ensureHandler = function (n) {
        return $this.renderer[n] || impl[n];
    };

    var impl = {
        resolveRuleset:function(fieldsetRule){
            if(fieldsetRule===undefined){
                return undefined;
            }
            else{
                if(typeof(fieldsetRule)=="object")
                {
                    return fieldsetRule;
                }
                else{
                    return {
                        rule:"restrict",
                        fieldsets: fieldsetRule.split(' ')
                    };
                }
            }

        },
        getValueOfModel:function (model) {
            return $this.getValueOf($this.getfieldIdOfModel(model));
        },
        getfieldIdOfModel:function (model) {
            return $("#" + $this.renderer.target + "base_form .field[data-model='" + model + "']").attr("id");
        },
        fieldCount:function () {
            return $("#" + $this.renderer.target + "base_form .form-row").length;
        },
        getFieldIdAt:function (position) {
            var p = position;
            if (p >= 0 && p < $this.fieldCount()) {
                return $("#" + $this.renderer.target + "base_form .form-row").eq(p).attr("id");
            }
            else {
                return undefined;
            }
        },
        addField:function (fielddata) {
            var sb = new StringBuilder();
            $this.renderer.renderDataField(sb, fielddata);
            $("#" + $this.renderer.target + "base_form .form-row").last().parent().append(sb.toString());
        },
        insertField:function (fielddata, position) {
            var sb = new StringBuilder();
            $this.renderer.renderDataField(sb, fielddata);
            $("#" + $this.renderer.target + "base_form .form-row").eq(position).before(sb.toString());
        },
        removeFieldAt:function (position) {
            var p = position;
            if (p >= 0 && p < $this.fieldCount()) {
                $("#" + $this.renderer.target + "base_form .form-row").eq(p).remove();
            }
        },
        removeFieldById:function (fieldid) {
            if (!fieldid.startsWith($this.renderer.target + "_")) {
                fieldid = $this.renderer.target + "_" + fieldid;
            }
            $("#" + fieldid).remove();
        },
        getValueAt:function (position) {
            var p = position;
            if (p >= 0 && p < $this.fieldCount()) {
                var id = $("#" + $this.renderer.target + "base_form .form-row").eq(p).attr("id");
                return rz.widgets.formHelpers.getValueOfField("#" + id);
            }
        },
        getValueOf:function (fieldid) {
            if (!fieldid.startsWith($this.renderer.target + "_")) {
                fieldid = $this.renderer.target + "_" + fieldid;
            }
            return rz.widgets.formHelpers.getValueOfField("#" + fieldid);
        },
        setValueOf:function (fieldid, value,behaviors) {
            var bh = behaviors ||{bypassEventHandling:false};
            if (fieldid !== undefined) {
                if (!fieldid.startsWith($this.renderer.target + "_")) {
                    fieldid = $this.renderer.target + "_" + fieldid;
                }
                rz.widgets.formHelpers.setValueOfField("#" + fieldid, value, $this);
                if(!bh.bypassEventHandling){
                    rz.widgets.formHelpers.emit("data-changed", {fieldid: fieldid,value: value,src: "code"}, $this);
                }
            }
        },
        setValueOfModel:function (model, value) {
            return $this.setValueOf($this.getfieldIdOfModel(model), value);
        },
        setValueAt:function (position, value) {
            var p = position;
            if (p >= 0 && p < $this.fieldCount()) {
                var id = $("#" + $this.renderer.target + "base_form .form-row").eq(p).attr("id");
                var formerValue = rz.widgets.formHelpers.getValueOfField("#" + id);
                if (formerValue != value) {
                    rz.widgets.formHelpers.setValueOfField("#" + id, value, $this);
                    rz.widgets.formHelpers.emit("data-changed", {fieldid: id, value: value, src: "code"}, $this);
                }
            }
        },
        getFormData:function (fieldsetRule,getFromHiddenFields) {
            return rz.widgets.formHelpers.getFormDataImpl($this.renderer, fieldsetRule,getFromHiddenFields);
        },
        setFormData:function (formData, fieldsetRule) {
            rz.widgets.formHelpers.setFormDataImpl(formData, $this.renderer, fieldsetRule);
        },
        clearFormData:function (fieldsetRule) {
            rz.widgets.formHelpers.clearFormDataImpl($this.renderer, fieldsetRule);
        },
        validateForm:function (validationResultHandler, fieldsetRule, forceSuccess,validateHiddenFields) {
            rz.widgets.formHelpers.validateFormImpl($this.renderer, $this.renderer.params, validationResultHandler, fieldsetRule, forceSuccess,validateHiddenFields);
        },
        getFieldParams:function (filterValue, filterBy) {
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
                fieldid = $this.getFieldIdAt(parseInt(filterValue));
            }
            else {
                fieldid = $this.getfieldIdOfModel(filterValue);
            }
            return rz.widgets.formHelpers.getFieldParams(fieldid, $this.renderer.params.fields);
        },
        getFieldValue:function (field, filterBy) {
            if (filterBy == "id") {
                return $this.getValueOf(field);
            }
            else if (filterBy == "position") {
                return $this.getValueAt(parseInt(field));
            }
            else {
                return $this.getValueOfModel(field);
            }
        },
        setFieldValue:function (field, value, filterBy) {
            if (filterBy == "id") {
                return $this.setValueOf(field, value);
            }
            else if (filterBy == "position") {
                return $this.setValueAt(parseInt(field), value);
            }
            else {
                return $this.setValueOfModel(field, value);
            }
        },
        getGroupDefinition:function(groupName){
            if($this.renderer.params.fields !==undefined){
                var groupRef = undefined;
                var traverseFields = function(fields){
                    fields.every(function(f){
                        if(f.fieldGroup){
                            if(f.groupName==groupName){
                                groupRef = f;
                                return false;
                            }
                            else{
                                traverseFields(f.fields);
                            }
                        }
                        return true;
                    });
                    return groupRef;
                }
            }
            else{
                return undefined;
            }
            return traverseFields($this.renderer.params.fields);
        },
        getFieldsOfGroup:function(group){
            var result = [];
            var groupRef =  (typeof(group)=="string") ? $this.getGroupDefinition(group):group;
            var traverse = function(g){
                g.fields.forEach(function(f){
                    if(f.fieldGroup){
                        traverse(f);
                    }
                    else{
                        result.push(f);
                    }
                });
            };

            if(groupRef !==undefined){
                traverse(groupRef);
            }
            return result;
        },        
        getFieldsOfRuleset:function(fieldsetRule){
            var fields = [];
            var rcount = $this.fieldCount();
            for (var i = 0; i < rcount; i++) {
                var id = $this.getFieldIdAt(i);
                if((fieldsetRule!==undefined && rz.widgets.formHelpers.fieldMatchFieldSetRule(id,fieldsetRule)) || fieldsetRule===undefined){
                    var originalid = id.replace($this.renderer.target + "_","");
                    fields.push($this.getFieldParams(originalid,"id"));
                }
            }
            return fields;
        },
        getFieldDefinitions:function(filterValue,filterBy){
            var fields = [];
            if(filterValue===undefined){
                fields = $this.getAllFieldDefinitions();
            }
            else{
                switch(filterBy || "model"){
                    case "id":
                    case "position":
                    case "model":
                        var f = $this.getFieldParams(filterValue,filterBy);
                        if(f !==undefined) fields.push(f);
                        break;
                    case "fieldset":
                        fields = $this.getFieldsOfRuleset(filterValue);
                        break;
                    case "group":
                        fields = $this.getFieldsOfGroup(filterValue);
                        break;
                    break
                }
            }
            return fields;
        },
        disableFields:function(filterValue,filterBy){
            var fields = $this.getFieldDefinitions(filterValue,filterBy);
            if(fields.length > 0){
                fields.forEach(function(field){
                    $("#" + field.id).addClass("disabled");
                    rz.widgets.formHelpers.executeFieldAction("disable",field.id,$this,undefined,field);
                });
            }
        },
        enableFields:function(filterValue,filterBy){
            var fields = $this.getFieldDefinitions(filterValue,filterBy);
            if(fields.length > 0){
                fields.forEach(function(field){
                    $("#" + field.id).removeClass("disabled");
                    rz.widgets.formHelpers.executeFieldAction("enable",field.id,$this,undefined,field);
                });
            }
        },
        hideFields:function(filterValue,filterBy,preserveGroupVisibility){
            var fields = $this.getFieldDefinitions(filterValue,filterBy);
            if(fields.length > 0){
                fields.forEach(function(field){
                    var el = $("#" + field.id);
                    el.css("display","none");
                    el.data("ishidden","true");
                    rz.widgets.formHelpers.executeFieldAction("hide",field.id,$this,undefined,field);
                });
                if(filterBy=="group" && !preserveGroupVisibility){
                    $this.renderer.hideFieldGroup($this.getGroupDefinition(filterValue));
                }
            }
        },
        displayFields:function(filterValue,filterBy){
            var fields = $this.getFieldDefinitions(filterValue,filterBy);
            if(fields.length > 0){
                fields.forEach(function(field){
                    var el = $("#" + field.id);
                    el.css("display","");
                    el.data("ishidden","false");
                    rz.widgets.formHelpers.executeFieldAction("display",field.id,$this,undefined,field);
                });
                if(filterBy=="group"){
                    $this.renderer.showFieldGroup($this.getGroupDefinition(filterValue));
                }
            }
        },
        activateGroup:function(name){
            console.warn("not implemented for this renderer");
        },
        deactivateGroup:function(name){
            console.warn("not implemented for this renderer");
        },
        getGroupInfo:function(name){
            var defs = $this.getAllGroupDefinitions();
            var groupDefinition = defs.find(function(d){
                return d.groupName==name;
            });

            return groupDefinition;

        }
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
        return ensureHandler("getValueOf")(fieldid);
    };

    this.setValueAt = function (position, value) {
        ensureHandler("setValueAt")(position, value);
    };

    this.setValueOf = function (fieldid, value,behaviors) {
        ensureHandler("setValueOf")(fieldid, value,behaviors);
    };

    this.getfieldIdOfModel = function (model) {
        return ensureHandler("getfieldIdOfModel")(model);
    };

    this.getValueOfModel = function (model) {
        return ensureHandler("getValueOfModel")(model);
    };

    this.setValueOfModel = function (model, value) {
        return ensureHandler("setValueOfModel")(model, value);
    };

    this.getFormData = function (fieldsetRule,getFromHiddenFields) {
        return ensureHandler("getFormData")(impl.resolveRuleset(fieldsetRule),getFromHiddenFields);
    };

    this.setFormData = function (formData, fieldsetRule) {
        $this.lastFieldsetRules = impl.resolveRuleset(fieldsetRule);
        ensureHandler("setFormData")(formData, $this.lastFieldsetRules);
    };

    this.clearFormData = function (fieldsetRule, preserveValidationStatus) {
        if (!preserveValidationStatus) {
            ensureHandler("validateForm")(undefined, undefined, true);
        }
        $this.lastFieldsetRules = impl.resolveRuleset(fieldsetRule);
        ensureHandler("clearFormData")($this.lastFieldsetRules);
    };

    this.validateForm = function (validationResultHandler, fieldsetRule,validateHiddenFields) {
        $this.lastFieldsetRules = impl.resolveRuleset(fieldsetRule);
        ensureHandler("validateForm")(validationResultHandler, $this.lastFieldsetRules,false,validateHiddenFields);
    };

    this.getFieldParams = function (filterValue, filterBy) {
        return ensureHandler("getFieldParams")(filterValue, filterBy);
    };

    this.getFieldValue = function (field, filterBy) {
        return ensureHandler("getFieldValue")(field, filterBy);
    };

    this.setFieldValue = function (field, value, filterBy) {
        return ensureHandler("setFieldValue")(field, value, filterBy);
    };

    this.getGroupDefinition = function(groupName){
        return ensureHandler("getGroupDefinition")(groupName);
    };

    this.getFieldsOfGroup = function(groupName){
        return ensureHandler("getFieldsOfGroup")(groupName);
    };

    this.getFieldDefinitions = function(filterValue,filterBy){
        return ensureHandler("getFieldDefinitions")(filterValue,filterBy);
    };

    this.getFieldsOfRuleset = function(fieldsetRule){
        return ensureHandler("getFieldsOfRuleset")(impl.resolveRuleset(fieldsetRule));
    };

    this.disableFields = function(filterValue,filterBy){
        ensureHandler("disableFields")(filterValue,filterBy);
    };

    this.enableFields = function(filterValue,filterBy){
        ensureHandler("enableFields")(filterValue,filterBy);
    };

    this.hideFields = function(filterValue,filterBy,preserveGroupVisibility){
        ensureHandler("hideFields")(filterValue,filterBy,preserveGroupVisibility);
    };

    this.displayFields = function(filterValue,filterBy){
        ensureHandler("displayFields")(filterValue,filterBy);
    };
    
    this.getGroupInfo = function(name){
        return ensureHandler("getGroupInfo")(name);
    };

    this.activateGroup = function(name){
        ensureHandler("activateGroup")(name);
    };
    
    this.deactivateGroup = function(name){
        ensureHandler("deactivateGroup")(name);
    }

});