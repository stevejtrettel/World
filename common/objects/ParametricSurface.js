
import { colorConversion } from "../shaders/colors/colorConversion.js";
import { ParametricMaterial } from "../materials/ParametricMaterial.js";





class ParametricSurface{

    constructor( surface, colorFunction ) {

        this.math=surface;


        //build the vertex shader
        this.vertexShader = {
            aux: ``,
            displace: this.math.displaceGLSL(),
        };


        //build the fragment shader:
        let curv = '0.65';
        if(colorFunction == 'gaussCurvature'){
            curv = `gaussCurvature(vUv)`;
        }
        if(colorFunction == 'meanCurvature'){
            curv = `meanCurvature(vUv)`;
        }

        const fragColor = `
            vec3 fragColor(){
                float k = tanh(3.*${curv});
                float sat = 0.8*abs(k);
                
                float hue;
                if(${curv}<0.){
                    hue = 0.6;
                   }
               else{
                    hue = 0.;
                }
               
                vec3 col = hsb2rgb(vec3(hue, sat, 0.5));
               
                return col;
            }
            `;

        this.fragmentShader = {
            aux: colorConversion + this.math.gaussCurvatureGLSL() + this.math.meanCurvatureGLSL(),
            fragColor: fragColor,
        };



        //build the surface itself

        const surfaceOptions = {
            clearcoat:0.1,
            metalness:0.,
            roughness:0.4,
        };

        this.surface = new ParametricMaterial(
            [128,128],
            this.vertexShader,
            this.fragmentShader,
            this.math.parameters,
            surfaceOptions,
        );

    }


    addToScene( scene ) {
        this.surface.addToScene( scene );
    }

    addToUI( ui ) {
        this.surface.addToUI( ui );
    }

    tick( time, dTime ) {
        this.surface.uniforms.a.value=0.5*Math.sin(time/2.)+0.6;
        this.surface.tick(time, dTime);
    }

}





export { ParametricSurface };
