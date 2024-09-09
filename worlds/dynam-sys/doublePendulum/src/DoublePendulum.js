import {
    LineCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    TubeGeometry,
    Vector2,
    Vector3
} from "../../../../3party/three/build/three.module.js";





let torusCoords = function(uv){
    let x = uv.x;
    let y = uv.y;
    return new Vector3((2+Math.cos(y))*Math.cos(x),Math.sin(y),(2+Math.cos(y))*Math.sin(x));
}



class DoublePendulum{
    //length is a Vec2, origin a Vec3 (just used for display purposes)
    constructor(length = new Vector2(1,1), mass = new Vector2(1,1), origin = new Vector3(0,1,0)){
        this.origin = origin;
        this.torusOffset = 3;
        this.length = length;
        this.mass = mass;
        this.rad = 0.1;
        //state is a vec2: theta1 theta2 and their derivatives
        this.state = {pos:new Vector2(0,0),vel:new Vector2(0,0)};

        //build all the geometries for a first time:
        let mat = new MeshPhysicalMaterial({
            clearcoat:1,
            color:0xffffff,
        });
        let sphGeo = new SphereGeometry(this.rad);
        let rodGeo1 = new TubeGeometry();
        let rodGeo2 = new TubeGeometry();

        this.ball1 = new Mesh(sphGeo,mat);
        this.ball2 = new Mesh(sphGeo,mat);
        this.rod1 = new Mesh(rodGeo1,mat);
        this.rod2 = new Mesh(rodGeo2, mat);

        //also have the point in configuration space:
        this.config = new Mesh(sphGeo,mat);

    }

    getPositions(){
        let origin = this.origin;
        let arm1 = new Vector3(0,-Math.cos(this.state.pos.x),Math.sin(this.state.pos.x)).multiplyScalar(this.length.x);
        let pt1 = origin.clone().add(arm1);
        let arm2 =  new Vector3(0,-Math.cos(this.state.pos.y),Math.sin(this.state.pos.y)).multiplyScalar(this.length.y);
        let pt2 = pt1.clone().add(arm2);
        return {
            origin: origin,
            pt1: pt1,
            pt2: pt2
        };
    }

    rebuildRods(){
        let pos = this.getPositions();
        let curve1 = new LineCurve3(pos.origin,pos.pt1);
        let curve2 = new LineCurve3(pos.pt1,pos.pt2);
        let geo1 = new TubeGeometry(curve1,1,0.25*this.rad);
        let geo2 = new TubeGeometry(curve2,1,0.25*this.rad);

        this.rod1.geometry.dispose();
        this.rod1.geometry =geo1;

        this.rod2.geometry.dispose();
        this.rod2.geometry = geo2;
    }

    repositionBalls(){
        let pos = this.getPositions();
        this.ball1.position.set(pos.pt1.x,pos.pt1.y,pos.pt1.z);
        this.ball2.position.set(pos.pt2.x,pos.pt2.y,pos.pt2.z);
    }

    repositionConfig(){
        let p = torusCoords(this.state.pos);
        p.multiplyScalar(1);
        let torusOrigin = new Vector3(0,-this.torusOffset,0);
        p.add(torusOrigin);
        this.config.position.set(p.x,p.y,p.z);
    }


    addToScene(scene){
        scene.add(this.ball1);
        scene.add(this.ball2);
        scene.add(this.rod1);
        scene.add(this.rod2);
        scene.add(this.config);
    }

    update(state){
        this.state=state;
        this.repositionBalls();
        this.rebuildRods();
        this.repositionConfig();
    }
}


export default DoublePendulum;
