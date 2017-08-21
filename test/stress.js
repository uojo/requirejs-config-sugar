var thandle = require('./index');

// console.log( thandle )

let count = 15
let tid=setInterval(()=>{
	if(count<1){
		clearInterval(tid);
		return;
	}
	console.log( count )
	count--;
	thandle.vendorAll()
	
},30)