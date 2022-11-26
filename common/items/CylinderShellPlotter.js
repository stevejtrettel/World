import {Color, CylinderBufferGeometry, Vector3} from "../../3party/three/build/three.module.js";

import SurfaceRevolutionY from "../components/Calculus/SurfaceRevolutionY.js";
import {BlackBoard} from "../components/Calculus/Blackboard.js";
import {Rod} from "../components/Calculus/Rod.js";
import Graph2D from "../components/Calculus/Graph2D.js";
import AreaBetweenCurves from "../components/Calculus/AreaBetweenCurves.js";
import Washer from "../components/Calculus/Washer.js";
import Cylinder from "../components/Calculus/Cylinder.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser()


//SOME NICE COLORS:
let medBlue = new Color().setHSL(0.6,0.5,0.5);
let darkBlue = new Color().setHSL(0.65,0.7,0.2);
let lightGreen = new Color().setHSL(0.3,0.5,0.6);
let yellow = new Color().setHSL(0.13,0.8,0.4);
let lightYellow = new Color().setHSL(0.15,0.7,0.8);

class CylinderShellPlotter{
    constructor(domain) {

        this.domain = {min:0, max:domain.max};

        this.params = {

            xMin: 0,
            xMax: this.domain.max,

            topCurveText: '2',
            bottomCurveText:'1/(1+x^2)',

            x: 0.75,

            axis: 0,
            angle: 0,

            showArea:true,
            showCurves:true,

            a:0,
            b:0,
            c:0,

        }

        this.rescaleX = function(x){
            return this.params.xMin + x * (this.params.xMax-this.params.xMin);
        }


        //THE OUTSIDE CURVE AND SURFACE
        let topFunc = parser.evaluate('curve(x,a,b,c)='.concat(this.params.topCurveText));
        //the function with all the variables:
        this.topCurveFn = function(x, params={a:0,b:0,c:0}){
            let y = topFunc(x, params.a, params.b, params.c);
            return y;
        }

        let topCurveOptions = {
            domain:this.domain,
            radius:0.03,
            res:300,
            f: this.topCurveFn,
            color: yellow,
        };
        this.topCurve = new Graph2D(topCurveOptions);
        this.topSurface = new SurfaceRevolutionY(this.topCurveFn, this.domain, this.params.axis,this.params.angle);



        //THE INSIDE CURVE AND SURFACE
        let bottomFunc = parser.evaluate('curve(x,a,b,c)='.concat(this.params.bottomCurveText));
        //the function with all the variables:
        this.bottomCurveFn = function(x, params={a:0,b:0,c:0}){
            let y = bottomFunc(x, params.a, params.b, params.c);
            return y;
        }


        let bottomCurveOptions = {
            domain:this.domain,
            radius:0.03,
            res:300,
            f: this.bottomCurveFn,
            color: yellow,
        };
        this.bottomCurve = new Graph2D(bottomCurveOptions);
        this.bottomSurface = new SurfaceRevolutionY(this.bottomCurveFn, this.domain, this.params.axis,this.params.angle);
        //change the inner material
        //transmitting things are visible thru transparent things
        this.bottomSurface.surface.material.transparent=false;
        this.bottomSurface.surface.material.transmission=0.5;
        this.bottomSurface.surface.material.ior=1;


        //AREA BETWEEN CURVES:
        this.area = new AreaBetweenCurves(this.domain,this.topCurveFn,this.bottomCurveFn,lightYellow);

        //THE BLACKBOARD
        this.blackboard = new BlackBoard({
            xRange:domain,
            yRange:domain,
            radius:0.02,
        });


        //THE ROTATION AXIS
        this.axis = new Rod(
            {
                end1:new Vector3(this.params.axis, this.domain.min,0),
                end2:new Vector3(this.params.axis, this.domain.max,0),
                radius:0.03,
            }
        );


        //THE CYLLINDRICAL SHELL
        this.shell = new Cylinder(this.rescaleX(this.params.x),this.topCurveFn,this.bottomCurveFn, this.params.axis, this.params.angle);



        //THE OUTER SHELL OF THE ROTATED VOLUME:
        // this.outerWall = new CylinderBufferGeometry();


        //IN THE BACKGROUND: THE CURVE WE INTEGRATE
        this.integralBoard = new BlackBoard({
            xRange:domain,
            yRange:domain,
            radius:0.02,
        });

        this.integralBoard.setPosition(0,0,-15);
        this.integrand = this.createIntegrand();
        let integralCurveOptions = {
            domain:this.domain,
            radius:0.03,
            res:150,
            f: this.integrand,
            color: yellow,
        };
        this.integralCurve = new Graph2D(integralCurveOptions);
        this.integralCurve.setPosition(0,0,-15);
        this.integralArea = new AreaBetweenCurves(this.domain,this.integrand,(x,params)=>{return 0.},medBlue);
        this.integralArea.setPosition(0,0,-15);


        //the background slice:
        this.integralSlice = new Rod({
            end1: new Vector3(this.params.x,0,0),
            end2: new Vector3(this.params.x, this.integrand(this.params.x),0),
            radius:0.05,
            color:darkBlue,
        });
        this.integralSlice.setPosition(0,0,-15);

    }

    createIntegrand(){
        let top = this.topCurveFn;
        let bottom = this.bottomCurveFn;
        let axis = this.params.axis;

        return function(x,params){
            let radius = x-axis;
            let height = top(x,params)-bottom(x,params);
            return radius*height;
        }
    }


    //stuff for simultaneously updating many things
    setDomain(dom){
        this.topSurface.setDomain(dom);
        this.bottomSurface.setDomain(dom);
        this.area.setDomain(dom);
        this.bottomCurve.setDomain(dom);
        this.topCurve.setDomain(dom);
        this.integralCurve.setDomain(dom);
        this.integralArea.setDomain(dom);



    }

    setAngle(ang){
        this.topSurface.setAngle(ang);
        this.bottomSurface.setAngle(ang);
        this.shell.setAngle(ang);
    }

    setAxis(axis){

        this.topSurface.setAxis(axis);
        this.bottomSurface.setAxis(axis);
        this.shell.setAxis(axis);
        this.axis.resize(new Vector3( axis, this.domain.min,0),new Vector3( axis, this.domain.max,0));

        this.integrand = this.createIntegrand();
        this.integralArea.setTop(this.integrand);
        this.integralCurve.setFunction(this.integrand);
        this.integralSlice.resize( new Vector3(this.params.x,0,0), new Vector3(this.params.x, this.integrand(this.params.x,this.params),0));
    }

    update(params){
        this.topCurve.update(params);
        this.bottomCurve.update(params);
        this.topSurface.update(params);
        this.bottomSurface.update(params);
        this.shell.update(params);
        this.area.update(params);

        this.integralArea.update(params);
        this.integralCurve.update(params);

    }





    addToScene(scene){
        this.area.addToScene(scene);
        this.topSurface.addToScene(scene);
        this.bottomSurface.addToScene(scene);
        this.blackboard.addToScene(scene);
        this.axis.addToScene(scene);
        this.topCurve.addToScene(scene);
        this.bottomCurve.addToScene(scene);
        this.shell.addToScene(scene);

        this.integralBoard.addToScene(scene);
        this.integralCurve.addToScene(scene);
        this.integralArea.addToScene(scene);
        this.integralSlice.addToScene(scene);

    }



    addToUI(ui){

        let thisObj = this;


        let domainFolder =ui.addFolder('Domain');

        domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
            let dom = {min:value,max:thisObj.params.xMax};
            thisObj.setDomain(dom);
            thisObj.update(thisObj.params);

        });

        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let dom = {min:thisObj.params.xMin,max:value};
            thisObj.setDomain(dom);
            thisObj.update(thisObj.params);

        });


        ui.add(this.params,'topCurveText').name('f(x)=').onFinishChange(
            function(value){
                let curve = parser.evaluate('topCurve(x,a,b,c)='.concat(value));
                let eqn = function(x,params={a:0,b:0,c:0}){
                    let y = curve(x, params.a,params.b,params.c);
                    return y;
                }

                thisObj.topCurveFn = eqn;

                thisObj.area.setTop(eqn);
                thisObj.area.update(thisObj.params);

                thisObj.topCurve.setFunction(eqn);
                thisObj.topCurve.update(thisObj.params);

                thisObj.topSurface.setCurve(eqn);
                thisObj.topSurface.update(thisObj.params);

                thisObj.shell.setTop(eqn);
                thisObj.shell.update(thisObj.params);

                thisObj.integrand = thisObj.createIntegrand();
                thisObj.integralCurve.setFunction(thisObj.integrand);
                thisObj.integralCurve.update(thisObj.params);

                thisObj.integralArea.setTop(thisObj.integrand);
                thisObj.integralArea.update(thisObj.params);

                thisObj.integralSlice.resize(new Vector3(thisObj.params.x,0,0), new Vector3(thisObj.params.x, thisObj.integrand(thisObj.params.x,thisObj.params)));

            }
        );



        ui.add(this.params,'bottomCurveText').name('g(x)=').onFinishChange(
            function(value){
                let curve = parser.evaluate('bottomCurve(x,a,b,c)='.concat(value));
                let eqn = function(x,params={a:0,b:0,c:0}){
                    let y = curve(x, params.a,params.b,params.c);
                    return y;
                }

                thisObj.bottomCurveFn = eqn;

                thisObj.area.setBottom(eqn);
                thisObj.area.update(thisObj.params);

                thisObj.bottomCurve.setFunction(eqn);
                thisObj.bottomCurve.update(thisObj.params);

                thisObj.bottomSurface.setCurve(eqn);
                thisObj.bottomSurface.update(thisObj.params);

                thisObj.shell.setBottom(eqn);
                thisObj.shell.update(thisObj.params);

                thisObj.integrand = thisObj.createIntegrand();
                thisObj.integralCurve.setFunction(thisObj.integrand);
                thisObj.integralCurve.update(thisObj.params);

                thisObj.integralArea.setTop(thisObj.integrand);
                thisObj.integralArea.update(thisObj.params);

                thisObj.integralSlice.resize(new Vector3(thisObj.params.x,0,0), new Vector3(thisObj.params.x, thisObj.integrand(thisObj.params.x,thisObj.params)));

            }
        );


        ui.add(this.params, 'x', 0,1, 0.01).name('slice').onChange(function(value){
            let x0 = thisObj.rescaleX(value)
            thisObj.shell.setX(x0);
            thisObj.shell.update(thisObj.params);
            thisObj.integralSlice.resize(new Vector3(x0,0,0), new Vector3(x0, thisObj.integrand(x0,thisObj.params)));
        });

        ui.add(this.params, 'angle', 0, 6.29, 0.1).name('rotate').onChange(function(value){
            thisObj.setAngle(value);
            thisObj.update(thisObj.params);
        });



        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
            thisObj.update(thisObj.params);
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
            thisObj.update(thisObj.params);
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
            thisObj.update(thisObj.params);
        });


        let extraFolder =ui.addFolder('Extra');

        extraFolder.add(this.params, 'axis', -5, 5, 0.01).name('axis').onChange(function(value){
            thisObj.params.axis = value;
            thisObj.setAxis(value);
            thisObj.update(thisObj.params);
        });

        extraFolder.add(this.params,'showArea').name('Show Area').onChange(
            function(value){
                thisObj.area.setVisibility(value);
            }
        );

        extraFolder.add(this.params,'showCurves').name('Show Curves').onChange(
            function(value){
                thisObj.topCurve.setVisibility(value);
                thisObj.bottomCurve.setVisibility(value);
            }
        );


    }

    tick(time,dTime){

    }


}



let example = new CylinderShellPlotter({min:-10,max:10});

export default {example};