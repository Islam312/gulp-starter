let projectFolder = 'dist',
  sourceFolder = '#source';

//* path all folder
const path = {
  build: {
    html: projectFolder + '/',
    css: projectFolder + '/css/',
    js: projectFolder + '/js/',
    img: projectFolder + '/img/',
    fonts: projectFolder + '/fonts/',
  },
  source: {
    pug: sourceFolder + '/pug/*.pug',
    scss: sourceFolder + '/scss/style.scss',
    js: sourceFolder + '/js/script.js',
    img: sourceFolder + '/img/**/*.{jpg,jpeg,svg,gif,ico,webp}',
    fonts: sourceFolder + '/fonts/*.ttf',
  },
  watch: {
    pug: sourceFolder + '/**/*.pug',
    scss: sourceFolder + '/scss/**/*.scss',
    js: sourceFolder + '/js/**/*.js',
    img: sourceFolder + '/img/**/*.{jpg,jpeg,svg,gif,ico,webp}',
  },
  clean: './' + projectFolder + '/',
};

//* Переменные
let plumber = require('gulp-plumber'),
  { src, dest, watch, series, parallel } = require('gulp'),
  browserSync = require('browser-sync').create(),
  del = require('del');

//* Переменные для компиляции пре-процессоров
let pugs = require('gulp-pug'),
  sass = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer'),
  groupMediaQuaries = require('gulp-group-css-media-queries'),
  cleanCss = require('gulp-clean-css'),
  rename = require('gulp-rename');

//* Переменные для JavaScript
let babel = require('gulp-babel'),
  webpack = require('webpack-stream');

//* Функции обработки задач
//* ========================== Server
const server = () => {
  browserSync.init({
    server: {
      baseDir: './' + projectFolder + '/',
    },
    port: 3000,
    notify: false,
  });
};

//*Обработка пре-процессоров
//* ==========================Обработка PUG
const pug = () => {
  return src(path.source.pug)
    .pipe(plumber())
    .pipe(
      pugs({
        pretty: true,
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
};
//*========================== Обработка SASS
const scss = () => {
  return src(path.source.scss, { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true,
      })
    )
    .pipe(groupMediaQuaries())
    .pipe(dest(path.build.css, { sourcemaps: true }))
    .pipe(cleanCss())
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(dest(path.build.css, { sourcemaps: true }))
    .pipe(browserSync.stream());
};
//*=========================== Обработка JavaScript
const js = () => {
  return src(path.source.js, { sourcemaps: true })
    .pipe(plumber())
    .pipe(babel())
    .pipe(
      webpack({
        mode: 'development',
      })
    )
    .pipe(dest(path.build.js, { sourcemaps: true }))
    .pipe(browserSync.stream());
};
//*=========================== Удаление директории
const clean = () => {
  return del(path.clean);
};

//*============================ Наблюдение
const watcher = () => {
  watch([path.watch.pug], pug);
  watch([path.watch.scss], scss);
  watch([path.watch.js], js);
};

//* ============================ Задачи
exports.pug = pug;
exports.scss = scss;
exports.js = js;
exports.watch = watcher;
exports.clean = clean;

//*============================== Сборка
exports.dev = series(clean, parallel(js, scss, pug), parallel(watcher, server));
