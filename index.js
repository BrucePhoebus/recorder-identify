(function () {
	'use strict'
	var startTime = 0;
	var recordTime = null
	var rec
	var isRecord = false
	var recorderConfig = {
		numChannels: 1,
		mimeType: 'audio/wav',
		bitRate: 16,
		sampleRate: 16000
	}
	init()
	
	function init () {
		// 监听语音图标点击录音事件
		getRecordPermission()
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
				alert('请确认麦克风未被禁用！')
			}
		})
	}
	
	// 获取麦克风权限进行初始化
	function getRecordPermission () {
		var newRec = Recorder({
			type: recorderConfig.mimeType.split('/')[1],
			bitRate: recorderConfig.bitRate,
			sampleRate: recorderConfig.sampleRate,
			disableEnvInFix: true,
			onProcess: function (buffers, powerLevel, duration, sampleRate, newBufferIdx, asyncEnd) {
			}
		})
		newRec.open(function () {//打开麦克风授权获得相关资源
			rec = newRec
			console.log(rec)
		}, function (msg, isUserNotAllow) {//用户拒绝未授权或不支持
			alert((isUserNotAllow ? 'UserNotAllow，' : '') + '打开录音失败：' + msg, 1)
		})
	}
	
	// 点击开始录音
	function startH5Record () {
		if (rec && Recorder.IsOpen()) {
			rec.start()
			inputTip('开始录音...再次点击录音终止！')
			isRecord = !isRecord
			startTime = new Date()
			recordTime = setInterval(function () {
				// 20秒
				if (startTime && new Date().getTime() - startTime.getTime() >= 21000) {
					closeH5Record()
				}
			}, 21000)
		} else {
			alert('未打开录音')
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
					inputTip('录音结束...')
				}
				audioIdentify(blob)
			}, function (msg) {
				alert('录音失败:' + msg)
			})
		}
	}
	
	// 音频识别成中文
	function audioIdentify (blob) {
		var formData = new FormData()
		formData.append('file', blob, new Date().getTime() + '.' + recorderConfig.mimeType.split('/')[1])
		$.ajax({
			url: '/robot/rs/qa/asr',
			type: 'post',
			data: formData,
			processData: false,
			contentType: false,
			success: function (res) {
				if (res.data) {
					alert(res.data)
				}
			},
			error: function (error) {
				console.log(error)
			}
		})
	}
	
	// 添加音频到屏幕
	function audioToScreen (blob) {
		var url = URL.createObjectURL(blob)
		var div = document.createElement('div')
		var au = document.createElement('audio')
		au.style.cssText = 'height: 35px;position: relative;right: 0;margin: 5px;max-width: 80%;'
		var hf = document.createElement('a')
		
		au.controls = true
		au.src = url
		hf.href = url
		hf.download = new Date().toISOString() + '.' + recorderConfig.mimeType.split('/')[1]
		div.title = hf.download
		div.appendChild(au)
		div.appendChild(hf)
		document.getElementById('intelligentQAInfo').appendChild(div)
	}
	// 录音提示
	var setTimeoutTip = null;
	function inputTip (message) {
		if (setTimeoutTip && $('#rIdentifyTip')) {
			clearTimeout(setTimeoutTip);
			$('#rIdentifyTip').remove();
		}
		var div = document.createElement('div')
		div.id = 'rIdentifyTip';
		div.style.cssText = 'position: absolute; top: ' + ($('#rIdentify')[0].offsetTop - 20) +
			'px;left: ' + $('#rIdentify')[0].offsetLeft + 'px;border-radius: 8px;margin-top: -15px;' +
			'color: #fff;background-color: #409eff;padding: 5px 0;'
		var span = document.createElement('span')
		span.innerText = message;
		span.style.cssText = 'margin: 0 10px;'
		div.appendChild(span)
		document.getElementById('rIdentify').appendChild(div)
		setTimeoutTip = setTimeout(function () {
			$('#rIdentifyTip').remove()
		}, 2000)
	}
})()
