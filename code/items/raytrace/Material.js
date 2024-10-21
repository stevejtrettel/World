


//raymarching material: list of properties, with a method "interact"
class Material{

    constructor(properties) {

        this.properties = properties;
    }

    interact(tv){
        //take in a tangent vector, return a new tangent vector
        let pos = tv.pos;
        let dir = tv.dir;

        return new TVec(pos,dir);
    }

}

export default Material;
