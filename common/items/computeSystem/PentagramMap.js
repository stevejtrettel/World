import {NearestFilter} from "../../../3party/three/build/three.module.js";

import {randomFns} from "../../shaders/math/random.js";
import {rk4_vec4 as rk4} from "../../shaders/odes/rk4.js";
import { rotateR4 } from "../../shaders/geometry/rotateR4.js";
import {colorConversion} from "../../shaders/colors/colorConversion.js";

import ComputeSystem from "../../compute/gpu/ComputeSystem.js";
import ComputeParticles from "../../compute/materials/ComputeParticles.js";



//------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------
//Build the compute system
const defaultRes = [1024,1024];

//can use these in either shader
let computeUniforms = {
    a0: {
        type:'float',
        value: 0.75,
        range:[0,2,0.01]
    },

    b0: {
        type:'float',
        value: 0.25,
        range:[0,2,0.01]
    },

    c0: {
        type:'float',
        value: 0.25,
        range:[0,2,0.01]
    },

    d0: {
        type:'float',
        value: 0.5,
        range:[0,2,0.01]
    },

};



//------------------------------------------------------------------
// THE COMPUTE SHADERS
//-------------------------------------------------------------------

const ini = `
        void main() {
                //normalized coords in (0,1)
                vec2 uv = gl_FragCoord.xy/res;
                
                //get a random seed for the pixel
                seed = randomSeed(gl_FragCoord.xy,1.);
                
                //grab a random vector in the cube:
                float x = 2.*randomFloat()-1.;
                float y = 2.*randomFloat()-1.;
                float z = 2.*randomFloat()-1.;
                float w = 2.*randomFloat()-1.;

                
                //make the initial position
                vec4 iniPos = 0.0001*vec4(x,y,z,w)+vec4(a0,b0,c0,d0);
           
                //send result to data texture
                gl_FragColor = iniPos;
        }
`;


const vecField = `

      float F1( vec4 pos ){
     
          float a = pos.x;
          float b = pos.y;
          float c = pos.z;
          float d = pos.w;
          float E = a*c + b*d;
          
          float t1 = ( 1. + a - b );
          float t2 = ( 1. + c - d );
          float t3 = ( b - c + E );
          float t4 = ( d - a + E );
          float t5 = a*b*c*d;
          
          return ( t1 * t2 * t3 * t4 ) / t5;
     
      }
      
      
      float F2( vec4 pos ){
     
          float a = pos.x;
          float b = pos.y;
          float c = pos.z;
          float d = pos.w;
          float E = a*c + b*d;
          
          float t1 = ( 1. + b - a );
          float t2 = ( 1. + d - c );
          float t3 = ( c - b + E );
          float t4 = ( a - d + E );
          float t5 = a*b*c*d;
          
          return ( t1 * t2 * t3 * t4 ) / t5;
     
      }
      
      
      
      float Phi( vec4 pos, vec2 invariants ){
            vec2 vals = vec2( F1(pos), F2(pos) );
            vec2 v = vals - invariants;
            return dot(v,v);
      }
      
      
      //take the directional derivative of G in the direction dir:
      float dDirPhi( vec4 pos, vec4 dir, vec2 invariants ){
      
        float eps =0.0001;
        
        float v0 = Phi( pos - eps*dir, invariants );
        float v1 = Phi( pos + eps*dir, invariants );

        return (v1-v0)/(2.*eps*length(dir));
        
      }
      
      
      //compute the gradient of G
      vec4 gradPhi( vec4 pos, vec2 invariants ) {
      
         vec4 ea = vec4(1,0,0,0);
         vec4 eb = vec4(0,1,0,0);
         vec4 ec = vec4(0,0,1,0);
         vec4 ed = vec4(0,0,0,1);
   
         float dPhia = dDirPhi( pos, ea, invariants );
         float dPhib = dDirPhi( pos, eb, invariants );
         float dPhic = dDirPhi( pos, ec, invariants );
         float dPhid = dDirPhi( pos, ed, invariants );
         
         vec4 grad = vec4( dPhia, dPhib, dPhic, dPhid );
      
        return grad;
        
      }
      







      float G( vec4 pos ){
      
         return F2(pos) - F1(pos);
      
      }
      
      //take the directional derivative of G in the direction dir:
      float dDirG( vec4 pos, vec4 dir ){
      
        float eps =0.0001;
        
        float v0 = G( pos - eps*dir );
        float v1 = G( pos + eps*dir );

        return (v1-v0)/(2.*eps*length(dir));
        
      }
      
      
      // //compute the gradient of G
      vec4 gradG( vec4 pos ) {

         vec4 ea = vec4(1,0,0,0);
         vec4 eb = vec4(0,1,0,0);
         vec4 ec = vec4(0,0,1,0);
         vec4 ed = vec4(0,0,0,1);

         float dGa = dDirG( pos, ea );
         float dGb = dDirG( pos, eb );
         float dGc = dDirG( pos, ec );
         float dGd = dDirG( pos, ed );

         vec4 grad = vec4( dGa, dGb, dGc, dGd );

        return grad;

      }

      
      // vec4 gradG( vec4 pos ){
      //
      //     float a = pos.x;
      //     float b = pos.y;
      //     float c = pos.z;
      //     float d = pos.w;
      //
      //     float dGa = (-2.*a*a*a*c*d + (-1. + b) * d * ((b - c)*(b - c) + (-1. + b*b) * c * d - b*b*d*d) + 
      //  a*a * (b + c * d * (-c + d) + b * (c - d) * (c * (-1. + d) + d)));
      //
      //
      //     float dGb = (a * b *b * (-1. + c *c ) + (-2. * b*b*b + (-1. + a*a) * c * (a + c) + 
      //    b*b* (1. + 2.* c - a* (-1. + c + c*c))) * d + (c - 
      //    a*a*c + (1. - 2.*b)* b*b* c + a * b*b* (1. + 2.* c)) *d*d - (1. + a - 
      //    2.* b)* b*b*d*d*d);
      //
      //    float dGc = (a * b * (b + (b - 2. * c) * c*c - a * (1. + c*c)) + (-1. + 
      //    b) * (b * (-a + b) + (-1. + a*a - a * b)*c*c)*d + 
      // a * (a - b) * b * d *d + (a - b) * (-1. + b) * b * d *d*d);
      //
      //   float dGd = (a * b * (a - b + c) * (-1. + c*c) - ((-1. + b)*(-1.+b)* (1. + b) * c + 
      //    a*a* (b + (-1. + b) * c) + a * b * (c - b * (1. + 2. * c))) * d*d - 
      // 2. * (a - b) * (-1. + b) * b * d * d *d);
      //
      //   float coef = 0.;
      //   if(a*b*c*d!=0.){
      //       coef = 2./(a*b*c*d);
      //       return coef*vec4( dGa/a, dGb/b, dGc/c, dGd/d );
      //    }
      //
      //   return vec4(0);
      //
      // }
      //
      
      //rotate a gradient with respect to symplectic form:
      vec4 symplecticGrad(vec4 pos, vec4 grad){
      
          float a = pos.x;
          float b = pos.y;
          float c = pos.z;
          float d = pos.w;
          
          float gra = grad.x;
          float grb = grad.y;
          float grc = grad.z;
          float grd = grad.w;
          
          return vec4( -a*b*grb, a*b*gra, -c*d*grd, c*d*grc );
      
      }
      
      
      //do this for the function G
      vec4 symplecticG( vec4 pos ) {
     
        vec4 grad = gradG(pos);
        vec4 flow = symplecticGrad(pos, grad);
        return flow;
      }
      
      
      
      vec4 XG( vec4 pos ){
      
          float a = pos.x;
          float b = pos.y;
          float c = pos.z;
          float d = pos.w;
          
          
          float Xa = -(a*b*(2.*(-2./a - (1. - a*a - b*b)/(a*b*b))*(a - b + c - d) - 
        2.*((1. - a*a - b*b)/(a*b) + (1. - c*c - d*d)/(c*d))));
        
        float Xb = a*b*(2.*(-2./b - (1. - a*a - b*b)/(a*a*b))*(a - b + c - d) + 
       2.*((1. - a*a - b*b)/(a*b) + (1. - c*c - d*d)/(c*d)));
       
       float Xc = -(c*d*(2.*(a - b + c - d)*(-2./c - (1. - c*c - d*d)/(c*d*d)) - 
        2.*((1. - a*a - b*b)/(a*b) + (1. - c*c - d*d)/(c*d))));
        
        
        float Xd = c*d*(2.*(a - b + c - d)*(-2./d - (1. - c*c - d*d)/(c*c*d)) + 
       2.*((1. - a*a- b*b)/(a*b) + (1. - c*c- d*d)/(c*d)));
      
    
        return vec4( Xa, Xb, Xc, Xd );
      
      }
      
      
     
      
      vec4 X1(vec4 pos ){
                 
          float a = pos.x;
          float b = pos.y;
          float c = pos.z;
          float d = pos.w;
          
          float x = ((1. + c - d)*(-(a*pow(b,2.)) + a*c - pow(a,3.)*c + a*pow(b,2.)*c - a*pow(c,2.) + pow(a,3.)*pow(c,2.) -
        2.*a*pow(b,2.)*d + 2.*pow(b,3.)*d - c*d + pow(a,2.)*c*d - pow(b,2.)*c*d + 2.*a*pow(b,2.)*c*d -
        a*pow(b,2.)*pow(d,2.) + 2.*pow(b,3.)*pow(d,2.)))/(b*c*d);
        
        float y =   ((1. + c - d)*(-(pow(a,2.)*b) - 2.*pow(a,3.)*c + 2.*pow(a,2.)*b*c + 2.*pow(a,3.)*pow(c,2.) -
        pow(a,2.)*b*pow(c,2.) - b*d - pow(a,2.)*b*d + pow(b,3.)*d + c*d + pow(a,2.)*c*d + 2.*pow(a,2.)*b*c*d -
        pow(b,2.)*c*d - b*pow(d,2.) + pow(b,3.)*pow(d,2.)))/(a*c*d);
        
        float z =   ((1. + a - b)*(-(a*b) + a*c - pow(a,2.)*c + a*b*pow(c,2.) - a*pow(c,3.) + pow(a,2.)*pow(c,3.) -
        a*b*pow(d,2.) - c*pow(d,2.) + a*c*pow(d,2.) - 2.*b*c*pow(d,2.) + 2.*a*b*c*pow(d,2.) -
        pow(b,2.)*c*pow(d,2.) + 2.*b*pow(d,3.) + 2.*pow(b,2.)*pow(d,3.)))/(a*b*d);
        
        float w = ((1. + a - b)*(a*b + a*b*pow(c,2.) - 2.*a*pow(c,3.) + 2.*pow(a,2.)*pow(c,3.) - b*d - pow(b,2.)*d -
        pow(c,2.)*d + 2.*a*pow(c,2.)*d - pow(a,2.)*pow(c,2.)*d - b*pow(c,2.)*d + 2.*a*b*pow(c,2.)*d -
a*b*pow(d,2.) + b*pow(d,3.) + pow(b,2.)*pow(d,3.)))/(a*b*c);
        
        return vec4(x,y,z,w);
        
        }



    
    vec4 vecField( vec4 pos ) {
    
        // vec2 invariants = vec2(invP, invQ);
        //
        // vec4 grad = - gradPhi( pos, invariants );
        // vec4 flow = symplecticG( pos );
        //
        // return (1.-gradSpeed)*flow + gradSpeed*grad;
        
        
        return X1(pos);
        
    }
    `;



const discreteDynamics = `
    vec4 A(vec4 pos){
    
          float a = pos.x;
          float b = pos.y;
          float c = pos.z;
          float d = pos.w;
          
          return vec4(-b,-a,-d,-c);
    
    }
    
    vec4 Delta(vec4 pos){
          float a = pos.x;
          float b = pos.y;
          float c = pos.z;
          float d = pos.w;
          
          float E = a*c + b*d;
          float D = (E + a + c + 1.);
          
          float x = b*(c+d+1.);
          float y = d*(E+b+c);
          float z = d*(a+b+1.);
          float w = b*(E+a+d);
          
          return vec4(x/(c*D), y/(c*D), z/(a*D), w/(a*D));
          
    }
    
    vec4 discreteDynamics(vec4 pos){
        return A(Delta(pos));
        }
`;

const sim = discreteDynamics+`

    vec4 jump(vec4 p ){
                
                float x = randomFloat();
            if(x<0.5){
                 return discreteDynamics(p);   
                }
                
                return p;
    }
    

void main()
        //takes in gl_FragCoord, outputs gl_FragColor
        {   
            // Normalized pixel coordinates (from 0 to 1)
            vec2 uv = gl_FragCoord.xy/res;
            ivec2 ij = ivec2(gl_FragCoord.xy);
            
            //random seed if needed:
            seed = randomSeed(gl_FragCoord.xy, frameNumber);
            
            //get data from the last frame
            //vec4 p = texture( pos, uv );
            vec4 p = texelFetch(pos, ij, 0);
           
            
            //apply the discrete dynamics:
            vec4 q = p;
            for(int i=0;i<8;i++){
            q = jump(q);
            }


         
            //update via RK, using the provided vecField
            //vec4 q = rk4(p, dt);
    
             
            
            //if the resulting point is "out of bounds", restart it
            //by randomly sampling the texture to get another point, and then perturbing:
            // if(length(q)>20.){
            //
            //     vec2 samplePt = vec2(randomFloat(), randomFloat());
            //     vec4 samplePos = texture( pos, samplePt );
            //     vec4 jiggle = vec4(randomFloat(-1.,1.), randomFloat(-1.,1.), randomFloat(-1.,1.), randomFloat(-1.,1.));
            //
            //   //  q =  samplePos + 0.01 * jiggle;
            //   q=samplePos;
            //
            // }

            // Output to data texture
            gl_FragColor = q;
        }
`;




//------------------------------------------------------------------
// THE PARTICLE SIMULATION
//-------------------------------------------------------------------

const particleUniforms = {
    size:
        {
            type:'float',
            value: 1.,
            range:[1.,2.,0.01]
        },
    rot1:
        {
            type:'float',
            value: 0.,
            range:[0.6,3.,0.01]
        },
    rot2:
        {
            type:'float',
            value: 0.,
            range:[0.6,3.,0.01]
        },
    rot3:
        {
            type:'float',
            value: 0.,
            range:[0.6,3.,0.01]
        },
};

const particleVertex = rotateR4 + `

varying vec3 particlePosition;
varying float particleProjection;

void main() {

    //the mesh is a square so the uvs = the xy positions of the vertices
    //get the output of the compute shader
    vec4 computePos = texture2D(pos, position.xy);
    
    //set the particlePosition and speed from this:
    vec4 rotPos = rotateR4(computePos, rot1, rot2, rot3);
    particlePosition = rotPos.xyz;
    particleProjection = rotPos.w;
 
    //regular projection of our position
    gl_Position = projectionMatrix * modelViewMatrix * vec4( particlePosition, 1.0 );
 
    //sets the point size
    gl_PointSize = size;
}`;



const particleFragment = colorConversion+`
varying vec3 particlePosition;
varying float particleProjection;

void main() {

    //need to learn how the key word "discard" works!
    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
      float d = dot(circCoord, circCoord);
      if (d > 1.0) {
          discard;
      }
    
    //set the opacity of the point:
    float opacity =0.15;
    
    //figure out the color of the point:
    float x = 1./3.14*atan(particleProjection/4.)+0.5;
    vec3 col = hsb2rgb(vec3(x,0.5,0.5));
      
    gl_FragColor = vec4( col, opacity );
}`;










class PentagramMap{
    constructor(renderer,res = defaultRes) {

        const computeVariables = ['pos'];

        const computeOptions = {
            res: res,
            filter: NearestFilter,
            resetSwitch: true,
        }

        //assemble the compute shader:
        const computeShaders= {
            pos: {
                initialization: randomFns+ini,
                simulation: randomFns+vecField+rk4+sim,
            }
        };
        this.compute = new ComputeSystem(
            computeVariables,
            computeShaders,
            computeUniforms,
            computeOptions,
            renderer,
        );
        this.compute.setName( 'Compute' );


        //assemble the particle system
        const options = {};
        this.particles = new ComputeParticles(
            this.compute,
            particleUniforms,
            particleVertex,
            particleFragment,
            options
        );
        this.particles.setName('Particles');

    }


    addToScene(scene){
        this.compute.addToScene(scene);
        this.particles.addToScene(scene);
    }

    addToUI(ui){
        this.compute.addToUI(ui);
        this.particles.addToUI(ui);
    }

    tick(time,dTime){
        this.compute.tick(time,dTime);
        this.particles.tick(time,dTime);
    }

}


export default PentagramMap;