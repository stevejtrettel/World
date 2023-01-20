import {Color, Vector3} from "../../../3party/three/build/three.module.js";

import SurfaceRevolutionX from "../../components/Calculus/SurfaceRevolutionX.js";
import {BlackBoard} from "../../components/Calculus/Blackboard.js";
import {Rod} from "../../components/Calculus/Rod.js";
import Graph2D from "../../components/Calculus/Graph2D.js";
import AreaBetweenCurves from "../../components/Calculus/AreaBetweenCurves.js";
import Washer from "../../components/Calculus/Washer.js";


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();



//SOME NICE COLORS:
let medBlue = new Color().setHSL(0.6,0.5,0.5);
let darkBlue = new Color().setHSL(0.65,0.7,0.2);
let lightGreen = new Color().setHSL(0.3,0.5,0.6);
let yellow = new Color().setHSL(0.13,0.8,0.4);
let lightYellow = new Color().setHSL(0.15,0.7,0.8);

class DiskAndWasherPlotter{
   constructor(domain) {

       this.domain = domain;

       this.params = {

           xMin: this.domain.min,
           xMax: this.domain.max,

           outerCurveText: '2',
           innerCurveText:'1/(1+x^2)',

           x: 0.75,

           axis: 0,
           angle: 0,

           showArea:true,
           showCurves:true,

           a:0,
           b:0,
           c:0,

       }


       //THE OUTSIDE CURVE AND SURFACE
       let outerFunc = parser.evaluate('curve(x,a,b,c)='.concat(this.params.outerCurveText));
       //the function with all the variables:
       this.outerCurveFn = function(x, params={a:0,b:0,c:0}){
           let y = outerFunc(x, params.a, params.b, params.c);
           return y;
       }

       let outerCurveOptions = {
           domain:this.domain,
           radius:0.03,
           res:300,
           f: this.outerCurveFn,
           color: yellow,
       };
       this.outerCurve = new Graph2D(outerCurveOptions);
       this.outerSurface = new SurfaceRevolutionX(this.outerCurveFn, this.domain, this.params.axis,this.params.angle);



       //THE INSIDE CURVE AND SURFACE
       let innerFunc = parser.evaluate('curve(x,a,b,c)='.concat(this.params.innerCurveText));
       //the function with all the variables:
       this.innerCurveFn = function(x, params={a:0,b:0,c:0}){
           let y = innerFunc(x, params.a, params.b, params.c);
           return y;
       }


       let innerCurveOptions = {
           domain:this.domain,
           radius:0.03,
           res:300,
           f: this.innerCurveFn,
           color: yellow,
       };
       this.innerCurve = new Graph2D(innerCurveOptions);
       this.innerSurface = new SurfaceRevolutionX(this.innerCurveFn, this.domain, this.params.axis,this.params.angle);
       //change the inner material
       //transmitting things are visible thru transparent things
       this.innerSurface.surface.material.transparent=false;
       this.innerSurface.surface.material.transmission=0.5;
       this.innerSurface.surface.material.ior=1;


       //AREA BETWEEN CURVES:
       this.area = new AreaBetweenCurves(this.domain,this.outerCurveFn,this.innerCurveFn,lightYellow);

       //THE BLACKBOARD
       this.blackboard = new BlackBoard({
           xRange:domain,
           yRange:domain,
           radius:0.02,
       });


       //THE ROTATION AXIS
       this.axis = new Rod(
           {
               end1:new Vector3(this.domain.min, this.params.axis,0),
               end2:new Vector3(this.domain.max, this.params.axis,0),
               radius:0.03,
           }
       );


       //THE WASHER
       this.washer = new Washer(this.params.x,this.outerCurveFn,this.innerCurveFn, this.params.axis, this.params.angle);


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
       let outer = this.outerCurveFn;
       let inner = this.innerCurveFn;
       let axis = this.params.axis;

       return function(x,params){
           let big = outer(x, params)-axis;
           let small = inner(x, params)-axis;
           return big*big-small*small;
       }
   }


   //stuff for simultaneously updating many things
   setDomain(dom){
       this.outerSurface.setDomain(dom);
       this.innerSurface.setDomain(dom);
       this.area.setDomain(dom);
       this.innerCurve.setDomain(dom);
       this.outerCurve.setDomain(dom);
       this.integralCurve.setDomain(dom);
       this.integralArea.setDomain(dom);
    }

    setAngle(ang){
       this.outerSurface.setAngle(ang);
       this.innerSurface.setAngle(ang);
       this.washer.setAngle(ang);
    }

    setAxis(axis){

       this.outerSurface.setAxis(axis);
       this.innerSurface.setAxis(axis);
       this.washer.setAxis(axis);
       this.axis.resize(new Vector3(this.domain.min, axis, 0),new Vector3(this.domain.max, axis, 0));

       this.integrand = this.createIntegrand();
       this.integralArea.setTop(this.integrand);
       this.integralCurve.setFunction(this.integrand);
       this.integralSlice.resize( new Vector3(this.params.x,0,0), new Vector3(this.params.x, this.integrand(this.params.x,this.params),0));
    }

   update(params){
       this.innerCurve.update(params);
       this.outerCurve.update(params);
       this.outerSurface.update(params);
       this.innerSurface.update(params);
       this.washer.update(params);
       this.area.update(params);

       this.integralArea.update(params);
       this.integralCurve.update(params);

   }





   addToScene(scene){
       this.area.addToScene(scene);
       this.outerSurface.addToScene(scene);
       this.innerSurface.addToScene(scene);
       this.blackboard.addToScene(scene);
       this.axis.addToScene(scene);
       this.innerCurve.addToScene(scene);
       this.outerCurve.addToScene(scene);
       this.washer.addToScene(scene);

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

       ui.add(this.params,'outerCurveText').name('f(x)=').onFinishChange(
           function(value){
               let curve = parser.evaluate('outerCurve(x,a,b,c)='.concat(value));
               let eqn = function(x,params={a:0,b:0,c:0}){
                   let y = curve(x, params.a,params.b,params.c);
                   return y;
               }


               thisObj.outerCurveFn = eqn;

               thisObj.area.setTop(eqn);
               thisObj.area.update(thisObj.params);

               thisObj.outerCurve.setFunction(eqn);
               thisObj.outerCurve.update(thisObj.params);

               thisObj.outerSurface.setCurve(eqn);
               thisObj.outerSurface.update(thisObj.params);

               thisObj.washer.setTop(eqn);
               thisObj.washer.update(thisObj.params);


               thisObj.integrand = thisObj.createIntegrand();
               thisObj.integralCurve.setFunction(thisObj.integrand);
               thisObj.integralCurve.update(thisObj.params);

               thisObj.integralArea.setTop(thisObj.integrand);
               thisObj.integralArea.update(thisObj.params);

               thisObj.integralSlice.resize(new Vector3(thisObj.params.x,0,0), new Vector3(thisObj.params.x, thisObj.integrand(thisObj.params.x,thisObj.params)));


           }
       );

       ui.add(this.params,'innerCurveText').name('g(x)=').onFinishChange(
           function(value){
               let curve = parser.evaluate('innerCurve(x,a,b,c)='.concat(value));
               let eqn = function(x,params={a:0,b:0,c:0}){
                   let y = curve(x, params.a,params.b,params.c);
                   return y;
               }

               thisObj.innerCurveFn = eqn;

               thisObj.area.setBottom(eqn);
               thisObj.area.update(thisObj.params);

               thisObj.innerCurve.setFunction(eqn);
               thisObj.innerCurve.update(thisObj.params);

               thisObj.innerSurface.setCurve(eqn);
               thisObj.innerSurface.update(thisObj.params);

               thisObj.washer.setBottom(eqn);
               thisObj.washer.update(thisObj.params);


               thisObj.integrand = thisObj.createIntegrand();
               thisObj.integralCurve.setFunction(thisObj.integrand);
               thisObj.integralCurve.update(thisObj.params);

               thisObj.integralArea.setTop(thisObj.integrand);
               thisObj.integralArea.update(thisObj.params);

               thisObj.integralSlice.resize(new Vector3(thisObj.params.x,0,0), new Vector3(thisObj.params.x, thisObj.integrand(thisObj.params.x,thisObj.params)));

           }
       );

       ui.add(this.params, 'x', -10, 10, 0.01).name('slice').onChange(function(value){
           thisObj.washer.setX(value);
           thisObj.washer.update(thisObj.params);
           thisObj.integralSlice.resize(new Vector3(thisObj.params.x,0,0), new Vector3(thisObj.params.x, thisObj.integrand(thisObj.params.x,thisObj.params)));
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
               thisObj.outerCurve.setVisibility(value);
               thisObj.innerCurve.setVisibility(value);
           }
       );


   }

   tick(time,dTime){

   }


}



let example = new DiskAndWasherPlotter({min:-10,max:10});

export default {example};