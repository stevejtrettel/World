

const laguerre = `
//FROM https://www.shadertoy.com/view/tlX3WN
// Clenshaw's algorithm for the Laguerre polynomial
#define MAX_POLYNOMIAL_ORDER 9
#define kd(n, k) ((n == k) ? 1.0 : 0.0)
float laguerre(int n, int aa, float x)
{
\tfloat a = float(aa);
    float u = 0.0, v = 0.0, w = 0.0;
    
    for (int k = MAX_POLYNOMIAL_ORDER; k > 0; k--)
    {
        float kk = float(k);
        w = v; v = u;
        u = kd(n, k) + (2.0 * kk + a + 1.0 - x)/(kk + 1.0) * v - (kk + a + 1.0) * w/(kk + 2.0);
    }
    
    return kd(n, 0) + (a - x + 1.0) * u - 0.5 * (a + 1.0) * v;
}`;

export default laguerre;