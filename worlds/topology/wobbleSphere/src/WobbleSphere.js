import {
    MeshPhysicalMaterial,
    Mesh,
    SphereGeometry,
    Vector3,
} from "../../../../3party/three/build/three.module.js";

import PerlinNoise3d from "../../../../3party/PerlinNoise3d.js";



let defaultOptions = {
    clearcoat:1,
    metalness:0.3,
    roughness:0.1,
    envMapIntensity: 2
    // color: 0xffc82b,
}


class WobbleSphere {

    constructor( matOptions = defaultOptions ){
        this.geometry = new SphereGeometry(1,64,32);
        this.material = new MeshPhysicalMaterial(matOptions);
        this.mesh = new Mesh(this.geometry, this.material);
        this.params = {amplitude: 0.5};

        this.noise = new PerlinNoise3d();
        this.noise.noiseSeed(1.);
    }



    addToScene( scene ){
        scene.add(this.mesh);
    }

    addToUI( ui ){
        ui.add(this.params, 'amplitude',0,1,0.01);
    }

    tick(time, dTime){

        const position = this.geometry.attributes.position;
        const vector = new Vector3();
        let amt, q, noisiness;

        //loop over the vertices of the mesh and update the buffer
        for ( let i = 0, l = position.count; i < l; i ++ ) {

            vector.fromBufferAttribute(position, i);
            q = vector.clone();
            noisiness = this.noise.get((Math.sin(time)+q.x)/15., (Math.cos(time/2.)*q.y)/15., (Math.cos(time/3.)*q.z)/15.);
            amt = 1 + 15 * this.params.amplitude *noisiness;
            vector.normalize().multiplyScalar(amt);
            //set this as the replacement
            position.array[3*i]=vector.x;
            position.array[3*i+1]=vector.y;
            position.array[3*i+2]=vector.z;
        }

        //now tell the computer to actually update things
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();
        this.geometry.normalsNeedUpdate = true;
    }
}



export default WobbleSphere;
