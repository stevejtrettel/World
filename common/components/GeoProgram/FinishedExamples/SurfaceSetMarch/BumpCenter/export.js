import WoodCut from "../_Components/WoodCut.js";
import BumpCenter from "./BumpCenter.js";
import geodesicData from "./geodesicData.js";



let surf = new BumpCenter();
let example = new WoodCut(surf,geodesicData);

export default example;