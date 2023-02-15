import { globals } from "./globals.js";
import { LightProbeGenerator } from "../../3party/three/examples/jsm/lights/LightProbeGenerator.js";
import {BoxNoLights} from "../../common/backgrounds/BoxNoLights.js";
import {BoxWithLights } from "../../common/backgrounds/BoxWithLights.js";
import {CubeMap} from "../../common/backgrounds/CubeMap.js";

import {Color} from "../../3party/three/build/three.module.js";


function createEnvironment(color){

    //make the background texture:
        const bkgScene = new BoxNoLights( color );
        const background = bkgScene.createPMREM(globals.pmremGen);

        //make the reflection texture:
        const reflScene = new BoxWithLights( color );
        const reflection = reflScene.createPMREM(globals.pmremGen);


    //still unclear why I only need one set of ../ instead of 2 here.....
    //  const bkg2 = new CubeMap('../assets/cubeMaps/bridge/', 'jpg');
    //  const background2 = bkg2.createPMREM(globals.pmremGen);


        const environment = {
            background: new Color().set(0xffffff),
            reflection: reflection,
        }

        return environment;
}


export { createEnvironment };
