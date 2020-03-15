const gulp = require('gulp'),
	connect = require('gulp-connect'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	browserify = require('browserify'),
	del = require('del'),
	buffer = require('vinyl-buffer'),
	stream = require('vinyl-source-stream'),
	rename = require('gulp-rename');

gulp.task('connect', function () {
	connect.server({
		livereload: true
	})
});

gulp.task('sync', function () {
	gulp.src('src/recorder-identify.js')
		.pipe(connect.reload())
})

// 转码编译输出
gulp.task('browserify', function (cb) {
	del(['dist/rIdentify.js'], cb)
	// 定义入口文件
	return browserify({
		// 入口必须是转换过的es6文件，且文件不能是es6经过转换的es5文件，否者会报错
		entries: 'src/index.js',
		debug: true
	})
	// 在bundle之前先转换es6，因为readabel stream 流没有transform方法
	.transform("babelify", { presets: ['es2015', 'stage-0'] })
	// 转成stream流（stream流分小片段传输）
	.bundle()
	.on('error', function (error) {
		console.log(error.toString())
	})
	// node系只有content，添加名字转成gulp系可操作的流
	.pipe(stream('rIdentify.js'))
	// 转成二进制的流（二进制方式整体传输）
	.pipe(buffer())
	// 输出
	.pipe(gulp.dest('dist/'))
})

// 转码编译输出
gulp.task('browserify-h5-recorder', function (cb) {
	del(['dist/Recorder.js'], cb)
	// 定义入口文件
	return browserify({
		// 入口必须是转换过的es6文件，且文件不能是es6经过转换的es5文件，否者会报错
		entries: 'src/recorder-core.js',
		debug: true
	})
	// 在bundle之前先转换es6，因为readabel stream 流没有transform方法
	.transform("babelify", { presets: ['es2015', 'stage-0'] })
	// 转成stream流（stream流分小片段传输）
	.bundle()
	.on('error', function (error) {
		console.log(error.toString())
	})
	// node系只有content，添加名字转成gulp系可操作的流
	.pipe(stream('Recorder.js'))
	// 转成二进制的流（二进制方式整体传输）
	.pipe(buffer())
	// 输出
	.pipe(gulp.dest('dist/'))
})

// 压缩输出
gulp.task('compressJS', function (cb) {
	del(['dist/rIdentify.min.js'], cb)
	return gulp.src('dist/rIdentify.js')
		.pipe(uglify({
			compress: {
				drop_console: true,  // 过滤 console
				drop_debugger: true  // 过滤 debugger
			}
		}))    //压缩
		.pipe(rename('rIdentify.min.js'))
		.pipe(gulp.dest('dist'));  //输出
})

// 合并压缩输出
gulp.task('concatCompressJS', function (cb) {
	del(['dist/rIdentify.min.js'], cb)
	return gulp.src(['dist/rIdentify.js', 'dist/Recorder.js'])
	.pipe(concat())
	.pipe(uglify({
		compress: {
			drop_console: true,  // 过滤 console
			drop_debugger: true  // 过滤 debugger
		}
	}))    //压缩
	.pipe(rename('rIdentify.min.js'))
	.pipe(gulp.dest('dist'));  //输出
})

// 将已有插件清除console等不必要的后输出
gulp.task('reUglify', function () {
	return gulp.src('plugins/recorder.wav.min.js')
	.pipe(uglify({
		compress: {
			drop_console: true,  // 过滤 console
			drop_debugger: true  // 过滤 debugger
		}
	}))    //压缩
	.pipe(gulp.dest('dist'));  //输出
})

// 合并压缩库的JS文件
gulp.task('mini_lib', function() {
	return gulp.src(['dist/recorder.wav.min.js', 'dist/rIdentify.min.js'])
	.pipe(concat('RIdentify.js'))
	.pipe(gulp.dest('dist/lib/'))
	.pipe(rename({suffix: '.min'}))
	.pipe(uglify({
		compress: {
			drop_console: true,  // 过滤 console
			drop_debugger: true  // 过滤 debugger
		}
	}))
	.pipe(gulp.dest('dist/lib/'));
});

/*
* 执行gulp默认顺序执行browserify、compressJS两个任务
* 	gulp.series：按照顺序执行
* 	gulp.parallel：可以并行计算
* */
gulp.task('default', gulp.series('browserify', 'compressJS', 'mini_lib', () => {
}));
