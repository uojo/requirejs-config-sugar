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
