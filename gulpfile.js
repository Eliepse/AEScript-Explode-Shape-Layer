var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('prod', function () {

    gulp.src('explode_shape_layer.jsx')
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))

});
