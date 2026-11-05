import {CatmullRomCurve3,Vector3} from 'three';
import {distanceToSegment,type Vec3} from './layout';

export const bridgePosition:Vec3=[-26.6,3.6,-25.1];
export const bridgeRotation=-.12;
const bridgeEnd=(distance:number):Vec3=>[
  bridgePosition[0]+Math.sin(bridgeRotation)*distance,
  bridgePosition[1],
  bridgePosition[2]+Math.cos(bridgeRotation)*distance,
];

// The dirt trail connects both ends of the bridge. Its deck closes the loop.
const points:Vec3[]=[
  bridgeEnd(-2.62),bridgeEnd(-3.6),[-27,3.6,-31],[-22,3.6,-35],
  [-12,3.6,-33],[-2,3.6,-31],[7,3.6,-29.4],[16,3.6,-30.6],
  [25,3.6,-28],[36,3.6,-23],[49,3.6,-17],[54,3.6,-9],[53,3.6,8],
  [46,3.6,18],[43,3.6,27],[33,3.6,33],[21,3.6,35],[0,3.6,35],
  [-23,3.6,36],[-35,3.6,33],[-40,3.6,26],[-39,3.6,14],[-36,3.6,3],
  [-34,3.6,-9],[-31,3.6,-16],[-27.6,3.6,-20],bridgeEnd(3.6),bridgeEnd(2.62),
];
export const trailCurve=new CatmullRomCurve3(points.map(point=>new Vector3(...point)));
export const trailSegments=360;
export const trailWidth=(t:number)=>.78+.08*Math.sin(t*18);
const samples=trailCurve.getPoints(trailSegments).map(point=>point.toArray());
samples.push(samples[0]);

export function nearTrail(x:number,z:number,clearance=0){
  const limit=.89+clearance;
  for(let i=1;i<samples.length;i++){
    const a=samples[i-1],b=samples[i];
    if(x<Math.min(a[0],b[0])-limit||x>Math.max(a[0],b[0])+limit||
       z<Math.min(a[2],b[2])-limit||z>Math.max(a[2],b[2])+limit)continue;
    if(distanceToSegment(x,z,a,b)<limit)return true;
  }
  return false;
}
