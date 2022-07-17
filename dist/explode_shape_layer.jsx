var configs = {
    title: 'Explode layer tool',
    debug : false,
    log : false,
    itemAmountWarning : 50,
    dryRun : false,
};

function cLog(text) {
    if (!configs.log) {
        return;
    }

    $.writeln(text);
}

function cDebug(text) {
    if (!configs.debug) {
        return;
    }

    $.writeln(text);
}

function listMatchNames(object) {

    for(var i=1; i <= object.numProperties; i++) {

        var prop = object.property(i);
        consLog(prop.matchName + '('+ prop.name +')');

    }

}

function ExecutionTime() {

    var startTime;
    var endTime;
    var execTime;

    this.constructor = function () {}

    this.start = function () {
        startTime = new Date().getTime();
    }

    this.stop = function () {
        endTime = new Date().getTime()
        execTime = endTime - startTime;
    }

    this.time = function () {
        return 'Execution time : ' + Math.floor(execTime / 1000) + 's ' + (execTime % 1000) + 'ms';
    }

}

function ProgressBar(min, max, current) {

    var _window,
        _progressBar,
        _infos,
        _real,
        _cursor,
        _isVisible;

    this.testInfos = 'Processing element :current on :max';

    this.constructor = function(min, max, current) {

        _this = this;
        _isVisible = false;

        _real = { min : min, max : max, current : current };
        _cursor = { min : 0, max : 100, current : 0 };

        _cursor.max = (_real.max - _real.min) + 1;

        // Instanciate the window
        _window = new Window('palette', configs.title, undefined, {
            resizeable : false,
            borderless : 'not quite true',
        });
        _window.preferredSize = [420, 40];

        // Instanciate the progress bar
        _progressBar = _window.add("progressbar", undefined, _cursor.min, _cursor.max);
        _progressBar.preferredSize.width = 400;
        _progressBar.show();

        // Instanciate text infos
        _infos = _window.add("statictext", undefined, 'Loading, please wait', {
            justify: 'center'
        });
        _infos.preferredSize = [400, 17];

        this.update(current);


        return this;

    }

    this.start = function () {
        _isVisible = true;
        this.update(_real.current)
        _window.show();
    }

    this.end = function () {
        _window.hide();
    }

    this.update = function(step) {

        _real.current = step;
        _cursor.current = (_real.current + 1) - _real.min;

        var infos = this.testInfos
        .replace(':current', _cursor.current)
        .replace(':max', _cursor.max);

        _progressBar.value = _cursor.current;
        _infos.text = infos;

        cDebug(infos);

        updateGraphics();
    }

    function updateGraphics() {
        if(!_isVisible) return;
        _window.update();
    }

    return this.constructor(min, max, current);

}

// this.bar.value = Math.round(( (this.barProps.step) * 100) / this.barProps.max)

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

    new_layer['anchorPoint'].setValue( layer['anchorPoint'].value );
    new_layer['position'].setValue( layer['position'].value );
    new_layer['scale'].setValue( layer['scale'].value );
    new_layer['rotation'].setValue( layer['rotation'].value );
    new_layer['opacity'].setValue( layer['opacity'].value );

    return new_layer;
}

var treeChildPrefix = "⌞ ";
var propertiesBlacklist = [
    'ADBE Vector Taper StartWidthPx',
    'ADBE Vector Taper EndWidthPx',
    'ADBE Vector Taper Wave Cycles',
    'ADBE Vector Stroke Dashes',
    'ADBE Vector Materials Group',
];

/**
 * Copy properties of a layer to another (recursive).
 * 
 * @param {Object} origin 
 * @param {Object} target 
 * @param {Number} level 
 */
function copyProperties(origin, target, level) {
    var indent = repeatStr("  ", level);

    // if(level === 0) {
        cDebug(indent + origin.name);
    // }

    // Process (copy) each property of the origin to the target
    for(var i=1; i <= origin.numProperties; i++) {
        var originalProp = origin.property(i);
        var matchName = originalProp.matchName;

        // Do not copy disabled properties
        if(!originalProp.enabled) {
            cDebug(indent + treeChildPrefix + matchName + " (skipped: disabled)");
            continue;
        };
        

        // Get or create the target property
        var targetProp = target.property(matchName);

        if(!targetProp) {
            targetProp = target.addProperty(matchName);
        }
        
        // Still no property ? Then the property is probably not supported
        if(!targetProp) {
            cDebug(indent + treeChildPrefix + matchName + " (skipped: cannot be added)");
            continue;
        }

        // Skip properties that cannot be set without being displayed
        if(arrayIncludes(propertiesBlacklist, matchName)) {
            cDebug(indent + "⚬ " + matchName + " (skipped: not editable when hidden)");
            continue;
        }
        
        // Handle property
        if(typeof originalProp.setValue === "function") {
            cDebug(indent + treeChildPrefix + matchName);
            targetProp.setValue(originalProp.value);
            continue;
        }
        
        // Handle property groups/layers
        if(originalProp.numProperties > 0) {
            cDebug(indent + treeChildPrefix + matchName);
            copyProperties(originalProp, targetProp, level + 1);
            continue;
        }

        cDebug(indent + "⦵ " + matchName + " (skipped: no reason)");
    }
}

/**
 * Check if an element (the needle) is present in a given array.
 * 
 * @param {Array} arr 
 * @param {*} needle 
 * @returns Boolean
 */
function arrayIncludes(arr, needle) {
    for(var i=arr.length - 1; i>=0; i--){
        if(arr[i] === needle) {
            return true;
        }
    }

    return false;
}

/**
 * Repeat a string a given times into a single string output.
 * 
 * @param {String} str 
 * @param {Number} amount 
 * @returns String
 */
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

    _panel.bounds.width = 120;
    _panel.bounds.height = 40;

    btn.onClick = function() {

        explode();

    }

    return _panel;

}

var _panel = createUI(this);
