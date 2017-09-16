function consLog(text) {
    if (configs.log)
        $.writeln(text);
}

function listMatchNames(object) {

    for(var i=1; i <= object.numProperties; i++) {

        var prop = object.property(i);
        consLog(prop.matchName + '('+ prop.name +')');

    }

}
