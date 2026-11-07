import {useMemo} from 'react';
import {BufferGeometry,Float32BufferAttribute} from 'three';
import {Block} from './props';

export function FootballGoal() {
  const net=useMemo(()=>{
    const lines=[];
    for(let i=0;i<=18;i++) {const z=(i-9)*.154;lines.push(0,1.7,z,1.15,.02,z)}
    for(let j=1;j<=12;j++){
      const t=j/12,x=t*1.15,y=(1-t)*1.7;
      lines.push(x,y,-1.386,x,y,1.386);
      for(const z of [-1.386,1.386])lines.push(0,y,z,x,y,z,x,0,z,x,y,z);
    }
    const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(lines,3));return g;
  },[]);
  return <group>
    {[-1.4,1.4].map(z=><Block key={z} position={[0,.85,z]} size={[.1,1.7,.1]} color="#f3ecd1"/>)}
    <Block position={[0,1.72,0]} size={[.1,.1,2.9]} color="#f3ecd1"/>
    <lineSegments geometry={net}><lineBasicMaterial color="#e9ead5" transparent opacity={.82}/></lineSegments>
  </group>;
}
