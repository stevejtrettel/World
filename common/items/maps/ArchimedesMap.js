import {Object3D,Matrix3} from "../../../3party/three/build/three.module.js";
import Archimedes from "../../components/maps/Archimedes.js";


class ArchimedesMap{
    constructor() {
        this.map = new Archimedes();
        this.dummy = new Object3D();
    }


    addToScene(scene){
        this.map.addToScene(scene);
    }

    addToUI(ui){
        let params = {
            toCyl:0,
            toPlane:0,
            rotate:0.5,
            animate:false,
        }
        let archimedes = this.map;
        ui.add(params,'toCyl',0,1,0.01).onChange(function(value){
            archimedes.uniforms.toCyl.value = value;
        });
        ui.add(params,'toPlane',0,1,0.01).onChange(function(value){
            archimedes.uniforms.toPlane.value = value;
        });
        ui.add(params,'rotate',0,1,0.01).name('Rotate').onChange(function(value){
            archimedes.uniforms.rotate.value=value;
        });
        ui.add(params,'animate').name('Tumble').onChange(function(value){
            archimedes.uniforms.animate.value = value;
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



export default ArchimedesMap;