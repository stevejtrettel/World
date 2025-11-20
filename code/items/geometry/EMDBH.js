import {MeshPhysicalMaterial, SphereGeometry, Mesh,Vector3} from "../../../3party/three/build/three.module.js";
import {RungeKutta} from "../../compute/cpu/RungeKutta.js";
import SymplecticIntegrator from "../../compute/cpu/SymplecticIntegrator.js";
import {dState} from "../../compute/cpu/components/State.js";

// this class implements extremal Einstein Maxwell Dilaton Blackholes
// from paper CITE


let defaultbhs =[
    {
        mass:1,
        pos: new Vector3(0,0,2)
    },
    {
        mass:1,
        pos: new Vector3(2,0,0)
    },
    {
        mass:1,
        pos: new Vector3(0,2,0)
    }];



//set the radius of event horizon for drawing spheres
let ehRadius = function(mass){
    return mass/2.;
}

class EMDBH{
    constructor(alpha=1, bhs=defaultbhs) {

        this.alpha = alpha;
        this.bhs = bhs;


        this.bhMeshes = [];

        let ehGeom = new SphereGeometry(0.1);
        let ehMat = new MeshPhysicalMaterial({
            color: 0x000000,
            clearcoat:1,
        });

        for(let i=0;i<bhs.length; i++){
            let rad = ehRadius(bhs[i].mass);
            let pos = bhs[i].pos;

            let eh = new Mesh(ehGeom,ehMat);
            eh.scale.set(rad,rad,rad);
            eh.position.set(pos.x,pos.y,pos.z);

            this.bhMeshes.push(eh);
        }

        this.buildIntegrator();

    }


    buildIntegrator() {

        //relevant constants for the functions
        //that will be locked in each time it's rebuilt
        let bhs = this.bhs;
        let alpha = this.alpha;

        //the function determining potential:
        function U(pos){
            let u = 1.;
            for(let i=0;i<bhs.length;i++){
                let mi = 4.*bhs[i].mass / alpha;
                let ri = pos.clone().sub(bhs[i].pos).length();
                u += mi/ri;
            }

           return u;
        }

        //its partial derivatives:
        function gradU(pos){
            let grad = new Vector3(0,0,0);
            for(let i=0; i<bhs.length; i++){

                let di = pos.clone().sub(bhs[i].pos);

                let ri = di.length();
                let mi = 4.*bhs[i].mass / alpha;

                grad.add(di.multiplyScalar(-mi/(ri*ri*ri)))
            }

            return grad;
        }

        //the force from grad V = 1/2-1/2(U)^alpha
        function force(pos){
            let grad = gradU(pos);
            let u = U(pos);
            let uA = Math.pow(u,alpha-1);
            return grad.multiplyScalar(alpha/2 * uA);
        }

        this.normalize = function(state){
            //normalize an initial condition so that
            //it lies on the level set of energy = 1/2.
            let uA = Math.pow(U(state.pos),alpha);
            let p = state.vel.length();
            let lambda = Math.sqrt(uA)/p;

            state.vel.multiplyScalar(lambda);
            return state;
        }

        //build the integrator
        let derive = function(state){
            return new dState(state.vel,force(state.pos));
        }
        let ep = 0.001;
        this.integrator = new SymplecticIntegrator(derive,ep);

    }


    addToScene(scene){
        for(let i=0; i<this.bhs.length; i++){
            scene.add(this.bhMeshes[i]);
        }
    }

    updatePos(index,pos){
        this.bhs[index].pos = pos;

        //reset the position of the blackhole:
        this.bhMeshes[index].position.set(pos.x,pos.y,pos.z);

        //rebuild the integrator
        this.buildIntegrator();
    }

    updateMass(index,mass){
        this.bhs[index].mass = mass;

        //reset the scale of this blackhole:
        let rad = ehRadius(mass);
        this.bhMeshes[index].scale.set(rad,rad,rad);

        //rebuild the integrator
        this.buildIntegrator();
    }

    updateAlpha(alpha){
        this.alpha = alpha;
        this.buildIntegrator();
    }


}

export default EMDBH;
