import {
    Vector3,
    SphereBufferGeometry,
    MeshPhysicalMaterial,
    Mesh
} from "../../../3party/three/build/three.module.js";

import ParametricCurve from "../../compute/parametric/ParametricCurve.js";
import Vector from "../../components/basic-shapes/Vector.js";
import {Rod} from "../../components/basic-shapes/Rod.js";


let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


class ParametricCurveTangent {
    constructor() {

        this.params = {
            sMin:-3.14,
            sMax:3.14,
            tangent:1,
            xEqn: "(2.+cos(4.*s))*sin(s)",
            yEqn: "sin(4.*s)",
            zEqn: "(2.+cos(4.*s))*cos(s)",
            a:0,
            b:0,
            c:0,
            time:0,
        }

        this.periodic=true;

        //starting and ending balls of the curve (if its not periodic):
        let sph = new SphereBufferGeometry(0.2,32,16);
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
        let dir = vel.clone().normalize();
        let end1 = pos.clone().add(dir.clone().multiplyScalar(-3));
        let end2 = pos.clone().add(dir.clone().multiplyScalar(3));

        this.positionVector = new Vector(pos,0xffffff,0.5);
        this.velocityVector = new Vector(vel,0x33B85A,0.85);
        this.tangentLine = new Rod({end1:end1, end2:end2, radius:0.1});
        this.tangentLine.setVisibility(false);

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

        let thisObj=this;
        this.derivative = function(s,params={time:0,a:0,b:0,c:0}){
            let epsilon = 0.001;
            let v0=thisObj.eqn(s-epsilon);
            let v1=thisObj.eqn(s+epsilon);
            let diff = new Vector3().subVectors(v1,v0).divideScalar(2.*epsilon);
            return diff;
        }

    }


    addToScene(scene){
        this.curve.addToScene(scene);
        this.positionVector.addToScene(scene);
        this.velocityVector.addToScene(scene);
        this.tangentLine.addToScene(scene);
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
        });

//switched the name of the following two for vector calculus class:

        ui.add(thisObj.params,'zEqn').name('y(s)=').onFinishChange(function(val){
            thisObj.params.zEqn = val
            let newEqn = thisObj.buildGLSLEquation();
            thisObj.curve.setFunction(newEqn);
            thisObj.buildJSEquation();
        });

        ui.add(thisObj.params,'yEqn').name('z(s)=').onFinishChange(function(val){
            thisObj.params.yEqn = val;
            let newEqn = thisObj.buildGLSLEquation();
            thisObj.curve.setFunction(newEqn);
            thisObj.buildJSEquation();
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

        ui.add(thisObj.params,'tangent',{'vector':1,'line':2}).onChange(function(val){
            if(val==1){
                thisObj.velocityVector.setVisibility(true);
                thisObj.tangentLine.setVisibility(false);
            }
            else{
                thisObj.velocityVector.setVisibility(false);
                thisObj.tangentLine.setVisibility(true);
            }
        })
    }

    tick(time,dTime){

        this.params.time=time;
        this.curve.update({time:time});
        let s;
        if(this.periodic){
            s=time/2.;
        }
        else{
            s = (1.-Math.cos(time/3.))/2;
            s= this.params.sMin+(this.params.sMax-this.params.sMin)*s;
        }


            let pos = this.eqn(s,this.params);
            let vel = this.derivative(s,this.params).multiplyScalar(0.5);
            let dir = vel.clone().normalize();
            let end1 = pos.clone().add(dir.clone().multiplyScalar(-5));
            let end2 = pos.clone().add(dir.clone().multiplyScalar(5));


            this.positionVector.setDir(pos);

            this.velocityVector.setDir(vel);
            this.velocityVector.setPos(pos);

            this.tangentLine.resize(end1,end2);


    }
}





let ex = new ParametricCurveTangent();
export default {ex};
