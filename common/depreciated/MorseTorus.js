
import {
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
} from "../../../3party/three/build/three.module.js";


import ParametricSurface from "../../components/parametric/ParametricSurface.js";

let planeMaterial=new MeshPhysicalMaterial({
    side:DoubleSide,
    transparent:true,
    transmission:0.95,
    clearcoat:1,
    ior:1,
});

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}


class MorseTorus{
   constructor() {

       this.range = {
           u:{min:0, max:6.29},
           v:{min:0, max:6.29}
       };

       this.params = {
           animate:true,
           slice: 0,
           xEqn: "1.5*(2.+cos(v))*cos(u)",
           yEqn: "1.5*(2.+cos(v))*sin(u)",
           zEqn: "1.5*sin(v)",
           cutTop:true,
       }

       this.uniforms = {
           slice:{type:'float',value:this.params.slice},
           cutTop:{type:'bool',value:this.params.cutTop}
       };

       this.surfaceColor= `
            vec3 colorFn(vec2 uv, vec3 xyz){
            
                float height = xyz.y;
            
                 float grid1 = (1.-pow(abs(sin(3.14*height)),0.1))/10.;
                 float grid2 = (1.-pow(abs(sin(3.*3.14*height)),0.1))/25.;
                 float grid3 = (1.-pow(abs(sin(9.*3.14*height)),0.1))/50.;
                 float grid = grid1+grid2+grid3;
            
                if(cutTop && (height-slice)>0.){
                    discard;
                }
           
                if(abs(height-slice)<0.1){
                    return vec3(0.8,0.8,0);
              }
              else if(height-slice<0.){
                return vec3(0.03,0.03,0.1)+vec3(grid);
              }
              return vec3(0.03,0.1,0.03)+vec3(grid);
            }
        `;

       this.surface = new ParametricSurface(this.buildEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions);

       //making the apparatus for showing the slicing:
       let planeGeometry = new PlaneBufferGeometry(20,20);

       this.slicePlane = new Mesh(planeGeometry,planeMaterial);
       this.slicePlane.rotateX(Math.PI/2);



   }

   buildEquation(){

       return `vec3 eqn( vec2 uv ){
            float u = uv.x;
            float v = uv.y;
            
            float x = ${this.params.xEqn};
            float y = ${this.params.yEqn};
            float z = ${this.params.zEqn};
            
            return vec3(x,y,z);
       }`;
   }

    setSlice(slice){
        this.params.slice=slice;
        this.slicePlane.position.set(0,slice,0);
        this.surface.update({slice:slice});
    }


    addToScene(scene){
        this.surface.addToScene(scene);
        scene.add(this.slicePlane);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(thisObj.params,'xEqn').name('x(u,v)=').onFinishChange(function(val){
            thisObj.params.xEqn = val;
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        ui.add(thisObj.params,'yEqn').name('y(u,v)=').onFinishChange(function(val){
            thisObj.params.yEqn = val;
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        ui.add(thisObj.params,'zEqn').name('z(u,v)=').onFinishChange(function(val){
            thisObj.params.zEqn = val;
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        ui.add(thisObj.params,'animate').name('Animate');

        ui.add(thisObj.params, 'slice',-5,5,0.01).name('Slice').onChange(function(val){
            thisObj.setSlice(val);
        });

        ui.add(thisObj.params, 'cutTop').name('Remove Top').onChange(function(val){
           thisObj.surface.update({cutTop:val});
        });

    }

    tick(time,dTime){
        if(this.params.animate ){
            let val = 5. * Math.sin(time / 3.);
            this.setSlice(val);
        }
    }
}



export default MorseTorus;