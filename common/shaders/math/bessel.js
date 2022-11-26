



const bessel = `
// from the shadertoy https://www.shadertoy.com/view/tlf3D2
// evaluate integer-order Bessel function of the first kind using the midpoint rule; https://doi.org/10.1002/sapm1955341298
// see also https://doi.org/10.2307/2695765 and https://doi.org/10.1137/130932132 for more details
float besselJ(int n, float x)
{
 int m = 14;
    float mm = float(m), nn = float(n);
    float s = 0.0, h = 0.5 * PI/mm;
    
    for (int k = 0; k < m; k++)
    {
        float t = h * (float(k) + 0.5);
        s += (((n & 1) == 1) ? (sin(x * sin(t)) * sin(nn * t)) : (cos(x * cos(t)) * cos(nn * t)))/mm;
    }
    
    return ((n & 1) == 1) ? s : (((((n >> 1) & 1) == 1) ? -1.0 : 1.0) * s);
}

//FROM THE SHADERTOY https://www.shadertoy.com/view/MlffDB
// Goal is to find the n_th (positive) zero of J_m
// This is my homebrew zero finder, caveat emptor
// Initial guess calibrated for 0<=m<=10, 1<=n<=5
float besselRoot(int m, int n) {

    float M = float(m);
    float N = float(n);
    float guess = -0.98368854 + 1.3045853*M + 3.4110198*N +
        (-0.0134096)*M*M + (-0.0491151)*N*N + 0.04748184*M*N;
        
    // Take 3 Newton steps, use d/dx J_m(x) = (m/x)*J_m(x) - J_{m+1}(x)
    for (int i = 0; i < 5; i++) {
        float val = besselJ(m, guess);
        float deriv = val * M/guess - besselJ(m+1, guess);
        guess -= val/deriv;
    }
   
    return guess;
}
`;


export default bessel;