function getPathPrefix (url){
    const matches = url.pathname.match(pathPrefix);
    return matches ? matches[0] : "";
}

const pathPrefix = /^\/(r*node\/udc-....-.+\/[0-9]+)/;

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

//transform request body using callback in order to replace text
function replaceInResponse(responseDetails, callback) {
    let filter = chrome.webRequest.filterResponseData(responseDetails.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();
    filter.ondata = (event) => {
        let str = decoder.decode(event.data, { stream: true });
        str = callback(str);
        filter.write(encoder.encode(str));
    };
    filter.onstop = (event) => {
        filter.close();
    };
    return {};
}

//fixing main html page
chrome.webRequest.onBeforeRequest.addListener(
    (details)=>replaceInResponse(details, (str)=>{
        const pageURL = new URL(details.url);
        const prefix = getPathPrefix(pageURL);
        str = str.replaceAll(`src="/assets/index.146c2037.js`, `src="./assets/index.146c2037.js`);
        str = str.replaceAll(`<head>`, `<head><base href="${pageURL.origin}${prefix}/">`);
        return str;
    }),
    { urls: ["<all_urls>"], types: ["main_frame"]},
    ["blocking"]
);

chrome.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ["https://ood.hpc.virginia.edu/*", "https://ood1.hpc.virginia.edu/*"] },
    ["blocking"],
);
