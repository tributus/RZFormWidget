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
        rz.widgets.formHelpers.setValueOfField("#" + fieldid, value,$this.sender);
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