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
  sass = require('gulp-sass')(require('sass'));

//* Функции обработки задач
//* Server
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
//* Обработка PUG
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
//* Обработка SASS
const scss = () => {
  return src(path.source.scss)
    .pipe(plumber())
    .pipe(sass())
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream());
};

//* Удаление директории
const clean = () => {
  return del(path.clean);
};

//* Наблюдение
const watcher = () => {
  watch([path.watch.pug], pug);
  watch([path.watch.scss], scss);
};

//* Задачи
exports.pug = pug;
exports.scss = scss;
exports.watch = watcher;
exports.clean = clean;

//*Сборка
exports.dev = series(clean, parallel(scss, pug), parallel(watcher, server));
