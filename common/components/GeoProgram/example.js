import WoodCut from "./WoodCut.js";
import GravitySim from "./GravitySim.js";

//import MySurf from "./Surface/examples/Gaussian.js";
//import MySurf from "./Surface/examples/Paraboloid.js";
//import MySurf from "./Surface/examples/SinxSiny.js";
//import MySurf from "./Surface/examples/CosR.js";
//import MySurf from "./Surface/examples/GraphingCalc.js";
import MySurf from "./Surface/examples/Norton.js";


let surf = new MySurf();

//let wood = new WoodCut(surf);
let grav = new GravitySim(surf);

export default grav;