import WoodCut from "../_Components/WoodCut.js";
import geodesicData from "./geodesicData.js";
import BumpSide from "./BumpSide.js";


let surf = new BumpSide();
let example = new WoodCut(surf,geodesicData);

export default example;
