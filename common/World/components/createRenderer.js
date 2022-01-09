import {
    WebGLRenderer,
    sRGBEncoding,
    CineonToneMapping,
    ACESFilmicToneMapping,
} from "../../../3party/three/build/three.module.js";


function createRenderer ( ) {

    const renderer = new WebGLRenderer({
        antialias : true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
    });

    // turn on the physically correct lighting model
    renderer.physicallyCorrectLights = true;

    //tone to screen
    renderer.toneMapping = ACESFilmicToneMapping;
      //  CineonToneMapping;
    //ACESFilmicToneMapping;
    renderer.outputEncoding = sRGBEncoding;

    return renderer;

}

export { createRenderer };
