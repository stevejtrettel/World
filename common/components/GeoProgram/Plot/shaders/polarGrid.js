import {colorConversion} from "./utils/colorConversion.js";
import coordGrid from "./utils/coordGrid.js";



const polarGrid = colorConversion + coordGrid + `
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
        float sat =0.5;
        float light =0.5;
        vec3 base = hsb2rgb(vec3(hue,sat,light));
        
        float grid = coordGrid(polar, 1.);
        vec3 col = base + 2.*vec3(grid);
        
        return col;
    }
`;

export default polarGrid;