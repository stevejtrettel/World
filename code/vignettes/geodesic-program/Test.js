
import {Vector2} from "../../../3party/three/build/three.module.js";


import PlotGPU from "../../items/geodesic-program/plot/PlotGPU.js";
import State from "../../items/geodesic-program/surface/Integrators/States/State.js";
import SinxSiny from "../../items/geodesic-program/surface/Examples/SinxSiny.js";
import ParticleSystem from "../../items/geodesic-program/trajectories/ParticleSystem.js";
import Ball from "../../items/geodesic-program/trajectories/Ball.js";
import Geodesic from "../../items/geodesic-program/trajectories/Geodesic.js";
import Billiard from "../../items/geodesic-program/trajectories/Billiard.js";


class TestDisplay{
    constructor() {
        this.surface = new SinxSiny();
        this.plot = new PlotGPU(this.surface);

        let iniState1 = new State(new Vector2(0.3,0.5), new Vector2(1,0));
        let iniState2 = new State(new Vector2(0.1,-0.3), new Vector2(0.3,0.3));
        let iniState3 = new State(new Vector2(-0.3,0.2), new Vector2(0.1,-0.3));
        this.ball = new Ball(this.surface, iniState1, 2);
        this.particles = new ParticleSystem(this.surface, 2,1000);
        this.geodesic = new Geodesic(this.surface, iniState2,1);
        this.billiard = new Billiard(this.surface, iniState3,0);

    }

    addToScene(scene){
        this.plot.addToScene(scene);
        this.ball.addToScene(scene);
        this.particles.addToScene(scene);
        this.geodesic.addToScene(scene);
        this.billiard.addToScene(scene);
    }

    addToUI(ui){

        let test = this;

        let resetScene = function(){
            test.plot.updateSurface();
            test.geodesic.updateSurface();
            test.billiard.updateSurface();
        };

        this.surface.buildUIFolder(ui,resetScene);
    }

    tick(time,dTime){
        this.ball.stepForward();
        this.particles.stepForward();
    }


}


export default TestDisplay;
