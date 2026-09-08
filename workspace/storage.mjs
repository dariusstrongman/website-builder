import {fresh} from './model.mjs';
const valid=s=>s?.schema===1&&typeof s.sample==='boolean'&&Number.isInteger(s.stage)&&s.stage>=0&&s.stage<=5&&s.brief&&Array.isArray(s.events)&&Array.isArray(s.versions)&&Array.isArray(s.feedback);
export function loadProjects(storage,key){
 const parsed=JSON.parse(storage.getItem(key)||'null');
 if(parsed?.schema===2&&valid(parsed.real)&&valid(parsed.sample))return parsed;
 if(valid(parsed))return {schema:2,active:parsed.sample?'sample':'real',real:parsed.sample?fresh():parsed,sample:parsed.sample?parsed:fresh(true)};
 return {schema:2,active:'real',real:fresh(),sample:fresh(true)};
}
export function saveProject(storage,key,projects,state){projects[state.sample?'sample':'real']=state;projects.active=state.sample?'sample':'real';storage.setItem(key,JSON.stringify(projects));}
