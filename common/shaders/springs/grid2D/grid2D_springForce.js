import { springForce } from "../springForce.js";
import { grid2D_texLookup } from "./grid2D_texLookup.js";
import { grid2D_Coord, grid2D_Diag } from "./grid2D.js";


const grid2D_Coord1 = grid2D_Coord('springForce',1);
const grid2D_Coord2 = grid2D_Coord('springForce',2);

let grid2D_Diag1 = grid2D_Diag('springForce', 1);
let grid2D_Diag2 = grid2D_Diag('springForce', 2);

const grid2D_springForce =
    springForce +
    grid2D_texLookup +
    grid2D_Coord1 +
    grid2D_Coord2 +
    grid2D_Diag1 +
    grid2D_Diag2 +
    `
    vec4 grid2D_springForce( sampler2D posTex, ivec2 ij ){
        vec4 total;
        
        Spring spring;
        spring.restLength = gridSpacing;
        spring.springConst = springConst;
        spring.dampingConst = dampingConst;
        
        total += grid2D_Coord1_springForce( posTex, ij, spring, gridSpacing );
        total += grid2D_Coord2_springForce( posTex, ij, spring, gridSpacing );
        total += grid2D_Diag1_springForce( posTex, ij, spring, gridSpacing );
        total += grid2D_Diag2_springForce( posTex, ij, spring, gridSpacing );
        
        return total;
    }
`;



export { grid2D_springForce };
