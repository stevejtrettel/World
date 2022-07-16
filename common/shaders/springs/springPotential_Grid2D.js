
const gridSpringsPotentialGrad = `
    vec4 gridSpringsPotentialGrad( sampler2D posTex, ivec2 ij ) {
    
       vec4 totalGrad = vec4(0);
        ivec2 dir;
        float rest = gridSpacing;
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            dir = ivec2(0,1);
            totalGrad += springConstShort * singleSpringPotentialGrad( posTex, ij, ij+dir, rest);
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
             dir = ivec2(0,-1);
            totalGrad += springConstShort * singleSpringPotentialGrad( posTex, ij, ij+dir, rest);
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( !onRight(ij) ){
            dir = ivec2(1,0);
            totalGrad += springConstShort * singleSpringPotentialGrad( posTex, ij, ij+dir, rest);
        }
            
        //if not on the left, we have leftward springs:
        if( !onLeft(ij) ){
            dir = ivec2(-1,0);
            totalGrad += springConstShort * singleSpringPotentialGrad( posTex, ij, ij+dir, rest);
        }
    
        return totalGrad;
    }
    
    
    
    vec4 doubleGridSpringsPotentialGrad( sampler2D posTex, ivec2 ij ) {
    
        vec4 totalGrad=vec4(0.);
        ivec2 dir;
        float rest = 2.*gridSpacing;
        
        //if not on the top, have springs connecting to above
        if( ij.y < int(res.y)-2 ){
            dir = ivec2(0,2);
            totalGrad += springConstLong * singleSpringPotentialGrad( posTex, ij, ij+dir, rest);
        }
        
        //if not on bottom, have springs connecting to below:
        if( ij.y > 1 ){
             dir = ivec2(0,-2);
            totalGrad += springConstLong * singleSpringPotentialGrad( posTex, ij, ij+dir, rest);
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( ij.x < int(res.x)-2 ){
            dir = ivec2(2,0);
            totalGrad += springConstLong * singleSpringPotentialGrad( posTex, ij, ij+dir, rest);
        }
            
        //if not on the left, we have leftward springs:
        if( ij.x>1 ){
            dir = ivec2(-2,0);
            totalGrad += springConstLong * singleSpringPotentialGrad( posTex, ij, ij+dir, rest);
        }
    
        return totalGrad;
    }
`;



const diagSpringsPotentialGrad = `
 vec4 diagSpringsPotentialGrad(sampler2D posTex, ivec2 ij) {
    
        vec4 totalForce=vec4(0.);
        ivec2 dir;
        float rest = gridSpacing*sqrt(2.);
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,1);
                totalForce += springConstShort * singleSpringPotentialGrad(posTex, ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,1);
                totalForce +=springConstShort * singleSpringPotentialGrad(posTex, ij, ij+dir, rest);
            }
            
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,-1);
                totalForce += springConstShort * singleSpringPotentialGrad(posTex, ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,-1);
                totalForce += springConstShort * singleSpringPotentialGrad(posTex, ij, ij+dir, rest);
            }
        
        }
    
        return totalForce;
    }
    
    
    vec4 doubleDiagSpringsPotentialGrad(sampler2D posTex, ivec2 ij) {
    
        vec4 totalForce=vec4(0.);
        ivec2 dir;
        float rest = 2.*gridSpacing*sqrt(2.);
        
        //if not on the top, have springs connecting to above
        if( ij.y < int(res.y)-2 ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( ij.x >1 ){
                dir = ivec2(-2,2);
                totalForce += springConstLong * singleSpringPotentialGrad(posTex, ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( ij.x < int(res.x)-2 ){
                dir = ivec2(2,2);
                totalForce += springConstLong * singleSpringPotentialGrad(posTex, ij, ij+dir, rest);
            }
            
        }
        
        //if not on bottom, have springs connecting to below:
        if( ij.y > 1 ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( ij.x > 1 ){
                dir = ivec2(-2,-2);
                totalForce += springConstLong * singleSpringPotentialGrad(posTex, ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( ij.x < int(res.x)-2 ){
                dir = ivec2(2,-2);
                totalForce += springConstLong * singleSpringPotentialGrad(posTex, ij, ij+dir, rest);
            }
        
        }
    
        return totalForce;
    }
`;

export {
    diagSpringsPotentialGrad,
    gridSpringsPotentialGrad
};


