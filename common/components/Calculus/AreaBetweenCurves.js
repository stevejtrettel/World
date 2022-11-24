import {
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial
} from "../../../3party/three/build/three.module.js";

import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";


class AreaBetweenCurves{
    constructor(domain, top, bottom, color) {

        this.domain = domain;
        this.top = top;
        this.bottom = bottom;

        //rescale x
        this.rescaleX = function(x){
            return domain.min + x * (domain.max-domain.min);
        }

        let geom = this.createSurfaceGeometry();
        let mat = new MeshPhysicalMaterial(
            {
                side: DoubleSide,
                clearcoat:1,
                color: color,
                transmission:0.5,
                ior:1.,
            }
        );
        this.area = new Mesh(geom, mat);

    }



    //make the function in the right form, then export geometry
    createSurfaceGeometry(params){

        //copy the functions so we can use them in the definition
        //of the parametricFn below:
        let rescaleX = this.rescaleX;
        let top = this.top;
        let bottom = this.bottom;

        //make the function that generates the parametric geometry
        //takes in uv in (0,1)x(0,1)
        let parametricFn = function(u,v,dest){

            let x = rescaleX(u);

            //at the point x: find the segment of ys we need to cover:
            let yMin = bottom(x);
            let yMax = top(x);
            let y = yMin + v * (yMax-yMin);

            dest.set(x,y,0);
        }

        return new ParametricGeometry(parametricFn, 64,32 );
    }

    setDomain(domain){
        this.domain = domain;
        this.rescaleX = function(x){
            return domain.min + x * (domain.max-domain.min);
        }
    }

    setTop(top){
        this.top=top;
    }

    setBottom(bottom){
        this.bottom=bottom;
    }

    addToScene(scene){
        scene.add(this.area);
    }

    update(params){
        this.area.geometry.dispose();
        this.area.geometry = this.createSurfaceGeometry(params);
    }

    setVisibility(value){
        this.area.visible=value;
    }

    setPosition(x,y,z){
        this.area.position.set(x,y,z);
    }

}



export default AreaBetweenCurves;