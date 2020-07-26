'use strict';
var shader = `
vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x*(a*x + b)) / (x*(c*x + d) + e), 0.0, 1.0);
}
vec3 LessThan(vec3 f, float value)
{
    return vec3(
        (f.x < value) ? 1.0 : 0.0,
        (f.y < value) ? 1.0 : 0.0,
        (f.z < value) ? 1.0 : 0.0);
}
 
vec3 LinearToSRGB(vec3 rgb)
{
    rgb = clamp(rgb, 0.0, 1.0);
     
    return mix(
        pow(rgb, vec3(1.0 / 2.4)) * 1.055 - 0.055,
        rgb * 12.92,
        LessThan(rgb, 0.0031308)
    );
}

struct sphere{
	vec4 o;//origine
	float r;//radius
};
struct plane{
	vec4 n;//normal
	float d;//distance d'origine
};
struct ray{
	vec4 o;//origine
	vec4 d;//direction
};
struct mat{//material
	vec3 c;//color
	vec3 r;//reflexion coefficient
};
vec4 getP(ray r, float t){
	return r.o + r.d * t;
}

ray RAY;
vec4 POS;
vec3 COLOR;
vec4 NORMAL;
float DISTANCE;
int OBJID;
float remain;//反射后的最强值（模拟反射衰减）

bool depthTest(float d){
	bool b = (DISTANCE == -1.0) || (d < DISTANCE);
	if(b){
		DISTANCE = d;
	}
	return b;
	//return 对于距离d，是否要更新distance，若要则更新。
}
void test(sphere s, ray r, vec3 color, int ID){
	vec4 v = r.o - s.o;
	float dotv = dot(r.d, v);
	float delta;
	float d;
	
	if(dotv <= 0.0 ){ 
		delta = dotv*dotv + s.r*s.r - (v.x*v.x + v.y*v.y + v.z*v.z + v.w*v.w);
		if(delta >= 0.0){
			//透明物体要继续穿透
			if(OBJID == 4){
				d = -dotv+sqrt(delta);//内
				ID = 5;
			}else{
				d = -dotv-sqrt(delta);//外
			}
			if(OBJID == 5 && ID == 2 && d<=0.0){
				OBJID == 0;
			}else if(depthTest(d)){
				POS = getP(r, DISTANCE);
				NORMAL = normalize(POS - s.o);
				COLOR = color;
				OBJID = ID;
			}
		}
	}
}
void test(plane p, ray r, int ID){
	float a = dot(r.d, p.n);
	float d;
	if(a < 0.0){
		d = -dot(p.n,r.o - p.n*p.d)/a;
		if(d > 0.0 && depthTest(d)){
			POS = getP(r, DISTANCE);
			NORMAL = p.n;
			OBJID = ID;
			float c = abs(floor(POS.x*2.0)+floor(POS.y*2.0)+floor(POS.z*2.0)+floor(POS.w*2.0))/2.0;
			if(ID == 8){
				if(fract(c) < 0.5){
					COLOR = vec3(0.2).xxx;
				}else{
					COLOR = vec3(1.0,1.0,1.0);
				}
			}else{
				COLOR = (ID == 7)?vec3(1.0,0.3,0.3):(ID == 6)?vec3(0.3,1.0,0.3):(ID == 11)?vec3(1.0,1.0,1.0):(ID == 9)?vec3(0.3,1.0,1.0):(ID == 10)?vec3(1.0,0.3,1.0):vec3(1.0,1.0,0.2);
			}
		}
	}
}
/*void cameraRay (vec4 pos,vec4 f,vec4 u, vec4 r, vec4 sf, vec2 pixel){
	RAY = ray(pos, normalize((PIXEL.x + fract(TIME*TIME*12.456789)/300.0)*r + (PIXEL.y + fract(TIME*TIME*3.25324)/300.0)*u + 3.5*f + sf));
}*/
float nextrnd(float f){
	//float k = 3.14159265358979323846264*f;
	//return (k - floor(k));
	//return fract(sin((f)*12.9898)*43758.5453);
	return fract(sin((f+fract(TIME*123.234432)*TIME)*12.9898)*4378.5453);
}

vec3 mainImage(void) {
	const int rayTracingDepth = 3;
	const int samples = 128;
	
	sphere s1 = sphere(vec4(-0.9,0.6,1.0,0.0), 0.9);
	sphere s2 = sphere(vec4(-0.6,-1.2,1.2,-0.2), 0.8);
	sphere s3 = sphere(vec4(1.2,-1.05,0.9,-0.3), 0.7);
	sphere s4 = sphere(vec4(0.0,2.0,0.0,0.0), 0.5);
	sphere s5 = sphere(vec4(0.4,-1.0,0.1,1.0), 1.0);
	sphere s6 = sphere(vec4(-0.2,-1.5,-0.3,-1.3), 0.5);
	plane p1 = plane(vec4(0.0,0.0,-1.0,0.0), -2.01);
	plane p2 = plane(vec4(0.0,1.0,0.0,0.0), -2.0);
	plane p3 = plane(vec4(1.0,0.0,0.0,0.0), -2.0);
	plane p4 = plane(vec4(-1.0,0.0,0.0,0.0), -2.0);
	plane p5 = plane(vec4(0.0,-1.0,0.0,0.0), -2.0);
	plane p6 = plane(vec4(0.0,0.0,0.0,-1.0), -2.0);
	plane p7 = plane(vec4(0.0,0.0,0.0,1.0), -2.0);
	//plane p6 = plane(vec4(0.0,0.0,1.0,0.0), -2.0);
	vec3 TOTAL_COLOR = vec3(0.0,0.0,0.0);
	vec3 OLDCOLOR;
	for(int j = 0; j < samples; j++){
		OLDCOLOR = vec3(1.0, 1.0, 1.0);
		COLOR = vec3(1.0, 1.0, 1.0);
		OBJID = 0;
		DISTANCE = -1.0;
		POS = vec4(0.0,0.0,0.0,0.0);
		//cameraRay(CAMERA_POS,CAMERA_F,CAMERA_U,CAMERA_R,CAMERA_SF,PIXEL);
		RAY = ray(vCam4+dx4, normalize(coord4));
		//sre ccot, global variable RAY modified
		for(int i = 0; i < rayTracingDepth; i++){
			
			if(OBJID == 0  || OBJID == 5 || OBJID == 4){
				if(OBJID!=5)test(s3, RAY, vec3(1.0,1.0,1.0), 2);
				test(s2, RAY, vec3(1.0,1.0,1.0), 3);
				test(s1, RAY, vec3(0.1,1.0,1.0), 3);
				test(s4, RAY, vec3(1.0,1.0,1.0), 19);
				test(s5, RAY, vec3(1.0,1.0,1.0), 15);
				test(s6, RAY, vec3(1.0,0.2,0.1), 3);
				test(p1, RAY, 8);
				test(p2, RAY, 15);
				test(p3, RAY, 6);
				test(p4, RAY, 7);
				test(p6, RAY, 9);
				test(p5, RAY, 11);
				test(p7, RAY, 10);
				//test(p6, RAY, 10);
			}
			if(OBJID <= 0){// 击中背景色
				OBJID = -1;
			}else if(OBJID == 19){// 击发光球
				TOTAL_COLOR += COLOR*OLDCOLOR;
				OBJID = -1;
			}else if(OBJID == 3){// 击反射球
				OLDCOLOR *= COLOR;
				OBJID = 0;
				vec4 kv = reflect(RAY.d,NORMAL);
				RAY = ray(POS, kv);
			}else if(OBJID == 2){// 击折射球
				
				OLDCOLOR *= COLOR;
				vec4 kv;
				float seed = nextrnd(nextrnd(nextrnd(coord.x+RAY.o.y)+coord.y+RAY.o.x)+coord.z+RAY.o.z+float(j));
				float fresnel = -dot(RAY.d,NORMAL);
				if(seed<pow(fresnel,2.0)*2.0){
					OBJID = 4;
					kv =  refract(RAY.d,NORMAL,1.0/1.10);
				}else{
					OBJID = 0;
					kv = reflect(RAY.d,NORMAL);
				}
				RAY = ray(POS, kv);
			}else if(OBJID == 5){// 击折射球
				OBJID = 5;
				vec4 kv;
				if(abs(dot(RAY.d,NORMAL))<sqrt(1.0-0.9*0.9)){
					kv = reflect(RAY.d,NORMAL);
					OBJID = 4;
				}else{
					kv = refract(RAY.d,-NORMAL,1.1);
				}		
				RAY = ray(POS, kv);
				OLDCOLOR *= vec3(exp(-DISTANCE*0.3),exp(-DISTANCE*0.9),exp(-DISTANCE*1.8));
				
			}else if(OBJID > 0){
				float seed = nextrnd(nextrnd(nextrnd(coord.x+RAY.o.y)+coord.y+RAY.o.x)+coord.z+RAY.o.z+float(j));
				float b = nextrnd(seed) * 6.2832;
				float a = seed * 6.2832;
				float c = asin(sqrt(nextrnd(b)));
				float sin_c = sin(c);
				float cos_c = cos(c);
				vec4 kv = vec4(
					sin_c*cos(a),
					sin_c*sin(a),
					cos_c*cos(b),
					cos_c*sin(b)
				);
				kv = normalize(NORMAL + kv);
				if(nextrnd(123.5*seed)>(float(OBJID)/11.0-0.8)){
					OLDCOLOR *= COLOR;
					RAY = ray(POS, kv);//漫反射
				}else{
					vec4 refl = reflect(RAY.d,NORMAL);
					if(OBJID == 15)
						RAY = ray(POS, normalize(mix(refl,kv,0.03)));
					else
						RAY = ray(POS, refl);
				}
				
				OBJID = 0;
			}
			
			
			DISTANCE = -1.0;
		}
	}
	return LinearToSRGB(ACESFilm(TOTAL_COLOR/float(samples)*80.0));
}
`;
var RTRenderer_FragmentShader = `
precision highp float;
varying vec4 coord;
varying vec4 coord4;
uniform float flow, TIME;
uniform mat4 mCamera3;
uniform vec3 Camera4Proj, bgColor4;
uniform vec4 vCam4,dx4;
uniform mat4 mCam4;
`+shader+`
float opacity(vec3 cc){
	return 0.8;
}

vec3 raytracing(vec4 coord4){
	
	//raycastMC(ro,direct);
	
	return vec3(1.0,0.0,0.0);
}
void main(void) {
	vec3 color1 = mainImage();	
	if((abs(coord.x)<0.08 || abs(coord.y)<0.08 || abs(coord.z)<0.08)&&(abs(coord.x)<0.5 && abs(coord.y)<0.5)){
		gl_FragColor=vec4(vec3(1.0,1.0,1.0)-color1.rgb,1.0);
	}else{
		gl_FragColor=vec4(
			color1.rgb,
			clamp(
				flow*(opacity(color1.rgb))
				,0.0
				,1.0
			)
		);
	}
	
}
`;
var RTRenderer4 = function(ctxt,scene4,camera4,light4){
	Renderer4.call(this,ctxt,scene4,camera4,light4);
	this.initGL(this.gl);
}
RTRenderer4.prototype = Object.create(Renderer4.prototype);
RTRenderer4.ShaderProgram = {
	fbo4D: {
		F: RTRenderer_FragmentShader,
		V: `
		attribute vec4 V;
		varying vec4 coord;
		varying vec4 coord4;
		uniform mat4 mCamera3;
		uniform vec3 Camera4Proj;
		uniform vec4 vCam4;
		uniform mat4 mCam4;
		
		void main(void) {
			vec4 v = vec4(V.xyz*Camera4Proj.x,V.w*Camera4Proj.y+Camera4Proj.z);
			vec4 pos = mCamera3*vec4(v.xyz,1.0);
			coord = vec4(pos.x,pos.yzw); 
			coord4 = mCam4*V;
			gl_Position = coord;
		}
		`,
		attribute:{
			"vec4 V":{}
		},
		uniform:{
			"mat4 mCamera3":{},
			"vec3 Camera4Proj":{},//vec3(ctg,mtt,mtw)
			"float flow":{},//opacity per layer
			"vec4 vCam4":{},"mat4 mCam4":{},//PMat5 Cam4
			"vec4 dx4":{},
			"float TIME":{},
			"vec3 bgColor4":{},
			"vec4 focusPos":{},
		}
	}
}

RTRenderer4.prototype.initGL = function(gl){
	Webgl(gl);
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, this.width, this.height);
	//var ext = gl.getExtension('OES_texture_float');
	gl.fboProgram = new Webgl.ShaderProgram(gl,RTRenderer4.ShaderProgram.fbo4D);
	gl.VfboBuffer = new Webgl.ArrayBuffer(gl);
	gl.FfboBuffer = new Webgl.ElementBuffer(gl);
	
}

RTRenderer4.prototype.beforeRender = function(){
	document.bgColor = "#"+this.bgColor3.toString(16);
	this.gl.fboProgram.use();
}
RTRenderer4.prototype._renderLayers = function(){
	var mt = 0.99/this.camera4.projectMat.ctg;
	var displayMode = this.wireFrameMode;
	
	for(var j = 0; j <= 1; j += this.thickness);
	
	function renderLayer(i){
		if(i>= -1){
			this._setFboProgramUniform();
			this.gl.fboProgram.uniform["float flow"].set(this.thickness * this.flow*(i+1));
			this.renderCrossSection(new Vec4(0,0,1,mt*i),false,false);
			i -= this.thickness*Math.round(Math.abs(i)+1);
			window.requestAnimationFrame(renderLayer.bind(this,i));
			//renderLayer.bind(this,i)();
		}else{
			window.requestAnimationFrame(loop);
		}
	}
	renderLayer.bind(this)(j);
}

RTRenderer4.prototype._setFboProgramUniform = function(){
	var gl = this.gl;
	var matProject = this._matProject;
	gl.fboProgram.uniform["mat4 mCam4"].set(this._matCamera.t(false).array);
	gl.fboProgram.uniform["float TIME"].set(Math.random());
	gl.fboProgram.uniform["vec4 vCam4"].set([this.camera4.position.x,this.camera4.position.y,this.camera4.position.z,this.camera4.position.t]);
	gl.fboProgram.uniform["vec3 Camera4Proj"].set([matProject.ctg,matProject.mtt,matProject.mtw]);
	gl.fboProgram.uniform["float flow"].set(this.thickness * this.flow);
	gl.fboProgram.uniform["vec4 dx4"].set([0,0,0,0]);
	var c = this.bgColor4;
	gl.fboProgram.uniform["vec3 bgColor4"].set([(c >> 16)/256,(c>> 8 & 0xFF)/256,(c & 0xFF)/256]);
}
RTRenderer4.prototype.renderCrossSection = function(frustum,mode3d,thumbnail){
	var _this = this;
	this._viewportSection = this.viewport4.crossSection(0,frustum).flat();

	var gl = this.gl;
	var viewport4 = this._viewportSection;
	var dx4 = this.getDx4(thumbnail);
	gl.fboProgram.attribute["vec4 V"].bind(gl.VfboBuffer);
	gl.VfboBuffer.set(viewport4.v,true);
	gl.FfboBuffer.set(viewport4.f,true);
	gl.disable(gl.DEPTH_TEST);
	if(!thumbnail){
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.viewportL();
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		this.viewportR();
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		gl.disable(gl.BLEND);
	}else{
		
		this.setThumbViewport(gl,thumbnail,this.LEFT);
		gl.fboProgram.uniform["vec4 dx4"].set(dx4.flat());
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		
		this.setThumbViewport(gl,thumbnail,this.RIGHT);
		gl.fboProgram.uniform["vec4 dx4"].set(dx4.sub().flat());
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		//gl.enable(gl.DEPTH_TEST);
	}
	
}