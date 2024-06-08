
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
