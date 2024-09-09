import {
    LineCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    TubeGeometry,
    Vector2, Vector3
} from "../../../../3party/three/build/three.module.js";


class Pendulum{
    constructor(length,origin){
        this.origin = origin;
        this.length = length;
        this.rad = 0.1;
        //state has a vec2 components because I am being lazy and using an integrator I've already built
        //this integrator requires the "clone" method on position and velocity: so can't have each
        //just be a number
        //will only use x component in each
        this.state = {pos:new Vector2(0,0),vel:new Vector2(0,0)};

        let mat = new MeshPhysicalMaterial({
            clearcoat:1,
            color:0xffffff,
        });
        let sphGeo = new SphereGeometry(this.rad);
        let rodGeo = this.getRodGeo();

        this.ball = new Mesh(sphGeo,mat);
        this.rod = new Mesh(rodGeo,mat);
    }

    getRodGeo(){
        return new TubeGeometry(new LineCurve3(this.origin,this.getPosition()),1,0.25*this.rad);
    }

    getPosition(){
        return this.origin.clone().add(new Vector3(0,-Math.cos(this.state.pos.x),Math.sin(this.state.pos.x)).multiplyScalar(this.length));
    }

    addToScene(scene){
        scene.add(this.ball);
        scene.add(this.rod);
    }

    update(state){
        this.state=state;
        let pos = this.getPosition();
        this.ball.position.set(pos.x,pos.y,pos.z);
        this.rod.geometry.dispose();
        this.rod.geometry = this.getRodGeo();
    }
}


export default Pendulum;
