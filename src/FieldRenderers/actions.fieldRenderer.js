/**
 * Created by anderson.santos on 06/07/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("actions", {
    actionRenderers : {
        button:function(actionData, sb,containerID){
            sb.appendFormat('<button id="{3}_action-button" class="ui {2} button rz-action-handler" data-action="{0}">{1}</button>',
                actionData.name,
                actionData.label || "",
                actionData.cssClass || "primary",
                containerID
            );
        }
    },
    render: function (sb, field, containerID) {
        var $this = this;
        if(field.actions !==undefined){
            field.actions.forEach(function(action){
                $this.actionRenderers[action.type](action,sb,containerID);
            });
        }
        return containerID + "_collection";
    },
    bindEvents: function (id, emit, sender) {
            $("#" + id + " .button.rz-action-handler").click(function (e) {
                try{
                    var action  = $(e.currentTarget).data("action");
                    if(action!==undefined){
                        emit(action, {field: id,targetElement: e,action:action,src: "usr"},sender);
                    }
                    return false;
                }
                catch (e){
                    console.error(e);
                    return false;
                }
            });
    },
    doPosRenderActions: function (id, $this) {}

});