/**
 * Created by anderson.santos on 17/06/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("password", {
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
        sb.appendFormat('<input id="{1}" name="{1}" type="password" value="{0}" class="form-control"{2}>', field.value || "", containerID,resolveAttributes());
        return containerID + "_input_pwd";
    },
    getValue: function (id) {
        return $(id).val();
    },
    setValue: function (id, newValue) {
        $(id).val(newValue || "");
    },
    bindEvents: function (id, emit, sender) {
        $("#" + id).change(function (e) {
            emit("data-changed", {field: id,value: e.target.value,src: "usr"},sender);
        });
    },
    doPosRenderActions: function (id, $this) {}

});