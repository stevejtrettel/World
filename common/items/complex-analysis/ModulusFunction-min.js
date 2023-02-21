import ParametricSurface from"../../components/parametric/ParametricSurface.js";import{DoubleSide}from"../../../3party/three/build/three.module.js";class ModulusFunction{constructor(){this.params={eqnType:1},this.surfaceColor="\n            vec3 colorFn(vec2 uv, vec3 xyz){\n             \n             //draw gridlines on the domain\n             float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;\n             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;\n             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;\n             float grid = grid1+grid2+grid3;\n             \n             //draw height lines for the magnitude\n             float height = (1.-pow(abs(sin(10.*3.14*xyz.y)),0.1))/10.;\n             vec3 col = hsb2rgb(vec3(xyz.y/3.,0.5+height,0.5))-3.*vec3(height);\n             return col+vec3(grid);\n\n            }\n        ",this.eqn="\n        vec3 eqn(vec2 uv){\n            float u = uv.x;\n            float v = uv.y;\n            float x1 = 1.+u;\n            float x2 = 1.-u;\n            float mag1 = x1*x1+v*v;\n            float mag2 = x2*x2+v*v;\n            float mag = 1./(mag1*mag2);\n            return vec3(u,mag,v);\n        }",this.domain={u:{min:-4,max:4},v:{min:-4,max:4}},this.uniforms={};let e={clearcoat:1,side:DoubleSide,roughness:.5};this.surface=new ParametricSurface(this.eqn,this.domain,this.uniforms,this.surfaceColor,e)}addToScene(e){this.surface.addToScene(e)}addToUI(e){e.add(this.params,"eqnType",{"1/(1-z^2)":1,B:2,C:3})}tick(e,n){}}let ex=new ModulusFunction;export default{ex:ex};