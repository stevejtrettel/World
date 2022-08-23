import {
    DoubleSide,
    Mesh,
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
                opacity: 0,
                ior:1.,
                transmission: 0.98,
                clearcoat: 1,
                side: DoubleSide,
            });

        let xSpread = (this.xRange.max - this.xRange.min);
        let ySpread = (this.yRange.max - this.yRange.min);

        let glassGeometry = new PlaneBufferGeometry(xSpread, ySpread);

        //right now centered at (0,0,0);
        this.glass = new Mesh(glassGeometry, glassMaterial);

        this.glass.position.set(
            (this.xRange.min+this.xRange.max)/2,
            (this.yRange.min+this.yRange.max)/2,
            0,
        );

    };

    addToScene( scene ){
        scene.add(this.glass);
    }

    resetRange(xRange, yRange){
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
}

export {GlassPanel};