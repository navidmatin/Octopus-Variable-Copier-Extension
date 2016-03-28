
function octopusController(octopusServerInfo){
    
    
	function createUrlWithKeyHeaderForOctopus(sectionUrl, callback)
	{
		octopusServerInfo.getOctopusServerInfo(function(result){
			if(result)
			{
				var resultObject = JSON.parse(result);
				callback({
					address:resultObject.address + sectionUrl,
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
		        console.log(xhr.responseText);
		        callback(xhr.responseText);
		    }
		}
		xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
		xhr.send(apiKey);
	}
	
	//function for doing GET on Octopus REST-API
	function octopusServerHttpGetRequest(url, apiKey, callback)
	{
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);

		xhr.onreadystatechange = function() {//Call a function when the state changes.
		    if(xhr.readyState == 4 && xhr.status == 200) {
		        console.log(xhr.responseText);
		        callback(xhr.responseText);
		    }
		}
		xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
		xhr.send(apiKey);
	}



	var callAPI = function()
	{
		createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets", function(result){
			octopusServerHttpGetRequest("http://" + result.address, result.parameter, function(){});
		})

	}


	return {
		callAPI: callAPI
	}
}

