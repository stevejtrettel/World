
import {Vector2} from "../../../3party/three/build/three.module.js";

import PlotGPU from "./Plot/PlotGPU.js";
import State from "./Integrator/State.js";
import BallGPU from "./Geodesics/BallGPU.js";

class BilliardChaos{
    constructor(surface) {

        this.surface = surface;
        this.plot = new PlotGPU(this.surface);
        this.numBalls = 20000;

        //parameters the UI will control!
        let billiards =this;
        this.params = {
            surface: this.surface,
            pos:0.8,
            dir:0,
            error:0.001,
            gravity:1,
        }

        if(this.surface.gravity) {
            this.params.gravity=this.surface.gravity;
        }
        else{
            this.surface.gravity = this.params.gravity;
        }
        this.surface.initialize();
        this.buildIniState();
        this.balls = new BallGPU(this.surface,this.numBalls,this.iniState,this.params.error);
    }

    //to reset the initial state of a geodesic given position on boundary and angle
    buildIniState(){
        let pos = new Vector2(this.surface.domain.u.min + 2.*this.params.error, this.params.pos);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.dir),Math.sin(3.1415/2*this.params.dir)).multiplyScalar(2);
        this.iniState =  new State(pos,vel);
    }


    addToScene(scene){
        this.plot.addToScene(scene);
        this.balls.addToScene(scene);
    }

    addToUI(ui){

        let billiards = this;
        let params = billiards.params;

        let resetScene = function(){
            billiards.plot.update();
            billiards.balls.initialize();
        };

        billiards.surface.buildUIFolder(ui,resetScene);
        ui.add(params,'gravity',0,5,0.01).name('Gravity').onChange(function(value){
            params.gravity=value;
            billiards.surface.gravity=value;
            billiards.surface.initialize();
            resetScene();
        });

        let trailFolder = ui.addFolder('Billiard');
        trailFolder.close();

        trailFolder.add(params, 'pos', billiards.surface.domain.v.min, billiards.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.trailPos = value;
                let iniState = billiards.buildIniState();
                billiards.balls.updateState(iniState);
            });

        trailFolder.add(params,'dir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.trailDir = value;
                let iniState = billiards.buildIniState();
                billiards.balls.updateState(iniState);

            });
    }

    tick(time,dTime){

            //  for(let i=0;i<this.params.simSpeed;i++){
            this.balls.stepForward();
            // }
        }

}


export default BilliardChaos;
