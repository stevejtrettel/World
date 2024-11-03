import Vector from "./lightray/Vector.js";
import TVec from "./TVec.js";

class SurfaceNormal{
    constructor() {

        this.tv = new TVec();
        this.display = new Vector();
    }

    addToScene(scene){
        this.display.addToScene(scene);
    }

    getNormalAt(pos,obj){
        //set the position of the vector
        this.tv = obj.getNormal(pos);
        this.display.setPos(this.tv.pos);
        this.display.setDir(this.tv.dir.clone().multiplyScalar(3));
        this.display.setColor(obj.mat.color);
    }

}


export default SurfaceNormal;
