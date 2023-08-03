var fs = require("fs");
var uuid = require("uuid");
var wkhtmltopdf = require("wkhtmltopdf");

const sendRes = function(callback, IsSucesso, data){

	if( IsSucesso == true )
	{
		
		var response = {
		statusCode: 200,
		body: data
		};
		
	}else{
		
		var response = {
		statusCode: 500,
		body: data
		};
		
	}
	
	callback(null, response);

};

exports.handler = function(event, context, callback) {
    
    if( event.url ) 
	{
	    
        console.log(">> INICIADO <<");
        console.log("Url: " + event.url);

        var filename = uuid() + ".pdf";
		var output = "/tmp/" + filename;
        var writeStream = fs.createWriteStream(output);

		wkhtmltopdf(event.url, event.options, function(code, signal) {

            console.info("wkhtmltopdf | code: " + code);
            console.info("wkhtmltopdf | signal: " + signal);

			if( code != null )
			{
            
                console.log("wkhtmltopdf | error");
                
				sendRes(callback, false, {"Msg": "Falha Gerada pelo wkhtmltopdf"});
				
			}else{

                console.info("wkhtmltopdf | Sucesso");

                var stats = fs.statSync(output);

                fs.readFile(output, {encoding: 'base64'}, function (err, data) {

                    if(err) 
                    {
                        
                        console.log("readFile | error");
                        console.log(err);

                        sendRes(callback, false, {"Msg": "Falha em ler Raw"});

                    }else{

                        console.log(">> SUCESSO <<");

                        sendRes(callback, true, {"Nome": filename, "Pdf": data.toString()});

                    }

                });
			
			}

		}).pipe(writeStream);

	}else{

        console.log("Url nao informada");
    
		sendRes(callback, false, {"Msg": "Url nao informada"});

	}

};