const text=value=>typeof value==='string'?value.trim():'';
export function normalizeWebsiteURL(value){
 const raw=text(value);if(!raw)throw Error('Add the website you want to improve.');
 let parsed;try{parsed=new URL(/^[a-z][a-z\d+.-]*:/i.test(raw)?raw:`https://${raw}`);}catch{throw Error('Enter a valid website URL, such as https://yourbusiness.com.');}
 if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.port||!parsed.hostname.includes('.')||!/[a-z]/i.test(parsed.hostname)||!parsed.hostname.split('.').every(label=>/^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label))||/[\s]/.test(raw)||/\.(?:localhost|local|invalid|test)$/i.test(parsed.hostname))throw Error('Use a public HTTP or HTTPS website URL without login details or a custom port.');
 if(parsed.href.length>1000)throw Error('Keep the current website URL under 1,000 characters.');
 return {url:parsed.href,domain:parsed.hostname.toLowerCase()};
}
export function validateBrief(brief){
 const result={...brief,project_mode:brief.project_mode==='existing'?'existing':'new'};
 for(const name of ['business_name','buyer','offer','primary_action','reference_notes']){
  result[name]=text(brief[name]);if(!result[name])throw Error('Add your business, offer, audience, visitor action and design preferences.');
 }
 if(result.project_mode==='existing'){
  const current=normalizeWebsiteURL(brief.current_website_url);
  result.current_website_url=current.url;result.domain=current.domain;
  result.keep_notes=text(brief.keep_notes);result.change_notes=text(brief.change_notes);
 }
 encodedReferenceNotes(result);return result;
}
export function encodedReferenceNotes(brief){
 let notes=text(brief.reference_notes);
 if(brief.project_mode==='existing'){
  const current=normalizeWebsiteURL(brief.current_website_url);
  notes=`Project: improve an existing website\nCurrent website: ${current.url}\nKeep: ${text(brief.keep_notes)||'Not specified — confirm during scope review.'}\nChange: ${text(brief.change_notes)||'Not specified — confirm during scope review.'}\nDesign preferences: ${notes}`;
 }
 if(notes.length>4000)throw Error('Your website URL, keep/change notes and design preferences together exceed 4,000 characters. Please shorten them; nothing has been sent.');
 return notes;
}
export function briefPayload(brief,{source='website-builder/project.html'}={}){
 const b=validateBrief(brief),payload={};
 for(const name of ['business_name','buyer','offer','primary_action','domain','contact_email'])payload[name]=text(b[name]);
 payload.reference_notes=encodedReferenceNotes(b);
 return {...payload,mode:'paid',source};
}
