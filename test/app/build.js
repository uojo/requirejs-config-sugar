;(function() {
//core 
 
	var obj = {
		fieldname1:1,
		fieldname2:function(){
			
		}
	}; 


//umd 
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
        // console.debug();
    };

 


//obj/name1 
 obj.name1 = function (str) {
		console.debug(123,str);
	};

 


//text 
  

;
//text!obj/name3.html 
 
obj.name3 = '<div class="">\r\n\t<b>hello world</b>\r\n\t<img onerror="GPP.assetsOnload(this,\'error\')" src="<%=GPP.getAssetsPath((\'abc.jpg\'))%>" />\r\n</div>'; 


//text!var/tpl/name2.html 
 
var tpl_name2 = '<div class="">\r\n\t<b>hello world</b>\r\n</div>'; 


//entry 
 /* 该模块仅用于打包，非引用模块（不能直接 require(['entry'])），仅使用打包后的文件 */


/* 
变量名称与路径对应：var/tpl/pagebean.html  ===> tpl_pagebean
自定义属性字段
*/
Fn.xxx2 = tpl_name2;

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
