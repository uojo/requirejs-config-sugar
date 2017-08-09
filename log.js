var chalk = require('chalk')
var colors = require('colors');

const log = function(){
	console.log.apply(undefined, arguments);
}
const clog = function(){
	if(process.env.LOG_LEVEL==='debug')return;
	// console.log.apply(undefined, arguments);
	var err = new Error, stacks = err.stack.split('\n');
	// log(2,stacks)
	var tStr = stacks[2].match(/([^\)\\]*)\)$/)[1]
	// log(tStr)
	var a1 = [tStr.green]
	// var data = Array.prototype.concat.call( arguments, a1 )
	// log(12,data.length)
	log.apply(undefined, a1.concat( Array.prototype.slice.call( arguments, 0 ) ) )
}
const elog = function(){
	// log(process.env.LOG_LEVEL)
	// if(!process.env.LOG_LEVEL)return;
	let ops = arguments[0], data=Array.prototype.slice.call( arguments, 1 )
	if( typeof ops==='string'){
		ops = {color:ops}
	}else if (typeof ops==='object' && !ops.color){
		ops.color = 'gray'
	}else{
		ops = {color:'white'}
	}

	let val = chalk[ops.color]
	.apply(undefined, data.map(el=>{
		return typeof el==="object"?JSON.stringify(el):el;
	}))
	log.call(undefined, val);
}

module.exports = {log,elog,clog}