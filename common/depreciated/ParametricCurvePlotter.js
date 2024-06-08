import ParametricCurve from "../compute/parametric/ParametricCurve.js";
import {
    Mesh,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    Vector3
} from "../../3party/three/build/three.module.js";

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


class ParametricCurvePlotter {
    constructor() {

        this.params = {
            sMin:-3.14,
            sMax:3.14,
            animate:false,
            xEqn: "(2.+cos(s))*sin(4.*s)",
            yEqn: "2.*sin(s)",
            zEqn: "(2.+cos(s))*cos(4.*s)",
            a:0,
            b:0,
            c:0,
            homotopy: 1,
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

        //build the curve
        this.curve = new ParametricCurve(this.buildGLSLEquation(),this.range,this.uniforms,this.curveColor,surfaceOptions);

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
        
            float animationParam = homotopy;
            s=s*animationParam;
           
            float x = ${this.params.xEqn};
            float y = ${this.params.yEqn};
            float z = ${this.params.zEqn};

                        
            //JUST FOR ANIMATION: OTHERWISE RETURN XYZ
            //find the "basepoint" so the surface stays fixed in space
            s=0.;
            float x0 = ${this.params.xEqn};
            float y0 = ${this.params.yEqn};
            float z0 = ${this.params.zEqn};
            
            //rescale surface
            return (vec3(x,y,z)-vec3(x0,y0,z0))/animationParam+vec3(x0,y0,z0);
            
            
            return vec3(x,y,z);
           
       }`;
    }


    //build a javascript analog of what is happening above
    buildJSEquation(){

        let xC = parser.evaluate('xEqn(s,time,a,b,c)='.concat(this.params.xEqn));
        let yC = parser.evaluate('yEqn(s,time,a,b,c)='.concat(this.params.yEqn));
        let zC = parser.evaluate('zEqn(s,time,a,b,c)='.concat(this.params.zEqn));


        this.eqn = function(s, params={time:0,a:0,b:0,c:0,homotopy:1}){

            let animationParam = params.homotopy;
            s = s*animationParam;

            let x = xC(s,params.time,params.a,params.b,params.c);
            let y = yC(s,params.time,params.a,params.b,params.c);
            let z = zC(s,params.time,params.a,params.b,params.c);

            let x0 = xC(0,params.time,params.a,params.b,params.c);
            let y0 = yC(0,params.time,params.a,params.b,params.c);
            let z0 = zC(0,params.time,params.a,params.b,params.c);

            let res =  new Vector3(x,y,z);
            let base = new Vector3(x0,y0,z0)

            return ((res.sub(base)).divideScalar(animationParam)).add(base);
        }

        this.checkPeriodic();
    }



    addToScene(scene){
        this.curve.addToScene(scene);
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

        ui.add(thisObj.params, 'animate').name('Animate');

    }

    tick(time,dTime){

        this.params.time=time;
        this.curve.update({time:time});

        if(this.params.animate ){

            let val = (1+Math.cos(time/2))/2.;
            this.params.homotopy=val;
            this.curve.update({homotopy:val});
            this.checkPeriodic();

        }

        else{
            this.params.homotopy=1;
            this.curve.update({homotopy:1});
        }
    }
}





let ex = new ParametricCurvePlotter();
export default {ex};
