

//the display is a long rectangle, built of square/rectangular stacks
//to start with, we assume that it is a cube:
//thus,

const grid3D_texLookup = `
    vec4 grid3D_texLookup( sampler2D tex, ivec3 ijk ){
    
        int x = ijk.x + int(res.y) * ijk.z;
        int y = ijk.y;
        
        ivec2 xy = ivec2(x,y);
        
        vec4 data = fetch( tex, xy );
        return data;   
    }
`;


export { grid3D_texLookup };
