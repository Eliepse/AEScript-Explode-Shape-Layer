/* @requires utils.jsx  */

function explodeLayer(layer) {

    consLog('==============\n==============');

    // Get the elements of the original shape layer
    var contents = layer.property("Contents");
    var layers = [];

    if(contents.numProperties > configs.itemAmountWarning) {

        var go = confirm(
            'You have more than ' + configs.itemAmountWarning + ' elements. '
            + 'Execution time might be long, are you sure you want to continue ?'
        );

        if(!go) return;

    }


    // Browse through contents array
    for(var i = contents.numProperties; i > 0; i--) {

        // Get the original property
        var _prop = contents.property(i);

        // Skip the property if not enabled
        if (!_prop.enabled) continue;

        // Duplicate the original layer and rename with property name
        var new_layer = emptyDuplicateLayer(layer)

        new_layer.name = layer.name + ' - ' + _prop.name;
        new_layer.enabled = false;

        layers.push(new_layer);

        if (!new_layer.property("Contents").canAddProperty(_prop.matchName)) continue;

        var prop = new_layer.property("Contents").addProperty(_prop.matchName)

        copyProperties(_prop, prop, '')

    }

    for(var i = 0; i < layers.length; i++) {
        layers[i].enabled = true;
    }

}

function explode() {

    // Check if multiple layers selected
    if(app.project.activeItem.selectedLayers.length > 1) {
        alert("Select a single shape layer");
        return;
    }

    var selectedLayer = app.project.activeItem.selectedLayers[0];

    // Check if the layer is null or wrong type
    if(selectedLayer == undefined || selectedLayer.matchName !== 'ADBE Vector Layer') {
        alert("Select a shape layer");
        return;
    }

    explodeLayer(selectedLayer);

}

function emptyDuplicateLayer(layer) {

    var new_layer = layer.containingComp.layers.addShape();

    copyProperty('anchorPoint', layer, new_layer);
    copyProperty('position', layer, new_layer);
    copyProperty('scale', layer, new_layer);
    copyProperty('rotation', layer, new_layer);
    copyProperty('opacity', layer, new_layer);

    return new_layer;

}

function copyProperties(origin, target, prefix) {

    for(var i=1; i <= origin.numProperties; i++) {

        var _prop = origin.property(i);

        if(!_prop.enabled || !target.canAddProperty(_prop.matchName)) return;

        consLog(prefix + _prop.matchName);

        var prop = target.addProperty(_prop.matchName);

        switch (_prop.matchName) {

            case 'ADBE Vector Filter - Merge':
            copyProperty('mode', _prop, prop)
            break;

            case 'ADBE Vector Materials Group':
            consLog(prefix + '-- skipped');
            break;

            case 'ADBE Vector Graphic - Stroke':
            copyPropertyStroke(_prop, prop);
            break;

            case 'ADBE Vector Graphic - Fill':
            copyPropertyFill(_prop, prop);
            break;

            case 'ADBE Vector Transform Group':
            copyPropertyTransform(_prop, prop);
            break;

            case 'ADBE Vector Shape - Rect':
            copyPropertyRect(_prop, prop);
            break;

            case 'ADBE Vector Shape - Ellipse':
            copyPropertyEllipse(_prop, prop);
            break;

            case 'ADBE Vector Shape - Star':
            copyPropertyStar(_prop, prop);
            break;

            case 'ADBE Root Vectors Group':
            case 'ADBE Vectors Group':
            case 'ADBE Vector Group':
            copyProperties(_prop, prop, prefix += '    ')
            break;

            case 'ADBE Vector Shape - Group':
            copyPropertyShape(_prop, prop);
            break;

            case 'ADBE Vector Blend Mode':
            prop.setValue( _prop.value );
            break;

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
    // if(false && origin.dash.enabled) {
    //
    //     for(var i=1; i <= origin.dash.numProperties; i++) {
    //
    //         var dashProp = origin.dash.property(i);
    //
    //         if(dashProp.enabled)
    //             target.dash.addProperty(dashProp.matchName).setValue(dashProp.value);
    //
    //     }
    //
    // }

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

function copyPropertyRect(origin, target) {
    copyProperty('shapeDirection', origin, target)
    copyProperty('size', origin, target)
    copyProperty('position', origin, target)
    copyProperty('roundness', origin, target)
}

function copyPropertyEllipse(origin, target) {
    copyProperty('shapeDirection', origin, target)
    copyProperty('size', origin, target)
    copyProperty('position', origin, target)
}

function copyPropertyStar(origin, target) {
    copyProperty('shapeDirection', origin, target)
    copyProperty('type', origin, target)
    copyProperty('points', origin, target)
    copyProperty('position', origin, target)
    copyProperty('rotation', origin, target)
    copyProperty('innerRadius', origin, target)
    copyProperty('outerRadius', origin, target)
    copyProperty('innerRoundness', origin, target)
    copyProperty('outerRoundness', origin, target)
}

function createUI(that) {

    if(that instanceof Panel) {

        var myPanel = that;

    } else {

        var _panel = new Window('palette', configs.title, undefined, {
            resizeable : true,
        });
        _panel.show();

    }

    var btn = _panel.add("button", [10, 10, 100, 30], "Explode layer");

    _panel.text = configs.title;
    _panel.bounds.width = 120;
    _panel.bounds.height = 40;

    btn.onClick = function() {

        var startTime = new Date().getTime();

        explode();

        var execTime = new Date().getTime() - startTime;

        consLog('Execution time : ' + Math.floor(execTime / 1000) + 's ' + (execTime % 1000) + 'ms');

    }

    return _panel;

}

var _panel = createUI(this);
