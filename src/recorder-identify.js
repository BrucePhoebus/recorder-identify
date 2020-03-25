export class RIdentify {
	
	recorderConfig = {
		numChannels: 1,
		mimeType: 'audio/wav',
		bitRate: 16,
		sampleRate: 16000
	}
	
	constructor (params = {}) {
		let _this = this;
		Object.assign(this.recorderConfig, params.config);
		
		let url = params.url || '/robot/rs/qa/asr';	// 请求的url
		let timing = (params.time || 21) * 1000;	// 定时长度
		let startTime = 0;
		let recordTime = null;
		let rec = null;
		let isRecord = false;
		
		// 添加路由插件并且初始化插件
		addRecordPlugin();
		
		function addRecordPlugin () {
			getRecordPermission();
			// 监听语音按钮鼠标按下事件
			document.getElementById('rIdentify').addEventListener('mousedown', function () {
				// 开始录音
				if (isRecord !== undefined) {
					startRecord()
				} else {
					// 如果是undefined表示不可用
					inputTip('请确认麦克风未被禁用！')
				}
			})
			// 监听语音按钮鼠标释放事件
			document.getElementById('rIdentify').addEventListener('mouseup', function () {
				// 开始录音
				if (isRecord !== undefined) {
					stopRecord()
				} else {
					// 如果是undefined表示不可用
					inputTip('请确认麦克风未被禁用！')
				}
			})
			
			document.getElementById(document.getElementById('rIdentify').getAttribute('data-search-id')).addEventListener('change', function (e) {
				console.log('change事件：', e.target.value)
			})
		}
		
		// 获取麦克风权限进行初始化
		function getRecordPermission () {
			let newRec = Recorder({
				type: _this.recorderConfig.mimeType.split('/')[1],
				bitRate: _this.recorderConfig.bitRate,
				sampleRate: _this.recorderConfig.sampleRate,
				disableEnvInFix: true,
				onProcess: function (buffers, powerLevel, duration, sampleRate, newBufferIdx, asyncEnd) {
				}
			})
			
			newRec.open(function () {
				// 打开麦克风授权获得相关资源
				rec = newRec;
			}, function (msg, isUserNotAllow) {
				// 用户拒绝未授权或不支持
				inputTip((isUserNotAllow ? 'UserNotAllow，' : '') + '打开录音失败：' + msg, 1)
			})
		}
		
		let recordTipObj = null,
			point = '';
		
		// 点击开始录音
		function startRecord () {
			if (rec && Recorder.IsOpen()) {
				rec.start()
				inputTip(point + '.');
				recordTipObj = setInterval(() => {
					point += '.'
					inputTip(point);
				}, 1000);
				isRecord = !isRecord
				startTime = new Date()
				recordTime = setInterval(function () {
					// 20秒
					if (startTime && new Date().getTime() - startTime.getTime() >= timing) {
						stopRecord()
					}
				}, timing)
			} else {
				inputTip('未打开录音')
			}
		}
		
		// 结束录音
		function stopRecord () {
			clearInterval(recordTipObj)
			point = ''
			if (rec) {
				rec.stop(function (blob, duration) {
					isRecord = !isRecord
					clearInterval(recordTime)
					if (startTime && (new Date().getTime() - startTime.getTime() < 1000)) {
						// 小于1秒当没说话
						startTime = 0
						return
					}
					startTime = 0
					
					if (blob.size < 20000) {
						inputTip('录音太短不可用！')
						return
					}
					audioIdentify(blob)
				}, function (msg) {
					inputTip('录音失败:' + msg)
				})
			}
		}
		
		// 音频识别成中文
		function audioIdentify (blob) {
			let formData = new FormData()
			formData.append('file', blob, new Date().getTime() + '.' + _this.recorderConfig.mimeType.split('/')[1])
			ajax({
				url: url,
				type: 'post',
				data: formData,
				processData: false,
				contentType: false,
				success: function (res) {
					res = JSON.parse(res);
					if (res.data) {
						let inputId = document.getElementById('rIdentify').getAttribute('data-search-id');
						if (inputId) {
							document.getElementById(inputId).value = res.data;
							triggerEvent(document.getElementById(inputId), 'change')
						}
					}
				},
				error: function (error) {
					console.log(error)
				}
			})
		}
		
		// 手动触发input change事件
		function triggerEvent (element, eventName) {
			if (typeof (element) == 'object') {
				eventName = eventName.replace(/^on/i, '');
				if (document.all) {
					eventName = "on" + eventName;
					element.triggerEvent(eventName);
				} else {
					var evt = document.createEvent('HTMLEvents');
					evt.initEvent(eventName, true, true);
					element.dispatchEvent(evt);
				}
			}
		}
		
		// 手动触发input change事件
		function triggerEvent (element, eventName) {
			if (typeof (element) == 'object') {
				eventName = eventName.replace(/^on/i, '');
				if (document.all) {
					eventName = "on" + eventName;
					element.triggerEvent(eventName);
				} else {
					var evt = document.createEvent('HTMLEvents');
					evt.initEvent(eventName, true, true);
					element.dispatchEvent(evt);
				}
			}
		}
		
		// 录音提示
		let setTimeoutTip = null;
		
		function inputTip (message) {
			let tipElement = document.getElementById('rIdentifyTip');
			if (tipElement) {
				tipElement.parentNode.removeChild(tipElement);
				if (setTimeoutTip) clearTimeout(setTimeoutTip);
			}
			tipElement = document.createElement('div')
			tipElement.id = 'rIdentifyTip';
			tipElement.style.cssText = 'position: absolute; top: ' + (getPoint(document.getElementById('rIdentify')).offsetTop - 20) +
				'px;left: ' + getPoint(document.getElementById('rIdentify')).offsetLeft + 'px;border-radius: 8px;margin-top: -15px;' +
				'color: #fff;background-color: #409eff;padding: 5px 0;z-index: 2147483647;'
			let span = document.createElement('span')
			span.innerText = message;
			span.style.cssText = 'margin: 0 10px;white-space: nowrap;'
			tipElement.appendChild(span)
			document.getElementById('rIdentify').parentNode.appendChild(tipElement)
			setTimeoutTip = setTimeout(() => {
				tipElement = document.getElementById('rIdentifyTip');
				tipElement.parentNode.removeChild(tipElement);
			}, 3000)
		}
		
		function getPoint(obj) { //获取某元素以浏览器左上角为原点的坐标
			var t = obj.offsetTop; //获取该元素对应父容器的上边距
			var l = obj.offsetLeft; //对应父容器的上边距
			//判断是否有父容器，如果存在则累加其边距
			while (obj = obj.offsetParent) {//等效 obj = obj.offsetParent;while (obj != undefined)
				t += obj.offsetTop; //叠加父容器的上边距
				l += obj.offsetLeft; //叠加父容器的左边距
			}
			return {
				offsetTop: t,
				offsetLeft: l
			}
		}
		
		/*
		* 封装ajax函数
		* @param {string}opt.type http连接的方式，包括POST和GET两种方式
		* @param {string}opt.url 发送请求的url
		* @param {boolean}opt.async 是否为异步请求，true为异步的，false为同步的
		* @param {object}opt.data 发送的参数，格式为对象类型
		* @param {function}opt.success ajax发送并接收成功调用的回调函数
		*/
		function ajax (opt) {
			opt = opt || {};
			opt.type = opt.type.toUpperCase() || 'GET';
			opt.url = opt.url || '';
			opt.async = opt.async || true;
			opt.data = opt.data || null;
			opt.success = opt.success || function () {
			};
			opt.error = opt.error || function (err) {
				console.log(err)
			};
			var xhr = null;
			if (XMLHttpRequest) {
				xhr = new XMLHttpRequest();
			} else {
				xhr = new ActiveXObject('Microsoft.xhr');
			}
			
			// 上传进度事件
			xhr.upload.addEventListener("progress", function(result) {
				if (result.lengthComputable) {
					// 上传进度
					let percent = (result.loaded / result.total * 100).toFixed(0);
					console.log('上传进度：', percent, '%')
				}
			}, false);
			// 请求结束回调
			xhr.addEventListener("readystatechange", function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					opt.success(xhr.response);
				}
			});
			
			if (opt.type.toUpperCase() === 'POST') {
				xhr.open(opt.type, opt.url, opt.async);
				xhr.send(opt.data);
			} else if (opt.type.toUpperCase() === 'GET') {
				var params = [];
				for (var key in opt.data) {
					params.push(key + '=' + opt.data[key]);
				}
				var postData = params.join('&');
				xhr.open(opt.type, opt.url + '?' + postData, opt.async);
				xhr.send(null);
			}
		}
	}
}

export default RIdentify;

(function () {
	new RIdentify();
})()
