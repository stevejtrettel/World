
//------------------------------------------------------------------
// PART OF THE COLOR VISION COLLECTION OF PROGRAMS
//-------------------------------------------------------------------




import {
    Color,
    DoubleSide,
    DynamicDrawUsage,
    InstancedMesh,
    MeshPhysicalMaterial,
    Object3D,
    BoxBufferGeometry,
} from "../../../3party/three/build/three.module.js";


import {spectralColor, spectralHue} from "../../utils/colors.js";



function waveColor(freq,amp,val){
    //set the color of this instance:
    //make it different for positive and negative areas:
    let hue,sat,lightness;

    hue = spectralHue(freq);
    sat = amp/1.5*Math.abs(val/amp);
    lightness=Math.abs(val/amp)/2;

    if(val>0){
        lightness *= 1;
    }
    else{
        lightness *= 0.5;
    }

    return new Color().setHSL(hue, sat, lightness);
}



function freqConversion(f){
    return Math.exp(3.*f);
}

class EMWave{

    constructor( ){

        //frequency is between 0 (red) and 1
        //mapped exponentially to get what we actually see for the wave
        this.amp = 1;
        this.freq = 0.5;
        this.range = {min:-5,max:5};
        this.N = 1000;
        this.thickness=0.15;
        this.curve = function(x,params={t:0,freq:this.freq,amp:this.amp}){
            let f = freqConversion(this.freq);
            return params.amp* Math.sin(f*(x-params.t/3.));
        }

        //dummy object to be able to make the matrix for each case:
        this.dummy = new Object3D();

        //this index is always between 0 and this.N-1
        this.getCoords = function(index){
            let span = (this.range.max-this.range.min);

            //midpoint Riemann Sum
            let xPercent = (index+0.5) / this.N;
            let xVal = span * xPercent + this.range.min;

            return xVal;
        }

        this.initialize();

    }


    initialize(){
        //all the rectangles are going to be resized versions of this:
        const barGeometry = new BoxBufferGeometry(1,1,1);
        const barMaterial = new MeshPhysicalMaterial({
            side: DoubleSide,
            clearcoat:1,
        });

        //the maximum number of different bars we can have in the bargraph show up
        this.totalCount=1000;

        this.electric = new InstancedMesh( barGeometry, barMaterial, this.totalCount );
        this.magnetic = new InstancedMesh( barGeometry, barMaterial, this.totalCount );

        this.electric.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame
        this.magnetic.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame

    }


    addToScene(scene){
        scene.add(this.electric);
        scene.add(this.magnetic);
    }

    update(params){

        if ( this.electric ) {//if it's been initialized

            //set the count to the current value of N:
            this.electric.count = this.N;

            let xCoord, yVal;
            let xScale,yScale;

            for(let index = 0; index<this.totalCount; index++) {

                //what point in the (x,y) plane does this index represent?
                xCoord = this.getCoords(index);
                //get the y-Value at this point
                yVal = this.curve(xCoord, params);

                //build a matrix on this.dummy that moves it to the position specified by coords
                //rectangle's x is at the xCoord, center is half way up the total y-Value
                this.dummy.position.set(xCoord, yVal/2, 0.0);

                //scale the object correctly: stretch out in the x and y directions
                xScale = (this.range.max-this.range.min)/this.N;
                yScale = Math.abs(yVal);
                this.dummy.scale.set(xScale,yScale,this.thickness);

                //set green for pos and red for neg:
                let color = waveColor(this.freq, this.amp,yVal);
                this.electric.setColorAt(index, color);

                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.electric.setMatrixAt(index, this.dummy.matrix);

                if(index>this.N-1){
                    break;
                }

            }

            this.electric.instanceMatrix.needsUpdate = true;
            this.electric.instanceColor.needsUpdate = true;

        }




        //now same thing, for magnetic (maybe in future combine into one loop)
        if ( this.magnetic ) {//if it's been initialized

            //set the count to the current value of N:
            this.magnetic.count = this.N;

            let xCoord, zVal;
            let xScale,zScale;

            for(let index = 0; index<this.totalCount; index++) {

                //what point in the (x,y) plane does this index represent?
                xCoord = this.getCoords(index);
                //get the y-Value at this point
                zVal = this.curve(xCoord, params);

                //build a matrix on this.dummy that moves it to the position specified by coords
                //rectangle's x is at the xCoord, center is half way up the total z-Value
                this.dummy.position.set(xCoord, 0.0, zVal/2,);

                //scale the object correctly: stretch out in the x and z directions
                xScale = (this.range.max-this.range.min)/this.N;
                zScale = Math.abs(zVal);
                this.dummy.scale.set(xScale,this.thickness,zScale,);

                //set green for pos and red for neg:
                let color = waveColor(this.freq,this.amp,zVal);
                this.magnetic.setColorAt(index, color);

                //update the actual matrix at this point!!!
                this.dummy.updateMatrix();
                this.magnetic.setMatrixAt(index, this.dummy.matrix);

                if(index>this.N-1){
                    break;
                }

            }

            this.magnetic.instanceMatrix.needsUpdate = true;
            this.magnetic.instanceColor.needsUpdate = true;

        }
    }


    //all of these need to be followed by "update"
    //after the switch has been made:

    setFreq(freq){
        this.freq=freq;
    }

    setAmp(amp){
        this.amp=amp;
    }

    setRange(range){
        this.range=range;
    }

    setN(N){
        this.N=N;
    }

    setVisibility(value){
        this.electric.visible=value;
        this.magnetic.visible=value;
    }


    setPosition(x,y,z){
        this.electric.position.set(x,y,z);
        this.magnetic.position.set(x,y,z);
    }

}

export default EMWave;
