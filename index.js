const requirejs = require('requirejs');
const {clog,elog,DelayExec} = require('uojo-kit');
const Path = require("path");
// var fs = require('fs');

var lock_pack = false, fireWall, debug;
var ops_records={
	// "name1":{requirejsConfig...},"name2":{requirejsConfig...}
};

// 注意：baseUrl 路径是基于执行 node的目录的
function getPathStr(path){
	let rlt=''
	// console.log(9, typeof path, path)
	if( /\//.test(path) ){
		rlt = path.replace( /\//g, "~");
	}else{
		rlt = path.split( Path.sep ).join("~")
	}
	return rlt;
}

function regTPLField(moduleName, contents ){
	var name_var_arr = moduleName.match(/var\/([^\.]*)/),
			name_arr, vname, vname_temp;
	
	// elog(moduleName);
	
	if( name_var_arr && name_var_arr[1] ){
		vname_temp = name_var_arr[1]
		
		// elog(vname_temp)
		
	}else{
	
		if( /^text!/.test(moduleName) ){
			vname_temp = /!([^\.]*)/.exec(moduleName)[1];
		}else if( /TPL\//.test(moduleName) ){
			vname_temp = /TPL\/([^\.]*)/.exec( moduleName )[1];
		}
		
		// elog(vname_temp)
		
	}

	// return false;
	// elog(moduleName, "::", vname_temp);
	
	if( vname_temp ){
		vname = vname_temp.replace(/\//g,"_");
		
		if( /TPL\//.test(moduleName) ){
			
			if( /^TPL_/.test(vname) ){
				fname = vname.replace(/^TPL_/,"");
			}else{
				fname = vname_temp;
			}
			replaceBody = "TPL." + fname + " =";
			
		}else{
			replaceBody = "var " + vname + " =";
			
		}
		
		contents = contents
		.replace( /define\([\w\W]*?return/, replaceBody )
		
	}else{
		
		
	}
	
	return contents;
}


var cfg_default = {
	//自定义参数，官方没有--start
	speedTaskEnter:0, 
	processSkipModules:[],
	//--end
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
	onBuildWrite:function(moduleName, path, contents){
		// debug && clog('gray',moduleName, path);
		// elog(process);
		elog(this.out)
		// return contents;
		var amdName,
			rdefineEnd = /\}\s*?\);[^}\w]*$/;
		
		// 
		if( this.processSkipModules.includes(moduleName) ){
			
		}else if ( /.\/var\//.test( path.replace( process.cwd(), "" ) ) ) {
			// 定义全局方法
			// elog(moduleName);
			contents = contents
				.replace( /define\([\w\W]*?return/, "var " + ( /var\/([\w-]+)/.exec( moduleName )[ 1 ] ) + " =" )
				.replace( rdefineEnd, "" );

		} else if ( /.\/fn\//.test( path.replace( process.cwd(), "" ) ) ) {
			// 定义全局方法
			// elog(moduleName);
			contents = contents
				.replace( /define\([\w\W]*?return/, "Fn." + ( /fn\/([\w-]+)/.exec( moduleName )[ 1 ] ) + " =" )
				.replace( rdefineEnd, "" );

		} else if ( moduleName=="text" ) {
			// 文本模块
			// elog(moduleName);
			contents = "";
			
		} else if ( /\.html$/.test(moduleName) || /.\/TPL\//.test( path.replace( process.cwd(), "" ) ) ) {
			// 视图模板
			
			contents = regTPLField( moduleName, contents );
			
			if( contents!=false ){
				contents = contents.replace( rdefineEnd, "" );
			}else{
				clog('red',"请检查视图模板模块的路径> "+moduleName );
			}
			
			
		} else {
			// elog(moduleName);
			contents = contents
				.replace( /\s*return\s+[^\}]+(\}\s*?\);[^\w\}]*)$/, "$1" )

				// Multiple exports
				.replace( /\s*exports\.\w+\s*=\s*\w+;/g, "" );
			
			
			// Remove define wrappers, closure ends, and empty declarations
			contents = contents
				.replace( /define\([^{]*?{/, "" )
				.replace( rdefineEnd, "" );
			
			// Remove anything wrapped with
			// /* ExcludeStart */ /* ExcludeEnd */
			// or a single line directly after a // BuildExclude comment
			contents = contents
				.replace( /\/\*\s*ExcludeStart\s*\*\/[\w\W]*?\/\*\s*ExcludeEnd\s*\*\//ig, "" )
				.replace( /\/\/\s*BuildExclude\n\r?[\w\W]*?\n\r?/ig, "" );

			// Remove empty definitions
			contents = contents
				.replace( /define\(\[[^\]]*\]\)[\W\n]+$/, "" );
		}
		
		/*
		if(!contents){
			// 注释console
			contents = contents.replace( /(console\.((log)|(info)|(dir)|(warn)|(debug)))/g, "// $1" ).replace( /\/\/\s\/\//g, "//" );
		}
		*/
		
		contents = `//${moduleName} \n ${contents} \n\n`
		// elog(contents);
		
		return contents;
	}
};

var optimize = function(cfg,cb){
	// elog(cfg)
	if(cfg.constructor != Object){
		clog('red',`打包配置错误：${cfg}`)
	}
	
	var config = Object.assign({},cfg_default,cfg);
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
			console.log("执行打包回调")
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
		clog('yellow',`任务进入队列间隔需大于 ${cfg_default.speedTaskEnter} 毫秒`)
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
	
	// console.log( 2, packOps, packName, runPack )
	clog('green', `匹配记录：${packName}` )
	
	if( packOps && packName && runPack ){
		// console.log( "matchRecordName >", packName, packOps.out, lock_pack)
		// console.log( "matchRecordName >", pathStr, getPathStr(packOps.out) )
		
		// 忽略输出的目标文件
		if( pathStr === getPathStr(packOps.out) ){
			// console.log('忽略该文件')
			clog('yellow', `忽略输出路径：${packOps.out}` );
			cb && cb();
			lock_pack = false;
			
		}else{
			pack( packName );
			
		}
		
	}else{
		if( !lock_pack ){
			clog('yellow','未匹配到项目~')
			cb && cb();
		}
		
		
	}
	
	return packName;
}

module.exports = {
	"config":function(ops){
		// elog(ops.records.gpp.baseUrl)
		debug = ops.debug
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