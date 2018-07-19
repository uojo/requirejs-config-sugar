var Path = require('path');
var commander = require('commander');
var {elog} = require('uojo-kit')
var rjs_sugar = require('../index');
var rjsConfigText = require("./require_cfg_text").config['text'];

var rjs_ops = {
	"debug":false,
	"common":{
		"name":"entry",
		"optimize":"none",
		"speedTaskEnter":200,
		"mainConfigFile":"test/require_config.js",
		"varModuleDir":['var','dir1'],
		"objectModuleDir":['obj'],
		"onBuildWriteAfter":function(moduleName, path, contents){
			// elog(moduleName, /^text!/.test(moduleName))
			if( /^text!/.test(moduleName) ){
				contents = rjsConfigText.callbackBefore(contents);
				// elog(contents)
			}
			
			return contents;
		}
	},
	"records":{
		/* "app1":{
			"baseUrl": Path.resolve(__dirname,'app1'),
			"out": Path.resolve(__dirname,'app1/build.js'),
			"paths":{
				"text": "lib/text",
				// "views": "../views"
			}
		}, */
		"app2":{
			"findNestedDependencies": true,
			"baseUrl": Path.resolve(__dirname,'app2'),
			"out": Path.resolve(__dirname,'app2/build.js'),
			"paths":{
				"text": "lib/text",
				// "views": "../views"
			}
		}
	}
};
// console.log( ">>",rjs_sugar );
rjs_sugar.config( rjs_ops );

// 配置cli
commander
.option('-c, --create [name]', '打包模块', "")
.option('-w, --watch [name]', '监听目录变动并自动打包', "")
.parse(process.argv);

const handle= {
	// 执行打包
	vendor : function(name, cb){
		rjs_sugar.pack( name );
	},
	vendorAll : function(){
		for(var key in rjs_ops.records){
			this.vendor(key);
		}
	}
}

// 监听目录变动自动打包
// console.log("commander.watch", commander.watch);
if( commander.watch ){
	var chokidar = require('chokidar');
	var cbfn_onchange = (event, path) => {
		
		if( event === "change"){
			elog(event, path );
			// 自动匹配配置的记录，自动执行压缩
			rjs_sugar.matchRecord(path,true)
			
		}
	};
	
	// 监听配置记录的文件目录
	var watchDirs = [];
	for(var key in rjs_ops.records){
		watchDirs.push( rjs_ops.records[key].baseUrl );
	}
	chokidar.watch( watchDirs, {ignored: /[\/\\]\./} ).on('all', cbfn_onchange );
}

// 兼容终端执行（直接执行）
// console.log("commander.create", commander.create);
if(commander.create){
	if( commander.create=="all" ){
		handle.vendorAll();
		
	}else{
		handle.vendor(commander.create);
	}
	
}

// 先执行一次
handle.vendorAll();

module.exports = handle;