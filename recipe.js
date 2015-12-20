
/******************************************
GULPFILE - 
*******************************************/ 

//Gulp Declarations
var gulp  = require('gulp');
var csslint = require('gulp-csslint');
var eslint = require('gulp-eslint');
var htmlhint = require('gulp-htmlhint');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var gzip = require('gulp-gzip');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var ftp = require( 'vinyl-ftp' );

//Paths
var cssPath = ['css/**.css', '!css/**.min.css', '!css/*bootstrap*'];
var jsPath = ['js/**.js', '!node_modules/**', '!js/**.min.js'];
var htmlPath = ['prototype_pages/**.html'];
var ftpURL = '';//INSERTURL;
var ftpUN = '';//USERNAME;
var ftpPW = '';//PASSWORD;

//Master Tasks
gulp.task('default', function(){

});

gulp.task('validate', ['css-lint', 'js-lint', 'html-lint'], function(){
  console.log('Validation completed');
});

gulp.task('stage', ['create-dist', 'images', 'fonts'], function(){
    var conn = ftp.create( {
        host:     ftpURL,
        user:     ftpUN,
        password: ftpPW,
        parallel: 10,
        //log:      gutil.log

    } );
    var globs = [
        'dist/css/**',
        'dist/js/**',
        'dist/fonts/**',
        'dist/img/**',
        'dist/pages/**'
    ];

    return gulp.src( globs, { base: '.', buffer: false } )
        .pipe( conn.newer( '.' ) ) // only upload newer files
        .pipe( conn.dest( '.' ) );
})

//Validation Tasks

gulp.task('create-dist', ['images', 'fonts'], function(){
  return gulp.src(htmlPath)   
    .pipe(useref())
    .pipe(gulpif('*.css', autoprefixer({
      browsers: ['> 5%'],
      cascade: false
    })))
    .pipe(gulpif('*.js', uglify()))
    // .pipe(gulpif('*.js', gzip()))
    .pipe(gulpif('*.css', minifyCss()))
    // .pipe(gulpif('*.css', gzip()))
    .pipe(gulpif('*.html', minifyHTML()))
    .pipe(gulp.dest('dist/pages'))

});

gulp.task('css-lint', function() {
  gulp.src(cssPath)
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task('js-lint', function(){
  return gulp.src(jsPath)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.result(function(result) {
      console.log('ESLint result: ' + result.filePath);
      console.log('# Messages: ' + result.messages.length);
      console.log('# Warnings: ' + result.warningCount);
      console.log('# Errors: ' + result.errorCount);
    }))
});

gulp.task('html-lint', function() {
  return gulp.src(htmlPath)
    .pipe(htmlhint())
    .pipe(htmlhint.reporter());
});

//IMPROVE + OPTIMIZE + STAGE
gulp.task('images', () => {
  return gulp.src('img/**')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('fonts', function() {
  return gulp.src('fonts/**')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('vendor', function() {
  return gulp.src('vendor/**')
    .pipe(gulp.dest('dist/vendor'));
});

gulp.task('css', function() {
  return gulp.src('css/**')
    .pipe(gulp.dest('dist/css'));
});

gulp.task('js', function() {
  return gulp.src('js/**')
    .pipe(gulp.dest('dist/js'));
});

gulp.task('htaccess', function() {
  return gulp.src('.htaccess')
    .pipe(gulp.dest('dist/'));
});

