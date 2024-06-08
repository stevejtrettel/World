import { springPotentialGrad } from "../springPotential.js";
import { grid2D_Coord, grid2D_Diag } from "./grid2D.js";


const grid2D_Coord1_springPotentialGrad = grid2D_Coord('springPotentialGrad',1);
const grid2D_Coord2_springPotentialGrad = grid2D_Coord('springPotentialGrad',2);

let grid2D_Diag1_springPotentialGrad = grid2D_Diag('springPotentialGrad', 1);
let grid2D_Diag2_springPotentialGrad = grid2D_Diag('springPotentialGrad', 2);

const grid2D_springPotentialGrad =
    springPotentialGrad +
    grid2D_Coord1_springPotentialGrad +
    grid2D_Coord2_springPotentialGrad +
    grid2D_Diag1_springPotentialGrad +
    grid2D_Diag2_springPotentialGrad +
    `
    vec4 grid2D_springPotentialGrad( sampler2D posTex, ivec2 ij ){
        vec4 total;
        
        Spring spring;
        spring.restLength = gridSpacing;
        spring.springConst = springConst;
        spring.dampingConst = dampingConst;
        
        total += grid2D_Coord1_springPotentialGrad( posTex, ij, spring, gridSpacing );
        total += grid2D_Coord2_springPotentialGrad( posTex, ij, spring, gridSpacing );
        total += grid2D_Diag1_springPotentialGrad( posTex, ij, spring, gridSpacing );
        total += grid2D_Diag2_springPotentialGrad( posTex, ij, spring, gridSpacing );
        
        return total;
    }
`;



export { grid2D_springPotentialGrad };
