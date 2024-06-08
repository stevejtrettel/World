
const springPotential =    `
    float springPotential( sampler2D posTex, ivec2 ij, ivec2 uv,  Spring spring ){
        float totalPotential = 0.;
        
        //get endpoints of the spring,
        vec4 pij = fetch( posTex, ij );
        vec4 puv = fetch( posTex, uv );
        
        //get vector along springs length
        vec4 springVec = puv - pij;
        float springLength = length( springVec );
        
        //potential is proportional to square of difference from rest length:
        float delta = (springLength - spring.restLength);
        totalPotential =  delta*delta;
        totalPotential *= 0.5;
        
        //if(delta>0.)
        //totalPotential = 0.;
        //}
    
        return totalPotential;
    }
    
    
    //overload in terms of space variables instead of spring index
    float springPotential( vec4 p, vec4 q, Spring spring ){
        float totalPotential;
        
        //get vector along springs length
        vec4 springVec = q - p;
        float springLength = length( springVec );
        
        //potential is proportional to square of difference from rest length:
        float delta = (springLength - spring.restLength);
        
        totalPotential = delta*delta;
        totalPotential *= 0.5;
        
        //if(delta>0.)
        //totalPotential = 0.;
        //}
    
        return totalPotential;
    }
`;





const springPotentialGrad =  springPotential + `
    vec4 springPotentialGrad( sampler2D posTex, ivec2 ij, ivec2 uv, Spring spring ){
        vec4 gradPotential;
        
        //get endpoints of the spring,
        vec4 ijPos = fetch( posTex, ij );
        vec4 uvPos = fetch( posTex, uv );
        
        float dX, dY, dZ;
        
        float ep = 0.0001;
        
        vec4 eX=ep*vec4(1,0,0,0);
        vec4 eY=ep*vec4(0,1,0,0);
        vec4 eZ=ep*vec4(0,0,1,0);
        
        dX = springPotential(ijPos+eX, uvPos, spring) - springPotential(ijPos-eX, uvPos, spring);
        dY = springPotential(ijPos+eY, uvPos, spring) - springPotential(ijPos-eY, uvPos, spring);
        dZ = springPotential(ijPos+eZ, uvPos, spring) - springPotential(ijPos-eZ, uvPos, spring);
        
        gradPotential = vec4(dX,dY,dZ,0)/(2.*ep);
        return gradPotential;
    }
`;




export {
    springPotential,
    springPotentialGrad
};
