/*global -$ */
'use strict';
// generated on 2015-05-15 using generator-gulp-webapp 0.3.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({lazy:false});
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('styles', function () {
	return styles();
});
gulp.task('styles:newer', function () {
	return styles(true);
});
function styles (newer) {
	var result = gulp.src('app/**/*.scss');
	if (newer) { // Reduce the set to changed files only (where source file is newer than dest file)
		result = result.pipe($.newer({
			dest: 'app',
			ext: '.css'
		}))
	}
	result = result.pipe($.sourcemaps.init())
		.pipe($.sass({
			outputStyle: 'nested', // libsass doesn't support expanded yet
			precision: 10,
			includePaths: ['.'],
			onError: console.error.bind(console, 'Sass error:')
		})).pipe($.postcss([
			require('autoprefixer-core')({browsers: ['last 1 version']})
		]))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('app'))
		.pipe(reload({stream: true}));
	return result;
}

gulp.task('jade', function () {
	jade();
});
gulp.task('jade:newer', function () {
	jade(true);
});
function jade (newer) {
	var result = gulp.src('app/**/*.jade');
	if (newer) { // Reduce the set to changed files only (where source file is newer than dest file)
		result = result.pipe($.newer({
			dest: 'app',
			ext: '.html'
		}))
	}
	result = result.pipe($.jade({
			pretty: true,
			locals: {}
		}))
	.pipe(gulp.dest('app'));
	return result;
};

gulp.task('jshint', function () {
	return gulp.src('app/**/*.js')
		.pipe(reload({stream: true, once: true}))
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'))
		.pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('html', ['styles', 'jade'], function () {
	var assets = $.useref.assets({searchPath: ['app', '.']});

	return gulp.src('app/*.html')
		.pipe(assets)
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.csso()))
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
		.pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
	return gulp.src('app/images/**/*')
		.pipe($.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{cleanupIDs: false}]
		})))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
	return gulp.src(require('main-bower-files')({
		filter: '**/*.{eot,svg,ttf,woff,woff2}'
	}).concat('app/fonts/**/*'))
		.pipe(gulp.dest('app/fonts'))
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	], {
		dot: true
	}).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['dist']));

gulp.task('serve', ['styles', 'jade', 'fonts'], function () {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['app'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	// watch for changes to
	gulp.watch([
		'app/**/*.html',
		'app/**/*.js',
		'app/**/*.png', 'app/**/*.jpg', 'app/**/*.png', 
		'app/fonts/**/*'
	]).on('change', reload);

	gulp.watch('app/**/*.scss', ['styles:newer']);
	gulp.watch('app/**/_*.scss', ['styles']);
	gulp.watch('app/**/*.jade', ['jade:newer']);
	gulp.watch('app/fonts/**/*', ['fonts']);
	gulp.watch('bower.json', ['wiredep', 'fonts']);
});

// inject bower components
gulp.task('wiredep', function () {
	var wiredep = require('wiredep').stream;

	gulp.src('app/**/*.scss')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)+/
		}))
		.pipe(gulp.dest('app'));

	gulp.src('app/**/*.html')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest('app'));
});

gulp.task('build', ['clean', 'jshint', 'html', 'images', 'fonts', 'extras'], function () {
	return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
	gulp.start('serve');
});
