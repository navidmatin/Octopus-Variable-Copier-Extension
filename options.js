function removeCredentials(){
    chrome.storage.local.clear(function(){
        if(!chrome.runtime.lastError)
        {
            document.getElementById("successAlert").style.display = "block";
            setTimeout(function(){
                document.getElementById("successAlert").style.display = "none";
            }, 1000);
        }
    });
}

document.getElementById("removeCreds").addEventListener("click", removeCredentials);



