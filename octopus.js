
function Octopus(){
	var saveOctopusServerServerAddressAPIKey = function(address, apiKey)
	{
		var server = {
			address: address,
			api:apiKey
		};
		setStoredInfo(encrypt(server));
	}

	var getOctopusServerInfo = function(callback)
	{
		getStoredInfo(function(result, err){
			console.log('got following:' + result)
			if(result)
			{
				callback(decrypt(result));
			}
		});

	}



	function encrypt(data)
	{
		//TODO: Generate the Key and figure out a good way to store it!
		var encrypt=sjcl.encrypt("KheilyKharyGaveNary", JSON.stringify(data));
		return encrypt;
	}

	function decrypt(data)
	{
		return sjcl.decrypt("KheilyKharyGaveNary", data);
	}

	function setStoredInfo(data)
	{
		chrome.storage.local.set({OctopusVariableCopyExtensionData:data}, function(){
			console.log('Server info has been saved');
		});
	}
	//GetStoredInfo reads back storedInformation call like this: getStoredInfo(function(result, [optional] err){});
	function getStoredInfo(callback)
	{
		chrome.storage.local.get(['OctopusVariableCopyExtensionData'], function(result){
			//Always get the first on

			if(result.OctopusVariableCopyExtensionData)
			{
				callback(result.OctopusVariableCopyExtensionData, null);
			}
			else
			{
				callback(null, chrome.runtime.lastError);
			}

		});
	}

	var isSaveExist = function(callback)
	{
		getStoredInfo(function(result, err){
			if(result)
			{
				callback(true);
			}
			else
			{
				console.log(err);
				callback(false);
			}

		});
	}
	return {
		saveOctopusServerServerAddressAPIKey: saveOctopusServerServerAddressAPIKey,
		getOctopusServerInfo: getOctopusServerInfo,
		isSaveExist: isSaveExist
	}
}

