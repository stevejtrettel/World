


import {
    Vector3,
    SphereGeometry,
    MeshPhysicalMaterial,
    Mesh
} from "../../../3party/three/build/three.module.js";

import ParametricCurve from "../../../code/compute/parametric/ParametricCurve.js";
import FrenetFrame from "../../../code/items/geometry/FrenetFrame.js";

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();

class FrenetFrameField {
    constructor() {

        this.params = {
            sMin:-3.14,
            sMax:3.14,
            coloring:1,
            xEqn: "(2.+cos(4.*s))*sin(s)",
            yEqn: "sin(4.*s)",
            zEqn: "(2.+cos(4.*s))*cos(s)",
            a:0,
            b:0,
            c:0,
            time:0,
        }

        this.numFrames = 60;
        this.periodic=true;

        //starting and ending balls of the curve (if its not periodic):
        let sph = new SphereGeometry(0.2,32,16);
        let mat = new MeshPhysicalMaterial(surfaceOptions);
        this.start = new Mesh(sph,mat);
        this.end = new Mesh(sph,mat);

        this.range = {
            min:this.params.sMin,
            max:this.params.sMax,
        };

        this.uniforms = {
            coloring:{type:'int',value:this.params.coloring},
            a:{type:'float',value:this.params.a},
            b:{type:'float',value:this.params.b},
            c:{type:'float',value:this.params.c},
        };

        this.curveColor= `
            vec3 colorFn(float s, vec3 xyz){
            
                // float eps = 0.005;
                // vec3 pos0 = eqn(s-eps);
                // vec3 pos1 = eqn(s);
                // vec3 pos2 = eqn(s+eps);
                //
                // vec3 normal = (pos2-2.*pos1+pos0)/(eps*eps);
                // float curvature = length(normal);
                //
                // vec3 color = hsb2rgb(vec3(curvature,0.5,0.5));
                // return color;
       
                vec3 base =  0.6 + 0.4*cos(2.*3.14*vec3(s,1.-s,s)+vec3(0,2,4));
                return base;
    
            }
        `;

        //make the JS version of the equation with math parser
        this.buildJSEquation();

        this.curve = new ParametricCurve(this.buildGLSLEquation(),this.range,this.uniforms,this.curveColor,surfaceOptions,0.05);

        let frameOptions = {
            tColor:0xcf448a,
            nColor:0x44cf85,
            bColor:0x4450cf,
            size:0.6
        };

        this.frames = [];
        let sRange = this.params.sMax-this.params.sMin;
        for(let i=0; i<this.numFrames; i++){
            let frame = new FrenetFrame(this.eqn,frameOptions);
            let si = this.params.sMin + i/this.numFrames * sRange;
            frame.update(si,this.params);
            this.frames.push(frame);
        }

    }

    checkPeriodic(){
        let start=this.eqn(this.params.sMin,this.params);
        let end=this.eqn(this.params.sMax,this.params);
        this.start.position.set(start.x,start.y,start.z);
        this.end.position.set(end.x,end.y,end.z);

        //to see if the equation is periodic: evaluate at start and end of domain:
        let diff = new Vector3().subVectors(end,start);
        if(diff.length()<0.05){
            this.periodic=true;
            this.start.visible=false;
            this.end.visible=false;
        }
        else{
            this.periodic=false;
            this.start.visible=true;
            this.end.visible=true;
        }
    }


    buildGLSLEquation(){

        return `vec3 eqn( float s ){
            float x = ${this.params.xEqn};
            float y = ${this.params.yEqn};
            float z = ${this.params.zEqn};
            return vec3(x,y,z);
       }`;
    }

    //build a javascript analog of what is happening above
    buildJSEquation(){

        let xC = parser.evaluate('xEqn(s,time,a,b,c)='.concat(this.params.xEqn));
        let yC = parser.evaluate('yEqn(s,time,a,b,c)='.concat(this.params.yEqn));
        let zC = parser.evaluate('zEqn(s,time,a,b,c)='.concat(this.params.zEqn));

        this.eqn = function(s, params={time:0,a:0,b:0,c:0}){
            let x = xC(s,params.time,params.a,params.b,params.c);
            let y = yC(s,params.time,params.a,params.b,params.c);
            let z = zC(s,params.time,params.a,params.b,params.c);
            return new Vector3(x,y,z);
        }

        this.checkPeriodic();

    }


    addToScene(scene){
        this.curve.addToScene(scene);
        for(let i=0; i<this.numFrames; i++){
            this.frames[i].addToScene(scene);
        }

        scene.add(this.start);
        scene.add(this.end);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(thisObj.params,'xEqn').name('x(s)=').onFinishChange(function(val){
            thisObj.params.xEqn = val;
            let newEqn = thisObj.buildGLSLEquation();
            thisObj.curve.setFunction(newEqn);
            thisObj.buildJSEquation();
            thisObj.frame.resetCurve(thisObj.eqn);
        });

//switched the name of the following two for vector calculus class:

        ui.add(thisObj.params,'zEqn').name('y(s)=').onFinishChange(function(val){
            thisObj.params.zEqn = val
            let newEqn = thisObj.buildGLSLEquation();
            thisObj.curve.setFunction(newEqn);
            thisObj.buildJSEquation();
            thisObj.frame.resetCurve(thisObj.eqn);
        });

        ui.add(thisObj.params,'yEqn').name('z(s)=').onFinishChange(function(val){
            thisObj.params.yEqn = val;
            let newEqn = thisObj.buildGLSLEquation();
            thisObj.curve.setFunction(newEqn);
            thisObj.buildJSEquation();
            thisObj.frame.resetCurve(thisObj.eqn);
        });

        let dFolder = ui.addFolder('Domain');

        dFolder.add(thisObj.params, 'sMin',-10,10,0.01).onChange(function(val){
            thisObj.range.min=val;
            thisObj.curve.setDomain(thisObj.range);
            thisObj.checkPeriodic();
        });
        dFolder.add(thisObj.params, 'sMax',-10,10,0.01).onChange(function(val){
            thisObj.range.max=val;
            thisObj.curve.setDomain(thisObj.range);
            thisObj.checkPeriodic();

        });

        let pFolder = ui.addFolder('Parameters');

        pFolder.add(thisObj.params, 'a',-1,1,0.01).onChange(function(val){
            thisObj.curve.update({a:val});
            thisObj.checkPeriodic();
        });
        pFolder.add(thisObj.params, 'b',-1,1,0.01).onChange(function(val){
            thisObj.curve.update({b:val});
            thisObj.checkPeriodic();
        });
        pFolder.add(thisObj.params, 'c',-1,1,0.01).onChange(function(val){
            thisObj.curve.update({c:val});
            thisObj.checkPeriodic();
        });

        // ui.add(thisObj.params,'coloring',{'curvature':1,'torsion':2});
    }

    tick(time,dTime){

        this.params.time=time;
        this.curve.update({time:time});
        let s;
        if(this.periodic){
            s=time/5.;
        }
        else{
            s = (1.-Math.cos(time/3.))/2;
            s= this.params.sMin+(this.params.sMax-this.params.sMin)*s;
        }

        let sRange = this.params.sMax-this.params.sMin;
        for(let i=0; i<this.numFrames; i++){
            let si = s+this.params.sMin + i/this.numFrames * sRange;
            this.frames[i].update(si,this.params);
        }

    }
}




export default FrenetFrameField;
