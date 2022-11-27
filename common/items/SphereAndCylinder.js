
import {
    CircleBufferGeometry,
    Color,
    ConeBufferGeometry,
    CylinderBufferGeometry,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    Vector3,
    CatmullRomCurve3,
    TubeBufferGeometry,
    RingBufferGeometry,
} from "../../3party/three/build/three.module.js";


//A visualizer of Archimedes proof of the volume of the sphere
//describing it in terms of the exterior of a cone inside a cylinder:

class ConeExterior{
    constructor(radius, material){
        this.radius=radius;

        //use the provided material for the inside
        let innerMat = material;

        //alter the opacity of this material for the outside, so we can see in
        let outerMat = material.clone();
        outerMat.transparent=true;
        outerMat.opacity=0.05;
        outerMat.transmission=0;

        let cylGeom = new CylinderBufferGeometry(this.radius,this.radius,2.*this.radius,32,1,true);
        this.cylinder = new Mesh(cylGeom, outerMat);

        //MAKE THE CONE
        let topConeGeom = new ConeBufferGeometry(this.radius,this.radius,32,1,true);
        topConeGeom.translate(0,-0.5*this.radius,0);
        this.topCone = new Mesh(topConeGeom, innerMat);

        let bottomConeGeom = new ConeBufferGeometry(this.radius,this.radius,32,1,true);
        bottomConeGeom.rotateZ(Math.PI);
        bottomConeGeom.translate(0,0.5*this.radius,0);
        this.bottomCone = new Mesh(bottomConeGeom, innerMat);

    }

    setPosition(x,y,z){
        this.cylinder.position.set(x,y,z);
        this.topCone.position.set(x,y,z);
        this.bottomCone.position.set(x,y,z);
    }

    addToScene(scene){
        scene.add(this.cylinder);
        scene.add(this.topCone);
        scene.add(this.bottomCone);
    }
}



class BoundaryCurve extends Mesh {
    constructor(radius,height){
        super();

        this.radius = radius;
        this.height = height;

        this.material = new MeshPhysicalMaterial({
            clearcoat:1,
            side:DoubleSide,
        });

        this.geometry = this.createGeometry();

    }

    createGeometry(){
        let pts = [];
        let pt,s;
        for(let i=0;i<51;i++){
            s=2.*Math.PI *i/50;
            pt = new Vector3(this.radius*Math.cos(s), this.height, this.radius*Math.sin(s));
            pts.push(pt);
        }
        let curve = new CatmullRomCurve3(pts);
        return new TubeBufferGeometry(curve,64,0.05,8,true);
    }

    update(radius,height){
        this.radius=radius;
        this.height=height;
        this.geometry.dispose();
        this.geometry = this.createGeometry();
    }

}


class SphereSlice{
    constructor(slice,radius){
        this.radius = radius;
        this.slice=slice;

        let sliceHeight = this.radius*this.slice;
        let sliceRadius = this.radius*Math.sqrt(1-this.slice*this.slice);

        let diskGeo = new CircleBufferGeometry(sliceRadius,32);
        diskGeo.rotateX(Math.PI/2);
        diskGeo.translate(0,sliceHeight,0);

        let diskMat = new MeshPhysicalMaterial({
            clearcoat:1,
            side:DoubleSide,
            color: new Color().setHSL(0.6,0.7,0.3),
        });

        this.disk = new Mesh(diskGeo, diskMat);

        this.bdy = new BoundaryCurve(sliceRadius,sliceHeight);

    }

    addToScene(scene){
        scene.add(this.disk);
        scene.add(this.bdy);
    }

    update(slice){

        this.slice=slice;

        let sliceHeight = this.radius*this.slice;
        let sliceRadius = this.radius*Math.sqrt(1-this.slice*this.slice);

        this.disk.geometry.dispose();
        this.disk.geometry = new CircleBufferGeometry(sliceRadius,32);
        this.disk.geometry.rotateX(Math.PI/2);
        this.disk.geometry.translate(0,sliceHeight,0);

        //let hue = 0.4 - 0.5*Math.abs(slice);
        //this.disk.material.color.setHSL(hue,0.75,0.4);

        this.bdy.update(sliceRadius,sliceHeight);

    }

    setPosition(x,y,z){
        this.disk.position.set(x,y,z);
        this.bdy.position.set(x,y,z);
    }
}





class CylinderSlice{
    constructor(slice,radius){
        this.radius = radius;
        this.slice=slice;

        let sliceHeight = this.radius*this.slice;
        let innerSliceRadius = this.radius*Math.abs(this.slice);

        let ringGeo = new RingBufferGeometry(innerSliceRadius,this.radius,32,1);
        ringGeo.rotateX(Math.PI/2);
        ringGeo.translate(0,sliceHeight,0);

        let ringMat = new MeshPhysicalMaterial({
            clearcoat:1,
            side:DoubleSide,
            color: new Color().setHSL(0.6,0.7,0.3),
        });

        this.ring = new Mesh(ringGeo, ringMat);

        this.outerBdy = new BoundaryCurve(this.radius,sliceHeight);
        this.innerBdy = new BoundaryCurve(innerSliceRadius,sliceHeight);

    }

    addToScene(scene){
        scene.add(this.ring);
        scene.add(this.innerBdy);
        scene.add(this.outerBdy);
    }

    update(slice){

        this.slice=slice;

        let sliceHeight = this.radius*this.slice;
        let innerSliceRadius = this.radius*Math.abs(this.slice);

        this.ring.geometry.dispose();
        this.ring.geometry = new RingBufferGeometry(innerSliceRadius,this.radius,32,1);
        this.ring.geometry.rotateX(Math.PI/2);
        this.ring.geometry.translate(0,sliceHeight,0);

        //let hue = 0.4 - 0.5*Math.abs(slice);
        //this.ring.material.color.setHSL(hue,0.75,0.4);

        this.outerBdy.update(this.radius, sliceHeight);
        this.innerBdy.update(innerSliceRadius, sliceHeight);

    }

    setPosition(x,y,z){
        this.ring.position.set(x,y,z);
        this.outerBdy.position.set(x,y,z);
        this.innerBdy.position.set(x,y,z);
    }
}











class SphereAndCylinder{
    constructor() {

        //how big is our sphere and cylinder?
        this.radius =2;

        //where are we slicing things?
        //as a proportion of radius: so it goes from -1 to 1:
        this.slice = 0.25;

        this.params ={
            animate:true,
            slice:0.25,
        }


        //a clear material
        let glassMat = new MeshPhysicalMaterial({
            side: DoubleSide,
            transmission:0.99,
            opacity:0,
            ior:1,
            clearcoat:1,
            envMapIntensity:2,
        });

        //MAKE THE SPHERE
        let sphGeom = new SphereBufferGeometry(this.radius,64,32);
        this.sphere = new Mesh(sphGeom, glassMat);
        this.sphere.position.set(-1.5*this.radius,0,0);

        //MAKE THE CYLINDER
        this.cylinder = new ConeExterior(this.radius,glassMat);
        this.cylinder.setPosition(1.5*this.radius,0,0);


        //what is the geometry we are going to use for the slices?
        let sliceGeometry = new MeshPhysicalMaterial({
            side: DoubleSide,
            clearcoat:1,
            color: new Color().setHSL(0.6,0.5,0.5),
        });

        //A DISK SLICE
        this.sphereSlice = new SphereSlice(this.slice, this.radius);
        this.sphereSlice.setPosition(-1.5*this.radius,0,0);

        //A WASHER SLICE
        this.cylinderSlice = new CylinderSlice(this.slice, this.radius);
        this.cylinderSlice.setPosition(1.5*this.radius,0,0);

    }

    addToScene(scene){
        scene.add(this.sphere);
        this.cylinder.addToScene(scene);
        this.sphereSlice.addToScene(scene);
        this.cylinderSlice.addToScene(scene);
    }

    updateSlice(slice){
        this.slice=slice;
        this.cylinderSlice.update(slice);
        this.sphereSlice.update(slice);
    }

    addToUI(ui){
        let thisObj = this;
        ui.add(this.params,'animate');
        ui.add(this.params,'slice',-1,1,0.01).onChange(function(value){
            if(!thisObj.params.animate){
                thisObj.updateSlice(value);
            }
        });
    }

    tick(time,dTime){
        if(this.params.animate) {
            let slice = Math.sin(time);
            this.updateSlice(slice);
        }
    }
}

let example = new SphereAndCylinder();

export default {example};
