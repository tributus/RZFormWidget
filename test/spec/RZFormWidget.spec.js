/**
 * Created by Anderson on 09/01/2016.
 */
var ins = instance;
describe("FormWidget tests", function () {

    it("Wideget criado com sucesso", function () {
        expect(ins !== undefined).toEqual(true);
    });

    it("getValueOf()", function () {
        expect(ins.getValueOf('r0')).toEqual("Valor inicial do campo");
    });

    it("setValueOf()", function () {
        instance.setValueOf('r0','novo valor');
        expect(instance.getValueOf('r0')).toEqual('novo valor');
    });

    //it("Método não implementado com saída padrão", function () {
    //    expect(instance.notImpleMethod).toThrow("not implemented");
    //});
    //
    //it("Obtenção de metadados de método de widget (a partir do objeto ruteZangada)", function () {
    //    expect(ruteZangada.getWidgetMethodsDescription("testWidget", "complexDefinitionMethod").description).toEqual("Teste de método com definição complexa");
    //});
    //
    //it("Obtenção de metadados de método de widget (a partir da instância do widget)", function () {
    //    expect(instance.getMethodDescriptor("complexDefinitionMethod").description).toEqual("Teste de método com definição complexa");
    //});

});