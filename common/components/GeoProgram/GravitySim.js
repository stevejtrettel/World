import {Vector2} from "../../../3party/three/build/three.module.js";

import PlotGPU from "./Plot/PlotGPU.js";
import State from "./Integrator/State.js";
import Geodesic from "./Geodesics/Geodesic.js";
import Surface from "./Surface/Surface.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();

class SurfaceGravity extends Surface {
    constructor(domain) {
        super(domain);
    }
    setParamData(){
        this.params = {
            a: 2,
            b: 1.5,
            c: 0,
            gravity:0,
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
            c: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'c'
            },
            gravity: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'gravity'
            }
        };
    }

    setFunctionData() {
        super.setFunctionData();

        let a = this.params.a;
        let b = this.params.b;
        let c = this.params.c;

        this.name = 'SurfaceGravity';
        let func = parser.evaluate('f(u,v,a,b,c)='.concat(this.params.func));
        //the function with all the variables:
        this.F = function(u,v){
            let z = func(u,v, a,b,c);
            return z;
        }
    }


    buildUIFolder(ui, resetScene) {
        super.buildUIFolder(ui, resetScene);

        let surf = this;
        let a = this.params.a;
        let b = this.params.b;
        let c = this.params.c;
        //now add in a text box for the function
        ui.add(surf.params,'func').name(`f(u,v)=`).onFinishChange(
            function(value){
                surf.params.func = value;
                let func = parser.evaluate('f(u,v,a,b,c)='.concat(surf.params.func));
                surf.F = function(u,v){
                    let z = func(u,v, a,b,c);
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

            geoPos: 0,
            geoDir: 0,
            geoVisible: false,

        }

        let iniState = this.buildGeodesicIniState();
        this.geodesic = new Geodesic(this.surface,iniState);

    }



    //to reset the initial state of a geodesic given position on boundary and angle
    buildGeodesicIniState(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.geoPos);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.geoDir),Math.sin(3.1415/2*this.params.geoDir));
        return new State(pos,vel);
    }


    addToScene(scene){
        this.plot.addToScene(scene);
        this.geodesic.addToScene(scene);

        this.geodesic.setVisibility(this.params.geoVisible);
    }

    addToUI(ui){

        let woodCut = this;
        let params = woodCut.params;


        let resetScene = function(){
            woodCut.plot.update();
            woodCut.geodesic.updateSurface();
        };
        woodCut.surface.buildUIFolder(ui,resetScene);
        let geoFolder = ui.addFolder('Geodesic');
        geoFolder.close();



        geoFolder.add(params,'geoVisible').onChange(
            function(value){
                woodCut.params.geoVisible = value;
                woodCut.geodesic.setVisibility(value);
            });


        geoFolder.add(params, 'geoPos', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.geoPos = value;
                let iniState = woodCut.buildGeodesicIniState();
                woodCut.geodesic.update(iniState);
            });
        geoFolder.add(params,'geoDir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.geoDir = value;
                let iniState = woodCut.buildGeodesicIniState();
                woodCut.geodesic.update(iniState);
            });

    }

    tick(time,dTime){
        // let iniState = new State(new Vector2(2,-1),new Vector2(-1,Math.cos(time)));
        // this.geodesic.update({iniState:iniState});
        // this.stripes.update({time:time});
        //this.spray.update({time:time});
    }



}


export default GravitySim;
