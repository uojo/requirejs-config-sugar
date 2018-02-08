define(function(require){
	require([
		"core",
		"mods/umd2",
		"umd1",
		"./var/fn1",
		"./obj/name1",
		"text!./obj/name3.html",
		"text!./var/tpl/name2.html",
		
	], function(Fn) {
		
		/* 
		变量名称与路径对应：var/tpl/pagebean.html  ===> tpl_pagebean
		自定义属性字段
		*/
		Fn.xxx2 = tpl_name2;
		
		Fn.fn3 = require("./fn3");
		Fn.fn3 = require("./dir1/fn5");
		// Fn.fn2 = require("./var/fn2");
		// Fn.fn4 = require("var/sub/fn4");

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
});