import {
    CatmullRomCurve3,
    Vector2,
    Vector3,
    DoubleSide,
    SphereBufferGeometry,
    MeshPhysicalMaterial,
    Mesh
} from "../../3party/three/build/three.module.js";

import VectorField3D from "../components/VectorCalculus/VectorField3D.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


class VectorField3DPlotter{
    constructor( range, res ){

        this.params = {
            xMin: range.x.min,
            xMax: range.x.max,
            yMin: range.y.min,
            yMax: range.y.max,
            zMin: range.z.min,
            zMax: range.z.max,

            a:1,
            b:1,
            c:1,

            xPrimeText: 'x',
            yPrimeText: 'y',
            zPrimeText: 'z',

            reset: function(){
                console.log('reset');
            }
        };

        let xC = parser.evaluate('xPrime(x,y,z,t,a,b,c)='.concat(this.params.xPrimeText));
        let yC = parser.evaluate('yPrime(x,y,z,t,a,b,c)='.concat(this.params.yPrimeText));
        let zC = parser.evaluate('zPrime(x,y,z,t,a,b,c)='.concat(this.params.zPrimeText));

        this.vectorFieldEqn = function(pos,time,params){
            let x = xC(pos.x,pos.y,pos.z,time,params.a,params.b,params.c);
            let y = yC(pos.x,pos.y,pos.z,time,params.a,params.b,params.c);
            let z = zC(pos.x,pos.y,pos.z,time,params.a,params.b,params.c);
            return new Vector3(x,y,z);
        }

        this.vectorField = new VectorField3D(this.vectorFieldEqn, range, res);

    }

    addToScene(scene){
        this.vectorField.addToScene(scene);
    }

    addToUI(ui){
        let domainFolder =ui.addFolder('Domain');
        let paramFolder =ui.addFolder('Parameters');
        let thisObj = this;
        let thisField = this.vectorField;


        domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
            let rng = {
                x:{min:value,max:thisField.range.x.max},
                y:{min:thisField.range.y.min, max:thisField.range.y.max},
                z:{min:thisField.range.z.min, max:thisField.range.z.max}
            };
            thisField.setRange(rng);
        });


        domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
            let rng = {
                x:{min: thisField.range.x.min, max: value},
                y:{min: thisField.range.y.min, max: thisField.range.y.max},
                z:{min:thisField.range.z.min, max:thisField.range.z.max}
            };
            thisField.setRange(rng);
        });

        domainFolder.add(this.params, 'yMin', -10, 10, 0.01).name('yMin').onChange(function(value){
            let rng = {
                x:{min:thisField.range.x.min, max: thisField.range.x.max},
                y:{min:value, max:thisField.range.y.max},
                z:{min:thisField.range.z.min, max:thisField.range.z.max}
            };
            thisField.setRange(rng);
        });

        domainFolder.add(this.params, 'yMax', -10, 10, 0.01).name('yMin').onChange(function(value){
            let rng = {
                x:{min:thisField.range.x.min, max: thisField.range.x.max},
                y:{min:thisField.range.y.min, max:value },
                z:{min:thisField.range.z.min, max:thisField.range.z.max}
            };
            thisField.setRange(rng);
        });

        domainFolder.add(this.params, 'zMin', -10, 10, 0.01).name('zMin').onChange(function(value){
            let rng = {
                x:{min:thisField.range.x.min, max: thisField.range.x.max},
                y:{min:thisField.range.y.min, max:thisField.range.y.max},
                z:{min:value, max:thisField.range.z.max},
            };
            thisField.setRange(rng);
        });

        domainFolder.add(this.params, 'zMax', -10, 10, 0.01).name('zMin').onChange(function(value){
            let rng = {
                x:{min:thisField.range.x.min, max: thisField.range.x.max},
                y:{min:thisField.range.y.min, max:thisField.range.y.max},
                z:{min:thisField.range.z.min, max:value },
            };
            thisField.setRange(rng);
        });



        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('a').onChange(function(value){
        });

        ui.add(this.params,'xPrimeText').name('xPrime=');
        ui.add(this.params,'yPrimeText').name('yPrime=');
        ui.add(this.params,'zPrimeText').name('zPrime=');

        ui.add(this.params, 'reset').onChange(
            function(){

                let xC = parser.evaluate('xPrime(x,y,z,t,a,b,c)='.concat(thisObj.params.xPrimeText));
                let yC = parser.evaluate('yPrime(x,y,z,t,a,b,c)='.concat(thisObj.params.yPrimeText));
                let zC = parser.evaluate('zPrime(x,y,z,t,a,b,c)='.concat(thisObj.params.zPrimeText));

                let eqn = function(pos,time,params){
                    let x = xC(pos.x,pos.y,pos.z,time,params.a,params.b,params.c);
                    let y = yC(pos.x,pos.y,pos.z,time,params.a,params.b,params.c);
                    let z = zC(pos.x,pos.y,pos.z,time,params.a,params.b,params.c);
                    return new Vector3(x,y,z);
                }

                thisObj.vectorFieldEqn = eqn;
                thisField.setVectorField(eqn);
            }
        )
    }

    tick(time,dTime){

        this.vectorField.update(time,this.params);

    }

}










let range = {
    x:{ min:-10,max:10},
    y:{min:-10,max:10},
    z:{min:-10,max:10},
};

let res = {x:20,y:20,z:20};

let example = new VectorField3DPlotter(range, res);

export default {example};