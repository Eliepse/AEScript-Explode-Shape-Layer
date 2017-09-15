function explodeLayer(layers) {

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

    // Get the elements of the original shape layer
    var contents = layer.property("Contents");

    // Browse through contents array
    for(var i=1; i <= contents.numProperties; i++) {

        // Get the original property
        var o_prop = contents.property(i);

        // Skip the property if not enabled
        if (o_prop.enabled) {

            // Duplicate the original layer and rename with property name
            var n_layer  = layer.duplicate();
            n_layer.name = o_prop.name;

            // Get the elements of the new layer
            var n_layerContents = n_layer.property("Contents");

            // Remove all properties different from current original property
            for(var k = n_layerContents.numProperties; k > 0; k--) {

                var n_prop = n_layerContents.property(k);

                if(i === k)
                    continue;
                else
                    n_prop.remove();

            }

        }

    }

}


explodeLayer( app.project.activeItem.selectedLayers );
