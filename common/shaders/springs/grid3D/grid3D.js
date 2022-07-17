//this is a set of functions, that take in the name of a function for spring force/potential / whatever
//and apply them appropriately to generate a 2D grid


//the input single spring function must have inputs dataTex, pos1, pos2, restLength
function grid3D_Coord ( singleSpringFunction, springSpan ){

    return `
     vec4 grid3D_Coord${springSpan}_${singleSpringFunction}( sampler2D dataTex, ivec3 ijk, Spring spring, float gridSpacing ) {
    
        vec4 total = vec4(0.);
        ivec2 dir;
        
        //adjust the rest length appropriately:
        spring.restLength = gridSpacing * ${springSpan}.;
        
        //if not on the top, have springs connecting to above
        if( ijk.y < int(res.y) -  ${springSpan} ){
            dir = ivec3(0,  ${springSpan}, 0 );
            total += ${singleSpringFunction}( dataTex,  ijk, ijk+dir, spring);
        }
        
        //if not on bottom, have springs connecting to below:
        if( ijk.y >  ${springSpan} - 1 ){
             dir = ivec3(0,- ${springSpan}, 0);
             total += ${singleSpringFunction}( dataTex,  ijk, ijk+dir, spring);
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( ijk.x < int(res.x)- ${springSpan} ){
            dir = ivec3( ${springSpan},0, 0);
             total += ${singleSpringFunction}( dataTex,  ijk, ijk+dir, spring);
        }
            
        //if not on the left, we have leftward springs:
        if( ijk.x >  ${springSpan} - 1 ){
            dir = ivec3(- ${springSpan},0, 0);
             total += ${singleSpringFunction}( dataTex,  ijk, ijk+dir, spring);
        }
        
        
        //if furthermore not on the front, we have forward springs:
        if( ijk.x < int(res.z)- ${springSpan} ){
            dir = ivec3(0, 0, ${springSpan});
             total += ${singleSpringFunction}( dataTex,  ijk, ijk+dir, spring);
        }
            
        //if not on the back, we have backward springs:
        if( ijk.x >  ${springSpan} - 1 ){
            dir = ivec3(0, 0, - ${springSpan});
             total += ${singleSpringFunction}( dataTex,  ijk, ijk+dir, spring);
        }
    
        return total;
    }
    
    `;
}





export{
    grid3D_Coord,
};
