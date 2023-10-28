import WoodCut from "./WoodCut.js";


//import MySurf from "./Surface/examples/Gaussian.js";
//import MySurf from "./Surface/examples/Paraboloid.js";
//import MySurf from "./Surface/examples/SinxSiny.js";
//import MySurf from "./Surface/examples/CosR.js";
import MySurf from "./Surface/examples/GraphingCalc.js";

let surf = new MySurf();
let wood = new WoodCut(surf);

//import GravitySim from "./GravitySim.js";
//let grav = new GravitySim();


export default wood;