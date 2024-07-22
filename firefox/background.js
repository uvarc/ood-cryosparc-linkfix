function getPathPrefix (url){
    const matches = url.pathname.match(pathPrefix);
    return matches ? matches[0] : "";
}

const pathPrefix = /^\/(r*node\/udc-....-...+\/[0-9]+)/;

//redirect if request made that doesn't properly include the path
function redirect(requestDetails) {
    if (requestDetails.originUrl === undefined) return; //happens for the first request to the page
    const reqURL = new URL(requestDetails.url);
    const pageURL = new URL(requestDetails.originUrl);
    if (reqURL.hostname !== pageURL.hostname) return; //request is for some other server
    if (!pathPrefix.test(pageURL.pathname)) return; //page url is not an rnode url
    if(!pathPrefix.test(reqURL.pathname)){ //need to add prefix to path
        const newURL = `${reqURL.origin}${getPathPrefix(pageURL)}${reqURL.pathname}`;
        return {redirectUrl: newURL};
    }
}

chrome.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ["https://ood.hpc.virginia.edu/*", "https://ood1.hpc.virginia.edu/*"] },
    ["blocking"],
);
