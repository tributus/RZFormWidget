/**
 * Created by anderson.santos on 06/07/2016.
 */
rz.widgets.formHelpers.createFieldRenderer("collection", {
    render: function (sb, field, containerID) {

        // sb.appendFormat('<div class="ui flat segment">');
        // sb.appendFormat('<button class="ui primary button">Add</button>');
        // sb.appendFormat('<button class="ui primary button">Clear</button>');
        // sb.appendFormat('</div>');


        sb.appendFormat('<div class="ui raised secondary segment">');
        sb.appendFormat('<div class="ui middle aligned divided list">');

        sb.appendFormat('  <div class="item">');
        sb.appendFormat('    <div class="right floated content">');
        sb.appendFormat('      <a class="ui icon primary button">');
        sb.appendFormat('           <i class="edit icon"></i>');
        sb.appendFormat('       </a>');
        sb.appendFormat('      <a class="ui icon negative button">');
        sb.appendFormat('           <i class="delete icon"></i>');
        sb.appendFormat('       </a>');
        sb.appendFormat('    </div>');
        sb.appendFormat('    <div class="content">');
        sb.appendFormat('      Lena');
        sb.appendFormat('    </div>');
        sb.appendFormat('  </div>');

        sb.appendFormat('  <div class="item">');
        sb.appendFormat('    <div class="right floated content">');
        sb.appendFormat('      <a class="ui icon primary button">');
        sb.appendFormat('           <i class="edit icon"></i>');
        sb.appendFormat('       </a>');
        sb.appendFormat('      <a class="ui icon negative button">');
        sb.appendFormat('           <i class="delete icon"></i>');
        sb.appendFormat('       </a>');
        sb.appendFormat('    </div>');
        sb.appendFormat('    <div class="content">');
        sb.appendFormat('      Lindsay');
        sb.appendFormat('    </div>');
        sb.appendFormat('  </div>');

        sb.appendFormat('  <div class="item">');
        sb.appendFormat('    <div class="right floated content">');

        sb.appendFormat('<div class="ui icon top right pointing dropdown button">');
        sb.appendFormat('  <i class="ellipsis vertical icon"></i>');
        sb.appendFormat('  <div class="menu">');
        sb.appendFormat('    <div class="header">Ações</div>');
        sb.appendFormat('    <div class="item"><i class="edit icon"></i> Editar item</div>');
        sb.appendFormat('    <div class="item"><i class="delete icon"></i> Excluir item</div>');
        sb.appendFormat('  </div>');
        sb.appendFormat('</div>');
        sb.appendFormat('<script>$(".ui.dropdown").dropdown()</script>');

        sb.appendFormat('    </div>');
        sb.appendFormat('    <div class="content">');
        sb.appendFormat('      Lindsay');
        sb.appendFormat('    </div>');
        sb.appendFormat('  </div>');

        sb.appendFormat('  <div class="item">');
        sb.appendFormat('    <div class="right floated content">');
        sb.appendFormat('      <a class="ui button">Add</a>');
        sb.appendFormat('    </div>');
        sb.appendFormat('    <div class="content">');
        sb.appendFormat('      Lindsay');
        sb.appendFormat('    </div>');
        sb.appendFormat('  </div>');
        sb.appendFormat('  <div class="item">');
        sb.appendFormat('    <div class="right floated content">');
        sb.appendFormat('      <a class="ui button">Add</a>');
        sb.appendFormat('    </div>');
        sb.appendFormat('    <div class="content">');
        sb.appendFormat('      Mark');
        sb.appendFormat('    </div>');
        sb.appendFormat('  </div>');
        sb.appendFormat('  <div class="item">');
        sb.appendFormat('    <div class="right floated content">');
        sb.appendFormat('      <div class="ui button">Add</div>');
        sb.appendFormat('    </div>');
        //content
        sb.appendFormat('    <img class="ui avatar image" src="/images/avatar2/small/molly.png">');
        sb.appendFormat('    <div class="content">');
        sb.appendFormat('      Molly');
        sb.appendFormat('    </div>');
        //content

        sb.appendFormat('  </div>');
        sb.appendFormat('</div>');
        sb.appendFormat('</div>');
        return containerID + "_collection";
    },
    getValue: function (id) {
        //return $(id).val();
    },
    setValue: function (id, newValue) {
        //$(id).val(newValue || "");
        throw "errrrrrrr";
    },
    bindEvents: function (id, emit, sender) {
    //     $("#" + id).change(function (e) {
    //         emit("data-changed", {field: id,value: e.target.value,src: "usr"},sender);
    //     });
    },
    doPosRenderActions: function (id, $this) {}

});