//
// const springForce =    `
//     vec4 springForce( sampler2D posTex, ivec2 ij, ivec2 uv,  Spring spring ){
//         vec4 totalForce=vec4(0.);
//
//         //get endpoints of the spring,
//         vec4 pij = fetch( posTex, ij );
//         vec4 puv = fetch( posTex, uv );
//
//         //get vector along springs length
//         vec4 springVec = puv - pij;
//         float springLength = length( springVec );
//         vec4 springDir = normalize( springVec );
//
//         //force is proportional to difference from rest length:
//         //if(springLength > spring.restLength){
//             totalForce = spring.springConst * (springLength - spring.restLength) * springDir;
//         //}
//
//         return totalForce;
//     }
// `;



const springForce =    `
    vec4 springForce( vec4 pos1, vec4 pos2,  Spring spring ){
        vec4 totalForce=vec4(0.);
        
        //get vector along springs length
        vec4 springVec = pos2 - pos1;
        float springLength = length( springVec );
        vec4 springDir = normalize( springVec );
        
        //force is proportional to difference from rest length:
        //if(springLength > spring.restLength){
            totalForce = spring.springConst * (springLength - spring.restLength) * springDir;
        //}
    
        return totalForce;
    }
`;


export {
    springForce,
};
