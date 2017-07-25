# requirejs-config-sugar

> 简化使用 requirejs 打包时，引用模块文件前的处理操作，参考 jQuery 打包时的处理；

## Getting Started

安装

`npm install requirejs-config-sugar`

引入模块

`var rjsCfg_sugar = require("requirejs-config-sugar");`

## 技巧

### 视图 *.html
require([*.html])

## 方法

### config(options)
参数 `options` 为一个对象，字段包括 `common`：覆盖参数设置 、 `records`：带条记录参数设置。设置对象字段[参考](https://github.com/requirejs/r.js/blob/master/build/example.build.js)

    rjs_sugar.config({
    	"common":{
    		"name":"entry",
    		"optimize":"none"
    	},
    	"records":{
    		"recordsName1":{
    			"baseUrl": 'dirname1/',
    			"out": 'build/file1_build.js'
    		},
    		"recordsName2":{
    			"baseUrl": 'dirname2/',
    			"out": 'build/file2_build.js'
    		},
    	}
    });

### optimize(recordName, callback)
执行打包操作，参数 `recordName`：config设置的记录名称，`callback`：打包执行后的对调函数

	rjs_sugar.optimize("gf",cbfn);

## changeLog
### 0.0.7

- 新增方法 matchRecord ，用于匹配记录

### 0.0.6

- 修复当错误时不提示信息的问题

### 0.0.5

- 修改 console.log 显示方式
- 新增 require(TPL/xxx) 模板时，打包后的内容为 TPL.xxx = ...

### 0.0.4

- 添加测试、使用实例
- 新增 require(text!xxx...) 模板时，打包后的内容挂载方式


### 0.0.3

- 添加打包成功后的消息输出



