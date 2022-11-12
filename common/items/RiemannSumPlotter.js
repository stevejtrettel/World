import {
    CatmullRomCurve3,
    Vector2,
    Vector3,
    DoubleSide,
    SphereBufferGeometry,
    MeshPhysicalMaterial,
    Mesh
} from "../../3party/three/build/three.module.js";

import { getRange } from "../math/functions_singleVar.js";
import RiemannSum from "../components/Calculus/RiemannSum.js";
import Graph2D from "../components/Calculus/Graph2D.js";

import { GlassPanel } from "../components/calculus/GlassPanel.js";


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();

class RiemannSumPlotter{
    constructor(range,N){

        this.params = {
            xMin: range.min,
            xMax: range.max,

            N:N,

            a:1,
            b:1,
            c:1,

            time:0,

            curveText: 'cos(x)+x/(1+x*x)',

            showCurve:true,

            reset: function(){
                console.log('reset');
            }
        };

        // this.blackboard = new GlassPanel({
        //     xRange: range.x,
        //     yRange: range.y,
        // });


        //define the function which gives our curve:
        let func = parser.evaluate('curve(x,t,a,b,c)='.concat(this.params.curveText));

        //the function with all the variables:
        this.curve = function(x, params={time:0,a:0,b:0,c:0}){
            let y = func(x, params.time, params.a, params.b, params.c);
            return y;
        }

        this.riemannSum = new RiemannSum(this.curve, range, N);


        let graphOptions = {
            domain:range,
            radius:0.03,
            res:300,
            f: this.curve,
            color: 0xffffff,
        };

        this.functionGraph = new Graph2D(graphOptions);

    }

    addToScene(scene){
        this.riemannSum.addToScene(scene);
        this.functionGraph.addToScene(scene);
        //this.blackboard.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;
       // let thisBoard = this.blackboard;
        let thisBarGraph = this.riemannSum;
        let thisFunctionGraph = this.functionGraph;

        let domainFolder =ui.addFolder('Domain');

        domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
            let rng = {
                x:{min:value,max:thisBarGraph.range.max},
            };
            thisBarGraph.setRange(rng);
        });

        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let rng = {
                x:{min: thisBarGraph.range.min, max: value}
            };
            thisBarGraph.setRange(rng);
        });

        ui.add(this.params,'N', 1,thisBarGraph.totalCount,1).name('Number of Rectangles').onChange(function(value){
           thisBarGraph.setN(value);
        });

        ui.add(this.params,'curveText').name('y=');

        ui.add(this.params, 'reset').onChange(
            function(){

                let curve = parser.evaluate('curve(x,t,a,b,c)='.concat(thisObj.params.curveText));
                let eqn = function(x,params={time:0,a:0,b:0,c:0}){
                    let y = curve(x, params.time,params.a,params.b,params.c);
                    return y;
                }

                thisObj.curve = eqn;
                thisBarGraph.setCurve(eqn);
                thisFunctionGraph.setFunction(eqn);

            }
        );


        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('a').onChange(function(value){
        });

        ui.add(this.params,'showCurve').onChange(
            function(value){
                thisFunctionGraph.setVisibility(value);
            }
        )

    }

    tick(time,dTime){
        this.params.time=time;
        this.riemannSum.update(this.params);

        //only do this computation if the curve is visible!
        //otherwise its a waste
        if(this.params.showCurve) {
            this.functionGraph.update(this.params);
        }
    }
}










let range = { min:-10,max:10};
let N = 100;

let example = new RiemannSumPlotter(range, N);

export default {example};