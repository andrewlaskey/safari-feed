var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');

var paths = {
  sass: ['./www/css/sass/**/*.scss'],
  js: [
    './app/_bower_components/angularjs-bower/angular.min.js',
    './app/_bower_components/angularjs-bower/angular-route.min.js',
    './app/_bower_components/angularjs-bower/angular-animate.min.js',
    './app/_bower_components/angularfire/angularfire.min.js',
    './app/_bower_components/leaflet/dist/leaflet.js',
    './app/_bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
    './app/_bower_components/momentjs/min/moment.min.js',
    './app/_bower_components/fastclick/lib/fastclick.js',
    './app/_bower_components/underscore/underscore.js',
    './www/js/libs/geoposition.js',
    './www/js/libs/heatcanvas.js',
    './www/js/app.js',
    './www/js/controllers.js',
    './www/js/services.js'
  ]
};

gulp.task('sass', function(done) {
  gulp.src(paths.sass)
    .pipe(sass())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('scripts', function() {
  gulp.src(paths.js)
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./www/js/'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./www/js/build/'));
});

gulp.task('reload', function() {
  gulp.src('./www/*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['scripts']);
  gulp.watch([
    './www/*.html',
    './www/css/*.css',
    './www/js/*.js'
    ], ['reload']);
});

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('default', ['connect', 'watch']);