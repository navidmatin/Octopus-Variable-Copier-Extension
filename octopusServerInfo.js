function octopusServerInfo() {
	var serverInfo = this;
	var pass = null;
	var port = chrome.runtime.connect({ name: "disconnect" });
	function encrypt(data) {
		var encrypt = sjcl.encrypt(serverInfo.pass, JSON.stringify(data));
		return encrypt;
	}
	function decrypt(data) {
		try {
			return sjcl.decrypt(serverInfo.pass, data);
		}
		catch (e) {
			return null;
		}

	}

	function setStoredInfo(data) {
		chrome.storage.local.set({ OctopusVariableCopyExtensionData: data }, function () {
			console.log('Server info has been saved');
		});
	}

	//GetStoredInfo reads back storedInformation call like this: getStoredInfo(function(result, [optional] err){});
	function getStoredInfo() {
		return new Promise(function (resolve, reject) {
			chrome.storage.local.get(['OctopusVariableCopyExtensionData'], function (result) {
				//Always get the first on

				if (result.OctopusVariableCopyExtensionData) {
					resolve(result.OctopusVariableCopyExtensionData);
				}
				else {
					reject(chrome.runtime.lastError);
				}

			});
		})

	}

	var getPassword = function (password) {
		serverInfo.pass = password;
	}

	var saveOctopusServerServerAddressAPIKey = function (address, apiKey) {
		var server = {
			address: address,
			api: apiKey
		};
		setStoredInfo(encrypt(server));
	}

	var getOctopusServerInfo = function () {
		return new Promise(function (resolve, reject) {
			getStoredInfo().then(function (result) {
				if (result) {
					var decrypted = decrypt(result);
					if (decrypted) {
						resolve(decrypted);
					}
					else {
						reject();
					}

				}
			}).catch(function(){
				reject();
			});
		});


	}

	var doesSaveExist = function () {
		return new Promise(function (resolve, reject) {
			getStoredInfo().then(function (result) {
				if (result) {
					resolve(true);
				}
				else {
					resolve(false);
				}
			}).catch(function(error){
				resolve(false);
			});

		});

	}

	var cleanUp = function () {
		console.log("Cleaning up");
		serverInfo.pass = "";
		pass = "";
	}

	return {
		saveOctopusServerServerAddressAPIKey: saveOctopusServerServerAddressAPIKey,
		getOctopusServerInfo: getOctopusServerInfo,
		doesSaveExist: doesSaveExist,
		getPassword: getPassword,
		cleanUp: cleanUp
	}
}