(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = require("./recorder-identify").RIdentify;

},{"./recorder-identify":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RIdentify = exports.RIdentify = function RIdentify() {
	var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	_classCallCheck(this, RIdentify);

	this.recorderConfig = {
		numChannels: 1,
		mimeType: 'audio/wav',
		bitRate: 16,
		sampleRate: 16000
	};

	var _this = this;
	Object.assign(this.recorderConfig, params.config);

	var url = params.url || '/robot/rs/qa/asr'; // 请求的url
	var timing = (params.time || 21) * 1000; // 定时长度
	var startTime = 0;
	var recordTime = null;
	var rec = null;
	var isRecord = false;

	// 添加路由插件并且初始化插件
	addRecordPlugin();

	function addRecordPlugin() {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = script.onreadystatechange = function () {
			if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
				// 监听语音图标点击录音事件
				getRecordPermission();
				$('#rIdentify').click(function () {
					// 开始录音
					if (isRecord !== undefined) {
						if (!isRecord) {
							startH5Record();
						} else {
							closeH5Record();
						}
					} else {
						// 如果是undefined表示不可用
						inputTip('请确认麦克风未被禁用！');
					}
				});
			}
		};
		script.src = 'dist/recorder.wav.min.js';
		// script.src = 'https://ht.dsjfzj.gxzf.gov.cn/jsq/rIdentify/plugins/recorder.wav.min.js';
		head.appendChild(script);
	}

	// 获取麦克风权限进行初始化
	function getRecordPermission() {
		var newRec = Recorder({
			type: _this.recorderConfig.mimeType.split('/')[1],
			bitRate: _this.recorderConfig.bitRate,
			sampleRate: _this.recorderConfig.sampleRate,
			disableEnvInFix: true,
			onProcess: function onProcess(buffers, powerLevel, duration, sampleRate, newBufferIdx, asyncEnd) {}
		});

		newRec.open(function () {
			// 打开麦克风授权获得相关资源
			rec = newRec;
			console.log(rec);
		}, function (msg, isUserNotAllow) {
			// 用户拒绝未授权或不支持
			inputTip((isUserNotAllow ? 'UserNotAllow，' : '') + '打开录音失败：' + msg, 1);
		});
	}

	// 点击开始录音
	function startH5Record() {
		if (rec && Recorder.IsOpen()) {
			rec.start();
			inputTip('开始录音...再次点击录音终止！');
			isRecord = !isRecord;
			startTime = new Date();
			recordTime = setInterval(function () {
				// 20秒
				if (startTime && new Date().getTime() - startTime.getTime() >= timing) {
					closeH5Record();
				}
			}, timing);
		} else {
			inputTip('未打开录音');
		}
	}

	// 结束录音
	function closeH5Record() {
		if (rec) {
			rec.stop(function (blob, duration) {
				isRecord = !isRecord;
				clearInterval(recordTime);
				if (startTime && new Date().getTime() - startTime.getTime() < 1000) {
					// 小于1秒当没说话
					startTime = 0;
					return;
				}
				startTime = 0;

				if (blob.size < 20000) {
					inputTip('录音太短不可用！');
					return;
				} else {
					inputTip('录音结束...');
				}
				audioIdentify(blob);
			}, function (msg) {
				inputTip('录音失败:' + msg);
			});
		}
	}

	// 音频识别成中文
	function audioIdentify(blob) {
		var formData = new FormData();
		formData.append('file', blob, new Date().getTime() + '.' + _this.recorderConfig.mimeType.split('/')[1]);
		$.ajax({
			url: url,
			type: 'post',
			data: formData,
			processData: false,
			contentType: false,
			success: function success(res) {
				if (res.data) {
					if ($('#rIdentify').data('search-id')) {
						$('#' + $('#rIdentify').data('search-id')).val(res.data);
					}
				}
			},
			error: function error(_error) {
				console.log(_error);
			}
		});
	}

	// 录音提示
	var setTimeoutTip = null;

	function inputTip(message) {
		if (setTimeoutTip && $('#rIdentifyTip')) {
			clearTimeout(setTimeoutTip);
			$('#rIdentifyTip').remove();
		}
		var div = document.createElement('div');
		div.id = 'rIdentifyTip';
		div.style.cssText = 'position: absolute; top: ' + ($('#rIdentify')[0].offsetTop - 20) + 'px;left: ' + $('#rIdentify')[0].offsetLeft + 'px;border-radius: 8px;margin-top: -15px;' + 'color: #fff;background-color: #409eff;padding: 5px 0;z-index: 2147483647;';
		var span = document.createElement('span');
		span.innerText = message;
		span.style.cssText = 'margin: 0 10px;';
		div.appendChild(span);
		document.getElementById('rIdentify').appendChild(div);
		setTimeoutTip = setTimeout(function () {
			$('#rIdentifyTip').remove();
		}, 2000);
	}
};

exports.default = RIdentify;


(function () {
	new RIdentify();
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcmVjb3JkZXItaWRlbnRpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQixRQUFRLHFCQUFSLEVBQStCLFNBQWhEOzs7Ozs7Ozs7OztJQ0FhLFMsV0FBQSxTLEdBU1oscUJBQTBCO0FBQUEsS0FBYixNQUFhLHVFQUFKLEVBQUk7O0FBQUE7O0FBQUEsTUFQMUIsY0FPMEIsR0FQVDtBQUNoQixlQUFhLENBREc7QUFFaEIsWUFBVSxXQUZNO0FBR2hCLFdBQVMsRUFITztBQUloQixjQUFZO0FBSkksRUFPUzs7QUFDekIsS0FBSSxRQUFRLElBQVo7QUFDQSxRQUFPLE1BQVAsQ0FBYyxLQUFLLGNBQW5CLEVBQW1DLE9BQU8sTUFBMUM7O0FBRUEsS0FBSSxNQUFNLE9BQU8sR0FBUCxJQUFjLGtCQUF4QixDQUp5QixDQUltQjtBQUM1QyxLQUFJLFNBQVMsQ0FBQyxPQUFPLElBQVAsSUFBZSxFQUFoQixJQUFzQixJQUFuQyxDQUx5QixDQUtnQjtBQUN6QyxLQUFJLFlBQVksQ0FBaEI7QUFDQSxLQUFJLGFBQWEsSUFBakI7QUFDQSxLQUFJLE1BQU0sSUFBVjtBQUNBLEtBQUksV0FBVyxLQUFmOztBQUVBO0FBQ0E7O0FBRUEsVUFBUyxlQUFULEdBQTRCO0FBQzNCLE1BQUksT0FBTyxTQUFTLG9CQUFULENBQThCLE1BQTlCLEVBQXNDLENBQXRDLENBQVg7QUFDQSxNQUFJLFNBQVMsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQWI7QUFDQSxTQUFPLElBQVAsR0FBYyxpQkFBZDtBQUNBLFNBQU8sTUFBUCxHQUFnQixPQUFPLGtCQUFQLEdBQTRCLFlBQVk7QUFDdkQsT0FBSSxDQUFDLEtBQUssVUFBTixJQUFvQixLQUFLLFVBQUwsS0FBb0IsUUFBeEMsSUFBb0QsS0FBSyxVQUFMLEtBQW9CLFVBQTVFLEVBQXdGO0FB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LENBQWlELEdBQWpEO0FBQ0Esa0JBQWdCLFdBQVcsWUFBWTtBQUN0QyxLQUFFLGVBQUYsRUFBbUIsTUFBbkI7QUFDQSxHQUZlLEVBRWIsSUFGYSxDQUFoQjtBQUdBO0FBQ0QsQzs7a0JBR2EsUzs7O0FBRWYsQ0FBQyxZQUFZO0FBQ1osS0FBSSxTQUFKO0FBQ0EsQ0FGRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vcmVjb3JkZXItaWRlbnRpZnlcIikuUklkZW50aWZ5O1xyXG4iLCJleHBvcnQgY2xhc3MgUklkZW50aWZ5IHtcclxuXHRcclxuXHRyZWNvcmRlckNvbmZpZyA9IHtcclxuXHRcdG51bUNoYW5uZWxzOiAxLFxyXG5cdFx0bWltZVR5cGU6ICdhdWRpby93YXYnLFxyXG5cdFx0Yml0UmF0ZTogMTYsXHJcblx0XHRzYW1wbGVSYXRlOiAxNjAwMFxyXG5cdH1cclxuXHRcclxuXHRjb25zdHJ1Y3RvciAocGFyYW1zID0ge30pIHtcclxuXHRcdGxldCBfdGhpcyA9IHRoaXM7XHJcblx0XHRPYmplY3QuYXNzaWduKHRoaXMucmVjb3JkZXJDb25maWcsIHBhcmFtcy5jb25maWcpO1xyXG5cdFx0XHJcblx0XHRsZXQgdXJsID0gcGFyYW1zLnVybCB8fCAnL3JvYm90L3JzL3FhL2Fzcic7XHQvLyDor7fmsYLnmoR1cmxcclxuXHRcdGxldCB0aW1pbmcgPSAocGFyYW1zLnRpbWUgfHwgMjEpICogMTAwMDtcdC8vIOWumuaXtumVv+W6plxyXG5cdFx0bGV0IHN0YXJ0VGltZSA9IDA7XHJcblx0XHRsZXQgcmVjb3JkVGltZSA9IG51bGw7XHJcblx0XHRsZXQgcmVjID0gbnVsbDtcclxuXHRcdGxldCBpc1JlY29yZCA9IGZhbHNlO1xyXG5cdFx0XHJcblx0XHQvLyDmt7vliqDot6/nlLHmj5Lku7blubbkuJTliJ3lp4vljJbmj5Lku7ZcclxuXHRcdGFkZFJlY29yZFBsdWdpbigpO1xyXG5cdFx0XHJcblx0XHRmdW5jdGlvbiBhZGRSZWNvcmRQbHVnaW4gKCkge1xyXG5cdFx0XHRsZXQgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XHJcblx0XHRcdGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuXHRcdFx0c2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcclxuXHRcdFx0c2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0aWYgKCF0aGlzLnJlYWR5U3RhdGUgfHwgdGhpcy5yZWFkeVN0YXRlID09PSBcImxvYWRlZFwiIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XHJcblx0XHRcdFx0XHQvLyDnm5HlkKzor63pn7Plm77moIfngrnlh7vlvZXpn7Pkuovku7ZcclxuXHRcdFx0XHRcdGdldFJlY29yZFBlcm1pc3Npb24oKVxyXG5cdFx0XHRcdFx0JCgnI3JJZGVudGlmeScpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0Ly8g5byA5aeL5b2V6Z+zXHJcblx0XHRcdFx0XHRcdGlmIChpc1JlY29yZCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFpc1JlY29yZCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0c3RhcnRINVJlY29yZCgpXHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNsb3NlSDVSZWNvcmQoKVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHQvLyDlpoLmnpzmmK91bmRlZmluZWTooajnpLrkuI3lj6/nlKhcclxuXHRcdFx0XHRcdFx0XHRpbnB1dFRpcCgn6K+356Gu6K6k6bqm5YWL6aOO5pyq6KKr56aB55So77yBJylcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdHNjcmlwdC5zcmMgPSAnZGlzdC9yZWNvcmRlci53YXYubWluLmpzJztcclxuXHRcdFx0Ly8gc2NyaXB0LnNyYyA9ICdodHRwczovL2h0LmRzamZ6ai5neHpmLmdvdi5jbi9qc3EvcklkZW50aWZ5L3BsdWdpbnMvcmVjb3JkZXIud2F2Lm1pbi5qcyc7XHJcblx0XHRcdGhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8g6I635Y+W6bqm5YWL6aOO5p2D6ZmQ6L+b6KGM5Yid5aeL5YyWXHJcblx0XHRmdW5jdGlvbiBnZXRSZWNvcmRQZXJtaXNzaW9uICgpIHtcclxuXHRcdFx0bGV0IG5ld1JlYyA9IFJlY29yZGVyKHtcclxuXHRcdFx0XHR0eXBlOiBfdGhpcy5yZWNvcmRlckNvbmZpZy5taW1lVHlwZS5zcGxpdCgnLycpWzFdLFxyXG5cdFx0XHRcdGJpdFJhdGU6IF90aGlzLnJlY29yZGVyQ29uZmlnLmJpdFJhdGUsXHJcblx0XHRcdFx0c2FtcGxlUmF0ZTogX3RoaXMucmVjb3JkZXJDb25maWcuc2FtcGxlUmF0ZSxcclxuXHRcdFx0XHRkaXNhYmxlRW52SW5GaXg6IHRydWUsXHJcblx0XHRcdFx0b25Qcm9jZXNzOiBmdW5jdGlvbiAoYnVmZmVycywgcG93ZXJMZXZlbCwgZHVyYXRpb24sIHNhbXBsZVJhdGUsIG5ld0J1ZmZlcklkeCwgYXN5bmNFbmQpIHtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdFxyXG5cdFx0XHRuZXdSZWMub3BlbihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Ly8g5omT5byA6bqm5YWL6aOO5o6I5p2D6I635b6X55u45YWz6LWE5rqQXHJcblx0XHRcdFx0cmVjID0gbmV3UmVjO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlYylcclxuXHRcdFx0fSwgZnVuY3Rpb24gKG1zZywgaXNVc2VyTm90QWxsb3cpIHtcclxuXHRcdFx0XHQvLyDnlKjmiLfmi5Lnu53mnKrmjojmnYPmiJbkuI3mlK/mjIFcclxuXHRcdFx0XHRpbnB1dFRpcCgoaXNVc2VyTm90QWxsb3cgPyAnVXNlck5vdEFsbG9377yMJyA6ICcnKSArICfmiZPlvIDlvZXpn7PlpLHotKXvvJonICsgbXNnLCAxKVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyDngrnlh7vlvIDlp4vlvZXpn7NcclxuXHRcdGZ1bmN0aW9uIHN0YXJ0SDVSZWNvcmQgKCkge1xyXG5cdFx0XHRpZiAocmVjICYmIFJlY29yZGVyLklzT3BlbigpKSB7XHJcblx0XHRcdFx0cmVjLnN0YXJ0KClcclxuXHRcdFx0XHRpbnB1dFRpcCgn5byA5aeL5b2V6Z+zLi4u5YaN5qyh54K55Ye75b2V6Z+z57uI5q2i77yBJylcclxuXHRcdFx0XHRpc1JlY29yZCA9ICFpc1JlY29yZFxyXG5cdFx0XHRcdHN0YXJ0VGltZSA9IG5ldyBEYXRlKClcclxuXHRcdFx0XHRyZWNvcmRUaW1lID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0Ly8gMjDnp5JcclxuXHRcdFx0XHRcdGlmIChzdGFydFRpbWUgJiYgbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpID49IHRpbWluZykge1xyXG5cdFx0XHRcdFx0XHRjbG9zZUg1UmVjb3JkKClcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LCB0aW1pbmcpXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aW5wdXRUaXAoJ+acquaJk+W8gOW9lemfsycpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8g57uT5p2f5b2V6Z+zXHJcblx0XHRmdW5jdGlvbiBjbG9zZUg1UmVjb3JkICgpIHtcclxuXHRcdFx0aWYgKHJlYykge1xyXG5cdFx0XHRcdHJlYy5zdG9wKGZ1bmN0aW9uIChibG9iLCBkdXJhdGlvbikge1xyXG5cdFx0XHRcdFx0aXNSZWNvcmQgPSAhaXNSZWNvcmRcclxuXHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwocmVjb3JkVGltZSlcclxuXHRcdFx0XHRcdGlmIChzdGFydFRpbWUgJiYgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKSA8IDEwMDApKSB7XHJcblx0XHRcdFx0XHRcdC8vIOWwj+S6jjHnp5LlvZPmsqHor7Tor51cclxuXHRcdFx0XHRcdFx0c3RhcnRUaW1lID0gMFxyXG5cdFx0XHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHN0YXJ0VGltZSA9IDBcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKGJsb2Iuc2l6ZSA8IDIwMDAwKSB7XHJcblx0XHRcdFx0XHRcdGlucHV0VGlwKCflvZXpn7PlpKrnn63kuI3lj6/nlKjvvIEnKVxyXG5cdFx0XHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGlucHV0VGlwKCflvZXpn7Pnu5PmnZ8uLi4nKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YXVkaW9JZGVudGlmeShibG9iKVxyXG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChtc2cpIHtcclxuXHRcdFx0XHRcdGlucHV0VGlwKCflvZXpn7PlpLHotKU6JyArIG1zZylcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIOmfs+mikeivhuWIq+aIkOS4reaWh1xyXG5cdFx0ZnVuY3Rpb24gYXVkaW9JZGVudGlmeSAoYmxvYikge1xyXG5cdFx0XHRsZXQgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxyXG5cdFx0XHRmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBibG9iLCBuZXcgRGF0ZSgpLmdldFRpbWUoKSArICcuJyArIF90aGlzLnJlY29yZGVyQ29uZmlnLm1pbWVUeXBlLnNwbGl0KCcvJylbMV0pXHJcblx0XHRcdCQuYWpheCh7XHJcblx0XHRcdFx0dXJsOiB1cmwsXHJcblx0XHRcdFx0dHlwZTogJ3Bvc3QnLFxyXG5cdFx0XHRcdGRhdGE6IGZvcm1EYXRhLFxyXG5cdFx0XHRcdHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuXHRcdFx0XHRjb250ZW50VHlwZTogZmFsc2UsXHJcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xyXG5cdFx0XHRcdFx0aWYgKHJlcy5kYXRhKSB7XHJcblx0XHRcdFx0XHRcdGlmICgkKCcjcklkZW50aWZ5JykuZGF0YSgnc2VhcmNoLWlkJykpIHtcclxuXHRcdFx0XHRcdFx0XHQkKCcjJyArICQoJyNySWRlbnRpZnknKS5kYXRhKCdzZWFyY2gtaWQnKSkudmFsKHJlcy5kYXRhKVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24gKGVycm9yKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcilcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIOW9lemfs+aPkOekulxyXG5cdFx0bGV0IHNldFRpbWVvdXRUaXAgPSBudWxsO1xyXG5cdFx0XHJcblx0XHRmdW5jdGlvbiBpbnB1dFRpcCAobWVzc2FnZSkge1xyXG5cdFx0XHRpZiAoc2V0VGltZW91dFRpcCAmJiAkKCcjcklkZW50aWZ5VGlwJykpIHtcclxuXHRcdFx0XHRjbGVhclRpbWVvdXQoc2V0VGltZW91dFRpcCk7XHJcblx0XHRcdFx0JCgnI3JJZGVudGlmeVRpcCcpLnJlbW92ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG5cdFx0XHRkaXYuaWQgPSAncklkZW50aWZ5VGlwJztcclxuXHRcdFx0ZGl2LnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246IGFic29sdXRlOyB0b3A6ICcgKyAoJCgnI3JJZGVudGlmeScpWzBdLm9mZnNldFRvcCAtIDIwKSArXHJcblx0XHRcdFx0J3B4O2xlZnQ6ICcgKyAkKCcjcklkZW50aWZ5JylbMF0ub2Zmc2V0TGVmdCArICdweDtib3JkZXItcmFkaXVzOiA4cHg7bWFyZ2luLXRvcDogLTE1cHg7JyArXHJcblx0XHRcdFx0J2NvbG9yOiAjZmZmO2JhY2tncm91bmQtY29sb3I6ICM0MDllZmY7cGFkZGluZzogNXB4IDA7ei1pbmRleDogMjE0NzQ4MzY0NzsnXHJcblx0XHRcdGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXHJcblx0XHRcdHNwYW4uaW5uZXJUZXh0ID0gbWVzc2FnZTtcclxuXHRcdFx0c3Bhbi5zdHlsZS5jc3NUZXh0ID0gJ21hcmdpbjogMCAxMHB4OydcclxuXHRcdFx0ZGl2LmFwcGVuZENoaWxkKHNwYW4pXHJcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdySWRlbnRpZnknKS5hcHBlbmRDaGlsZChkaXYpXHJcblx0XHRcdHNldFRpbWVvdXRUaXAgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQkKCcjcklkZW50aWZ5VGlwJykucmVtb3ZlKClcclxuXHRcdFx0fSwgMjAwMClcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJJZGVudGlmeTtcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblx0bmV3IFJJZGVudGlmeSgpO1xyXG59KSgpXHJcbiJdfQ==
