/**
 * Created by anderson.santos on 08/06/2016.
 */
rz.widgets.formHelpers.createFormValidator("required",function(sender,value,validationParams,validationHandler){
    var allowEmpty = validationParams.allowEmpty == true;
    var callback = rz.helpers.ensureFunction(validationHandler);
    if(value==undefined || value==null || (value=="" && !allowEmpty)){
        callback(false,validationParams);
    }
    else{
        callback(true,validationParams);
    }
});