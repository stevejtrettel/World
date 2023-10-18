import {Vector2} from "../../../3party/three/build/three.module.js";


import PlotGPU from "./Plot/PlotGPU.js";
import Plot from "./Plot/Plot.js";
import State from "./Integrator/State.js";
import Geodesic from "./Geodesics/Geodesic.js";
import GeodesicSpray from "./Geodesics/GeodesicSpray.js";
import GeodesicStripes from "./Geodesics/GeodesicStripes.js";


class WoodCut{
    constructor(surface) {

        this.surface = surface;
        this.plot = new PlotGPU(this.surface);


        //parameters the UI will control!
        let woodCut = this;
        this.params = {
            geoPos: 0,
            geoDir: 0,
            geoVisible: true,
            printGeo: function(){
                woodCut.geodesic.printPoints('geodesic');
            },

            stripeNum:11,
            stripeDir:0,
            stripeSpread:1,
            stripePos:0,
            stripeVisible:false,
            printStripe: function(){
                woodCut.stripes.printPoints('stripe');
            },

            sprayNum:10,
            sprayPos:0,
            sprayDir:0,
            spraySpread:0.2,
            sprayVisible: false,
            printSpray: function(){
                woodCut.spray.printPoints('spray');
            },
        }

        let iniState = this.buildGeodesicIniState();
        this.geodesic = new Geodesic(this.surface,iniState);

        let iniStripes = this.buildStripeIniData();
        this.stripes = new GeodesicStripes(this.surface,iniStripes);


        let iniSpray = this.buildSprayIniData();
        this.spray = new GeodesicSpray(this.surface,iniSpray);

    }



    //to reset the initial state of a geodesic given position on boundary and angle
    buildGeodesicIniState(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.geoPos);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.geoDir),Math.sin(3.1415/2*this.params.geoDir));
        return new State(pos,vel);
    }

    //build the initial data to feed into geodesic spray
    buildSprayIniData(){
        return {
            N: this.params.sprayNum,
            angle: this.params.sprayDir,
            pos: new Vector2(this.surface.domain.u.min+1,this.params.sprayPos),
            spread: this.params.spraySpread,
        }
    }

    //build the data needed to be fed into geodesic stripe
    buildStripeIniData(){
        return {
            N: this.params.stripeNum,
            angle: this.params.stripeDir,
            spread:this.params.stripeSpread,
            pos: this.params.stripePos,
        };
    }




    addToScene(scene){
        this.plot.addToScene(scene);
        this.geodesic.addToScene(scene);
        this.stripes.addToScene(scene);
        this.spray.addToScene(scene);

        this.geodesic.setVisibility(this.params.geoVisible);
        this.stripes.setVisibility(this.params.stripeVisible);
        this.spray.setVisibility(this.params.sprayVisible);
    }

    addToUI(ui){
        let woodCut = this;
        let params = woodCut.params;

        //let surfFolder = ui.addFolder('Surface');
        let geoFolder = ui.addFolder('Geodesic');
        let stripeFolder = ui.addFolder('Stripes');
        let sprayFolder = ui.addFolder('Spray');
        //surfFolder.close();
        geoFolder.close();
        stripeFolder.close();
        sprayFolder.close();



        //add stuff to these folders:

        geoFolder.add(params,'geoVisible').onChange(
            function(value){
                woodCut.params.geoVisible = value;
                woodCut.geodesic.setVisibility(value);
            });


        geoFolder.add(params, 'geoPos', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.geoPos = value;
                let iniState = woodCut.buildGeodesicIniState();
                woodCut.geodesic.update(iniState);
        });
        geoFolder.add(params,'geoDir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.geoDir = value;
                let iniState = woodCut.buildGeodesicIniState();
                woodCut.geodesic.update(iniState);
            });
        geoFolder.add(params, 'printGeo').name('Download');






        stripeFolder.add(params,'stripeVisible').onChange(
            function(value){
                woodCut.params.stripeVisible = value;
                woodCut.stripes.setVisibility(value);
            });

        stripeFolder.add(params,'stripeDir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.stripeDir = value;
                woodCut.stripes.update({angle:params.stripeDir});
            });

        stripeFolder.add(params,'stripeSpread',0,1,0.01).name('Spread').onChange(
            function(value){
                params.stripeSpread = value;
                woodCut.stripes.update({spread:params.stripeSpread});
            });

        stripeFolder.add(params,'stripePos',woodCut.surface.domain.v.min,woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.stripePos = value;
                woodCut.stripes.update({pos:params.stripePos});
            });

        stripeFolder.add(params, 'printStripe').name('Download');

        //THIS PART NEEDS MORE WORK!
        // stripeFolder.add(params,'stripeNum',1,51,1).name('Number').onChange(
        //     function(value){
        //         params.stripeNum = value;
        //         woodCut.stripes.update({N:params.stripeNum});
        //     });


        sprayFolder.add(params,'sprayVisible').onChange(
            function(value){
                woodCut.params.sprayVisible = value;
                woodCut.spray.setVisibility(value);
            });

        sprayFolder.add(params,'sprayPos',woodCut.surface.domain.v.min,woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.sprayPos = value;
                let iniData =  woodCut.buildSprayIniData()
                woodCut.spray.update(iniData);
            });

        sprayFolder.add(params,'sprayDir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.sprayDir = value;
                woodCut.spray.update({angle:params.sprayDir});
            });


        sprayFolder.add(params,'spraySpread',0,1,0.01).name('Spread').onChange(
            function(value){
                params.spraySpread = value;
                woodCut.spray.update({spread:params.spraySpread});
            });

        sprayFolder.add(params, 'printSpray').name('Download');


    }

    tick(time,dTime){
       // let iniState = new State(new Vector2(2,-1),new Vector2(-1,Math.cos(time)));
        // this.geodesic.update({iniState:iniState});
        // this.stripes.update({time:time});
        //this.spray.update({time:time});
    }

}




export default WoodCut;
