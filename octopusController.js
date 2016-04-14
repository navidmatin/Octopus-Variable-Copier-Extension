function octopusController(octopusServerInfo) {


	function createUrlWithKeyHeaderForOctopus(sectionUrl, callback) {
		octopusServerInfo.getOctopusServerInfo(function (result) {
			if (result) {
				var resultObject = JSON.parse(result);
				callback({
					address: "http://" + resultObject.address + sectionUrl,
					key: resultObject.api
				});
			}
		})
	}

	//function for doing POST on Octopus REST-API
	function octopusServerHttpPostRequest(url, apiKey, body, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);

		xhr.onreadystatechange = function () { //Call a function when the state changes.
			if (xhr.readyState == 4 && xhr.status == 200) {
				console.log(xhr.response);
				callback(xhr.response);
			}
		}
		xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
		xhr.send(JSON.stringify(body));
	}

	//function for doing GET on Octopus REST-API (Parameters: [{name:"", value:""}])
	function octopusServerHttpGetRequest(url, apiKey, callback, parameters) {
		var xhr = new XMLHttpRequest();
		var allOfParams = [];
		xhr.open("GET", url, true);

		xhr.onreadystatechange = function () { //Call a function when the state changes.
			if (xhr.readyState == 4 && xhr.status == 200) {
				console.log(xhr.response);
				callback(xhr.response);
			}
		}
		xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
		xhr.send();
	}

	//function for doing PUT on Octopus REST-API
	function octopusServerHttpPutRequest(url, apiKey, body, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("PUT", url, true);

		xhr.onreadystatechange = function () { //Call a function when the state changes.
			if (xhr.readyState == 4 && xhr.status == 200) {
				console.log(xhr.response);
				callback(xhr.response);
			}
		}
		xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
		xhr.send(JSON.stringify(body));
	}

	//Gets variables for a library variable set(it needs variable set id)
	function getVariables(id, callback) {
		createUrlWithKeyHeaderForOctopus("/api/variables/" + id, function (result) {
			octopusServerHttpGetRequest(result.address, result.key, function (variableSet) {
				var varSet = JSON.parse(variableSet);
				callback(varSet);
			});
		});
	}

	//Gets all of the library variable sets_ callback = function(listOfLibraryVariableSets)
	var getAllLibraryVariableSets = function (callback) {
		createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets?contentType=Variables", function (result) {
			octopusServerHttpGetRequest(result.address, result.key, function (result) {
				if (result) {
					var returnedObject = JSON.parse(result);
					var listOfLibraryVariableSets = [];
					for (var i = 0; i < returnedObject.Items.length; i++) {
						listOfLibraryVariableSets.push(returnedObject.Items[i]);
					}
					callback(listOfLibraryVariableSets);
				}
			});
		})
	}

	//Gets the library variable set object with its variables from octopus [callback: function(result)]
	var getLibraryVariableSetContent = function (id, callback) {
		createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets/" + id, function (result) {
			//First get library variable set itself
			octopusServerHttpGetRequest(result.address, result.key, function (libraryVariableSet) {
				if (libraryVariableSet) {
					var libVarSet = JSON.parse(libraryVariableSet);
					//Now get the variables for this library variable set
					getVariables(libVarSet.VariableSetId, function (varSet) {
						if (varSet) {
							callback({
								LibraryVariableSet: libVarSet,
								Variables: varSet
							});
						}
					});
				}
			});
		});

	}

	function createNewLibraryVariableSet(name, description, callback) {
		var data = {
			"ContentType": "Variables",
			"Name": name,
			"Description": description
		};
		createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets", function (result) {
			octopusServerHttpPostRequest(result.address, result.key, data, function (result) {
				if (result) {
					callback(JSON.parse(result));
				} else {
					callback(null);
				}

			});
		});

	}

	function addVariablesToVariableSet(varSetId, variablesArray) {
		createUrlWithKeyHeaderForOctopus("/api/variables/" + varSetId, function (result) {
			if (result) {
				for (var i = 0; i < variablesArray.length; i++) {
					octopusServerHttpPutRequest(result.address, result.key, variableJSON, function (result) {
						if (!result) {
							callback(false);
						}
					});
				}
				callback(true);
			} else {
				callback(false);
			}


		});
	}

	var copyLibraryVariableSet = function (originalId, newName, description, numberOfCopies, callback) {
		this.getLibraryVariableSetContent(originalId, function (oldLibVarSet) {
			if (oldLibVarSet.LibraryVariableSet) {
				if (!description) {
					description = oldLibVarSet.LibraryVariableSet.Description;
				}
				createNewLibraryVariableSet(newName, description, function (newLibVarSet) {
					if (newLibVarSet.Id) {
						callback(addVariablesToVariableSet(newLibVarSet.VariableSetId, oldLibVarSet.Variables));
					}
				});
			}

		});

	}

	return {
		getAllLibraryVariableSets: getAllLibraryVariableSets,
		getLibraryVariableSetContent: getLibraryVariableSetContent,
		createNewLibraryVariableSet: createNewLibraryVariableSet,
		copyLibraryVariableSet: copyLibraryVariableSet
	}
}