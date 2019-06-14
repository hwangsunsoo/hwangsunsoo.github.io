'use strict';

// Task 구동 관련
var gulp = require('gulp');

// 마크업 작업 관련
var sass = require('gulp-sass');
// var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');

// browserSync
var browserSync = require('browser-sync');

// [gulp-sass] https://www.npmjs.com/package/gulp-sass
// [outputStyle] https://web-design-weekly.com/2014/06/15/different-sass-output-styles
// [sourcemaps] https://github.com/dlmanning/gulp-sass
// [autoprefixer] 브라우저 지원 범위 - https://github.com/ai/browserslist
var autoprefixBrowsers = ['ie >= 8','Edge > 0','Chrome > 0','Safari > 0','Android > 0','iOS > 0','ChromeAndroid > 0'];
gulp.task('sass', function () {
	gulp.src('scss/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		// .pipe(autoprefixer({browsers: autoprefixBrowsers}))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('css'));
	return;
});
gulp.task('watch', function () {
	gulp.watch('scss/*.scss', ['sass']);
	return;
});

// browser-sync
// https://browsersync.io/docs/options
// http://gitlab2.uit.nhncorp.com/dict/gdic/blob/master/gulpfile.js

gulp.task('browserSync',['sass'], () => {
	browserSync.init({
		ui: {
			port: 9999 // 관리자 페이지 포트 번호
		},
		port: 4300, // 확인 페이지 포트 번호
		server: {
			baseDir: './', // 웹서버 구동 경로
			directory: true
		},
		startPath: "./", // 브라우저 실행 시 시작 경로
		open: 'external', // IP 주소로 실행
		// browser: "google chrome", // 크롬 실행
		snippetOptions: { // 커스텀 정보 추가
			rule: {
				match: /<\/body>/i,
				fn: (snippet, match) => {
					snippet = '';
					return snippet + match;
				}
			}
		}
	});
	gulp.watch("scss/**/*.scss", ['sass']);
});

// default
gulp.task('default', ['browserSync']);
