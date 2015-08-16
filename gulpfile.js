var gulp = require('gulp');
var uncss = require('gulp-uncss');
var concat = require('gulp-concat');

gulp.task('default', function () {
    return gulp.src('*.css')
        .pipe(concat('main.css'))
        .pipe(uncss({
            html: ['index.html']
        }))
        .pipe(gulp.dest('./out'));
});

