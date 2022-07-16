
const gridSpringsDrag = `
    vec4 gridSpringsDrag( sampler2D velTex, ivec2 ij ) {
    
        vec4 totalDrag=vec4(0.);
        ivec2 dir;
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            dir = ivec2(0,1);
            totalDrag += singleSpringDrag( velTex, ij, ij+dir );
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
             dir = ivec2(0,-1);
            totalDrag += singleSpringDrag( velTex, ij, ij+dir );
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( !onRight(ij) ){
            dir = ivec2(1,0);
            totalDrag += singleSpringDrag( velTex, ij, ij+dir );
        }
            
        //if not on the left, we have leftward springs:
        if( !onLeft(ij) ){
            dir = ivec2(-1,0);
            totalDrag += singleSpringDrag( velTex, ij, ij+dir );
        }
    
        return totalDrag;
    }
`;

const diagSpringsDrag = `
vec4 diagSpringsDrag(sampler2D velTex, ivec2 ij) {
    
        vec4 totalForce=vec4(0.);
        ivec2 dir;
      
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,1);
                totalForce += singleSpringDrag(velTex, ij, ij+dir);
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,1);
                totalForce += singleSpringDrag( velTex, ij, ij+dir );
            }
            
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,-1);
                totalForce += singleSpringDrag( velTex, ij, ij+dir );
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,-1);
                totalForce += singleSpringDrag( velTex, ij, ij+dir );
            }
        
        }
    
        return totalForce;
    }



vec4 doubleDiagSpringsDrag(sampler2D velTex, ivec2 ij) {
    
        vec4 totalDrag=vec4(0.);
        ivec2 dir;

        
        //if not on the top, have springs connecting to above
        if( ij.y < int(res.y)-2 ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( ij.x >1 ){
                dir = ivec2(-2,2);
                totalDrag += singleSpringDrag(velTex, ij, ij+dir );
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( ij.x < int(res.x)-2 ){
                dir = ivec2(2,2);
                totalDrag += singleSpringDrag(velTex, ij, ij+dir );
            }
            
        }
        
        //if not on bottom, have springs connecting to below:
        if( ij.y > 1 ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( ij.x > 1 ){
                dir = ivec2(-2,-2);
                totalDrag += singleSpringDrag( velTex, ij, ij+dir );
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( ij.x < int(res.x)-2 ){
                dir = ivec2(2,-2);
                totalDrag += singleSpringDrag( velTex, ij, ij+dir );
            }
        
        }
    
        return totalDrag/sqrt(2.);
    }
`;



export{
    diagSpringsDrag,
    gridSpringsDrag
};
