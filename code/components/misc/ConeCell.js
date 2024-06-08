
//------------------------------------------------------------------
// PART OF THE COLOR VISION COLLECTION OF PROGRAMS
//-------------------------------------------------------------------


import {BoxGeometry, MeshPhysicalMaterial, Mesh,Vector3} from "../../../3party/three/build/three.module.js";

import BarGraph from "../basic-shapes/BarGraph.js";



let defaultParams = {

}

let defaultSpectrum = function(x){
    return 1.;
}

class ConeCell{
    constructor(responseCurve, color, N=1000){

        this.pos=new Vector3(0,0,0);

        this.params= {
            time:0,
        };

        this.N=N;
        this.domain = {min:-5, max:5};
        this.spectrum = defaultSpectrum;

        //the color we draw the cone's response curve / result:
        this.color=color;

        //the response curve that's built into the cone's definition
        this.responseCurve=responseCurve;

        //a plot of this response curve:
        let colorFunction = function(x){
            return color;
        }

        //build the rescaled function:
        this.initialize();

        this.responseCurveGraph = new BarGraph(this.rescaledResponse,colorFunction,this.domain,this.N);
        this.responseCurveGraph.update(this.params);
        this.responseCurveGraph.setMaterialProperties({transparent:true,transmission:0.9,ior:1});




        this.activationCurveGraph = new BarGraph(this.rescaledActivation, colorFunction, this.domain,this.N);
        this.activationCurveGraph.update(this.params);

        //the result of integrating a specturm against the response curve
        this.total=1.;

        //a box displaying this result
        let geom = new BoxGeometry(0.5,0.5,0.5);
        this.activationBar = new Mesh(geom, new MeshPhysicalMaterial({color:this.color}));
    }

    initialize(){
        let thisObj = this;

        this.fromDomain = function(x){
            let spread = thisObj.domain.max-thisObj.domain.min;
            return (x-thisObj.domain.min)/spread;
        }

        this.rescaledResponse = function(x,params={time:0}){
            return thisObj.responseCurve(thisObj.fromDomain(x),params);
        }

        this.rescaledSpectrum = function(x,params={time:0}){
            return thisObj.spectrum(thisObj.fromDomain(x),params);
        }

        this.rescaledActivation = function(x,params={time:0}){
            return thisObj.rescaledResponse(x,params)*thisObj.rescaledSpectrum(x,params)
        }

    }


    addToScene(scene){
        this.responseCurveGraph.addToScene(scene);
        this.activationCurveGraph.addToScene(scene);
        scene.add(this.activationBar);
    }


    setCurvePos(x,y,z){

    }

    setResultPos(x,y,z){

    }

    setSpectrum(spectrum){
        this.spectrum = spectrum;
        this.initialize();
        this.activationCurveGraph.update({time:0});
    }

    update(params){
        this.responseCurveGraph.update(params);
        this.activationCurveGraph.update(params);
        this.total = this.activationCurveGraph.getValue();
        this.activationBar.scale.set(1,this.total,1);
        this.activationBar.position.y= this.pos.y + this.total/4.;
    }

    setN(N){
        this.N=N;
        this.responseCurveGraph.setN(N);
        this.activationCurveGraph.setN(N);
    }

    setPosition(x,y,z){
        this.pos = new Vector3(x,y,z);
        this.activationCurveGraph.setPosition(x,y,z+0.25);
        this.responseCurveGraph.setPosition(x,y,z);
        this.activationBar.position.set(x+this.domain.max+1,y+this.total/4,z);
    }

    setVisibility(value){
        this.activationCurveGraph.setVisibility(value);
        this.responseCurveGraph.setVisibility(value);
        this.activationBar.visible=value;
    }
}



export default ConeCell;
