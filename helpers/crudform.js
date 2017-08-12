define(["libs/webix-jet-core/helpers/crud"], function(crud){

    var get_control_view = function(column){
        var control = {
            view: column.editor,
        };

        if(control.view === 'password'){
            control.view = 'text';
            control.type = 'password';
        }else if(control.view === 'inline-text'){
            control.view = 'text';
        }else if(control.view === 'inline-checkbox'){
            control.view = 'checkbox';
        }else if(control.view === 'color'){
            control.view = 'colorpicker';
        }else if(control.view === 'date'){
            control.view = 'datepicker';
        }

        return control;

    };

    var add_button = function(callback){
        return {
            view:"button", maxWidth:200, value: "Add New", click:callback
        };
    };

    var save_button = function(callback){
        return {
            view:"button", maxWidth:200, value: "Save", click:callback
        };
    };

    var delete_button = function(callback){
        return {
            view:"button", maxWidth:200, value: "Delete", click:callback
        };
    };

    function setup_buttons(ui){
        var toolbar = ui.$ui.rows[0];
        var frm = ui.$ui.rows[1];

        toolbar.elements[1] = add_button(function(){
            $$(frm.id).clear();
            var grid = $$(ui.$ui.rows[2].id);
            grid.unselectAll();
            $$(frm.id).focus();
        });

        toolbar.elements.push(save_button(function(){
            $$(frm.id).save();
        }));

        toolbar.elements.push(delete_button(function(){
            var grid = $$(ui.$ui.rows[2].id);
            var item = grid.getSelectedItem();
            if(item) {
                webix.confirm({
                    text: "Are you sure you want to delete this entry?",
                    ok: "OK",
                    cancel: "Cancel",
                    callback: function (res) {
                        if (res) {
                            grid.remove(item.id);
                            grid.setCursor(null);
                        }
                    }
                });
            }else{
                webix.message('Please select an item to delete');
            }
        }));
    }

    function crud_form(data, fields, name, elm_per_col, labels, params){

        if(!params) params = {};

        params.editable = false;
        params.select = true;

        var ui = crud.collection(data, fields, name, params);

        if(!labels) labels = [];

        var form = {
            view: 'form',
            id: webix.uid().toString(),
            cols: []
        };

        var grid = ui.$ui.rows[1];
        var columns = grid.columns;

        if(!elm_per_col || elm_per_col <= 0) elm_per_col = columns.length;

        var elements = [];
        for (var i = 1; i < columns.length; i++) {
            var control = get_control_view(columns[i]);
            var el = {
                view: control.view,
                label: labels[i] || columns[i].id,
                name: columns[i].id
            }
            if(control.type) el.type = control.type;

            elements.push(el);
        }

        var rows = [];
        for (var i = 0, j = 1; i < elements.length; i++){
            rows.push(elements[i]);
            if(j % elm_per_col === 0){
                form.cols.push({
                    rows: rows
                });
                rows = [];
            }
            j++;
        }

        if(rows.length > 0){
            form.cols.push({
                rows: rows
            });
        }

        ui.$ui.rows.splice(1, 0, form);

        setup_buttons(ui);
        var init = ui.$oninit;
        ui.$oninit = function(){
            init();
            $$(form.id).bind($$(ui.$ui.rows[2].id));
            $$(data).attachEvent("onAfterDelete", function(id){
                $$(form.id).clear();
            });
        };
        return ui;
    }

    crud.form = crud_form;

    return crud;

});
