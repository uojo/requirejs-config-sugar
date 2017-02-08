var requirejs = require('requirejs');
var fs = require('fs');

var ops_self={
	// "data":{"name1":{requirejsConfig...},"name2":{requirejsConfig...}}
};

// 注意：baseUrl 路径是基于执行 node的目录的
var cfg_default = {
    baseUrl: 'www/js/global/gpp',
    name: 'entry',
    out: 'www/js/global/gpp_build.js',
	optimize:"none",
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
			// console.log("视图模板", contents, "::");
			var vname = (moduleName.match(/var\/([^\.]*)/))[1].replace(/\//g,"_");
			contents = contents
				.replace( /define\([\w\W]*?return/, "var " + vname + " =" )
				.replace( rdefineEnd, "" );
			
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
		
		
	}, function(err) {
		console.log(err);
		//optimization err callback
	});
}


var vendor = function(name, cb){
	var cfg={};
	
	if( ops_self.data.hasOwnProperty(name) ){
		var tcfg = ops_self.data[name];
		
		pack(tcfg, cb);
		
	}else{
		console.log("error.可选值：%s", name );
		
	}
}

module.exports = {
	"config":function(data){
		Object.assign(ops_self,data);
		
	},
	"pack":pack,
	"vendor":vendor,
	
};