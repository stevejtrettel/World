import {Vector2} from "../../../3party/three/build/three.module.js";


import PlotGPU from "./Plot/PlotGPU.js";
import Plot from "./Plot/Plot.js";
import State from "./Integrator/State.js";
import Geodesic from "./Geodesics/Geodesic.js";
import GeodesicSpray from "./Geodesics/GeodesicSpray.js";
import GeodesicStripes from "./Geodesics/GeodesicStripes.js";


class WoodCut{
    constructor(surface) {

        this.surface = surface
        this.plot = new PlotGPU(this.surface);

        //parameters the UI will control!
        let woodCut = this;
        this.params = {

            surface: this.surface,

            geoPos: -0.2,
            geoDir: -0.5,
            geoVisible: false,
            // printGeo: function(){
            //     woodCut.geodesic.printToFile('geodesic');
            // },

            geoPos2: -0.1,
            geoDir2: -0.25,
            geoVisible2: false,

            geoPos3: 0,
            geoDir3: 0,
            geoVisible3: false,

            geoPos4: 0.1,
            geoDir4: 0.25,
            geoVisible4: false,

            geoPos5: 0.2,
            geoDir5: 0.5,
            geoVisible5: false,

            stripeNum:11,
            stripeDir:0,
            stripeSpread:0.35       ,
            stripePos:0,
            stripeVisible:true,
            printStripe: function(){
                woodCut.stripes.printToFile('stripe');
            },

            sprayNum:10,
            sprayPos:0,
            sprayDir:0,
            spraySpread:0.2,
            sprayVisible: false,
            printSpray: function(){
                woodCut.spray.printToFile('spray');
            },

            printAll: function(){
                woodCut.printToFile();
            },

        }

        let iniState = this.buildGeodesicIniState();
        this.geodesic = new Geodesic(this.surface,iniState);

        let iniState2 = this.buildGeodesicIniState();
        this.geodesic2 = new Geodesic(this.surface,iniState2);

        let iniState3 = this.buildGeodesicIniState();
        this.geodesic3 = new Geodesic(this.surface,iniState3);

        let iniState4 = this.buildGeodesicIniState();
        this.geodesic4 = new Geodesic(this.surface,iniState4);

        let iniState5 = this.buildGeodesicIniState();
        this.geodesic5 = new Geodesic(this.surface,iniState5);



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

    //to reset the initial state of a geodesic given position on boundary and angle
    buildGeodesicIniState2(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.geoPos2);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.geoDir2),Math.sin(3.1415/2*this.params.geoDir2));
        return new State(pos,vel);
    }

    //to reset the initial state of a geodesic given position on boundary and angle
    buildGeodesicIniState3(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.geoPos3);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.geoDir3),Math.sin(3.1415/2*this.params.geoDir3));
        return new State(pos,vel);
    }

    //to reset the initial state of a geodesic given position on boundary and angle
    buildGeodesicIniState4(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.geoPos4);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.geoDir4),Math.sin(3.1415/2*this.params.geoDir4));
        return new State(pos,vel);
    }

    //to reset the initial state of a geodesic given position on boundary and angle
    buildGeodesicIniState5(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.geoPos5);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.geoDir5),Math.sin(3.1415/2*this.params.geoDir5));
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


    printToString(numPts = 500){
        let str = ``;

        str += this.surface.printToString();

        if(this.params.geoVisible){
            str = str + this.geodesic.printToString(numPts);
        }

        if(this.params.geoVisible2){
            str = str + this.geodesic2.printToString(numPts);
        }

        if(this.params.geoVisible3){
            str = str + this.geodesic3.printToString(numPts);
        }

        if(this.params.geoVisible4){
            str = str + this.geodesic4.printToString(numPts);
        }

        if(this.params.geoVisible5){
            str = str + this.geodesic5.printToString(numPts);
        }

        if(this.params.sprayVisible){
            str = str + this.spray.printToString(numPts);
        }

        if(this.params.stripeVisible){
            str = str + this.stripes.printToString(numPts);
        }

        return str;
    }

    printToFile(){
        const contents = this.printToString();
        const file = new File([contents], `${this.surface.name}.txt`, {
                type: 'text/plain',
            });

            //a function which allows the browser to automatically downlaod the file created
            //(a hack from online: it makes a download link, artificially clicks it, and removes the link)
            //https://javascript.plainenglish.io/javascript-create-file-c36f8bccb3be
        function download() {
                const link = document.createElement('a')
                const url = URL.createObjectURL(file)

                link.href = url
                link.download = file.name
                document.body.appendChild(link)
                link.click()

                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
        }

        download();
    }


    addToScene(scene){
        this.plot.addToScene(scene);

        this.geodesic.addToScene(scene);
        this.geodesic2.addToScene(scene);
        this.geodesic3.addToScene(scene);
        this.geodesic4.addToScene(scene);
        this.geodesic5.addToScene(scene);

        this.stripes.addToScene(scene);
        this.spray.addToScene(scene);

        this.geodesic.setVisibility(this.params.geoVisible);
        this.geodesic2.setVisibility(this.params.geoVisible2);
        this.geodesic3.setVisibility(this.params.geoVisible3);
        this.geodesic4.setVisibility(this.params.geoVisible4);
        this.geodesic5.setVisibility(this.params.geoVisible5);

        this.stripes.setVisibility(this.params.stripeVisible);
        this.spray.setVisibility(this.params.sprayVisible);
    }

    addToUI(ui){

        let woodCut = this;
        let params = woodCut.params;

        let resetScene = function(){
            woodCut.plot.update();
            woodCut.geodesic.updateSurface();
            woodCut.geodesic2.updateSurface();
            woodCut.geodesic3.updateSurface();
            woodCut.geodesic4.updateSurface();
            woodCut.geodesic5.updateSurface();
            woodCut.spray.updateSurface();
            woodCut.stripes.updateSurface();
        };
        woodCut.surface.buildUIFolder(ui,resetScene);

        let gF = ui.addFolder('Geodesics');
        let geoFolder = gF.addFolder('Geodesic 1');
        let geoFolder2 = gF.addFolder('Geodesic 2');
        let geoFolder3 = gF.addFolder('Geodesic 3');
        let geoFolder4 = gF.addFolder('Geodesic 4');
        let geoFolder5 = gF.addFolder('Geodesic 5');

        let stripeFolder = ui.addFolder('Stripes');
        let sprayFolder = ui.addFolder('Spray');
        gF.close();
        geoFolder.close();
        geoFolder2.close();
        geoFolder3.close();
        geoFolder4.close();
        geoFolder5.close();
        stripeFolder.close();
        sprayFolder.close();


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

        // geoFolder.add(params, 'printGeo').name('Download');
        //


        geoFolder2.add(params,'geoVisible2').onChange(
            function(value){
                woodCut.params.geoVisible2 = value;
                woodCut.geodesic2.setVisibility(value);
            });

        geoFolder2.add(params, 'geoPos2', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.geoPos2 = value;
                let iniState = woodCut.buildGeodesicIniState2();
                woodCut.geodesic2.update(iniState);
            });
        geoFolder2.add(params,'geoDir2',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.geoDir2 = value;
                let iniState = woodCut.buildGeodesicIniState2();
                woodCut.geodesic2.update(iniState);
            });


        geoFolder3.add(params,'geoVisible3').onChange(
            function(value){
                woodCut.params.geoVisible3 = value;
                woodCut.geodesic3.setVisibility(value);
            });

        geoFolder3.add(params, 'geoPos3', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.geoPos3 = value;
                let iniState = woodCut.buildGeodesicIniState3();
                woodCut.geodesic3.update(iniState);
            });
        geoFolder3.add(params,'geoDir3',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.geoDir3 = value;
                let iniState = woodCut.buildGeodesicIniState3();
                woodCut.geodesic3.update(iniState);
            });


        geoFolder4.add(params,'geoVisible4').onChange(
            function(value){
                woodCut.params.geoVisible4 = value;
                woodCut.geodesic4.setVisibility(value);
            });

        geoFolder4.add(params, 'geoPos4', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.geoPos4 = value;
                let iniState = woodCut.buildGeodesicIniState4();
                woodCut.geodesic4.update(iniState);
            });
        geoFolder4.add(params,'geoDir4',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.geoDir4 = value;
                let iniState = woodCut.buildGeodesicIniState4();
                woodCut.geodesic4.update(iniState);
            });


        geoFolder5.add(params,'geoVisible5').onChange(
            function(value){
                woodCut.params.geoVisible5 = value;
                woodCut.geodesic5.setVisibility(value);
            });

        geoFolder5.add(params, 'geoPos5', woodCut.surface.domain.v.min, woodCut.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.geoPos5 = value;
                let iniState = woodCut.buildGeodesicIniState5();
                woodCut.geodesic5.update(iniState);
            });
        geoFolder5.add(params,'geoDir5',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.geoDir5 = value;
                let iniState = woodCut.buildGeodesicIniState5();
                woodCut.geodesic5.update(iniState);
            });














        stripeFolder.add(params,'stripeVisible').onChange(
            function(value){
                woodCut.params.stripeVisible = value;
                woodCut.stripes.setVisibility(value);
            });

        stripeFolder.add(params,'stripeNum',0,50,1).name('Number').onChange(
            function(value){
                params.stripeNum = value;
                woodCut.stripes.update({N:params.stripeNum});
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


        sprayFolder.add(params,'sprayVisible').onChange(
            function(value){
                woodCut.params.sprayVisible = value;
                woodCut.spray.setVisibility(value);
            });


        sprayFolder.add(params,'sprayNum',0,50,1).name('Number').onChange(
            function(value){
                params.sprayNum = value;
                woodCut.spray.update({N:params.sprayNum});
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


        ui.add(params,'printAll').name('Download All');
    }

    tick(time,dTime){
       // let iniState = new State(new Vector2(2,-1),new Vector2(-1,Math.cos(time)));
        // this.geodesic.update({iniState:iniState});
        // this.stripes.update({time:time});
        //this.spray.update({time:time});
    }

}




export default WoodCut;
