

const singleSpringForce =    `
    vec4 singleSpringForce( sampler2D posTex, ivec2 ij, ivec2 uv,  float rest ){
        vec4 totalForce=vec4(0.);
        
        //get endpoints of the spring,
        vec4 pij = fetch( posTex, ij );
        vec4 puv = fetch( posTex, uv );
        
        //get vector along springs length
        vec4 springVec = puv - pij;
        float springLength = length( springVec );
        vec4 springDir = normalize( springVec );
        
        //force is proportional to difference from rest length:
       // if(springLength > rest){
            totalForce = (springLength - rest) * springDir;
       // }
    
        return totalForce;
    }
`;


export {
    singleSpringForce
};
