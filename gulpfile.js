'use strict';

var gulp = require('gulp');
var pug = require('gulp-pug');
var fs = require('fs');
var data = require('gulp-data');
var path = require('path');
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var plumber = require('gulp-plumber');
var notify  = require('gulp-notify');
var browser = require("browser-sync");
var concat = require("gulp-concat");
var sourcemaps = require ('gulp-sourcemaps');
require('es6-promise').polyfill();


/**
 * 開発用のディレクトリを指定します。
 */
var src = {
  // 出力対象は`_`で始まっていない`.pug`ファイル。
  'html': ['src/**/*.pug', '!' + 'src/**/_*.pug'],
  'watch_html': ['src/**/*.pug', 'src/**/_*.pug'],
  // JSONファイルのディレクトリを変数化。
  'json': 'src/_data/',
  'js': 'src/**/*.js',
  'css': 'src/**/*.css',
  'sass': 'src/_sass/sass/**/*.scss'
};


/**
 * 出力するディレクトリを指定します。
 */
var dest = {
  'root': 'dest/',
  'html': 'dest/'
};


var DEST_DIR = './assets/';


/*
 * html compile task
 */
gulp.task('html', function() {
  // JSONファイルの読み込み。
  var locals = {
    'site': JSON.parse(fs.readFileSync(src.json + 'site.json'))
  }
  return gulp.src(src.html)
  // コンパイルエラーを通知します。
  .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
  // 各ページごとの`/`を除いたルート相対パスを取得します。
  .pipe(data(function(file) {
    locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
      return locals;
  }))
  .pipe(pug({
    // JSONファイルとルート相対パスの情報を渡します。
    locals: locals,
    // Pugファイルのルートディレクトリを指定します。
    // `/_includes/_layout`のようにルート相対パスで指定することができます。
    basedir: 'src',
    // Pugファイルの整形。
    pretty: true
  }))
  .pipe(gulp.dest(dest.html))
  .pipe(browser.reload({stream: true}));
});



/*
 * sass
 */
gulp.task('sass',function(){
      gulp.src([src.sass])
      .pipe(plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      }))
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}))
      // .pipe(sass({outputStyle: 'expended'})) // 開発用
      .pipe(autoprefixer())
      // .pipe(sourcemaps.write()) // 開発用
      .pipe(gulp.dest(dest.root + DEST_DIR + 'css/'))
      .pipe(browser.reload({stream:true}))
});



/**
 * jsファイルをdestディレクトリに出力（コピー）します。
 */
gulp.task('js', function() {
  return gulp.src(src.js, {base: src.root})
  .pipe(gulp.dest(dest.root + 'js/'))
  .pipe(browser.reload({stream: true}));
});


/*
 * Run server 
 */
gulp.task("server", function() {
  browser({
    server: {
      baseDir: dest.root,
      index: "index.html"
    }
  });
});



/*
 * Watch
 */
gulp.task('watch',function(){
  gulp.watch(src.sass, function(event){
    gulp.run('sass');
  });
  gulp.watch(src.watch_html, function(event){
    gulp.run('html');
  });
  gulp.watch(src.js, function(event){
    gulp.run('js');
  });
});


gulp.task('default', ['watch','server']);

