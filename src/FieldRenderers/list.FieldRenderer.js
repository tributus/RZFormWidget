/**
 * Created by Anderson on 13/01/2016.
 * Simple list renderer
 */
rz.widgets.formHelpers.createFieldRenderer("list", {
    activeInstances:{},
    helpers: {
        getElementID:function(id,suffix){
            if(suffix===undefined){
                suffix="";
            }
            return suffix + id + "_list";
        }
    },
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
        if(newValue==null){
            $(id).dropdown("restore default value");
        }
        else{
            $(id).dropdown("set selected",newValue);
        }
    },
    bindEvents: function (id, emit, sender) {
        var id = this.helpers.getElementID(id,"#");

        var handler = function(id,value,text){
            emit("data-changed", {fieldid: id,value: value,src: "usr",text:text},sender);
        };
        this.activeInstances[id].push(handler);
    },
    doPosRenderActions: function (id) {
        var $this = this;
        var elID = this.helpers.getElementID(id,"#");
        $(elID).dropdown({
            onChange:function(value, text, $selectedItem){
                var elInst = $this.activeInstances[elID];
                if(elInst !==undefined && elInst.length > 0){
                    elInst.forEach(function(item){
                        item(elID,value,text);
                    })
                }

            }
        });
        this.activeInstances[elID] = [];
    }
});