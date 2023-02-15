import {
    DoubleSide,
    Mesh,
    Group,
    MeshPhysicalMaterial,
    PlaneBufferGeometry
} from "../../../3party/three/build/three.module.js";

class GlassPanel{
    constructor(options) {

        //right now only required options are an xRange and yRange of the form
        //xRange:{min:x1, max:x2}
        this.xRange = options.xRange;
        this.yRange = options.yRange;

        let glassMaterial = new MeshPhysicalMaterial(
            {
                transparent:true,
                opacity: 0.05,
                // ior:1.,
                // transmission: 0.98,
                clearcoat: 1,
                side: DoubleSide,
            });

        let xSpread = (this.xRange.max - this.xRange.min);
        let ySpread = (this.yRange.max - this.yRange.min);

        let glassGeometry = new PlaneBufferGeometry(xSpread, ySpread);

        let glass =new Mesh(glassGeometry, glassMaterial);
         glass.position.set(
            (this.xRange.min+this.xRange.max)/2,
            (this.yRange.min+this.yRange.max)/2,
            0,
        );

         //add glass to the single element of a group, so we can adjust its position
        this.glass = new Group();
        this.glass.add(glass);

    };

    addToScene( scene ){
        scene.add(this.glass);
    }

    resize(xRange, yRange){
        this.xRange=xRange;
        this.yRange=yRange;
        let xSpread = (this.xRange.max - this.xRange.min);
        let ySpread = (this.yRange.max - this.yRange.min);

        this.glass.geometry.dispose();
        this.glass.geometry = new PlaneBufferGeometry(xSpread, ySpread);
        this.glass.position.set(
            (this.xRange.min+this.xRange.max)/2,
            (this.yRange.min+this.yRange.max)/2,
            0,
        );
    }

    setPosition(x,y,z){
        this.glass.position.set(x,y,z);
    }

    setVisibility(value){
        this.glass.visible = value;
    }
}

export {GlassPanel};