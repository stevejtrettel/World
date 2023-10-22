import WoodCut from "./WoodCut.js";
import Gaussian from "./Surface/examples/Gaussian.js";
import Paraboloid from "./Surface/examples/Paraboloid.js";
import SinxSiny from "./Surface/examples/SinxSiny.js";
import CosR from "./Surface/examples/CosR.js";
import GraphingCalc from "./Surface/examples/GraphingCalc.js";


let gauss = new Gaussian();
// let parabola = new Paraboloid();
let sinxsiny = new SinxSiny();
let cosr = new CosR();
let calc = new GraphingCalc();

let wood = new WoodCut(calc);

export default wood;