(function (root, factory) {
	// console.log( typeof define === 'function', typeof exports ==='object', root,factory)
	if (typeof define === 'function' && define.amd) {
		// AMD
		define([], factory);

	} else if (typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root._req = factory(root);
	}
}(this, function (Win) {
	// console.log(window)
	// exposed public method
	return {
		'config':{
			'text': {
				// 自定义参数回调
				callbackBefore: function(resText){
					// console.log('------------------------------',resText)
					var rlt='';
					
					// 对img标签加工，追加获取绝对路径的方法
					rlt = resText.replace(/<img\s(.*)[^%]>/g,function(a){
						// console.warn(a)
						if( !/no-parse/.test(a) ){
							// console.warn(a)
							var d = a.replace(/(\s+src=["'](<%=)?\s*)([^%>\s]*)(\s*(%>)?(["']))/,function(b,b1,b2,b3,b4,b5,b6){
								// console.log(arguments)
								var nfix = b1
								var dt = b1+
									(!b2?'<%=':'') +
									'GPP.getAssetsPath('+ 
									(function(wrap,body,quotes){
										if(wrap)return body;
										if(!wrap){
											if(quotes=='"'){
												return "(\\'"+b3+"\\')";
											}else{
												return '(\\"'+b3+'\\")';
											}
										}
									})(b2,b3,b6) +
									')'
									+
									(!b5?'%>':'')+
									b4;
									
								return dt;
								// return b1
							});
							
							var patchInline=[]
							
							if( /onload-center/i.test(d) && !/onload/.test(onload) ){
								patchInline.push("onload=\"GF.showPartOfImg(this)\"");
								
								if( !/style=/.test(d) ){
									patchInline.push("style=\"visibility:hidden;\"");
								}
							}
							
							if( !/onerror/i.test(d) ){
								patchInline.push("onerror=\"GPP.assetsOnload(this,\\'error\\')\"");
							}
							
							if(patchInline.length){
								d = d.replace(/<img\s/g,"<img "+patchInline.join(" ")+" ");
							}
							
							// console.log(d)
						}
						
						return d;
					});
					
					// link标签的加工（样式）
					rlt = rlt.replace(/<link\s(.*)[^%]>/g,function(a){
						// console.log(a)
						var d = a.replace(/(\s+data-href=["'])([^\s]*)(["'])/,function(b,b1,b2,b3,b4,b5){
							// console.log(arguments)
							var nfix = b1
							var dt = " onload=\"GPP.assetsOnload(this)\" href=\""+
								GPP.getAssetsPath(b2,'css')+
								"\"";
								
							return dt;
							// return b1
						})
						// console.log(d)
						return d;
					})
					
					// console.log(rlt)
					return rlt;
					// return 'hello world'
					// return '<div>hello world</div>'
				},
				useXhr: function (url, protocol, hostname, port) {
					// console.log(0)
					// console.log(url, protocol, hostname, port)
					//Override function for determining if XHR should be used.
					//url: the URL being requested
					//protocol: protocol of page text.js is running on
					//hostname: hostname of page text.js is running on
					//port: port of page text.js is running on
					//Use protocol, hostname, and port to compare against the url
					//being requested.
					//Return true or false. true means "use xhr", false means
					//"fetch the .js version of this resource".
					return true;
				},
				/*onXhr: function (xhr,url) {
				console.log(1,xhr,url)
				xhr.response = '123'
				xhr.responseText = '123'
				//Called after the XHR has been created and after the
				//xhr.open() call, but before the xhr.send() call.
				//Useful time to set headers.
				//xhr: the xhr object
				//url: the url that is being used with the xhr object.
				},
				 createXhr: function () {
				console.log(2,arguments)
				//Overrides the creation of the XHR object. Return an XHR
				//object from this function.
				//Available in text.js 2.0.1 or later.
				}, 
				onXhrComplete: function (xhr,url) {
				console.log(3,xhr,url)
				xhr.response = '123'
				xhr.responseText = '123'
				return xhr
				//Called whenever an XHR has completed its work. Useful
				//if browser-specific xhr cleanup needs to be done.
				},*/
			}
		}
	};
}));
