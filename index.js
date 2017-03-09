var requirejs = require('requirejs');
var Msg = require('./tools').msg;
// var fs = require('fs');

var ops_records={
	// "name1":{requirejsConfig...},"name2":{requirejsConfig...}
};

// 注意：baseUrl 路径是基于执行 node的目录的

function regTPLField(moduleName, contents ){
	var name_var_arr = moduleName.match(/var\/([^\.]*)/),
		name_arr, vname, vname_temp;
	
	Msg("0.",moduleName);
	
	if( name_var_arr && name_var_arr[1] ){
		vname_temp = name_var_arr[1]
		
		Msg("1.",vname_temp)
		
	}else{
	
		if( /^text!/.test(moduleName) ){
			vname_temp = /!([^\.]*)/.exec(moduleName)[1];
		}else if( /TPL\//.test(moduleName) ){
			vname_temp = /TPL\/([^\.]*)/.exec( moduleName )[1];
		}
		
		Msg("2.",vname_temp)
		
	}

	// return false;
	
	Msg("视图模板", moduleName, "::", vname_temp);
	
	
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
		Msg(moduleName,"|", path, "...ok");
		// Msg(process);
		// return contents;
		var amdName,
			rdefineEnd = /\}\s*?\);[^}\w]*$/;
		
		// 
		if ( /.\/var\//.test( path.replace( process.cwd(), "" ) ) ) {
			// 定义全局方法
			// Msg(">1.....", moduleName, "::");
			contents = contents
				.replace( /define\([\w\W]*?return/, "var " + ( /var\/([\w-]+)/.exec( moduleName )[ 1 ] ) + " =" )
				.replace( rdefineEnd, "" );

		} else if ( /.\/fn\//.test( path.replace( process.cwd(), "" ) ) ) {
			// 定义全局方法
			// Msg(">1.....", moduleName, "::");
			contents = contents
				.replace( /define\([\w\W]*?return/, "Fn." + ( /fn\/([\w-]+)/.exec( moduleName )[ 1 ] ) + " =" )
				.replace( rdefineEnd, "" );

		} else if ( moduleName=="text" ) {
			// 文本模块
			// Msg(">4.....", moduleName, "::");
			contents = "";
			
		} else if ( /\.html$/.test(moduleName) || /.\/TPL\//.test( path.replace( process.cwd(), "" ) ) ) {
			// 视图模板
			
			contents = regTPLField( moduleName, contents );
			
			if( contents!=false ){
				contents = contents.replace( rdefineEnd, "" );
			}else{
				Msg("error.请检查视图模板模块的路径> "+moduleName );
			}
			
			
		} else {
			// Msg(">3.....", moduleName, "::");
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
		
		// Msg(contents, "<.....");
		
		return contents;
	}
};

var pack = function(cfg,cb){
	
	var config = Object.assign({},cfg_default,cfg);
	
	requirejs.optimize(config, function (buildResponse) {
		//buildResponse is just a text output of the modules
		//included. Load the built file for the contents.
		//Use config.out to get the optimized file contents.
		// Msg( "buildResponse" );
		
		// var contents = fs.readFileSync(config.out, 'utf8');
		// Msg( "buildResponse >", contents.length );
		
		cb && cb();
		Msg("complete", buildResponse.split('\n')[1] );
		
		
	}, function(err) {
		Msg(err);
		//optimization err callback
	});
};


var optimize = function(name, cb){
	var cfg={};
	// Msg( "rjs-config-sugar > %s", name, ops_records );
	
	if( !name )return;
	
	if( Object.hasOwnProperty.call( ops_records, name) ){
		var tcfg = ops_records[name];
		
		pack(tcfg, cb);
		
	}else{
		Msg("error.requirejs-config-sugar：无 %s 配置记录", name );
		
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
		
		// Msg("config set complete", ops_records, cfg_default );
		// return ;
	},
	"getConfig":function(){
		Msg("config", ops_records, cfg_default );
		return ;
	},
	"pack":pack,
	"optimize":optimize,
	
};