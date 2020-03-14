var gulp = require('gulp');
var browsersync = require('browser-sync');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var bundleLogger = require('../util/bundleLogger');
var handleErrors = require('../util/handleErrors');
var config = require('../config').browserify;

gulp.task('scripts', function (callback) {
	browsersync.notify('Compiling JavaScript');
	var bundleQueue = config.bundleConfigs.length;
	var browserifyThis = function (bundleConfig) {
		var bundler = browserify({
			cache: {}, packageCache: {}, fullPaths: false,
			entries: bundleConfig.entries,
			extensions: config.extensions,
			debug: config.debug
		});
		var bundle = function () {
			bundleLogger.start(bundleConfig.outputName);
			return bundler.bundle()
			.on('error', handleErrors)
			.pipe(source(bundleConfig.outputName))
			.pipe(gulp.dest(bundleConfig.dest)).on('end', reportFinished);
		};
		if (global.isWatching) {
			bundler = watchify(bundler)
			.on('update', bundle);
		}
		var reportFinished = function () {
			
			bundleLogger.end(bundleConfig.outputName)
			if (bundleQueue) {
				bundleQueue--;
				if (bundleQueue === 0) {
					callback();
				}
			}
		};
		return bundle();
	};
	
	config.bundleConfigs.forEach(browserifyThis);
});
