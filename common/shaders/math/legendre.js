 const legendre = `
 // Created by Roni Koitermaa - Roninkoi/2019
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// Uses Clenshaw algorithm to solve spherical harmonics from Legendre polynomials
// A review of methods can be found in arXiv:1410.1748 [physics.chem-ph]

// Clenshaw Legendre normalized
//this is the associated legendre polynomial
//with l a positive number, and m between -l and l:

float legendre(int l, int m, float x)
{
    float p0 = 0., p1 = 0., p2 = 0.;
    
    for (int k = l; k >= 0; k--) {
        float k1 = float(k + 1);
        float m1 = float(2 * m) + k1;
        float m2 = float(2 * (m + k) + 1);
            
        p2 = p1;
        p1 = p0;
            
        p0 = 0.;
        if (l == m + k) { p0 = 1.; }
            
        float u0 = sqrt((m2 * (m2 + 2.0)) / (k1 * m1));
            
        float u1 = sqrt((k1 * m1 * (m2 + 4.0)) / ((k1 + 1.0) * (m1 + 1.0) * m2));
            
        p0 += p1 * u0 * x;
        p0 -= u1 * p2;
    }

    for (int k = 1; k <= m; k++) {
        p0 *= sqrt( (1.0 - 0.5/float(k)) * (1.0 - x) * (1.0 + x));
    }
    
    p0 *= sqrt((0.5 * float(m) + 0.25)/PI);
    
    return p0;
}
`;




const altLegendre = `
//From https://www.shadertoy.com/view/tlX3WN
// Clenshaw's algorithm for the normalized associated Legendre polynomial (spherical harmonics)
#define MAX_POLYNOMIAL_ORDER 9
#define kd(n, k) ((n == k) ? 1.0 : 0.0)
float legendre(int n, int m, float x){
    int am = abs(m);
    float u = 0.0, v = 0.0, w = 0.0;
    
    for (int k = MAX_POLYNOMIAL_ORDER; k >= 0; k--)
    {
        float kp = float(k + 1);
        float mk1 = float(2 * am) + kp, mk2 = float(2 * (am + k) + 1);
        w = v; v = u;
        u = kd(n, am + k) + sqrt((mk2 * (mk2 + 2.0))/(kp * mk1)) * x * v - sqrt((kp * mk1 * (mk2 + 4.0))/((kp + 1.0) * (mk1 + 1.0) * mk2)) * w;
    }

    for (int k = 1; k <= am; k++)
    {
        u *= sqrt((1.0 - 0.5/float(k)) * (1.0 - x) * (1.0 + x));
    }
    
    return (((m > 0) && ((am & 1) == 1)) ? -1.0 : 1.0) * u * sqrt((0.5 * float(am) + 0.25)/PI);
}
`;

export default altLegendre;
