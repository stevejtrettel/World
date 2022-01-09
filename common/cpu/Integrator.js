
//base class for a numerical integrator to be extended
class Integrator {
    constructor (derive, ep){
        this.derive=derive;
        this.ep=ep;
    }

    derive( state ){ }

    step( state ) { }

}


export { Integrator };
