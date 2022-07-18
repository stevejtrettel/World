import { springDamping } from "../springDamping.js";
import { grid2D_texLookup } from "./grid2D_texLookup.js";
import { grid2D_Coord, grid2D_Diag } from "./grid2D.js";


const grid2D_Coord1_springDamping = grid2D_Coord('springDamping',1);
const grid2D_Coord2_springDamping = grid2D_Coord('springDamping',2);
const grid2D_Coord3_springDamping = grid2D_Coord('springDamping', 3);

const grid2D_Diag1_springDamping = grid2D_Diag('springDamping', 1);
const grid2D_Diag2_springDamping = grid2D_Diag('springDamping', 2);
const grid2D_Diag3_springDamping = grid2D_Diag('springDamping', 3);

const grid2D_springDamping =
    springDamping +
    grid2D_texLookup +
    grid2D_Coord1_springDamping +
    grid2D_Coord2_springDamping +
    grid2D_Diag1_springDamping +
    grid2D_Diag2_springDamping +
    `
    vec4 grid2D_springDamping( sampler2D velTex, ivec2 ij ){
        vec4 total;
        
        Spring spring;
        spring.restLength = gridSpacing;
        spring.springConst = springConst;
        spring.dampingConst = dampingConst;
        
        total += grid2D_Coord1_springDamping( velTex, ij, spring, gridSpacing );
        total += grid2D_Coord2_springDamping( velTex, ij, spring, gridSpacing );
        total += grid2D_Diag1_springDamping( velTex, ij, spring, gridSpacing );
        total += grid2D_Diag2_springDamping( velTex, ij, spring, gridSpacing );
        
        return total;
    }
`;



//
// function grid2D_springNetwork( singleSpringFunction, connectivity ){
//     let grid2D_CoordFn = ``;
//     let grid2D_DiagFn = ``;
//     let addToTotal =``;
//     for(let i=1; i<connectivity+1; i++){
//         grid2D_CoordFn = grid2D_CoordFn + grid2D_Coord('springDamping',i);
//         grid2D_DiagFn = grid2D_DiagFn + grid2D_Diag('springDamping',i);
//         addToTotal = addToTotal +
//     }
//
//      let grid2D_Fn =
//          grid2D_texLookup +
//          grid2D_CoordFn +
//          grid2D_DiagFn +
//          `vec4 grid2D_springDamping( sampler2D velTex, ivec2 ij ){
//             vec4 total;
//
//             Spring spring;
//             spring.restLength = gridSpacing;
//             spring.springConst = springConst;
//             spring.dampingConst = dampingConst;
//             `
//             +
//             for(let i=1; i<connectivity+1; i++){
//
//             }
//              `
//
//             total += grid2D_Coord1_springDamping( velTex, ij, spring, gridSpacing );
//             total += grid2D_Coord2_springDamping( velTex, ij, spring, gridSpacing );
//             total += grid2D_Diag1_springDamping( velTex, ij, spring, gridSpacing );
//             total += grid2D_Diag2_springDamping( velTex, ij, spring, gridSpacing );
//
//             return total;
//     }`
//
// }


export { grid2D_springDamping };
