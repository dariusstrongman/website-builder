export const stages=['Brief','Research','Design choices','Build','Review','Handoff'];
export const directions=[
 {id:'signal',name:'Signal',voice:'Clear & decisive',description:'A direct opening, structured services and a visible next step. Best when buyers need to understand the offer quickly.',tradeoff:'Less atmospheric; clarity leads.',headline:'Make your next move clear.'},
 {id:'current',name:'Current',voice:'Expressive & confident',description:'Large statements, contrasting sections and a lively rhythm. Best when personality is part of the reason to choose you.',tradeoff:'More expressive; requires concise copy.',headline:'Good thinking. Forward motion.'},
 {id:'ledger',name:'Ledger',voice:'Measured & editorial',description:'A reading-led layout, generous margins and considered typography. Best when buyers want to understand your judgment.',tradeoff:'Quieter pacing; needs thoughtful content.',headline:'Clarity for consequential decisions.'}
];
export const sampleBrief={business_name:'Northline Studio',buyer:'Founders of growing service businesses',offer:'Positioning, messaging and brand strategy',primary_action:'Request a consultation',domain:'',contact_email:'',reference_notes:'Confident, clear and human. Avoid stock business imagery and unsupported results.'};
export function fresh(sample=false){return {schema:1,sample,stage:0,brief:sample?{...sampleBrief}:{},selected:null,directionNote:'',versions:[],feedback:[],approved:false,receipt:null,events:[]};}
export function transition(state,event){
 const s=structuredClone(state);const log=message=>s.events.push({message,at:new Date().toISOString()});
 switch(event.type){
 case 'brief':if(s.stage!==0)throw Error('This brief is already confirmed.');s.brief=event.brief;s.stage=1;log('Brief confirmed');break;
 case 'receipt':if(s.sample||s.stage!==1||s.receipt)throw Error('Brief cannot be submitted in this state.');s.receipt=event.id;log('Brief recorded for scope review');break;
 case 'sample-next':
  if(!s.sample)throw Error('Real projects require a verified project update.');
  if(s.stage===1){s.stage=2;log('Sample research and three prepared concepts loaded');}
  else if(s.stage===3){const n=s.versions.length+1;s.versions.push({id:n,label:n===1?'Homepage proof':n===2?'Complete sample website':'Revised sample website',at:new Date().toISOString()});if(n>=2)s.stage=4;log('Sample preview '+n+' available');}
  else throw Error('There is no sample milestone to load yet.');break;
 case 'direction':if(s.stage!==2||!s.sample||!directions.some(d=>d.id===event.id))throw Error('A rendered design is required before selection.');s.selected=event.id;s.directionNote=event.note||'';s.stage=3;log('Direction confirmed: '+directions.find(d=>d.id===s.selected).name);break;
 case 'feedback':if(s.stage!==4||!event.note?.trim())throw Error('Review a completed preview before requesting changes.');s.feedback.push({section:event.section,note:event.note.trim(),version:s.versions.at(-1).id});s.approved=false;s.stage=3;log('Revision requested');break;
 case 'approve':if(s.stage!==4||!s.sample||!s.versions.length)throw Error('A completed review is required.');s.approved=true;s.stage=5;log('Sample launch approval recorded; nothing published');break;
 default:throw Error('Unknown project action.');
 }return s;
}
