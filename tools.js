var chalk = require('chalk')

function msg(){
	
	var debug = 0, show=1;
	var name =arguments[0],
		content = Array.prototype.slice.call(arguments,0);
		
	// console.log(">",name,"<",content);
		
	if( 0 ){
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
			
			default:
				show = 0;
				content[0] = `${chalk.yellow(name)}`;
			break;
		}
		
		
		show && console.log.apply(this,content);
		
	}
	
}

exports.msg = msg
