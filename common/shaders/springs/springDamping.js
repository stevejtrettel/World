//
// const springDamping =    `
//     vec4 springDamping( sampler2D velTex, ivec2 ij, ivec2 uv,  Spring spring ){
//         vec4 totalForce=vec4(0.);
//
//         //get endpoints of the spring,
//         vec4 pij = fetch( velTex, ij );
//         vec4 puv = fetch( velTex, uv );
//
//         //difference in endpoint velocities
//         //based at pij?
//         vec4 springVel = puv - pij;
//
//
//         //drag is proportional to this velocity:
//         totalForce += spring.dampingConst * springVel;
//
//         return totalForce;
//
//     }
// `;



const springDamping =    `
    vec4 springDamping( vec4 vel1, vec4 vel2,  Spring spring ){
        vec4 totalForce=vec4(0.);
        
        //difference in endpoint velocities
        vec4 springVel = vel2 - vel1;
       
        //drag is proportional to this velocity:
        totalForce += spring.dampingConst * springVel;
        
        return totalForce;
        
    }
`;


export {
    springDamping
};
