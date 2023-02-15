import{Vector3,SphereBufferGeometry,MeshPhysicalMaterial,Mesh}from"../../../3party/three/build/three.module.js";import ParametricCurve from"../../components/parametric/ParametricCurve.js";import Vector from"../../components/basic-shapes/Vector.js";let surfaceOptions={clearcoat:1,roughness:.4},defaultParams={sMin:-3.14,sMax:3.14,animate:!0,xEqn:"(2.+cos(4.*s))*sin(s)",yEqn:"sin(4.*s)",zEqn:"(2.+cos(4.*s))*cos(s)",a:0,b:0,c:0,homotopy:1,time:0};const parser=math.parser();class ParametricCurveAnimation{constructor(a=defaultParams){this.params=a,this.periodic=!0;let e=new SphereBufferGeometry(.2,32,16),t=new MeshPhysicalMaterial(surfaceOptions);this.start=new Mesh(e,t),this.end=new Mesh(e,t),this.range={min:this.params.sMin,max:this.params.sMax},this.uniforms={homotopy:{type:"float",value:this.params.homotopy},a:{type:"float",value:this.params.a},b:{type:"float",value:this.params.b},c:{type:"float",value:this.params.c}},this.curveColor="\n            vec3 colorFn(float s, vec3 xyz){\n             \n             float grid1 = (1.-pow(abs(sin(10.*3.14*s)),0.1))/10.;\n             float grid2 = (1.-pow(abs(sin(50.*3.14*s)),0.1))/25.;\n             float grid3 = (1.-pow(abs(sin(100.*3.14*s)),0.1))/50.;\n             float grid = grid1+grid2+grid3;\n             \n             vec3 base =  0.6 + 0.4*cos(2.*3.14*vec3(s,1.-s,s)+vec3(0,2,4));\n             \n             return base + 2.*vec3(grid);\n            }\n        ",this.buildJSEquation(),this.curve=new ParametricCurve(this.buildGLSLEquation(),this.range,this.uniforms,this.curveColor,surfaceOptions),this.vector=new Vector(this.eqn(0))}checkPeriodic(){let a=this.eqn(this.params.sMin,this.params),e=this.eqn(this.params.sMax,this.params);this.start.position.set(a.x,a.y,a.z),this.end.position.set(e.x,e.y,e.z),(new Vector3).subVectors(e,a).length()<.05?(this.periodic=!0,this.start.visible=!1,this.end.visible=!1):(this.periodic=!1,this.start.visible=!0,this.end.visible=!0)}buildGLSLEquation(){return`vec3 eqn( float s ){\n            float x = ${this.params.xEqn};\n            float y = ${this.params.yEqn};\n            float z = ${this.params.zEqn};\n            return vec3(x,y,z);\n       }`}buildJSEquation(){let a=parser.evaluate("xEqn(s,time,a,b,c)=".concat(this.params.xEqn)),e=parser.evaluate("yEqn(s,time,a,b,c)=".concat(this.params.yEqn)),t=parser.evaluate("zEqn(s,time,a,b,c)=".concat(this.params.zEqn));this.eqn=function(s,i={time:0,a:0,b:0,c:0}){let n=a(s,i.time,i.a,i.b,i.c),r=e(s,i.time,i.a,i.b,i.c),o=t(s,i.time,i.a,i.b,i.c);return new Vector3(n,r,o)},this.checkPeriodic()}addToScene(a){this.curve.addToScene(a),this.vector.addToScene(a),a.add(this.start),a.add(this.end)}addToUI(a){let e=this;a.add(e.params,"xEqn").name("x(s)=").onFinishChange((function(a){e.params.xEqn=a;let t=e.buildGLSLEquation();e.curve.setFunction(t),e.buildJSEquation()})),a.add(e.params,"zEqn").name("y(s)=").onFinishChange((function(a){e.params.zEqn=a;let t=e.buildGLSLEquation();e.curve.setFunction(t),e.buildJSEquation()})),a.add(e.params,"yEqn").name("z(s)=").onFinishChange((function(a){e.params.yEqn=a;let t=e.buildGLSLEquation();e.curve.setFunction(t),e.buildJSEquation()}));let t=a.addFolder("Domain");t.add(e.params,"sMin",-10,10,.01).onChange((function(a){e.range.min=a,e.curve.setDomain(e.range),e.checkPeriodic()})),t.add(e.params,"sMax",-10,10,.01).onChange((function(a){e.range.max=a,e.curve.setDomain(e.range),e.checkPeriodic()}));let s=a.addFolder("Parameters");s.add(e.params,"a",-1,1,.01).onChange((function(a){e.curve.update({a:a}),e.checkPeriodic()})),s.add(e.params,"b",-1,1,.01).onChange((function(a){e.curve.update({b:a}),e.checkPeriodic()})),s.add(e.params,"c",-1,1,.01).onChange((function(a){e.curve.update({c:a}),e.checkPeriodic()})),a.add(e.params,"animate").name("Animate")}tick(a,e){if(this.params.time=a,this.curve.update({time:a}),this.params.animate){let e;this.vector.setVisibility(!0),this.periodic?e=a/2:(e=(1-Math.cos(a/3))/2,e=this.params.sMin+(this.params.sMax-this.params.sMin)*e);let t=this.eqn(e,this.params);this.vector.setDir(t)}else this.vector.setVisibility(!1)}}export default ParametricCurveAnimation;