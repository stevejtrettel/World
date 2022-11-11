import SlopeField from "../components/calculus/SlopeField.js";
import {BlackBoard} from "../components/calculus/Blackboard.js";


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();

class SlopeFieldPlotter{
    constructor(range,res,slope){

        this.blackboard = new BlackBoard({
            xRange: range.x,
            yRange: range.y,
        });

        this.params = {
            xMin: range.x.min,
            xMax: range.x.max,
            yMin: range.y.min,
            yMax: range.y.max,

            a:1,
            b:1,
            c:1,

            yPrimeText: 'x+y+sin(t)',
        };

        this.yPrime = parser.evaluate('yPrime(x,y,t)='.concat(this.params.yPrimeText));

        this.slopeField = new SlopeField(range,res,this.yPrime);
    }

    addToScene(scene){
        this.slopeField.addToScene(scene);
      //  this.blackboard.addToScene(scene);
    }

    addToUI(ui){
        let domainFolder =ui.addFolder('Domain');
        let paramFolder =ui.addFolder('Parameters');
        let thisField = this.slopeField;

        domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
            let rng = {
                x:{min:value,max:thisField.range.x.max},
                y:{min:thisField.range.y.min, max:thisField.range.y.max}
            };
            thisField.setRange(rng);
        });


        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let rng = {
                x:{min: thisField.range.x.min, max: value},
                y:{min: thisField.range.y.min, max: thisField.range.y.max}
            };
            thisField.setRange(rng);
        });

        domainFolder.add(this.params, 'yMin', -10, 10, 0.01).name('yMin').onChange(function(value){
            let rng = {
                x:{min:thisField.range.x.min, max: thisField.range.x.max},
                y:{min:value, max:thisField.range.y.max}
            };
            thisField.setRange(rng);
        });

        domainFolder.add(this.params, 'yMax', -10, 10, 0.01).name('yMin').onChange(function(value){
            let rng = {
                x:{min:thisField.range.x.min, max: thisField.range.x.max},
                y:{min:thisField.range.y.min, max:value }
            };
            thisField.setRange(rng);
        });


        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('a').onChange(function(value){
        });


        ui.add(this.params,'yPrimeText').name('yPrime'
            .concat('(x,y,t)=')).onChange(function(value){
                this.yPrime=parser.evaluate('yPrime(x,y,t)='.concat(value));
                thisField.setDiffEq(this.yPrime);
        });

    }

    tick(time,dTime){
        this.slopeField.update(time);
    }

}










let range = {
    x:{ min:-5,max:5},
    y:{min:-5,max:5},
};

let res = {x:60,y:60};

let slope = function(x,y,time){
    return x+y+Math.sin(time);
}

let example = new SlopeFieldPlotter(range,res,slope);

export default {example};