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

            sb.appendFormat('<td id="{0}" data-fieldtype="{1}" data-model="{2}" data-initial-value="{3}" class="row-form-field field{4}">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field),
                rz.widgets.formHelpers.resolveFieldSet(field)
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