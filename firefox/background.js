function getPathPrefix (url){
    const matches = url.pathname.match(pathPrefix);
    return matches ? matches[0] : "";
}

const pathPrefix = /^\/(r*node\/udc-....-...+\/[0-9]+)/;
const pageTitle = "CryoSPARC";

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
    (details)=>replaceInResponse(details, (str)=>{
        const pageURL = new URL(details.originUrl);
        if (details.url.includes("index.146c2037.js")){
            return str.replaceAll(`:"/`, `:"${getPathPrefix(pageURL)}/`);
        }
        if (details.url.includes("router.1b465492.js")){
            str = str.replaceAll("/websocket", `${getPathPrefix(pageURL)}/websocket`);
            str = str.replaceAll(`t.startsWith(G.browse.substring(0,7))`, `t.startsWith(G.browse.slice(0,-9))`);
            str = str.replaceAll(`t.substring(7).split("/").filter(Boolean)`, `t.split("/").filter(Boolean).slice(4)`);
            str = str.replaceAll(`t.startsWith(G.liveDev.substring(0,9))`, `t.startsWith(G.liveDev.slice(0,-9))`);
            str = str.replaceAll(`t.substring(9).split("/").filter(Boolean)`, `t.split("/").filter(Boolean).slice(4)`);
            str = str.replaceAll(`t.startsWith(G.live.substring(0,5))`, `t.startsWith(G.live.slice(0,-9))`);
            str = str.replaceAll(`t.substring(5).split("/").filter(Boolean)`, `t.split("/").filter(Boolean).slice(4)`);
        }
        if (details.url.includes("Login.c4b576ba.js")){
            str = str.replaceAll("/reset-password", `${getPathPrefix(pageURL)}/reset-password`);
            str = str.replaceAll("/create-account", `${getPathPrefix(pageURL)}/create-account`);
        }
        if (details.url.includes("CreateAccount.a5765411.js") || details.url.includes("ResetPassword.96c9ba35.js")){
            str = str.replaceAll("/login", `${getPathPrefix(pageURL)}/login`);
        }
        str = str.replaceAll(`"/browse`, `"${getPathPrefix(pageURL)}/browse`);
        str = str.replaceAll(`\`/browse`, `\`${getPathPrefix(pageURL)}/browse`);
        str = str.replaceAll(`"/live`, `"${getPathPrefix(pageURL)}/live`);
        str = str.replaceAll(`\`/live`, `\`${getPathPrefix(pageURL)}/live`);
        return str;
    }),
    { urls: ["*://ood.hpc.virginia.edu/rnode/*/*/assets/*", "*://ood1.hpc.virginia.edu/rnode/*/*/assets/*"] },
    ["blocking"]
);

chrome.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ["*://ood.hpc.virginia.edu/*", "*://ood1.hpc.virginia.edu/*"] },
    ["blocking"],
);
