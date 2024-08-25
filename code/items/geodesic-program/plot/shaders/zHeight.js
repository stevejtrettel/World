import {colorConversion} from "./utils/colorConversion.js";



const zHeight = colorConversion + `
vec3 colorFn(vec2 uv,vec3 xyz){

        //allowable variables to use in coloring:
        float u = uv.x;
        float v = uv.y;
        float x = xyz.x;
        float y = xyz.y;
        float z = xyz.z;
        
        float height = -0.5*tanh(2.*y)+0.3;
        vec3 col = hsb2rgb(vec3(height,0.4,0.5));
        
        return col;
    }
`;

export default zHeight;