import {Vector2} from "../../../3party/three/build/three.module.js";


import PlotGPU from "./Plot/PlotGPU.js";
import State from "./Integrator/State.js";
import Geodesic from "./Geodesics/Geodesic.js";
import BallTrail from "./Geodesics/Ball.js";
import BilliardPath from "./Geodesics/BilliardPath.js";

class Billiards{
    constructor(surface) {

        this.surface = surface;
        this.plot = new PlotGPU(this.surface);

        //parameters the UI will control!
        let billiards =this;
        this.params = {
            surface: this.surface,
            maxReflections:8,
            simSpeed:1,
            gravity:0,
            trailPos: 0,
            trailDir: 0,

            billiardVisible:true,
            trajectoryVisible: false,

            printAll: function(){
                billiards.printToFile();
            }
        }

        if(this.surface.gravity) {
            this.params.gravity=this.surface.gravity;
        }
        else{
            this.surface.gravity = this.params.gravity;
        }
        this.surface.initialize();

        let iniState = this.buildTrailIniState();
        this.trajectory = new BilliardPath(this.surface,iniState);
        this.billiard = new BallTrail(this.surface, iniState);
    }

    //to reset the initial state of a geodesic given position on boundary and angle
    buildTrailIniState(){
        let pos = new Vector2(this.surface.domain.u.min,this.params.trailPos);
        let vel = new Vector2(Math.cos(3.1415/2*this.params.trailDir),Math.sin(3.1415/2*this.params.trailDir));
        return new State(pos,vel);
    }



    printToString(numPts = 500){
        let str = ``;
        str += this.surface.printToString();
        str = str + this.trajectory.printToString(numPts);
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
        this.trajectory.addToScene(scene);
        this.trajectory.setVisibility(this.params.trajectoryVisible);
        this.billiard.addToScene(scene);
        this.billiard.setVisibility(this.params.billiardVisible)
    }

    addToUI(ui){

        let billiards = this;
        let params = billiards.params;

        let resetScene = function(){
            billiards.plot.update();
            billiards.trajectory.update();
        };

        billiards.surface.buildUIFolder(ui,resetScene);
        ui.add(params,'gravity',0,5,0.01).name('Gravity').onChange(function(value){
           params.gravity=value;
           billiards.surface.gravity=value;
           billiards.surface.initialize();
           resetScene();
        });

        let trailFolder = ui.addFolder('Billiard');
        trailFolder.close();



        trailFolder.add(params, 'trajectoryVisible').name('ShowTrajectory').onChange(function(value){
            params.trajectoryVisible=value;
            billiards.trajectory.setVisibility(value);

            params.billiardVisible=!value;
            billiards.billiard.setVisibility(!value);
        });

        trailFolder.add(params, 'trailPos', billiards.surface.domain.v.min, billiards.surface.domain.v.max,0.01).name('Position').onChange(
            function(value){
                params.trailPos = value;
                let iniState = billiards.buildTrailIniState();
                if(billiards.params.trajectoryVisible) {
                    billiards.trajectory.updateState(iniState);
                }
                if(billiards.params.billiardVisible) {
                    billiards.billiard.updateState(iniState);
                }
            });

        trailFolder.add(params,'trailDir',-1,1,0.01).name('Direction').onChange(
            function(value){
                params.trailDir = value;
                let iniState = billiards.buildTrailIniState();
                if(billiards.params.trajectoryVisible) {
                    billiards.trajectory.updateState(iniState);
                }
                if(billiards.params.billiardVisible) {
                    billiards.billiard.updateState(iniState);
                }
            });

        trailFolder.add(params, 'maxReflections', 0,20,1).name('Reflections').onChange(
            function(value){
                params.maxReflections = value;
                billiards.trajectory.curveOptions.maxReflections=value;
                if(billiards.params.trajectoryVisible){
                    billiards.trajectory.update();
                }
            });

        // trailFolder.add(params, 'simSpeed', 0,10,1).name('SimSpeed').onChange(
        //     function(value){
        //         params.simSpeed = value;
        //     });

        ui.add(params,'printAll').name('Download');

    }

    tick(time,dTime){
            if(this.params.billiardVisible) {
              //  for(let i=0;i<this.params.simSpeed;i++){
                    this.billiard.stepForward();
           // }
        }

    }

}


export default Billiards;
