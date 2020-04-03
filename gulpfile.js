const gulp = require('gulp'),
	connect = require('gulp-connect'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	browserify = require('browserify'),
	del = require('del'),
	buffer = require('vinyl-buffer'),
	stream = require('vinyl-source-stream'),
	rename = require('gulp-rename'),
	watch = require('gulp-watch');

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
	.transform("babelify", {presets: ['es2015', 'stage-0']})
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
	.transform("babelify", {presets: ['es2015', 'stage-0']})
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


// 转码编译输出
gulp.task('browserify_HZRecorder', function (cb) {
	// 定义入口文件
	return browserify({
		// 入口必须是转换过的es6文件，且文件不能是es6经过转换的es5文件，否者会报错
		entries: 'plugins/HZRecorder.js',
		debug: true
	})
	// 在bundle之前先转换es6，因为readabel stream 流没有transform方法
	.transform("babelify", {presets: ['es2015', 'stage-0']})
	// 转成stream流（stream流分小片段传输）
	.bundle()
	.on('error', function (error) {
		console.log(error.toString())
	})
	// node系只有content，添加名字转成gulp系可操作的流
	.pipe(stream('HZRecorder.js'))
	// 转成二进制的流（二进制方式整体传输）
	.pipe(buffer())
	// 输出
	.pipe(gulp.dest('dist/plugins3'))
})

// 压缩输出
gulp.task('compressJS_HZRecorder', function (cb) {
	del(['dist/plugins3/HZRecorder.min.js'], cb)
	return gulp.src('plugins/HZRecorder.js')
	.pipe(uglify({
		compress: {
			drop_console: true,  // 过滤 console
			drop_debugger: true  // 过滤 debugger
		}
	}))    //压缩
	.pipe(rename('HZRecorder.min.js'))
	.pipe(gulp.dest('dist/plugins3'));  //输出
})

// 编译压缩成 plugins
gulp.task('browserify_HZ_rIdentify', function (cb) {
	del(['dist/plugins3/recorderIdentify.min.js'], cb)
	return browserify({
		entries: 'src/index.js',
		debug: true
	})
	.transform("babelify", {presets: ['es2015', 'stage-0']})
	.bundle()
	.on('error', function (error) {
		console.log(error.toString())
	})
	.pipe(stream('recorderIdentify.js'))
	.pipe(buffer())
	.pipe(uglify({compress: {drop_console: true, drop_debugger: true}}))
	.pipe(rename('recorderIdentify.min.js'))
	.pipe(gulp.dest('dist/plugins3'));
})

// 合并输出
gulp.task('concat_HZ_RI', function (cb) {
	del(['dist/rIdentify.min.js'], cb)
	return gulp.src(['dist/plugins3/HZRecorder.min.js', 'dist/plugins3/recorderIdentify.min.js'])
	.pipe(concat('rIdentify.min.js'))
	.pipe(gulp.dest('dist/plugins3'));  //输出
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
gulp.task('mini_lib', function (cb) {
	del(['dist/rIdentify.min.js'], cb)
	return gulp.src(['plugins/recorder.wav.min.js', 'plugins/rIdentify.min.js'])
	.pipe(concat('rIdentify.js'))
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

// 编译压缩成 plugins
gulp.task('browserify_rd_plugin', function (cb) {
	del(['plugin/rIdentify.min.js'], cb)
	// 定义入口文件
	return browserify({
		// 入口必须是转换过的es6文件，且文件不能是es6经过转换的es5文件，否者会报错
		entries: 'src/index.js',
		debug: true
	})
	// 在bundle之前先转换es6，因为readabel stream 流没有transform方法
	.transform("babelify", {presets: ['es2015', 'stage-0']})
	// 转成stream流（stream流分小片段传输）
	.bundle()
	.on('error', function (error) {
		console.log(error.toString())
	})
	// node系只有content，添加名字转成gulp系可操作的流
	.pipe(stream('rIdentify.js'))
	// 转成二进制的流（二进制方式整体传输）
	.pipe(buffer())
	.pipe(uglify({
		compress: {
			drop_console: true,  // 过滤 console
			drop_debugger: true  // 过滤 debugger
		}
	}))    //压缩
	.pipe(rename('rIdentify.min.js'))
	.pipe(gulp.dest('plugins'));  //输出
})

// 合并压缩库的JS文件 - plugins：jquery-3.4.1.min.js、recorder.wav.min.js、rIdentify.min.js
gulp.task('min_plugins', function (cb) {
	del(['dist/plugins/rIdentify.min.js'], cb)
	return gulp.src(['plugins/*.min.js'])
	.pipe(concat('rIdentify.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('dist/plugins'))
});


// 合并压缩库的JS文件 - plugins：recorder.wav.min.js、rIdentify.min.js
gulp.task('min_plugins_basic', function (cb) {
	del(['dist/plugins2/rIdentify.min.js'], cb)
	return gulp.src(['plugins/recorder.wav.min.js', 'plugins/rIdentify.min.js'])
	.pipe(concat('rIdentify.min.js'))
	.pipe(uglify({
		compress: {
			drop_console: true,  // 过滤 console
			drop_debugger: true  // 过滤 debugger
		}
	}))
	.pipe(gulp.dest('dist/plugins2'))
});

/*
* 执行gulp默认顺序执行browserify、compressJS两个任务
* 	gulp.series：按照顺序执行
* 	gulp.parallel：可以并行计算
* */
gulp.task('default', gulp.series('browserify', 'compressJS', 'mini_lib', () => {
}));

gulp.task('uglify_min_plugin', gulp.series('browserify_rd_plugin', 'min_plugins_basic', () => {
}));

// 创建文件修改监听任务
gulp.task('watch', function () {
	// 源码有改动就进行压缩以及热刷新
	return watch('src/*.js', function () {
		gulp.start('browserify_rd_plugin');
	})
})

// 创建热加载任务
gulp.task('reload', function () {
	gulp.src('plugins/rIdentify.min.js')
	.pipe(connect.reload())
	console.log('reload')
})

// gulp服务器
gulp.task('server', function () {
	connect.server({
		root: 'src',
		livereload: true
	})
})

// 默认任务
gulp.task('host', gulp.series('server', 'watch'));

gulp.task('HZRecorder', gulp.series('browserify_HZRecorder',
	'compressJS_HZRecorder', 'browserify_HZ_rIdentify', 'concat_HZ_RI'));
