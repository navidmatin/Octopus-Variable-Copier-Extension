function octopusController(octopusServerInfo) {
	var octopusController = this;

	var allLibraryVariableSets = [];
	var gotAllVariableSets = false;

	function createUrlWithKeyHeaderForOctopus(sectionUrl) {
		return new Promise(function createUrlWithKeyHeaderForOctopusPromise(resolve, reject) {
			octopusServerInfo.getOctopusServerInfo().then(function (result) {
				if (result) {
					var resultObject = JSON.parse(result);
					var serverAddress = cleanUpAddress(resultObject.address);
					resolve({
						address: serverAddress + sectionUrl,
						key: resultObject.api
					});
				}
				else {
					reject();
				}
			}).catch(function (error) {
				reject();
			});
		});

	}

	function cleanUpAddress(address)
	{
		var cleanedBaseAddress = address;
		//Legacy Code Checks
		//Check to see if it starts with http, if not add http
		if(!address.toLowerCase().startsWith("http"))
		{
			cleanedBaseAddress = "http://" + address;
		}
		//Check to see if the user entered the string with / at the end, if so remove it.
		if(address.endsWith("/"))
		{
			cleanedBaseAddress = cleanedBaseAddress.slice(0,-1);
		}
		return cleanedBaseAddress;
	}

	//function for doing POST on Octopus REST-API
	function octopusServerHttpPostRequest(url, apiKey, body) {
		return new Promise(function httpPostPromise(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);

			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
				}
				else {
					reject(xhr.response);
				}
			}

			xhr.onerror = function () {
				reject();
			}
			xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
			xhr.send(JSON.stringify(body));
		})

	}

	//function for doing GET on Octopus REST-API
	function octopusServerHttpGetRequest(url, apiKey) {
		return new Promise(function httpGetPromise(resolve, reject) {
			var xhr = new XMLHttpRequest();
			var allOfParams = [];
			xhr.open("GET", url, true);
			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
				}
				else {
					reject(xhr.response);
				}
			}

			xhr.onerror = function () {
				reject();
			}
			xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
			xhr.send();
		});

	}

	//function for doing PUT on Octopus REST-API
	function octopusServerHttpPutRequest(url, apiKey, body) {
		return new Promise(function httpPutPromise(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("PUT", url, true);

			xhr.onreadystatechange = function () { //Call a function when the state changes.
				if (xhr.readyState === 4) {
					console.log(xhr.response);
					resolve(xhr.response);
				}
			};
			xhr.setRequestHeader("X-Octopus-ApiKey", apiKey);
			xhr.send(JSON.stringify(body));
		});


	}

	//Gets variables for a library variable set(it needs variable set id)
	function getVariables(id) {
		return new Promise(function getVariablesPromise(resolve, reject) {
			createUrlWithKeyHeaderForOctopus("/api/variables/" + id).then(function (result) {
				return octopusServerHttpGetRequest(result.address, result.key)
			}).then(function (variableSet) {
				var varSet = JSON.parse(variableSet);
				resolve(varSet);
			}).catch(function (error) {
				reject();
			});
		});
	}

	//Creates a new empty variable set
	function createNewLibraryVariableSet(name, description) {
		return new Promise(function createNewLibraryVarSetPromise(resolve, reject) {
			var data = {
				"ContentType": "Variables",
				"Name": name,
				"Description": description
			};
			createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets")
				.then(function (result) {
					return octopusServerHttpPostRequest(result.address, result.key, data)
				}).then(function (result) {
					if (result) {
						resolve(JSON.parse(result));
					} else {
						reject();
					}
				}).catch(function (error) {
					reject(error);
				});
		});

	}

	//Add a set of variables to a variable set
	function copyVariables(newLibVarSet, oldVariableSet, keepScope) {
		return new Promise(function copyVariablesPromise(resolve, reject) {
			createUrlWithKeyHeaderForOctopus("/api/variables/" + newLibVarSet.VariableSetId).then(function (result) {
				if (result) {
					var newVarSet = {
						Id: newLibVarSet.VariableSetId,
						OwnerId: newLibVarSet.Id,
						ScopeValues: oldVariableSet.ScopeValues,
						Version: 0,
						Variables: []
					};
					for (var i = 0; i < oldVariableSet.Variables.length; i++) {
						var scope = {};
						if (keepScope) {
							scope = oldVariableSet.Variables[i].Scope;
						}
						var variableJSON = {
							IsEditable: oldVariableSet.Variables[i].IsEditable,
							IsSensitive: oldVariableSet.Variables[i].IsSensitive,
							Prompt: oldVariableSet.Variables[i].Prompt,
							Scope: scope,
							Value: oldVariableSet.Variables[i].Value,
							Name: oldVariableSet.Variables[i].Name
						};
						newVarSet.Variables.push(variableJSON);
					}
					return octopusServerHttpPutRequest(result.address, result.key, newVarSet);
				}
				else {
					reject(false);
				}
			}).then(function (result) {
				if (!result) {
					reject(false);
				}
				resolve(true);
			}).catch(function (error) {
				reject(false);
			});
		});

	}

	//Private function that gets called by 'getAllLibraryVariableSets'
	function getAllLibraryVariableSetsFunc(result) {
		return new Promise(function getAllLibVarSetsFuncPromise(resolve, reject) {
			if (result) {
				var returnedObject = JSON.parse(result);
				var allPromises = [];

				for (var i = 1; i <= (returnedObject.TotalResults / returnedObject.ItemsPerPage) + 1; i++) {
					allPromises.push(getLibraryVariableSetsForPage(i, returnedObject.ItemsPerPage));
				}
				Promise.all(allPromises).then(function () {
					resolve(allLibraryVariableSets)
				});
			}
		});

	}

	function addToAllLibraryVariableSets(result) {
		if (result) {
			var returnedObject = JSON.parse(result);
			for (var i = 0; i < returnedObject.Items.length; i++) {
				allLibraryVariableSets.push(returnedObject.Items[i]);
			}
		}
	}

	function getLibraryVariableSetsForPage(pageNum, itemsPerPage) {
		return new Promise(function getLibVarSetsForPagePromise(resolve, reject) {
			var itemsToSkip = (pageNum - 1) * itemsPerPage;
			createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets?contentType=Variables&skip=" + itemsToSkip).then(function (result) {
				octopusServerHttpGetRequest(result.address, result.key).then(function (libVarSets) {
					addToAllLibraryVariableSets(libVarSets);
					resolve();
				}).catch(function (error) {
					reject();
				});
			});
		});

	}

	function getLibraryVariableSetContentFunc(libraryVariableSet) {
		return new Promise(function getLibVarSetContentFuncPromise(resolve, reject) {
			if (libraryVariableSet) {
				var libVarSet = JSON.parse(libraryVariableSet);
				//Now get the variables for this library variable set
				getVariables(libVarSet.VariableSetId).then(function (varSet) {
					if (varSet) {
						resolve({
							LibraryVariableSet: libVarSet,
							Variables: varSet
						});
					} else {
						reject();
					}
				});
			}
		});

	}

	var getAllEnvironments = function() {
		return new Promise(function getEnvironmentsPromise(resolve, reject) {
			createUrlWithKeyHeaderForOctopus("/api/environments").then(function (result) {
				return octopusServerHttpGetRequest(result.address, result.key)
			}).then(function (environments) {
				let environmentsJson = JSON.parse(environments);
				let environmentsArray = []
				environmentsJson.Items.forEach(function(environment){
					environmentsArray.push({"Id": environment.Id, "Name": environment.Name});
				});
				resolve(environmentsArray);
			}).catch(function (error) {
				reject(error);
			});
		});
	}

	//Gets all of the library variable sets promise
	var getAllLibraryVariableSets = function () {
		return new Promise(function getAllLibVarSetsPromise(resolve, reject) {
			createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets?contentType=Variables").then(function (result) {
				return octopusServerHttpGetRequest(result.address, result.key);
			})
				.then(function (result) {
					return getAllLibraryVariableSetsFunc(result);
				})
				.then(function (result) {
					resolve(result);
				})
				.catch(function (error) {
					reject();
				});
		});
	}

	//Returns Promise
	//Gets the library variable set object with its variables from octopus
	var getLibraryVariableSetContent = function (id) {
		//returns a promise or fails
		return createUrlWithKeyHeaderForOctopus("/api/libraryvariablesets/" + id)
			.then(function (result) {
				//First get library variable set itself
				return octopusServerHttpGetRequest(result.address, result.key);
			}).then(function (result) {
				return getLibraryVariableSetContentFunc(result);
			}).catch(function (error) {
				reject();
			});
	}

	//Copies library variable sets
	var copyLibraryVariableSet = function (originalId, newName, description, numberOfCopies, withScope) {

		return new Promise(function cpyLibVarSetPromise(resolve, reject) {
			getLibraryVariableSetContent(originalId).then(function (oldLibVarSet) {
				if (oldLibVarSet.LibraryVariableSet) {
					if (!description) {
						description = oldLibVarSet.LibraryVariableSet.Description;
					}
					createNewLibraryVariableSet(newName, description).then(function (newLibVarSet) {
						if (newLibVarSet) {
							copyVariables(newLibVarSet, oldLibVarSet.Variables, withScope).then(function (result) {
								resolve(result);
							}).catch(function (error) {
								reject(error);
							});
						}
					}).catch(function (error) {
						reject(error);
					});
				}

			});
		}).catch(function (error) {
			reject(error);
		});
	}

	return {
		getAllLibraryVariableSets: getAllLibraryVariableSets,
		getLibraryVariableSetContent: getLibraryVariableSetContent,
		createNewLibraryVariableSet: createNewLibraryVariableSet,
		copyLibraryVariableSet: copyLibraryVariableSet,
		getAllEnvironments: getAllEnvironments
	}
}