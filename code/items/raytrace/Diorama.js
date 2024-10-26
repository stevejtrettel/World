// a diorama is a collection of objects
//it simply collects their sdf into one major sdf
//and implements getObjectAt which returns the object at a given intersection position

class Diorama{
    constructor() {
        this.objList = [];
    }

    sdf(pos){
        let dist = 10000.;

        for(let i=0; i<this.objList.length; i++){

            dist = Math.min(dist, this.objList[i].sdf(pos));
        }
        return dist;
    }

    getObjectAt(pos){
        //get the object that is at this position
        let obj = undefined;

        for(let i=0; i< this.objList.length; i++){
            if(this.objList[i].at(pos)){
                obj = this.objList[i];
                break;
            }
        }
        return obj;
    }






    addObject(obj){
        this.objList.push(obj);
    }

    addToScene(scene){
        for(let i=0; i<this.objList.length; i++){
            this.objList[i].addToScene(scene);
        }
    }
}

export default Diorama;
