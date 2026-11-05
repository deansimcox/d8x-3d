import * as THREE from 'three';

export const windClock={value:0};
export const windEnabled={value:0};

// Bend the tops in the vertex shader, keeping roots and instance matrices fixed.
export function windMaterial(source:THREE.Material,height:number,strength:number,base=0){
  const material=source.clone();
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,{windClock,windEnabled});
    shader.vertexShader='uniform float windClock, windEnabled;\n'+shader.vertexShader.replace('#include <begin_vertex>',`
      #include <begin_vertex>
      vec2 root=instanceMatrix[3].xz;
      float tip=clamp((position.y-(${base.toFixed(4)}))/${height.toFixed(4)},0.,1.);
      float wave=sin(windClock*1.25+dot(root,vec2(.21,.15)))+.34*sin(windClock*2.45+root.y*.29);
      transformed.xz+=vec2(1.,.44)*tip*tip*wave*${strength.toFixed(4)}*windEnabled;
    `);
  };
  material.customProgramCacheKey=()=>`wind-${height}-${strength}-${base}`;
  return material;
}
