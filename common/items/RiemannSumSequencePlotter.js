
import RiemannSum from "../components/Calculus/RiemannSum.js";


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();



//for a given function, just a plot of a lot of different Riemann sums in a row
class RiemannSumSequencePlotter {
    constructor(fnText,range){

        this.range=range;

        //what is the total number of allowed Riemann Sum Graphs?
        this.numSums = 100;
        //what is the total number of bars allowed in a single graph?
        this.maxN = 1000;

        this.multFactor = Math.pow(this.maxN,1/this.numSums);

        //how thick are the individual bars of the Riemann Sums?
        this.thickness = 0.25;

        this.params = {
            xMin: this.range.min,
            xMax: this.range.max,

            //how many sums are we actually showing?
            sumCount: 100,

            a:1,
            b:1,
            c:1,

            time:0,

            curveText: fnText,

            showCurve:true,

            // reset: function(){
            //     console.log('reset');
            // }
        };

        //define the function which gives our curve:
        let func = parser.evaluate('curve(x,t,a,b,c)='.concat(this.params.curveText));

        //the function with all the variables:
        this.curve = function(x, params={time:0,a:0,b:0,c:0}){
            let y = func(x, params.time, params.a, params.b, params.c);
            return y;
        }

        this.initialize();
    }


    initialize(){
        this.sums = [];


        let singleSum, numBars;
        let barCount = 1;
        for(let i =0; i<this.numSums; i++){

            //how many bars should the ith sum have?
            barCount *= this.multFactor;
            numBars = Math.floor(barCount);

            //make the sum
            singleSum =  new RiemannSum(this.curve, this.range, numBars, this.thickness);
            singleSum.update(this.params);
            singleSum.barGraph.position.set(0,0,(this.numSums/2-i)*this.thickness);
            this.sums.push(singleSum);
        }


    }

    addToScene(scene){
        for(let i =0; i<this.numSums; i++){
            this.sums[i].addToScene(scene);
        }
    }

    addToUI(ui){

        let thisObj = this;

        //
        // let domainFolder =ui.addFolder('Domain');
        //
        // domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
        //     let rng = {
        //         x:{min:value,max:thisBarGraph.range.max},
        //     };
        //     thisBarGraph.setRange(rng);
        // });
        //
        // domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
        //     let rng = {
        //         x:{min: thisBarGraph.range.min, max: value}
        //     };
        //     thisBarGraph.setRange(rng);
        // });


        ui.add(this.params,'sumCount', 1, thisObj.numSums, 1).name('Number').onChange(function(value){
            //reset who is visible and who is not:
            for(let i=0; i<thisObj.numSums;i++){

                if(i<value){
                    thisObj.sums[i].setVisibility(true);
                }
                else{
                    thisObj.sums[i].setVisibility(false);
                }
            }
        });

        ui.add(this.params,'curveText').name('y=').onFinishChange(
            function(value) {

                thisObj.params.curveText=value;
                thisObj.params.time = 0;

                let curve = parser.evaluate('curve(x,t,a,b,c)='.concat(thisObj.params.curveText));
                let eqn = function (x, params = {time: 0, a: 0, b: 0, c: 0}) {
                    let y = curve(x, params.time, params.a, params.b, params.c);
                    return y;
                }

                thisObj.curve = eqn;
                for (let i = 0; i < thisObj.numSums; i++) {
                    thisObj.sums[i].setCurve(eqn);
                }
            }
        );

        // ui.add(this.params, 'reset').onChange(
        //     function(){
        //
        //         thisObj.params.time=0;
        //
        //         let curve = parser.evaluate('curve(x,t,a,b,c)='.concat(thisObj.params.curveText));
        //         let eqn = function(x,params={time:0,a:0,b:0,c:0}){
        //             let y = curve(x, params.time,params.a,params.b,params.c);
        //             return y;
        //         }
        //
        //         thisObj.curve = eqn;
        //         for(let i=0; i<thisObj.numSums; i++){
        //             thisObj.sums[i].setCurve(eqn);
        //         }
        //     }
        // );


        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('a').onChange(function(value){
        });


    }

    tick(time,dTime){

        this.params.time += dTime;

        for(let i=0; i<this.numSums; i++){
            if(this.sums[i].barGraph.visible){
                this.sums[i].update(this.params);
            }
        }
    }
}


let fnText = 'cos(x)';
let range = {min:-5,max:5};

let example = new RiemannSumSequencePlotter(fnText,range);
export default { example };


