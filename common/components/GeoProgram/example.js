import WoodCut from "./WoodCut.js";
import StripeBoard from "./StripeBoard.js";
//import GravitySim from "./GravitySim.js";
import Rings from "./Rings.js";
import BilliardChaos from "./BilliardChaos.js";


//import MySurf from "./Surface/examples/Gaussian.js";
//import MySurf from "./Surface/examples/Paraboloid.js";
//import MySurf from "./Surface/examples/SinxSiny.js";
//import MySurf from "./Surface/examples/CosR.js";
import MySurf from "./Surface/examples/surface-set/Eggcarton.js";
//import MySurf from "./Surface/examples/Norton.js";
import Billiards from "./Billiards.js";
//import MySurf from "./Surface/examples/Ripples.js";

let surf = new MySurf();
    //{u:{min:-2,max:2},v:{min:-2,max:2}});

let wood = new StripeBoard(surf);
//let grav = new GravitySim(surf);
//let billiards = new Billiards(surf);
//let rings = new Rings(surf);
//let chaos = new BilliardChaos(surf);
export default wood;