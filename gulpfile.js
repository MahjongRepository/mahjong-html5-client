var gulp = require('gulp');

var sourceFiles = './src/static';
var buildDir = './build';

gulp.task('typescript', () => {
    // var gulpts = require('gulp-typescript-compiler');
    //
    // return gulp
    //     .src(sourceFiles + '/js/**/*.ts')
    //     .pipe(gulpts({
    //         module: 'commonjs',
    //         target: 'ES5',
    //         sourcemap: false,
    //         logErrors: true,
    //         noImplicitAny: true
    //     }))
    //     .pipe(gulp.dest(buildDir + '/js/'));

    var browserify = require("browserify");
    var source = require('vinyl-source-stream');
    var tsify = require("tsify");

    return browserify({
        basedir: '.',
        debug: false,
        entries: ['./src/static/js/main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest(buildDir + '/js/'));
});

gulp.task('jsLibs', () => {
    var concat = require('gulp-concat');

    gulp.src(sourceFiles + '/js/libs/**/*')
        .pipe(concat('libs.min.js', {newLine: ';'}))
        .pipe(gulp.dest(buildDir + '/js/'));
});

gulp.task('postcss', ['sass'], () => {
    var postcss = require('gulp-postcss');
    var autoprefixer = require('autoprefixer');
    var mqpacker = require('css-mqpacker');

    var processors = [
        autoprefixer({
            browsers: ['last 15 versions'],
            cascade: true
        }),
        mqpacker({
            sort: true
        })
    ];

    return gulp.src([buildDir + '/css/*.css'])
        .pipe(postcss(processors))
        .pipe(gulp.dest(buildDir + '/css/'));
});

gulp.task('sass', () => {
    var sass = require('gulp-sass');
    var sourcemaps = require('gulp-sourcemaps');

    var options = {
        outputStyle: 'compact',
        sourceComments: false,
        precision: 10
    };

    return gulp.src([ sourceFiles + '/scss/entry/main.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass(options))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(buildDir + '/css/'));
});

gulp.task('minifyCss', () => {
    var cleanCss = require('gulp-clean-css');
    return gulp.src(buildDir + '/css/*.css')
        .pipe(cleanCss())
        .pipe(gulp.dest(buildDir + '/css'));
});

gulp.task('minifyJs', () => {
    var uglify = require('gulp-uglify');
    return gulp.src(buildDir + '/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(buildDir + '/js'));
});

gulp.task('minifyHtml', () => {
    var htmlmin = require('gulp-htmlmin');
    return gulp.src(buildDir + '/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(buildDir));
});

gulp.task('copyImages', () => {
    gulp.src([sourceFiles + '/img/**/*']).pipe(gulp.dest(buildDir + '/img'));
});

gulp.task('copyTemplates', () => {
    gulp.src('./src/index.html').pipe(gulp.dest(buildDir));
});

// production build with minified files
gulp.task('build', [
    'postcss',
    'copyImages',
    'typescript',
    'jsLibs',
    'copyTemplates'
], () => {
    gulp.start('minifyJs');
    gulp.start('minifyCss');
    gulp.start('minifyHtml');
});

// dev build without minified files
gulp.task('devBuild', [
    'postcss',
    'copyImages',
    'typescript',
    'jsLibs',
    'copyTemplates'
]);

gulp.task('start', ['postcss', 'typescript'], () => {
    var connect = require('gulp-connect');
    gulp.start('devBuild');

    gulp.watch([
        sourceFiles + '/scss/**/*.scss'
    ], ['postcss']);

    gulp.watch([
        sourceFiles + '/js/**/*.ts'
    ], ['typescript']);

    gulp.watch([
        sourceFiles + '/img/**/*'
    ], ['copyImages']);

    gulp.watch([
        './src/index.html'
    ], ['copyTemplates']);

    connect.server({
        port: 8080,
        root: buildDir
    });
});
