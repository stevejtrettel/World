

class baseObject {

    constructor () {

        this.name = null;

    }


    setName( name ) {
        this.name = name;
    }

    addToScene( scene ) {
        //however you add this object to a threejs scene:
    }

    addToUI ( ui ) {
        //whatever you do to add this object to a dat.gui object

    }

    tick () {
        //code run at each time step for this object in an animation

    }


}



export { baseObject };
