import { springDamping } from "./springDamping.js";
import { grid2D_Coord, grid2D_Diag } from "./grid2D.js";


const grid2D_Coord1_springDamping = grid2D_Coord('springDamping',1);
const grid2D_Coord2_springDamping = grid2D_Coord('springDamping',2);

let grid2D_Diag1_springDamping = grid2D_Diag('springDamping', 1);
let grid2D_Diag2_springDamping = grid2D_Diag('springDamping', 2);

const grid2D_springDamping =
    springDamping+
    grid2D_Coord1_springDamping +
    grid2D_Coord2_springDamping +
    grid2D_Diag1_springDamping +
    grid2D_Diag2_springDamping +
    `
    vec4 grid2D_springDamping( sampler2D velTex, ivec2 ij ){
        vec4 total;
        
        Spring spring;
        spring.restLength = gridSpacing;
        spring.springConst = springConstShort;
        spring.dampingConst = springDragConst;
        
        total += grid2D_Coord1_springDamping( velTex, ij, spring, gridSpacing );
        total += grid2D_Coord2_springDamping( velTex, ij, spring, gridSpacing );
        total += grid2D_Diag1_springDamping( velTex, ij, spring, gridSpacing );
        total += grid2D_Diag2_springDamping( velTex, ij, spring, gridSpacing );
        
        return total;
    }
`;



export { grid2D_springDamping };
