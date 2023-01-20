import {
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
    SphereBufferGeometry,
    Mesh, Vector3, DoubleSide,
} from "../../../3party/three/build/three.module.js";


import Graph3D from "../../components/VectorCalculus/Graph3D.js";
import ContourPlot2D from "../../components/VectorCalculus/ContourPlot2D.js";
import {Rod} from "../../components/Calculus/Rod.js";




let planeMaterial=new MeshPhysicalMaterial({
    side:DoubleSide,
    transparent:true,
    transmission:0.95,
    clearcoat:1,
    ior:1,
});


let pointMaterial = new MeshPhysicalMaterial({

});








class ImplicitCurveSlice{
    constructor() {

        this.range = {
            x:{min:-10, max:10},
            y:{min:-10, max:10}
        };

        this.params = {
            slice: 0,
            eqn: 'cos(x)+sin(x*y)',
        }

        this.uniforms = {

        };

        this.uniformString = `
        
        `;

        this.graph = new Graph3D();
        this.contour = new ContourPlot2D(this.params.eqn, this.uniforms, this.uniformString,this.range);
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
        this.slicePlane.position.set(0,slice,0);
        this.slicePoint.position.set(0,slice,0);
       // this.slicePoint.material.color

        //update uniforms to highlight the slice:
        this.contour.update();
        this.graph.update();
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

        ui.add(thisObj.params,'eqn').name('Equation').onChange(function(val){
            thisObj.contour.setFunction(val);
            thisObj.graph.setFunction(val);
        });

        ui.add(thisObj.params, 'slice',-5,5,0.01).name('Slice').onChange(function(val){
            thisObj.setSlice(val);
        });



    }

    tick(time,dTime){

    }
}




let ex = new ImplicitCurveSlice();

export default {ex};