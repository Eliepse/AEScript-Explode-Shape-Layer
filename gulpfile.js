var gulp = require('gulp');
var pump = require('pump');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var resolveDependencies = require('gulp-resolve-dependencies');
var concat = require('gulp-concat');

gulp.task('dev', function (cb) {

    pump(
        [
            gulp.src(['src/config-dev.jsx', 'src/explode_shape_layer.jsx']),
            resolveDependencies({ pattern: /\* @requires [\s-]*(.*\.jsx)/g }),
            concat('explode_shape_layer.jsx'),
            gulp.dest('dist/'),
            rename('explode_shape_layer.min.jsx'),
            uglify(),
            gulp.dest('dist/')
        ],
        cb
    );

});

gulp.task('prod', function (cb) {

    pump(
        [
            gulp.src(['src/config-prod.jsx', 'src/explode_shape_layer.jsx']),
            resolveDependencies({ pattern: /\* @requires [\s-]*(.*\.jsx)/g }),
            concat('explode_shape_layer.jsx'),
            gulp.dest('dist/'),
            rename('explode_shape_layer.min.jsx'),
            uglify(),
            gulp.dest('dist/')
        ],
        cb
    );

});

gulp.task('watch', function () {

    gulp.watch('src/*', ['dev']);

});
