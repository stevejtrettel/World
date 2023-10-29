import {colorConversion} from "./utils/colorConversion.js";
import grid from "./utils/grid.js";

const zStripes = colorConversion + grid + `
vec3 colorFn(vec2 uv,vec3 xyz){

        //allowable variables to use in coloring:
        float u = uv.x;
        float v = uv.y;
        float x = xyz.x;
        float y = xyz.y;
        float z = xyz.z;
        
        float r = sqrt(x*x+z*z);
        float t = atan(z,x)/6.28;
        vec2 polar = vec2(r,t);
        
        float hue = t;
        float sat =0.6*(2.*r*r/(1.+2.*r*r));
        float light =0.5;
        vec3 base = hsb2rgb(vec3(hue,sat,light));
        
        float grid = scalarGrid(y, 2.);
        vec3 col = base + 3.*vec3(grid);
        
        return col;
    }
`;

export default zStripes;