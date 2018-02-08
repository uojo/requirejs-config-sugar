# requirejs-config-sugar

> 作用：简化使用 requirejs 打包时，引用模块文件前的处理操作，参考 jQuery 打包时的处理，即项目会被打包成一个 UMD 的文件，供浏览器、Node 等场景下使用。

## Getting Started

安装

`npm install requirejs-config-sugar`

引入模块

`var rjsCfg_sugar = require("requirejs-config-sugar");`

## 使用

根据模块名称的编译，示例如下

模块名称 | 模块内容 | 编译结果
:---|:---|:---
tpl/name1 | function(){} | var tpl_name1 = function(){}
var/fn1 | function(){} | var fn1 = function(){}
text!var/tpl/name2.html | html字符串... | var tpl_name2 = 'html字符串...'
text!obj/name3.html | html字符串... | obj.name3 = 'html字符串...'
obj/name4 | function(){} | obj.name4 = function(){}
上方中实现的提前配置如下：

```
{common:{
    objectModuleDir:["obj"],
    varModuleDir:["var","tpl"],
    ...
},...}
```

> 的 obj 目录，需添加配置 objectModuleDir:["obj"]

简要示例如下：

```
// entry.js
define([
"core",
"fn/name1",
"var/fn1",
"text!var/tpl/name2.html",
"text!TPL/name3.html",
"TPL/name4",
], function(Fn) {
    Fn.xxx2 = tpl_name2;
    
    // 全局命名空间
    var spaceName="TPL";
    // console.log("main.complete");
    if( window[spaceName] ){
    	$.extend(window[spaceName],Fn);
    }else{
    	window[spaceName] = Fn;
    }
    
    return Fn;

});

// core.js
define([], function() {
    var Fn = {
    	fieldname1:1,
    	fieldname2:function(){
        
    	}
    };
    return Fn;
});

```

更多写法可以通过阅读项目示例体会 `test/app`

> 其中 var、TPL、Fn ，目前均为保留字段名！

## 方法

### config(options)
建议配置至少一条记录，`options` 为对象，其中包含如下参数
| 字段名称        | 作用           | 备注  |
| :------------- |:-------------| :-----|
| common | 通用参数设置 | 与 records 字段配置内容相同，只是在此配置后，在每一条记录都会生效 |
| records | 每条记录参数设置 | 设置对象字段请 [参考](https://github.com/requirejs/r.js/blob/master/build/example.build.js) |
示例：

```
rjs_sugar.config({
    "common":{
        "name":"entry",
        "optimize":"none",
        // 自义定参数
        "speedTaskEnter":0, // 任务进入执行队列中最小间隔时间 
        "onBuildWriteAfter":function(moduleName, path, contents){
        	// onBuildWrite 之后执行的回调 
        	return contents;
        },
        "varModuleDir":['var'] // 通过模块名称转化为定义语法，例：var xxx = ...
        "objectModuleDir":[] // 通过模块名称转化为对象注册属性语法，例：Obj.attr = ...
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
```

### pack(recordname, callback)
通过配置记录执行打包

参数 | 作用
:---|:---
recordName | config设置的记录名称
callback | 打包执行后的回调函数
示例：
```
rjs_sugar.optimize("gf",cbfn);
```

### optimize(config, callback)
通过传入配置参数执行打包
参数 | 作用
:---|:---
config | requirejs 打包配置，请 [参考](https://github.com/requirejs/r.js/blob/master/build/example.build.js)
callback | 打包执行后的回调函数
示例：
```
rjs_sugar.optimize({
    name: 'entry',
    out: 'build.js'
},cbfn);
```

### matchRecord( path, runPack, callback)
通过传入文件的绝对路径，获取匹配的配置记录。且可立即执行打包。
参数 | 作用 | 默认值
:---|:---|:---
path | 文件的绝对路径，建议使用 path.resolve() | 
runPack | 立即执行打包 | false
callback | 打包执行后的回调函数 | 

返回：匹配记录的名称

示例：
```
var recordName = rjs_sugar.matchRecord( path.resolve('./dirname1/xxx.js'), true, function(name,options){
    console.log(name); // recordsName1
    console.log(options); // { "baseUrl":'dirname1/', "out":'build/file1_build.js' }
} );
console.log( recordName ); // recordsName1
```

## ChangeLog
### 0.5.0
- 对 xxx = require(...) 的支持
### 0.4.0
- 对rjs参数 findNestedDependencies 的支持
### 0.3.0
- 新增自定义配置参数 varModuleDir
- 重写内部模块解析，放弃原先内置对模板名称中 TPL、Fn 的解析。之前版本可通过配置 varModuleDir、objectModuleDir 来升级
### 0.2.0 
- 新增自定义配置参数 onBuildWriteAfter、objectModuleDir
- 提示：可能不兼容之前的版本
### 0.1.3
- fix matchRecord 回调执行的bug
### 0.1.2
- 使用 uojo-kit 模块来替换 log，新增参数 speedTaskEnter
- 互换 pack 与 optimize 的方法的使用

### 0.1.1
- 修复回调执行
- 将队列顺序执行更改为队列异步执行

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



