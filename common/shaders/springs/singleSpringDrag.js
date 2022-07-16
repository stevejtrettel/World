
const singleSpringDrag = `
    vec4 singleSpringDrag( sampler2D velTex, ivec2 ij, ivec2 uv ){
      
        vec4 totalDrag=vec4(0.);
        
        //get endpoints of the spring,
        vec4 pij = fetch( velTex, ij );
        vec4 puv = fetch( velTex, uv );
        
        //difference in endpoint velocities
        //based at pij?
        vec4 springVel = puv - pij;
       
        
        //drag is proportional to this velocity:
        totalDrag += springDragConst * springVel;
        
        return totalDrag;
    }
`;



export {
    singleSpringDrag
};
