import ParametricSurface from "../../components/parametric/ParametricSurface.js";

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}


class Graph3DPlotter {
    constructor() {
        this.range = {
            u:{min:-3.14, max:3.14},
            v:{min:-3.14, max:3.14}
        };

        this.params = {
            uMin:-3.14,
            uMax:3.14,
            vMin:-3.14,
            vMax:3.14,
            homotopy: 1,
            zEqn: "sin(x*y)",
            a:0,
            b:0,
            c:0,
        }

        this.uniforms = {
            a:{type:'float',value:this.params.a},
            b:{type:'float',value:this.params.b},
            c:{type:'float',value:this.params.c},
        };

        this.surfaceColor= `
            vec3 colorFn(vec2 uv, vec3 xyz){
             
             float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));
             
             return base + 2.*vec3(grid);
            }
        `;

        this.surface = new ParametricSurface(this.buildEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions);

    }

    buildEquation(){

        return `vec3 eqn( vec2 uv ){
        
            float x = uv.x;
            float y = uv.y;
            float z = ${this.params.zEqn};
            
            return vec3(x,z,y);
            
       }`;
    }


    addToScene(scene){
        this.surface.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(thisObj.params,'zEqn').name('z(x,y)=').onFinishChange(function(val){
            thisObj.params.zEqn = val
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        let dFolder = ui.addFolder('Domain');

        dFolder.add(thisObj.params, 'uMin',-10,10,0.01).onChange(function(val){
            thisObj.range.u.min=val;
            thisObj.surface.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'uMax',-10,10,0.01).onChange(function(val){
            thisObj.range.u.max=val;
            thisObj.surface.setDomain(thisObj.range);

        });
        dFolder.add(thisObj.params, 'vMin',-10,10,0.01).onChange(function(val){
            thisObj.range.v.min=val;
            thisObj.surface.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'vMax',-10,10,0.01).onChange(function(val){
            thisObj.range.v.max=val;
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

    }

    tick(time,dTime){
    }
}





let ex = new Graph3DPlotter();
export default ex;