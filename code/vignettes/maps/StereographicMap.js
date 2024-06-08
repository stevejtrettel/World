import {Object3D,Matrix3} from "../../../3party/three/build/three.module.js";
import Stereographic from "../../items/maps/Stereographic.js";


class StereographicMap{
    constructor() {
        this.map = new Stereographic();
        this.dummy = new Object3D();

    }


    addToScene(scene){
        this.map.addToScene(scene);
    }

    addToUI(ui){
        let params = {
            homotopy:0,
            rotate:0.5,
            animate:false,
        }
        let mercator = this.map;
        ui.add(params,'homotopy',0,1,0.01).onChange(function(value){
            mercator.uniforms.homotopy.value = value;
        });
        ui.add(params,'rotate',0,1,0.01).name('Rotate').onChange(function(value){
            mercator.uniforms.rotate.value=value;
        });
        ui.add(params,'animate').name('Tumble').onChange(function(value){
            mercator.uniforms.animate.value = value;
        });
    }

    tick(time,dTime){
        if(this.map.uniforms.animate.value) {
            this.dummy.rotateX(0.005).rotateY(0.002).rotateZ(0.003);
            this.dummy.updateMatrix();
            let mat = new Matrix3().setFromMatrix4(this.dummy.matrix);
            this.map.uniforms.orientation.value = mat;
        }
        this.map.uniforms.time.value = time;
    }
}



export default StereographicMap;
