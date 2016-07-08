/**
 * Created by anderson.santos on 06/07/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("collection", {
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
        //$(id).val(newValue || "");
        var sb = new StringBuilder();
        sb.appendFormat('       <div class="item">');
        sb.appendFormat('           <div class="right floated content">');
        sb.appendFormat('               <div class="ui icon top right pointing dropdown button">');
        sb.appendFormat('                   <i class="ellipsis vertical icon"></i>');
        sb.appendFormat('                   <div class="menu">');
        sb.appendFormat('                       <div class="header">Ações</div>');
        sb.appendFormat('                       <div class="item"><i class="edit icon"></i> Editar item</div>');
        sb.appendFormat('                       <div class="item"><i class="delete icon"></i> Excluir item</div>');
        sb.appendFormat('                   </div>');
        sb.appendFormat('               </div>');
        sb.appendFormat('           </div>');
        sb.appendFormat('           <div class="content">');
        sb.appendFormat('               Lindsay');
        sb.appendFormat('           </div>');
        sb.appendFormat('       </div>');
        sb.appendFormat('<script>$(".ui.dropdown").dropdown()</script>');
        $(id + "_collection_container").append(sb.toString());


    },
    bindEvents: function (id, emit, sender) {
        var fieldParams = JSON.parse(atob($("#" + id).data("field-params")));
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