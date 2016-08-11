/**
 * Created by anderson.santos on 11/08/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("checkbox", {
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

        sb.appendFormat('<div class="{0} field-container">',field.containerClass || "ui fitted segment");
        sb.appendFormat('<div id="{0}_el" class="ui {1} checkbox">', containerID, field.checkboxStyle|| "");
        sb.appendFormat('  <input type="checkbox" name="{0}" {1}>',field.id,field.initialValue ? "checked":"");
        sb.appendFormat('  <label>{0}</label>',field.checkboxLabel || field.label || "");
        sb.appendFormat('</div>');
        sb.appendFormat('</div>');
        return containerID + "_input_checkbox";
    },
    getValue: function (id) {
        return $(id + "_el").checkbox("is checked");
    },
    setValue: function (id, newValue) {
        var behavior = newValue ? "check":"uncheck";
        $(id + "_el").checkbox(behavior);

    },
    bindEvents: function (id, emit, sender) {
        var el = $("#" + id + "_checkbox_el");
        el.checkbox({
            onChange: function() {
                emit("data-changed", {field: id,value:el.checkbox("is checked"),src: "usr"},sender);
            }
        });
    },
    doPosRenderActions: function (id) {
        $("#" + id + "_checkbox_el").checkbox();
    }

});