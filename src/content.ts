export const sceneIds = ['office','city','stadium','nature','family'] as const;
export type SceneId = typeof sceneIds[number];
export type Destination = SceneId | 'overview';
export type ArchiveEntry = {title:string;summary:string;role?:string;period?:string;steps?:{title:string;text:string}[];tags?:string[];image?:{src:string;alt:string};links?:{label:string;href:string}[]};
export const archives:Record<'office'|'city',ArchiveEntry[]>={
  office:[{
    title:'The Village Wellness Centre',
    summary:'I took this website from the first designs in Figma to a live site.',
    steps:[
      {title:'Design',text:'I designed the site from scratch in Figma and created a design system for it.'},
      {title:'Development',text:'I built the site with Next.js and Tailwind CSS.'},
    ],
    tags:['Figma','Design systems','Next.js','Tailwind CSS'],
    links:[{label:'Visit The Village Wellness Centre',href:'https://thevillagewellnesscentre.com.au/'}],
  }],
  city:[
    {
      title:'HBF',
      role:'Front End Developer / React Developer',
      period:'December 2016 to present',
      summary:'I helped move HBF’s older jQuery and AngularJS applications to React and Next.js. I worked on rebuilding the member portal and the mobile app, shared components across products, and fixed accessibility issues I tested with a keyboard and screen readers.',
      tags:['React','Next.js','TypeScript','React Native','Expo','Accessibility'],
    },
    {
      title:'Precedent',
      role:'Front End Developer',
      period:'July 2012 to December 2016',
      summary:'I built responsive websites for government and enterprise clients, including Water Corporation WA and the National ANZAC Centre. I worked with designers and content authors, mostly in jQuery, Drupal and Sitecore.',
      tags:['jQuery','Drupal','Sitecore','Accessibility'],
    },
  ],
};
export const scenes: Record<SceneId, {index:string; label:string; title:string; eyebrow:string; subtitle:string; description:string; note:string; color:string}> = {
 office:{index:'01',label:'Projects',title:'My projects',eyebrow:'DESIGN AND CODE',subtitle:'Design and development',description:'I like designing websites and then building them myself. The Village Wellness Centre is one I took from Figma to a live site.',note:'See how I designed and built the site.',color:'#b6815b'},
 city:{index:'02',label:'Work',title:'Where I’ve worked',eyebrow:'FRONTEND DEVELOPMENT',subtitle:'Working on the web',description:'I’ve worked in frontend development since 2012, first at Precedent and then at HBF. Much of my work has been on websites and apps people use for everyday tasks.',note:'Read about my work at HBF and Precedent.',color:'#6d8c84'},
 stadium:{index:'03',label:'Football',title:'My football teams',eyebrow:'PERTH GLORY AND DERBY COUNTY',subtitle:'Perth Glory and Derby County',description:'I love football. Perth Glory and Derby County are my two teams, which explains the colours in the stands.',note:'The crowd is audible when ambient sound is on.',color:'#7e9274'},
 nature:{index:'04',label:'Outdoors',title:'Getting outside',eyebrow:'AWAY FROM MY DESK',subtitle:'Time outdoors',description:'I love being outdoors. I’m happy going for a walk or a run, and I always enjoy seeing animals along the way.',note:'Follow the river back to the mountain waterfall.',color:'#799b7a'},
 family:{index:'05',label:'Family',title:'My family',eyebrow:'LIFE AT HOME',subtitle:'Family',description:'I love my family. They’re a huge part of my life, and spending time with them is one of my favourite things to do.',note:'The garden and front yard are part of the scene.',color:'#c39570'}
};
