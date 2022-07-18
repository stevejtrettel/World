import{ Vector3 } from "../../../../3party/three/build/three.module.js";

class Ball {
    constructor(center, radius ){
        this.uniforms = {};
        this.center = center;
        this.radius=radius;

    }

    normalFunction(){
        return `
        `;
    }

    collisionFunction(){
        return `
        
        `;
    }


}


export{ Ball };
