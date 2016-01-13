/**
 * Created by Anderson on 13/01/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("list", {
    render: function (sb, field, containerID) {
        sb.appendFormat('<select id="{0}" name="{0}" class="form-control">', containerID);
        field.listItems.forEach(function (it) {
            sb.appendFormat('   <option value="{1}" {2}>{0}</option>', it.label, it.value, (it.value == field.value) ? "selected" : "");
        });
        sb.appendFormat('</select>');

    },
    getValue: function (id) {
        return $(id).val();
    },
    setValue: function (id, newValue) {
        $(id).val(newValue);
    },
    bindEvents: function (id, emit, sender) {
        $("#" + id).change(function (e) {
            emit("data-changed", {fieldid: id,value: e.target.value,src: "usr"},sender);
        });
    },
    doPosRenderActions: function (id) {
    }
});