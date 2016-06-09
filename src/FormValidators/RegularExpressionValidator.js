/**
 * Created by anderson.santos on 08/06/2016.
 */
rz.widgets.formHelpers.createFormValidator("regex",function(sender,value,validationParams,validationHandler){
    var validateEmptyValues = validationParams.validateEmptyValues == true;

    if(value==undefined || value==null || (value=="" && !validateEmptyValues)){
        validationHandler(true);
    }
    else{
        var result = value.toString().match(validationParams.regularExpression);
        validationHandler(result!=null && result.length!=0);
    }
});

