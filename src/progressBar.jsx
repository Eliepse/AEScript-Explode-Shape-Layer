_progressBar = new Window('palette', configs.title, undefined, {
    resizeable : false,
    borderless : 'not quite true',
});

_progressBar.preferredSize = [420, 40];
_progressBar.bar = _progressBar.add("progressbar", undefined, 0, 100);
_progressBar.bar.value = 0;
_progressBar.bar.preferredSize.width = 400;
_progressBar.bar.show()

_progressBar.barInfos = _progressBar.add("statictext", undefined, 'Loading, please wait', {
    justify: 'center'
});
_progressBar.barInfos.preferredSize = [400, 17];

_progressBar.make = function (min, max, current) {
    this.barProps = {
        min : min,
        max : max,
        current : current,
    }
    this.barProps.total = (this.barProps.max - this.barProps.min) + 1;
    this.barProps.step = (this.barProps.current - this.barProps.min) + 1;
}

_progressBar.updateBar = function () {
    this.bar.value = Math.round(( (this.barProps.step) * 100) / this.barProps.max)
    consLog('Processing element ' + (this.barProps.step + 1) + ' on ' + this.barProps.total);
    this.barInfos.text = 'Processing element ' + (this.barProps.step + 1) + ' on ' + this.barProps.total;
}

_progressBar.showBar = function () { this.show(); }

_progressBar.hideBar = function  () { this.hide(); }

_progressBar.setCurrent = function  (current, text) {
    this.barProps.current = current;
    this.barProps.step = (this.barProps.current - this.barProps.min) + 1;
    this.updateBar();
    this.update();
}
