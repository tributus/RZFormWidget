/**
 * Created by Anderson on 09/01/2016.
 */

describe("FormWidget tests", function () {

    it("Wideget criado com sucesso", function () {
        expect(instance !== undefined).toEqual(true);
    });

    it("getFieldIdAt()", function () {
        expect(instance.getFieldIdAt(1)).toEqual("formContainer_r1");
    });

    it("fieldCount()", function () {
        var fc1 = instance.fieldCount();
        instance.addField({label: "a"});
        var fc2 = instance.fieldCount();
        instance.removeFieldAt(0);
        instance.removeFieldAt(0);
        var fc3 = instance.fieldCount();
        expect(fc1 == 8 && fc2 == 9 && fc3 == 7).toEqual(true);
    });

    it("getValueOf()", function () {
        expect(instance.getValueOf('r0')).toEqual("Valor inicial do campo");
    });

    it("setValueOf()", function () {
        instance.setValueOf('r0', 'novo valor');
        expect(instance.getValueOf('r0')).toEqual('novo valor');
    });

    it("getValueAt() e setValueAt()", function () {
        instance.setValueAt(0, '000');
        expect(instance.getValueAt(0)).toEqual("000");
    });

    it("removeFieldById()", function () {
        instance.removeFieldById('r0');
        var m = function () {
            instance.getValueOf('r0');
        };
        expect(m).toThrowError();
    });

    it("removeFieldAt()", function () {
        instance.removeFieldAt(0);
        var m = function () {
            instance.getValueOf('r0');
        };
        expect(m).toThrowError();
    });

    it("insertField()", function () {
        var rowData = {label: "New Inserted Field", type: "text", value: "novo campo inserido"};
        instance.insertField(rowData, 5);
        expect(instance.getValueAt(5)).toEqual("novo campo inserido");
    });

    it("addField()", function () {
        var rowData = {label: "New Inserted Field", type: "text", value: "novo campo adicionado", id: "addedField"};
        instance.addField(rowData);
        expect(instance.getValueOf('addedField')).toEqual("novo campo adicionado");
    });

    it("getFormData()", function () {
        instance.setValueOf("ffgg", "rua 5");
        var fData = {
            "PrimeiroNome": "Valor inicial do campo",
            "UltimoNome": "",
            "form": {
                "f3": "1"
            },
            "Obs": "",
            "endereco": {
                "rua": "rua 5",
                "bairro": "",
                "cidade": "",
                "cep": ""
            }
        };
        expect(instance.getFormData()).toEqual(fData);
    });

    it("clearFormData()", function () {

        var fData = {
            "PrimeiroNome": "",
            "UltimoNome": "",
            "form": {"f3": null},
            "Obs": "",
            "endereco": {"rua": "", "bairro": "", "cidade": "", "cep": ""}
        };
        instance.clearFormData();
        expect(instance.getFormData()).toEqual(fData);
    });

    //
    //it("Obtenção de metadados de método de widget (a partir do objeto ruteZangada)", function () {
    //    expect(ruteZangada.getWidgetMethodsDescription("testWidget", "complexDefinitionMethod").description).toEqual("Teste de método com definição complexa");
    //});
    //
    //it("Obtenção de metadados de método de widget (a partir da instância do widget)", function () {
    //    expect(instance.getMethodDescriptor("complexDefinitionMethod").description).toEqual("Teste de método com definição complexa");
    //});

});