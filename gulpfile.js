var gulp = require('gulp'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload');

gulp.task('APPDateField', function(){

    var path = './js/',
        systjs = path + 'APPDateField.js';

    gulp.src(systjs)
        .pipe(watch(systjs))
        .pipe(rename("APPDateField.min.js"))
        .pipe(uglify({ preserveComments: '!' }))
        .pipe(gulp.dest(path))
        .pipe(livereload());

});

gulp.task('watch', function(){
    livereload.listen();

});

gulp.task('default', ['APPDateField', 'watch']);