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
