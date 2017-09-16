var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('prod', function () {

    gulp.src('src/explode_shape_layer.jsx')
    .pipe(gulp.dest('dist/'))
    .pipe(rename('./explode_shape_layer.min.jsx'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))

});
