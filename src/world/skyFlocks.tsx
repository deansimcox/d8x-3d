import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import type {Group} from 'three';
import {useReducedMotion} from './motion';

const flocks = [
  {count: 3, phase: 2.9, speed: .19, radius: 39, height: 30, z: -5, body: '#60524b', wing: '#e3c9a5'},
  {count: 5, phase: 4.1, speed: -.13, radius: 57, height: 34, z: -17, body: '#424b57', wing: '#a7bbc4'},
  {count: 2, phase: .16, speed: .22, radius: 45, height: 32, z: 11, body: '#81513c', wing: '#d68f69'},
];

function Flock({count, phase, speed, radius, height, z, body, wing}: typeof flocks[number]){
  const birds = useRef<Group>(null);
  const reduced = useReducedMotion();
  useFrame(({clock})=>{
    const time = reduced ? 0 : clock.elapsedTime;
    birds.current?.children.forEach((bird, index)=>{
      const row = Math.ceil(index / 2);
      const lane = index === 0 ? 0 : (index % 2 ? 1 : -1) * row;
      const angle = phase + time * speed - Math.sign(speed) * row * .078;
      const distance = radius + lane * 1.65;
      bird.position.set(Math.cos(angle) * distance, height + Math.sin(angle * 2) * 2.4 + lane * .45,
        z + Math.sin(angle) * distance * .8);
      bird.rotation.y = Math.atan2(-Math.sin(angle) * speed, Math.cos(angle) * speed * .8);
      bird.rotation.z = Math.sign(speed) * .12;
      const flap = reduced ? .16 : .19 + Math.sin(time * 7 + index * 1.3 + phase) * .74;
      bird.children[1].rotation.z = -flap;
      bird.children[2].rotation.z = flap;
    });
  });

  return <group ref={birds}>{Array.from({length:count},(_,index)=><group key={index} scale={1.18 - index % 3 * .07}>
    <mesh scale={[.16,.14,.38]}><sphereGeometry args={[1,7,5]}/><meshStandardMaterial color={body} flatShading/></mesh>
    {[-1,1].map(side=><group key={side} position={[side*.11,.035,0]}>
      <mesh position={[side*.32,0,-.085]} rotation={[0,side*.27,0]} scale={[.39,.045,.16]}>
        <sphereGeometry args={[1,6,4]}/><meshStandardMaterial color={index % 2 ? body : wing} flatShading/>
      </mesh>
    </group>)}
  </group>)}</group>;
}

export function SkyFlocks(){
  return <>{flocks.map(flock=><Flock key={flock.phase} {...flock}/>)}</>;
}
