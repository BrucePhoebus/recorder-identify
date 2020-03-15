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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcmVjb3JkZXItaWRlbnRpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQixRQUFRLHFCQUFSLEVBQStCLFNBQWhEOzs7Ozs7Ozs7OztJQ0FhLFMsV0FBQSxTLEdBU1oscUJBQTBCO0FBQUEsS0FBYixNQUFhLHVFQUFKLEVBQUk7O0FBQUE7O0FBQUEsTUFQMUIsY0FPMEIsR0FQVDtBQUNoQixlQUFhLENBREc7QUFFaEIsWUFBVSxXQUZNO0FBR2hCLFdBQVMsRUFITztBQUloQixjQUFZO0FBSkksRUFPUzs7QUFDekIsS0FBSSxRQUFRLElBQVo7QUFDQSxRQUFPLE1BQVAsQ0FBYyxLQUFLLGNBQW5CLEVBQW1DLE9BQU8sTUFBMUM7O0FBRUEsS0FBSSxNQUFNLE9BQU8sR0FBUCxJQUFjLGtCQUF4QixDQUp5QixDQUltQjtBQUM1QyxLQUFJLFNBQVMsQ0FBQyxPQUFPLElBQVAsSUFBZSxFQUFoQixJQUFzQixJQUFuQyxDQUx5QixDQUtnQjtBQUN6QyxLQUFJLFlBQVksQ0FBaEI7QUFDQSxLQUFJLGFBQWEsSUFBakI7QUFDQSxLQUFJLE1BQU0sSUFBVjtBQUNBLEtBQUksV0FBVyxLQUFmOztBQUVBO0FBQ0E7O0FBRUEsVUFBUyxlQUFULEdBQTRCO0FBQzNCO0FBQ0EsSUFBRSxZQUFGLEVBQWdCLEtBQWhCLENBQXNCLFlBQVk7QUFDakM7QUFDQSxPQUFJLGFBQWEsU0FBakIsRUFBNEI7QUFDM0IsUUFBSSxDQUFDLFFBQUwsRUFBZTtBQUNkO0FBQ0EsS0FGRCxNQUVPO0FBQ047QUFDQTtBQUNELElBTkQsTUFNTztBQUNOO0FBQ0EsYUFBUyxhQUFUO0FBQ0E7QUFDRCxHQVpEO0FBYUE7O0FBRUQ7QUFDQSxVQUFTLG1CQUFULEdBQWdDO0FBQy9CLE1BQUksU0FBUyxTQUFTO0FBQ3JCLFNBQU0sTUFBTSxjQUFO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QWZLLEdBQVA7QUFpQkE7O0FBRUQ7QUFDQSxLQUFJLGdCQUFnQixJQUFwQjs7QUFFQSxVQUFTLFFBQVQsQ0FBbUIsT0FBbkIsRUFBNEI7QUFDM0IsTUFBSSxpQkFBaUIsRUFBRSxlQUFGLENBQXJCLEVBQXlDO0FBQ3hDLGdCQUFhLGFBQWI7QUFDQSxLQUFFLGVBQUYsRUFBbUIsTUFBbkI7QUFDQTtBQUNELE1BQUksTUFBTSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBVjtBQUNBLE1BQUksRUFBSixHQUFTLGNBQVQ7QUFDQSxNQUFJLEtBQUosQ0FBVSxPQUFWLEdBQW9CLCtCQUErQixFQUFFLFlBQUYsRUFBZ0IsQ0FBaEIsRUFBbUIsU0FBbkIsR0FBK0IsRUFBOUQsSUFDbkIsV0FEbUIsR0FDTCxFQUFFLFlBQUYsRUFBZ0IsQ0FBaEIsRUFBbUIsVUFEZCxHQUMyQiwwQ0FEM0IsR0FFbkIsMkVBRkQ7QUFHQSxNQUFJLE9BQU8sU0FBUyxhQUFULENBQXVCLE1BQXZCLENBQVg7QUFDQSxPQUFLLFNBQUwsR0FBaUIsT0FBakI7QUFDQSxPQUFLLEtBQUwsQ0FBVyxPQUFYLEdBQXFCLGlCQUFyQjtBQUNBLE1BQUksV0FBSixDQUFnQixJQUFoQjtBQUNBLFdBQVMsY0FBVCxDQUF3QixXQUF4QixFQUFxQyxXQUFyQyxDQUFpRCxHQUFqRDtBQUNBLGtCQUFnQixXQUFXLFlBQVk7QUFDdEMsS0FBRSxlQUFGLEVBQW1CLE1BQW5CO0FBQ0EsR0FGZSxFQUViLElBRmEsQ0FBaEI7QUFHQTtBQUNELEM7O2tCQUdhLFM7OztBQUVmLENBQUMsWUFBWTtBQUNaLEtBQUksU0FBSjtBQUNBLENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3JlY29yZGVyLWlkZW50aWZ5XCIpLlJJZGVudGlmeTtcclxuIiwiZXhwb3J0IGNsYXNzIFJJZGVudGlmeSB7XHJcblx0XHJcblx0cmVjb3JkZXJDb25maWcgPSB7XHJcblx0XHRudW1DaGFubmVsczogMSxcclxuXHRcdG1pbWVUeXBlOiAnYXVkaW8vd2F2JyxcclxuXHRcdGJpdFJhdGU6IDE2LFxyXG5cdFx0c2FtcGxlUmF0ZTogMTYwMDBcclxuXHR9XHJcblx0XHJcblx0Y29uc3RydWN0b3IgKHBhcmFtcyA9IHt9KSB7XHJcblx0XHRsZXQgX3RoaXMgPSB0aGlzO1xyXG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLnJlY29yZGVyQ29uZmlnLCBwYXJhbXMuY29uZmlnKTtcclxuXHRcdFxyXG5cdFx0bGV0IHVybCA9IHBhcmFtcy51cmwgfHwgJy9yb2JvdC9ycy9xYS9hc3InO1x0Ly8g6K+35rGC55qEdXJsXHJcblx0XHRsZXQgdGltaW5nID0gKHBhcmFtcy50aW1lIHx8IDIxKSAqIDEwMDA7XHQvLyDlrprml7bplb/luqZcclxuXHRcdGxldCBzdGFydFRpbWUgPSAwO1xyXG5cdFx0bGV0IHJlY29yZFRpbWUgPSBudWxsO1xyXG5cdFx0bGV0IHJlYyA9IG51bGw7XHJcblx0XHRsZXQgaXNSZWNvcmQgPSBmYWxzZTtcclxuXHRcdFxyXG5cdFx0Ly8g5re75Yqg6Lev55Sx5o+S5Lu25bm25LiU5Yid5aeL5YyW5o+S5Lu2XHJcblx0XHRhZGRSZWNvcmRQbHVnaW4oKTtcclxuXHRcdFxyXG5cdFx0ZnVuY3Rpb24gYWRkUmVjb3JkUGx1Z2luICgpIHtcclxuXHRcdFx0Z2V0UmVjb3JkUGVybWlzc2lvbigpO1xyXG5cdFx0XHQkKCcjcklkZW50aWZ5JykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdC8vIOW8gOWni+W9lemfs1xyXG5cdFx0XHRcdGlmIChpc1JlY29yZCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRpZiAoIWlzUmVjb3JkKSB7XHJcblx0XHRcdFx0XHRcdHN0YXJ0SDVSZWNvcmQoKVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Y2xvc2VINVJlY29yZCgpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIOWmguaenOaYr3VuZGVmaW5lZOihqOekuuS4jeWPr+eUqFxyXG5cdFx0XHRcdFx0aW5wdXRUaXAoJ+ivt+ehruiupOm6puWFi+mjjuacquiiq+emgeeUqO+8gScpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyDojrflj5bpuqblhYvpo47mnYPpmZDov5vooYzliJ3lp4vljJZcclxuXHRcdGZ1bmN0aW9uIGdldFJlY29yZFBlcm1pc3Npb24gKCkge1xyXG5cdFx0XHRsZXQgbmV3UmVjID0gUmVjb3JkZXIoe1xyXG5cdFx0XHRcdHR5cGU6IF90aGlzLnJlY29yZGVyQ29uZmlnLm1pbWVUeXBlLnNwbGl0KCcvJylbMV0sXHJcblx0XHRcdFx0Yml0UmF0ZTogX3RoaXMucmVjb3JkZXJDb25maWcuYml0UmF0ZSxcclxuXHRcdFx0XHRzYW1wbGVSYXRlOiBfdGhpcy5yZWNvcmRlckNvbmZpZy5zYW1wbGVSYXRlLFxyXG5cdFx0XHRcdGRpc2FibGVFbnZJbkZpeDogdHJ1ZSxcclxuXHRcdFx0XHRvblByb2Nlc3M6IGZ1bmN0aW9uIChidWZmZXJzLCBwb3dlckxldmVsLCBkdXJhdGlvbiwgc2FtcGxlUmF0ZSwgbmV3QnVmZmVySWR4LCBhc3luY0VuZCkge1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0XHJcblx0XHRcdG5ld1JlYy5vcGVuKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHQvLyDmiZPlvIDpuqblhYvpo47mjojmnYPojrflvpfnm7jlhbPotYTmupBcclxuXHRcdFx0XHRyZWMgPSBuZXdSZWM7XHJcblx0XHRcdFx0Y29uc29sZS5sb2cocmVjKVxyXG5cdFx0XHR9LCBmdW5jdGlvbiAobXNnLCBpc1VzZXJOb3RBbGxvdykge1xyXG5cdFx0XHRcdC8vIOeUqOaIt+aLkue7neacquaOiOadg+aIluS4jeaUr+aMgVxyXG5cdFx0XHRcdGlucHV0VGlwKChpc1VzZXJOb3RBbGxvdyA/ICdVc2VyTm90QWxsb3fvvIwnIDogJycpICsgJ+aJk+W8gOW9lemfs+Wksei0pe+8micgKyBtc2csIDEpXHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIOeCueWHu+W8gOWni+W9lemfs1xyXG5cdFx0ZnVuY3Rpb24gc3RhcnRINVJlY29yZCAoKSB7XHJcblx0XHRcdGlmIChyZWMgJiYgUmVjb3JkZXIuSXNPcGVuKCkpIHtcclxuXHRcdFx0XHRyZWMuc3RhcnQoKVxyXG5cdFx0XHRcdGlucHV0VGlwKCflvIDlp4vlvZXpn7MuLi7lho3mrKHngrnlh7vlvZXpn7Pnu4jmraLvvIEnKVxyXG5cdFx0XHRcdGlzUmVjb3JkID0gIWlzUmVjb3JkXHJcblx0XHRcdFx0c3RhcnRUaW1lID0gbmV3IERhdGUoKVxyXG5cdFx0XHRcdHJlY29yZFRpbWUgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHQvLyAyMOenklxyXG5cdFx0XHRcdFx0aWYgKHN0YXJ0VGltZSAmJiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCkgPj0gdGltaW5nKSB7XHJcblx0XHRcdFx0XHRcdGNsb3NlSDVSZWNvcmQoKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sIHRpbWluZylcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpbnB1dFRpcCgn5pyq5omT5byA5b2V6Z+zJylcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyDnu5PmnZ/lvZXpn7NcclxuXHRcdGZ1bmN0aW9uIGNsb3NlSDVSZWNvcmQgKCkge1xyXG5cdFx0XHRpZiAocmVjKSB7XHJcblx0XHRcdFx0cmVjLnN0b3AoZnVuY3Rpb24gKGJsb2IsIGR1cmF0aW9uKSB7XHJcblx0XHRcdFx0XHRpc1JlY29yZCA9ICFpc1JlY29yZFxyXG5cdFx0XHRcdFx0Y2xlYXJJbnRlcnZhbChyZWNvcmRUaW1lKVxyXG5cdFx0XHRcdFx0aWYgKHN0YXJ0VGltZSAmJiAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpIDwgMTAwMCkpIHtcclxuXHRcdFx0XHRcdFx0Ly8g5bCP5LqOMeenkuW9k+ayoeivtOivnVxyXG5cdFx0XHRcdFx0XHRzdGFydFRpbWUgPSAwXHJcblx0XHRcdFx0XHRcdHJldHVyblxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0c3RhcnRUaW1lID0gMFxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAoYmxvYi5zaXplIDwgMjAwMDApIHtcclxuXHRcdFx0XHRcdFx0aW5wdXRUaXAoJ+W9lemfs+WkquefreS4jeWPr+eUqO+8gScpXHJcblx0XHRcdFx0XHRcdHJldHVyblxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0aW5wdXRUaXAoJ+W9lemfs+e7k+adny4uLicpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRhdWRpb0lkZW50aWZ5KGJsb2IpXHJcblx0XHRcdFx0fSwgZnVuY3Rpb24gKG1zZykge1xyXG5cdFx0XHRcdFx0aW5wdXRUaXAoJ+W9lemfs+Wksei0pTonICsgbXNnKVxyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8g6Z+z6aKR6K+G5Yir5oiQ5Lit5paHXHJcblx0XHRmdW5jdGlvbiBhdWRpb0lkZW50aWZ5IChibG9iKSB7XHJcblx0XHRcdGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXHJcblx0XHRcdGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGJsb2IsIG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgJy4nICsgX3RoaXMucmVjb3JkZXJDb25maWcubWltZVR5cGUuc3BsaXQoJy8nKVsxXSlcclxuXHRcdFx0JC5hamF4KHtcclxuXHRcdFx0XHR1cmw6IHVybCxcclxuXHRcdFx0XHR0eXBlOiAncG9zdCcsXHJcblx0XHRcdFx0ZGF0YTogZm9ybURhdGEsXHJcblx0XHRcdFx0cHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG5cdFx0XHRcdGNvbnRlbnRUeXBlOiBmYWxzZSxcclxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XHJcblx0XHRcdFx0XHRpZiAocmVzLmRhdGEpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCQoJyNySWRlbnRpZnknKS5kYXRhKCdzZWFyY2gtaWQnKSkge1xyXG5cdFx0XHRcdFx0XHRcdCQoJyMnICsgJCgnI3JJZGVudGlmeScpLmRhdGEoJ3NlYXJjaC1pZCcpKS52YWwocmVzLmRhdGEpXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8g5b2V6Z+z5o+Q56S6XHJcblx0XHRsZXQgc2V0VGltZW91dFRpcCA9IG51bGw7XHJcblx0XHRcclxuXHRcdGZ1bmN0aW9uIGlucHV0VGlwIChtZXNzYWdlKSB7XHJcblx0XHRcdGlmIChzZXRUaW1lb3V0VGlwICYmICQoJyNySWRlbnRpZnlUaXAnKSkge1xyXG5cdFx0XHRcdGNsZWFyVGltZW91dChzZXRUaW1lb3V0VGlwKTtcclxuXHRcdFx0XHQkKCcjcklkZW50aWZ5VGlwJykucmVtb3ZlKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0bGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcblx0XHRcdGRpdi5pZCA9ICdySWRlbnRpZnlUaXAnO1xyXG5cdFx0XHRkaXYuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogJyArICgkKCcjcklkZW50aWZ5JylbMF0ub2Zmc2V0VG9wIC0gMjApICtcclxuXHRcdFx0XHQncHg7bGVmdDogJyArICQoJyNySWRlbnRpZnknKVswXS5vZmZzZXRMZWZ0ICsgJ3B4O2JvcmRlci1yYWRpdXM6IDhweDttYXJnaW4tdG9wOiAtMTVweDsnICtcclxuXHRcdFx0XHQnY29sb3I6ICNmZmY7YmFja2dyb3VuZC1jb2xvcjogIzQwOWVmZjtwYWRkaW5nOiA1cHggMDt6LWluZGV4OiAyMTQ3NDgzNjQ3OydcclxuXHRcdFx0bGV0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcclxuXHRcdFx0c3Bhbi5pbm5lclRleHQgPSBtZXNzYWdlO1xyXG5cdFx0XHRzcGFuLnN0eWxlLmNzc1RleHQgPSAnbWFyZ2luOiAwIDEwcHg7J1xyXG5cdFx0XHRkaXYuYXBwZW5kQ2hpbGQoc3BhbilcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JJZGVudGlmeScpLmFwcGVuZENoaWxkKGRpdilcclxuXHRcdFx0c2V0VGltZW91dFRpcCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdCQoJyNySWRlbnRpZnlUaXAnKS5yZW1vdmUoKVxyXG5cdFx0XHR9LCAyMDAwKVxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUklkZW50aWZ5O1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuXHRuZXcgUklkZW50aWZ5KCk7XHJcbn0pKClcclxuIl19
