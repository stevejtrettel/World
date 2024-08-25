import {Vector2} from "../../../3party/three/build/three.module.js";

import State from "../../items/geodesic-program/surface/Integrators/States/State.js";
import PlotGPU from "../../items/geodesic-program/plot/PlotGPU.js";
import GraphingCalc from "../../items/geodesic-program/surface/Examples/GraphingCalc.js";
import ParticleGrid from "../../items/geodesic-program/trajectories/ParticleGrid.js";

class GradientDescentGrid{
    constructor() {
        this.surface = new GraphingCalc();
        this.plot = new PlotGPU(this.surface);
        this.gradientGrid = new ParticleGrid(this.surface,1);
    }

    addToScene(scene){
        this.plot.addToScene(scene);
        this.gradientGrid.addToScene(scene);
    }

    addToUI(ui){

        let test = this;

        let resetScene = function(){
            test.plot.updateSurface();
            test.gradientGrid.updateSurface();
        };

        this.surface.buildUIFolder(ui,resetScene);

    }

    tick(time,dTime){
        this.gradientGrid.stepForward();
    }
}


export default GradientDescentGrid;
