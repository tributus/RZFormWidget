/**
 * Created by Anderson on 12/01/2016.
 */
rz.widgets.FormWidget = ruteZangada.widget("Form",rz.widgets.RZFormWidgetHelpers.FormWidgetInterface,rz.widgets.RZFormWidgetHelpers.FormWidgetEventHandlers,function () {
    var $this = this;
    this.validationReport = [];
    this.initialize = function (params, initialized) {
        var renderer = params.renderer || "default";
        $this.renderer = new rz.widgets.FormRenderers[renderer](params, $this);

        $this.on("data-changed", function (sender, e) {
            updateValidationStatus();
        });

        initialized($this.renderer.params);
    };

    var updateValidationStatus = function(){
        if($this.isFormInvalid){
            $this.validateForm();
        }
    };

    this.render = function (target, params) {
        $this.renderer.render(target, params);
    };

    this.fieldCount = function () {
        return $this.renderer.fieldCount();
    };

    this.getFieldIdAt = function (position) {
        return $this.renderer.getFieldIdAt(position);
    };

    this.addField = function (fielddata) {
        $this.renderer.addField(fielddata);
        rz.widgets.formHelpers.bindEventHandlersOfField(fielddata.type,fielddata.id,$this);
        rz.widgets.formHelpers.doPosRenderActionsOfField(fielddata.type,fielddata.id,$this);
        $this.raiseEvent("field-added",fielddata,$this);

    };

    this.insertField = function (fielddata, position) {
        $this.renderer.insertField(fielddata, position);
        rz.widgets.formHelpers.bindEventHandlersOfField(fielddata.type,fielddata.id,$this);
        rz.widgets.formHelpers.doPosRenderActionsOfField(fielddata.type,fielddata.id,$this);
    };

    this.removeFieldAt = function (position) {
        $this.renderer.removeFieldAt(position);
    };

    this.removeFieldById = function (fieldid) {
        $this.renderer.removeFieldById(fieldid);
    };

    this.getValueAt = function (position) {
        return $this.renderer.getValueAt(position);
    };

    this.getValueOf = function (fieldid) {
        return $this.renderer.getValueOf(fieldid);
    };

    this.setValueAt = function (position, value) {
        $this.renderer.setValueAt(position, value);
    };

    this.setValueOf = function (fieldid, value) {
        $this.renderer.setValueOf(fieldid, value);
    };

    this.getValueOfModel = function (model) {
         return $this.renderer.getValueOfModel(model);
    };

    this.setValueOfModel = function (model,value) {
        return $this.renderer.setValueOfModel(model,value);
    };

    this.getFormData = function () {
        return $this.renderer.getFormData();
    };
    
    this.setFormData = function(formData){
        $this.renderer.setFormData(formData);
    };

    this.clearFormData = function () {
        $this.renderer.clearFormData();
    };

    /**
     * validates de form data
     * @param {function } validationResultHandler - method invoked after validation
     */
    this.validateForm = function(validationResultHandler){
        $this.renderer.validateForm(validationResultHandler)
    }
});