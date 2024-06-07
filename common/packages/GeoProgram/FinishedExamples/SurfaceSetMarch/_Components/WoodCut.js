
import PlotGPU from "../../../Plot/PlotGPU.js";
import GeodesicStripes from "./GeodesicStripes.js";



class WoodCut{
    constructor(surface, geodesicData) {

        this.surface = surface
        this.plot = new PlotGPU(this.surface);

        //parameters the UI will control!
        let woodCut = this;
        this.params = geodesicData;

        //add to the parameters:
        this.params.surface = this.surface;
        this.params.printStripe = function(){
            woodCut.stripes.printToFile('stripe');
        };
        this.params.printAll = function(){
            woodCut.printToFile();
        };
        this.params.stripeVisible = true;

        let iniStripes = this.buildStripeIniData();
        this.stripes = new GeodesicStripes(this.surface,iniStripes);

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
        str = str + this.stripes.printToString(numPts);

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
        this.stripes.addToScene(scene);
    }

    addToUI(ui){

        let woodCut = this;
        let params = woodCut.params;

        let resetScene = function(){
            woodCut.plot.update();
            woodCut.stripes.updateSurface();
        };
        woodCut.surface.buildUIFolder(ui,resetScene);

        let stripeFolder = ui.addFolder('Stripes');

        stripeFolder.add(params,'stripeNum',0,50,1).name('Number').onChange(
            function(value){
                params.stripeNum = value;
                woodCut.stripes.update({N:params.stripeNum});
            });

        stripeFolder.add(params,'stripeDir',-1,1,0.001).name('Direction').onChange(
            function(value){
                params.stripeDir = value;
                woodCut.stripes.update({angle:params.stripeDir});
            });

        stripeFolder.add(params,'stripeSpread',0,1,0.001).name('Spread').onChange(
            function(value){
                params.stripeSpread = value;
                woodCut.stripes.update({spread:params.stripeSpread});
            });

        stripeFolder.add(params,'stripePos',woodCut.surface.domain.v.min,woodCut.surface.domain.v.max,0.001).name('Position').onChange(
            function(value){
                params.stripePos = value;
                woodCut.stripes.update({pos:params.stripePos});
            });

        // stripeFolder.add(params, 'printStripe').name('Download');

        ui.add(params,'printAll').name('Download All');
    }

    tick(time,dTime){}

}

export default WoodCut;

