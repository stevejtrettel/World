import sphericalHarmonic from "./sphericalHarmonic.js";
import laguerre from "./laguerre.js";



//computes the quantity (n-l-1)!/(n+l)!
const factorialPrefactor = `
float factorialPrefactor(int n, int l){
    float res = 1.;
    for(int i = n-l; i<n+l+1; i++){
        res *= float(i);
    }
    return 1./res;
}
`;

//quantum numbers n,l,m:
// n is positive
// l is between 0 and n-1
//m is between -l and l
//s is a point in 3Space in cartesian coordinates s=vec3(x,y,z);
//output is a complex number given as a MAGNITUDE and a PHASE
const hydrogenOrbital =  sphericalHarmonic+laguerre+factorialPrefactor+`
    vec2 hydrogenOrbital(int n, int l, int m, vec3 s){
    
        //make sure all the numbers are in the correct bounds:
        l = min(l,n-1);
        m = min(abs(m),l);
    
        float a = 1.;//bohr Radius
        float mu = 1.;//reduced mass
        float Z =1.; //charge
        
        float r = length(s);
        //rescaled radius:
        float rho = 2.*Z*r/(float(n)*a);
        
        //the radial component
        float radConstant = - sqrt( pow(rho/r ,3.) * 1./(2.*float(n)) * factorialPrefactor(n,l) );
        float radPrefactor = exp(-rho/2.)*pow(abs(rho),float(l));
        float radLaguerre = laguerre(n-l-1, 2*l+1, rho);
        float Rnl = radConstant * radPrefactor * radLaguerre;
        
        //the real spherical harmonic component
        float Ylm = sphericalHarmonic(l,m,s);
        
        //the phase of the spherical harmonic component:
        float shPhase = 0.;
        
        
        //BUILDING THE WAVEFUNCTION:
        float mag = Rnl * Ylm;
        float phase =shPhase;
        
        //increase the height of the plot: normalization makes it too small!
        mag = mag * pow(float(n),1.5);
        
        return vec2 (mag, phase);
    }
`;


export default hydrogenOrbital;