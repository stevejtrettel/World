import { springDamping } from "../springDamping.js";
import { grid3D_texLookup } from "./grid3D_texLookup.js";
import {grid3D_Coord, grid3D_DiagLong} from "./grid3D.js";


const grid3D_Coord1 = grid3D_Coord('springDamping',1);
const grid3D_Coord2 = grid3D_Coord('springDamping',2);

const grid3D_DiagLong1 = grid3D_DiagLong('springDamping',1);
const grid3D_DiagLong2 = grid3D_DiagLong('springDamping',2);



const grid3D_springDamping =
    springDamping +
    grid3D_Coord1 +
    grid3D_Coord2 +
    grid3D_DiagLong1 +
    grid3D_DiagLong2 +
    `
    vec4 grid3D_springDamping( sampler2D posTex, ivec3 ijk ){
        vec4 total;
        
        Spring spring;
        spring.restLength = gridSpacing;
        spring.springConst = springConst;
        spring.dampingConst = dampingConst;
        
        total += grid3D_Coord1_springDamping( posTex, ijk, spring, gridSpacing );
        total += grid3D_Coord2_springDamping( posTex, ijk, spring, gridSpacing );
        
        total += grid3D_DiagLong1_springDamping( posTex, ijk, spring, gridSpacing );
        total += grid3D_DiagLong2_springDamping( posTex, ijk, spring, gridSpacing );
        
        return total;
    }
`;



export { grid3D_springDamping };
