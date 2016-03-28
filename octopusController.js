
function octopusController(octopusServerInfo){
    
    
	function createUrlWithKeyHeaderForOctopus(sectionUrl, callback)
	{
		octopusServerInfo.getOctopusServerInfo(function(result){
			if(result)
			{
				var resultObject = JSON.parse(result);
				callback({
					address:"http://" + resultObject.address + sectionUrl,
					parameter:resultObject.api
				});
			}
		})
	}

	//function for doing POST on Octopus REST-API
	function octopusServerHttpPostRequest(url, apiKey, callback)
	{
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);

		xhr.onreadystatechange = function() {//Call a function when the state changes.
		    if(xhr.readyState == 4 && xhr.status == 200) {
		        console.log(xhr.response);
		        callback(xhr.response);
		    }
		}
		xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
		xhr.send(apiKey);
	}
	
	//function for doing GET on Octopus REST-API (Parameters: [{name:"", value:""}])
	function octopusServerHttpGetRequest(url, apiKey, callback, parameters)
	{
		var xhr = new XMLHttpRequest();
        var allOfParams = [];
		xhr.open("GET", url, true);

		xhr.onreadystatechange = function() {//Call a function when the state changes.
		    if(xhr.readyState == 4 && xhr.status == 200) {
		        console.log(xhr.response);
		        callback(xhr.response);
		    }
		}
		xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
        allOfParams.push(apiKey);
        if(parameters)
        {
            for(var i=0;i<parameters.length;i++)
            {
                xhr.setRequestHeader(parameters[i].name, parameters[i].value);
                allOfParams.push(parameters[i].value);
            }
        }

		xhr.send(allOfParams);
	}

    //Gets all of the library variable sets_ callback = function(listOfLibraryVariableSets)
    var getAllLibraryVariableSets = function(callback){
        createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets?contentType=Variables", function(result){
			octopusServerHttpGetRequest(result.address, result.parameter, function(result){
                if(result)
                {
                    var returnedObject = JSON.parse(result);
                    var listOfLibraryVariableSets = [];
                    for(var i=0;i<returnedObject.Items.length;i++)
                    {
                        listOfLibraryVariableSets.push(returnedObject.Items[i]);
                    }
                    callback(listOfLibraryVariableSets);
                }
            });
		})
    }
	var callAPI = function()
	{
		createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets", function(result){
			octopusServerHttpGetRequest(result.address, result.parameter, function(){}, [{name:"contentType", value:"Variables"}]);
		})

	}


	return {
		callAPI: callAPI,
        getAllLibraryVariableSets: getAllLibraryVariableSets
	}
}

