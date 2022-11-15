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
            fText : '2*cos(x)',
            x0: 0.42,
            a: 0,
            b: 0,
            c:0,
            curveRad:0.02,
        }

        //define the function which gives our curve:
        let func = parser.evaluate('f(x,a,b,c)='.concat(this.params.fText));
        //the function with all the variables:
        this.f = function(x, params={a:0,b:0,c:0}){
            let y = func(x, params.a, params.b, params.c);
            return y;
        };




        let graphOptions ={
            f: this.f,
            domain: this.range.x,
            res:100,
            radius: this.params.curveRad,
        }

        this.graph = new Graph2D(graphOptions);
        this.newton = new NewtonsMethod(this.f,this.params.x0,5);


        let boardOptions = {
            xRange: {min:-6,max:6},
            yRange: {min:-4,max:4},
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
                let fn = parser.evaluate('f(x,a,b,c)='.concat(thisObj.params.fText));
                let eqn = function(x,params={a:0,b:0,c:0}){
                    let y = fn(x, params.a,params.b,params.c);
                    return y;
                }

                thisObj.f = eqn;
                thisObj.graph.setFunction(eqn);
                thisObj.newton.setF(eqn);

                thisObj.graph.update(thisObj.params);
                thisObj.newton.update(thisObj.params);

            }
        );

        ui.add(this.params, 'x0', -2, 2, 0.001).name('x0').onChange(function(value){
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

        ui.add(this.params, 'curveRad', 0, 0.1, 0.001).name('graphSize').onChange(function(value){
            thisObj.graph.setRadius(value);
            thisObj.graph.update(thisObj.params);
        });



    }

    tick(time,dTime){
        //do NOTHING every timestep:
        //instead, just update things when they actually change in the UI :-)
    }

}





let example = new NewtonsMethodPlotter();

export default {example};