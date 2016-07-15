/**
 * Created by anderson.santos on 06/07/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("actions", {
    render: function (sb, field, containerID,sender) {
        field.widgetInstance = ruteZangada.renderWidget("rz-actions-bar", "actionsBar",field.params,function(renderData,eventArgs,callback){
            eventArgs.cancel = true;
            sb.append(renderData.data.toString());
            sender.sender.innerWidgetInitializeData.push(renderData);
            callback(eventArgs);
        });
    },
    bindEvents: function (id, emit, sender) {
        var fparams = rz.widgets.formHelpers.getFieldParams(id, sender.renderer.params.fields);
        fparams.widgetInstance.on("action-raised",function(s,e){
            emit(e.action, {field: id,targetElement: e,action:e.action,src: "usr"},sender);
            //emit("data-changed", {fieldid: id,value: value,src: "usr",text:text},sender);
        });
    },
    doPosRenderActions: function (id, $this) {}

});