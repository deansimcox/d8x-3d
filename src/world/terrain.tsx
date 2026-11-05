import {useMemo} from 'react';
import * as THREE from 'three';
import {islandRadius,random,terrainY} from './layout';

function Surface() {
  const geometry=useMemo(()=>{
    const p=[],c=[],indices=[],sectors=128,rings=23;
    const grass=new THREE.Color('#a0af77'),shade=new THREE.Color('#789265');
    for(let j=0;j<=rings+2;j++)for(let i=0;i<=sectors;i++) {
      const a=(i%sectors)/sectors*Math.PI*2,warp=islandRadius(a),r=Math.min(1,j/rings);
      const lip=j<=rings?1:j===rings+1?.995:.955;
      const x=Math.cos(a)*59*warp*r*lip,z=Math.sin(a)*49*warp*r*lip;
      const y=j<=rings?terrainY(x,z):j===rings+1?1.98+.24*Math.sin(a*15):-.65+.36*Math.sin(a*11);
      p.push(x,y,z);
      const blend=.46+.22*Math.sin(x*.12+z*.04)+.15*Math.cos(z*.31-x*.18)+.12*random(j*sectors+i%sectors);
      const tint=j<=rings?shade.clone().lerp(grass,blend):new THREE.Color(j===rings+1?'#9d9b72':'#908c74');
      c.push(tint.r,tint.g,tint.b);
      if(j<rings+2&&i<sectors){const v=j*(sectors+1)+i,w=v+sectors+1;indices.push(v,w+1,w,v,v+1,w+1)}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setIndex(indices);g.computeVertexNormals();return g;
  },[]);
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial vertexColors roughness={1}/></mesh>;
}
function Underside() {
  const geometry=useMemo(()=>{
    const g=new THREE.CylinderGeometry(1,0,40,64,11,true),p=g.attributes.position,colors=[];
    for(let i=0;i<p.count;i++) {
      const a=Math.atan2(p.getZ(i),p.getX(i)),y=p.getY(i),layer=(y+20)/40;
      const warp=islandRadius(a)*(1+.10*(1-layer)**.4*Math.sin(a*17+Math.floor(y)*.7));
      const r=layer**.53;
      p.setXYZ(i,Math.cos(a)*56.4*r*warp+(1-layer)*3,y+.36*layer*Math.sin(a*11)+Math.sin(a*8)*layer*(1-layer)*4,Math.sin(a)*46.85*r*warp-(1-layer)*4);
      const c=new THREE.Color(['#797a67','#8a8872','#aca085','#656e62'][Math.floor(random(Math.floor(y)*7+i%65)*4)]);colors.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
  },[]);
  return <mesh geometry={geometry} position={[0,-20.4,0]}><meshStandardMaterial vertexColors flatShading roughness={1}/></mesh>;
}
function Peak({position,radius,height,seed}: {position:[number,number,number];radius:number;height:number;seed:number}) {
  const geometry=useMemo(()=>{
    const g=new THREE.ConeGeometry(radius,height,72,45,true),p=g.attributes.position,colors=[];
    const snowColor=new THREE.Color('#fffaf1');
    for(let i=0;i<p.count;i++) {
      const y=p.getY(i),a=Math.atan2(p.getZ(i),p.getX(i)),t=(y+height/2)/height;
      const ridge=Math.abs(Math.sin(a*4+seed+t*2.2));
      const warp=1+.15*Math.sin(a*3+seed)+.16*ridge+.055*Math.sin(a*15+t*19);
      const surface=(1-t)*Math.min(1,t*12);
      p.setXYZ(i,p.getX(i)*warp+Math.sin(t*2)*radius*.08,y+surface*(.95*Math.sin(a*8+t*24)+.43*Math.sin(a*19-t*54)),p.getZ(i)*warp);
      const snowLine=.64+.09*Math.sin(a*4+seed)+.026*Math.cos(a*13+t*12);
      const c=new THREE.Color(t<.22?'#727e66':'#7d857f');
      c.offsetHSL(0,0,.046*Math.sin(t*58+a*3)+.025*Math.cos(a*13-t*19));
      c.lerp(snowColor,THREE.MathUtils.smoothstep(t,snowLine-.017,snowLine+.017));colors.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
  },[radius,height,seed]);
  return <mesh geometry={geometry} position={position} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={1}/></mesh>;
}
export function Terrain(){return <group><Surface/><Underside/><Peak position={[0,17,-3]} radius={16} height={29} seed={1}/><Peak position={[-11,11,-3]} radius={12} height={17} seed={4}/><Peak position={[10,12,-8]} radius={11} height={19} seed={8}/><Peak position={[0,13,-14]} radius={9} height={20} seed={15}/></group>}
