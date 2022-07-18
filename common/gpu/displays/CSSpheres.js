
import {
    BufferGeometry, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, Points,
    ShaderMaterial, SphereBufferGeometry,
    Vector2
} from "../../../3party/three/build/three.module.js";



const fetch = `
    vec4 fetch(sampler2D tex, ivec2 ij) {

        return texelFetch(tex, ij, 0);
    }
    `;



let fragmentShader = `
uniform sampler2D posData;//RenderTarget containing the transformed positions
  void main(){
    gl_FragColor = vec4(1.);
  }
`;

let vertexShader = fetch+`

attribute float iIndex;
attribute float jIndex;

uniform sampler2D posData;//RenderTarget containing the transformed positions

  void main(){
  
     ivec2 ij = ivec2(int(iIndex),int(jIndex));
  
    //get the position from the data
      vec3 offset = fetch(posData,ij).xyz;
    
    vec3 transformed = position.xyz+offset;
    
    gl_Position = projectionMatrix* modelViewMatrix * vec4(transformed, 1.);
  }
`;



class CSSpheres extends Mesh {
    constructor( computeSystem, variable ) {
        super();
        this.computer=computeSystem;
        this.variable=variable;

        this.numSpheres=this.computer.res[0]*this.computer.res[1];
        this.uniforms = {
            posData: { value: this.data },
            res: { value: new Vector2(this.computer.res[0],this.computer.res[1])},
        };


        // transform a standard material to support instanced rendering
        let material = new ShaderMaterial({
            fragmentShader,
            vertexShader,
            uniforms: this.uniforms
        });
        this.material = material;
    }


    init() {

        let baseGeometry = new SphereBufferGeometry(0.1, 8, 8);
        let instancedGeometry = new InstancedBufferGeometry().copy(baseGeometry);
        instancedGeometry.instanceCount=this.numSpheres;
        instancedGeometry.maxInstancedCount = this.numSpheres;

        //make the ij index for each instance of the geometry
        let iIndex=[];
        let jIndex=[];

        for( let i=0; i<this.computer.res[0]; i++ ){
            for( let j=0; j<this.computer.res[1]; j++ ){
                iIndex.push(i);
                jIndex.push(j);
            }
        }

        instancedGeometry.setAttribute(
            "iIndex",
            new InstancedBufferAttribute(new Float32Array(iIndex), 1, false)
        );

        instancedGeometry.setAttribute(
            "jIndex",
            new InstancedBufferAttribute(new Float32Array(jIndex), 1, false)
        );

        this.geometry = instancedGeometry;
    }
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }

    tick(){
        this.uniforms.posData.value=this.computer.getData(this.variable);
    }


}










export { CSSpheres };
