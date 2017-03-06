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

// 执行打包
var vendor = function(name, cb){
	if( rjs_ops.records[name] ){
		rjs_sugar.optimize( name );
		
	}else{
		console.log("error.请检查预定值", name );
	}
}

var vendorAll = function(){
	for(var key in rjs_ops.records){
		vendor(key);
	}
}
// 监听目录变动自动打包
// console.log("program.watch", program.watch);
if( program.watch ){
	var chokidar = require('chokidar');
	var cbfn_onchange = (event, path) => {
		// console.log(event, path);
		if( event === "change"){
			var packName;
			if( /core\\gpp/.test(path) ){
				console.log( "gpp" );
			}
			
			if( /core\\gf/.test(path) ){
				console.log( "gf" );
			}
			
			if(packName){
				vendor( packName );
			}
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
		vendorAll();
		
	}else{
		vendor(program.create);
	}
	
}

module.exports = {
	// "pack":pack,
	vendorAll,
	vendor,
};