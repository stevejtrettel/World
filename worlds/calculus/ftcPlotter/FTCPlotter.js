import {Vector3} from "../../../3party/three/build/three.module.js";

import RiemannSum from "../../../code/items/calculus/RiemannSum.js";
import Graph2D from "../../../code/items/calculus/Graph2D.js";
import {Rod} from "../../../code/items/basic-shapes/Rod.js";
import Graph2DIntegral from "../../../code/items/calculus/Graph2DIntegral.js";
import {BlackBoard} from "../../../code/items/basic-shapes/Blackboard.js";
import SecantLine from "../../../code/items/calculus/SecantLine.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();




//some useful functions for computing secant things:
function secantEndpts(x, h, y2, y1, length){
    const slope = (y2-y1)/h;
    const delta = Math.sqrt(1/(1+slope*slope))*length/2.;
    return {
        start: new Vector3(x-delta, y1 - slope * delta,0),
        end: new Vector3(x+delta,y1 + slope * delta,0),
    };
}



class FTCPlotter{
    constructor(fnText, range ){

        this.N = 1000;

        this.params = {
            xMin: range.min,
            xMax: range.max,

            x:0.75,
            h:2.,

            a:1,
            b:1,
            c:1,

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

        this.rescale = function(percent){
            let spread = this.params.xMax - this.params.xMin;
            return this.params.xMin + percent * spread;
        }

        //draw the graph and the antiderivative:
        this.functionGraph = new Graph2D(graphOptions);
        this.functionGraph.setPosition(0,0,-3);
        this.antiderivative = new Graph2DIntegral(graphOptions);

        //draw the bargraph:
        let bgRange = {min: this.rescale(this.params.x), max: this.rescale(this.params.x)+this.params.h};
        this.riemannSum = new RiemannSum(this.curve, bgRange, this.N);
        this.riemannSum.setPosition(0,0,-3);
        this.riemannSum.update(this.params);

        //draw a vertical bar at the point we are measuring: (for the antiderivative)
        let xRescale = this.rescale(this.params.x);
        let cvRod = {
            end1: new Vector3(xRescale,0,0),
            end2: new Vector3(xRescale, this.antiderivative.getIntegral(xRescale),0),
            color: 0xe8c156,//a yellow
            radius: 0.05,
        }
        this.currentValue = new Rod(cvRod);

        let xhRescale = xRescale + this.params.h;
        let nvRod ={
            end1: new Vector3(xhRescale,0,0),
            end2: new Vector3(xhRescale, this.antiderivative.getIntegral(xhRescale),0),
            color: 0xe8c156,//a yellow
            radius: 0.05,
        }
        this.nextValue = new Rod(nvRod);


        this.secLength = (this.params.xMax-this.params.xMin)/2.;
        let y2 = this.antiderivative.getIntegral(xhRescale);
        let y1 = this.antiderivative.getIntegral(xRescale)
        let secPts = secantEndpts(xRescale,this.params.h,y2,y1,this.secLength);
        let secRod = {
            end1: secPts.start,
            end2: secPts.end,
            color:0x9d6ef5,
            radius:0.05,
        }
        this.secant = new Rod(secRod);


        //draw the blackboard this is all taking place on:
        let boardOptions = {
            xRange: range,
            yRange: range,
        }
        this.blackboard = new BlackBoard(boardOptions);

    }


    update(){
        this.riemannSum.update(this.params);
        this.antiderivative.update(this.params);
        this.functionGraph.update(this.params);

        //reset the bars:
        let xRescale = this.rescale(this.params.x);
        let xhRescale = xRescale + this.params.h;
        let yx = this.antiderivative.getIntegral(xRescale);
        let yxh = this.antiderivative.getIntegral(xhRescale);

        this.currentValue.resize(new Vector3(xRescale,0,0), new Vector3(xRescale, yx,0));
        this.nextValue.resize(new Vector3(xhRescale,0,0), new Vector3(xhRescale, yxh,0));


        let secPts = secantEndpts(xRescale,this.params.h,yxh,yx,this.secLength);
        this.secant.resize(secPts.start,secPts.end);
    }


    addToScene(scene){
        this.riemannSum.addToScene(scene);
        this.functionGraph.addToScene(scene);
        this.antiderivative.addToScene(scene);
        this.blackboard.addToScene(scene);
        this.currentValue.addToScene(scene);
        this.nextValue.addToScene(scene);
        this.secant.addToScene(scene);
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

            thisObj.update();
        });

        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let rng = {min: thisObj.params.xMin, max: value};
            let bgRange = {min: thisObj.params.xMin, max: thisObj.params.xMin + thisObj.params.x *(value - thisObj.params.xMin)};
            thisBarGraph.setRange(bgRange);
            thisFunctionGraph.setDomain(rng);
            thisAntideriv.setDomain(rng);

            thisObj.update();
        });




        ui.add(this.params,'curveText').name('y=').onFinishChange(
            function(value) {
                thisObj.params.curveText = value;
                let curve = parser.evaluate('curve(x,t,a,b,c)='.concat(thisObj.params.curveText));
                let eqn = function (x, params = {time: 0, a: 0, b: 0, c: 0}) {
                    let y = curve(x, params.time, params.a, params.b, params.c);
                    return y;
                }

                thisObj.curve = eqn;
                thisBarGraph.setCurve(eqn);
                thisAntideriv.setFunction(eqn);
                thisFunctionGraph.setFunction(eqn);


                //reset the bars:
                thisObj.update();
            }
        );




        ui.add(this.params, 'x', 0,1,0.001).name('x').onChange(function(value){

            let xRescale = thisObj.rescale(thisObj.params.x);
            let xhRescale = xRescale + thisObj.params.h;
            let range = {min: xRescale, max: xhRescale };
            thisBarGraph.setRange(range);


           thisObj.update();

        });

        ui.add(this.params, 'h', 0.001,5,0.001).name('h').onChange(function(value){

            let xRescale = thisObj.rescale(thisObj.params.x);
            let xhRescale = xRescale + value;
            let range = {min: xRescale, max: xhRescale };
            thisBarGraph.setRange(range);

            thisObj.update();
        });

        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
            thisObj.update();
        });

        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
            thisObj.update();
        });

        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
            thisObj.update();
        });

    }

    tick(time,dTime){
        //all the updating is happening inside the UI only:
    }
}








export default FTCPlotter;
