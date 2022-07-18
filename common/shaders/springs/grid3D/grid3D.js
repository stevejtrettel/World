//this is a set of functions, that take in the name of a function for spring force/potential / whatever
//and apply them appropriately to generate a 2D grid


//the input single spring function must have inputs dataTex, pos1, pos2, restLength
function grid3D_Coord ( singleSpringFunction, springSpan ){

    return `
     vec4 grid3D_Coord${springSpan}_${singleSpringFunction}( sampler2D dataTex, ivec3 ijk, Spring spring, float gridSpacing ) {
    
        vec4 total = vec4(0.);
        ivec3 dir;
        vec4 pos1, pos2;
        
        int cubeSideLength = int(res.y);
        
        //adjust the rest length appropriately:
        spring.restLength = gridSpacing * ${springSpan}.;
        
        //if not on the top, have springs connecting to above
        if( ijk.y < cubeSideLength -  ${springSpan} ){
            dir = ivec3(0,  ${springSpan}, 0 );
            pos1 = grid3D_texLookup(dataTex, ijk);
            pos2 = grid3D_texLookup(dataTex, ijk+dir);
            total += ${singleSpringFunction}( pos1, pos2, spring );
        }
        
        //if not on bottom, have springs connecting to below:
        if( ijk.y >  ${springSpan} - 1 ){
             dir = ivec3(0,- ${springSpan}, 0);
             pos1 = grid3D_texLookup(dataTex, ijk);
            pos2 = grid3D_texLookup(dataTex, ijk+dir);
             total += ${singleSpringFunction}( pos1, pos2, spring );
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( ijk.x < cubeSideLength - ${springSpan} ){
            dir = ivec3( ${springSpan},0, 0);
            pos1 = grid3D_texLookup(dataTex, ijk);
            pos2 = grid3D_texLookup(dataTex, ijk+dir);
             total += ${singleSpringFunction}( pos1, pos2, spring );
        }
            
        //if not on the left, we have leftward springs:
        if( ijk.x >  ${springSpan} - 1 ){
            dir = ivec3(- ${springSpan},0, 0);
            pos1 = grid3D_texLookup(dataTex, ijk);
            pos2 = grid3D_texLookup(dataTex, ijk+dir);
             total += ${singleSpringFunction}( pos1, pos2, spring );
        }
        
        
        //if furthermore not on the front, we have forward springs:
        if( ijk.z < cubeSideLength - ${springSpan} ){
            dir = ivec3(0, 0, ${springSpan});
            pos1 = grid3D_texLookup(dataTex, ijk);
            pos2 = grid3D_texLookup(dataTex, ijk+dir);
             total += ${singleSpringFunction}( pos1, pos2, spring );
        }
            
        //if not on the back, we have backward springs:
        if( ijk.z >  ${springSpan} - 1 ){
            dir = ivec3(0, 0, - ${springSpan});
            pos1 = grid3D_texLookup(dataTex, ijk);
            pos2 = grid3D_texLookup(dataTex, ijk+dir);
             total += ${singleSpringFunction}( pos1, pos2, spring );
        }
    
        return total;
    }
    
    `;
}





function grid3D_DiagLong ( singleSpringFunction, springSpan ){
    return `
     vec4 grid3D_DiagLong${springSpan}_${singleSpringFunction}( sampler2D dataTex, ivec3 ijk, Spring spring, float gridSpacing ) {
    
        vec4 total = vec4(0.);
        ivec3 dir;
        vec4 pos1, pos2;
        
        int cubeSideLength = int(res.y);
        
        
        //adjust the rest length appropriately:
        spring.restLength = sqrt(3.) * gridSpacing * ${springSpan}.;
        
        
        if( ijk.y < cubeSideLength- ${springSpan} ){
            
            if( ijk.x > ${springSpan} - 1 ){
            
                if( ijk.z > ${springSpan} -1) {
                    dir = ivec3( -${springSpan}, ${springSpan}, -${springSpan} );
                    pos1 = grid3D_texLookup(dataTex, ijk);
                    pos2 = grid3D_texLookup(dataTex, ijk+dir);
                    total += ${singleSpringFunction}(pos1, pos2, spring);
                }
                
                if( ijk.z < cubeSideLength - ${springSpan} ){
                    dir = ivec3( -${springSpan}, ${springSpan}, ${springSpan} );
                    pos1 = grid3D_texLookup(dataTex, ijk);
                    pos2 = grid3D_texLookup(dataTex, ijk+dir);
                    total += ${singleSpringFunction}(pos1, pos2, spring);
                }

            }
            
            
            if( ijk.x < cubeSideLength - ${springSpan} ){
            
 
                if( ijk.z > ${springSpan} -1) {
                    dir = ivec3( ${springSpan}, ${springSpan}, -${springSpan} );
                    pos1 = grid3D_texLookup(dataTex, ijk);
                    pos2 = grid3D_texLookup(dataTex, ijk+dir);
                    total += ${singleSpringFunction}(pos1, pos2, spring);
                }
                

                if( ijk.z < cubeSideLength - ${springSpan} ){
                    dir = ivec3( ${springSpan}, ${springSpan}, ${springSpan} );
                    pos1 = grid3D_texLookup(dataTex, ijk);
                    pos2 = grid3D_texLookup(dataTex, ijk+dir);
                    total += ${singleSpringFunction}(pos1, pos2, spring);
                }

            }
  
        }  
        
        
   
        if( ijk.y > ${springSpan}-1 ){
            
      
            if( ijk.x > ${springSpan} - 1 ){
            

                if( ijk.z > ${springSpan} -1) {
                    dir = ivec3( -${springSpan}, -${springSpan}, -${springSpan} );
                    pos1 = grid3D_texLookup(dataTex, ijk);
                    pos2 = grid3D_texLookup(dataTex, ijk+dir);
                    total += ${singleSpringFunction}(pos1, pos2, spring);
                }
                
     
                if( ijk.z < cubeSideLength - ${springSpan} ){
                    dir = ivec3( -${springSpan}, -${springSpan}, ${springSpan} );
                    pos1 = grid3D_texLookup(dataTex, ijk);
                    pos2 = grid3D_texLookup(dataTex, ijk+dir);
                    total += ${singleSpringFunction}(pos1, pos2, spring);
                }

            }
            
            

            if( ijk.x < cubeSideLength - ${springSpan} ){
            

                if( ijk.z > ${springSpan} -1) {
                    dir = ivec3( ${springSpan}, -${springSpan}, -${springSpan} );
                    pos1 = grid3D_texLookup(dataTex, ijk);
                    pos2 = grid3D_texLookup(dataTex, ijk+dir);
                    total += ${singleSpringFunction}(pos1, pos2, spring);
                }
                

                if( ijk.z < cubeSideLength - ${springSpan} ){
                    dir = ivec3( ${springSpan}, -${springSpan}, ${springSpan} );
                    pos1 = grid3D_texLookup(dataTex, ijk);
                    pos2 = grid3D_texLookup(dataTex, ijk+dir);
                    total += ${singleSpringFunction}(pos1, pos2, spring);
                }

            }
  
        }  
    
        return total;
    }
    
    `;
}



export{
    grid3D_Coord,
    grid3D_DiagLong,
};
