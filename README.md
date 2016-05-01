# Octopus Variable Copier- An unofficial tool for copying variable sets
A chrome extension for modifying Octopus deploy variable sets



# How to Use It
1. You need to have access to variable sets, and have a valid API-Key. [Here](http://docs.octopusdeploy.com/display/OD/How+to+create+an+API+key) is how you get your API Key on Octopus Deploy.

2. After getting your API key, enter your Octopus Server address, and enter a password. You will need this password every time that you open your extension. Your API Key and server info will be encrypted using the password and will be saved locally on your browser. (Removing the extension, removes the server info).

3. Now if everything worked and you have the necessary access, you will see a list of variable sets and have the option to copy them with their scopes or without any scopes.

##Libraries used for Project:
1. Bootstrap
2. SJCL (Encryption)

### Command Line Tool
You can also use the command line tool [here](https://github.com/navidmatin/Octopus-Variable-Copy-Cmd-line-utility). 
Command line tool does not store any data.
