//this is a set of functions, that take in the name of a function for spring force/potential / whatever
//and apply them appropriately to generate a 2D grid


//the input single spring function must have inputs dataTex, pos1, pos2, restLength
function grid2D_Coord ( singleSpringFunction, springSpan ){

    return `
     vec4 grid2D_Coord${springSpan}_${singleSpringFunction}( sampler2D dataTex, ivec2 ij, Spring spring, float gridSpacing ) {
    
        vec4 total = vec4(0.);
        ivec2 dir;
        vec4 pos1, pos2;
        
        //adjust the rest length appropriately:
        spring.restLength = gridSpacing * ${springSpan}.;
        
        //if not on the top, have springs connecting to above
        if( ij.y < int(res.y) -  ${springSpan} ){
            dir = ivec2(0,  ${springSpan} );
            pos1 = grid2D_texLookup(dataTex, ij);
            pos2 = grid2D_texLookup(dataTex, ij+dir);
            total += ${singleSpringFunction}(pos1, pos2, spring);
        }
        
        //if not on bottom, have springs connecting to below:
        if( ij.y >  ${springSpan} - 1 ){
             dir = ivec2(0,- ${springSpan});
             pos1 = grid2D_texLookup(dataTex, ij);
             pos2 = grid2D_texLookup(dataTex, ij+dir);
             total += ${singleSpringFunction}(pos1, pos2, spring);
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( ij.x < int(res.x)- ${springSpan} ){
            dir = ivec2( ${springSpan},0);
            pos1 = grid2D_texLookup(dataTex, ij);
            pos2 = grid2D_texLookup(dataTex, ij+dir);
             total += ${singleSpringFunction}(pos1, pos2, spring);
        }
            
        //if not on the left, we have leftward springs:
        if( ij.x>  ${springSpan} - 1 ){
            dir = ivec2(- ${springSpan},0);
            pos1 = grid2D_texLookup(dataTex, ij);
            pos2 = grid2D_texLookup(dataTex, ij+dir);
             total += ${singleSpringFunction}(pos1, pos2, spring);
        }
    
        return total;
    }
    
    `;
}


function grid2D_Diag ( singleSpringFunction, springSpan ){
    return `
     vec4 grid2D_Diag${springSpan}_${singleSpringFunction}( sampler2D dataTex, ivec2 ij, Spring spring, float gridSpacing ) {
    
        vec4 total = vec4(0.);
        ivec2 dir;
        vec4 pos1, pos2;
        
        //adjust the rest length appropriately:
        spring.restLength = sqrt(2.) * gridSpacing * ${springSpan}.;
        
        
       //if not on the top, have springs connecting to above
        if( ij.y < int(res.y)- ${springSpan} ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( ij.x > ${springSpan} - 1 ){
                dir = ivec2( -${springSpan}, ${springSpan} );
                pos1 = grid2D_texLookup(dataTex, ij);
                pos2 = grid2D_texLookup(dataTex, ij+dir);
                total += ${singleSpringFunction}(pos1, pos2, spring);
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( ij.x < int(res.x)- ${springSpan} ){
                dir = ivec2( ${springSpan}, ${springSpan});
                 pos1 = grid2D_texLookup(dataTex, ij);
                 pos2 = grid2D_texLookup(dataTex, ij+dir);
                 total += ${singleSpringFunction}(pos1, pos2, spring);
            }
            
        }
        
         //if not on bottom, have springs connecting to below:
        if( ij.y > ${springSpan}-1 ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( ij.x > ${springSpan}-1 ){
                dir = ivec2(-${springSpan}, -${springSpan});
                pos1 = grid2D_texLookup(dataTex, ij);
                pos2 = grid2D_texLookup(dataTex, ij+dir);
                total += ${singleSpringFunction}(pos1, pos2, spring);
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( ij.x < int(res.x)-${springSpan} ){
                dir = ivec2(${springSpan}, -${springSpan});
                pos1 = grid2D_texLookup(dataTex, ij);
                pos2 = grid2D_texLookup(dataTex, ij+dir);
                total += ${singleSpringFunction}(pos1, pos2, spring);
            }
        
        }
        
        
    
        return total;
    }
    
    `;
}




export{
    grid2D_Diag,
    grid2D_Coord,
};
