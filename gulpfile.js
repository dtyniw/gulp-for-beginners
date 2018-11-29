var gulp = require('gulp');

// Requires the gulp-sass plugin
var sass = require('gulp-sass');

// Requires the gulp-useref plugin
var useref = require('gulp-useref');

// We are using the gulp-uglify plugin to help with minifying JavaScript files.
// We also need a second plugin called gulp-if to ensure that we only attempt to minify JavaScript files.
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');

// We minify the concatenated CSS file.
var cssnano = require('gulp-cssnano');

// Image optimization
var imagemin = require('gulp-imagemin');

var cache = require('gulp-cache');

var del = require('del');

var runSequence = require('run-sequence');

// Browser sync
var browserSync = require('browser-sync').create();

gulp.task('sass', function()
{
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
        .pipe(sass())
        .pipe(gulp.dest('app/css'))
        // Reload the browser whenever the sass task is ran;
        .pipe(browserSync.reload( { stream: true } ));
});

gulp.task('useref', function(){
    return gulp.src('app/*.html')
      // Parse build blocks in HTML files to replace references to non-optimized scripts or stylesheets with useref
      .pipe(useref())
      // Minifies only if it's a JavaScript file
      .pipe(gulpIf('*.js', uglify()))
      // Minifies only if it's a CSS file
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('dist'))
});

// Optimizing images
// It is an extremely slow process, so it uses gulp-cache plugin.
gulp.task('images', function(){
    return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin(
         [ imagemin.optipng({optimizationLevel: 9}) ]
    )))
    .pipe(gulp.dest('dist/images'))
});

// Since font files are already optimized, we can copy files with Gulp simply by specifying the gulp.src and gulp.dest without any plugins.
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
  });

gulp.task('clean:dist', function() {
    return del.sync('dist');
});

gulp.task('cache:clear', function (callback) {
    return cache.clearAll(callback)
});

//  Gulp first runs task 'clean:dist'. When task 'clean:dist' is completed, Gulp runs every task in the second argument simultaneously.
gulp.task('build', function (callback) {
    runSequence('clean:dist', 
      ['sass', 'useref', 'images', 'fonts'],
      callback
    )
  })

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    })
});

gulp.task('watch', ['browserSync', 'sass'], function () {
    // Execute 'sass' task every time any file changed in the watched folder(s).
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
    // Other watchers
});

// This task can be run by typing the gulp command
gulp.task('default', function (callback) {
    runSequence(['sass','browserSync', 'watch'],
      callback
    )
  })

gulp.task('hello', function() {
    console.log('Hello world!');
});
