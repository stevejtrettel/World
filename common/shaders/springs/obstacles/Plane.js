import{
    PlaneGeometry,
    MeshPhysicalMaterial,
    Mesh,
    DoubleSide,
} from "../../../../3party/three/build/three.module.js";


class PlaneObstacle{
    constructor(position, normal){
        this.position = position;
        this.normal = normal;

        const geometry = new PlaneGeometry(40,40);
        const material = new MeshPhysicalMaterial(
            {
                side: DoubleSide,
                metalness:0.5,
                roughness:0.1,
                color:0x1f7d61,
            }
        );
        this.mesh = new Mesh( geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        //need to set orientation still!
        this.mesh.rotateX(Math.PI/2.);


    }

    getCollisionFunction(){
        return `
            bool detectCollision(vec4 pos){
                if(pos.y< ${this.position.y}){
                return true;
                }
                return false;
            }
        `;
    }

    getNormalFunction(){
        return `
            vec4 normalVector(vec4 pos){
                return vec4(0,1,0,0);
            }
        `;
    }


}



export {
    PlaneObstacle,
}
