'use strict';

// Task 구동 관련
var gulp = require('gulp');
var runSequence = require('run-sequence');

// 인덱스 도우미
var uitIndex = require('./index.js');
var replace = require('gulp-replace');

// 웹서버 구동 관련
var webserver = require('gulp-webserver');
var connect = require('gulp-connect');
var os = require('os');
var open = require('gulp-open');
// 포트번호
var customPortNumber = 2019;

gulp.task('index',function(){
	gulp.src('src/**/*.html')
		.pipe(uitIndex())
		.pipe(gulp.dest('./'));
	return;
});