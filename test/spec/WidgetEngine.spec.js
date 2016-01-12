/**
 * Created by Anderson on 09/01/2016.
 */

var testWidget = ruteZangada.widget("testWidget",["sayHello","notImpleMethod",{
    name:"complexDefinitionMethod", description:"Teste de método com definição complexa"
}],["rendered"],function () {
    var $this = this;
    this.initialize = function (params, initialized) {
        params = params || {};
        params.message = params.message || "Hello World";
        initialized(params);
    };

    this.render = function (target, params) {
        $this.raiseEvent("rendered",undefined,$this);
    };
    this.sayHello = function(){
        return "hello";
    }
});


describe("WidgetEngine tests", function() {

    var instance = ruteZangada.renderWidget("testWidget");

    it("Widget registrado e instanciado corretamente", function() {
        expect(instance!==undefined).toEqual(true);
    });

    it("Método implementado exposto corretamente", function () {
        expect(instance.sayHello()).toEqual("hello");
    });

    it("Método não implementado com saída padrão", function () {
        expect(instance.notImpleMethod).toThrow("not implemented");
    });

    it("Obtenção de metadados de método de widget (a partir do objeto ruteZangada)", function () {
        expect(ruteZangada.getWidgetMethodsDescription("testWidget","complexDefinitionMethod").description).toEqual("Teste de método com definição complexa");
    });

    it("Obtenção de metadados de método de widget (a partir da instância do widget)", function () {
        expect(instance.getMethodDescriptor("complexDefinitionMethod").description).toEqual("Teste de método com definição complexa");
    });

});