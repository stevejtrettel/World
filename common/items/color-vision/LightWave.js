import EMWave from "../../components/ColorVision/em-waves.js";


class LightWave{
    constructor() {

        this.params = {
            freq: 3,
            amp: 1,
            t: 0,
        }

        this.em = new EMWave(this.params.freq,this.params.amp);
    }

    addToScene(scene){
        this.em.addToScene(scene);
    }

    addToUI(ui){
        let thisObj = this;

        ui.add(this.params, 'freq', 0, 10, 0.01).name('frequency').onChange(function(value){
            thisObj.em.freq=value;
           thisObj.params.freq=value;
    });

        ui.add(this.params, 'amp', 0, 10, 0.01).name('amplitude').onChange(function(value){
            thisObj.em.amp=value;
            thisObj.params.amp=value;
        });
    }

    tick(time,dTime){
        this.params.t=time;
        this.em.update(this.params);
    }
}



let light = new LightWave();

export default {light};