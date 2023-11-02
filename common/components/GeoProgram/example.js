import WoodCut from "./WoodCut.js";
//import GravitySim from "./GravitySim.js";
import Rings from "./Rings.js";

//import MySurf from "./Surface/examples/Gaussian.js";
//import MySurf from "./Surface/examples/Paraboloid.js";
//import MySurf from "./Surface/examples/SinxSiny.js";
//import MySurf from "./Surface/examples/CosR.js";
import MySurf from "./Surface/examples/GraphingCalc.js";
//import MySurf from "./Surface/examples/Norton.js";
import Billiards from "./Billiards.js";


let surf = new MySurf({u:{min:-5,max:5},v:{min:-5,max:5}});

//let wood = new WoodCut(surf);
//let grav = new GravitySim(surf);
//let billiards = new Billiards(surf);
let rings = new Rings(surf);

export default rings;