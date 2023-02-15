import {
    CatmullRomCurve3,
    DoubleSide,
    Group,
    Mesh,
    MeshPhysicalMaterial,
    SphereBufferGeometry, TubeBufferGeometry
} from "../../../3party/three/build/three.module.js";



//the options for a rod are:
//end1, end2, radius,
class Rod{
    constructor(options){
        this.end1=options.end1;
        this.end2=options.end2;
        this.radius = options.radius || 0.1;

        const sph = new SphereBufferGeometry(1,32,16);
        let material;

        if('material' in options ){
            material = options.material;
        }
        else {

            let materialParameters = {
                color: options.color,
                clearcoat: 1,
                ior: 1.,
            };
            if (options.transmission) {
                materialParameters.opacity = 0;
                materialParameters.ior = 1.;
                materialParameters.transmission = options.transmission;
            }
            material = new MeshPhysicalMaterial(materialParameters);
        }

        let ballRad = 1.5*this.radius;


        this.ball1 = new Mesh(sph,material);
        this.ball1.scale.set(ballRad,ballRad,ballRad);
        this.ball1.position.set(this.end1.x,this.end1.y,this.end1.z);

        this.ball2 = new Mesh(sph,material);
        this.ball2.scale.set(ballRad,ballRad,ballRad);
        this.ball2.position.set(this.end2.x,this.end2.y,this.end2.z);

        const curve = new CatmullRomCurve3([this.end1, this.end2]);
        const geom = new TubeBufferGeometry(curve, 1 ,this.radius, 8);

        this.tube = new Mesh(geom, material);

        this.group = new Group();
        this.group.add(this.tube);
        this.group.add(this.ball1);
        this.group.add(this.ball2);
    }

    addToScene( scene ){
        scene.add(this.group);
    }

    setPosition(x,y,z){
       this.group.position.set(x,y,z);
    }

    resize(end1, end2, rad=this.radius){
        this.end1=end1;
        this.end2=end2;
        this.radius = rad;


        let ballRad = 1.5*this.radius;
        this.ball1.scale.set(ballRad,ballRad,ballRad);
        this.ball2.scale.set(ballRad,ballRad,ballRad);

        this.ball1.position.set(this.end1.x,this.end1.y,this.end1.z);
        this.ball2.position.set(this.end2.x,this.end2.y,this.end2.z);

        this.tube.geometry.dispose();
        const curve = new CatmullRomCurve3([this.end1, this.end2]);
        this.tube.geometry = new TubeBufferGeometry(curve, 1 ,this.radius, 8);
    }

    setVisibility(value){
        this.tube.visible=value;
        this.ball1.visible=value;
        this.ball2.visible=value;
    }

}


export { Rod };
