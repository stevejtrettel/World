import {Vector3} from "../../../3party/three/build/three.module.js";

import RiemannSum from "../../components/calculus/RiemannSum.js";
import Graph2D from "../../components/calculus/Graph2D.js";
import {Rod} from "../../components/basic-shapes/Rod.js";
import Graph2DIntegral from "../../components/calculus/Graph2DIntegral.js";
import {BlackBoard} from "../../components/basic-shapes/Blackboard.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();



class AreaFunctionPlotter{
    constructor(fnText, range ){

        this.N = 1000;

        this.params = {
            xMin: range.min,
            xMax: range.max,

            x:0.75,

            a:1,
            b:1,
            c:1,

            time:0,
            curveText: fnText,

            showCurve:true,
            showAccumulate:false,

        };

        //define the function which gives our curve:
        let func = parser.evaluate('curve(x,t,a,b,c)='.concat(this.params.curveText));

        //the function with all the variables:
        this.curve = function(x, params={time:0,a:0,b:0,c:0}){
            let y = func(x, params.time, params.a, params.b, params.c);
            return y;
        }

        let graphOptions = {
            domain:range,
            radius:0.03,
            res:300,
            f: this.curve,
            color: 0xffffff,
        };

        this.functionGraph = new Graph2D(graphOptions);
        this.functionGraph.setPosition(0,0,-3);

        this.antiderivative = new Graph2DIntegral(graphOptions);



        //draw the bargraph:
        //this range is different (as it depends on the parameter x):
        let bgRange = {min: this.params.xMin, max: this.params.xMin + this.params.x * (this.params.xMax-this.params.xMin)};
        this.riemannSum = new RiemannSum(this.curve, bgRange, this.N);
        this.riemannSum.setPosition(0,0,-3);


        //draw a vertical bar at the point we are measuring: (for the antiderivative)
        let xRescaled = this.params.xMin + this.params.x * (this.params.xMax - this.params.xMin);
        let rodOptions = {
            end1: new Vector3(xRescaled,0,0),
            end2: new Vector3(xRescaled, this.antiderivative.getIntegral(),0),
            color: 0xe8c156,//a yellow
        }
        this.currentValue = new Rod(rodOptions);



        //draw the blackboard this is all taking place on:
        let boardOptions = {
            xRange: range,
            yRange: range,
        }
        this.blackboard = new BlackBoard(boardOptions);




    }

    addToScene(scene){
        this.riemannSum.addToScene(scene);
        this.functionGraph.addToScene(scene);
        this.antiderivative.addToScene(scene);
        this.blackboard.addToScene(scene);
        this.currentValue.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;
        let thisBarGraph = this.riemannSum;
        let thisFunctionGraph = this.functionGraph;
        let thisAntideriv = this.antiderivative;

        let domainFolder =ui.addFolder('Domain');

        domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
            let rng = {min: value, max: thisObj.params.xMax};
            let bgRange = {min: value, max: value + thisObj.params.x *(thisObj.params.xMax - value)};
            thisBarGraph.setRange(bgRange);
            thisFunctionGraph.setDomain(rng);
            thisAntideriv.setDomain(rng);
        });

        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let rng = {min: thisObj.params.xMin, max: value};
            let bgRange = {min: thisObj.params.xMin, max: thisObj.params.xMin + thisObj.params.x *(value - thisObj.params.xMin)};
            thisBarGraph.setRange(bgRange);
            thisFunctionGraph.setDomain(rng);
            thisAntideriv.setDomain(rng);
        });

        // ui.add(this.params,'showCurve').onChange(
        //     function(value){
        //         thisFunctionGraph.setVisibility(value);
        //     }
        // );


        ui.add(this.params,'curveText').name('y=').onFinishChange(
            function(value){
                thisObj.params.curveText=value;
                let curve = parser.evaluate('curve(x,t,a,b,c)='.concat(thisObj.params.curveText));
                let eqn = function(x,params={time:0,a:0,b:0,c:0}){
                    let y = curve(x, params.time,params.a,params.b,params.c);
                    return y;
                }

                thisObj.params.time=0;
                thisObj.curve = eqn;
                thisBarGraph.setCurve(eqn);
                thisAntideriv.setFunction(eqn);
                thisFunctionGraph.setFunction(eqn);

            }
        );

        ui.add(this.params, 'x', 0,1,0.001).name('x').onChange(function(value){

            let xRescaled = thisObj.params.xMin + value *(thisObj.params.xMax-thisObj.params.xMin);
            let range = {min: thisObj.params.xMin, max: xRescaled  };
            thisBarGraph.setRange(range);

        });

        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){

        });

        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){

        });

        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){

        });
    }

    tick(time,dTime){
        this.params.time += dTime;

        //this is for free basically: not re-making any geometries
        this.riemannSum.update(this.params);

        //really should only do this if stuff is changing:
        this.antiderivative.update(this.params);
        this.functionGraph.update(this.params);

        let xResize =  this.params.xMin + this.params.x * (this.params.xMax - this.params.xMin);
        let end1 = new Vector3(xResize, 0,0);
        let end2 = new Vector3(xResize, this.riemannSum.getValue(),0);
        this.currentValue.resize(end1,end2);

    }
}









let fnText = 'cos(x)+x/(1+x*x)';
let range = { min:-10,max:10};

let example = new AreaFunctionPlotter(fnText, range );

export default {example};
