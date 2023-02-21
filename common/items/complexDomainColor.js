import {LinearFilter, NearestFilter} from "../../3party/three/build/three.module.js";

import { ComputeSystem } from "../gpu/ComputeSystem.js";
import { globals } from "../World/globals.js";
import {CSQuad} from "../gpu/displays/CSQuad.js";

import {colorConversion} from "../shaders/colors/colorConversion.js";
import {complex} from "../shaders/math/complex.js";



let uniforms = {
    a: {
        type:'float',
        value: 1,
        range:[-2,2,0.01]
    },
    b: {
        type:'float',
        value: 0,
        range:[-2,2,0.01]
    },
    c: {
        type:'float',
        value: 0,
        range:[-2,2,0.01]
    },
    d: {
        type:'float',
        value: 1,
        range:[-2,2,0.01]
    },
};

let options = {
    res: [1024,1024],
    filter: LinearFilter,
};


const toDomain = `
vec2 toDomain( vec2 uv ){
    return 10.*(uv-vec2(0.5));
}
`;

const applyFn=`
vec2 applyFn( vec2 z ){

    //do the computation
    vec2 w = cdiv(cmult(z,z+vec2(1,0)),z-vec2(3,0));
   
    return  w;
}

`;

const getColor = `

float gridLines( vec2 z ){
    
    float xLines = sin(2.*PI*z.x);
    float yLines = sin(2.*PI*z.y);
    float grid = abs(xLines * yLines);
   
    return pow(grid,0.05);
}

vec3 gridHue( vec2 z ){

    float grid = gridLines(z);
    
    //get coloration
    float theta = atan(z.y, z.x);
    float hue = theta/(2.*PI);
    
   float S1 = 0.6;
   float S2 = 0.;
   float sat = S1*grid + S2;
      
   float L1 = -0.66;
   float L2 = 0.88;
   float light = L1*grid + L2;

   return hsb2rgb(vec3( hue, sat, light));
}


vec3 getColor( vec2 z ){
    
    return gridHue(z);
}
`;

const mainFn = `void main()
//takes in gl_FragCoord, outputs gl_FragColor
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy/res;
    
    //get point in the domain:
    vec2 z = toDomain(uv);
    
    //get output of function
    vec2 w = applyFn(z);
    
    //calculate color of that point:
    vec3 color = getColor(w);
    
    // Output to data texture
    gl_FragColor = vec4(color,1.);
}
`;



const rickyDomainColor = `
// Available functions: cadd, csub, cmul, cdiv, cinv, csqr, cconj,
// csqrt, cexp, cpow, clog, csin, ccos, ctan, ccot, ccsc, csec, casin,
// cacos, catan, csinh, ccosh, ctanh, ccoth, ccsch, csech, casinh,
// cacosh, catanh
vec2 f (vec2 z, float t, vec2 mouse) {
    vec2 a = vec2(sin(t), 0.5 * sin(2.0 * t));
    vec2 b = vec2(cos(t), 0.5 * sin(2.0 * (t - HALF_PI)));
    vec2 m = mouse;
    
    // Try a different equation:
    // return csin((cmut(z - a, z - b, z - m)));
    
    return cdiv(cmult(z - a, m - b), cmult(z - b, m - a));
}

const bool animate = false;
const bool grid = false; // (when not animating)

// 1: counters split in six
// 0: contours split in two
#if 1
const vec2 steps = vec2(6, 6);
const int magOctaves = 5;
const int phaseOctaves = 5;
#else
const vec2 steps = vec2(2, 2);
const int magOctaves = 9;
const int phaseOctaves = 9;
#endif


// Other constants
// Defines the scale of the smallest octave (in some arbitrary units)
const vec2 scale = vec2(0.1);

// Grid lines:
const float lineWidth = 1.0;
const float lineFeather = 1.0;
const vec3 gridColor = vec3(0);

// Power of contrast ramp function
const float contrastPower = 2.5;

// Select an animation state
float selector (float time) {
    const float period = 10.0;
    float t = fract(time / period);
    return smoothstep(0.4, 0.5, t) * smoothstep(1.0, 0.9, t);
}

vec3 colorscale (float phase) {
    return rainbowGradient(phase / 2.0 - 0.25);
}

float complexContouringGridFunction (float x) {
  return 8.0 * abs(fract(x - 0.5) - 0.5);
}

float domainColoringContrastFunction (float x, float power) {
  x = 2.0 * x - 1.0;
  return 0.5 + 0.5 * pow(abs(x), power) * sign(x);
}
vec4 domainColoring (vec4 f_df,
                     vec2 steps,
                     vec2 scale,
                     vec2 gridOpacity,
                     vec2 shadingOpacity,
                     float lineWidth,
                     float lineFeather,
                     vec3 gridColor,
                     float phaseColoring,
                     float contrastPower
                     //sampler2D colormap
) {
    float invlog2base, logspacing, logtier, n, invSteps;

    vec2 res = scale * vec2(1.0, 1.0 / 6.28) * 20.0 * steps;

    // Complex argument, scaled to the range [0, 4]
    float carg = atan(f_df.y, f_df.x) * HALF_PI_INV * 2.0;

    // Reciprocal of the complex magnitude
    float cmagRecip = 1.0 / hypot(f_df.xy);

    // Normalize z before using it to compute the magnitudes. Without this we lose half
    // of the floating point range due to overflow.
    vec2 znorm = f_df.xy * cmagRecip;

    // Computed as d|f| / dz, evaluated in the +real direction (though any direction works)
    float cmagGradientMag = hypot(vec2(dot(znorm, f_df.zw), dot(vec2(znorm.y, -znorm.x), f_df.zw)));

    float cargGradientMag = cmagGradientMag * cmagRecip;

    // Shade at logarithmically spaced magnitudes
    float mappedCmag = -log2(cmagRecip);
    float mappedCmagGradientMag = cmagGradientMag * cmagRecip;

    // Magnitude steps
    // This is just a number we use a few times
    invlog2base = 1.0 / log2(steps.x);
    
    // Compute the spacing based on the screen space derivative, and clamp it to a sane
    // range so it looks a little nicer when it overflows
    logspacing = log2(mappedCmagGradientMag * res.x) * invlog2base;
    logspacing = clamp(logspacing, -50.0, 50.0);
    
    // The above is a continuous representation of the spacing, but we clamp so that
    // we have an integer interval
    logtier = floor(logspacing);
    
    // I'm having trouble working back through this line, though I think it's supposed
    // to use the spacing (which is like a difference) back into a log-value, using the
    // function value. Sorry this line isn't more clear. I'm suspicious it's actually not
    // exactly the line I want it to be.
    n = log2(abs(mappedCmag)) * invlog2base - logtier;

    // Line widths
    float width1 = max(0.0, lineWidth - lineFeather);
    float width2 = lineWidth + lineFeather;
    
    // Position within a given octave in the [0, 1] sense
    float position = 1.0 - logspacing + logtier;

    float w, scaleFactor, value, gridValue;
    float totalWeight = 0.0;
    float magnitudeGrid = 0.0;
    float magnitudeShading = 0.0;
    float octave = pow(steps.x, n) * sign(mappedCmag);
    scaleFactor = pow(steps.x, logtier) / cargGradientMag * 0.25;
    invSteps = 1.0 / steps.x;
    
    // Loop through octaves for magnitude
    for(int i = 0; i < magOctaves; i++) {
        // Select the weight of either side of this octave to fade the 
        // smallest and largest octaves in/out. Also increase the weight
        // a bit on each successive octave so that larger scales dominate
        // and it's not excessively noisy.
        float w0 = i == 0 ? 1e-4 : 1.0 + float(i);
        float w1 = i == magOctaves - 1 ? 1e-4 : 1.0 + float(i + 1);
        w = mix(w0, w1, position);
        
        totalWeight += w;
        
        // Compute a grid value so we can draw lines
        gridValue = complexContouringGridFunction(octave) * scaleFactor;
        
        // Accumulate the above into grid lines
        magnitudeGrid += w * smoothstep(width1, width2, gridValue);
        
        // Compute a looping ramp for magnitude
        value = fract(-octave);
        
        // Add magnitude's contribution to shading. The contrast function applies
        // some contrast, and the final min() function uses the grid function to blur
        // the sharp edge where the ramp repeats, effectively antialiasing it.
        magnitudeShading += w * (0.5 + (domainColoringContrastFunction(value, contrastPower) - 0.5) * min(1.0, gridValue * 1.5));
        
        // Increment the octave
        scaleFactor *= steps.x;
        octave *= invSteps;
    }
    
    // We add weighted ramp functions in [0, 1]. We divide by the total weight to blend
    // them, which also ensures the result is in [0, 1] as well.
    magnitudeGrid /= totalWeight;
    magnitudeShading /= totalWeight;

    // Perform identically the same computation, except for phase.
    invlog2base = 1.0 / log2(steps.y);
    logspacing = log2(cargGradientMag * 2.0 * res.y) * invlog2base;
    logspacing = clamp(logspacing, -50.0, 50.0);
    logtier = floor(logspacing);
    n = log2(abs(carg) + 1.0) * invlog2base - logtier;
    position = 1.0 - logspacing + logtier;


    totalWeight = 0.0;
    float phaseShading = 0.0;
    float phaseGrid = 0.0;
    octave = pow(steps.y, n) * sign(carg);
    scaleFactor = pow(steps.y, logtier) / (cargGradientMag * 2.0) * 2.0;
    invSteps = 1.0 / steps.y;

    // See above for a description of all the terms in this computation.
    for (int i = 0; i < phaseOctaves; i++) {
        float w0 = i == 0 ? 1e-4 : 1.0 + float(i);
        float w1 = i == phaseOctaves - 1 ? 1e-4 : 1.0 + float(i + 1);
        
        w = mix(w0, w1, position);
        totalWeight += w;
        gridValue = complexContouringGridFunction(octave) * scaleFactor;
        phaseGrid += w * smoothstep(width1, width2, gridValue);
        value = fract(octave);
        phaseShading += w * (0.5 + (domainColoringContrastFunction(value, contrastPower) - 0.5) * min(1.0, gridValue * 1.5));
        scaleFactor *= steps.y;
        octave *= invSteps;
    }

    phaseGrid /= totalWeight;
    phaseShading /= totalWeight;

    // Combine the grids into a single grid value
    float grid = 1.0;
    grid = min(grid, 1.0 - (1.0 - magnitudeGrid) * gridOpacity.x);
    grid = min(grid, 1.0 - (1.0 - phaseGrid) * gridOpacity.y);
    
    // Add up the shading so that \`shading\` is 1.0 when there is none, and darkens as you add shading.
    float shading = 0.5 + (shadingOpacity.y * (0.5 - phaseShading)) + shadingOpacity.x * (magnitudeShading - 0.5);

    // Compute a color based on the argument, then multiply it by shading
    vec3 color = colorscale(carg) * (0.5 + 0.5 * shading);
    
    // Combine the result into a bit of an ad hoc function, again tailored so that things reduce
    // to a nice result when you remove shading or coloring.
    vec3 result = mix(vec3(shading + (1.0 - phaseColoring) * 0.5 * (1.0 - shadingOpacity.x - shadingOpacity.y)), color, phaseColoring);

    // Combine the color and grid
    result = mix(gridColor, result, grid);

    // --
    return vec4(result, 1.0);
}

void main () {
    vec2 xy = (gl_FragCoord.xy/res-vec2(0.5))*10.;
    vec2 mouse = vec2(0);

    vec2 fz = f(xy, time * 0.2, mouse);
    
    vec4 fdf = vec4(fz, vec2(hypot(dFdx(fz)), hypot(dFdy(fz))));

   float select = animate ? selector(time) : (grid ? 1.0 : 0.0);
    
    gl_FragColor = domainColoring(
        fdf,
        steps,
        scale,
        mix(vec2(0.2), vec2(0.9), select),   // grid
        mix(vec2(0.35), vec2(0.15), select), // shading
        lineWidth,
        lineFeather,
        gridColor,
        mix(0.9, 0.0, select), // phase coloring
        contrastPower
    );
}
`;

const computeZ = complex + colorConversion + rickyDomainColor;
    //complex + colorConversion + toDomain + applyFn + getColor + mainFn;

let compSys = new ComputeSystem(['z'], {z: computeZ }, uniforms, options, globals.renderer);

let complexDisplay = new CSQuad(compSys);

export default { cs: compSys, ds: complexDisplay};