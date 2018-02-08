const requirejs = require('requirejs');
const {clog,elog,DelayExec} = require('uojo-kit');
const Path = require("path");
// var fs = require('fs');

var lock_pack = false, fireWall, debug;
var rdefineEnd = /\}\s*?\);[^}\w]*$/;

var ops_records={
	// "name1":{requirejsConfig...},"name2":{requirejsConfig...}
};

var modNameAlias = {
	// "var/fn2" : "fn2",
	// "var/sub/fn4" : "sub_fn2",
}

// 注意：baseUrl 路径是基于执行 node的目录的
function getPathStr(path){
	let rlt=''
	if( /\//.test(path) ){
	rlt = path.replace( /\//g, "~");
}else{
	rlt = path.split( Path.sep ).join("~")
}
return rlt;
}

function parseModuleName(moduleName,options){
	// elog(moduleName);
	modNameAlias[moduleName] = moduleName.replace(/\//g,"_");
	
	var varRules = options.varModuleDir, objRules = options.objectModuleDir;
	if(!varRules.length && !objRules.length ){
		return false;
	}
	
	// 过滤掉插件、扩展名
	moduleName = moduleName.replace(/^[^!]*!/,"").replace(/\.+.+$/,"");
	
	if( /[^\w\d_\/]+/.test(moduleName) || !/\//.test(moduleName) ){
	return false;
}

var ta = moduleName.split('/');

if( objRules.includes(ta[0]) ){
	return ta[0]+"." + ta.slice(1).join('_') + " =";
	
}else if( varRules.includes(ta[0]) ){
	var rlt, alias;
	if(ta[0]==='var'){
		alias = ta.slice(1).join('_');
		rlt = ta[0]+" " + alias + " =";
	}else{
		alias = moduleName.replace(/\//g,"_")
		rlt = "var "+ alias + " =";
	}
	
	if(rlt){
		modNameAlias[moduleName] = alias;
		return rlt;
	}
	return null;
	
}else{
	
}

return null;
}

function parseModuleContent(contents,options,wrapName) {
	wrapName = wrapName || "define"
	contents = contents
	.replace( /\s*return\s+[^\}]+(\}\s*?\);[^\w\}]*)$/, "$1" )
	// Multiple exports
	.replace( /\s*exports\.\w+\s*=\s*\w+;/g, "" );
	
	// Remove define wrappers, closure ends, and empty declarations
	var reg_wrap = new RegExp(wrapName+"\\([^{]*?{");
	contents = contents
	.replace( reg_wrap, "" )
	.replace( rdefineEnd, "" )
	
	// Remove anything wrapped with
	// /* ExcludeStart */ /* ExcludeEnd */
	// or a single line directly after a // BuildExclude comment
	contents = contents
	.replace( /\/\*\s*ExcludeStart\s*\*\/[\w\W]*?\/\*\s*ExcludeEnd\s*\*\//ig, "" )
	.replace( /\/\/\s*BuildExclude\n\r?[\w\W]*?\n\r?/ig, "" );
	
	// Remove empty definitions
	var reg_empty = new RegExp(wrapName+"\\(\\[[^\\]]*\\]\\)[\\W\\n]+$");
	contents = contents
	.replace( reg_empty, "" );
	
	// replace ＝> require();
	var reg_req = /=\s*(require\(['"]+([^'"]*)['"]+\))/g;
	var matchReqMod = contents.match(reg_req);
	contents = contents.replace(reg_req,function(a,b,c,d){
		var f1 = c.replace(/\./g,"").replace(/^\//g,"");
		var alias1=modNameAlias[f1]
		// elog(a,b,c)
		// elog(f1,alias1)
		if(alias1){
			return "="+alias1;
		}
		return a;
	})
	// elog(matchReqMod);
	
	// elog(contents);
	// if has require([...],function(){});
	if(options.findNestedDependencies){
		var matchReq = /^\s*require\([^{]*?{/.test(contents)
			if(matchReq){
				// clog('red',contents)
				return parseModuleContent(contents,options,"require")
			}else{
				return contents;
			}
		}else{
			return contents
		}
		
	}
	
	var cfg_default = {
		//自定义参数，官方没有--start
		speedTaskEnter:0, 
		processSkipModules:[],
		varModuleDir:['var'],
		objectModuleDir:[],
		
		//--end
		"findNestedDependencies": false,
		name: 'entry',
		// optimize:"none",
		async:true,
		baseUrl: '',
		out: '',
		paths:{
			// "jquery":"lib/jquery"
		},
		wrap: {
			start: ";(function() {",
			end: "}());"
		},
		_onBuildWrite:function(moduleName, path, contents, options){
			debug && clog('gray',moduleName, path);
			// elog(process);
			// elog(this.out)
			// return contents;
			var amdName;
			
			var parseModuleNameRlt = parseModuleName(moduleName,this)
			// elog(moduleName, parseModuleNameRlt)
			
			if( this.processSkipModules.includes(moduleName) ){
				
			}else if( parseModuleNameRlt ){
				// 将模块名称进行解析
				contents = contents
				.replace( /define\([\w\W]*?return/, parseModuleNameRlt )
				.replace( rdefineEnd, "" );
				
			}else if ( moduleName=="text" ) {
				// 文本模块
				// elog(contents);
				contents = "";
				
			}	else {
				// elog(contents);
				contents = parseModuleContent(contents,this);
				// elog(contents);
			}
			
			/*
			if(!contents){
				// 注释console
				contents = contents.replace( /(console\.((log)|(info)|(dir)|(warn)|(debug)))/g, "// $1" ).replace( /\/\/\s\/\//g, "//" );
			}
			*/
			
			contents = `//${moduleName} \n ${contents} \n\n`;
			
			return contents;
		}
	};
	
	var optimize = function(cfg,cb){
		// elog(cb)
		// elog(cfg)
		if(cfg.constructor != Object){
			clog('red',`打包配置错误：${cfg}`)
		}
		
		var config = Object.assign({},cfg_default,cfg);
		// elog(!!config.onBuildWriteAfter)
		if(config.onBuildWriteAfter){
			config.onBuildWrite = function(moduleName, path, contents){
				var args = Array.prototype.slice.call(arguments,0) || [];
				var t_cts = config._onBuildWrite.apply(this, args);
				// elog(t_cts)
				return config.onBuildWriteAfter(moduleName, path, t_cts);
			}
		}else{
			config.onBuildWrite = config._onBuildWrite;
		}
		// elog(config)
		requirejs.optimize(config, function (buildResponse) {
			//buildResponse is just a text output of the modules
			//included. Load the built file for the contents.
			//Use config.out to get the optimized file contents.
			// elog( "buildResponse" );
			
			// var contents = fs.readFileSync(config.out, 'utf8');
			// elog( "buildResponse >", contents.length );
			
			clog('green', "created", buildResponse.split('\n')[1] );
			lock_pack=false;
			if(cb){
				clog("green", "执行打包回调")
				cb();
			}
			
			
		}, function(err) {
			clog('red','rjsOptimize.error',err);
			lock_pack=false;
			cb && cb();
			//optimization err callback
		})
		
	};
	
	var pack = function(name, cb){
		if(name.constructor != String){
			clog('red',`执行的记录名称错误：${name}`)
		}
		
		if( fireWall && !fireWall.hit(name) ){
			debug && clog('red',`任务进入队列间隔需大于 ${cfg_default.speedTaskEnter} 毫秒`)
			return false;
		}else{
			// if(1)return;
			if(!cfg_default.async){
				// 队列顺序执行
				if(lock_pack){
					console.log('队列正在进行中');
					return false;
				}
				lock_pack = true;
			}
			// elog( name, ops_records );
			
			if( !name ) {
				clog('red',`该记录无配置信息：${name}`)
				return false;
			}
			
			if( Object.hasOwnProperty.call( ops_records, name) ){
				var tcfg = ops_records[name];
				clog('green','任务开始执行 >',name)
				optimize(tcfg, cb);
				
			}else{
				clog('red',"配置项中，无该记录 >", name );
				return false;
			}
			
		}
	};
	
	var matchRecord = function(path, runPack, cb){
		var packName, packOps,
		pathDirStr = getPathStr( Path.dirname(path) ),
		pathStr = getPathStr(path);
		// elog( cb );
		// elog( path );
		// elog( pathDirStr );
		// elog( pathStr );
		
		// 匹配到哪一条打包记录
		for(var k1 in ops_records){
			var item = ops_records[k1],
			item_path = getPathStr(item.baseUrl);
			repx1 = new RegExp( item_path );
			// elog( item_path, repx1.test( pathStr ), pathDirStr, k1 );
			
			if( repx1.test( pathDirStr ) ){
				packName = k1;
				packOps = item;
				break;
			}
			
		}
		
		if( packName ){
			clog('green', `匹配记录：${packName}` )
		}
		
		if( packOps && packName && runPack ){
			// console.log( "matchRecordName >", packName, packOps.out, lock_pack)
			// console.log( "matchRecordName >", pathStr, getPathStr(packOps.out) )
			
			// 忽略输出的目标文件
			if( pathStr === getPathStr(packOps.out) ){
				// console.log('忽略该文件')
				clog('gray', `忽略输出路径：${packOps.out}` );
				cb && cb(packName,packOps,true);
				lock_pack = false;
				
			}else{
				pack( packName );
				
			}
			
		}else{
			if( !lock_pack ){
				clog('yellow','未匹配到项目~')
				cb && cb(packName,packOps,false);
			}
			
			
		}
		
		return packName;
	}
	
	module.exports = {
		"config":function(ops){
			// elog(ops.records.gpp.baseUrl)
			debug = ops.debug || false;
			// 全局参数配置
			if( ops.common ){
				Object.assign(cfg_default, ops.common);
			}
			// elog(cfg_default)
			// 是否打开防火墙
			if(cfg_default.speedTaskEnter){
				fireWall = new DelayExec(cfg_default.speedTaskEnter)
			}
			
			// 设置打包记录
			if( ops.records ){
				Object.assign(ops_records, ops.records);
			}
			
			// elog("config set complete", ops_records, cfg_default );
			// return ;
		},
		"getConfig":function(){
			elog(ops_records, cfg_default );
			return ;
		},
		"pack":pack,
		"optimize":optimize,
		"matchRecord":matchRecord
	};