
//raymarching material: list of properties
//and some methods to make basic ones?

class Material{

    constructor() {
        this.properties = {
            //set some default values for all the properties one could need here
            color: 0xffffff,
        };
    }

    //modify these properties by calling a method below
    //to make specific materials

    makeDielectric(color){
        this.properties = {
            color: color,
            roughness:0.5,
            clearcoat:true,
        }
    }

    makeMetal(color){
        this.properties ={
            color: color,
            roughness:0.5,
        }
    }

    makeGlass(color){
        this.properties = {
            color: color,
            roughness:0,
        }
    }

}

export default Material;
