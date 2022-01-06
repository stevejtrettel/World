import { globals } from "./globals.js";
import { LightProbeGenerator } from "../../3party/three/examples/jsm/lights/LightProbeGenerator.js";
import {BoxNoLights} from "../../common/backgrounds/BoxNoLights.js";
import {BoxWithLights } from "../../common/backgrounds/BoxWithLights.js";


//make the background texture:
const bkgScene = new BoxNoLights( globals.color );
const bkgCubeMap = globals.pmremGen.fromScene(bkgScene, 0.015,1,100);
const background = bkgCubeMap.texture;


//make the reflection texture:
const reflScene = new BoxWithLights( globals.color );
const reflCubeMap = globals.pmremGen.fromScene(reflScene, 0.015,1,100);
const reflection = reflCubeMap.texture;



const environment = {
    background: background,
    reflection: reflection,
}

export { environment };
