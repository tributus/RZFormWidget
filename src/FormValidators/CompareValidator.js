/**
 * Created by anderson.santos on 17/06/2016.
 *
 * Parâmetros:
 * {
 *    type:"compare",
 *    model: "password",
 *    modelToCompare:"passwordConfirm",
 *    valueType:"text",
 *    operator:"==",
 *    message:"message"
 * }
 */
rz.widgets.formHelpers.createFormValidator("compare",function(sender,value,validationParams,validationHandler){
    var resolveType = function(v,tp){
        if(v===undefined || v==null) return v;
        switch (tp){
            case "number": return parseFloat(v);
            case "date":return new Date(v);
            case "text":return v.toString();
            default: return v;
        }
    };
    var callback = rz.helpers.ensureFunction(validationHandler);
    var operations = {};
    var op = validationParams.operator || "==";
    var tp = validationParams.valueType || "text";
    var vA = resolveType(value,tp);
    var vB = resolveType(sender.getValueOfModel(validationParams.modelToCompare),tp);

    operations["=="] = function (a, b) {return a==b};
    operations["==="] = function (a, b) {return a===b};
    operations["!="] = function (a, b) {return a!=b};
    operations["!=="] = function (a, b) {return a!==b};
    operations[">"] = function (a, b) {return a>b};
    operations[">="] = function (a, b) {return a>=b};
    operations["<"] = function (a, b) {return a<b};
    operations["<="] = function (a, b) {return a<=b};
    callback(operations[op](vA,vB));
});