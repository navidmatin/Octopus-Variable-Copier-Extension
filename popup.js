// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
//Opens up a new pop up rather than attached:
chrome.browserAction.onClicked.addListener(function () {
	chrome.windows.create({
		'url': 'popup.html',
		'type': 'popup'
	}, function (window) { });
});

var octopusInfo = null;
var octopusControllerInstance = null;

//Check to see if this machine has saved information about an Octopus Server
function isThereSavedInfo() {
	octopusInfo.doesSaveExist().then(function (result) {
		console.log(result);
		if (!result) {
			showGetServerInfo();
		} else {
			showGetPassword();
		}
	});

}

function saveServerInfo() {

	octopusInfo.getPassword(document.getElementById("newPassword").value)
	octopusInfo.saveOctopusServerServerAddressAPIKey(document.getElementById("server").value, document.getElementById("apiKey").value);
	showInfo();

}

function setUpElements() {
	document.getElementById("save").addEventListener("click", saveServerInfo);
	document.getElementById('passkey').addEventListener('keyup', enterPass);
	document.getElementById('passEnter').addEventListener('click', login);
	document.getElementById('password').style.display = "block";
	document.getElementById("copy").addEventListener("click", copyVariableSet);
	document.getElementById("copywtScope").addEventListener("click", copyVariableSetWithScope);
	document.getElementById("selectVar").addEventListener("change", onVariableDropDownChange);
}

function showGetServerInfo() {
	document.getElementById('password').style.display = "none";
	document.getElementById("getOctopusServer").style.display = "block";
	document.getElementById("variableCopySection").style.display = "none";
	document.getElementById("variableSetName").style.display = "none";
}

function showGetPassword() {
	document.getElementById('password').style.display = "block";
	document.getElementById("getOctopusServer").style.display = "none";
	document.getElementById("variableCopySection").style.display = "none";
	document.getElementById("variableSetName").style.display = "none";
}

function showInfo() {
	octopusInfo.getOctopusServerInfo().then(function (result) {
		if (result) {
			document.getElementById('password').style.display = "none";
			document.getElementById("getOctopusServer").style.display = "none";
			document.getElementById("variableSetName").style.display = "block";
			document.getElementById("variableCopySection").style.display = "none";
			document.getElementById("badPassword").style.display = "none";
			createVariableDropDown();
			console.log(result);
		}
	}).catch(function () {
		document.getElementById("badPassword").style.display = "block";
		result = "BAD PASSWORD";
		console.log(result);
	});
}

function onVariableDropDownChange() {
	var select = document.getElementById("selectVar");
	document.getElementById("newVarSet").value = select.options[select.selectedIndex].text;
}

function createVariableDropDown() {
	var selectStatement = document.getElementById("selectVar");
	octopusControllerInstance.getAllLibraryVariableSets().then(function (result) {
		for (var i = 0; i < result.length; i++) {
			var option = document.createElement("option");
			option.text = result[i].Name;
			option.value = result[i].Id;
			selectStatement.add(option);
		}
	});
}

function createEnvironmentDropDown() {
	let envDropDownList = document.getElementById("envDropDown");
	octopusControllerInstance.getAllEnvironments().then(function(result) {
		for(let i =0; i < result.length; i++) {
			let liDom = document.createElement("li");
			liDom.text = result[i].Name;
			liDom.value = result[i].Id;
			envDropDownList.add(liDom);
		}
	});
}

function copyVariableSet() {
	hideAlerts();
	//Get currently selected lib var set id
	octopusControllerInstance.copyLibraryVariableSet(document.getElementById("selectVar").value, document.getElementById("newVarSet").value, null, 1, false).then(function (result) {
		if (result) {
			document.getElementById("success").style.display = "block";
			document.getElementById("failure").style.display = "none";
			fade(document.getElementById("success"), 50);
		} else {
			document.getElementById("success").style.display = "none";
			document.getElementById("failure").style.display = "block";
			fade(document.getElementById("failure"), 50);
		}
	}).catch(function (error) {
		document.getElementById("success").style.display = "none";
		document.getElementById("failure").style.display = "block";
		fade(document.getElementById("failure"), 50);
	});

}

function hideAlerts() {
	document.getElementById("success").style.display = "none";
	document.getElementById("failure").style.display = "none";
}

function copyVariableSetWithScope() {
	hideAlerts();
	//Get currently selected lib var set id
	octopusControllerInstance.copyLibraryVariableSet(document.getElementById("selectVar").value, document.getElementById("newVarSet").value, null, 1, true).then(function (result) {
		if (result) {
			document.getElementById("success").style.display = "block";
			document.getElementById("failure").style.display = "none";
			fade(document.getElementById("success"), 50);
		} else {
			document.getElementById("success").style.display = "none";
			document.getElementById("failure").style.display = "block";
			fade(document.getElementById("failure"), 50);
		}
	}).catch(function (error) {
		document.getElementById("success").style.display = "none";
		document.getElementById("failure").style.display = "block";
		fade(document.getElementById("failure"), 50);
	});

}


function enterPass(e) {
	if (e.keyCode == 13 && document.activeElement.id === "passkey") {
		login();
	}
}

function login() {
	var pass = document.getElementById("passkey").value;
	octopusInfo.getPassword(pass);
	showInfo();
}

function fade(element, time) {
	var op = 1; // initial opacity
	var timer = setInterval(function () {
		if (op <= 0.1) {
			clearInterval(timer);
			element.style.display = 'none';
		}
		element.style.opacity = op;
		element.style.filter = 'alpha(opacity=' + op * 100 + ")";
		op -= op * 0.1;
	}, time);
}

window.onload = function () {
	chrome.runtime.getBackgroundPage(function (win) {
		octopusInfo = win.octopusServerInfo();
		//Clean up just to be safe
		octopusInfo.cleanUp();
		octopusControllerInstance = win.octopusController(octopusInfo);
		setUpElements();
		isThereSavedInfo();
	});

}