/**
 * Created by Anderson on 12/01/2016.
 */
rz.widgets.FormRenderers = {};
/**
 * Created by Anderson on 12/01/2016.
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
        "getFormData",
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
 * Created by Anderson on 12/01/2016.
 */
rz.widgets.FormRenderers["default"] = function (params, sender) {
    var $this = this;
    var initialize = function () {
        //set defaults
        if (params === undefined) params = {};
        params.horizontal = params.horizontal || false;
        params.formLabelSizeClass = params.formLabelSizeClass || "col-sm-2";
        params.formValueSizeClass = params.formValueSizeClass || "col-sm-10";
        $this.params = params;
        $this.sender = sender;
    };

    this.render = function (target, params) {
        $this.params = params;
        $this.target = target;
        var sb = new StringBuilder();
        sb.append('<div class="form-widget">');
        sb.appendFormat('  <form id="{0}base_form" class="{1}">', target, (params.horizontal) ? "form-horizontal" : "");
        var hasTabs = isElegibleFormTabPanel();
        if (hasTabs) {
            renderTabPanels(sb);
            sb.append('<div class="tab-content">');
        }

        rz.widgets.formHelpers.renderDataRows(sb, params, renderDataField);
        if (hasTabs) {
            sb.append('</div>');
        }
        sb.append('  </form>');
        sb.append('</div>');
        $("#" + target).append(sb.toString());
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
        sb.appendFormat('<ul class="nav nav-tabs" role="tablist">');
        $this.params.fields.forEach(function (it, id) {
            var targetID = generateRandomID(12);
            sb.appendFormat('<li role="presentation" class="{2}"><a href="#{1}" aria-controls="{1}" role="tab" data-toggle="tab">{0}</a></li>'
                , it.groupLabel
                , targetID
                , (id == actidx) ? "active" : "");
            it.groupID = targetID;
            it.active = (id == actidx);
        });
        sb.appendFormat('</ul>');
    };

    var renderCollapseContainer = function (sb, fieldID, field) {
        sb.appendFormat('<div class="panel-group col-sm-offset-2" role="tablist">');
        sb.appendFormat('	<div class="panel panel-default">');
        sb.appendFormat('		<div class="panel-heading" role="tab" id="{0}_clgh">', fieldID);
        sb.appendFormat('			<h4 class="panel-title">');
        sb.appendFormat('				<a class="{2}" role="button" data-toggle="collapse" href="#{0}_clg" aria-expanded="{3}" aria-controls="{0}_clg"> {1} </a>',

            fieldID,
            field.groupLabel || "",
            (field.collapsed) ? "collapsed" : "",
            !!field.collapsed);
        sb.appendFormat('			</h4>');
        sb.appendFormat('		</div>');
        sb.appendFormat('		<div id="{0}_clg" class="panel-collapse collapse {2}" role="tabpanel" aria-labelledby="{0}_clgh" aria-expanded="{1}">',
            fieldID,
            !!field.collapsed,
            (field.collapsed) ? "" : "in");

        field.fields.forEach(function (it) {
            renderDataField(sb, it);
        });

        sb.appendFormat('		</div>');
        sb.appendFormat('	</div>');
        sb.appendFormat('</div>');
    };

    var renderTabContainer = function (sb, field) {
        sb.appendFormat('<div id="{0}" role="tabpanel" class="tab-pane fade {1}">',
            field.groupID,
            (field.active) ? "in active" : ""
        );
        field.fields.forEach(function (it) {
            renderDataField(sb, it);
        });
        sb.appendFormat('</div>');
    };

    var renderDataField = function (sb, field) {
        var fieldID = (field.id || field.model || "field_" + generateRandomID(8)).replace(/\./g, "_");
        if (field.fieldGroup) {
            var groupType = field.groupdType || "tabpanel";
            if (groupType == "tabpanel") {
                renderTabContainer(sb, field);
            }
            else if (groupType == "collapse") {
                renderCollapseContainer(sb, fieldID, field);
            }
        }
        else {
            var h = $this.params.horizontal;
            field.type = field.type || "text";
            field.id = "*_*".replace("*", $this.target).replace("*",fieldID);
            sb.appendFormat('<div id="{0}" data-fieldtype="{1}" data-model="{2}" data-initial-value="{3}" class="form-row form-group">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field)
            );
            var inputID = $this.target + "_" + fieldID + "_" + field.type;
            sb.appendFormat('<label for="{1}" class="{2} {3}">{0}</label>',
                field.label,
                inputID,
                "control-label",
                (h) ? $this.params.formLabelSizeClass : "");
            if (h) sb.appendFormat('<div class="{0}">', $this.params.formValueSizeClass);
            rz.widgets.formHelpers.renderDataFieldByType(sb, field, inputID, $this);
            if (h) sb.appendFormat('</div>');
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

    this.getFormData = function () {
        var root = {};
        var rcount = $this.fieldCount();

        function addData(obj, value) {
            var parts = obj.split(".");
            var last = root;
            parts.forEach(function (it, ix) {
                if ((ix == parts.length - 1)) {
                    last[it] = value;
                }
                else {
                    if (last[it] === undefined) {
                        last[it] = {};
                    }
                }
                last = last[it];
            });
        }

        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var model = $("#" + id).data("model");
            addData(model, $this.getValueOf(id));
        }
        return root;
    };

    this.clearFormData = function () {
        var rcount = $this.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var initialValue = $("#" + id).data("initial-value");
            if (initialValue !== undefined && initialValue.toString().match(/^object-data:\[.*]$/) != null) {
                initialValue = initialValue.replace(/^object-data:\[/, "").replace(/]$/, "");
                initialValue = JSON.parse(atob(initialValue));
            }
            $this.setValueAt(i, initialValue);
        }
    };

    initialize();
};
/**
 * Created by Anderson on 12/01/2016.
 */
rz.widgets.FormRenderers["grid-row"] = function (params, sender) {
    var $this = this;
    var initialize = function () {
        //set defaults
        if (params === undefined) params = {};
        params.renderTableContainer = params.renderTableContainer || "Label";

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

            sb.appendFormat('<td id="{0}" data-fieldtype="{1}" data-model="{2}" data-initial-value="{3}" class="row-form-field">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field)
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

    this.getFormData = function () {
        var root = {};
        var rcount = $this.fieldCount();

        function addData(obj, value) {
            //var root = {};
            var parts = obj.split(".");
            var last = root;
            parts.forEach(function (it, ix) {
                if ((ix == parts.length - 1)) {
                    last[it] = value;
                }
                else {
                    if (last[it] === undefined) {
                        last[it] = {};
                    }
                }
                last = last[it];
            });
        }

        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var model = $("#" + id).data("model");
            addData(model, $this.getValueOf(id));
        }
        return root;
    };

    this.clearFormData = function () {
        var rcount = $this.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var initialValue = $("#" + id).data("initial-value");
            if (initialValue !== undefined && initialValue.toString().match(/^object-data:\[.*]$/) != null) {
                initialValue = initialValue.replace(/^object-data:\[/, "").replace(/]$/, "");
                initialValue = JSON.parse(atob(initialValue));
            }
            $this.setValueAt(i, initialValue);
        }
    };
    initialize();
};
/**
 * Created by Anderson on 12/01/2016.
 */
rz.widgets.FormRenderers["v-grid"] = function (params, sender) {
    var $this = this;
    var initialize = function () {
        //set defaults
        if (params === undefined) params = {};
        params.displayHeader = params.displayHeader || false;
        params.headerLabel = params.headerLabel || "Label";
        params.headerValue = params.headerValue || "Value";

        $this.params = params;
        $this.sender = sender;

    };

    this.render = function (target, params) {
        $this.target = target;
        var sb = new StringBuilder();
        sb.append('<div class="grid-form">');
        sb.appendFormat('  <table id="{0}base_table">', target);
        renderHeader(sb, params);
        sb.append('    <tbody>');
        rz.widgets.formHelpers.renderDataRows(sb, params, renderDataField);

        sb.append('    </tbody>');
        sb.append('  </table>');
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

    var renderFieldGroup = function (field, fieldID, sb) {
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
    };

    var renderDataField = function (sb, field,gidata) {
        var fieldID = (field.id || field.model || "row_" + generateRandomID(8)).replace(/\./g, "_");
        if (field.fieldGroup) {
            renderFieldGroup(field, fieldID, sb);
        }
        else{
            field.type = field.type || "text";
            field.id = "*_*".replace("*", $this.target).replace("*",fieldID);

            sb.appendFormat('<tr id="{0}" data-fieldtype="{1}" data-model="{2}" data-initial-value="{3}" {4} class="field-row">',
                field.id,
                field.type,
                rz.widgets.formHelpers.resolveModelName(field, fieldID),
                rz.widgets.formHelpers.getInitialValueData(field),
                gidata || ""
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
        return $("#" + $this.target + "base_table tbody > .field-row").length;
    };

    this.getFieldIdAt = function (position) {
        var p = position;
        if (p >= 0 && p < $this.sender.fieldCount()) {
            return $("#" + $this.target + "base_table tbody > .field-row").eq(p).attr("id");
        }
    };

    this.addField = function (fielddata) {
        var sb = new StringBuilder();
        renderDataField(sb, fielddata);
        $(sb.toString()).appendTo("#" + $this.target + "base_table tbody");

    };

    this.insertField = function (fielddata, position) {
        var sb = new StringBuilder();
        renderDataField(sb, fielddata);
        $("#" + $this.target + "base_table tbody > .field-row").eq(position).before(sb.toString());
    };

    this.removeFieldAt = function (position) {
        var p = position;
        if (p >= 0 && p < this.fieldCount()) {
            $("#" + $this.target + "base_table tbody > .field-row").eq(p).remove();
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
            var id = $("#" + $this.target + "base_table tbody > .field-row").eq(p).attr("id");
            return rz.widgets.formHelpers.getValueOfField("#" + id);
        }
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
            var id = $("#" + $this.target + "base_table tbody > .field-row").eq(p).attr("id");
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

    this.getFormData = function () {
        var root = {};
        var rcount = $this.fieldCount();

        function addData(obj, value) {
            //var root = {};
            var parts = obj.split(".");
            var last = root;
            parts.forEach(function (it, ix) {
                if ((ix == parts.length - 1)) {
                    last[it] = value;
                }
                else {
                    if (last[it] === undefined) {
                        last[it] = {};
                    }
                }
                last = last[it];
            });
        }

        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var model = $("#" + id).data("model");
            addData(model, $this.getValueOf(id));
        }
        return root;
    };

    this.clearFormData = function () {
        var rcount = $this.fieldCount();
        for (var i = 0; i < rcount; i++) {
            var id = $this.getFieldIdAt(i);
            var initialValue = $("#" + id).data("initial-value");
            if (initialValue !== undefined && initialValue.toString().match(/^object-data:\[.*]$/) != null) {
                initialValue = initialValue.replace(/^object-data:\[/, "").replace(/]$/, "");
                initialValue = JSON.parse(atob(initialValue));
            }
            $this.setValueAt(i, initialValue);
        }
    };
    initialize();
};
/**
 * Created by Anderson on 12/01/2016.
 */
rz.widgets.FormWidget = ruteZangada.widget("Form",rz.widgets.RZFormWidgetHelpers.FormWidgetInterface,rz.widgets.RZFormWidgetHelpers.FormWidgetEventHandlers,function () {
    var $this = this;
    this.initialize = function (params, initialized) {
        var renderer = params.renderer || "default";
        $this.renderer = new rz.widgets.FormRenderers[renderer](params, $this);
        initialized($this.renderer.params);
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

    this.getFormData = function () {
        return $this.renderer.getFormData();
    };

    this.clearFormData = function () {
        $this.renderer.clearFormData();
    };
});