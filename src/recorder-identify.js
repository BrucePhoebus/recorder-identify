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
			$('#rIdentify').click(function () {
				// 开始录音
				if (isRecord !== undefined) {
					if (!isRecord) {
						startH5Record()
					} else {
						closeH5Record()
					}
				} else {
					// 如果是undefined表示不可用
					inputTip('请确认麦克风未被禁用！')
				}
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
		
		// 点击开始录音
		function startH5Record () {
			if (rec && Recorder.IsOpen()) {
				rec.start()
				inputTip('开始录音');
				isRecord = !isRecord
				startTime = new Date()
				recordTime = setInterval(function () {
					// 20秒
					if (startTime && new Date().getTime() - startTime.getTime() >= timing) {
						closeH5Record()
					}
				}, timing)
			} else {
				inputTip('未打开录音')
			}
		}
		
		// 结束录音
		function closeH5Record () {
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
					} else {
						inputTip('录音结束')
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
			$.ajax({
				url: url,
				type: 'post',
				data: formData,
				processData: false,
				contentType: false,
				success: function (res) {
					if (res.data) {
						if ($('#rIdentify').data('search-id')) {
							$('#' + $('#rIdentify').data('search-id')).val(res.data)
						}
					}
				},
				error: function (error) {
					console.log(error)
				}
			})
		}
		
		// 录音提示
		let setTimeoutTip = null;
		
		function inputTip (message) {
			if ($('#rIdentifyTip')) {
				$('#rIdentifyTip').remove();
				if(setTimeoutTip) clearTimeout(setTimeoutTip);
			}
			let div = document.createElement('div')
			div.id = 'rIdentifyTip';
			div.style.cssText = 'position: absolute; top: ' + ($('#rIdentify')[0].offsetTop - 20) +
				'px;left: ' + $('#rIdentify')[0].offsetLeft + 'px;border-radius: 8px;margin-top: -15px;' +
				'color: #fff;background-color: #409eff;padding: 5px 0;z-index: 2147483647;'
			let span = document.createElement('span')
			span.innerText = message;
			span.style.cssText = 'margin: 0 10px;white-space: nowrap;'
			div.appendChild(span)
			$('#rIdentify').after(div)
			setTimeoutTip = setTimeout(function () {
				$('#rIdentifyTip').remove()
			}, 6000)
		}
	}
}

export default RIdentify;

(function () {
	new RIdentify();
})()
