import CartesianVarVolume from "../../../../code/items/vector-calculus/CartesianVarVolume.js";
import CartesianVarSlice from "../../../../code/items/vector-calculus/CartesianVarSlice.js";
import CartesianVarIntegrate from "../../../../code/items/vector-calculus/CartesianVarIntegrate.js";

const parser = math.parser();

let defaultParams = {

    eqnTxt: '(x^2+y^2)/3',
    domain:{
        x:{min:-2,max:2},
        y:{min:'-3+sin(3*x)/2', max:'x/3'}
    },
    slice: 0.25,
}


class IteratedIntegralFunctionBounds {
    constructor(params=defaultParams) {

        this.params = params;
        this.domain = params.domain;

        this.eqnTxt = params.eqnTxt;
        this.eqn = parser.evaluate('f(x,y)='.concat(this.eqnTxt));

        this.slice=params.slice;

        this.volume = new CartesianVarVolume(this.eqn,this.domain);
        this.xSlice = new CartesianVarSlice(this.eqn,this.domain,params.slice);
        this.yIntegral = new CartesianVarIntegrate(this.eqn,this.domain,params.slice);

    }


    addToScene(scene){
        this.volume.addToScene(scene);
        this.xSlice.addToScene(scene);
        this.yIntegral.addToScene(scene);
    }

    addToUI(ui){
        let thisObj = this;
        ui.add(thisObj,'eqnTxt').name('f(x,y)=').onFinishChange(function(value){
            thisObj.eqn = parser.evaluate('f(x,y)='.concat(value));
            thisObj.volume.updateEqn(thisObj.eqn);
            thisObj.xSlice.updateEqn(thisObj.eqn);
            thisObj.yIntegral.updateEqn(thisObj.eqn);
        });
        ui.add(thisObj,'slice',0,1,0.01).name('slice').onChange(function(value){
             thisObj.xSlice.updateSlice(value);
             thisObj.yIntegral.updateSlice(value);
        });
        let dFolder = ui.addFolder('Domain');
        dFolder.add(thisObj.domain.x,'min').name('xMin=').onChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
            thisObj.xSlice.updateDomain(thisObj.domain);
            thisObj.yIntegral.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.x,'max').name('xMax=').onChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
            thisObj.xSlice.updateDomain(thisObj.domain);
            thisObj.yIntegral.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.y,'min').name('yMin(x)=').onFinishChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
            thisObj.xSlice.updateDomain(thisObj.domain);
            thisObj.yIntegral.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.y,'max').name('yMax(x)=').onFinishChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
            thisObj.xSlice.updateDomain(thisObj.domain);
            thisObj.yIntegral.updateDomain(thisObj.domain);
        });
    }

    tick(time,dTime){

    }

}


export default IteratedIntegralFunctionBounds;
