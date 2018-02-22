/* Nov. 2016, Sunsoo, NHN Technology Services UIT Development Center */

'use strict';

// Task 구동 관련
var gulp = require('gulp');
var runSequence = require('run-sequence');

// 인덱스 도우미
var uitIndex = require('./index.js');
var replace = require('gulp-replace');

// 마크업 작업 관련
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');

// 웹서버 구동 관련
var webserver = require('gulp-webserver');
var connect = require('gulp-connect');
var os = require('os');
var open = require('gulp-open');
// 포트번호
var customPortNumber = 2017;

// browserSync
var browserSync = require('browser-sync');

// 스프라이트 이미지 제작 관련
var spritesmith = require('gulp.spritesmith');
var gm = require('gulp-gm');

// http://gitlab2.uit.nhncorp.com/gwangyeom-kim/gulp-nts-uit-index-helper
// http://gitlab2.uit.nhncorp.com/sunsoo/gulp-nts-uit-index-sunsoo
gulp.task('index',function(){
	gulp.src('src/**/*.html')
		.pipe(uitIndex())
		.pipe(gulp.dest('./'));
	return;
});
gulp.task('index_ex',function(){
	gulp.src('example/**/*.html')
		.pipe(uitIndex())
		.pipe(replace('src/', './'))
		.pipe(replace('lib/', '../lib/'))
		.pipe(gulp.dest('./example/'));
	return;
});

// [gulp-sass] https://www.npmjs.com/package/gulp-sass
// [outputStyle] https://web-design-weekly.com/2014/06/15/different-sass-output-styles
// [sourcemaps] https://github.com/dlmanning/gulp-sass
// [autoprefixer] 브라우저 지원 범위 - https://github.com/ai/browserslist
var autoprefixBrowsers = ['ie >= 8','Edge > 0','Chrome > 0','Safari > 0','Android > 0','iOS > 0','ChromeAndroid > 0'];
gulp.task('sass', function () {
	gulp.src('src/scss/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(autoprefixer({browsers: autoprefixBrowsers}))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('src/css'));
	return;
});
gulp.task('watch', function () {
	gulp.watch('src/scss/**/*.scss', ['sass']);
	return;
});

// gulp server

// [webserver] https://www.npmjs.com/package/gulp-webserver
// [livereload] https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
gulp.task('webserver', function() {
	connect.server({
		livereload: false, // 크롬 확장도구 livereload 연동하여 자동 새로고침 가능
		port: customPortNumber, // 포트번호
		root: './',
		open: true // 크롬 브라우저 자동 실행
	})
	// OS별 크롬 브라우저 오픈 분기
	var browser = os.platform() === 'linux' ? 'google-chrome' : (
		os.platform() === 'darwin' ? 'google chrome' : (
			os.platform() === 'win32' ? 'chrome' : 'firefox'));
	return gulp.src('./')
		.pipe(open({app: browser, uri: 'http://localhost:'+customPortNumber+'/'}));
});

gulp.task('server', function (done) {
	runSequence(
		'webserver',
		'watch',
		done
	);
	return done;
});

// browser-sync
// https://browsersync.io/docs/options
// http://gitlab2.uit.nhncorp.com/dict/gdic/blob/master/gulpfile.js

gulp.task('browserSync',['sass'], () => {
	browserSync.init({
		ui: {
			port: 9999 // 관리자 페이지 포트 번호
		},
		port: 2017, // 확인 페이지 포트 번호
		server: {
			baseDir: './', // 웹서버 구동 경로
			directory: true
		},
		startPath: "./", // 브라우저 실행 시 시작 경로
		open: 'external', // IP 주소로 실행
		browser: "google chrome", // 크롬 실행
		snippetOptions: { // 커스텀 정보 추가
			rule: {
				match: /<\/body>/i,
				fn: (snippet, match) => {
					snippet = '\
						<!-- tuning -->\n\
						<link rel="stylesheet" href="/lib/browsersync/style.css">\n\
						<script type="text/javascript" charset="utf-8" src="/lib/browsersync/script.js"></script>\n\
						<!-- //tuning -->\n\
					';
					return snippet + match;
				}
			}
		}
	});
	gulp.watch("src/scss/**/*.scss", ['sass']);
});

// default
gulp.task('default', ['browserSync']);

// gulp sprite, gulp resize
// [spritesmith] https://www.npmjs.com/package/gulp.spritesmith
gulp.task('sprite', function(){
	var spriteData = gulp.src('src/img/sass-sprite/*.*')
		.pipe(spritesmith({
			imgName: 'sp2x.png',
			cssName: '_sprite.scss',
			padding: 10
		}));
	spriteData.img.pipe(gulp.dest('src/img/sass-sprite'));
	spriteData.css.pipe(gulp.dest('src/scss/lib/'));
	return;
});
// [gm] https://www.npmjs.com/package/gulp-gm
gulp.task('resize', function () {
	gulp.src('src/img/sass-sprite/sp2x.png')
		.pipe(gm(function (gmfile, done) {
			gmfile.size(function (err, size) {
				done(null, gmfile.resize(
					size.width * 0.5,
					size.height * 0.5
				));
			});
		}))
		.pipe(rename("sp1x.png"))
		.pipe(gulp.dest('src/img/sass-sprite'));
	return;
});
