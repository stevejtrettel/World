import { springForce } from "../springForce.js";
import { grid3D_texLookup } from "./grid3D_texLookup.js";
import { grid3D_Coord, grid3D_DiagLong} from "./grid3D.js";


const grid3D_Coord1 = grid3D_Coord('springForce',1);
const grid3D_Coord2 = grid3D_Coord('springForce',2);

const grid3D_DiagLong1 = grid3D_DiagLong('springForce',1);
const grid3D_DiagLong2 = grid3D_DiagLong('springForce',2);


const grid3D_springForce =
    springForce +
    grid3D_Coord1 +
    grid3D_Coord2 +
    grid3D_DiagLong1 +
    grid3D_DiagLong2 +
    `
    vec4 grid3D_springForce( sampler2D posTex, ivec3 ijk ){
        vec4 total;
        
        Spring spring;
        spring.restLength = gridSpacing;
        spring.springConst = springConst;
        spring.dampingConst = dampingConst;
        
        total += grid3D_Coord1_springForce( posTex, ijk, spring, gridSpacing );
        total += grid3D_Coord2_springForce( posTex, ijk, spring, gridSpacing );
        
        total += grid3D_DiagLong1_springForce( posTex, ijk, spring, gridSpacing );
        total += grid3D_DiagLong2_springForce( posTex, ijk, spring, gridSpacing );
        
        return total;
    }
`;



export { grid3D_springForce };
