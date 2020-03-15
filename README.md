# recorder-identify

    智能语音识别功能组件

## 不同插件化方式

#### 独立式 - /dist/plugins

* 将JQ和语音识别插件recorder.wav.min.js集成进去，导入这个文件，和配HTML就可以使用语音识别功能了

> 可以考虑舍去JQ开发，进一步可以抽取语音识别插件

## 依赖式 - /plugins

* 只是简单的业务组件，需要引入JQ和语音识别插件recorder.wav.min.js才可使用
