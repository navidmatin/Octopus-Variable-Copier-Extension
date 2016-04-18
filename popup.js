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
	}, function (window) {});
});

var octopusInfo = null;
var octopusControllerInstance = null;

function getCurrentTabUrl(callback) {
	// Query filter to be passed to chrome.tabs.query - see
	// https://developer.chrome.com/extensions/tabs#method-query
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, function (tabs) {
		// chrome.tabs.query invokes the callback with a list of tabs that match the
		// query. When the popup is opened, there is certainly a window and at least
		// one tab, so we can safely assume that |tabs| is a non-empty array.
		// A window can only have one active tab at a time, so the array consists of
		// exactly one tab.
		var tab = tabs[0];

		// A tab is a plain object that provides information about the tab.
		// See https://developer.chrome.com/extensions/tabs#type-Tab
		var url = tab.url;

		// tab.url is only available if the "activeTab" permission is declared.
		// If you want to see the URL of other tabs (e.g. after removing active:true
		// from |queryInfo|), then the "tabs" permission is required to see their
		// "url" properties.
		console.assert(typeof url == 'string', 'tab.url should be a string');

		callback(url);
	});

	// Most methods of the Chrome extension APIs are asynchronous. This means that
	// you CANNOT do something like this:
	//
	// var url;
	// chrome.tabs.query(queryInfo, function(tabs) {
	//   url = tabs[0].url;
	// });
	// alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function isThereSavedInfo(pass) {
	//Instantiation octopusInfo with password
	octopusInfo = octopusServerInfo(pass);
	octopusInfo.doesSaveExist(function (result) {
		console.log(result);
		if (!result) {
			showGetServerInfo();
		} else {
			showInfo();
		}
	});

}

function saveServerInfo() {

	var server = document.getElementById("server").value;

	octopusInfo.saveOctopusServerServerAddressAPIKey(server, document.getElementById("apiKey").value);
	showInfo();

}

function setupController() {
	octopusControllerInstance = octopusController(octopusInfo);
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
	document.getElementById("getOctopusServer").display = "block";
	document.getElementById("variableCopySection").style.display = "none";
	document.getElementById("variableSetName").style.display = "none";
}

function showInfo() {
	setupController();
	octopusInfo.getOctopusServerInfo(function (result) {
		if (result) {
			document.getElementById('password').style.display = "none";
			document.getElementById("getOctopusServer").style.display = "none";
			document.getElementById("variableSetName").style.display = "block";
			document.getElementById("variableCopySection").style.display = "none";
			document.getElementById("badPassword").style.display = "none";
			createVariableDropDown();
			console.log(result);
		} else {
			document.getElementById("badPassword").style.display = "block";
			result = "BAD PASSWORD";
			console.log(result);
		}
	});
}

function onVariableDropDownChange() {
	var select = document.getElementById("selectVar");
	document.getElementById("newVarSet").value = select.options[select.selectedIndex].text;
}

function createVariableDropDown() {
	var selectStatement = document.getElementById("selectVar");
	octopusControllerInstance.getAllLibraryVariableSets(function (result) {
		for (var i = 0; i < result.length; i++) {
			var option = document.createElement("option");
			option.text = result[i].Name;
			option.value = result[i].Id;
			selectStatement.add(option);
		}
	});
}

function copyVariableSet() {
	//Get currently selected lib var set id
	octopusControllerInstance.copyLibraryVariableSet(document.getElementById("selectVar").value, document.getElementById("newVarSet").value, null, 1, false, function (result) {
		if (result) {
			document.getElementById("success").style.display = "block";
			document.getElementById("failure").style.display = "none";
		} else {
			document.getElementById("success").style.display = "none";
			document.getElementById("failure").style.display = "block";
		}
	})

}

function copyVariableSetWithScope() {
	//Get currently selected lib var set id
	octopusControllerInstance.copyLibraryVariableSet(document.getElementById("selectVar").value, document.getElementById("newVarSet").value, null, 1, true, function (result) {
		if (result) {
			document.getElementById("success").style.display = "block";
			document.getElementById("failure").style.display = "none";
		} else {
			document.getElementById("success").style.display = "none";
			document.getElementById("failure").style.display = "block";
		}
	})

}


function enterPass(e) {
	if (e.keyCode == 13 && document.activeElement.id === "passkey") {
		login();
	}
}

function login() {
	var pass = document.getElementById("passkey").value;
	isThereSavedInfo(pass);
}
window.onload = function () {
	setUpElements();
}