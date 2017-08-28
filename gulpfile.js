var gulp = require('gulp'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload');

gulp.task('APPDateField', function(){

    var path = './src/',
        src = path + 'APPDateField.js';

    gulp.src(src)
        .pipe(watch(src))
        .pipe(rename("APPDateField.min.js"))
        .pipe(uglify({ preserveComments: '!' }))
        .pipe(gulp.dest(path))
        .pipe(livereload());

});

gulp.task('watch', function(){
    livereload.listen();

});

gulp.task('default', ['APPDateField', 'watch']);