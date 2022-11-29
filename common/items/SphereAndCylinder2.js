import {
    Color,
    ConeBufferGeometry,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    Vector3,
    CatmullRomCurve3,
    TubeBufferGeometry,
    RingBufferGeometry, SphereBufferGeometry,
} from "../../3party/three/build/three.module.js";
import {ParametricGeometry} from "../../3party/three/examples/jsm/geometries/ParametricGeometry.js";




//what is the outer radius of a ring with the same area as a given ring (with inner and outer radii)
//but with a new perscribed inner radius:
function outerRadius(inner,outer, newInner){
    let in2 = inner*inner;
    let out2 = outer*outer;
    let new2 = newInner*newInner;
    return Math.sqrt(out2-in2+new2);
}

//A visualizer of Archimedes proof of the volume of the sphere
//describing it in terms of the exterior of a cone inside a cylinder:
//the class SphereToCylinder is a transparent object, depending on a parameter
//when this parameter is zero it's a cone exterior
//when this parameter is 1, it's a sphere

class DeformCylinder{
    constructor( radius ){

        this.radius=radius;

        //the parameter doing the transition:
        this.t=0.;

        //transmission material for the inside:
        let innerMat = new MeshPhysicalMaterial({
            side: DoubleSide,
            transmission:0.99,
            opacity:0,
            ior:1,
            clearcoat:1,
            envMapIntensity:2,
        });

        //MAKE THE CONES
        let cones = this.createConeGeometries();
        this.topCone = new Mesh(cones.top, innerMat);
        this.bottomCone = new Mesh(cones.bottom, innerMat);

        //make this material transparent, so we can see the transmission material through it.
        let outerMat = new MeshPhysicalMaterial({
            side: DoubleSide,
            transparent: true,
            opacity:0.05,
            clearcoat:1,
            envMapIntensity:2,
        });

        //MAKE THE OUTSIDE
        let outerGeom = this.createOuterGeometry();
        this.outside = new Mesh(outerGeom, outerMat);
    }


    createConeGeometries(){

        //MAKE THE CONE GEOMETRIES
        let coneBase = this.radius*(1.-this.t);
        let topConeGeom = new ConeBufferGeometry(coneBase,this.radius,32,1,true);
        let bottomConeGeom = topConeGeom.clone();

        //PUT THE CONES IN THE RIGHT PLACE
        topConeGeom.translate(0,-0.5*this.radius,0);
        bottomConeGeom.rotateZ(Math.PI);
        bottomConeGeom.translate(0,0.5*this.radius,0);

        return {
            top: topConeGeom,
            bottom: bottomConeGeom,
        }

    }


    createOuterGeometry(){

        //grab any local data we need since cant use "this" inside
        let t = this.t;
        let radius = this.radius;

        //define the function which computes the outer surface
        let func = function(u, v, dest){

            //rescale u and v to s(angle) and z(height)
            let s = 2.*Math.PI*u;
            let y = 2.*radius*v - radius;

            //what is the inner radius of the ring?  this is the cone width:
            let innerRad = (1.-t) * Math.abs(y);

            //what is the original area? before deforming, what were inner and outer radii?
            let origOut = radius;
            let origIn = Math.abs(y);
            //calculate via our formula at the top of the doc:
            let outerRad = outerRadius(origIn,origOut,innerRad);

            //now: find x and z using this
            let x = outerRad * Math.cos(s);
            let z = outerRad * Math.sin(s);

            //send this off to be plotted!
            dest.set(x,y,z);
        }

        return new ParametricGeometry(func,32,32);
    }

    setPosition(x,y,z){
        this.outside.position.set(x,y,z);
        this.topCone.position.set(x,y,z);
        this.bottomCone.position.set(x,y,z);
    }

    addToScene(scene){
        scene.add(this.outside);
        scene.add(this.topCone);
        scene.add(this.bottomCone);
    }


    update(t){
        this.t=t;
        this.topCone.geometry.dispose();
        this.bottomCone.geometry.dispose();
        let cones = this.createConeGeometries();
        this.topCone.geometry = cones.top;
        this.bottomCone.geometry = cones.bottom;

        this.outside.geometry.dispose();
        this.outside.geometry = this.createOuterGeometry();
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







class Slice{
    constructor(slice, radius, t){

        this.radius = radius;
        this.slice = slice;
        this.t = t;

        let sliceHeight = this.radius*this.slice;

        //need the inner and outer radii of the slice:

        //what is the inner radius of the ring?  this is the cone width:
        let innerRad = this.radius * (1-this.t) * Math.abs(this.slice);

        //what is the original area? before deforming, what were inner and outer radii?
        let origOut = this.radius;
        let origIn = Math.abs(sliceHeight);
        //calculate via our formula at the top of the doc:
        let outerRad = outerRadius(origIn,origOut,innerRad);


        let ringGeo = new RingBufferGeometry(innerRad,outerRad,32,1);
        ringGeo.rotateX(Math.PI/2);
        ringGeo.translate(0,sliceHeight,0);

        let ringMat = new MeshPhysicalMaterial({
            clearcoat:1,
            side:DoubleSide,
            color: new Color().setHSL(0.6,0.7,0.3),
        });
        this.ring = new Mesh(ringGeo, ringMat);

        this.outerBdy = new BoundaryCurve(outerRad, sliceHeight);
        this.innerBdy = new BoundaryCurve(innerRad, sliceHeight);

    }

    addToScene(scene){
        scene.add(this.ring);
        scene.add(this.innerBdy);
        scene.add(this.outerBdy);
    }

    update(slice,t){

        this.slice=slice;
        this.t=t;

        let sliceHeight = this.radius*this.slice;
        let innerRad = this.radius * (1-this.t) * Math.abs(this.slice);

        //what is the original area? before deforming, what were inner and outer radii?
        let origOut = this.radius;
        let origIn = Math.abs(sliceHeight);
        //calculate via our formula at the top of the doc:
        let outerRad = outerRadius(origIn,origOut,innerRad);

        this.ring.geometry.dispose();
        this.ring.geometry = new RingBufferGeometry(innerRad,outerRad,32,1);
        this.ring.geometry.rotateX(Math.PI/2);
        this.ring.geometry.translate(0,sliceHeight,0);

        this.outerBdy.update(outerRad, sliceHeight);
        this.innerBdy.update(innerRad, sliceHeight);

    }

    setPosition(x,y,z){
        this.ring.position.set(x,y,z);
        this.outerBdy.position.set(x,y,z);
        this.innerBdy.position.set(x,y,z);
    }

    setVisibility(value){
        this.ring.visible=value;
        this.outerBdy.visible=value;
        this.innerBdy.visible=value;
    }

    setColor(color){
        this.ring.material.color = color;
    }
}


//a class containing both the deforming cylinder and some slices:
class SphereAndCylinder{
    constructor(radius=2) {

        //how big is our sphere and cylinder?
        this.radius =radius;

        //how many slices should we prepare in case we need them?
        this.maxSlices = 25.;

        //starting: a cylinder not a sphere
        this.t=0;

        //animation parameters for the UI
        this.params ={
            t:0,
            n:8,
            animate:true,
            slice:0.25,
        }

        //add the deform cylinder:
        this.cylinder = new DeformCylinder(this.radius);

        //make a list of slices
        this.numSlices = this.params.n;
        this.sliceHeights = [];
        this.slices = [];

        let delta = 2 / (this.numSlices+1);
        for(let i=0; i<this.maxSlices; i++){
            let slice,height;
            if(i<this.numSlices){
                height = (i+1)*delta - 1.;
                slice = new Slice(height,this.radius,this.t);
                slice.setVisibility(true);
                let color = new Color().setHSL(0.8*(i+1)/(this.numSlices+1),0.75,0.5);
                slice.setColor(color);
            }
            else{
                height=0.;
                slice = new Slice(height,this.radius,this.t);
                slice.setVisibility(false);
            }

            this.sliceHeights.push(height);
            this.slices.push(slice);
        }

    }

    setNumSlices(n){
        this.numSlices = n;
        let delta = 2./ (this.numSlices+1);
        let color;
        //re-space the slices on next draw, and set visibility:
        for(let i=0; i<this.maxSlices; i++){
            if(i<this.numSlices) {
                this.sliceHeights[i] = (i+1)*delta - 1.;
                this.slices[i].setVisibility(true);
                color = new Color().setHSL(0.8*(i+1)/(this.numSlices+1),0.75,0.5);
                this.slices[i].setColor(color);
            }
            else{
                this.sliceHeights[i]=0;
                this.slices[i].setVisibility(false);
            }
        }
    }

    addToScene(scene){

        this.cylinder.addToScene(scene);

        for( let i=0; i<this.maxSlices; i++){
            this.slices[i].addToScene(scene);
        }

    }

    updateSlices(){
        for(let i=0; i<this.maxSlices; i++){
            if(i<this.numSlices) {
                this.slices[i].update(this.sliceHeights[i], this.t);
            }
        }
    }


    addToUI(ui){
        let thisObj = this;
        // ui.add(this.params,'animate');
        // ui.add(this.params, 't',0,1,0.01).name('Deformation').onChange(function(value){
        //     if(!thisObj.params.animate) {
        //         thisObj.t = value;
        //         this.updateSlices(value);
        //         this.cylinder.update(value);
        //     }
        // });
        ui.add(this.params, 'n',0,thisObj.maxSlices,1).name('Slices').onChange(function(value){
            thisObj.setNumSlices(value);
            thisObj.updateSlices(thisObj.t);
        });
    }

    tick(time,dTime){
        if(this.params.animate) {
            this.t = (1+Math.sin(time))/2.;
            this.updateSlices(this.t);
            this.cylinder.update(this.t);
        }
    }
}

let example = new SphereAndCylinder(4);

export default {example};


