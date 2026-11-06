export const sceneIds = ['office','city','stadium','family','nature'] as const;
export type SceneId = typeof sceneIds[number];
export type Destination = SceneId | 'overview';
export type ArchiveEntry = {title:string;summary:string;role?:string;period?:string;steps?:{title:string;text:string}[];tags?:string[];image?:{src:string;alt:string;width:number;height:number};links?:{label:string;href:string}[]};
export const archives:Record<'office'|'city',ArchiveEntry[]>={
  office:[{
    title:'The Village Wellness Centre',
    summary:'I designed and built the website for The Village Wellness Centre, a midwifery and women’s wellness centre. Visitors can browse the services on offer or go straight to booking a consultation from the homepage.',
    image:{src:'projects/village-wellness-centre.webp',alt:'The Village Wellness Centre homepage with consultation and service links',width:1000,height:633},
    steps:[
      {title:'Design',text:'I started from scratch in Figma, designing the pages and building a design system to keep the layouts and components consistent.'},
      {title:'Development and CMS',text:'I built the site with Next.js and Tailwind CSS and integrated Payload CMS so the centre can update its content without editing code.'},
    ],
    tags:['Figma','Design systems','Next.js','Tailwind CSS','Payload CMS'],
    links:[{label:'Visit The Village Wellness Centre',href:'https://thevillagewellnesscentre.com.au/'}],
  },{
    title:'d8x.dev',
    summary:'This portfolio started as a rough 3D prototype. I built it into a floating island with React and Three.js, with a workshop for my projects and a few places that reflect what I care about away from the desk.',
    image:{src:'projects/d8x-island.webp',alt:'The d8x.dev island overview with its mountain, trail and destination markers',width:1000,height:625},
    steps:[
      {title:'Framing the scenes',text:'I set a camera position for each destination and adjusted the framing on smaller screens to make room for the story panel. On the way into the workshop, the camera slips through an open window.'},
      {title:'Access to the content',text:'Project details and work history are rendered in HTML and can open directly from a link. The camera skips its journeys when reduced motion is enabled. If WebGL is unavailable, the same content is available in the illustrated guide.'},
    ],
    tags:['React','TypeScript','Three.js','React Three Fiber','Vite'],
    links:[{label:'View the source on GitHub',href:'https://github.com/deansimcox/d8x-3d'}],
  }],
  city:[
    {
      title:'HBF',
      role:'Front End Developer / React Developer',
      period:'December 2016 to present',
      summary:'I helped modernise HBF’s older jQuery and AngularJS applications with React and Next.js. My work has included rebuilding the member portal and mobile app, developing components used across products, and fixing accessibility issues with the help of keyboard and screen reader testing.',
      tags:['React','Next.js','TypeScript','React Native','Expo','Accessibility'],
    },
    {
      title:'Precedent',
      role:'Front End Developer',
      period:'July 2012 to December 2016',
      summary:'At Precedent I built responsive websites for government and enterprise clients, including Water Corporation WA and the National ANZAC Centre. I worked alongside designers and content authors, primarily with jQuery, Drupal and Sitecore.',
      tags:['jQuery','Drupal','Sitecore','Accessibility'],
    },
  ],
};
export const scenes: Record<SceneId, {index:string; label:string; title:string; eyebrow:string; subtitle:string; description:string; note:string; color:string}> = {
 office:{index:'01',label:'Projects',title:'My projects',eyebrow:'DESIGN AND CODE',subtitle:'Design and development',description:'I enjoy working on both sides of a website, from the first layouts in Figma to the code that makes them work. The Village Wellness Centre is a good example of that process.',note:'See how I designed and built the site.',color:'#b6815b'},
 city:{index:'02',label:'Work',title:'Where I’ve worked',eyebrow:'FRONTEND DEVELOPMENT',subtitle:'Working on the web',description:'I started out building responsive websites at Precedent in 2012. At HBF, that work grew to include the member portal and mobile app, with a focus on making both easier to use.',note:'Read about my work at HBF and Precedent.',color:'#6d8c84'},
 stadium:{index:'03',label:'Football',title:'My football teams',eyebrow:'PERTH GLORY AND DERBY COUNTY',subtitle:'Perth Glory and Derby County',description:'I love football, and Perth Glory and Derby County are the two teams I follow. I wanted this little ground to feel like an evening match, with the floodlights on and the crowd in full voice.',note:'The crowd is audible when ambient sound is on.',color:'#7e9274'},
 family:{index:'04',label:'Family',title:'My family',eyebrow:'LIFE AT HOME',subtitle:'Family',description:'Time with my family matters a lot to me. I wanted this corner of the island to feel like a family home, with toys left out in the yard and chickens wandering around the veggie patch.',note:'The garden and front yard are part of the scene.',color:'#c39570'},
 nature:{index:'05',label:'Outdoors',title:'Getting outside',eyebrow:'AWAY FROM MY DESK',subtitle:'Time outdoors',description:'I’m happiest outdoors when I can get out for a walk or a run. Spotting wildlife along the way is often my favourite part, which is why there’s a little more to find by the river.',note:'Follow the river back to the mountain waterfall.',color:'#799b7a'}
};
