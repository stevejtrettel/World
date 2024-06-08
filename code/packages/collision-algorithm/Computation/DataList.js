
// a class for working with points in the configuration space of a
//composite system.
//instances of the DataList class are arrays of objects
//these objects need to implement the methods .clone(), .add(), .sub(), and .multiplyScalar()
//thus, DataLists can be lists of either states, or dStates as required:


class DataList extends Array {
    //feed into the constructor an array [state1, state2, state3]
    constructor(list) {
        super(...list);
    }

    //implementation of .clone() for the array
    clone(){
        let arr = [];
        for( let i=0; i<this.length; i++){
            arr.push(this[i].clone());
        }
        return new DataList(arr);
    }

    //implementing .multiplyScalar() componentwise
    multiplyScalar( scalar ){
        for( let i=0; i<this.length; i++){
            this[i].multiplyScalar( scalar );
        }
        return this;
    }

    //implementing .add() componentwise
    add(list){
        for( let i=0; i<this.length; i++){
            this[i].add( list[i] );
        }
        return this;
    }

    //implementing .sub() componentiwse
    sub(list){
        for( let i=0; i<this.length; i++){
            this[i].sub( list[i] );
        }
        return this;
    }



    //implementing .updateBy() componentwise
    //WARNING!!! RIGHT NOW NOT ALL OBJECTS HAVE AN UPDATEBY
    //ONLY STATE, AND IT TAKES DSTATE: SO THIS WILL RETURN
    //AN ERROR IF ITS CALLED IN A CASE WHERE THE INDIVIDUAL OBJECTS DONT
    //IMPLEMENT IT:  THAT'S EXPECTED; BUT WE SHOULD INCLUDE AN ACTUAL ERROR
    //MESSAGE TO CONSOLE.LOG() THAT EXPLAINS.
    updateBy(list){
        for( let i=0; i<this.length; i++){
            this[i].updateBy( list[i] );
        }
        return this;
    }

    flow(eps){
        for( let i=0; i<this.length; i++){
            this[i].flow( eps );
        }
        return this;
    }

}


export { DataList };