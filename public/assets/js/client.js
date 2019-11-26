
/*
*  Client side logic
*/

//app container 
const app = {};

//@TODO production baseUrl
app.config = {
	sessionToken :false,
	baseUrl:false
};

//request client
app.client = {};

app.getOrigin = function(){
  baseUrl = document.querySelector('base').href.toString();
  console.log(baseUrl);
	if(baseUrl.trim().length > 0 ) return app.config.baseUrl = baseUrl;
	return 'http://localhost:7000/';
}

app.client.request = function(headers,path,method,queryStringObject,payload,callback){
	  // Gather input from the caller otherwise set defaults
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;
  //building the request by adding the queryStringObject as key value pairs 
  if(queryStringObject){
  var requestUrl = path+'?';
  var counter = 0;
  for(var key in queryStringObject){
     if(queryStringObject.hasOwnProperty(key)){
     	counter++
       // If no key value pair added yet dont at the & sign
       if(counter > 1){
         requestUrl+='&';
       }
       // Add the key and value
       requestUrl+=key+'='+queryStringObject[key];
     }
     //increment counter
   } 

  }


 // Form the http request
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);//the true flag is to insure that it is async
  xhr.setRequestHeader("Content-Type", "application/json");//making it a json request
  // looping througgh the supplied header object and adding it to the request

  for(var key in headers){
     if(headers.hasOwnProperty(key)){
       xhr.setRequestHeader(key, headers[key]);
     }
  }

 // If current session token is available, add it to the request
  if(app.config.sessionToken){
    xhr.setRequestHeader("x-auth-token", app.config.sessionToken);
  }

 
  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode = xhr.status;
        var responseReturned = xhr.responseText;
      
        // Callback if requested
        if(callback){
       
          try{
            var parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            callback(statusCode,false);
          }

        }
      }
  }


  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString); 
  
};


// Bind the forms
app.bindForms = function(){
  var form = document.querySelector("form");
  if(form !== null){
  form.addEventListener("submit", function(e){
  	// Stop form submitting default action
  
	e.preventDefault();
   
    var formId = this.id;
    var path = this.action;
   var method = this.method.toUpperCase()=='GET'? 'PUT': this.method.toUpperCase();
    if(path.indexOf('?')>-1){
		var querystring = path.split('?')[1].split('=');
		var queryKey = querystring[0];
		var queryValue = querystring[1];
		path = path.split('?')[0];
		var queryStringObject = {}
		queryStringObject[queryKey] = queryValue;
		}
		
		
		var errorContainer = document.querySelector("#"+formId+" #formError");
		var errorField = document.querySelector("#"+formId+" #formError #errorField");
		
    // Hide the error message due to previous error
    
    errorContainer.style.display = 'none';
 
    // Getting the inputs and turning them into a payload
    var payload = {};
    var elements = this.elements;
    
    for(var i = 0; i < elements.length; i++){
   if(elements[i].type !== 'submit'){
      	if(elements[i].type=='hidden'){
      		var valueOfElement = true;
      	}else if(elements[i].tagName == 'SELECT'){
            var selectedElements = elements[i].querySelectorAll('option');
            console.log(selectedElements.length);
      			let values = [];
      			for(var a = 0; a< selectedElements.length; a++){
      				if(selectedElements[a].selected){
      				values.push(selectedElements[a].value);
      				}
      			}
      			valueOfElement = values;

    			}else if(elements[i].type=='checkbox'){
			   		if(elements[i].checked){
			   		 valueOfElement = true;
			   		 path = path.replace('update','edit');
			   		 }
	   	    }
      	else{
      		var valueOfElement = elements[i].value;
      	};
		    payload[elements[i].name] = valueOfElement;
      }
    }
		this.reset();

	document.querySelector('#submit').style.display = 'none';
	document.querySelector('#loader').style.display = 'block';
	
    // Call the API
    app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
		document.querySelector('#submit').style.display = 'block';
		document.querySelector('#loader').style.display = 'none';
    	 // is thte status isnt 200 and there is an error, then display the error
      if(statusCode !== 200){
        // Reading the error from the API if there is any
       var error = typeof  responsePayload.error !== 'undefined' ? responsePayload.error :'an error occured! try again';
      			 // Set the formError to the conatiner of the error displayer
        errorField.innerHTML = error;
					
        // display the error
        errorContainer.style.display = 'block';

      } else {
        // If successful,Sending the form response to the response processor
        app.formResponseProcessor(formId,payload,responsePayload);
      }

    });
    
  });
  };

 
};


// Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  var functionToCall = false;
  // immediately log the user in if their account was created successfully
  if(formId == 'accountCreate'){

    var success = typeof  responsePayload.message !== 'undefined' ? responsePayload.message :'user creation successful';
      			 // Set the formError to the conatiner of the error displayer
        errorField.innerHTML = success;
        errorField.clasList.splice(errorField.indexOf(text-danger),1)
        errorField.clasList += 'text-success';
					console.log(errorField)
        // display the error
        errorContainer.style.display = 'block';
  }
  // If login was successful, set the token in localstorage and redirect the user
  if(formId == 'sessionCreate'){
  	app.setSessionToken(responsePayload.token);
  	window.location = 'overview?token='+app.config.sessionToken;
  }
  if(formId == 'groupCreate'){
  	window.location = 'group?id='+responsePayload._id+'&token='+app.config.sessionToken;
  }
  };

app.deleteGroup = function(){
	var button = document.querySelector('.deleteGroup');
	if(button != null){
		button.addEventListener('click', e => {
			let id = e.target.id;
			var confirm = window.confirm('Are you sure you want to delete this group? ');
			if(confirm){
				
				app.client.request(undefined,'api/groups/delete/'+id,'DELETE',undefined,undefined,function(status,payload){
					if(status == 200){
						window.location = 'groups?token='+app.config.sessionToken;   //@TODO add token;
					}	
				});
			}
		})
	}
}

app.deleteUser = function(){
	var button = document.querySelector('.deleteUser');
	if(button != null){
		button.addEventListener('click', e => {
			let id = e.target.id;
			var confirm = window.confirm('Are you sure you want to delete this user? ');
			if(confirm){
				
				app.client.request(undefined,'api/accounts/delete/'+id,'DELETE',undefined,undefined,function(status,payload){
					if(status == 200){
						window.location = 'userslist?token='+app.config.sessionToken;   //@TODO add token;
					}	
				});
			}
		})
	}
}





// Get the session token from localstorage and set it in the app.config object
app.getToken = function(){
  var stringToken = localStorage.token;
	
  if(typeof stringToken == 'string'){
      app.config.sessionToken = stringToken;
      app.tokenize();
      
      
    }else{
    	app.config.sessionToken = false;
    	//window.location = 'login'
    }
};



// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token){
	token = typeof  token  == 'string' ? token :false;
	if(token){
  app.config.sessionToken = token;
  localStorage.token = token;
  }else{
  	localStorage.removeItem('token');
  	app.config.sessionToken = false;
  }
  };
  

// Renew the token
app.renewToken = function(callback){
  var currentToken = typeof(app.config.sessionToken) == 'string' ? app.config.sessionToken : false;
  if(currentToken){
    // Update the token with a new expiration
    app.client.request(undefined,'api/accounts/renew/token','PUT',undefined,undefined,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // setting the new token to the app config 
        if(responsePayload){
        app.setSessionToken(responsePayload.token);
        callback(false);	
        }
        
        } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Loop to renew token often
app.tokenRenewalLoop = function(){
  setInterval(function(){
    app.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};


app.logout = function(){
	var button = document.querySelector('#logout');
	if(typeof button !== 'null'){
		button.addEventListener('click', e=>{
		e.preventDefault();
		app.config.sessionToken = false;
		localStorage.removeItem('token');
		window.location = 'login';	
		});
	}
};



app.tokenize = function(){
	var a = document.querySelectorAll('a');
	if(typeof dashboard !== 'null'){
		if(app.config.sessionToken){
		for( var i = 0;i < a.length; i++ ){
			  var el = a[i];
			if(el.href.indexOf('login') == -1 ){
		 		if(el.href.toString().indexOf('?') > -1){
		 			el.href +='&token='+app.config.sessionToken;
		 		}else{
		 			el.href += '?token='+app.config.sessionToken;
		 		}		
		 	}
		  }
	     }
		}
};

app.auth = function(){
	if(!app.config.sessionToken){
if(window.location.toString().indexOf('login') == -1 ){
	 		window.location = 'login';		
	 	} 
	}
}



app.isLoggedIn = ()=>{
	var loggedIn = document.querySelector('#loggedIn');
	var loggedOut = document.querySelector('#loggedOut');
	if(app.config.sessionToken){
		loggedIn.style.display = 'block';
	}else{
		loggedOut.style.display = 'block';
	}
};


/*
//Check if user is Admin 
app.userIsAdmin = () => {
	var queryStringObject = {
		'userId':app.config.sessionToken.userId
	}
	//hitting the API
	app.client.request(undefined,'api/users','GET',queryStringObject,undefined,(status,responsePayload) => {
		if(status == 200 && responsePayload.isAdmin ){
			var isAdmin = {'isAdmin':true};
			var stringValue = JSON.stringify(isAdmin);
			localStorage.isAdmin = stringValue;
			}
	});
	
};

*/


// Initialisation method
app.init = function(){


//get baseurl
app.getOrigin();


// Get the token from localstorage
app.getToken();


//auth
	app.auth();
	


 // Renew token
app.tokenRenewalLoop();

//Displaying appropiate links according the online status of a user
app.isLoggedIn();


//logout button
app.logout();

//delete group button
app.deleteGroup();

//delete user 
app.deleteUser()


// handling all form submissions
 app.bindForms();
  


}

  
// Call the init processes after the window loads
window.onload = function(){
	
  app.init();
};


