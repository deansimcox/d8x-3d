import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useReducedMotion} from './motion';

const haloVertex = `
  varying vec2 point;
  void main() {
    point = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const haloFragment = `
  uniform vec3 tint;
  uniform float radius;
  uniform float strength;
  varying vec2 point;
  void main() {
    float falloff = 1.0 - smoothstep(0.22, 1.7, abs(length(point) - radius));
    gl_FragColor = vec4(tint, falloff * falloff * strength);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function FlightRing({center,rotation,radius,active,complete,delivery=false}:{
  center:THREE.Vector3;rotation:number;radius:number;active:boolean;complete:boolean;delivery?:boolean;
}){
  const reduced=useReducedMotion();
  const ring=useRef<THREE.Group>(null);
  const material=useRef<THREE.MeshBasicMaterial>(null);
  const sweep=useRef(0);
  const {geometry,waiting,highlight,cleared,uniforms}=useMemo(()=>{
    const geometry=new THREE.TorusGeometry(radius,.43,16,96);
    const positions=geometry.attributes.position;
    const colors=[];
    for(let i=0;i<positions.count;i++){
      const angle=Math.atan2(positions.getY(i),positions.getX(i));
      const gloss=.69+.31*(.5+.5*Math.cos(angle))**3;
      colors.push(gloss,gloss,gloss);
    }
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    const waiting=new THREE.Color('#bda474');
    const highlight=new THREE.Color(delivery?'#adf8aa':'#ffda91');
    const cleared=new THREE.Color(delivery?'#99d7ff':'#77ded5');
    const uniforms={radius:{value:radius},tint:{value:highlight.clone()},strength:{value:0}};
    return {geometry,waiting,highlight,cleared,uniforms};
  },[delivery,radius]);

  const initialColor=useRef(active?highlight:waiting).current;

  useFrame(({clock},delta)=>{
    if(!ring.current||!material.current)return;
    const time=reduced?0:clock.elapsedTime;
    const dt=Math.min(delta,.08);
    const target=complete?cleared:active?highlight:waiting;
    material.current.color.lerp(target,reduced?1:1-Math.exp(-dt*7));
    sweep.current=complete?Math.min(1,sweep.current+dt*1.7):0;
    const burst=reduced?0:Math.sin(sweep.current*Math.PI);
    ring.current.rotation.z=time*.48;
    ring.current.scale.setScalar(1+burst*.08);
    uniforms.tint.value.copy(material.current.color);
    uniforms.strength.value=complete?.12+burst*.30:active?.42+Math.sin(time*2)*.08:.12;
  });

  return <group position={center} rotation={[0,rotation,0]}>
    <group ref={ring}>
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={material} vertexColors color={initialColor} fog={false}/>
      </mesh>
      <mesh>
        <ringGeometry args={[radius-1.7,radius+1.7,96]}/>
        <shaderMaterial uniforms={uniforms} vertexShader={haloVertex} fragmentShader={haloFragment}
          transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
      </mesh>
    </group>
  </group>;
}

export type Drop={origin:THREE.Vector3;direction:THREE.Vector3};

export function ParcelDrop({drop}: {drop:Drop}){
  const parcel=useRef<THREE.Group>(null);
  const chute=useRef<THREE.Group>(null);
  const time=useRef(0);
  const cords=useMemo(()=>{
    const points=[];
    for(let i=0;i<6;i++){
      const angle=i*Math.PI/3;
      points.push(Math.cos(angle)*.24,.48,Math.sin(angle)*.24,Math.cos(angle)*1.4,2.2,Math.sin(angle)*1.4);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    return geometry;
  },[]);

  useFrame((_,delta)=>{
    if(!parcel.current||!chute.current||time.current>=4.6)return;
    time.current+=Math.min(delta,.08);
    const t=time.current;
    const opening=THREE.MathUtils.smoothstep(t,.12,.53);
    parcel.current.visible=t<4.6;
    parcel.current.position.copy(drop.origin).addScaledVector(drop.direction,9*(1-Math.exp(-t*1.3)));
    parcel.current.position.y-=2.3*t;
    parcel.current.rotation.set(.09*Math.sin(t*4),t*.55,.11*Math.cos(t*3));
    parcel.current.scale.setScalar(1-THREE.MathUtils.smoothstep(t,4,4.6));
    chute.current.scale.setScalar(Math.max(.01,opening));
  });

  return <group ref={parcel} position={drop.origin}>
    <mesh><boxGeometry args={[.9,.69,.76]}/><meshStandardMaterial color="#b97542" roughness={.86}/></mesh>
    <mesh><boxGeometry args={[.17,.702,.772]}/><meshStandardMaterial color="#f4d19c"/></mesh>
    <group ref={chute} scale={.01}>
      <lineSegments geometry={cords}><lineBasicMaterial color="#f8e7c4"/></lineSegments>
      {Array.from({length:6},(_,i)=><mesh key={i} position={[0,2.2,0]} scale={[1,.64,1]}>
        <sphereGeometry args={[1.4,8,8,i*Math.PI/3,Math.PI/3,0,Math.PI/2]}/>
        <meshStandardMaterial color={i%2?'#f4dfb9':'#bc5747'} side={THREE.DoubleSide} roughness={.8}/>
      </mesh>)}
    </group>
  </group>;
}
