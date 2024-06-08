
import DiskRiemannSum from "../../items/calculus/DiskRiemannSum.js";
import Graph2D from "../../items/calculus/Graph2D.js";
import RiemannSum from "../../items/calculus/RiemannSum.js";


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


class DiskRiemannSumPlotter{
    constructor(fnText, range,N){

        this.params = {
            xMin: range.min,
            xMax: range.max,

            N:N,

            a:1,
            b:1,
            c:1,

            time:0,

            curveText: fnText,

            showCurve:true,
            showDisks:true,
            showBars:true,

        };

        //define the function which gives our curve:
        let func = parser.evaluate('curve(x,t,a,b,c)='.concat(this.params.curveText));

        //the function with all the variables:
        this.curve = function(x, params={time:0,a:0,b:0,c:0}){
            let y = func(x, params.time, params.a, params.b, params.c);
            return y;
        }

        this.areaFn = function(x, params={time:0, a:0,b:0,c:0}){
            let rad = func(x,params.time, params.a, params.b, params.c);
            return 3.14/2.*rad*rad;
        }



        this.riemannSum = new DiskRiemannSum(this.curve, range, N);

        let graphOptions = {
            domain:range,
            radius:0.03,
            res:300,
            f: this.curve,
            color: 0xffffff,
        };

        this.functionGraph = new Graph2D(graphOptions);




        //AREA IN THE BACK
        this.areaRiemannSum = new RiemannSum(this.areaFn,range,N,1.5);
        this.areaRiemannSum.setPosition(0,0,-15);

        let areaGraphOptions = {
            domain:range,
            radius:0.03,
            res:300,
            f: this.areaFn,
            color: 0xffffff,
        };

        this.areaGraph = new Graph2D(areaGraphOptions);
        this.areaGraph.setPosition(0,0,-15);



    }

    addToScene(scene){
        this.riemannSum.addToScene(scene);
        this.functionGraph.addToScene(scene);
        this.areaRiemannSum.addToScene(scene);
        this.areaGraph.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;
        let thisBarGraph = this.riemannSum;
        let thisFunctionGraph = this.functionGraph;

        let domainFolder =ui.addFolder('Domain');

        domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
            let rng = {min:value,max:thisBarGraph.range.max};
            thisBarGraph.setRange(rng);
            thisObj.areaRiemannSum.setRange(rng);
        });

        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let rng = {min: thisBarGraph.range.min, max: value};
            thisBarGraph.setRange(rng);
            thisObj.areaRiemannSum.setRange(rng);
        });

        ui.add(this.params,'N', 1,thisBarGraph.totalCount,1).name('Bars').onChange(function(value){
            thisBarGraph.setN(value);
            thisObj.areaRiemannSum.setN(value);
        });


        ui.add(this.params,'curveText').name('y=').onFinishChange(
            function(value){
                thisObj.params.curveText=value;
                let curve = parser.evaluate('curve(x,t,a,b,c)='.concat(thisObj.params.curveText));
                let eqn = function(x,params={time:0,a:0,b:0,c:0}){
                    let y = curve(x, params.time,params.a,params.b,params.c);
                    return y;
                }

                let areaEqn = function(x, params={time:0, a:0,b:0,c:0}){
                    let rad = eqn(x,params);
                    return 3.14/2.*rad*rad;
                }

                thisObj.params.time=0;
                thisObj.curve = eqn;
                thisBarGraph.setCurve(eqn);
                thisFunctionGraph.setFunction(eqn);

                thisObj.areaFn = areaEqn;
                thisObj.areaRiemannSum.setCurve(areaEqn);
                thisObj.areaGraph.setFunction(areaEqn);
            }
        );

        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
        });


        let visFolder = ui.addFolder('Visibility');
        visFolder.add(this.params,'showCurve').onChange(
            function(value){
                thisFunctionGraph.setVisibility(value);
                thisObj.areaGraph.setVisibility(value);
            }
        );
        visFolder.add(this.params,'showDisks').onChange(
            function(value){
                thisBarGraph.setVisibility(value);
            }
        );
        visFolder.add(this.params,'showBars').onChange(
            function(value){
                thisObj.areaRiemannSum.setVisibility(value);
            }
        );

    }

    tick(time,dTime){
        this.params.time += dTime;
        this.riemannSum.update(this.params);
        this.areaRiemannSum.update(this.params);
        this.areaGraph.update(this.params);

        //only do this computation if the curve is visible!
        //otherwise its a waste
        if(this.params.showCurve) {
            this.functionGraph.update(this.params);
        }
    }
}









let fnText = '2/(1+x^2)';
let range = { min:-10,max:10};
let N = 100;

let example = new DiskRiemannSumPlotter(fnText, range, N);

export default {example};
