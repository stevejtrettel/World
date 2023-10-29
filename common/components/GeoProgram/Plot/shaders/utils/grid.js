
const grid = `
  float scalarGrid(float x, float scale){
   float spacing = 3.1416*scale;
    float grid1 = (1.-pow(abs(sin(spacing*x)),0.1))/10.;
    float grid2 = (1.-pow(abs(sin(5.*spacing*x)),0.1))/25.;
    float grid3 = (1.-pow(abs(sin(10.*spacing *x)),0.1))/50.;
    return grid1+grid2+grid3;
  }
  
  float coordGrid(vec2 uv, float scale){
    float spacing = 3.1416*scale;
    float grid1 = (1.-pow(abs(sin(spacing*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
    float grid2 = (1.-pow(abs(sin(5.*spacing*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
    float grid3 = (1.-pow(abs(sin(10.*spacing *uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
    return grid1+grid2+grid3;
}`;

export default grid;