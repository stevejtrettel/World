

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




const rainbowGradient = `

vec3 cubehelix(vec3 c) {
  vec2 sc = vec2(sin(c.x), cos(c.x));
  return c.z * (1.0 + c.y * (1.0 - c.z) * (
    sc.x * vec3(0.14861, 0.29227, -1.97294) + 
    sc.y * vec3(1.78277, -0.90649, 0.0)
  ));
}

vec3 rainbowGradient(float t) {
  return cubehelix(vec3(
    TWO_PI * t - 1.74533,
    (0.25 * cos(TWO_PI * t) + 0.25) * vec2(-1.5, -0.9) + vec2(1.5, 0.8)
  ));
}`;


//put together all the coloring functions for export
const colorConversion = rainbowGradient + hsb2rgb + linearGradient;


export { colorConversion };
