import {
    Vector3,
    SphereGeometry,
    MeshPhysicalMaterial,
    Mesh
} from "../../../3party/three/build/three.module.js";

import ParametricCurveCPU from "../../compute/parametric/ParametricCurveCPU.js";
import ParametricCurve from "../../compute/parametric/ParametricCurve.js";
import Vector from "../../items/basic-shapes/Vector.js";
import {Rod} from "../../items/basic-shapes/Rod.js";
import TangentLine from "../../items/calculus/TangentLine.js";



let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


let defaultParams = {
    sMin:-8.,
    sMax:10.,
    xEqn: "exp(a*s)*cos(b*s)",
    yEqn: "0.",
    zEqn: "exp(a*s)*sin(b*s)",
    a:0.25,
    b:1,
    c:1,
    time:0,
    animate:true,
    s:0,
}

class ComplexSpiral {
    constructor(params = defaultParams) {

        this.params = params;

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
            homotopy:{type:'float',value:this.params.homotopy},
            a:{type:'float',value:this.params.a},
            b:{type:'float',value:this.params.b},
            c:{type:'float',value:this.params.c},
        };

        this.curveColor= `
            vec3 colorFn(float s, vec3 xyz){
             
             float grid1 = (1.-pow(abs(sin(10.*3.14*s)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*s)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*s)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*vec3(s,1.-s,s)+vec3(0,2,4));
             
             return base + 2.*vec3(grid);
            }
        `;

        //make the JS version of the equation with math parser
        this.buildJSEquation();

        this.curve = new ParametricCurve(this.buildGLSLEquation(),this.range,this.uniforms,this.curveColor,surfaceOptions);

        let pos = this.eqn(0,);
        let vel = this.derivative(0);
        this.positionVector = new Vector(pos,0xffffff,0.5);
        this.velocityVector = new Vector(vel,0xa83832,0.85);

        this.xComponent = new Vector(new Vector3(vel.x,0,0),0x3268a8,0.5);
        this.yComponent = new Vector(new Vector3(0,0,vel.z),0x33B85A,0.75);

        this.xConnection = new Vector(new Vector3(0,vel.y,vel.z),0x3268a8,0.3);
        this.yConnection = new Vector(new Vector3(vel.x,vel.y,0),0x3268a8,0.3);


        this.imCurve= new ParametricCurveCPU(this.imEqn,this.range,{});
        this.imCurve.update(this.params);
        this.imCurve.setPosition(0,0,-7);

        let end1 = new Vector3(0,0,0);
        let end2 = this.imEqn(0,this.params);
        this.imPos = new Rod({
            end1: end1,
            end2: end2,
            color:0xffffff,
        });

        this.imSlope = new TangentLine({
            f:this.imHeight,
            x:0,
            length:5,
            radius:0.05,
            color:0x33B85A,
        });

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

        let thisObj=this;

        this.derivative = function(s,params={time:0,a:0,b:0,c:0}){
            let epsilon = 0.001;
            let v0=thisObj.eqn(s-epsilon,params);
            let v1=thisObj.eqn(s+epsilon,params);
            let diff = new Vector3().subVectors(v1,v0).divideScalar(2.*epsilon);
            return diff;
        }


        this.imEqn = function(s, params=thisObj.params){
            let z = zC(s,params.time,params.a,params.b,params.c);
            return new Vector3(s,z,0);
        }

        this.imHeight = function(s, params=thisObj.params){
            let z = zC(s,params.time,params.a,params.b,params.c);
            return z;
        }

    }


    addToScene(scene){
        this.curve.addToScene(scene);
        this.positionVector.addToScene(scene);
        this.velocityVector.addToScene(scene);
        scene.add(this.start);
        scene.add(this.end);
        this.xComponent.addToScene(scene);
        this.yComponent.addToScene(scene);
        this.xConnection.addToScene(scene);
        this.yConnection.addToScene(scene);
        this.imCurve.addToScene(scene);

        this.imPos.addToScene(scene);
        this.imPos.setPosition(0,0,-7);

        this.imSlope.addToScene(scene);
        this.imSlope.setPosition(0,0,-7);
    }

    addToUI(ui){

        let thisObj = this;

//         ui.add(thisObj.params,'xEqn').name('x(s)=').onFinishChange(function(val){
//             thisObj.params.xEqn = val;
//             let newEqn = thisObj.buildGLSLEquation();
//             thisObj.curve.setFunction(newEqn);
//             thisObj.buildJSEquation();
//         });
//
// //switched the name of the following two for vector calculus class:
//
//         ui.add(thisObj.params,'zEqn').name('y(s)=').onFinishChange(function(val){
//             thisObj.params.zEqn = val
//             let newEqn = thisObj.buildGLSLEquation();
//             thisObj.curve.setFunction(newEqn);
//             thisObj.buildJSEquation();
//         });
//
//         ui.add(thisObj.params,'yEqn').name('z(s)=').onFinishChange(function(val){
//             thisObj.params.yEqn = val;
//             let newEqn = thisObj.buildGLSLEquation();
//             thisObj.curve.setFunction(newEqn);
//             thisObj.buildJSEquation();
//         });

        // let dFolder = ui.addFolder('Domain');
        //
        // dFolder.add(thisObj.params, 'sMin',-10,10,0.01).onChange(function(val){
        //     thisObj.range.min=val;
        //     thisObj.curve.setDomain(thisObj.range);
        // });
        // dFolder.add(thisObj.params, 'sMax',-10,10,0.01).onChange(function(val){
        //     thisObj.range.max=val;
        //     thisObj.curve.setDomain(thisObj.range);
        // });


        //let pFolder = ui.addFolder('Parameters');

        ui.add(thisObj.params, 'a',-0.5,1,0.01).onChange(function(val){
            thisObj.curve.update({a:val});
            thisObj.imCurve.update({a:val,b:thisObj.params.b});
        });
        ui.add(thisObj.params, 'b',0,1.5,0.01).onChange(function(val){
            thisObj.curve.update({b:val});
            thisObj.imCurve.update({a:thisObj.params.a,b:val});
        });
        // pFolder.add(thisObj.params, 'c',-1,1,0.01).onChange(function(val){
        //     thisObj.curve.update({c:val});
        // });

        let aFolder = ui.addFolder('Animate');
        aFolder.add(thisObj.params,'animate');
        aFolder.add(thisObj.params,'s',thisObj.params.sMin,thisObj.params.sMax,0.01).onChange(function(val){
            thisObj.updateS(val);
            });
    }

    updateS(s){
        let start = this.eqn(this.params.sMin, this.params);
        let end = this.eqn(this.params.sMax, this.params);
        this.start.position.set(start.x, start.y, start.z);
        this.end.position.set(end.x, end.y, end.z);

        let pos = this.eqn(s, this.params);
        let vel = this.derivative(s, this.params);

        this.positionVector.setDir(pos);
        this.velocityVector.setDir(vel);
        this.velocityVector.setPos(pos);

        this.xComponent.setDir(new Vector3(vel.x, 0, 0));
        this.xComponent.setPos(pos);

        this.yComponent.setDir(new Vector3(0, 0, vel.z));
        this.yComponent.setPos(pos);


        this.xConnection.setDir(new Vector3(0, 0, vel.z));
        this.xConnection.setPos(pos.clone().add(new Vector3(vel.x, vel.y, 0)));

        this.yConnection.setDir(new Vector3(vel.x, vel.y, 0));
        this.yConnection.setPos(pos.clone().add(new Vector3(0, 0, vel.z)));

        this.imPos.resize(new Vector3(s, 0, 0), this.imEqn(s, this.params));
        this.imSlope.setX(s);
    }

    tick(time,dTime) {

        this.params.time = time;
        this.curve.update({time: time});


        if (this.params.animate) {
            let s = (1. - Math.cos(time / 5.)) / 2;
            s = this.params.sMin + (this.params.sMax - this.params.sMin) * s;
            this.updateS(s);
        }
    }
}

export default ComplexSpiral;
