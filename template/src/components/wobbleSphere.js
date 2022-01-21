import {
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    Mesh,
    SphereGeometry,
    Vector3,
} from "../../../3party/three/build/three.module.js";






class WobbleSphere {

    constructor( matOptions ){
        this.geometry = new SphereGeometry(1,128,128);
        this.material = new MeshPhysicalMaterial(matOptions);
        this.mesh = new Mesh(this.geometry, this.material);
        this.params = {amplitude: 0.5}
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
                noisiness = noise.perlin3(Math.sin(time)*q.x, Math.cos(2.*time)*q.y, Math.cos(time/2.)*q.z);
                amt = 1 + 0.5 * this.params.amplitude *noisiness;
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



//export {WobbleSphere}



let options = {
    clearcoat:1,
    metalness:0.3,
    roughness:0.1,
   // color: 0xffc82b,
}


let wobbleSphere = new WobbleSphere(options);


export{ wobbleSphere };
