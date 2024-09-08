import {
    Vector2,
} from "../../../3party/three/build/three.module.js";


import VectorField2D from "../../../code/items/vector-calculus/VectorField2D.js";
import { GlassPanel } from "../../../code/items/basic-shapes/GlassPanel.js";
import SlopeFieldIntegralCurve from "../../../code/items/odes/SlopeFIeldIntegralCurve.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


let defaultRange = {
    x:{ min:0,max:5},
    y:{min:0,max:5},
};

let defaultRes = {x:20,y:20};


class VectorField2DPlotter{
    constructor( range=defaultRange, res=defaultRes ){

        this.blackboard = new GlassPanel({
            xRange: range.x,
            yRange: range.y,
        });

        this.params = {
            xMin: range.x.min,
            xMax: range.x.max,
            yMin: range.y.min,
            yMax: range.y.max,

            initialX:1,
            initialY:1,

            res: res.x,

            a:1,
            b:1,
            c:1,
            d:1,
            e:0.,


            xPrimeText: 'x-x*y',
            yPrimeText: '-y+x*y',

            showCurve: false,
        };

        let xC = parser.evaluate('xPrime(x,y,a,b,c,d,e)='.concat(this.params.xPrimeText));
        let yC = parser.evaluate('yPrime(x,y,a,b,c,d,e)='.concat(this.params.yPrimeText));

        this.vectorFieldEqn = function(pos, params={a:0.5,b:0.5,c:0.5,d:0.5,e:0.5}){
            let x = xC(pos.x,pos.y,params.a,params.b,params.c,params.d,params.e);
            let y = yC(pos.x,pos.y,params.a,params.b,params.c,params.d,params.e);
            return new Vector2(x,y);
        }

        this.vectorField = new VectorField2D(this.vectorFieldEqn, range, res);



        this.iniCond = new Vector2(this.params.initialX,this.params.initialY);
        this.integralCurve = new SlopeFieldIntegralCurve(this.vectorFieldEqn, this.iniCond, range);
        this.integralCurve.setVisibility(this.params.showCurve);

    }

    addToScene(scene){
        this.vectorField.addToScene(scene);
        this.vectorField.setPosition(-2.5,-2.5,0);
        this.blackboard.addToScene(scene);
        this.blackboard.setPosition(-2.5,-2.5,0)
        this.integralCurve.addToScene(scene);
        this.integralCurve.setPosition(-2.5,-2.5,0);
    }

    addToUI(ui){

        let thisObj = this;
        let thisField = this.vectorField;
        let thisCurve = this.integralCurve;

        ui.add(this.params,'xPrimeText').name('xPrime=').onFinishChange(
            function(value){
                thisObj.params.xPrimeText = value;
                let xC = parser.evaluate('xPrime(x,y,a,b,c,d,e)='.concat(thisObj.params.xPrimeText));
                let yC = parser.evaluate('yPrime(x,y,a,b,c,d,e)='.concat(thisObj.params.yPrimeText));
                let eqn = function(pos,params){
                    let x = xC(pos.x,pos.y,params.a,params.b,params.c,params.d,params.e);
                    let y = yC(pos.x,pos.y,params.a,params.b,params.c,params.d,params.e);
                    return new Vector2(x,y);
                }
                thisObj.vectorFieldEqn = eqn;
                thisField.setVectorField(eqn);
                thisCurve.setYPrime(eqn);
                thisField.update(thisObj.params);


                thisCurve.computeCurve(thisObj.params);
                thisCurve.resetCurve(thisCurve.curve);
            }
        );


        //same function except it only does the change when you've altered the y coordinate
        ui.add(this.params,'yPrimeText').name('yPrime=').onFinishChange(
            function(value){
                thisObj.params.yPrimeText = value;
                let xC = parser.evaluate('xPrime(x,y,a,b,c,d,e)='.concat(thisObj.params.xPrimeText));
                let yC = parser.evaluate('yPrime(x,y,a,b,c,d,e)='.concat(thisObj.params.yPrimeText));
                let eqn = function(pos,params=this.settingsAndParams){
                    let x = xC(pos.x,pos.y,params.a,params.b,params.c,params.d,params.e);
                    let y = yC(pos.x,pos.y,params.a,params.b,params.c,params.d,params.e);
                    return new Vector2(x,y);
                }
                thisObj.vectorFieldEqn = eqn;
                thisField.setVectorField(eqn);
                thisCurve.setYPrime(eqn);
                thisField.update(thisObj.params);

                thisCurve.computeCurve(thisObj.params);
                thisCurve.resetCurve(thisCurve.curve);
            }
        );

        ui.add(this.params, 'res', 10, 100, 1).name('res').onChange(function(value){
            let res ={ x: value, y:value};
            thisField.setRes(res);
            thisField.update(thisObj.params);
        });



        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
            thisField.update(thisObj.params);
            thisCurve.computeCurve(thisObj.params);
            thisCurve.resetCurve(thisCurve.curve);
        });
        paramFolder.add(this.params, 'b', 0, 1, 0.01).name('b').onChange(function(value){
            thisField.update(thisObj.params);
            thisCurve.computeCurve(thisObj.params);
            thisCurve.resetCurve(thisCurve.curve);
        });
        paramFolder.add(this.params, 'c', 0, 1, 0.01).name('c').onChange(function(value){
            thisField.update(thisObj.params);
            thisCurve.computeCurve(thisObj.params);
            thisCurve.resetCurve(thisCurve.curve);
        });
        paramFolder.add(this.params, 'd', 0, 1, 0.01).name('d').onChange(function(value){
            thisField.update(thisObj.params);
            thisCurve.computeCurve(thisObj.params);
            thisCurve.resetCurve(thisCurve.curve);
        });
        paramFolder.add(this.params, 'e', 0, 1, 0.01).name('e').onChange(function(value){
            thisField.update(thisObj.params);
            thisCurve.computeCurve(thisObj.params);
            thisCurve.resetCurve(thisCurve.curve);
        });



        let curveFolder = ui.addFolder('IntegralCurve');

        curveFolder.add(this.params,'initialX',0.01,5,0.01).onChange(
            function(value){
                let iniCond = new Vector2(value,thisObj.params.initialY);
                thisCurve.setInitialCondition(iniCond);
                thisCurve.computeCurve(thisObj.params);
                thisCurve.resetCurve(thisCurve.curve);
            }
        );
        curveFolder.add(this.params,'initialY',0.01,5,0.01).onChange(
            function(value){
                let iniCond = new Vector2(thisObj.params.initialX,value);
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

    }

}







export default VectorField2DPlotter;
