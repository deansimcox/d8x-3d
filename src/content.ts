export const sceneIds = ['office','city','stadium','nature','family'] as const;
export type SceneId = typeof sceneIds[number];
export type Destination = SceneId | 'overview';
export type ArchiveEntry = {title:string;summary:string;period?:string;tags?:string[];image?:{src:string;alt:string};links?:{label:string;href:string}[]};
// Fill these with real portfolio content when it is available. An empty archive
// intentionally renders a short coming-soon note instead of fictional entries.
export const archives:Record<'office'|'city',ArchiveEntry[]>={office:[],city:[]};
export const scenes: Record<SceneId, {index:string; title:string; eyebrow:string; subtitle:string; description:string; note:string; color:string}> = {
 office:{index:'01',title:'The Workshop',eyebrow:'THINGS I MAKE',subtitle:'Where the ideas take shape.',description:'A little corner of the world for curious ideas, thoughtful interfaces, and projects made with care.',note:'Project case studies are coming soon. This space is ready for real work, screenshots and links.',color:'#b6815b'},
 city:{index:'02',title:'The Little City',eyebrow:'THE JOURNEY SO FAR',subtitle:'Every building tells a story.',description:'A miniature skyline for the places, people, and experiences that have shaped my work along the way.',note:'Career milestones will appear here when the real details are added.',color:'#6d8c84'},
 stadium:{index:'03',title:'Matchday',eyebrow:'AFTER THE FINAL WHISTLE',subtitle:'Some things are bigger than work.',description:'Floodlights, a freshly marked pitch, and that unmistakable feeling of matchday. Football has its own place in my world.',note:'Take a moment and enjoy the view from the stands.',color:'#7e9274'},
 nature:{index:'04',title:'A Little Breathing Room',eyebrow:'THE SLOWER MOMENTS',subtitle:'Good things happen outdoors.',description:'A quiet patch of grass, a picnic basket by the river, and nowhere in particular to be.',note:'Listen to the water, watch the trees, and stay a while.',color:'#799b7a'},
 family:{index:'05',title:'Home, Sweet Home',eyebrow:'WHAT MATTERS MOST',subtitle:'The heart of this little world.',description:'A warm house at the end of the path. A reminder that the best part of any journey is having somewhere to call home.',note:'The house tells the story. The people who make it home stay private.',color:'#c39570'}
};
