/**
 * Created by anderson.santos on 06/07/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("actions", {
    render: function (sb, field, containerID) {
        sb.appendFormat('<h4 class="ui horizontal divider header">');
        sb.appendFormat('    <button class="ui primary button">Add</button>');
        sb.appendFormat('</h4>');
        return containerID + "_collection";
    },
    getValue: function (id) {
        //return $(id).val();
    },
    setValue: function (id, newValue) {
        //$(id).val(newValue || "");
        throw "errrrrrrr";
    },
    bindEvents: function (id, emit, sender) {
        //     $("#" + id).change(function (e) {
        //         emit("data-changed", {field: id,value: e.target.value,src: "usr"},sender);
        //     });
    },
    doPosRenderActions: function (id, $this) {}

});