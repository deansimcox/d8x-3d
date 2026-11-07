import type {Destination, SceneId} from '../content';

export type Vec3 = [number, number, number];
export type Pose = {position: Vec3; target: Vec3; fov: number};
// Horizontal radii grow from ~39 × 33 to ~59 × 49: 2.25× surface area.
// Landmark dimensions deliberately stay unchanged.
export const anchors: Record<SceneId, Vec3> = {
  office: [-29, 3.65, 24], city: [29, 3.65, 21],
  stadium: [39, 3.65, -3], nature: [-22, 3.65, -29], family: [3, 3.65, -44],
};
export const workshopAngle=.23;
export function workshopPoint(x:number,y:number,z:number):Vec3 {
  const [a,b,c]=anchors.office;
  return [a+x*Math.cos(workshopAngle)+z*Math.sin(workshopAngle),b+y,c-x*Math.sin(workshopAngle)+z*Math.cos(workshopAngle)];
}
export const workshopWindow=workshopPoint(.95,2.35,3.42);
export const workshopApproach=workshopPoint(.95,2.35,7.2);
export const poses: Record<Destination | 'welcome', Pose> = {
  welcome: {position: [92, 59, 170], target: [0, 1, 0], fov: 42},
  overview: {position: [69, 65, 116], target: [0, 0, -2], fov: 48},
  office: {position: workshopPoint(.95,2.53,2.73), target: workshopPoint(.33,1.86,-1.52), fov: 69},
  city: {position: [48, 22, 46], target: [27, 7, 21], fov: 43},
  stadium: {position: [63, 18, 12], target: [39, 4.4, -3.4], fov: 52},
  nature: {position: [-30, 11, -43], target: [-22.7, 4.5, -28.3], fov: 41},
  family: {position: [24, 18, -18], target: [3.6, 5.6, -40.3], fov: 44},
};

export const riverPoints = [[-8.4,-16.8],[-12,-21],[-18,-25],[-29,-25],[-40,-25.6],[-48,-26],[-55,-25],[-64,-24]];
export const random = (seed: number) => {const n = Math.sin(seed * 127.1 + 78.233) * 43758.5453; return n - Math.floor(n)};
export function distanceToSegment(x: number,z: number,a: Vec3,b: Vec3) {
  const dx=b[0]-a[0],dz=b[2]-a[2];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz || 1)));
  return Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz);
}
export function protectedView(x: number,z: number,margin=0) {
  return (Object.keys(anchors) as SceneId[]).some(id => {
    const radius=id==='stadium'?14.5:id==='city'?12:id==='nature'?7.5:9;
    return Math.hypot(x-anchors[id][0],z-anchors[id][2]) < radius+margin ||
      distanceToSegment(x,z,poses[id].position,anchors[id]) < 5+margin;
  });
}
export function nearRiver(x: number,z: number,margin=3) {
  return riverPoints.slice(1).some((b,i)=>distanceToSegment(x,z,[riverPoints[i][0],0,riverPoints[i][1]],[b[0],0,b[1]])<margin);
}
export function islandRadius(angle: number) {
  const familyRidge=.145*Math.exp(-((Math.sin((angle+1.47)/2)/.18)**2));
  return 1 + .07*Math.sin(3*angle+.6)+.045*Math.sin(7*angle+1.4)+.022*Math.sin(13*angle-.7)+familyRidge;
}
export function onIsland(x: number,z: number,margin=.92) {
  return Math.hypot(x/59,z/49)<islandRadius(Math.atan2(z/49,x/59))*margin;
}
export function terrainY(x:number,z:number) {
  const ring=Math.hypot(x/59,z/49)/islandRadius(Math.atan2(z/49,x/59));
  const edge=Math.min(1,Math.max(0,(1-ring)*8));
  const clearing=Math.min(...Object.values(anchors).map(a=>Math.hypot(x-a[0],z-a[2])-(a===anchors.stadium?5:0)));
  const meadow=Math.min(1,Math.max(0,(clearing-10)/7));
  if(nearRiver(x,z,3.5))return 3.55;
  const roll=.42+.36*Math.sin(x*.17+z*.08)*Math.cos(z*.21)+.15*Math.sin(x*.37-z*.3);
  const hills=1.85*Math.exp(-((x-15)**2+(z+20)**2)/180)+1.3*Math.exp(-((x+14)**2+(z-17)**2)/130);
  return 3.55+(roll+hills)*edge*meadow;
}
