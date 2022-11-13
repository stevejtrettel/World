

class ContourPlot2D{
    constructor(fnText, uniforms, domain){
        this.res = [256,256];
        this.domain = domain;
        this.uniforms = uniforms;
        this.f = fnText;
    }
}