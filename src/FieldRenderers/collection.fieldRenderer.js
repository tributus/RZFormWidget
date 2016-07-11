/**
 * Created by anderson.santos on 06/07/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("collection", {
    getFieldParams:function(id){
        var pid = (id.startsWith("#")) ? id :"#" + id;
        return JSON.parse(atob($(pid).data("field-params")));
    },
    getContentRenderer : function(params){
        var contentRenderer = rz.helpers.jsonUtils.getDataAtPath(params,"itemsSource.renderer");
        if(contentRenderer===undefined){
            return rz.widgets.formHelpers.getFieldPartRenderer("default-list","collection");
        }
        else{
            if(typeof(contentRenderer=="string")){
                return rz.widgets.formHelpers.getFieldPartRenderer(contentRenderer,"collection");
            }
            else{
                return contentRenderer;
            }
        }
    },
    render: function (sb, field, containerID) {
        sb.appendFormat('<div class="{0}">',field.maineElementCss || "ui raised secondary segment");
        sb.appendFormat('   <div id="{0}_collection_container" class="ui {1} list collection-container">', containerID,field.collectionContainerCssClsss || "middle aligned divided");
        sb.appendFormat('   </div>');
        sb.appendFormat('</div>');
        return containerID + "_collection";
    },
    getValue: function (id) {
        //return $(id).val();
    },
    setValue: function (id, newValue) {
        var fieldParams = this.getFieldParams(id.substring(0,id.lastIndexOf("_collection"))); /*particular for non input controls*/
        var sb = new StringBuilder();
        sb.appendFormat('       <div class="item">');
        if(!fieldParams.itemActions.hideActionsMenu){
            var actionsRenderer = fieldParams.itemActions.renderer || "default";
            if(typeof(actionsRenderer)=="string"){
                actionsRenderer = rz.widgets.formHelpers.getFieldPartRenderer(actionsRenderer,"collection")
            }
            actionsRenderer(sb,fieldParams);
        }

        sb.appendFormat('           <div class="content">');
        var contentRenderer = this.getContentRenderer(fieldParams);
        contentRenderer(sb,fieldParams,newValue);

        sb.appendFormat('           </div>');
        sb.appendFormat('       </div>');
        sb.appendFormat('<script>$(".ui.dropdown").dropdown()</script>');
        $(id + "_collection_container").append(sb.toString());


    },

    bindEvents: function (id, emit, sender) {
        var fieldParams = this.getFieldParams(id);
        var fieldsets = {
            rule:'restrict',
            fieldsets: fieldParams.itemsSource.source.split(' ')
        };

        if(fieldParams.itemsSource.type=="fieldset"){
            sender.on(fieldParams.itemsSource.trigger,function(sender){
                sender.validateForm(function(sender,result){
                    if(result.validated){
                        var newItem = sender.getFormData(fieldsets);
                        sender.clearFormData(fieldsets);
                        sender.setValueOf(id,newItem);
                        //emit aqui ? ou lá?
                    }
                },fieldsets);
            });
        }

        //***************************************************registrar o datachange:*******************************
    //     $("#" + id).change(function (e) {
    //         emit("data-changed", {field: id,value: e.target.value,src: "usr"},sender);
    //     });
    },
    doPosRenderActions: function (id, $this) {}
});
rz.widgets.formHelpers.createFieldPartRenderer("default-actions",function(sb,params){
    var ensureActions = function(){
        if(params.itemActions === undefined) params.itemActions = {};
        if(params.itemActions.actions === undefined){
            params.itemActions.actions = [
                {name: "Delete item", action: "remove-item", icon: "delete"},
                {name: "Edit item", action: "edit-item", icon: "edit"}
            ]
        }
    };
    var title = rz.helpers.jsonUtils.getDataAtPath(params,"itemActions.properties.title") || "Actions";
    ensureActions();
    sb.appendFormat('<div class="right floated content">');
    sb.appendFormat('    <div class="ui icon top right pointing dropdown button">');
    sb.appendFormat('        <i class="ellipsis vertical icon"></i>');
    sb.appendFormat('        <div class="menu">');
    sb.appendFormat('            <div class="header">{0}</div>',title);
    params.itemActions.actions.forEach(function(action){
        sb.appendFormat('            <div class="item"><i class="{0} icon" data-action="{1}"></i> {2}</div>',action.icon,action.action,action.name);
    });
    sb.appendFormat('        </div>');
    sb.appendFormat('    </div>');
    sb.appendFormat('</div>');
},"collection");

rz.widgets.formHelpers.createFieldPartRenderer("default-list", function(sb,params,data){
    var dmp = rz.helpers.jsonUtils.getDataAtPath(params,"itemsSource.displayMemberPath");
    var  text = "";
    if(  dmp !==undefined){
        text = (data!==undefined) ? rz.helpers.jsonUtils.getDataAtPath(data, dmp):"";
    }
    else{
         text = (data!==undefined) ? data.toString():"";
    }
    sb.appendFormat(text);
},'collection');
