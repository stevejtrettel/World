

const hsb2rgb = `
//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
    6.0)-3.0)-1.0,
    0.0,
    1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}
`;


const linearGradient = `
    vec3 linearGradient(vec3 col1, vec3 col2, float x){
        //move x to [0,1]
        float k = (x+1.)/2.;
        return k*col1+(1.-k)*col2;
    }
`;



//put together all the coloring functions for export
const colorConversion = hsb2rgb+linearGradient;



export { colorConversion };
