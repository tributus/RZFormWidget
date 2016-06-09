/**
 * Created by anderson.santos on 09/06/2016.
 */
rz.widgets.formHelpers.createFormValidator("range",function(sender,value,validationParams,validationHandler){
    var callback = rz.helpers.ensureFunction(validationHandler);
    /*{
        model: "Idade",
            type:"range",
        message:"A idade deve estar entre 18 e 35 anos",
        minValue:18,
        maxValue:35,
        valueType:"number"
    }*/
    if(validationParams.valueType=="number"){
        if(value==undefined || value=="" ||  value==null){
            callback(true);
        }
        else{
            var cVal = parseFloat(value);
            var vmin = (validationParams.minValue !==undefined)? cVal >= validationParams.minValue:true;
            var vmax = (validationParams.maxValue !==undefined)? cVal <= validationParams.maxValue:true;
            callback(vmin && vmax);
        }
    }

});