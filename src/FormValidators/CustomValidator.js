/**
 * Created by anderson.santos on 09/06/2016.
 */
rz.widgets.formHelpers.createFormValidator("custom",function(sender,value,validationParams,validationHandler){
    var callback = rz.helpers.ensureFunction(validationHandler);
    if(validationParams.validationFunction !==undefined){
        validationParams.validationFunction(sender,value,callback,validationParams);

    }
    else{
        console.warn("validation function not defined. Validation bypassed");
        validationHandler(true);
    }
});