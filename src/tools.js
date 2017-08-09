var chalk = require('chalk')

function msg(){
	
	var debug = 1, show=1;
	var name =arguments[0],
		content = Array.prototype.slice.call(arguments,0);
		
	// console.log(">",name,"<",content);
		
	if( debug ){
		console.log( content.toString()+" >", content );
		
	}else{
		
		/* if( name ){
			console.log( `${chalk.yellow(name)} >`, content )
		}else{
			
		} */
		
		switch(name){
			case "entry":
			case "complete":
				content[0] = `${chalk.green(name)}`;
			break;
			
			case "created":
				content[0] = `${chalk.yellow(name)}`;
			break;
			
			default:
				show = 0;
				content[0] = `${chalk.yellow(name)}`;
			break;
		}
		
		if( /error/.test(name) ){
			show = 1;
			content[0] = `${chalk.red(name)}`;
		}
		
		show && console.log.apply(this,content);
		
	}
	
}

exports.msg = msg
