import CartesianVolume from "../../../../code/items/vector-calculus/CartesianVolume.js";
import CartesianSlice from "../../../../code/items/vector-calculus/CartesianSlice.js";
import CartesianSliceIntegrate from "../../../../code/items/vector-calculus/CartesianSliceIntegrate.js";

const parser = math.parser();

let defaultParams = {

    eqnTxt: 'sin(2.*x)*sin(2.*y)+1.5',
    domain:{
        x:{min:1,max:2.5},
        y:{min:0, max:4}
    },
    slice: 0.25,
}


class IteratedIntegralPlotter {
    constructor(params=defaultParams) {

        this.params = params;
        this.domain = params.domain;

        this.eqnTxt = params.eqnTxt;
        this.eqn = parser.evaluate('f(x,y)='.concat(this.eqnTxt));

        this.slice=params.slice;
        this.sliceVar='x';

        this.volume = new CartesianVolume(this.eqn,this.domain);
        this.slicePlot = new CartesianSlice(this.eqn,this.domain,this.slice,this.sliceVar);
        this.integralPlot = new CartesianSliceIntegrate(this.eqn,this.domain,this.slice,this.sliceVar);

    }


    addToScene(scene){
        this.volume.addToScene(scene);
        this.slicePlot.addToScene(scene);
        this.integralPlot.addToScene(scene);
    }

    addToUI(ui){
        let thisObj = this;
        ui.add(thisObj,'eqnTxt').name('f(x,y)=').onFinishChange(function(value){
            thisObj.eqn = parser.evaluate('f(x,y)='.concat(value));
            thisObj.volume.updateEqn(thisObj.eqn);
            thisObj.slicePlot.updateEqn(thisObj.eqn);
            thisObj.integralPlot.updateEqn(thisObj.eqn);
        });
        ui.add(thisObj, 'sliceVar',{'x':'x','y':'y'}).name('Integrate First').onChange(function(value){
            thisObj.slicePlot.setSliceVar(value);
            thisObj.integralPlot.setSliceVar(value);
        });
        ui.add(thisObj,'slice',0,1,0.01).name('slice').onChange(function(value){
            thisObj.slicePlot.updateSlice(value);
            thisObj.integralPlot.updateSlice(value);
        });
        let dFolder = ui.addFolder('Domain');
        dFolder.add(thisObj.domain.x,'min').name('rMin=').onChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
            thisObj.slicePlot.updateDomain(thisObj.domain);
            thisObj.integralPlot.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.x,'max').name('rMax=').onChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
            thisObj.slicePlot.updateDomain(thisObj.domain);
            thisObj.integralPlot.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.y,'min').name('tMin=').onFinishChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
            thisObj.slicePlot.updateDomain(thisObj.domain);
            thisObj.integralPlot.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.y,'max').name('tMax=').onFinishChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
            thisObj.slicePlot.updateDomain(thisObj.domain);
            thisObj.integralPlot.updateDomain(thisObj.domain);
        });
    }

    tick(time,dTime){

    }

}


export default IteratedIntegralPlotter;
