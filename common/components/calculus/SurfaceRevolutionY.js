import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {
    Mesh,
    MeshPhysicalMaterial,
    Vector2,
    Vector3,
    DoubleSide,
} from "../../../3party/three/build/three.module.js";

class SurfaceRevolutionY {
    constructor(curve, domain, axis=0, angle=2.*Math.PI) {

        //save the input data:
        this.domain = domain;
        this.axis = axis;
        this.curveFn = curve;
        this.angle=angle;

        //rescale x and theta
        this.rescaleX = function(x){
            return domain.min + x * (domain.max-domain.min);
        }
        this.rescaleT = function(t){
            return angle*t;
        }

        //takes in points in the grid (0,1)x(0,1)
        let geom = this.createSurfaceGeometry();

        let mat = new MeshPhysicalMaterial(
            {
                side: DoubleSide,
                clearcoat:1,
                transparent:true,
                opacity:0.5,
                color: 0x3fd480,
            }
        );
        this.surface = new Mesh(geom,mat);

    }


    //make the function in the right form, then export geometry
    createSurfaceGeometry(params){

        //copy the functions so we can use them in the definition
        //of the parametricFn below:
        let rescaleX = this.rescaleX;
        let rescaleT = this.rescaleT;
        let curveFn = this.curveFn;
        let axis = this.axis;

        //make the function that generates the parametric geometry
        //takes in uv in (0,1)x(0,1)
        let parametricFn = function(u,v,dest){

            let xOrigin = rescaleX(u);
            let t = rescaleT(v);

            let r = xOrigin - axis;
            let x = r*Math.cos(t) + axis;
            let y = curveFn(xOrigin,params);
            let z = -r*Math.sin(t);

            dest.set(x,y,z);
        }

        return new ParametricGeometry(parametricFn, 64,32 );
    }


    setDomain(domain){
        this.domain = domain;
        this.rescaleX = function(x){
            return domain.min + x * (domain.max-domain.min);
        }
    }

    setCurve(fn){
        this.curveFn = fn;
    }

    setAxis(axis){
        this.axis=axis;
    }

    setAngle(angle){
        this.angle = angle;
        this.rescaleT = function(t){
            return angle*t;
        }
    }


    addToScene(scene){
        scene.add(this.surface);
    }

    update(params){
        this.surface.geometry.dispose();
        this.surface.geometry = this.createSurfaceGeometry(params);
    }

}



export default SurfaceRevolutionY;