import {Vector2} from "../../../3party/three/build/three.module.js";


import PlotGPU from "./Plot/PlotGPU.js";
import State from "./Integrator/State.js";
import Geodesic from "./Geodesics/Geodesic.js";
import BallTrail from "./Geodesics/Ball.js";
import BilliardPath from "./Geodesics/BilliardPath.js";

class Billiards{
    constructor(surface) {

        this.surface = surface;
        this.plot = new PlotGPU(this.surface);

        //parameters the UI will control!
        this.params = {
            surface: this.surface,
            maxReflections:8,
            simSpeed:3,
            gravity:1,
            trailPos: 0,
            trailDir: 0,

            billiardVisible:true,
            trajectoryVisible: false,
        }

        if(this.surface.gravity) {
            this.params.gravity=this.surface.gravity;
        }
        else{
            this.surface.gravity = this.params.gravity;
        }
        this.surface.initialize();

        let iniState = this.buildTrailIniState();
        this.trajectory = new BilliardPath(this.surface,iniState);
        this.billiard = new BallTrail(this.surface, iniState);
    }

    //to reset the initial state of a geodesic given position on boundary and angle
    buildTrailIniState(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.trailPos);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.trailDir),Math.sin(3.1415/2*this.params.trailDir));
        return new State(pos,vel);
    }


    addToScene(scene){
        this.plot.addToScene(scene);
        this.trajectory.addToScene(scene);
        this.trajectory.setVisibility(this.params.trajectoryVisible);
        this.billiard.addToScene(scene);
        this.billiard.setVisibility(this.params.billiardVisible)
    }

    addToUI(ui){

        let woodCut = this;
        let params = woodCut.params;

        let resetScene = function(){
            woodCut.plot.update();
            woodCut.trajectory.update();
        };

        woodCut.surface.buildUIFolder(ui,resetScene);
        ui.add(params,'gravity',0,5,0.01).name('Gravity').onChange(function(value){
           params.gravity=value;
           woodCut.surface.gravity=value;
           woodCut.surface.initialize();
           resetScene();
        });

        let trailFolder = ui.addFolder('Billiard');
        trailFolder.close();



        trailFolder.add(params, 'trajectoryVisible').name('ShowTrajectory').onChange(function(value){
            params.trajectoryVisible=value;
            woodCut.trajectory.setVisibility(value);

            params.billiardVisible=!value;
            woodCut.billiard.setVisibility(!value);
        });

        trailFolder.add(params, 'trailPos', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.trailPos = value;
                let iniState = woodCut.buildTrailIniState();
                if(woodCut.params.trajectoryVisible) {
                    woodCut.trajectory.updateState(iniState);
                }
                if(woodCut.params.billiardVisible) {
                    woodCut.billiard.updateState(iniState);
                }
            });

        trailFolder.add(params,'trailDir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.trailDir = value;
                let iniState = woodCut.buildTrailIniState();
                if(woodCut.params.trajectoryVisible) {
                    woodCut.trajectory.updateState(iniState);
                }
                if(woodCut.params.billiardVisible) {
                    woodCut.billiard.updateState(iniState);
                }
            });

        trailFolder.add(params, 'maxReflections', 0,20,1).name('Reflections').onChange(
            function(value){
                params.maxReflections = value;
                woodCut.trajectory.curveOptions.maxReflections=value;
                if(woodCut.params.trajectoryVisible){
                    woodCut.trajectory.update();
                }
            });

    }

    tick(time,dTime){
        if(this.params.billiardVisible) {
            this.billiard.stepForward();
        }
    }

}


export default Billiards;
