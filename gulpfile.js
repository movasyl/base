'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    fileinclude = require('gulp-file-include'),
    cleanCSS = require('gulp-clean-css'),
    unCSS = require('gulp-uncss'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    concat = require('gulp-concat'),
    bowerMain = require('bower-main'),
    wiredep = require('wiredep').stream,
    gutil = require('gulp-util');

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        jsLib: 'build/js/vendor/',
        style: 'build/css/',
        img: 'build/asset/images/',
        fonts: 'build/asset/fonts/'
    },
    src: {
        html: {
            file: 'app/*.html',
            template: 'app/templates/'
        },
        js: 'app/js/**/*.js',
        jsLib: 'app/lib/**/*.js',
        style: 'app/stylesheets/main.scss',
        img: 'app/asset/img/**/*.*',
        fonts: 'app/asset/fonts/**/*.*'
    },
    watch: {
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        jsLib: 'app/lib/**/*.js',
        style: 'app/stylesheets/**/*.scss',
        img: 'app/asset/img/**/*.*',
        fonts: 'app/asset/fonts/**/*.*',
        bower: 'app/lib/**/*.*'
    },
    clean: './build',
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9080,
    logPrefix: "gulp-front-end",
    notify: false
};


gulp.task('webserver', function() {
    browserSync(config);
});

gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function() {
    gulp.src(path.src.html.file)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: path.src.html.template,
            context: {

                name: "Vasyl",
                age: "KOVBASSA"

            }
        }))
        .pipe(wiredep({
            optional: 'configuration',
            goes: 'here'
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({
            stream: true
        }));
});
gulp.task('jsLib:build', function() {
    gulp.src(['app/lib/modernizer/modernizr.js', 'app/lib/jquery/dist/jquery.js'])
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.jsLib))
        .pipe(reload({
            stream: true
        }));
});
gulp.task('js:build', ['jsLib:build'], function() {
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('style:build', function() {
    gulp.src(path.src.style)

    .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ["last 9 versions", "not ie < 8", "> 1%"],
            cascade: true
        }))
        .pipe(sass().on('error', sass.logError))

    .pipe(cleanCSS({
            keepBreaks: true,
            semanticMerging: false, // semantic bem styles (need test!!)
            debug: true
        }, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        // .pipe(unCSS({
        //     html: [path.build.html + '*.html'] // видалить всі стилі які не використовуються в html
        // }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.style))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('image:build', function() {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'js:build',
    'style:build',
    'html:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
        // gulp.start('style:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.bower], function(event, cb) {
        gulp.start('html:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch']);