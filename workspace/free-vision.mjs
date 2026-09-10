const clean=value=>typeof value==='string'?value.trim():'';

export function brandFromWebsite(value){
  try{
    const host=new URL(/^[a-z][a-z\d+.-]*:/i.test(clean(value))?clean(value):`https://${clean(value)}`).hostname
      .replace(/^www\./,'').split('.')[0].replace(/[-_]+/g,' ');
    return host.replace(/\b\w/g,letter=>letter.toUpperCase())||'Your business';
  }catch{return 'Your business';}
}

const feelingProfiles={
  bold:{theme:'kinetic',tone:'direct',density:'high-impact'},
  technical:{theme:'system',tone:'precise',density:'evidence-led'},
  warm:{theme:'editorial',tone:'welcoming',density:'story-led'},
  editorial:{theme:'editorial',tone:'considered',density:'spacious'},
  minimal:{theme:'editorial',tone:'restrained',density:'focused'},
  confident:{theme:'system',tone:'assured',density:'structured'}
};

function compact(value,max=120){
  const result=clean(value).replace(/\s+/g,' ');
  return result.length>max?`${result.slice(0,max-1).trimEnd()}…`:result;
}

export function createFreeVision(input={}){
  const feelings=Array.isArray(input.feelings)?input.feelings.map(value=>clean(value).toLowerCase()):[];
  const key=['bold','technical','warm','editorial','minimal','confident'].find(name=>feelings.includes(name))
    ||(['Technology product','Home and construction'].includes(clean(input.industry))?'technical':'confident');
  const direction=feelingProfiles[key];
  const existing=input.projectMode==='existing';
  const brand=compact(clean(input.business)||brandFromWebsite(input.website),40);
  const requested=compact(existing?input.changeNotes:input.goal,150);
  const industry=clean(input.industry)||'your category';
  const goal=requested||'help the right visitor understand the offer and take the next step';
  const action=goal.match(/\b(book|schedule|reserve)\b/i)?'Make booking the clearest next step'
    :goal.match(/\b(quote|estimate|contact|call|lead)\b/i)?'Turn interest into a qualified conversation'
    :goal.match(/\b(buy|shop|sell|order)\b/i)?'Move buyers from value to purchase with less friction'
    :'Give every visitor one clear next step';
  const headline=existing?`${brand}, made clearer.`:`A ${direction.tone} new presence for ${brand}.`;
  return {
    brand,
    domain:existing?clean(input.website).replace(/^https?:\/\//i,'').replace(/\/$/,''):'A first look',
    theme:direction.theme,
    headline,
    summary:`A ${direction.density} composition for ${industry.toLowerCase()}, built around the outcome you described.`,
    requested:goal,
    signals:existing
      ?[`Lead with the change you requested`,action,'Recompose the priority content for mobile']
      :[`Make ${brand} recognizable from the first screen`,action,`Use a ${direction.tone} voice across desktop and mobile`]
  };
}
