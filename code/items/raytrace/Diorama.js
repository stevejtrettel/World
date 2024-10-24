
// a diorama is a collection of objects
//this implements stepForward

class Diorama{
    constructor() {
        this.objList = [];
    }


    trace(tv){
        //take the tv to the next intersection with the diorama
    }


    stepForward(tv){

        //take to the next point in the diorama
        //THEN figure out where you are at, interact with that material,
        // and set yourself up for the next round

        for(let obj in this.objList){

        }
    }

    addObject(obj){
        this.objList.push(obj);
    }
}

export default Diorama;
