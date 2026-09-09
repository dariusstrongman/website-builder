const clean=value=>typeof value==='string'?value.trim():'';

export function brandFromWebsite(value){
  try{
    const host=new URL(/^[a-z][a-z\d+.-]*:/i.test(clean(value))?clean(value):`https://${clean(value)}`).hostname
      .replace(/^www\./,'').split('.')[0].replace(/[-_]+/g,' ');
    return host.replace(/\b\w/g,letter=>letter.toUpperCase())||'Your business';
  }catch{return 'Your business';}
}

const directions={
  bold:{theme:'kinetic',headline:'Make your value impossible to miss.',summary:'A confident opening, decisive type and one obvious next step.'},
  technical:{theme:'system',headline:'Complex work. Made clear.',summary:'A precise structure that turns expertise into evidence.'},
  warm:{theme:'editorial',headline:'A clearer welcome to what you do.',summary:'Human pacing, warmer detail and a more inviting path forward.'},
  editorial:{theme:'editorial',headline:'A sharper point of view.',summary:'Measured typography and intentional space give the work authority.'},
  minimal:{theme:'editorial',headline:'Less noise. More meaning.',summary:'A restrained composition keeps attention on the offer.'},
  confident:{theme:'system',headline:'Built to make the next move clear.',summary:'Stronger hierarchy and direct calls to action create confidence.'}
};

function compact(value,max=120){
  const result=clean(value).replace(/\s+/g,' ');
  return result.length>max?`${result.slice(0,max-1).trimEnd()}…`:result;
}

export function createFreeVision(input={}){
  const feelings=Array.isArray(input.feelings)?input.feelings.map(value=>clean(value).toLowerCase()):[];
  const key=['bold','technical','warm','editorial','minimal','confident'].find(name=>feelings.includes(name))
    ||(['Technology product','Home and construction'].includes(clean(input.industry))?'technical':'confident');
  const direction=directions[key];
  const existing=input.projectMode==='existing';
  const brand=compact(clean(input.business)||brandFromWebsite(input.website),40);
  const requested=compact(existing?input.changeNotes:input.goal,150);
  return {
    brand,
    domain:existing?clean(input.website).replace(/^https?:\/\//i,'').replace(/\/$/,''):'A first look',
    theme:direction.theme,
    headline:direction.headline,
    summary:direction.summary,
    requested:requested||'Create a clearer, more confident website experience.',
    signals:existing
      ?['A stronger opening message','A clearer visitor path','A composition designed for mobile']
      :['A distinct first impression','A clear explanation of the offer','One focused visitor action']
  };
}
