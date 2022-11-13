
import RiemannSum from "../components/Calculus/RiemannSum.js";
import Graph2D from "../components/Calculus/Graph2D.js";
import {BoxBufferGeometry, MeshPhysicalMaterial, Mesh} from "../../3party/three/build/three.module.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();



class AccumulationBlock{
    constructor(curve,range,N){
       this.curve=curve;
       this.range=range;
       this.N=N;

        //make a block for keeping track of the net area
        let blockGeom = new BoxBufferGeometry(1,1,1);
        let blockMat = new MeshPhysicalMaterial();
        this.block = new Mesh(blockGeom,blockMat);
        this.block.position.set(this.range.min,0,-2);
        this.block.scale.set(1,0.001,1);
    }

    addToScene(scene){
        scene.add(this.block);
    }

    setCurve(curve){
        this.curve=curve;
    }

    setRange(domain){
        this.domain=domain;
    }

    setN(N){
        this.N=N;
    }

    setVisibility(value){
        this.block.visible=value;
    }

    //get the Riemann sum only up to the current Index
    update(currentIndex, params){

        let spread = this.range.max-this.range.min;
        let deltaX = spread/this.N;
        //discrete x-location of the box: so it moves forward one Riemann sum block at at time
        let xLoc = spread*(currentIndex/this.N) + this.range.min;

        //add up all the values to compute the Riemann Sum!
        let totalVal = 0;
        let xVal,yVal;
        for(let i=0; i<currentIndex; i++){
            //midpoint sum
            xVal = spread * (i+1/2)/this.N + this.range.min;
            yVal = this.curve(xVal, params);
            totalVal += yVal*deltaX;
        }

        //put our summation rectangle in the right position and scale:
        this.block.position.set(xLoc,totalVal/2,-2.);
        this.block.scale.set(1,totalVal,1);
    }

}





class RiemannSumPlotter{
    constructor(fnText, range,N){

        this.params = {
            xMin: range.min,
            xMax: range.max,

            N:N,

            accumulate:0,

            a:1,
            b:1,
            c:1,

            time:0,

            curveText: fnText,

            showCurve:true,
            showAccumulate:false,

            reset: function(){
                console.log('reset');
            }
        };

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

        this.netArea = new AccumulationBlock(
            this.curve,
            {min:this.params.xMin, max:this.params.xMax},
            this.params.N
        );
        this.netArea.setVisibility(this.params.showAccumulate);

    }

    addToScene(scene){
        this.riemannSum.addToScene(scene);
        this.functionGraph.addToScene(scene);
        this.netArea.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;
        let thisBarGraph = this.riemannSum;
        let thisAccBar = this.netArea;
        let thisFunctionGraph = this.functionGraph;

        let domainFolder =ui.addFolder('Domain');

        domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
            let rng = {min:value,max:thisBarGraph.range.max};
            thisBarGraph.setRange(rng);
            thisAccBar.setRange(rng);

        });

        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let rng = {min: thisBarGraph.range.min, max: value};
            thisBarGraph.setRange(rng);
            thisAccBar.setRange(rng);
        });

        ui.add(this.params,'showCurve').onChange(
            function(value){
                thisFunctionGraph.setVisibility(value);
            }
        );

        ui.add(this.params,'N', 1,thisBarGraph.totalCount,1).name('Bars').onChange(function(value){
           thisBarGraph.setN(value);
           thisAccBar.setN(value);
        });


        ui.add(this.params,'curveText').name('y=');

        ui.add(this.params, 'reset').onChange(
            function(){

                let curve = parser.evaluate('curve(x,t,a,b,c)='.concat(thisObj.params.curveText));
                let eqn = function(x,params={time:0,a:0,b:0,c:0}){
                    let y = curve(x, params.time,params.a,params.b,params.c);
                    return y;
                }

                thisObj.params.time=0;
                thisObj.curve = eqn;
                thisBarGraph.setCurve(eqn);
                thisFunctionGraph.setFunction(eqn);

            }
        );


        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
        });

        let integrationFolder =ui.addFolder('Integration');

        integrationFolder.add(this.params,'accumulate', 0,1,0.001).name('Integrate').onChange(function(value){

            let currentIndex = Math.floor(value * thisObj.params.N);
            thisAccBar.update(currentIndex, thisObj.params);

        });

        integrationFolder.add(this.params,'showAccumulate').name('Show Integral').onChange(
            function(value){
                thisAccBar.setVisibility(value);
            }
        );




    }

    tick(time,dTime){
        this.params.time += dTime;
        this.riemannSum.update(this.params);

        if(this.params.showAccumulate) {
            let currentIndex = Math.floor(this.params.accumulate * this.params.N);
            this.netArea.update(currentIndex, this.params);
        }

        //only do this computation if the curve is visible!
        //otherwise its a waste
        if(this.params.showCurve) {
            this.functionGraph.update(this.params);
        }
    }
}









let fnText = 'cos(x)+x/(1+x*x)';
let range = { min:-10,max:10};
let N = 100;

let example = new RiemannSumPlotter(fnText, range, N);

export default {example};