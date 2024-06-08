import {
    MeshPhysicalMaterial,
    DoubleSide,
    Vector3,
    SphereBufferGeometry,
    Mesh,
} from "../../../3party/three/build/three.module.js";


import DomainPlot from "../../components/vector-calculus/DomainPlot.js";
import ParametricSurface from "../../compute/parametric/ParametricSurface.js";
import ParametricSurfaceCPU from "../../compute/parametric/ParametricSurfaceCPU.js";
import {Rod} from "../../components/basic-shapes/Rod.js";







let surfaceOptions = {
    clearcoat:1,
    roughness:0.1,
}

let glassOptions = {
    clearcoat:2,
    transparent:true,
    transmission:0.9,
    ior:1.5,
    color:0xffffff,
    roughness:0,
    side:DoubleSide,
    uRes:3,
    vRes:3,
}


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();






let defaultSetup = {
    animate: true,
    xEqn: "2.*sin(u)*cos(v)",
    yEqn: "2.*cos(u)",
    zEqn: "2.*sin(u)*sin(v)",
    range: {u: {min: 0, max: 3.14}, v:{min:-3.14, max:3.14}},
    showPos: true,
    tangentPlaneSize:2,
}


class ParametricTangentPlane {
    constructor(renderer, setup = defaultSetup) {

        this.renderer = renderer;

        this.range = setup.range;

        this.params = {
            uMin:this.range.u.min,
            uMax:this.range.u.max,
            vMin:this.range.v.min,
            vMax:this.range.v.max,
            showPos:setup.showPos,
            uPos:0.5,
            vPos:0.5,
            animate:setup.animate,
            xEqn: setup.xEqn,
            yEqn: setup.yEqn,
            zEqn: setup.zEqn,
            a:0,
            b:0,
            c:0,
        }

        this.xEqn=this.params.xEqn;
        this.yEqn=this.params.yEqn;
        this.zEqn=this.params.zEqn;



        this.tangentRange = {
            u:{min:-setup.tangentPlaneSize, max:setup.tangentPlaneSize},
            v:{min:-setup.tangentPlaneSize, max:setup.tangentPlaneSize}
        };

        this.rescaleU=function(u){
            return this.range.u.min+(this.range.u.max-this.range.u.min)*u;
        }

        this.rescaleV=function(v){
            return this.range.v.min+(this.range.v.max-this.range.v.min)*v;
        }


        this.uniforms = {
            showPos:{type:'bool',value:this.params.showPos},
            uPos:{type:'float', value:this.params.uPos},
            vPos:{type:'float', value:this.params.vPos},
            a:{type:'float',value:this.params.a},
            b:{type:'float',value:this.params.b},
            c:{type:'float',value:this.params.c},
        };


        this.domainColor = `
           vec3 colorFn(vec2 uv){
                      float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));
             vec3 final = base + 2.*vec3(grid);
             
   
              //have to flip vPos around
              //because we have switched y and z for vector calc students:
              float newV = 1.-vPos;
              
              
                if(abs(uv.x-uPos)<0.01){
                    final=vec3(0.7,0.05,0.1);
                }
                if(abs(uv.y-newV)<0.01){
                    final=vec3(0.1,0.05,0.7);
                }
                if(length(uv-vec2(uPos,newV))<0.02){
                    final=vec3(0);
                }
             
             
             return final;
           }
        `;

        this.surfaceColor= `
           vec3 colorFn(vec2 uv, vec3 xyz){

                      float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));
             vec3 final = base + 2.*vec3(grid);
             

                if(abs(uv.x-uPos)<0.005){
                    final=vec3(0.7,0.05,0.1);
                }
                if(abs(uv.y-vPos)<0.005){
                    final=vec3(0.1,0.05,0.7);
                }
   
            return final;
             
           }
        `;

        this.surface = new ParametricSurface(this.buildGLSLEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions);
        this.domainPlot = new DomainPlot(this.renderer, this.params.eqn,this.range,this.uniforms,this.domainColor);
        this.domainPlot.setPosition(0,-4,0);

        this.buildJSEquation();

        this.tangentPlane = new ParametricSurfaceCPU(this.tangentEqn,this.tangentRange,glassOptions);

        let pos = this.uEqn(this.params.uPos, this.params);
        let deriv = this.uDerivative(this.params.uPos,this.params)
        let end1 = new Vector3().addVectors(pos,deriv.clone().multiplyScalar(this.tangentRange.u.min));
        let end2 = new Vector3().addVectors(pos,deriv.clone().multiplyScalar(this.tangentRange.u.max));
        this.uTangent = new Rod({end1:end1,end2:end2,radius:0.05,color:0x41e46d6});

        pos = this.uEqn(this.params.vPos, this.params);
        deriv = this.uDerivative(this.params.vPos,this.params)
        end1 = new Vector3().addVectors(pos,deriv.clone().multiplyScalar(this.tangentRange.v.min));
        end2 = new Vector3().addVectors(pos,deriv.clone().multiplyScalar(this.tangentRange.v.max));
        this.vTangent = new Rod({end1:end1,end2:end2,radius:0.05,color:0xd61e1e});

        let ptMat = new MeshPhysicalMaterial({
            clearcoat:1,
            color:0x000000,
        });
        let ptGeom = new SphereBufferGeometry(0.12,32,16);
        this.point = new Mesh(ptGeom,ptMat);
        this.point.position.set(pos.x,pos.y,pos.z);
    }

    buildGLSLEquation(){

        return `vec3 eqn( vec2 uv ){
        
            float u = uv.x;
            float v = uv.y;
            
            float x = ${this.params.xEqn};
            float y = ${this.params.yEqn};
            float z = ${this.params.zEqn};
           
            vec3 end = vec3(x,y,z);
           
            return end;
            
       }`;
    }


    //build a javascript analog of what is happening above
    buildJSEquation(){

        let thisObj=this;

        let xC = parser.evaluate('xEqn(u,v,time,a,b,c)='.concat(this.xEqn));
        let yC = parser.evaluate('yEqn(u,v,time,a,b,c)='.concat(this.yEqn));
        let zC = parser.evaluate('zEqn(u,v,time,a,b,c)='.concat(this.zEqn));

        this.eqn = function(u,v, params={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){
            let x = xC(u,v,params.time,params.a,params.b,params.c);
            let y = yC(u,v,params.time,params.a,params.b,params.c);
            let z = zC(u,v,params.time,params.a,params.b,params.c);
            return new Vector3(x,y,z);
        }

        this.uEqn=function(s,params={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){
            return thisObj.eqn(s,thisObj.rescaleV(params.vPos),params);
        }

        this.uDerivative = function(s,params={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){
            let epsilon = 0.001;
            let v0=thisObj.uEqn(s-epsilon,params);
            let v1=thisObj.uEqn(s+epsilon,params);
            let diff = new Vector3().subVectors(v1,v0).divideScalar(2.*epsilon);
            return diff;
        }

        this.vEqn=function(s,params={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){
            return thisObj.eqn(thisObj.rescaleU(params.uPos),s,params);
        }

        this.vDerivative = function(s,params={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){
            let epsilon = 0.001;
            let v0=thisObj.vEqn(s-epsilon,params);
            let v1=thisObj.vEqn(s+epsilon,params);
            let diff = new Vector3().subVectors(v1,v0).divideScalar(2.*epsilon);
            return diff;
        }

        this.tangentEqn = function(u,v, params={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){
            let pos = thisObj.eqn(thisObj.rescaleU(params.uPos),thisObj.rescaleV(params.vPos),params);
             let du = thisObj.uDerivative(thisObj.rescaleU(params.uPos),params).normalize();
             let dv = thisObj.vDerivative(thisObj.rescaleV(params.vPos),params).normalize();
             return pos.addScaledVector(du,u).addScaledVector(dv,v);
        }

    }


    updateTangents(){
        let trueU = this.rescaleU(this.params.uPos);
        let pos = this.uEqn(trueU, this.params);
        let deriv = this.uDerivative(trueU,this.params).normalize();
        let end1 = new Vector3().addVectors(pos,deriv.clone().multiplyScalar(this.tangentRange.u.min));
        let end2 = new Vector3().addVectors(pos,deriv.clone().multiplyScalar(this.tangentRange.u.max));
        this.uTangent.resize(end1,end2);

        let trueV= this.rescaleV(this.params.vPos);
        pos = this.vEqn(trueV, this.params);
        deriv = this.vDerivative(trueV,this.params).normalize();
        end1 = new Vector3().addVectors(pos,deriv.clone().multiplyScalar(this.tangentRange.v.min));
        end2 = new Vector3().addVectors(pos,deriv.clone().multiplyScalar(this.tangentRange.v.max));
        this.vTangent.resize(end1,end2);

        this.point.position.set(pos.x,pos.y,pos.z);

        this.tangentPlane.setEqn(this.tangentEqn);
        this.tangentPlane.update(this.params);
    }



    addToScene(scene){

        this.surface.addToScene(scene);
        this.domainPlot.addToScene(scene);
        this.uTangent.addToScene(scene);
        this.vTangent.addToScene(scene);
        this.tangentPlane.addToScene(scene);
        scene.add(this.point);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(thisObj.params,'xEqn').name('x(u,v)=').onFinishChange(function(val){
            thisObj.params.xEqn = val;
            thisObj.xEqn=val;
            let newEqn = thisObj.buildGLSLEquation();
            thisObj.surface.setFunction(newEqn);
            thisObj.buildJSEquation();
            thisObj.updateTangents();
        });


        // RENAMING Y AND Z BECAUSE VECTOR CALC

        ui.add(thisObj.params,'zEqn').name('y(u,v)=').onFinishChange(function(val){
            thisObj.params.zEqn = val
            thisObj.zEqn=val;
            let newEqn = thisObj.buildGLSLEquation();
            thisObj.surface.setFunction(newEqn);
            thisObj.buildJSEquation();
            thisObj.updateTangents();
        });

        ui.add(thisObj.params,'yEqn').name('z(u,v)=').onFinishChange(function(val){
            thisObj.params.yEqn = val;
            thisObj.yEqn=val;
            let newEqn = thisObj.buildGLSLEquation();
            thisObj.surface.setFunction(newEqn);
            thisObj.buildJSEquation();
            thisObj.updateTangents();
        });


        let dFolder = ui.addFolder('Domain');

        dFolder.add(thisObj.params, 'uMin',-10,10,0.01).onChange(function(val){
            thisObj.range.u.min=val;
            thisObj.surface.setDomain(thisObj.range);
            thisObj.domainPlot.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'uMax',-10,10,0.01).onChange(function(val){
            thisObj.range.u.max=val;
            thisObj.surface.setDomain(thisObj.range);
            thisObj.domainPlot.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'vMin',-10,10,0.01).onChange(function(val){
            thisObj.range.v.min=val;
            thisObj.surface.setDomain(thisObj.range);
            thisObj.domainPlot.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'vMax',-10,10,0.01).onChange(function(val){
            thisObj.range.v.max=val;
            thisObj.surface.setDomain(thisObj.range);
            thisObj.domainPlot.setDomain(thisObj.range);
        });


        let pFolder = ui.addFolder('Parameters');

        pFolder.add(thisObj.params, 'a',-1,1,0.01).onChange(function(val){
            thisObj.surface.update({a:val});
        });
        pFolder.add(thisObj.params, 'b',-1,1,0.01).onChange(function(val){
            thisObj.surface.update({b:val});
        });
        pFolder.add(thisObj.params, 'c',-1,1,0.01).onChange(function(val){
            thisObj.surface.update({c:val});
        });


        ui.add(thisObj.params, 'uPos',0,1,0.01).name("u0").onChange(function(val){
            thisObj.params.uPos=val;
            thisObj.surface.update({uPos:val});
            thisObj.domainPlot.update({uPos:val});

            thisObj.buildJSEquation();
            thisObj.updateTangents();
        });



        ui.add(thisObj.params, 'vPos',0,1,0.01).name("v0").onChange(function(val){
            thisObj.params.vPos=val;
            thisObj.surface.update({vPos:val});
            thisObj.domainPlot.update({vPos:val});

            thisObj.buildJSEquation();
            thisObj.updateTangents();

        });

        ui.add(thisObj.params, 'animate');

    }

    tick(time,dTime){
        if(this.params.animate ){

            this.buildJSEquation();


            this.params.uPos = 0.25*Math.sin(time)+0.5;
            this.params.vPos = 0.25*Math.sin(time/3)+0.5;

            this.surface.update({uPos:this.params.uPos, vPos:this.params.vPos});
            this.domainPlot.update({uPos:this.params.uPos, vPos:this.params.vPos});

            this.updateTangents();

        }
    }
}



export default ParametricTangentPlane;
