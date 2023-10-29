import {Vector2} from "../../../3party/three/build/three.module.js";


import PlotGPU from "./Plot/PlotGPU.js";
import State from "./Integrator/State.js";
import Geodesic from "./Geodesics/Geodesic.js";
import BallTrail from "./Geodesics/Ball.js";
import BallStripes from "./Geodesics/BallStripes.js";


class GravitySim{
    constructor(surface) {

        this.surface = surface;
        this.plot = new PlotGPU(this.surface);

        //parameters the UI will control!
        this.params = {
            surface: this.surface,
            simSpeed:3,
            gravity:1,
            trailPos: 0,
            trailDir: 0,
            trailVisible: true,

            stripeNum:5,
            stripeDir:0,
            stripeSpread:0.35       ,
            stripePos:0,
            stripeVisible:true,
        }

        if(this.surface.gravity) {
            this.params.gravity=this.surface.gravity;
        }
        else{
            this.surface.gravity = this.params.gravity;
        }
        this.surface.initialize();

       // let iniState = this.buildTrailIniState();
        //this.trail = new BallTrail(this.surface,iniState);

        let iniStripes = this.buildStripeIniData();
        this.stripes = new BallStripes(this.surface,iniStripes);

    }



    //to reset the initial state of a geodesic given position on boundary and angle
    buildTrailIniState(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.trailPos);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.trailDir),Math.sin(3.1415/2*this.params.trailDir));
        return new State(pos,vel);
    }

    //build the data needed to be fed into geodesic stripe
    buildStripeIniData(){
        return {
            N: this.params.stripeNum,
            angle: this.params.stripeDir,
            spread:this.params.stripeSpread,
            pos: this.params.stripePos,
        };
    }


    addToScene(scene){
        this.plot.addToScene(scene);
        //this.trail.addToScene(scene);
        this.stripes.addToScene(scene);

       // this.trail.setVisibility(this.params.trailVisible);
        this.stripes.setVisibility(this.params.stripeVisible);
    }

    addToUI(ui){

        let woodCut = this;
        let params = woodCut.params;


        let resetScene = function(){
            woodCut.plot.update();
            //woodCut.trail.updateSurface();
            woodCut.stripes.updateSurface();
        };
       // woodCut.surface.buildUIFolder(ui,resetScene);
        // ui.add(params,'gravity',0,5,0.01).name('Gravity').onChange(function(value){
        //    params.gravity=value;
        //    woodCut.surface.gravity=value;
        //    woodCut.surface.initialize();
        //    resetScene();
        // });
       // let trailFolder = ui.addFolder('Billiard');
       // let stripeFolder = ui.addFolder('Multiple');
       // trailFolder.close();
       // stripeFolder.close();

        // trailFolder.add(params,'trailVisible').onChange(
        //     function(value){
        //         woodCut.params.trailVisible = value;
        //         woodCut.trail.setVisibility(value);
        //     });
        // trailFolder.add(params, 'trailPos', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
        //     function(value){
        //         params.trailPos = value;
        //         let iniState = woodCut.buildTrailIniState();
        //         woodCut.trail.update(iniState);
        //     });
        //
        // trailFolder.add(params,'trailDir',-1,1,0.01).name('Direction').onChange(
        //     function(value){
        //         params.trailDir = value;
        //         let iniState = woodCut.buildTrailIniState();
        //         woodCut.trail.update(iniState);
        //     });
        //
        // trailFolder.add(params,'simSpeed',1,10,1).name('SimSpeed').onChange(
        //     function(value){
        //         params.simSpeed = value;
        //     });



        ui.add(params,'stripeVisible').onChange(
            function(value){
                woodCut.params.stripeVisible = value;
                woodCut.stripes.setVisibility(value);
            });

        ui.add(params,'stripeNum',0,15,1).name('Number').onChange(
            function(value){
                params.stripeNum = value;
                woodCut.stripes.update({N:params.stripeNum});
            });

        ui.add(params,'stripeDir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.stripeDir = value;
                woodCut.stripes.update({angle:params.stripeDir});
            });

        ui.add(params,'stripeSpread',0,1,0.01).name('Spread').onChange(
            function(value){
                params.stripeSpread = value;
                woodCut.stripes.update({spread:params.stripeSpread});
            });

        ui.add(params,'stripePos',woodCut.surface.domain.v.min,woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.stripePos = value;
                woodCut.stripes.update({pos:params.stripePos});
            });


    }

    tick(time,dTime){
        //for(let i=0;i<this.params.simSpeed;i++) {
            //this.trail.stepForward();
       // }
            this.stripes.stepForward();

    }



}


export default GravitySim;
