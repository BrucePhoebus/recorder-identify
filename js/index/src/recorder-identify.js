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
		let startTime = 0;	// 开始录音时间
		let recordTime = null;	// 录音定时器
		let message = null;	// 暂存提示信息
		let recorder = null;	// 录音插件对象
		let isRecord = false;
		
		// 添加路由插件并且初始化插件
		addRecordPlugin();
		
		function addRecordPlugin () {
			getRecordPermission();
			// 监听语音按钮鼠标按下事件
			document.getElementById('rIdentify').addEventListener('mousedown', function () {
				// 开始录音
				if (!isIE()) {
					startRecord()
				} else {
					// 如果是undefined表示不可用
					inputTip('IE浏览器不可录音！')
				}
			})
			// 监听语音按钮鼠标释放事件
			document.getElementById('rIdentify').addEventListener('mouseup', function () {
				// 开始录音
				if (!isIE()) {
					stopRecord()
					HZRecorder.get(function (rec) {
						recorder = rec;
					});
				} else {
					// 如果是undefined表示不可用
					inputTip('IE浏览器不可录音！')
				}
			})
			// 监听input change事件是否手动创建成功
			document.getElementById(document.getElementById('rIdentify').getAttribute('data-search-id')).addEventListener('change', function (e) {
				console.log('change事件：', e.target.value)
			})
		}
		
		// 获取麦克风权限进行初始化
		function getRecordPermission () {
			HZRecorder.get(function (rec) {
				recorder = rec;
			});
		}
		
		let recordTipObj = null,
			point = '';
		
		// 点击开始录音
		function startRecord () {
			if (recordTipObj) {
				clearInterval(recordTipObj)
				recordTipObj = null;
			}
			if (recorder) {
				recorder.start()
				setTimeout(() => {
					inputTip(point + '.');
				}, 200)
				recordTipObj = setInterval(() => {
					point += '.'
					inputTip(point);
				}, 800);
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
			recordTipObj = null;
			point = ''
			if (recorder) {
				recorder.stop();
				let blob = recorder.getBlob()
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
			tipElement.style.cssText = 'position: fixed; top: ' + (getTop(document.getElementById('rIdentify')) - 20) +
				'px;left: ' + getLeft(document.getElementById('rIdentify')) + 'px;border-radius: 8px;margin-top: -15px;' +
				'color: #fff;background-color: #409eff;padding: 5px 0;z-index: 2147483647;'
			let span = document.createElement('span')
			span.innerText = message;
			span.title = message;
			span.style.cssText = 'margin: 0 10px;white-space: nowrap;'
			tipElement.appendChild(span)
			document.getElementById('rIdentify').parentNode.appendChild(tipElement)
			setTimeoutTip = setTimeout(() => {
				tipElement = document.getElementById('rIdentifyTip');
				tipElement.parentNode.removeChild(tipElement);
			}, 1000)
		}
		
		// 获取纵坐标
		function getTop (element) {
			return element.getBoundingClientRect().top;
		}
		
		//获取横坐标
		function getLeft (element) {
			return element.getBoundingClientRect().left;
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
			xhr.upload.addEventListener("progress", function (result) {
				if (result.lengthComputable) {
					// 上传进度
					let percent = (result.loaded / result.total * 100).toFixed(0);
					console.log('上传进度：', percent, '%')
				}
			}, false);
			// 请求结束回调
			xhr.addEventListener("readystatechange", function () {
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
		
		/*
		* IE判断
		* */
		function isIE () {
			return (window.navigator.userAgentbw && window.navigator.userAgentbw.indexOf('MSIE') >= 0) || 'ActiveXObject' in window
		}
	}
}

export default RIdentify;

(function () {
	new RIdentify();
})()
