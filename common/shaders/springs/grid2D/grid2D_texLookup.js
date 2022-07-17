

//do nothing strange: just a wrapper for "fetch" in 2D
const grid2D_texLookup = `
    vec4 grid2D_texLookup( sampler2D tex, ivec2 ij ){
        vec4 pos = fetch( tex, ij );
        return pos;   
    }
`;


export {grid2D_texLookup};
