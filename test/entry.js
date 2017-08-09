/* 该模块仅用于打包，非引用模块（不能直接 require(['entry'])），仅使用打包后的文件 */
define([
"core",
// "mods/umd",
"umd",
/*
"fn/name1",
"var/fn1",
"text!var/tpl/name2.html",
"text!TPL/name3.html",
"TPL/name4",
*/
], function(Fn) {



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

return Fn;

});