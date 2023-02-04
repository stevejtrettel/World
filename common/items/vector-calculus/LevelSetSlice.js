import {
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
    SphereBufferGeometry,
    Mesh, Vector3, DoubleSide,
} from "../../../3party/three/build/three.module.js";

import {Rod} from "../../components/Calculus/Rod.js";
import Graph3D from "../../components/vector-calculus/Graph3D.js";
import ContourPlotOld from "../../components/vector-calculus/ContourPlotOld.js";
import ContourPlot2D from "../../components/vector-calculus/ContourPlot2D.js";

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


let pointMaterial = new MeshPhysicalMaterial({

});




//really everything should be done in terms Graph3D
//BUT theres some annoying issue right now, where I can't use two of them in the same object
//both just draw the first surface even tho they have different shaders :(
//SO in the mean time - a hack!!!
//we will use contourPlot2D in addition :(




class LevelSetSlice {
    constructor() {

        this.range = {
            u:{min:-10, max:10},
            v:{min:-10, max:10}
        };

        this.params = {
            animate:true,
            slice: 0,
            eqn: '2.*(cos(u)+sin(u*v/5.))',
        }

        this.uniforms = {
            slice:{type:'float',value:this.params.slice}
        };

        this.contourColor = `
            vec3 colorFn(float z){
              
              if(abs(z-slice)<0.1){
                return vec3(0.8,0.8,0);
              }
              
              return vec3(0.03,vUv);
            }
        `;

        this.surfaceColor= `
            vec3 colorFn(vec2 uv, vec3 xyz){
            
             
             float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
           
                float height = xyz.y;
                if(abs(height-slice)<0.1){
                    return vec3(0.8,0.8,0);
              }
              else if(height-slice<0.){
                return vec3(0.08,0.08,0.2)+vec3(grid);
              }
              return vec3(0.08,0.2,0.08)+vec3(grid);
            }
        `;

        this.graph = new Graph3D(this.params.eqn,this.range,this.uniforms,this.surfaceColor,surfaceOptions);

        this.contour = new ContourPlot2D(this.params.eqn,this.range,this.uniforms,this.contourColor);

        this.contour.setPosition(0,-7,0);

        //making the apparatus for showing the slicing:
        let pointGeometry = new SphereBufferGeometry(0.4);
        let planeGeometry = new PlaneBufferGeometry(20,20);

        this.slicePlane = new Mesh(planeGeometry,planeMaterial);
        this.slicePlane.rotateX(Math.PI/2);

        this.slicePoint = new Mesh(pointGeometry, pointMaterial);


        //make the rod:
        this.axis = new Rod({
            end1:new Vector3(0,-5,0),
            end2:new Vector3(0,5,0),
        });


    }

    setSlice(slice){

        this.params.slice=slice;

        this.slicePlane.position.set(0,slice,0);
        this.slicePoint.position.set(0,slice,0);
       // this.slicePoint.material.color

        //update uniforms to highlight the slice:
        this.contour.update({slice:slice});
        this.graph.update({slice:slice});
    }


    addToScene(scene){

        this.graph.addToScene(scene);
        this.contour.addToScene(scene);

        this.axis.addToScene(scene);
        scene.add(this.slicePoint);
        scene.add(this.slicePlane);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(thisObj.params,'animate').name('Animate');

        ui.add(thisObj.params,'eqn').name('Equation').onFinishChange(function(val){
            thisObj.contour.setFunction(val);
            thisObj.graph.setFunction(val);
        });

        ui.add(thisObj.params, 'slice',-5,5,0.01).name('Slice').onChange(function(val){
            thisObj.setSlice(val);
        });



    }

    tick(time,dTime){
        if(this.params.animate ){
                let val = 5. * Math.sin(time / 3.);
                this.setSlice(val);
        }
    }
}




let ex = new LevelSetSlice();

export default {ex};