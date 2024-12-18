(()=>{"use strict";const e="undefined"!=typeof browser?browser:chrome;async function t(){const{apiToken:t}=await e.storage.sync.get(["apiToken"]);return t?async function(e){try{const t=Uint8Array.from(atob(e),(e=>e.charCodeAt(0))),r=t.slice(0,16),o=t.slice(16,28),s=t.slice(28),{key:a}=await async function(e=null){e||(e=new Uint8Array(16),crypto.getRandomValues(e));const t=new TextEncoder,r=await crypto.subtle.importKey("raw",t.encode("extension-secure-storage-key"),{name:"PBKDF2"},!1,["deriveBits","deriveKey"]);return{key:await crypto.subtle.deriveKey({name:"PBKDF2",salt:e,iterations:1e5,hash:"SHA-256"},r,{name:"AES-GCM",length:256},!0,["encrypt","decrypt"]),salt:e}}(r),n=await crypto.subtle.decrypt({name:"AES-GCM",iv:o},a,s);return(new TextDecoder).decode(n)}catch(e){throw console.error("Decryption error:",e),new Error("Failed to decrypt token")}}(t):""}function r(){if("undefined"!=typeof browser)try{return browser.runtime.getBrowserInfo?"firefox":"chrome"}catch{return"chrome"}return"chrome"}async function o(e){if("firefox"!==r())return chrome.sidePanel.open({tabId:e.id});try{await browser.sidebarAction.close(),await new Promise((e=>setTimeout(e,250))),await browser.sidebarAction.open()}catch(e){return console.error("Sidebar error:",e),browser.windows.create({url:"popup.html",type:"popup",width:400,height:600})}}const s=class{constructor(e){this.baseURL=e.baseURL,this.chat={completions:{create:this.createChatCompletion.bind(this)}}}async createChatCompletion(e){const r=await t();if(!r)throw new Error("API token not found");const o=await fetch(`${this.baseURL}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify({model:e.model,messages:e.messages,max_tokens:e.max_tokens})});if(!o.ok){const e=await o.json().catch((()=>({error:{message:"API request failed"}})));throw new Error(e.error?.message||"API request failed")}return o.json()}};chrome.runtime.onMessage.addListener(((t,r,o)=>{if("sendToAPI"===t.action)return async function(t){try{const r=await e.storage.sync.get(["apiUrl","apiToken","modelName","maxTokens"]);if(!r.apiUrl)throw new Error("API URL is not configured. Please open settings and configure the API URL.");if(!t.trim())throw new Error("Please enter some text to process.");const o=new s({apiKey:r.apiToken,baseURL:r.apiUrl}),a=await o.chat.completions.create({model:r.modelName||"meta-llama/Llama-2-7b-chat",messages:[{role:"user",content:t}],max_tokens:parseInt(r.maxTokens)||500});if(!a.choices?.[0]?.message)throw new Error("Invalid response from API. Please check your settings and try again.");return{success:!0,message:a.choices[0].message.content.trim()}}catch(e){return{success:!1,error:e.message}}}(t.content).then((e=>{o(e)})).catch((e=>{o({success:!1,error:e.message||"API request failed"})})),!0})),chrome.storage.onChanged.addListener(((e,t)=>{"sync"===t&&chrome.tabs.query({},(t=>{t.forEach((t=>{try{chrome.tabs.sendMessage(t.id,{action:"settingsUpdated",changes:e})}catch(e){console.debug("Could not send to tab:",t.id)}}))}))})),e.action.onClicked.addListener((async t=>{if(!t.url.startsWith("chrome://")&&!t.url.startsWith("about:"))try{await o(t)}catch(t){console.error("Failed to open panel:",t),e.windows.create({url:"popup.html",type:"popup",width:400,height:600})}})),"firefox"===r()?browser.browserAction.onClicked.addListener((async()=>{try{const e=await browser.windows.getCurrent();await browser.sidebarAction.close(),await new Promise((e=>setTimeout(e,250))),await browser.sidebarAction.open({windowId:e.id})}catch(e){console.error("Failed to toggle sidebar:",e),browser.windows.create({url:"popup.html",type:"popup",width:400,height:600})}})):chrome.action.onClicked.addListener((async e=>{e.url.startsWith("chrome://")||e.url.startsWith("about:")||await o(e)})),"firefox"===r()&&browser.runtime.onInstalled.addListener((()=>{browser.sidebarAction.open()}))})();