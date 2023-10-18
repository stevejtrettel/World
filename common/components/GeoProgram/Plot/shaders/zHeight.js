
const zHeight = `
vec3 colorFn(vec2 uv,vec3 xyz){
        float u = uv.x;
        float v = uv.y;
        float x = xyz.x;
        float y = xyz.y;
        float z = xyz.z;
        
        return vec3(0.2,0.3,y);
    }
`;

export default zHeight;