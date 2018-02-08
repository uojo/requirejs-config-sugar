;(function() {
//fn3 
 

	return function () {
		// console.log();
  };

 


//dir1/fn5 
 var dir1_fn5 = function () {
		// console.log();
  };

 


//var/fn2 
 var fn2 = function () {
		// console.log();
  };

 


//core 
 
	var obj = {
		fieldname1:112,
		fieldname2:function(){
			
		}
	}; 


//mods/umd2 
 (function (root, factory) {
	// console.log( typeof define === 'function', typeof exports ==='object', root,factory)
	if (typeof define === 'function' && define.amd) {
		// AMD
		
		// Node, CommonJS-like
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.sysRoutes = factory(root);
	}
}(this, function (Win) {
	// methods
	var data = {
		a:110
	};
	
	// console.log(window)
	// exposed public method
	return data;
}));
 


//umd1 
 (function (root, factory) {
	// console.log( typeof define === 'function', typeof exports ==='object', root,factory)
	if (typeof define === 'function' && define.amd) {
		// AMD
		
		// Node, CommonJS-like
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.sysRoutes = factory(root);
	}
}(this, function (Win) {
	// methods
	var data = {
		a:110
	};
	
	// console.log(window)
	// exposed public method
	return data;
}));
 


//var/fn1 
 var fn1 = function () {
		// console.log();
  };

 


//obj/name1 
 obj.name1 = function (str) {
		console.debug(123,str);
	};

 


//text 
  

;
//text!obj/name3.html 
 
obj.name3 = '<div class="">\n\t<b>hello world</b>\n\t<img onerror="GPP.assetsOnload(this,\'error\')" src="<%=GPP.getAssetsPath((\'abc.jpg\'))%>" />\n</div>'; 


//text!var/tpl/name2.html 
 
var tpl_name2 = '<div class="">\n\t<b>hello world</b>\n</div>'; 


//entry 
 
	
		
		/* 
		变量名称与路径对应：var/tpl/pagebean.html  ===> tpl_pagebean
		自定义属性字段
		*/
		Fn.xxx2 = tpl_name2;
		
		Fn.fn3 =fn3;
		Fn.fn3 =dir1_fn5;
		// Fn.fn2 =fn2;
		// Fn.fn4 = require("var/sub/fn4");

		// 全局命名空间
		var spaceName="TPL";
		// console.log("main.complete");
		if( window[spaceName] ){
			$.extend(window[spaceName],Fn);
		}else{
			window[spaceName] = Fn;
		} 

;
}());
