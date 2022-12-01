import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Mesh,
    SmoothShading
} from "../../3party/three/build/three.module.js";

import {
    createFragmentCSM,
    createVertexCSM,
    createVertexTube
} from "../materials/createCSMShaders.js";

import {UnitSquare} from "../gpu/components/UnitSquare.js";
import {CustomShaderMaterial} from "../../3party/three-csm.m.js";



//make a geometry which has segments many things long and tubeRes things high
//has a position, tangent, normal, and binormal attributes
class BaseTube extends BufferGeometry {
    constructor( curve, options ){

        super();

        this.curve = curve;
        this.segments = options.segments;
        this.radius = options.radius;
        this.tubeRes = 16.||options.tubeRes;

        this.setAttributes( curve );
        this.setIndices();

    }


    setIndices(){
        //NEED TO UNDERSTAND WHAT IS GOING ON HERE
        let indices = [];

        for( let ix=0; ix<this.segments; ix++ ) {
            for(let iy=0; iy<this.tubeRes; iy++ ) {

                const gridX = this.segments+1;
                const gridY = this.tubeRes+1;

                const a = iy + gridY * ix;
                const b = iy + gridY * ( ix + 1 );
                const c = ( iy + 1 ) + gridY * ( ix + 1 );
                const d = ( iy + 1 ) + gridY * ix;

                indices.push( a, b, d );
                indices.push( b, c, d );

            }
        }
        this.setIndex( indices );
    }


    setAttributes( curve ) {

        this.curve = curve;

        //get data from the curve:
        const points = this.curve.getPoints(this.segments);
        const frames = this.curve.computeFrenetFrames( this.segments, false );

        let posAtt = [];
        let normalAtt = [];
        let uvAtt = [];

        let theta;
        let p, N, B;
        let pos, normal;
        let uvx, uvy;

        for( let i=0; i<this.segments+1; i++ ) {

            //get the initial position at this point:
            p = points[i];
            N = frames.normals[i];
            B = frames.binormals[i];
            uvx = i/this.segments;

            for(let j=0; j<this.tubeRes+1; j++ ) {

                //how far we are around the tube
                uvy = j/this.tubeRes;
                theta = 2.*Math.PI * uvy;

                //calculate the position and normal:
                normal = N.clone().multiplyScalar(Math.cos(theta)).add(B.clone().multiplyScalar(Math.sin(theta)));
                pos = p.clone().add(normal.clone().multiplyScalar(this.radius));

                //set the position and normal attributes:
                posAtt.push(pos.x, pos.y, pos.z);
                normalAtt.push(-normal.x, -normal.y, -normal.z);
                uvAtt.push(uvx, uvy);
            }
        }

        this.setAttribute( 'position', new Float32BufferAttribute( posAtt, 3 ) );
        this.setAttribute( 'normal', new Float32BufferAttribute( normalAtt, 3 ) );
        this.setAttribute( 'uv', new Float32BufferAttribute( uvAtt, 2 ) );

    }

}














class ParametricTube {

    constructor( curve, curveOptions, fragment, uniforms, matOptions = {} ) {

        //make uniforms for the display shaders
        //start with assumption there are no new special ones just for the display
        //need to update this in the future (want sliders for hue, opacity, etc)
        this.uniformString = ``;
        this.uniforms = {};

        //uniforms relevant to the compute system:
        this.createUniform('frameNumber' ,'float', 0);
        this.createUniform('time' ,'float', 0);
        this.createUniform('dTime' ,'float', 0);

        //uniforms for the particle system governed by UI
        //package the uniforms for the UI in a useful way:
        this.paramProperties = uniforms;
        this.parameters = {};

        for( let uniform of Object.keys(this.paramProperties)){
            this.parameters[uniform] = this.paramProperties[uniform].value;
            this.createUniform(uniform, this.paramProperties[uniform].type, this.paramProperties[uniform].value);
        }

        //build shaders from our inputs
        this.vertex = createVertexTube( this.uniformString );
        this.fragment = createFragmentCSM( this.uniformString, fragment.aux, fragment.fragColor );

        //create the mesh by adding vertices at points in a (0,1)x(0,1) square
        //resolution is given by options
        this.geometry = new BaseTube(curve, curveOptions);

        //get the desired material properties
        this.options = matOptions;

        //make the custom material with the vertex shader, and using the fragment shader
        let customMatParameters = {
            baseMaterial: "MeshPhysicalMaterial",
            vShader: {
                defines: this.vertex.defines,
                header: this.vertex.header,
                main: this.vertex.main,
            },

            fShader: {
                defines: this.fragment.defines,
                header: this.fragment.header,
                main: this.fragment.main,
            },
            uniforms: this.uniforms,
            passthrough: {
                side: DoubleSide,
                ...this.options
            },
        };

        //use Farazz's CustomShaderMaterial class
        this.material = new CustomShaderMaterial( customMatParameters );

        this.mesh = new Mesh(this.geometry, this.material);

        this.name = null;

    }

    //only to be used during construction:
    createUniform(variable, type, value) {
        this.uniforms[ variable ] = {value: value };
        this.uniformString += `uniform ${type} ${variable}; \n`;
    }


    setName( name ){
        this.name = name;
    }



    resetCurve( curve ){
        this.curve = curve;
        this.geometry.setAttributes(curve);
    }

    setPosition(x,y,z){
        this.mesh.position.set(x,y,z);
    }



    addToScene( scene ){
        scene.add(this.mesh);
    }


    addToUI( ui ) {
        //make a folder for this compute system:
        let Folder = ui.addFolder(this.name);
        for( let variable of Object.keys(this.paramProperties)){
            //add uniform to folder. update the uniforms on change
            Folder.add(this.parameters, variable, ...this.paramProperties[variable].range).onChange(val => this.uniforms[variable].value = val);
        }
    }

    updateUniforms() {
        //all ui uniforms are updated automatically
        this.uniforms.frameNumber.value += 1.;
    }

    tick(time, dTime){
        this.updateUniforms();
        this.uniforms.time.value = time;
        this.uniforms.dTime.value = dTime;
    }


}












export { ParametricTube };
