import {
    BoxBufferGeometry,
    DoubleSide,
    MeshPhysicalMaterial,
    Vector3,
    Mesh, BufferGeometry,
} from "../../../3party/three/build/three.module.js";

import {Geometry,Face3} from "../../../3party/three/examples/jsm/deprecated/Geometry.js";

import {Rod} from "../../../code/items/basic-shapes/Rod.js";


class Pythagorean3d{
    constructor() {
        this.params = {
            animate:true,
            x: 1,
            y: 1,
            z: 1,
        }

        this.xRod = new Rod({
            end1: new Vector3(0,0,0),
            end2: new Vector3(this.params.x,0,0),
            radius: 0.05
        });

        this.zRod = new Rod({
            end1: new Vector3(this.params.x,0,0),
            end2: new Vector3(this.params.x,0,this.params.z),
            radius: 0.05
        });

        this.yRod = new Rod({
            end1: new Vector3(this.params.x,0,this.params.z),
            end2: new Vector3(this.params.x,this.params.y,this.params.z),
            radius: 0.05
        });

        this.xzRod = new Rod({
            end1:new Vector3(0,0,0),
            end2: new Vector3(this.params.x, 0, this.params.z),
            radius:0.1,
        });

        this.xyzRod = new Rod({
            end1:new Vector3(0,0,0),
            end2: new Vector3(this.params.x, this.params.y, this.params.z),
            radius:0.15,
        });

        let boxGeom = new BoxBufferGeometry(1,1,1);
        let boxMat = new MeshPhysicalMaterial({
            clearcoat:1,
            envMapIntensity:2,
            side:DoubleSide,
            transparent:true,
            transmission:0.9,
            ior:1,
        });

        this.box = new Mesh(boxGeom,boxMat);
        this.box.scale.set(this.params.x,this.params.y,this.params.z);
        this.box.position.set(this.params.x/2,this.params.y/2,this.params.z/2);


    }

    update(){

        let zero = new Vector3(0,0,0);
        let x = new Vector3(this.params.x,0,0);
        let y = new Vector3(this.params.x,this.params.y,this.params.z);
        let z = new Vector3(this.params.x,0,this.params.z);
        let xz = new Vector3(this.params.x, 0, this.params.z);
        let xyz = new Vector3(this.params.x, this.params.y, this.params.z);

        this.xRod.resize(zero,x);
        this.zRod.resize(x,z);
        this.yRod.resize(z,y);
        this.xzRod.resize(zero, xz);
        this.xyzRod.resize(zero,xyz);

        this.box.scale.set(this.params.x,this.params.y,this.params.z);
        this.box.position.set(this.params.x/2,this.params.y/2,this.params.z/2);



    }


    addToScene(scene){
        this.xRod.addToScene(scene);
        this.yRod.addToScene(scene);
        this.zRod.addToScene(scene);
        this.xzRod.addToScene(scene);
        this.xyzRod.addToScene(scene);
        scene.add(this.box);

    }

    addToUI(ui){
        let thisObj = this;
        ui.add(thisObj.params,'animate');
        ui.add(thisObj.params,'x',0,5,0.01).name("X").onChange(function(val){
            thisObj.update();
        });
        ui.add(thisObj.params,'z',0,5,0.01).name("Y").onChange(function(val){
            thisObj.update();
        });
        ui.add(thisObj.params,'y',0,5,0.01).name("Z").onChange(function(val){
            thisObj.update();
        });

    }

    tick(time,dTime){
        if(this.params.animate){
            this.params.x = 2.3+Math.sin(time);
            this.params.y = 2.5+Math.cos(2*time);
            this.params.z = 3 + 1.9*Math.sin(time/2);
            this.update();
        }
    }

}

export default Pythagorean3d;
