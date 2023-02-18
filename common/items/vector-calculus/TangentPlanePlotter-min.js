import{MeshPhysicalMaterial,DoubleSide,Vector3,SphereBufferGeometry,Mesh}from"../../../3party/three/build/three.module.js";import DomainPlot from"../../components/vector-calculus/DomainPlot.js";import ParametricSurface from"../../components/parametric/ParametricSurface.js";import ParametricCurveCPU from"../../components/parametric/ParametricCurveCPU.js";import ParametricSurfaceCPU from"../../components/parametric/ParametricSurfaceCPU.js";import{Rod}from"../../components/calculus/Rod.js";let surfaceOptions={clearcoat:1,roughness:.1},glassOptions={clearcoat:1,transparent:!0,transmission:.95,ior:1.2,roughness:0,side:DoubleSide};const parser=math.parser();class PartialDerivativePlotter{constructor(){this.params={uMin:-3.14,uMax:3.14,vMin:-3.14,vMax:3.14,showPos:!0,uPos:.5,vPos:.5,animate:!0,xEqn:"u",yEqn:"sin(2.*u)*sin(2.*v)",zEqn:"v",a:0,b:0,c:0},this.xEqn=this.params.xEqn,this.yEqn=this.params.yEqn,this.zEqn=this.params.zEqn,this.range={u:{min:this.params.uMin,max:this.params.uMax},v:{min:this.params.vMin,max:this.params.vMax}},this.rescaleU=function(a){return this.range.u.min+(this.range.u.max-this.range.u.min)*a},this.rescaleV=function(a){return this.range.v.min+(this.range.v.max-this.range.v.min)*a},this.uniforms={showPos:{type:"bool",value:this.params.showPos},uPos:{type:"float",value:this.params.uPos},vPos:{type:"float",value:this.params.vPos},a:{type:"float",value:this.params.a},b:{type:"float",value:this.params.b},c:{type:"float",value:this.params.c}},this.domainColor="\n           vec3 colorFn(vec2 uv){\n                     float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;\n             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;\n             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;\n             float grid = grid1+grid2+grid3;\n             \n             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));\n             vec3 final = base + 2.*vec3(grid);\n             \n             \n             if(showPos){\n         \n                if(abs(uv.y-vPos)<0.01){\n                    final=vec3(0.1,0.05,0.7);\n                }\n                if(length(uv-vec2(uPos,vPos))<0.02){\n                    final=vec3(0);\n                }\n             }\n             \n             return final;\n           }\n        ",this.surfaceColor="\n           vec3 colorFn(vec2 uv, vec3 xyz){\n                     float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;\n             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;\n             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;\n             float grid = grid1+grid2+grid3;\n             \n             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));\n             vec3 final = base + 2.*vec3(grid);\n             \n             return final;\n           }\n        ",this.surface=new ParametricSurface(this.buildGLSLEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions),this.domainPlot=new DomainPlot(this.params.eqn,this.range,this.uniforms,this.domainColor),this.domainPlot.setPosition(0,-4,0),this.buildJSEquation(),this.tangentPlane=new ParametricSurfaceCPU(this.tangentEqn,this.tangentRange,glassOptions),this.uCurve=new ParametricCurveCPU(this.uEqn,this.range.u,{color:196981});let a=this.uEqn(this.params.uPos,this.params),e=this.uDerivative(this.params.uPos,this.params),n=(new Vector3).addVectors(a,e.clone().multiplyScalar(-3)),t=(new Vector3).addVectors(a,e.clone().multiplyScalar(3));this.uTangent=new Rod({end1:n,end2:t,radius:.05}),a=this.uEqn(this.params.vPos,this.params),e=this.uDerivative(this.params.vPos,this.params),n=(new Vector3).addVectors(a,e.clone().multiplyScalar(-3)),t=(new Vector3).addVectors(a,e.clone().multiplyScalar(3)),this.vTangent=new Rod({end1:n,end2:t,radius:.05});let s=new MeshPhysicalMaterial({clearcoat:1,color:0}),i=new SphereBufferGeometry(.12,32,16);this.point=new Mesh(i,s),this.point.position.set(a.x,a.y,a.z)}buildGLSLEquation(){return`vec3 eqn( vec2 uv ){\n        \n            float u = uv.x;\n            float v = uv.y;\n            \n            float x = ${this.params.xEqn};\n            float y = ${this.params.yEqn};\n            float z = ${this.params.zEqn};\n           \n            vec3 end = vec3(x,y,z);\n           \n            return end;\n            \n       }`}buildJSEquation(){let a=this,e=parser.evaluate("xEqn(u,v,time,a,b,c)=".concat(this.xEqn)),n=parser.evaluate("yEqn(u,v,time,a,b,c)=".concat(this.yEqn)),t=parser.evaluate("zEqn(u,v,time,a,b,c)=".concat(this.zEqn));this.eqn=function(a,s,i={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){let r=e(a,s,i.time,i.a,i.b,i.c),o=n(a,s,i.time,i.a,i.b,i.c),u=t(a,s,i.time,i.a,i.b,i.c);return new Vector3(r,o,u)},this.uEqn=function(e,n={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){return a.eqn(e,-a.rescaleV(n.vPos),n)},this.uDerivative=function(e,n={time:0,a:0,b:0,c:0}){let t=.001,s=a.uEqn(e-t,n),i=a.uEqn(e+t,n);return(new Vector3).subVectors(i,s).divideScalar(.002)},this.vEqn=function(e,n={time:0,a:0,b:0,c:0,uPos:0,vPos:0}){return a.eqn(e,-a.rescaleV(n.vPos),n)},this.vDerivative=function(e,n={time:0,a:0,b:0,c:0}){let t=.001,s=a.uEqn(e-t,n),i=a.uEqn(e+t,n);return(new Vector3).subVectors(i,s).divideScalar(.002)},this.tangentEqn=function(e,n,t={time:0,a:0,b:0,c:0}){let s=a.eqn(t.uPos,t.vPos,n,t),i=a.uDerivative(a.rescaleU(t.uPos),t),r=a.vDerivative(a.rescaleV(t.vPos),t);return s.add(i.multiplyScalar(e)).add(r.multiplyScalar(n))}}addToScene(a){this.surface.addToScene(a),this.domainPlot.addToScene(a),this.uCurve.addToScene(a),this.uTangent.addToScene(a),this.vTangent.addToScene(a),this.tangentPlane.addToScene(a),a.add(this.point)}addToUI(a){let e=this;a.add(e.params,"xEqn").name("x(u,v)=").onFinishChange((function(a){e.params.xEqn=a,e.xEqn=a;let n=e.buildGLSLEquation();e.surface.setFunction(n),e.buildJSEquation(),e.uCurve.setCurve(e.uEqn)})),a.add(e.params,"zEqn").name("y(u,v)=").onFinishChange((function(a){e.params.zEqn=a,e.zEqn=a;let n=e.buildGLSLEquation();e.surface.setFunction(n),e.buildJSEquation(),e.uCurve.setCurve(e.uEqn)})),a.add(e.params,"yEqn").name("z(u,v)=").onFinishChange((function(a){e.params.yEqn=a,e.yEqn=a;let n=e.buildGLSLEquation();e.surface.setFunction(n),e.buildJSEquation(),e.uCurve.setCurve(e.uEqn),s}));let n=a.addFolder("Domain");n.add(e.params,"uMin",-10,10,.01).onChange((function(a){e.range.u.min=a,e.surface.setDomain(e.range),e.domainPlot.setDomain(e.range)})),n.add(e.params,"uMax",-10,10,.01).onChange((function(a){e.range.u.max=a,e.surface.setDomain(e.range),e.domainPlot.setDomain(e.range)})),n.add(e.params,"vMin",-10,10,.01).onChange((function(a){e.range.v.min=a,e.surface.setDomain(e.range),e.domainPlot.setDomain(e.range)})),n.add(e.params,"vMax",-10,10,.01).onChange((function(a){e.range.v.max=a,e.surface.setDomain(e.range),e.domainPlot.setDomain(e.range)}));let t=a.addFolder("Parameters");t.add(e.params,"a",-1,1,.01).onChange((function(a){e.surface.update({a:a})})),t.add(e.params,"b",-1,1,.01).onChange((function(a){e.surface.update({b:a})})),t.add(e.params,"c",-1,1,.01).onChange((function(a){e.surface.update({c:a})})),a.add(e.params,"uPos",0,1,.01).name("u0").onChange((function(a){e.params.uPos=a,e.surface.update({uPos:a}),e.domainPlot.update({uPos:a}),e.buildJSEquation();let n=e.rescaleU(e.params.uPos),t=e.uEqn(n,e.params),s=e.uDerivative(n,e.params).normalize(),i=(new Vector3).addVectors(t,s.clone().multiplyScalar(-3)),r=(new Vector3).addVectors(t,s.clone().multiplyScalar(3));e.uTangent.resize(i,r),e.point.position.set(t.x,t.y,t.z)})),a.add(e.params,"vPos",0,1,.01).name("v0").onChange((function(a){e.params.vPos=a,e.surface.update({vPos:a}),e.domainPlot.update({vPos:a});let n={u:e.range.u,v:{min:e.range.v.min,max:-e.rescaleV(e.params.vPos)}};e.surface.setDomain(n),e.buildJSEquation(),e.uCurve.setCurve(e.uEqn),e.uCurve.update(e.params);let t=e.rescaleU(e.params.uPos),s=e.uEqn(t,e.params),i=e.uDerivative(t,e.params).normalize(),r=(new Vector3).addVectors(s,i.clone().multiplyScalar(-3)),o=(new Vector3).addVectors(s,i.clone().multiplyScalar(3));e.uTangent.resize(r,o),e.point.position.set(s.x,s.y,s.z)})),a.add(e.params,"animate")}tick(a,e){if(this.params.animate){this.buildJSEquation(),this.params.uPos=.25*Math.sin(a)+.5,this.params.vPos=.25*Math.sin(a/3)+.5,this.surface.update({uPos:this.params.uPos,vPos:this.params.vPos});let e={u:this.range.u,v:{min:this.range.v.min,max:-this.rescaleV(this.params.vPos)}};this.surface.setDomain(e),this.domainPlot.update({uPos:this.params.uPos,vPos:this.params.vPos}),this.uCurve.setCurve(this.uEqn),this.uCurve.update(this.params);let n=this.rescaleU(this.params.uPos),t=this.uEqn(n,this.params),s=this.uDerivative(n,this.params).normalize(),i=(new Vector3).addVectors(t,s.clone().multiplyScalar(-3)),r=(new Vector3).addVectors(t,s.clone().multiplyScalar(3));this.uTangent.resize(i,r),this.point.position.set(t.x,t.y,t.z)}}}let ex=new PartialDerivativePlotter;export default{ex:ex};