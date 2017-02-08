# requirejs-config-sugar

> 简化使用 requirejs 打包时，引用模块文件前的处理操作，参考 jQuery 打包时的处理；

## Getting Started

安装

`npm install requirejs-config-sugar`

引入模块

`var rjsCfg_sugar = require("requirejs-config-sugar");`


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




