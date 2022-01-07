
import { colorConversion } from "../../../common/shaders/colors/colorConversion.js";
import { ParametricMaterial } from "../../../common/materials/ParametricMaterial.js";

class TorusGeodesic{

    constructor(){

        this.parameterization = {
            x:``,
            y:``,
            z:``
        };

        this.domaian = {
            u:[0.,6.29],
            v:[0,6.29]
        };

        this.paramProperties = {
            a: {
                type: `float`,
                value: 1,
                range: [0,2,0.01],
            },
            b: {
                type: `float`,
                value: 2,
                range: [1,3,0.01],
            },
            p: {
                type: `float`,
                value: 1,
                range: [0,6.29,0.01],
            },
            v: {
                type: `float`,
                value: 1,
                range: [0,6.29,0.01],
            },
        };






        let vertAux = ``;

        //need  a function vec3 displace(vec2 uv)
        //uv has its two xy components in (0,1)
        const displace = `
            vec3 displace( vec2 uv ){
               
                float u = 2.*PI*uv.x;
                float v = 2.*PI*uv.y;
                
                float x = (b+a*cos(v))*cos(u);
                float y = (b+a*cos(v))*sin(u);
                float z = a*sin(v);
                
                return vec3(x,y,z);
            }
            `;


        const fragAux = colorConversion;

        const fragColor = `
            vec3 fragColor(){
                float u = 2.*PI*vUv.x;
                float v = 2.*PI*vUv.y;
                
                //the gaussian curvature of the torus
                float K = cos(v)/(b+a*cos(v));
                
                //rescaling this curvature and making into a color function:
                float k = (K+1.)/1.5;
                
                
                return hsb2rgb(vec3(K, 0.5, 0.4)); 
            }`;


        let vert = {
            aux: vertAux,
            displace: displace,
        };

        let frag = {
            aux: fragAux,
            fragColor: fragColor,
        };


        let surfaceOptions = {
            clearcoat:0.1,
            metalness:0.,
            roughness:0.4,
        };




        this.surface = new ParametricMaterial(
            [128,128],
            vert,
            frag,
            this.paramProperties,
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
        this.surface.tick(time, dTime);
    }

}



const tGeo = {
    torus: new TorusGeodesic(),
};



export{ tGeo };
