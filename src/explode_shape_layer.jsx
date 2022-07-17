/*
 * @requires utils.jsx
 * @requires progressBar.jsx
*/

function explodeLayer(layer) {

    cLog('Exploding layer : ' + layer.name);

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

    var pb = new ProgressBar(1, contents.numProperties, 1);
    pb.start();

    try {
        // Browse through contents array
        for(var i = contents.numProperties; i > 0; i--) {

            // Get the original property
            var _prop = contents.property(i);
            pb.update(contents.numProperties - i)

            // Skip the property if not enabled
            if (!_prop.enabled) continue;

            // Duplicate the original layer and rename with property name
            var new_layer = emptyDuplicateLayer(layer)

            new_layer.name = layer.name + ' - ' + _prop.name;
            new_layer.enabled = false;
            new_layer.shy = true;

            layers.push(new_layer);

            if (!new_layer.property("Contents").canAddProperty(_prop.matchName)) continue;

            var prop = new_layer.property("Contents").addProperty(_prop.matchName)

            copyProperties(_prop, prop, 0)

        }
    } catch(e) {
        cLog("An error occured: " + e.message);
        pb.end();
    }


    pb.end();

    for(var i = 0; i < layers.length; i++) {
        layers[i].enabled = true;
        layers[i].shy = false;
        if(configs.dryRun) layers[i].remove();
    }

    return layers;

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

    cLog('==================')

    cLog('Configs :')
    for(config in configs) {
        if(configs.hasOwnProperty(config))
            cLog('    ' + config + ' : ' + configs[config])
    }

    cLog('')

    var execTime = new ExecutionTime();
    execTime.start();

    var hideShyLayers_originalState = selectedLayer.containingComp.hideShyLayers;
    selectedLayer.containingComp.hideShyLayers = true;

    var layers = explodeLayer(selectedLayer);

    selectedLayer.moveToBeginning()
    selectedLayer.containingComp.hideShyLayers = hideShyLayers_originalState;

    execTime.stop();
    cLog(execTime.time());

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

/**
 * Copy properties of a layer to another (recursive).
 * 
 * @param {Object} origin 
 * @param {Object} target 
 * @param {Number} level 
 */
function copyProperties(origin, target, level) {
    var indent = repeatStr("  ", level === undefined ? 0 : level);
    var prefix = indent + "⌞-";

    cDebug(indent + origin.name);

    for(var i=1; i <= origin.numProperties; i++) {

        var _prop = origin.property(i);

        if(!_prop.enabled || !target.canAddProperty(_prop.matchName)) return;

        // Skipped properties
        if(arrayIncludes(['ADBE Vector Materials Group'], _prop.matchName)) {
            cDebug(prefix + _prop.matchName + " (skipped)");
            continue;
        }

        cDebug(prefix + _prop.matchName);

        var prop = target.addProperty(_prop.matchName);

        switch (_prop.matchName) {

            case 'ADBE Vector Filter - Merge':
            copyProperty('mode', _prop, prop)
            break;

            case 'ADBE Vector Graphic - Stroke':
            copyProperty('composite', _prop, prop);
            copyProperty('color', _prop, prop);
            copyProperty('strokeWidth', _prop, prop);
            copyProperty('lineCap', _prop, prop);
            copyProperty('lineJoin', _prop, prop);
            copyProperty('miterLimit', _prop, prop);
            break;

            case 'ADBE Vector Graphic - Fill':
            copyProperty('composite', _prop, prop);
            copyProperty('fillRule', _prop, prop);
            copyProperty('color', _prop, prop);
            break;

            case 'ADBE Vector Transform Group':
            copyProperty('anchorPoint', _prop, prop);
            copyProperty('position', _prop, prop);
            copyProperty('scale', _prop, prop);
            copyProperty('skew', _prop, prop);
            copyProperty('skewAxis', _prop, prop);
            copyProperty('rotation', _prop, prop);
            copyProperty('opacity', _prop, prop);
            break;

            case 'ADBE Vector Shape - Rect':
            copyProperty('shapeDirection', _prop, prop)
            copyProperty('size', _prop, prop)
            copyProperty('position', _prop, prop)
            copyProperty('roundness', _prop, prop)
            break;

            case 'ADBE Vector Shape - Ellipse':
            copyProperty('shapeDirection', _prop, prop)
            copyProperty('size', _prop, prop)
            copyProperty('position', _prop, prop)
            break;

            case 'ADBE Vector Shape - Star':
            copyProperty('shapeDirection', _prop, prop)
            copyProperty('type', _prop, prop)
            copyProperty('points', _prop, prop)
            copyProperty('position', _prop, prop)
            copyProperty('rotation', _prop, prop)
            copyProperty('innerRadius', _prop, prop)
            copyProperty('outerRadius', _prop, prop)
            copyProperty('innerRoundness', _prop, prop)
            copyProperty('outerRoundness', _prop, prop)
            break;

            case 'ADBE Root Vectors Group':
            case 'ADBE Vectors Group':
            case 'ADBE Vector Group':
            copyProperties(_prop, prop, level + 1);
            break;

            case 'ADBE Vector Shape - Group':
            prop.property('ADBE Vector Shape').setValue( _prop.property('ADBE Vector Shape').value );
            break;

            // case 'Vector Stroke Taper':
            // copyProperty('startLength', _prop, prop);
            // copyProperty('endLength', _prop, prop);
            // copyProperty('startWidth', _prop, prop);
            // copyProperty('endWidth', _prop, prop);
            // copyProperty('startEase', _prop, prop);
            // copyProperty('endEase', _prop, prop);
            // break;

            case 'ADBE Vector Blend Mode':
            prop.setValue( _prop.value );
            break;

            default:
            cDebug(prefix + '>> not supported!');
            break;
        }

    }

}

function copyProperty(name, origin, target) {
    target[name].setValue( origin[name].value );
}

function arrayIncludes(arr, needle) {
    for(var i=arr.length - 1; i>=0; i--){
        if(arr[i] === needle) {
            return true;
        }
    }

    return false;
}

function repeatStr(str, amount) {
    var rtn = "";
    for(var i=0; i<amount; i++) {
        rtn += str;
    }
    return rtn;
}

function createUI(that) {

    if(that instanceof Panel) {

        var _panel = that;

    } else {

        var _panel = new Window('palette', configs.title, undefined, {
            resizeable : true,
        });
        _panel.show();

    }

    var btn = _panel.add("button", [10, 10, 100, 30], "Explode layer");

    // _panel.text = configs.title;
    _panel.bounds.width = 120;
    _panel.bounds.height = 40;

    btn.onClick = function() {

        explode();

    }

    return _panel;

}

var _panel = createUI(this);
