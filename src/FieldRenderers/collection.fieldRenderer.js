/**
 * Created by anderson.santos on 06/07/2016.
 */

//Helpers
rz.widgets.formHelpers.getFieldParams = function (id, fieldDefinitions) {
    for (var i = 0; i < fieldDefinitions.length; i++) {
        var fieldDefinition = fieldDefinitions[i];
        if (fieldDefinition.fieldGroup) {
            var fieldDefinition = this.getFieldParams(id, fieldDefinition.fields);
            if (fieldDefinition !== undefined) return fieldDefinition;
        }
        else {
            if (fieldDefinition.id == id) {
                return fieldDefinition;
            }
        }
    }
};

rz.widgets.formHelpers.createFieldRenderer("collection", {
    getContentRenderer: function (params) {
        var itemsRenderer = rz.helpers.jsonUtils.getDataAtPath(params, "itemsSource.itemsRenderer");
        if (itemsRenderer == undefined) {
            itemsRenderer = {
                renderer: "default-list",
                rendererParams: {
                    editingText: "editing"
                }
            }
        }
        var contentRenderer = itemsRenderer.renderer;
        if (contentRenderer === undefined) {
            return rz.widgets.formHelpers.getFieldPartRenderer("default-list", "collection");
        }
        else {
            if (typeof(contentRenderer) == "string") {
                return rz.widgets.formHelpers.getFieldPartRenderer(contentRenderer, "collection");
            }
            else {
                return contentRenderer;
            }
        }
    },
    render: function (sb, field, containerID) {
        sb.appendFormat('<div class="{0}">', field.mainElementCss || "ui raised secondary segment");
        sb.appendFormat('   <div id="{0}_collection_container" class="ui {1} list collection-container">', containerID, field.collectionContainerCssClsss || "middle aligned divided");
        sb.appendFormat('   </div>');
        sb.appendFormat('</div>');
        return containerID + "_collection";
    },
    getValue: function (id) {
        var results = [];
        id = id.substring(0, id.lastIndexOf("_collection"));
        $(id + " .collection-dataitem").each(function (idx, item) {
            var data = $(item).data("value");
            results.push(JSON.parse(atob(data)));
        });
        return results;
    },
    setValue: function (fid, newValue, sender) {
        var newElementIDS = [];
        var id = fid.substring(0, fid.lastIndexOf("_collection"));
        /*particular for non input controls*/
        var fieldParams = rz.widgets.formHelpers.getFieldParams(id.replace("#", ""), sender.renderer.params.fields);
        var sb = new StringBuilder();
        var $this = this;
        var processAddValue = function (item) {
            var itemid = id.replace("#", "") + rz.helpers.generateRandomID();
            sb.appendFormat('       <div id="{1}" class="item collection-dataitem" data-value="{0}">',
                (item !== undefined && item !== null) ? btoa(JSON.stringify(item)) : item,
                itemid
            );
            newElementIDS.push(itemid);
            fieldParams.__uid = itemid;
            if (!fieldParams.itemActions.hideActionsMenu) {
                var actionsRenderer = fieldParams.itemActions.renderer || "default";
                if (typeof(actionsRenderer) == "string") {
                    actionsRenderer = rz.widgets.formHelpers.getFieldPartRenderer(actionsRenderer, "collection")
                }
                actionsRenderer(sb, fieldParams);
            }
            sb.appendFormat('           <div class="data-area content">');
            var contentRenderer = $this.getContentRenderer(fieldParams);
            contentRenderer(sb, fieldParams, item);
            sb.appendFormat('           </div>');
            sb.appendFormat('       </div>');
        };

        var clearCollectionData = function () {
            $(fid + "_collection_container").empty();
        };

        var initializeActionsDropdown = function () {
            setTimeout(function () {
                newElementIDS.forEach(function (item) {
                    var id = "#" + item + " .ui.dropdown";
                    $(id).dropdown({
                        action: "hide",
                        onChange: function (item) {
                            var $item = $("#" + item);
                            var action = $item.data("action");
                            var rowID = $item.data("rowid");
                            var fieldid = $item.data("targetfield");
                            var rowData = JSON.parse(atob($("#" + rowID).data("value")));
                            sender.raiseEvent("collection-request-change", {
                                action: action,
                                fieldid: fieldid,
                                rowid: rowID,
                                rowData: rowData
                            }, sender);
                        }
                    });

                });
                newElementIDS = [];
            }, 100);
        };

        if (newValue !== undefined && newValue != null && typeof(newValue) === "object" && newValue.length !== undefined) {
            newValue.forEach(function (item) {
                processAddValue(item);
            });
        }
        else if (newValue === undefined || newValue === null) {
            clearCollectionData();
        }
        else {
            processAddValue(newValue);
        }

        $(fid + "_collection_container").append(sb.toString());
        initializeActionsDropdown();

    },

    bindEvents: function (id, emit, sender) {
        var fieldParams = rz.widgets.formHelpers.getFieldParams(id, sender.renderer.params.fields);
        var source = rz.helpers.jsonUtils.getDataAtPath(fieldParams,"itemsSource.type") || "fieldset";
        var stateChangedHandler = fieldParams.stateChangedHandler || function(){};
        var fieldsets = {
            rule: 'restrict',
            fieldsets: fieldParams.itemsSource.source.split(' ')
        };

        sender.on(fieldParams.itemsSource.addToCollectiontrigger, function (sender) {
            if (source=="fieldset") {
                sender.validateForm(function (sender, result) {
                    if (result.validated) {
                        var newItem = sender.getFormData(fieldsets);
                        sender.clearFormData(fieldsets);
                        sender.setValueOf(id, newItem);
                        stateChangedHandler(sender,{state:"added",fieldParams:fieldParams});
                        //emit aqui ? ou lá?
                    }
                }, fieldsets);
            }
            else if(source=="xxxxxxxxxxx"){
                throw "NOT_IMPLEMENTED";
            }
        });
        
        sender.on(fieldParams.itemsSource.clearCollectionTrigger,function(sender){
            var confirmMethod = rz.helpers.jsonUtils.getDataAtPath(fieldParams,"itemsSource.confirmClearMethod");
            if(confirmMethod !==undefined){
                confirmMethod(sender,{params:fieldParams},function(confirm){
                    if(confirm){
                        sender.setValueOf(fieldParams.id,null,sender);
                        stateChangedHandler(sender,{state:"empty",fieldParams:fieldParams});
                    }
                });
            }
            else{
                sender.setValueOf(fieldParams.id,null,sender);
                stateChangedHandler(sender,{state:"empty",fieldParams:fieldParams});
            }
        });

        sender.on(fieldParams.itemsSource.updateCollectionTrigger,function(sender){
            if (source=="fieldset") {
                sender.validateForm(function (sender, result) {
                    if (result.validated) {
                        var newItem = sender.getFormData(fieldsets);
                        sender.clearFormData(fieldsets);
                        //sender.setValueOf(id, newItem);
                        var el = $("#" + fieldParams.id + " .edit-mode");
                        el.data("value",btoa(JSON.stringify(newItem)));
                        el.removeClass("edit-mode");
                        var contentRenderer = rz.widgets.formHelpers.fieldRenderers["collection"].getContentRenderer(fieldParams);
                        var sb = new StringBuilder();
                        contentRenderer(sb,fieldParams,newItem,"edit-mode");
                        el.find(".data-area").html(sb.toString());
                        stateChangedHandler(sender,{state:"edited",fieldParams:fieldParams});

                        //emit aqui ? ou lá?
                    }
                }, fieldsets);
            }
            else if(source=="xxxxxxxxxxx"){
                throw "NOT_IMPLEMENTED";
            }
        });
        
        sender.on(fieldParams.itemsSource.cancelUpdateCollectionTrigger,function(sender){
            if (source=="fieldset") {
                sender.clearFormData(fieldsets);
                var el = $("#" + fieldParams.id + " .edit-mode");
                el.removeClass("edit-mode");
                stateChangedHandler(sender,{state:"editCancel",fieldParams:fieldParams});
            }
            else if(source=="xxxxxxxxxxx"){
                throw "NOT_IMPLEMENTED";
            }
        });

        sender.on("collection-request-change", function (sender, e) {
            var fieldid = e.fieldid;
            var fieldParams = rz.widgets.formHelpers.getFieldParams(fieldid, sender.renderer.params.fields);
            var deleteRow = function () {

                $("#" + e.rowid).fadeOut("fast", function () {
                    $("#" + e.rowid).detach();
                    var count = $("#" + e.fieldid + " .collection-dataitem").length;
                    if(count > 0){
                        stateChangedHandler(sender,{state:"deleted",fieldParams:fieldParams});
                    }
                    else{
                        stateChangedHandler(sender,{state:"empty",fieldParams:fieldParams});
                    }
                });
                //todo emit (changed)
            };

            if (e.action == "edit-item") {
                if (fieldParams.itemsSource.type == "fieldset") {
                    $("#" + e.fieldid + " .collection-dataitem").removeClass("edit-mode");
                    $("#" + e.rowid).addClass("edit-mode");
                    sender.setFormData(e.rowData, {
                        rule: "restrict",
                        fieldsets: fieldParams.itemsSource.source.split(' ')
                    });
                    stateChangedHandler(sender,{state:"enterEditMode",fieldParams:fieldParams});
                }
                else { //if form
                    throw "not implemented yeeeeeet";
                }
            }
            else if (e.action == "remove-item") {
                var confirmMethod = rz.helpers.jsonUtils.getDataAtPath(fieldParams, "itemActions.confirmDeleteItemMethod");
                if (confirmMethod !== undefined) {
                    confirmMethod(sender, {fieldParams: fieldParams, originalEventArgs: e}, function (confirm) {
                        if (confirm) {
                            deleteRow();
                        }
                    });
                }
                else {
                    deleteRow();
                }
            }
        });
    },
    doPosRenderActions: function (id, $this) {
    }
});
rz.widgets.formHelpers.createFieldPartRenderer("default-actions", function (sb, params) {
    var ensureActions = function () {
        if (params.itemActions === undefined) params.itemActions = {};
        if (params.itemActions.actions === undefined) {
            params.itemActions.actions = [
                {name: "Delete item", action: "remove-item", icon: "delete"},
                {name: "Edit item", action: "edit-item", icon: "edit"}
            ]
        }
    };
    var title = rz.helpers.jsonUtils.getDataAtPath(params, "itemActions.properties.title") || "Actions";
    ensureActions();
    sb.appendFormat('<div class="right floated content">');
    sb.appendFormat('    <div class="ui icon top right pointing dropdown button">');
    sb.appendFormat('        <i class="ellipsis vertical icon"></i>');
    sb.appendFormat('        <div class="menu">');
    sb.appendFormat('            <div class="header">{0}</div>', title);
    var actindex = 0;
    params.itemActions.actions.forEach(function (action) {
        sb.appendFormat('            <div id="itemfor_{3}{5}" class="item" data-value="itemfor_{3}{5}" data-rowid="{3}" data-action="{1}" data-targetfield="{4}"><i class="{0} icon"></i> {2}</div>',
            action.icon,
            action.action,
            action.name,
            params.__uid,
            params.id,
            actindex++
        );
    });
    sb.appendFormat('        </div>');
    sb.appendFormat('    </div>');
    sb.appendFormat('</div>');
}, "collection");

rz.widgets.formHelpers.createFieldPartRenderer("default-list", function (sb, params, data) {
    var dmp = rz.helpers.jsonUtils.getDataAtPath(params, "itemsSource.displayMemberPath");
    var text = "";
    if (dmp !== undefined) {
        text = (data !== undefined) ? rz.helpers.jsonUtils.getDataAtPath(data, dmp) : "";
    }
    else {
        text = (data !== undefined) ? data.toString() : "";
    }
    sb.appendFormat('<div class="{0} collectionitem-edition-indicator">', rz.helpers.jsonUtils.getDataAtPath(params, 'itemsSource.itemsRenderer.rendererParams["editingLabelClass"]') || "ui red ribbon label");
    sb.appendFormat('  <i class="edit icon"></i> {0}', rz.helpers.jsonUtils.getDataAtPath(params, 'itemsSource.itemsRenderer.rendererParams["editingText"]') || "");
    sb.appendFormat('</div>');
    sb.appendFormat(text);
}, 'collection');
