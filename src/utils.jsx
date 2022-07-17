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
