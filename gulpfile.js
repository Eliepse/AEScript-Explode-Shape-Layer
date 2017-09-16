var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var resolveDependencies = require('gulp-resolve-dependencies');
var concat = require('gulp-concat');

gulp.task('prod', function () {

    gulp.src('src/explode_shape_layer.jsx')
    .pipe(resolveDependencies({
        pattern: /\* @requires [\s-]*(.*\.jsx)/g
    }))
    .on('error', function(err) { console.log(err.message); })
    .pipe(concat('explode_shape_layer.jsx'))
    .pipe(rename('./explode_shape_layer.jsx'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename('./explode_shape_layer.min.jsx'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));

});

gulp.task('watch', ['prod'], function () {

    gulp.watch('src/*', ['prod']);

});
