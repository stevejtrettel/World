import {Vector2} from "../../../3party/three/build/three.module.js";

import PlotGPU from "./Plot/PlotGPU.js";
import State from "./Integrator/State.js";
import Geodesic from "./Geodesics/Geodesic.js";
import BallTrail from "./Geodesics/Ball.js";
import Surface from "./Surface/Surface.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();

class SurfaceGravity extends Surface {
    constructor(domain) {
        super(domain);
    }
    setParamData(){
        this.gravity=1;
        this.params = {
            a: 2,
            b: 1.5,
            c: 0,
            func: `a*(sin(b*u)+sin(b*v))/(1+u*u+v*v)`
        };

        this.paramData = {
            a: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'a'
            },
            b: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'b'
            },
        };
    }

    setFunctionData() {
        super.setFunctionData();

        let a = this.params.a;
        let b = this.params.b;

        this.name = 'SurfaceGravity';
        let func = parser.evaluate('f(u,v,a,b)='.concat(this.params.func));
        //the function with all the variables:
        this.F = function(u,v){
            let z = func(u,v, a,b);
            return z;
        }
    }


    buildUIFolder(ui, resetScene) {
        super.buildUIFolder(ui, resetScene);

        let surf = this;
        let a = this.params.a;
        let b = this.params.b;
        //now add in a text box for the function
        ui.add(surf.params,'func').name(`f(u,v)=`).onFinishChange(
            function(value){
                surf.params.func = value;
                let func = parser.evaluate('f(u,v,a,b)='.concat(surf.params.func));
                surf.F = function(u,v){
                    let z = func(u,v, a,b);
                    return z;
                }
                surf.update({});
                resetScene();
            });
    }
}










class GravitySim{
    constructor() {

        this.surface = new SurfaceGravity();
        this.plot = new PlotGPU(this.surface);

        //parameters the UI will control!
        let sim = this;
        this.params = {
            surface: this.surface,
            simSpeed:3,
            gravity:1,
            trailPos: 0,
            trailDir: 0,
            trailVisible: true,
        }

        this.surface.gravity=this.params.gravity;
        this.surface.initialize();

        let iniState = this.buildTrailIniState();
        this.trail = new BallTrail(this.surface,iniState);
    }



    //to reset the initial state of a geodesic given position on boundary and angle
    buildTrailIniState(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.trailPos);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.trailDir),Math.sin(3.1415/2*this.params.trailDir));
        return new State(pos,vel);
    }


    addToScene(scene){
        this.plot.addToScene(scene);
        this.trail.addToScene(scene);
    }

    addToUI(ui){

        let woodCut = this;
        let params = woodCut.params;


        let resetScene = function(){
            woodCut.plot.update();
            woodCut.trail.updateSurface();
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


        // trailFolder.add(params,'trailVisible').onChange(
        //     function(value){
        //         woodCut.params.trailVisible = value;
        //         woodCut.trail.setVisibility(value);
        //     });

        trailFolder.add(params, 'trailPos', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.trailPos = value;
                let iniState = woodCut.buildTrailIniState();
                woodCut.trail.update(iniState);
            });

        trailFolder.add(params,'trailDir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.trailDir = value;
                let iniState = woodCut.buildTrailIniState();
                woodCut.trail.update(iniState);
            });

        trailFolder.add(params,'simSpeed',1,10,1).name('SimSpeed').onChange(
            function(value){
                params.simSpeed = value;
            });

    }

    tick(time,dTime){
        for(let i=0;i<this.params.simSpeed;i++) {
            this.trail.stepForward();
        }
    }



}


export default GravitySim;
