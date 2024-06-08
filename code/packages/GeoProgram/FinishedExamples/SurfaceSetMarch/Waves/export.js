import WoodCut from "../_Components/WoodCut.js";
import Waves from "./Waves.js";
import geodesicData from "./geodesicData.js";



let surf = new Waves();
let example = new WoodCut(surf,geodesicData);

export default example;