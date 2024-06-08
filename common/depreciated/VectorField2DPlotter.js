import {
    CatmullRomCurve3,
    Vector2,
    Vector3,
    DoubleSide,
    SphereBufferGeometry,
    MeshPhysicalMaterial,
    Mesh
} from "../../3party/three/build/three.module.js";

import {SlopeFieldIntegralCurve } from "../diffeqs/SlopeFieldPlotter.js";
import VectorField2D from "../../components/VectorCalculus/VectorField2D.js";
import { GlassPanel } from "../components/basic-shapes/GlassPanel.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


class VectorField2DPlotter{
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

            res: 50,

            a:1,
            b:1,
            c:1,

            time:0,

            xPrimeText: 'cos(x)+sin(y)+sin(x+y+t)',
            yPrimeText: 'sin(x*y+t)',

            showCurve: false,

            // reset: function(){
            //     console.log('reset');
            // }
        };

        let xC = parser.evaluate('xPrime(x,y,t,a,b,c)='.concat(this.params.xPrimeText));
        let yC = parser.evaluate('yPrime(x,y,t,a,b,c)='.concat(this.params.yPrimeText));

        this.vectorFieldEqn = function(pos, params={time:0,a:0,b:0,c:0}){
            let x = xC(pos.x,pos.y,params.time,params.a,params.b,params.c);
            let y = yC(pos.x,pos.y,params.time,params.a,params.b,params.c);
            return new Vector2(x,y);
        }

        this.vectorField = new VectorField2D(this.vectorFieldEqn, range, res);
        this.iniCond = new Vector2(0,0);

        this.integralCurve = new SlopeFieldIntegralCurve(this.vectorFieldEqn, this.iniCond, range);
        this.integralCurve.setVisibility(this.params.showCurve);

    }

    addToScene(scene){
        this.vectorField.addToScene(scene);
        this.blackboard.addToScene(scene);
        this.integralCurve.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;
        let thisBoard = this.blackboard;
        let thisField = this.vectorField;
        let thisCurve = this.integralCurve;

        //
        // let domainFolder =ui.addFolder('Domain');
        //
        //
        // domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
        //     let rng = {
        //         x:{min:value,max:thisField.range.x.max},
        //         y:{min:thisField.range.y.min, max:thisField.range.y.max}
        //     };
        //     thisField.setRange(rng);
        //     thisCurve.setRange(rng);
        // });
        //
        //
        // domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
        //     let rng = {
        //         x:{min: thisField.range.x.min, max: value},
        //         y:{min: thisField.range.y.min, max: thisField.range.y.max}
        //     };
        //     thisField.setRange(rng);
        //     thisCurve.setRange(rng);
        // });
        //
        // domainFolder.add(this.params, 'yMin', -10, 10, 0.01).name('yMin').onChange(function(value){
        //     let rng = {
        //         x:{min:thisField.range.x.min, max: thisField.range.x.max},
        //         y:{min:value, max:thisField.range.y.max}
        //     };
        //     thisField.setRange(rng);
        //     thisCurve.setRange(rng);
        // });
        //
        // domainFolder.add(this.params, 'yMax', -10, 10, 0.01).name('yMin').onChange(function(value){
        //     let rng = {
        //         x:{min:thisField.range.x.min, max: thisField.range.x.max},
        //         y:{min:thisField.range.y.min, max:value }
        //     };
        //     thisField.setRange(rng);
        //     thisCurve.setRange(rng);
        // });




        ui.add(this.params,'xPrimeText').name('xPrime=').onFinishChange(
            function(value){
                thisObj.params.xPrimeText = value;
                let xC = parser.evaluate('xPrime(x,y,t,a,b,c)='.concat(thisObj.params.xPrimeText));
                let yC = parser.evaluate('yPrime(x,y,t,a,b,c)='.concat(thisObj.params.yPrimeText));
                let eqn = function(pos,params={time:0,a:0,b:0,c:0}){
                    let x = xC(pos.x,pos.y,params.time,params.a,params.b,params.c);
                    let y = yC(pos.x,pos.y,params.time,params.a,params.b,params.c);
                    return new Vector2(x,y);
                }
                thisObj.vectorFieldEqn = eqn;
                thisField.setVectorField(eqn);
                thisCurve.setYPrime(eqn);
            }
        );


        //same function except it only does the change when you've altered the y coordinate
        ui.add(this.params,'yPrimeText').name('yPrime=').onFinishChange(
            function(value){
                thisObj.params.yPrimeText = value;
                let xC = parser.evaluate('xPrime(x,y,t,a,b,c)='.concat(thisObj.params.xPrimeText));
                let yC = parser.evaluate('yPrime(x,y,t,a,b,c)='.concat(thisObj.params.yPrimeText));
                let eqn = function(pos,params={time:0,a:0,b:0,c:0}){
                    let x = xC(pos.x,pos.y,params.time,params.a,params.b,params.c);
                    let y = yC(pos.x,pos.y,params.time,params.a,params.b,params.c);
                    return new Vector2(x,y);
                }
                thisObj.vectorFieldEqn = eqn;
                thisField.setVectorField(eqn);
                thisCurve.setYPrime(eqn);
            }
        );


        // ui.add(this.params,'yPrimeText').name('yPrime=');
        //
        //


        // ui.add(this.params, 'reset').onChange(
        //     function(){
        //
        //         let xC = parser.evaluate('xPrime(x,y,t,a,b,c)='.concat(thisObj.params.xPrimeText));
        //         let yC = parser.evaluate('yPrime(x,y,t,a,b,c)='.concat(thisObj.params.yPrimeText));
        //
        //          let eqn = function(pos,params){
        //             let x = xC(pos.x,pos.y,params.time,params.a,params.b,params.c);
        //             let y = yC(pos.x,pos.y,params.time,params.a,params.b,params.c);
        //             return new Vector2(x,y);
        //         }
        //
        //         thisObj.vectorFieldEqn = eqn;
        //         thisField.setVectorField(eqn);
        //         thisCurve.setYPrime(eqn);
        //     }
        // );


        ui.add(this.params, 'res', 10, 100, 1).name('res').onChange(function(value){
            let res ={ x: value, y:value};
            thisField.setRes(res);
        });

        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('a').onChange(function(value){
        });




        let curveFolder = ui.addFolder('IntegralCurve');

        curveFolder.add(this.params,'initialX',-10,10,0.01).onChange(
            function(value){
                let iniCond = new Vector2(value,thisObj.iniCond.y);
                thisCurve.setInitialCondition(iniCond);
                thisCurve.computeCurve(thisObj.params);
                thisCurve.resetCurve(thisCurve.curve);
            }
        );
        curveFolder.add(this.params,'initialY',-10,10,0.01).onChange(
            function(value){
                let iniCond = new Vector2(thisObj.iniCond.x,value);
                thisCurve.setInitialCondition(iniCond);
                thisCurve.computeCurve(thisObj.params);
                thisCurve.resetCurve(thisCurve.curve);
            }
        );

        curveFolder.add(this.params,'showCurve').onChange(
            function(value){
                thisCurve.setVisibility(value);
            }
        )



    }

    tick(time,dTime){

        this.params.time=time;
        this.vectorField.update(this.params);

        this.integralCurve.computeCurve(this.params);
        this.integralCurve.resetCurve(this.integralCurve.curve);

    }

}










let range = {
    x:{ min:-10,max:10},
    y:{min:-10,max:10},
};

let res = {x:100,y:100};

let example = new VectorField2DPlotter(range, res);

export default {example};
