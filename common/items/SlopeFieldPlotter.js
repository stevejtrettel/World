import {
    CatmullRomCurve3,
    Vector2,
    Vector3,
    DoubleSide,
    SphereBufferGeometry,
    MeshPhysicalMaterial,
    Mesh
} from "../../3party/three/build/three.module.js";

import RungeKuttaParams from "../cpu/RungeKuttaParams.js";
import SlopeField from "../components/calculus/SlopeField.js";
import { GlassPanel } from "../components/calculus/GlassPanel.js";
import {colorConversion} from "../shaders/colors/colorConversion.js";
import {ParametricTube} from "../objects/ParametricTube.js";


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


class SlopeFieldIntegralCurve{

    constructor(yPrime, iniCond, range) {

        this.yPrime = yPrime;
        this.iniCond = iniCond;
        this.N =400.;
        this.range=range;

        //make the curve into a tube:
        const curveOptions = {
            segments: 1024,
            radius: 0.05,
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

        this.visibility = true;


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
        this.start.position.set(startPt.x,startPt.y,startPt.z);
        let endPt = this.curve.getPoint(1);
        this.end.position.set(endPt.x,endPt.y,endPt.z);

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
        this.start.position.set(startPt.x,startPt.y,startPt.z);

        let endPt = this.curve.getPoint(1);
        this.end.position.set(endPt.x,endPt.y,endPt.z);

    }

    resetCurve(curve){
        this.tube.resetCurve(curve);
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

    toggleVisibility(){
        this.visibility = !this.visibility;
        this.tube.mesh.visible=this.visibility;
        this.start.visible=this.visibility;
        this.end.visible=this.visibility;
    }

}



class SlopeFieldPlotter{
    constructor( range, res ){

        this.blackboard = new GlassPanel({
            xRange: range.x,
            yRange: range.y,
        });

        this.params = {
            xMin: range.x.min,
            xMax: range.x.max,
            yMin: range.y.min,
            yMax: range.y.max,

            initialX:0,
            initialY:0,

            a:1,
            b:1,
            c:1,

            time:0,

            yPrimeText: 'sin(x*y+t)',

            showCurve: true,

            reset: function(){
                console.log('reset');
            }
        };

        let yC = parser.evaluate('yPrime(x,y,t,a,b,c)='.concat(this.params.yPrimeText));

        this.yPrime = function(pos,params){
            let x = 1;
            let y = yC(pos.x,pos.y, params.time,params.a,params.b,params.c);
            return new Vector2(x,y);
        }

         this.slopeField = new SlopeField(this.yPrime, range, res);
         this.iniCond = new Vector2(0,0);
         this.integralCurve = new SlopeFieldIntegralCurve(this.yPrime, this.iniCond, range);
    }

    addToScene(scene){
        this.slopeField.addToScene(scene);
        this.blackboard.addToScene(scene);
        this.integralCurve.addToScene(scene);
    }

    addToUI(ui){
        let domainFolder = ui.addFolder('Domain');


        let thisObj = this;
        let thisField = this.slopeField;
        let thisCurve = this.integralCurve;


        domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
            let rng = {
                x:{min:value,max:thisField.range.x.max},
                y:{min:thisField.range.y.min, max:thisField.range.y.max}
            };
            thisField.setRange(rng);
            thisCurve.setRange(rng);
        });


        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let rng = {
                x:{min: thisField.range.x.min, max: value},
                y:{min: thisField.range.y.min, max: thisField.range.y.max}
            };
            thisField.setRange(rng);
            thisCurve.setRange(rng);
        });

        domainFolder.add(this.params, 'yMin', -10, 10, 0.01).name('yMin').onChange(function(value){
            let rng = {
                x:{min:thisField.range.x.min, max: thisField.range.x.max},
                y:{min:value, max:thisField.range.y.max}
            };
            thisField.setRange(rng);
            thisCurve.setRange(rng);
        });

        domainFolder.add(this.params, 'yMax', -10, 10, 0.01).name('yMin').onChange(function(value){
            let rng = {
                x:{min:thisField.range.x.min, max: thisField.range.x.max},
                y:{min:thisField.range.y.min, max:value }
            };
            thisField.setRange(rng);
            thisCurve.setRange(rng);
        });




        let curveFolder = ui.addFolder('IntegralCurve');

        curveFolder.add(this.params,'initialX',-10,10,0.01).name('x0').onChange(
            function(value){
                let iniCond = new Vector2(value,thisObj.iniCond.y);
                thisCurve.setInitialCondition(iniCond);
                thisCurve.computeCurve(thisObj.params);
                thisCurve.resetCurve(thisCurve.curve);
            }
        );
        curveFolder.add(this.params,'initialY',-10,10,0.01).name('y0').onChange(
            function(value){
                let iniCond = new Vector2(thisObj.iniCond.x,value);
                thisCurve.setInitialCondition(iniCond);
                thisCurve.computeCurve(thisObj.params);
                thisCurve.resetCurve(thisCurve.curve);
            }
        );

        curveFolder.add(this.params,'showCurve').onChange(
            function(value){
                thisCurve.toggleVisibility();
            }
        )




        ui.add(this.params,'yPrimeText').name('yPrime=');

        ui.add(this.params, 'reset').onChange(
            function(){

                let yC = parser.evaluate('yPrime(x,y,t,a,b,c)='.concat(thisObj.params.yPrimeText));

                let eqn = function(pos,params){
                    let x = 1;
                    let y = yC(pos.x,pos.y,params.time,params.a,params.b,params.c);
                    return new Vector2(x,y);
                }

                thisObj.yPrime = eqn;
                thisField.setYPrime(eqn);
                thisCurve.setYPrime(eqn);
            }
        )

        let paramFolder = ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
        });

    }

    tick(time,dTime){

        this.params.time=time;
        this.slopeField.update(this.params);

        this.integralCurve.computeCurve(this.params);
        this.integralCurve.resetCurve(this.integralCurve.curve);

    }

}



let range = {
    x:{ min:-10,max:10},
    y:{min:-10,max:10},
};

let res = {x:100,y:100};

let example = new SlopeFieldPlotter(range, res);

export default {example};

export { SlopeFieldIntegralCurve };



