import {
    CatmullRomCurve3,
    Vector3,
    DoubleSide,
    SphereBufferGeometry,
    MeshPhysicalMaterial,
    Mesh
} from "../../../3party/three/build/three.module.js";

import RungeKuttaParams from "../../compute/cpu/RungeKuttaParams.js";
import {colorConversion} from "../../shaders/colors/colorConversion.js";
import {ParametricTube} from "../../compute/materials/ParametricTube.js";


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();

class SlopeFieldIntegralCurve{

    constructor(yPrime, iniCond, range) {

        this.yPrime = yPrime;
        this.iniCond = iniCond;
        this.N =1024.;
        this.range=range;

        //make the curve into a tube:
        const curveOptions = {
            segments: 1024,
            radius: 0.02,
            tubeRes: 32,
        };
        let fragment = {
            aux: colorConversion,
            fragColor: `
            vec3 fragColor(){ 
                return vec3(1,1,1);
             //  return hsb2rgb(vec3(vUv.x, 0.65, 0.4));
            }`,
        };


        let sphere =  new SphereBufferGeometry(1.25*curveOptions.radius,32,16);
        let sphereMat = new MeshPhysicalMaterial();
        this.start = new Mesh(sphere,sphereMat);
        this.end = new Mesh(sphere, sphereMat);

        //set up the integrator and the curve
        this.integrator = new RungeKuttaParams(this.yPrime, 0.03);
        this.curve = null;

        //initialize the curve
        this.computeCurve();



        let matOptions = {
            side:DoubleSide,
            clearcoat:0.8,
            metalness:0.2,
        }

        this.tube = new ParametricTube( this.curve, curveOptions, fragment, {},matOptions);

        let startPt = this.curve.getPoint(0);
        this.start.geometry.translate(startPt.x,startPt.y,startPt.z);
        let endPt = this.curve.getPoint(1);
        this.end.geometry.translate(endPt.x,endPt.y,endPt.z);

    }

    computeCurve(params={a:0,b:0,c:0,time:0}){

        let pts = [];
        let currentState = this.iniCond.clone();

        for(let i=0; i<this.N; i++){

            currentState = this.integrator.step(currentState, params);

            if(currentState.x>this.range.x.max) {
                pts.push(new Vector3(this.range.x.max,currentState.y,0.1));
                break;
            }
            else if(currentState.x<this.range.x.min) {
                pts.push(new Vector3(this.range.x.min,currentState.y,0.1));
                break;
            }
            else if(currentState.y>this.range.y.max){
                pts.push(new Vector3(currentState.x,this.range.y.max,0.1));
                break;
            }
            else if(currentState.y<this.range.y.min){
                pts.push(new Vector3(currentState.x,this.range.y.min,0.1));
                break;
            }
            pts.push(new Vector3(currentState.x,currentState.y,0.1));
        }
        this.curve = new CatmullRomCurve3(pts);

        //reposition the end balls of the curve
        let startPt = this.curve.getPoint(0);
        this.start.geometry.translate(startPt.x,startPt.y,startPt.z);

        let endPt = this.curve.getPoint(1);
        this.end.geometry.translate(endPt.x,endPt.y,endPt.z);

    }

    resetCurve(curve){
        this.tube.resetCurve(curve);
    }

    setPosition(x,y,z){
        this.tube.setPosition(x,y,z);
        this.start.position.set(x,y,z);
        this.end.position.set(x,y,z);
    }

    addToScene( scene ) {
        this.tube.addToScene( scene );
        scene.add(this.start);
        scene.add(this.end);
    }

    setYPrime(eqn){
        this.yPrime=eqn;
        this.integrator.setDerive(this.yPrime);
    }

    setRange(rng){
        this.range=rng;
    }

    setInitialCondition(iniCond){
        this.iniCond = iniCond;
    }

    setVisibility(value){
        this.tube.mesh.visible=value;
        this.start.visible=value;
        this.end.visible=value;
    }

}


export default SlopeFieldIntegralCurve;