import WoodCut from "./WoodCut.js";
import Gaussian from "./Surfaces/Gaussian.js";
import Paraboloid from "./Surfaces/Paraboloid.js";
import SinxSiny from "./Surfaces/SinxSiny.js";
import CosR from "./Surfaces/CosR.js";



let gauss = new Gaussian();
let parabola = new Paraboloid();
let sinxsiny = new SinxSiny();
let cosr = new CosR();


let surfList = {
    gauss: gauss,
    parabola: parabola
};

let wood = new WoodCut(surfList);

export default wood;