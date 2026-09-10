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
  const context=[input.offer,input.goal,input.changeNotes,input.industry].map(clean).join(' ');
  if(!feelings.length){for(const word of ['bold','technical','warm','editorial','minimal','confident'])if(new RegExp('\\b'+word+'\\b','i').test(context))feelings.push(word);}
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
  const sector=/architect|interior|residen|construction|homes?\b/i.test(context)?'homes':/fitness|movement|pilates|wellness|health|dental|patient/i.test(context)?'wellness':/software|technology|automat|platform|equipment/i.test(context)?'technology':/hotel|hospitality|restaurant|dining|stay/i.test(context)?'hospitality':/shop|ecommerce|product|collection|skincare|cosmetic|beauty/i.test(context)?'shop':'service';
  const concepts={homes:{headline:'Good spaces. Better living.',summary:'A closer look at the places we shape, and the thinking behind them.',eyebrow:'SPACES WITH PURPOSE',support:'The work, the details, the way forward.'},wellness:{headline:'Make room for feeling better.',summary:'Find an approach that feels right for you. Take the first step at your own pace.',eyebrow:'A MORE PERSONAL APPROACH',support:'Explore the approach. Find your first step.'},technology:{headline:'Make the complex feel simple.',summary:'Understand what is possible, see how it works, and find your next move.',eyebrow:'CLARITY STARTS HERE',support:'The problem. The approach. The next step.'},hospitality:{headline:'Some places stay with you.',summary:'A closer look at the experience, before you arrive.',eyebrow:'YOUR NEXT GREAT DISCOVERY',support:'Discover the place. Plan your visit.'},shop:{headline:'Find your next favorite.',summary:'Explore the collection and the details that make each choice different.',eyebrow:'A CLOSER LOOK AT THE COLLECTION',support:'Explore the details. Choose with confidence.'},service:{headline:'A clearer way forward.',summary:'Get to know our work, our approach, and how we can help.',eyebrow:'INTRODUCING '+brand.toUpperCase(),support:'What we do. How we work. Let’s talk.'}};
  const concept=concepts[sector];
  const offer=compact(input.offer,160);
  const headline=offer&&offer.length<=85?offer.charAt(0).toUpperCase()+offer.slice(1).replace(/[.!?]+$/,'')+'.':concept.headline;
  const structures={
    homes:{layout:'gallery',title:'A closer look at our work.',nav:['Projects','Approach','Enquire'],sections:[['The spaces','Explore the projects and the ideas behind them.'],['The approach','Start with what matters to you, and where you want to go.']],closing:'Let’s talk about your space.'},
    wellness:{layout:'editorial',title:'Find your starting point.',nav:['Approach','Your first visit','Contact'],sections:[['Your first visit','A clear introduction to the experience, before you arrive.'],['Find your fit','Explore the approach and decide what feels right for you.']],closing:'Make time for your next step.'},
    technology:{layout:'product',title:'From the challenge to the next step.',nav:['Overview','How it works','Get in touch'],sections:[['Understand the approach','See what the solution does and where it fits.'],['See how it works','Follow the workflow before deciding what comes next.']],closing:'Let’s explore what’s possible.'},
    hospitality:{layout:'editorial',title:'Get a feel for the place.',nav:['Discover','The experience','Plan a visit'],sections:[['The experience','Explore the atmosphere, the details and what to expect.'],['Before you arrive','Find the practical details that help you plan your visit.']],closing:'Your next experience starts here.'},
    shop:{layout:'collection',title:'A closer look at the collection.',nav:['Collection','Our story','Contact'],sections:[['Explore the details','Get to know the materials, the choices and the story.'],['Find your favorite','Compare the collection and choose what fits your day.']],closing:'Make it part of your everyday.'},
    service:{layout:'product',title:'A clear path from here.',nav:['What we do','Our approach','Contact'],sections:[['What we do',offer||'Explore the offer and decide whether it fits what you need.'],['How we work','A conversation about your needs, followed by a clear next step.']],closing:'Let’s start with a conversation.'}
  };
  const cta=/book|schedule|reserve/i.test(goal)?'Find a time':/buy|shop|sell|order/i.test(goal)?'Explore the collection':/quote|estimate/i.test(goal)?'Request a quote':sector==='homes'?'Explore our work':'Let’s talk';
  return {
    brand,sector,...structures[sector],
    domain:existing?clean(input.website).replace(/^https?:\/\//i,'').replace(/\/$/,''):'A first look',
    theme:feelings.length?direction.theme:(['homes','wellness','hospitality','shop'].includes(sector)?'editorial':direction.theme),
    headline,
    summary:offer&&offer.length<=85?concept.summary:offer||concept.summary,
    cta,eyebrow:concept.eyebrow,support:concept.support,
    image:/architect|interior|coastal|residential/i.test(context)?'assets/arc-coast-process.webp':/pilates|fitness|movement|gym/i.test(context)?'assets/form-01.webp':/manufactur|industrial|equipment/i.test(context)?'assets/forge-systems.webp':/skincare|cosmetic|beauty/i.test(context)?'assets/botanical-product.webp':sector==='technology'?'assets/clarity-glass.webp':null,
    requested:goal,
    signals:existing
      ?[`Lead with the change you requested`,action,'Recompose the priority content for mobile']
      :[`Make ${brand} recognizable from the first screen`,action,`Use a ${direction.tone} voice across desktop and mobile`]
  };
}
