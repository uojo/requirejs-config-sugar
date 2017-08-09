var rjs_sugar = require('./index');
var rjs_ops = {
	"common":{
		"name":"entry",
		"optimize":"none"
	},
	"records":{
		"app1":{
			"baseUrl": 'test',
			"out": 'test/build.js',
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
var program = require('commander');
program
.option('-c, --create [name]', '打包模块', "")
.option('-w, --watch [name]', '监听目录变动并自动打包', "")
.parse(process.argv);

const handle= {
	// 执行打包
	vendor : function(name, cb){
		if( rjs_ops.records[name] ){
			rjs_sugar.optimize( name );
			
		}else{
			console.log("error.请检查预定值", name );
		}
	},
	vendorAll : function(){
		for(var key in rjs_ops.records){
			this.vendor(key);
		}
	}
}

// 监听目录变动自动打包
// console.log("program.watch", program.watch);
if( program.watch ){
	var chokidar = require('chokidar');
	var cbfn_onchange = (event, path) => {
		
		if( event === "change"){
			console.log(event, path );
			// 自动匹配配置的记录，自动执行压缩
			rjs_sugar.matchRecord(path,true)
			
		}
	};
	
	var watchDirs = [];
	for(var key in rjs_ops.records){
		watchDirs.push( rjs_ops.records[key].baseUrl );
	}
	chokidar.watch( watchDirs, {ignored: /[\/\\]\./} ).on('all', cbfn_onchange );
}

// 兼容终端执行（直接执行）
// console.log("program.create", program.create);
if(program.create){
	if( program.create=="all" ){
		handle.vendorAll();
		
	}else{
		handle.vendor(program.create);
	}
	
}

// 先执行一次
handle.vendorAll();

module.exports = handle;