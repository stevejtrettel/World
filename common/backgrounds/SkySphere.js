import {
    Scene,
    Vector3,
    MathUtils,
} from "../../3party/three/build/three.module.js";

import { Background } from "./Background.js";

class SkySphere extends Background {

    constructor ( sunHeight ){

        super();

        this.sun = new Vector3();
        this.sky = new Sky();
        this.sky.scale.setScalar(4500000);
        this.name = 'Sky';

        //add the sky object to this scene
        this.add(this.sky);

        //set some atmosphere uniforms
        this.sky.material.uniforms['turbidity'].value = 10;
        this.sky.material.uniforms['rayleigh'].value = 2;
        this.sky.material.uniforms['mieCoefficient'].value = 0.005;
        this.sky.material.uniforms['mieDirectionalG'].value = 0.8;

        //position the sun
        const phi = MathUtils.degToRad(90-sunHeight);
        const theta = MathUtils.degToRad(0);
        this.sun.setFromSphericalCoords(1, phi, theta);

        //set the sun's uniform
        this.sky.material.uniforms['sunPosition'].value.copy(this.sun);

    }
}

export { SkySphere };



