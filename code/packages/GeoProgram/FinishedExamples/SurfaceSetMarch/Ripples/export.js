import WoodCut from "../_Components/WoodCut.js";
import Ripples from "./Ripples.js";
import geodesicData from "./geodesicData.js";



let surf = new Ripples();
let example = new WoodCut(surf,geodesicData);

export default example;