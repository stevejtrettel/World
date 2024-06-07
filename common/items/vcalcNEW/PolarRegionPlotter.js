import PolarVolume from "../../components/vector-calculus/PolarVolume.js";

const parser = math.parser();

let defaultParams = {

    eqnTxt: 'sin(2.*r)*sin(2.*t)+1.5',
    domain:{
        r:{min:1,max:2.5},
        t:{min:0, max:4}
    },
    slice: 0.25,
}


class PolarRegionPlotter {
    constructor(params=defaultParams) {

        this.params = params;
        this.domain = params.domain;

        this.eqnTxt = params.eqnTxt;
        this.eqn = parser.evaluate('f(r,t)='.concat(this.eqnTxt));

        this.slice=params.slice;

        this.volume = new PolarVolume(this.eqn,this.domain);

    }


    addToScene(scene){
        this.volume.addToScene(scene);
    }

    addToUI(ui){
        let thisObj = this;
        ui.add(thisObj,'eqnTxt').name('f(r,t)=').onFinishChange(function(value){
            thisObj.eqn = parser.evaluate('f(r,t)='.concat(value));
            thisObj.volume.updateEqn(thisObj.eqn);
        });
        ui.add(thisObj,'slice',0,1,0.01).name('slice').onChange(function(value){
        });
        let dFolder = ui.addFolder('Domain');
        dFolder.add(thisObj.domain.r,'min').name('rMin=').onChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.r,'max').name('rMax=').onChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.t,'min').name('tMin=').onFinishChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
        });
        dFolder.add(thisObj.domain.t,'max').name('tMax=').onFinishChange(function(val){
            thisObj.volume.updateDomain(thisObj.domain);
        });
    }

    tick(time,dTime){

    }

}


export default PolarRegionPlotter;