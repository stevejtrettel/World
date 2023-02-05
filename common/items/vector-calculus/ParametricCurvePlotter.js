import ParametricCurve from "../../components/parametric/ParametricCurve.js";

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}



class ParametricCurvePlotter {
    constructor() {


        this.params = {
            sMin:-3.14,
            sMax:3.14,
            animate:false,
            xEqn: "(2.+cos(4.*s))*sin(s)",
            yEqn: "sin(4.*s)",
            zEqn: "(2.+cos(4.*s))*cos(s)",
            a:0,
            b:0,
            c:0,
            homotopy: 1,
        }

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

        this.surfaceColor= `
            vec3 colorFn(float s, vec3 xyz){
             
             float grid1 = (1.-pow(abs(sin(10.*3.14*s)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*s)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*s)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*vec3(s,1.-s,s)+vec3(0,2,4));
             
             return base + 2.*vec3(grid);
            }
        `;

        this.surface = new ParametricCurve(this.buildEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions);

    }

    buildEquation(){

        return `vec3 eqn( float s ){
        
            float animationParam = homotopy+0.05;
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


    addToScene(scene){
        this.surface.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(thisObj.params,'xEqn').name('x(s)=').onFinishChange(function(val){
            thisObj.params.xEqn = val;
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

//switched the name of the following two for vector calculus class:

        ui.add(thisObj.params,'zEqn').name('y(s)=').onFinishChange(function(val){
            thisObj.params.zEqn = val
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        ui.add(thisObj.params,'yEqn').name('z(s)=').onFinishChange(function(val){
            thisObj.params.yEqn = val;
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        let dFolder = ui.addFolder('Domain');

        dFolder.add(thisObj.params, 'sMin',-10,10,0.01).onChange(function(val){
            thisObj.range.min=val;
            thisObj.surface.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'sMax',-10,10,0.01).onChange(function(val){
            thisObj.range.max=val;
            thisObj.surface.setDomain(thisObj.range);

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

        ui.add(thisObj.params, 'animate').name('Animate');

    }

    tick(time,dTime){
        this.surface.update({time:time});
        if(this.params.animate ){
            let val = (1+Math.cos(time/2))/2.;
            this.surface.update({homotopy:val});
            // let val = (1+Math.cos(time/2))/2.;
            // let spread = this.params.sMax-this.params.sMin;
            // let newMax = this.params.sMin + val * spread;
            // this.surface.update({sMax:newMax});
        }

        else{
            this.surface.update({homotopy:1});
        }
    }
}





let ex = new ParametricCurvePlotter();
export default {ex};