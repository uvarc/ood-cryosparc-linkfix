This is a browser addon that allows users to properly connect to the [CryoSPARC OOD interactive app](https://github.com/uvarc/ood-cryosparc/).  It must be installed to properly use the app.

## Why this is needed
OOD uses the url path to specify what node/port on the cluster requests should go to.  So all requests to an interactive app's server running on the cluster need the correct path prefix `/rnode/(host)/(port)(path)`.  See https://osc.github.io/ood-documentation/latest/how-tos/app-development/interactive/view.html#reverse-proxy for an explanation.
CryoSPARC's webpage files specify all the web resource paths relative to the hostname (ie. `src="/index.js"`), but for OOD to load them correctly, they need to include the path prefix
This addon rewrites requests to the incorrect urls (ex. `"/index.js"`) to the correct ones (ex. `"/rnode/(host)/(port)/index.js"`) at request time so that OOD can locate the resources correctly

## Installing
### Chrome
* download the `/chrome` folder
* Navigate to chrome://extensions
* Expand the Developer dropdown menu and click “Load Unpacked Extension”
* Navigate to where you downloaded the `/chrome` folder and click Ok
* Assuming there are no errors, the extension should load into your browser

### Firefox
* download the `/firefox` folder
* https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/

**Note**: for both chrome and firefox you will have to reload the extension from its files after you restart your browser.  This is just because the only way to install an extension not from the official extension stores is as a temporary addon.  Hopefully we will get this on the actual extension stores soon.
