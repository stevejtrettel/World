import  Graph2D  from '../components/Calculus/Graph2D.js';
import NewtonsMethod from "../components/Calculus/NewtonsMethod.js";
import {BlackBoard} from "../components/Calculus/Blackboard.js";

let parser = math.parser();

class NewtonsMethodPlotter{
    constructor(){

        this.range = {
            x: {min:-4,max:4},
            y: {min:-4,max:4},
        };

        //do not allow time as a parameter
        this.params = {
            fText : 'x^2-x',
            x0:0,
            a: 0,
            b: 0,
            c:0,
        }

        //define the function which gives our curve:
        let func = parser.evaluate('f(x,t,a,b,c)='.concat(this.params.fText));
        //the function with all the variables:
        this.f = function(x, params={t:0,a:0,b:0,c:0}){
            let y = func(x, params.t, params.a, params.b, params.c);
            return y;
        };




        let graphOptions ={
            f: this.f,
            domain: this.range.x,
            res:100,
            radius: 0.05
        }

        this.graph = new Graph2D(graphOptions);
        this.newton = new NewtonsMethod(this.f,this.params.x0,10);


        let boardOptions = {
            xRange: {min:-10,max:10},
            yRange: {min:-7,max:7},
            radius: 0.02,
        }
        this.blackboard = new BlackBoard(boardOptions);

    }

    addToScene(scene){
        this.graph.addToScene(scene);
        this.newton.addToScene(scene);
        this.blackboard.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(this.params,'fText').name('y=').onFinishChange(
            function(value){
                thisObj.params.curveText=value;
                let fn = parser.evaluate('f(x,t,a,b,c)='.concat(thisObj.params.fText));
                let eqn = function(x,params={t:0,a:0,b:0,c:0}){
                    let y = fn(x, params.time,params.a,params.b,params.c);
                    return y;
                }

                thisObj.f = eqn;
                thisObj.graph.setFunction(eqn);
                thisObj.newton.setF(eqn);

                thisObj.graph.update(thisObj.params);
                thisObj.newton.update(thisObj.params);

            }
        );

        ui.add(this.params, 'x0', -2, 2, 0.01).name('x0').onChange(function(value){
            thisObj.newton.setX0(value);
            thisObj.newton.update(thisObj.params);
        });

        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
            thisObj.graph.update(thisObj.params);
            thisObj.newton.update(thisObj.params);
        });

        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
            thisObj.graph.update(thisObj.params);
            thisObj.newton.update(thisObj.params);
        });

        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
            thisObj.graph.update(thisObj.params);
            thisObj.newton.update(thisObj.params);
        });

    }

    tick(time,dTime){
        //do NOTHING every timestep:
        //instead, just update things when they actually change in the UI :-)
    }

}





let example = new NewtonsMethodPlotter();

export default {example};