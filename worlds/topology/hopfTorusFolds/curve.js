let sphereCurve = `
vec2 sphereCurve(float t){
    float phi=1.+amplitude*(1.+0.3*sin(time))*sin(folds*t+0.3*cos(time)+0.3*time);
    return vec2(phi,t);
}
`;


//uniforms used in the description of the curve:
let uniforms =  {
        folds: {
            type: 'float',
            value: 0,
            range: [0, 8, 1],
        },
        amplitude: {
            type: 'float',
            value: 0.5,
            range: [0, 1, 0.01],
        },
    };


export { sphereCurve, uniforms};