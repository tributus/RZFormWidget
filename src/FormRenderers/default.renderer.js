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

        rz.widgets.formHelpers.renderDataRows(sb, params, $this.renderDataField);
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
            if (!it.fieldGroup || (it.groupType !==undefined && it.groupType !="tabpanel")) {
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
            $this.renderDataField(sb, it);
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
            $this.renderDataField(sb, it);
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
            $this.renderDataField(sb, it);
        });
        sb.appendFormat('</div>');
    };

    this.renderDataField = function (sb, field) {
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
    
    this.displayValidationReport = function(){
        rz.widgets.formHelpers.displayValidationReportImpl($this);
    };

    initialize();
};