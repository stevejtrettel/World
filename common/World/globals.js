import {createPMREM, createRenderer} from "./components/createRenderer.js";


let renderer = createRenderer();
let pmremGen = createPMREM(renderer);

let globals = {
  renderer:renderer,
    pmremGen: pmremGen,
        };

export {globals};