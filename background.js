function redirect(requestDetails) {
    if(requestDetails.originUrl.includes(".hpc.virginia.edu/rnode") && !requestDetails.url.includes(".hpc.virginia.edu/rnode")){
        const urlSplit = requestDetails.originUrl.split("/");
        const nodeHost = urlSplit[4]+"/"+urlSplit[5];
        const newURL = requestDetails.url.replace(".hpc.virginia.edu", ".hpc.virginia.edu/rnode/" + nodeHost);
        console.log(`redirect to: ${newURL}`);
        return {redirectUrl: newURL};
    }
}

function replaceInResponse(details, callback) {
    console.log("replacing");
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    filter.ondata = (event) => {
        let str = decoder.decode(event.data, { stream: true });
        str = callback(str);
        filter.write(encoder.encode(str));
        filter.disconnect();
    };

    return {};
}

browser.webRequest.onBeforeRequest.addListener(
    (details)=>replaceInResponse(details, (str)=>{
        const urlSplit = details.documentUrl.split("/");
        const nodeHost = urlSplit[4]+"/"+urlSplit[5];
        return str.replaceAll(":\"/", `:"/rnode/${nodeHost}/`);
    }),
    { urls: ["*://*.hpc.virginia.edu/rnode/*/*/assets/index.146c2037.js"] },
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    (details)=>replaceInResponse(details, (str)=>{
        const urlSplit = details.documentUrl.split("/");
        const nodeHost = urlSplit[4]+"/"+urlSplit[5];
        return str.replaceAll("/websocket", `/rnode/${nodeHost}/websocket`);
    }),
    { urls: ["*://*.hpc.virginia.edu/rnode/*/*/assets/router.1b465492.js"] },
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    (details)=>replaceInResponse(details, (str)=>{
        console.log("replacing assets");
        console.log(details.url);
        const urlSplit = details.url.split("/");
        const nodeHost = urlSplit[4]+"/"+urlSplit[5];
        str = str.replaceAll(`src="/assets/index.146c2037.js"`, `src="/rnode/${nodeHost}/assets/index.146c2037.js"`);
        str = str.replaceAll(`<head>`, `<head><base href="https://${urlSplit[3]}/rnode/${nodeHost}/">`);
        return str;
    }),
    { urls: ["*://*.hpc.virginia.edu/rnode/*/*"]},
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ["*://*.hpc.virginia.edu/*"] },
    ["blocking"],
);

//TODO: check page info before replacing
//TODO: fix some links that are relative to the wrong path (sidebar links)
