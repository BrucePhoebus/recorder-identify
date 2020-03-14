(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rIdentify = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = require("./recorder-identify").RIdentify;

},{"./recorder-identify":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

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
		script.src = 'https://ht.dsjfzj.gxzf.gov.cn/jsq/rIdentify/plugins/recorder.wav.min.js';
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

},{}]},{},[1])(1)
});
