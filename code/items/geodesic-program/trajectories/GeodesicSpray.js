import {Vector2} from "../../../../3party/three/build/three.module.js";

import State from "../Integrators/States/State.js";
import Geodesic from "./Geodesic.js";

let defaultOptions = {
    length:60,
    segments: 256,
    radius: 0.02,
    tubeRes: 8,
    color: 0x000000,
    roughness:0,
};


class GeodesicSpray{
    constructor(surface, iniState, N,curveOptions=defaultOptions) {

        this.surface = surface;
        this.iniState = iniState;
        this.N = N;

        this.params  = {
            posx: 0,
            posy: 0,
            ang:0,
            spread:1,
        }


        this.iniStates = [];
        this.geodesics = [];
        for(let i=0; i<this.N;i++){
            this.iniStates.push(new State(new Vector2(0,0),new Vector2(0,0)));
            this.geodesics.push(new Geodesic(this.surface,this.iniStates[i],0,curveOptions));
        }

        this.setIniStates();
        this.setGeodesics();

    }


    setIniStates(){
        for(let i=0;i<this.N;i++) {

            let pos = new Vector2(this.params.posx, this.params.posy);

            let offset = i/this.N-0.5;
            let ang = this.params.ang+this.params.spread*offset;
            let vel = new Vector2(Math.cos(ang), Math.sin(ang));
            this.iniStates[i] = new State(pos, vel);
        }
    }

    setGeodesics(){
        for(let i=0;i<this.N;i++){
            this.geodesics[i].updateState(this.iniStates[i]);
        }
    }


    addToScene(scene){
        for(let i=0; i<this.N;i++){
            this.geodesics[i].addToScene(scene);
        }
    }


    buildUIFolder(ui,resetScene){

        let test = this;

        let sprayFolder = ui.addFolder('Geodesics');
        sprayFolder.close();


        sprayFolder.add(test.params, 'posx',0,1,0.01).name('Starting-x').onChange(function(value){
            test.setIniStates();
            test.setGeodesics();
        })

        sprayFolder.add(test.params, 'posy',0,1,0.01).name('Starting-y').onChange(function(value){
            test.setIniStates();
            test.setGeodesics();
        })

        sprayFolder.add(test.params, 'ang',0,3.14,0.01).name('Starting-angle').onChange(function(value){
            test.setIniStates();
            test.setGeodesics();
        })

    }

    updateSurface(){
        for(let i=0;i<this.N;i++){
            this.geodesics[i].updateSurface();
        }
    }


}




export default GeodesicSpray;
