var gulp = require('gulp')
var mocha = require('gulp-mocha')
var jshint = require('gulp-jshint')
var jscs = require('gulp-jscs')

var jsWatchFiles = ['./*.js', './*/*.js']
var tasks = ['test', 'lint'] // 'jscs' task causes an error that could not be resolved

gulp.task('test', () => {
  return gulp.src('test/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}))
})

gulp.task('lint', () => {
  return gulp.src(jsWatchFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
})

gulp.task('jscs', () => {
  return gulp.src(jsWatchFiles)
    .pipe(jscs())
    .pipe(jscs.reporter())
})

gulp.task('watch', () => {
  return gulp.watch(jsWatchFiles, tasks)
})

gulp.task('default', tasks)
