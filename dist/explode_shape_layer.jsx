function explodeLayer(layers) {

    consLog('==============\n==============');

    // Check if multiple layers selected
    if(layers.length > 1) {
        alert("Select a single shape layer");
        return;
    }

    // Get the selected layer
    var layer = layers[0];

    // Check if the layer is null or wrong type
    if(layer == undefined || layer.matchName !== 'ADBE Vector Layer') {
        alert("Select a shape layer");
        return;
    }

    var comp = layer.containingComp;

    // Get the elements of the original shape layer
    var contents = layer.property("Contents");
    var n_layers = [];

    if(contents.numProperties > configs.itemAmountWarning && !confirm('You have more than ' + configs.itemAmountWarning + ' elements. Execution time might be long, are you sure you want to continue ?'))
        return;


    // Browse through contents array
    for(var i = contents.numProperties; i > 0; i--) {

        // Get the original property
        var o_prop = contents.property(i);

        // Skip the property if not enabled
        if (o_prop.enabled) {

            // Duplicate the original layer and rename with property name
            var n_layer = comp.layers.addShape();
            n_layer.name = o_prop.name;
            n_layer.enabled = false;

            n_layers.push(n_layer);

            copyLayerTransform(layer, n_layer);

            // Get the elements of the new layer
            var n_layerContents = n_layer.property("Contents");

            insertPropertyToContents(o_prop, n_layerContents, '')

        }

    }

    for(var i = 0; i < n_layers.length; i++) {
        n_layers[i].enabled = true;
    }

}

function insertPropertyToContents(prop, contents, prefix) {

    if (!contents.canAddProperty(prop.matchName))
        return false;

    var n_prop = contents.addProperty(prop.matchName)

    for(var i=1; i <= prop.numProperties; i++) {

        var innerProp = prop.property(i);

        if(innerProp.enabled && n_prop.canAddProperty(innerProp.matchName)) {

            consLog(prefix + innerProp.matchName);

            var p = n_prop.property(innerProp.matchName) ? n_prop.property(innerProp.matchName) : n_prop.addProperty(innerProp.matchName);

            switch (innerProp.matchName) {

                case 'ADBE Vector Filter - Merge':
                copyProperty('mode', innerProp, p)
                break;

                case 'ADBE Vector Materials Group':
                consLog(prefix + '-- skipped');
                break;

                case 'ADBE Vector Graphic - Stroke':
                copyPropertyStroke(innerProp, p);
                break;

                case 'ADBE Vector Graphic - Fill':
                copyPropertyFill(innerProp, p);
                break;

                case 'ADBE Vector Transform Group':
                copyPropertyTransform(innerProp, p);
                break;

                case 'ADBE Root Vectors Group':
                case 'ADBE Vectors Group':
                case 'ADBE Vector Group':
                insertPropertyToContents(innerProp, n_prop, prefix += '    ')
                break;

                case 'ADBE Vector Shape - Group':
                copyPropertyShape(innerProp, p);
                break;

                default:
                p.setValue( innerProp.value );



            }

        }

    }


}

function copyProperty(name, origin, target) {
    target[name].setValue( origin[name].value );
}

function copyPropertyShape(origin, target) {
    target.property('ADBE Vector Shape').setValue( origin.property('ADBE Vector Shape').value );
}

function copyPropertyStroke(origin, target) {

    copyProperty('composite', origin, target);
    copyProperty('color', origin, target);
    copyProperty('strokeWidth', origin, target);
    copyProperty('lineCap', origin, target);
    copyProperty('lineJoin', origin, target);
    copyProperty('miterLimit', origin, target);

    // TOFIX : dash are present, no mater if deleted or not ! (disabled for now)
    if(false && origin.dash.enabled) {

        for(var i=1; i <= origin.dash.numProperties; i++) {

            var dashProp = origin.dash.property(i);

            if(dashProp.enabled)
                target.dash.addProperty(dashProp.matchName).setValue(dashProp.value);

        }

    }

}

function copyPropertyFill(origin, target) {

    copyProperty('composite', origin, target);
    copyProperty('fillRule', origin, target);
    copyProperty('color', origin, target);

}

function copyPropertyTransform(origin, target) {

    copyProperty('anchorPoint', origin, target);
    copyProperty('position', origin, target);
    copyProperty('scale', origin, target);
    copyProperty('skew', origin, target);
    copyProperty('skewAxis', origin, target);
    copyProperty('rotation', origin, target);
    copyProperty('opacity', origin, target);

}

function copyLayerTransform(origin, target) {

    copyProperty('anchorPoint', origin, target);
    copyProperty('position', origin, target);
    copyProperty('scale', origin, target);
    copyProperty('rotation', origin, target);
    copyProperty('opacity', origin, target);

}

function createUI(thisObj) {

    if(thisObj instanceof Panel) {

        var myPanel = thisObj;

    } else {

        var myPanel = new Window('palette', configs.title, undefined, {
            resizeable : true,
        });
        myPanel.show();

    }

    var btn = myPanel.add("button", [10, 10, 100, 30], "Explode layer");

    myPanel.text = configs.title;
    myPanel.bounds.width = 120;
    myPanel.bounds.height = 40;

    btn.onClick = function() {

        var t_start = new Date().getTime();

        explodeLayer( app.project.activeItem.selectedLayers );

        var t_end = new Date().getTime();
        consLog('Execution time : ' + (t_end - t_start) + 'ms');

    }

    return myPanel;

}

function consLog(text) { if (configs.log) $.writeln(text); }

var configs = {
    title: 'Explode layer tool',
    log : false,
    itemAmountWarning : 50,
};

var myToolsPanel = createUI(this);
