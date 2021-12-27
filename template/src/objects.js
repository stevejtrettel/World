import {
    MeshNormalMaterial,
    SphereBufferGeometry,
    Mesh,
    Vector3
} from "../../3party/three/build/three.module.js";


import { RungeKutta } from "../../common/computation/RungeKutta.js";
import { FlowLine } from "../../common/objects/FlowLine.js";
import { FlowLineField } from "../../common/objects/FlowLineField.js";

class Sph extends Mesh {
    constructor() {
        super();
        this.geometry = new SphereBufferGeometry(1, 32, 16);
        this.material = new MeshNormalMaterial();
        this.name = null;
    }

    setName( name ){
        this.name=name;
    }

    addToScene( scene ) {
        scene.add(this);
    }

    addToUI( ui ){
        let Folder = ui.addFolder('Sphere');

        Folder.close();
    }

    tick(time,dt){
        this.position.set(Math.sin(time),Math.cos(time),2*Math.sin(time/2));
    }
}







const ep = 0.04;

const derive = ( state ) => {
    const x = state.x;
    const y = state.y;
    const z = state.z;

    const a = 0.95;
    const b = 0.7;
    const c = 0.6;
    const d = 3.5;
    const e = 0.25;
    const f = 0.1;

    const vx = (z-b) * x - d*y;
    const vy = d*x + (z-b)*y;
    const vz = c + a*z - z*z*z/3. - (x*x+y*y)*(1.+e*z) + f*z*x*x*x;

    return new Vector3(vx,vy,vz);

}

const diffEq = new RungeKutta( derive, ep);
let iniState = new Vector3(1,1,1);

let integralCurve = new FlowLine( diffEq, iniState, 10 );

let flowLines = new FlowLineField( diffEq,30, 0.2);


const objects = {
   // sph: new Sph(),
    flow: integralCurve,
    field: flowLines,
};

export { objects };
