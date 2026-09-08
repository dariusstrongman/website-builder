export const projectEndpoint='https://stromation-production.up.railway.app/website-project';
const key='website-builder-live-session-v1';
const valid=value=>value&&typeof value.token==='string'&&value.token.length>=40&&value.token.length<12000&&value.endpoint===projectEndpoint;
export function saveSession(result,storage=localStorage){
 const value={token:result.project_token,endpoint:projectEndpoint};
 if(!valid(value))return null;
 try{storage.setItem(key,JSON.stringify(value));}catch{/* The current tab still works without storage. */}
 return value;
}
export function loadSession(storage=localStorage){
 try{const value=JSON.parse(storage.getItem(key)||'null');return valid(value)?value:null;}catch{return null;}
}
export function clearSession(storage=localStorage){try{storage.removeItem(key);}catch{}}
export function consumeSessionFragment(location=window.location,history=window.history,storage=localStorage){
 if(!location.hash.startsWith('#project='))return null;
 let token;try{token=decodeURIComponent(location.hash.slice(9));}catch{return null;}
 // Remove the bearer from the address bar before loading other resources.
 history.replaceState(null,'',location.pathname+location.search);
 return saveSession({project_token:token},storage);
}
