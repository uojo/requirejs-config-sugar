var requirejs = require('requirejs');
// var fs = require('fs');

var ops_records={
	// "name1":{requirejsConfig...},"name2":{requirejsConfig...}
};
var debug = 0;
// 注意：baseUrl 路径是基于执行 node的目录的
var cfg_default = {
	name: 'entry',
	// optimize:"none",
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
		console.log(">", moduleName,"|", path, "...ok");
		// console.log(process);
		// return contents;
		var amdName,
			rdefineEnd = /\}\s*?\);[^}\w]*$/;
		
		// 
		if ( /.\/var\//.test( path.replace( process.cwd(), "" ) ) ) {
			// 定义全局方法
			// console.log(">1.....", moduleName, "::");
			contents = contents
				.replace( /define\([\w\W]*?return/, "var " + ( /var\/([\w-]+)/.exec( moduleName )[ 1 ] ) + " =" )
				.replace( rdefineEnd, "" );

		} else if ( /.\/fn\//.test( path.replace( process.cwd(), "" ) ) ) {
			// 定义全局方法
			// console.log(">1.....", moduleName, "::");
			contents = contents
				.replace( /define\([\w\W]*?return/, "Fn." + ( /fn\/([\w-]+)/.exec( moduleName )[ 1 ] ) + " =" )
				.replace( rdefineEnd, "" );

		} else if ( moduleName=="text" ) {
			// 文本模块
			// console.log(">4.....", moduleName, "::");
			contents = "";
			
		} else if ( /\.html$/.test(moduleName) ) {
			// 视图模板
			var name_var_arr = moduleName.match(/var\/([^\.]*)/),
				name_arr = moduleName.match(/!([^\.]*)/),
				vname, vname_temp,
				replaceBody;
			
			(name_var_arr && name_var_arr[1]) && (vname_temp = name_var_arr[1]);
			!vname_temp && (name_arr && name_arr[1]) && (vname_temp = name_arr[1]);
			
			debug && console.log("视图模板", moduleName, "::", vname_temp);
			
			if( vname_temp ){
				vname = vname_temp.replace(/\//g,"_");
				
				if( /^TPL/.test(vname) ){
					fname = vname.replace(/^TPL_/,"");
					replaceBody = "TPL." + fname + " =";
				}else{
					replaceBody = "var " + vname + " =";
					
				}
				
				contents = contents
				.replace( /define\([\w\W]*?return/, replaceBody )
				.replace( rdefineEnd, "" );
				
			}else{
				console.log("error.请检查视图模板模块的路径> "+moduleName );
				
			}
			
		} else {
			// console.log(">3.....", moduleName, "::");
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
		
		// console.log(contents, "<.....");
		
		return contents;
	}
};

var pack = function(cfg,cb){
	
	var config = Object.assign({},cfg_default,cfg);
	
	requirejs.optimize(config, function (buildResponse) {
		//buildResponse is just a text output of the modules
		//included. Load the built file for the contents.
		//Use config.out to get the optimized file contents.
		// console.log( "buildResponse" );
		
		// var contents = fs.readFileSync(config.out, 'utf8');
		// console.log( "buildResponse >", contents.length );
		
		cb && cb();
		console.log("complete >", buildResponse.split('\n')[1] );
		
		
	}, function(err) {
		console.log(err);
		//optimization err callback
	});
};


var optimize = function(name, cb){
	var cfg={};
	// console.log( "rjs-config-sugar > %s", name, ops_records );
	
	if( !name )return;
	
	if( Object.hasOwnProperty.call( ops_records, name) ){
		var tcfg = ops_records[name];
		
		pack(tcfg, cb);
		
	}else{
		console.log("error.requirejs-config-sugar：无 %s 配置记录", name );
		
	}
};

module.exports = {
	"config":function(ops){
		if( ops.common ){
			Object.assign(cfg_default, ops.common);
		}
		
		if( ops.records ){
			Object.assign(ops_records, ops.records);
		}
		
		// console.log("config set complete", ops_records, cfg_default );
		// return ;
	},
	"getConfig":function(){
		console.log("config", ops_records, cfg_default );
		return ;
	},
	"pack":pack,
	"optimize":optimize,
	
};