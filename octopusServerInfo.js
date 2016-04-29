function octopusServerInfo(){
	var serverInfo = this;
	var pass = null;
	function encrypt(data)
	{
		var encrypt=sjcl.encrypt(serverInfo.pass, JSON.stringify(data));
		return encrypt;
	}
	function decrypt(data)
	{
		try{
			return sjcl.decrypt(serverInfo.pass, data);
		}
		catch(e)
		{
			return null;
		}

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
	
	var getPassword = function(password){
		serverInfo.pass= password;
	}
	
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
			if(result)
			{
				var decrypted = decrypt(result);
				if(decrypted)
				{
					callback(decrypted);
				}
				else
				{
					callback(null);
				}

			}
		});

	}

	var doesSaveExist = function(callback)
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
		doesSaveExist: doesSaveExist,
		getPassword: getPassword
	}
}