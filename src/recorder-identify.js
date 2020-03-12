export class rIdentify {
	
	startTime = 0;
	recordTime = null;
	rec = null;
	isRecord = false;
	recorderConfig = {
		numChannels: 1,
		mimeType: 'audio/wav',
		bitRate: 16,
		sampleRate: 16000
	}
	
	init () {
		// 监听语音图标点击录音事件
		this.getRecordPermission()
	}
	
	// 获取麦克风权限进行初始化
	getRecordPermission () {
		this.newRec = Recorder({
			type: recorderConfig.mimeType.split('/')[1],
			bitRate: recorderConfig.bitRate,
			sampleRate: recorderConfig.sampleRate,
			disableEnvInFix: true,
			onProcess: function(buffers, powerLevel, duration, sampleRate, newBufferIdx, asyncEnd) {
			}
		})
		
		this.newRec.open(function() {
			// 打开麦克风授权获得相关资源
			rec = newRec
			console.log(rec)
		}, function(msg, isUserNotAllow) {
			// 用户拒绝未授权或不支持
			alert((isUserNotAllow ? 'UserNotAllow，' : '') + '打开录音失败：' + msg, 1)
		})
	}
	
	// 点击开始录音
	startH5Record () {
		let _this = this;
		if (this.rec && Recorder.IsOpen()) {
			_this.rec.start()
			_this.alert('开始录音...再次点击录音终止！')
			_this.isRecord = !isRecord
			_this.startTime = new Date()
			_this.recordTime = setInterval(function() {
				// 20秒
				if (_this.startTime && new Date().getTime() - _this.startTime.getTime() >= 21000) {
					_this.closeH5Record()
				}
			}, 21000)
		} else {
			alert('未打开录音')
		}
	}
	
	// 结束录音
	closeH5Record () {
		let _this = this;
		if (_this.rec) {
			_this.rec.stop(function(blob, duration) {
				_this.isRecord = !_this.isRecord
				clearInterval(recordTime)
				if (_this.startTime && (new Date().getTime() - _this.startTime.getTime() < 1000)) {
					// 小于1秒当没说话
					_this.startTime = 0
					return
				}
				_this.startTime = 0
				
				if (blob.size < 20000) {
					alert('录音太短不可用！')
					return
				} else {
					alert('录音结束...')
				}
				_this.audioIdentify(blob)
			}, function(msg) {
				alert('录音失败:' + msg)
			})
		}
	}
	
	// 音频识别成中文
	audioIdentify (blob) {
		let formData = new FormData()
		formData.append('file', blob, new Date().getTime() + '.' + _this.recorderConfig.mimeType.split('/')[1])
		$.ajax({
			url: '/robot/rs/qa/asr',
			type: 'post',
			data: formData,
			processData: false,
			contentType: false,
			success: function(res) {
				if (res.data) {
					getQuestionAnswer(res.data)
				}
			},
			error: function(error) {
				console.log(error)
			}
		})
		audioToScreen(blob)
	}
	
	// 添加音频到屏幕
	audioToScreen (blob) {
		url = URL.createObjectURL(blob)
		div = document.createElement('div')
		div.classList.add('info-body')
		div.classList.add('user-body')
		au = document.createElement('audio')
		au.style.cssText = 'height: 35px;position: relative;right: 0;margin: 5px;max-width: 80%;'
		hf = document.createElement('a')
		
		au.controls = true
		au.src = url
		hf.href = url
		hf.download = new Date().toISOString() + '.' + recorderConfig.mimeType.split('/')[1]
		div.title = hf.download
		div.appendChild(au)
		div.appendChild(hf)
		document.getElementById('rIdentify').appendChild(div)
		goToBottomScreen()
	}
}

export default rIdentify;
