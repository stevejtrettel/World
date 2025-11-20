

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
import Graph2D from "../../../../code/items/calculus/Graph2D.js";
import ValueRod from "./ValueRod.js";

const parser = math.parser();



export default class MonteCarloPlotter{
    constructor(fnText, range,N) {

        this.params = {
            i:0,
            xMin: range.min,
            xMax: range.max,

            N:N,
            currentN: 1,

            curveText: fnText,
            showCurve:true,
        };


        //define the function which gives our curve:
        let func = parser.evaluate('curve(x)='.concat(this.params.curveText));
        //the function with all the variables:
        this.curve = function(x){
            let y = func(x);
            return y;
        }

        this.toRange = function(u){
            return range.min + (range.max-range.min)*u;
        }

        let graphOptions = {
            domain:range,
            radius:0.03,
            res:300,
            f: this.curve,
            color: 0xffffff,
        };

        this.functionGraph = new Graph2D(graphOptions);

        this.rods = [];
        for(let i=0; i<this.params.N;i++){
            let x = -10;
                //this.toRange(i/this.params.N);
            this.rods.push(new ValueRod(x,this.curve));
        }

    }


    addToScene(scene){
        this.functionGraph.addToScene(scene);
        for(let i=0;i<this.params.N;i++){
            scene.add(this.rods[i]);
        }
    }


    addToUI(ui){
        ui.add(this, 'reset').name('↺ Reset');
    }

    tick(time,dTime){

        this.params.i +=1;
        this.rods[this.params.i].update(this.toRange(Math.random()));



    }

    reset(){
        this.params.i = 1;
        for(let i=0;i<this.params.N;i++){
            this.rods[i].update(-100);
        }
       // this.riemannSum.update(this.params);
    }
}
