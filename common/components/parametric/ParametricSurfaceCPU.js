import {
    DoubleSide,
    MeshPhysicalMaterial,
    Mesh,
} from "../../../3party/three/build/three.module.js";

import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";

let defaultOptions = {
    side: DoubleSide,
    clearcoat:1,

}

class ParametricSurfaceCPU{
    constructor(eqn, domain, options ){

        this.res ={u:100,v:100};

        this.params = {};

        //equation takes in uv outputs xyz
        this.eqn = eqn;
        this.domain = domain;


        let mat = new MeshPhysicalMaterial(options||defaultOptions);
        let geom = this.createGeom();

        this.surf = new Mesh(geom,mat);

    }


    createGeom(params ={}){

        let thisObj=this;

        function rescaleU(u){
            return thisObj.domain.u.min+(thisObj.domain.u.max-thisObj.domain.u.min)*u;
        }

        function rescaleV(v){
            return thisObj.domain.v.min+(thisObj.domain.v.max-thisObj.domain.v.min)*v;
        }


        let func = function(u,v,dest){
            u = rescaleU(u);
            v = rescaleV(v);
            let res = thisObj.eqn(u,v,params);

            dest.set(res.x,res.y,res.z);
        };

        return new ParametricGeometry(func, thisObj.res.u,thisObj.res.v);
    }


    addToScene(scene){
       scene.add(this.surf);
    }

    setEqn(eqn){
        this.eqn=eqn;
    }

    update(params){
        this.surf.geometry.dispose();
        this.surf.geometry = this.createGeom(params);
    }

}



export default ParametricSurfaceCPU;