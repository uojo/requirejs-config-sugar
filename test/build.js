;(function() {

	var Fn = {
		fieldname1:1,
		fieldname2:function(){
			
		}
	};
Fn.name1 = function (str) {
        console.debug(str);
    };


;

var tpl_name2 = '<div class="">\r\n\t<b>hello world</b>\r\n</div>';

TPL.name3 = '<div class="">\r\n\t<b>hello world</b>\r\n</div>';
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
};
}());
