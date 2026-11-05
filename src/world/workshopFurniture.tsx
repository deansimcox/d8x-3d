import {useEffect,useMemo} from 'react';
import {CanvasTexture,SRGBColorSpace} from 'three';
import {RoundedBox} from '@react-three/drei';
import type {Vec3} from './layout';

const walnut='#926045',edge='#593c31',metal='#303936',brass='#b58c54';
function Piece({at,size,color,r=.025,map}: {at:Vec3;size:Vec3;color:string;r?:number;map?:CanvasTexture}){
  return <RoundedBox position={at} args={size} radius={r} smoothness={2} receiveShadow castShadow>
    <meshStandardMaterial color={color} roughness={.75} map={map}/>
  </RoundedBox>;
}
function Tube({at,radius,height,color,rotation}: {at:Vec3;radius:number;height:number;color:string;rotation?:Vec3}){
  return <mesh position={at} rotation={rotation} castShadow receiveShadow>
    <cylinderGeometry args={[radius,radius,height,16]}/><meshStandardMaterial color={color} roughness={.62}/>
  </mesh>;
}

export function WritingDesk(){
  const grain=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#f1d5b9';ctx.fillRect(0,0,256,128);
    for(let i=0;i<155;i++){
      const y=(i*73)%128;
      ctx.strokeStyle=i%4===0?'#865d4629':'#a47c611b';
      ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(76,y+Math.sin(i)*7,150,y+Math.cos(i*2)*8,256,y+Math.sin(i*.23)*3);ctx.stroke();
    }
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.anisotropy=4;return texture;
  },[]);
  useEffect(()=>()=>grain.dispose(),[grain]);
  return <group position={[.95,.43,-1.13]}>
    <Piece at={[0,1.58,0]} size={[3.2,.14,1.55]} color="#bb8764" r={.055} map={grain}/>
    {[-1.36,1.36].map(x=><group key={x}>
      {[-.61,.61].map(z=><group key={z}>
        <Piece at={[x,.8,z]} size={[.095,1.49,.095]} color={metal}/>
        <Piece at={[x,.033,z]} size={[.125,.066,.12]} color={edge}/>
      </group>)}
      <Piece at={[x,.23,0]} size={[.07,.07,1.22]} color={metal}/>
    </group>)}
    <Piece at={[0,1.38,-.6]} size={[2.78,.23,.085]} color={edge}/>
    <Piece at={[-.84,1.36,.2]} size={[.82,.28,.99]} color={edge}/>
    <Piece at={[-.84,1.36,.714]} size={[.78,.23,.065]} color={walnut} map={grain}/>
    <Tube at={[-.84,1.36,.77]} radius={.023} height={.24} color={brass} rotation={[0,0,Math.PI/2]}/>
  </group>;
}

export function DeskChair(){
  return <group position={[1.93,.43,.24]} rotation={[0,-2.45,0]}>
    {[0,1,2,3,4].map(i=><group key={i} rotation={[0,i*Math.PI*2/5,0]}>
      <Piece at={[0,.17,.29]} size={[.085,.07,.55]} color={metal}/>
      <Tube at={[0,.077,.53]} radius={.077} height={.095} rotation={[0,0,Math.PI/2]} color="#262a27"/>
    </group>)}
    <Tube at={[0,.4,0]} radius={.07} height={.52} color={metal}/>
    <Piece at={[0,.66,0]} size={[.79,.11,.71]} color={edge} r={.05}/>
    <Piece at={[0,.758,.015]} size={[.78,.14,.69]} color="#758772" r={.066}/>
    <group position={[0,1.14,-.34]} rotation={[.15,0,0]}>
      <Piece at={[0,.06,-.015]} size={[.76,.76,.13]} color={edge} r={.062}/>
      <Piece at={[0,.06,.073]} size={[.68,.69,.13]} color="#758772" r={.064}/>
      <Piece at={[0,-.26,.087]} size={[.60,.083,.13]} color="#667b66" r={.04}/>
    </group>
    {[-.415,.415].map(x=><group key={x}>
      <Piece at={[x,.92,.04]} size={[.06,.35,.075]} color={metal}/>
      <Piece at={[x,1.10,.055]} size={[.125,.068,.43]} color="#495b4d"/>
    </group>)}
  </group>;
}
