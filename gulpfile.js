const gulp = require('gulp'),
	connect = require('gulp-connect'),
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

/*
* gulp.series：按照顺序执行
* gulp.parallel：可以并行计算
* */
gulp.task('default', gulp.series('browserify', 'compressJS', () => {
}));
