var MCRTRenderer_FragmentShader = `
precision highp float;
varying vec4 coord;
varying vec4 coord4;
uniform float flow,ambientLight;
uniform mat4 mCamera3;
uniform vec3 Camera4Proj, chunkCenter, bgColor4,sunColor;
uniform vec4 vCam4,dx4,light_Dir, focusPos;
uniform float light_Density;
uniform mat4 mCam4;
uniform int displayMode;
const int renderDistance = 9;
const float renderDistancef = float(renderDistance)+0.5;
uniform sampler2D chunk, bloc;
float opacity(vec3 cc){
	return 0.8;
}
const int chunkSize = 32*4*4;
int MC_ID = -1;
int MC_DIR = -1;
float MC_SHADOW = 0.0;
vec4 MC_UV;
const int rdRange = renderDistance*2+1;
const int rdRange2 = rdRange*rdRange;
const float resolution = 1./2048.0;
float wireFrame, DISTANCE;
vec4 light_Dir_100,light_Dir_001;
vec4 Prel;
float getID(vec4 pos){
	
	vec4 p = pos - Prel;
	float chx = mod(pos.x,4.0);
	//float chz = mod(pos.z,4.0);
	//float cht = mod(pos.w,4.0);
	float chunkOffset = p.y + 32.0*mod(pos.z,4.0) + 128.0*mod(pos.w,4.0);
	
	float pchx = floor(p.x/4.0);
	float pchz = floor(p.z/4.0);
	float pchw = floor(p.w/4.0);
	
	chunkOffset += float(chunkSize*(int(pchx)+renderDistance + rdRange*(int(pchz)+renderDistance) + rdRange2*(int(pchw)+renderDistance)));
	
	vec2 offset = vec2(mod(chunkOffset, 2048.0),floor(chunkOffset*resolution))*resolution;
	
	return step(abs(pchx),renderDistancef)*
		step(abs(pchz),renderDistancef)*
		step(abs(pchw),renderDistancef)*
		step(pos.y , 31.5)*step(-0.5 , pos.y)*dot(
			vec4(
				step(chx,0.1),
				step(0.9,chx)*step(chx,1.1) ,
				step(1.9,chx)*step(chx,2.1) ,
				step(2.9,chx)
			),texture2D(chunk, offset)
	);
}

void raycastMC(vec4 s, vec4 e){
	// 终点方块坐标
	const vec4 semi = vec4(0.5000,0.5000,0.5000,0.5000);
	vec4 start = s + semi + 0.001;
	vec4 end = e + semi + 0.002;
	
	vec4 int2 = (floor(end));
	vec4 int1 = (floor(start));
	
	lowp float found = 0.0;
	lowp float ID;
	// 检测起点方块
	//if(id > 0) return null; //摄像机埋在了方块内，也忽略，但不继续算后面方块
	for (int count = 0; count < 60; count++){
		// 起点(当前)方块和终点方块XYZ不同(向某方向选了候选方块)
		lowp vec4 changed = step(int1,int2-0.2) + step(int2,int1-0.2);
		// 各方向候选方块坐标
		vec4 new = int1 + step(int1,int2+0.1);
		vec4 d = end - start;
		// 向X方向选了候选方块
		vec4 ns = new - start;
		vec4 Pt = vec4(1000.);
		float minCoord;
		lowp float direction;
		lowp vec4 who;
		if(found<1.5){
			if(changed.x>0.1){
				Pt.x = ns.x/d.x;
			}
			if(changed.y>0.1){
				Pt.y = ns.y/d.y;
			}
			if(changed.z>0.1){
				Pt.z = ns.z/d.z;
			}
			if(changed.w>0.1){
				Pt.w = ns.w/d.w;
			}
			// 最终选了哪个方向的候选方块
			
			minCoord = min(min(Pt.x,Pt.y),min(Pt.z,Pt.w));
			start += d*minCoord;
			minCoord+=0.00000001;
			// 选出候选方块中离起点(当前)最近的，更新起点、要检测的方块坐标
			start = mix(new,start,step(minCoord,Pt));
			who = vec4(1.0,1.0,1.0,1.0)-step(minCoord,Pt);
			direction = dot(
				(vec4(5.0,1.0,3.0,7.0)-step(int1,int2+0.1)),
				who
			); 
			int1 = (floor(start));
			if(direction>4.9&&direction<5.1) int1.x -= 1.0;
			if(direction>0.9&&direction<1.1) int1.y -= 1.0;
			if(direction>2.9&&direction<3.1) int1.z -= 1.0;
			if(direction>6.9&&direction<7.1) int1.w -= 1.0;
			// 检测新起点方块
			ID = getID(int1);
			found = found + step(0.001,ID);
		}
		if(found>0.5&&found<1.5&&ID>0.001){
			MC_ID = int(ID*256.0 +0.5);
			MC_DIR = int(direction+0.5);
			MC_UV = start;
			end = start - light_Dir_100 + 0.002;
			int2 = (floor(end));
			start = start - light_Dir_001 + 0.001;
		}else{
			start = start+d*0.0001;
		}
	}
	MC_SHADOW = step(found,1.5);
}

vec3 raytracing(vec4 coord4){
	vec4 direct = normalize(coord4);
	vec4 ro = vCam4+dx4;
	MC_ID = 0;
	MC_DIR = -1;
	raycastMC(ro,direct*100.0+ro);
	vec4 int1 = floor(MC_UV);
	MC_UV = MC_UV - int1;
	
	//sre bloc pos int1: (lup ambientlight sre)
	float direction = float(MC_DIR);
	int1.x -= step(4.9,direction)*step(direction,5.1);
	int1.y -= step(0.9,direction)*step(direction,1.1);
	int1.z -= step(2.9,direction)*step(direction,3.1);
	int1.w -= step(6.9,direction)*step(direction,7.1);
	DISTANCE = dot(int1 - ro,int1 - ro);
	vec4 N = 
		MC_DIR == 0?
			vec4(0.0,1.0,0.0,0.0):
		MC_DIR == 1?
			vec4(0.0,-1.0,0.0,0.0):
		MC_DIR == 2?
			vec4(0.0,0.0,1.0,0.0):
		MC_DIR == 3?
			vec4(0.0,0.0,-1.0,0.0):
		MC_DIR == 4?
			vec4(1.0,0.0,0.0,0.0):
		MC_DIR == 5?
			vec4(-1.0,0.0,0.0,0.0):
		MC_DIR == 6?
			vec4(0.0,0.0,0.0,1.0):
		vec4(0.0,0.0,0.0,-1.0);
		
	float angleCos = dot(N,light_Dir)*light_Density;
	vec4 uU = MC_DIR >= 4 && MC_DIR <= 5?
			vec4(0.,0.,1.,0.):
			vec4(1.,0.,0.,0.);
			
	vec4 uV = MC_DIR >1?
			vec4(0.,1.,0.,0.):
			vec4(0.,0.,1.,0.);
	vec4 uW = MC_DIR >5?
			vec4(0.,0.,1.,0.):
			vec4(0.,0.,0.,1.);
	vec3 uvw = (MC_DIR < 2?
			MC_UV.xzw:
		MC_DIR < 4?
			MC_UV.xyw:
		MC_DIR < 6?
			MC_UV.zyw:
			MC_UV.xyz 
	);
	//访问下层相邻方块（用于线框边界检测）
	float dUp = step(0.001,getID(int1+uU));
	float dUm = step(0.001,getID(int1-uU));
	float dVp = step(0.001,getID(int1+uV));
	float dVm = step(0.001,getID(int1-uV));
	float dWp = step(0.001,getID(int1+uW));
	float dWm = step(0.001,getID(int1-uW));
	float dUpVp = step(0.001,getID(int1+uU+uV));
	float dUpVm = step(0.001,getID(int1+uU-uV));
	float dUmVm = step(0.001,getID(int1-uU-uV));
	float dUmVp = step(0.001,getID(int1-uU+uV));
	float dUpWp = step(0.001,getID(int1+uU+uW));
	float dUpWm = step(0.001,getID(int1+uU-uW));
	float dUmWm = step(0.001,getID(int1-uU-uW));
	float dUmWp = step(0.001,getID(int1-uU+uW));
	float dVpWp = step(0.001,getID(int1+uV+uW));
	float dVpWm = step(0.001,getID(int1+uV-uW));
	float dVmWm = step(0.001,getID(int1-uV-uW));
	float dVmWp = step(0.001,getID(int1-uV+uW));
	
	
	//访问上层相邻方块（用于线框边界检测和AO）	
	int1 -= N;
	float Up = getID(int1+uU);
	float Um = getID(int1-uU);
	float Vp = getID(int1+uV);
	float Vm = getID(int1-uV);
	float Wp = getID(int1+uW);
	float Wm = getID(int1-uW);
	float UpVp = getID(int1+uU+uV);
	float UpVm = getID(int1+uU-uV);
	float UmVm = getID(int1-uU-uV);
	float UmVp = getID(int1-uU+uV);
	float UpWp = getID(int1+uU+uW);
	float UpWm = getID(int1+uU-uW);
	float UmWm = getID(int1-uU-uW);
	float UmWp = getID(int1-uU+uW);
	float VpWp = getID(int1+uV+uW);
	float VpWm = getID(int1+uV-uW);
	float VmWm = getID(int1-uV-uW);
	float VmWp = getID(int1-uV+uW);
	float UpVpWp = getID(int1+uU+uV+uW);
	float UpVpWm = getID(int1+uU+uV-uW);
	float UpVmWp = getID(int1+uU-uV+uW);
	float UpVmWm = getID(int1+uU-uV-uW);
	float UmVpWp = getID(int1-uU+uV+uW);
	float UmVpWm = getID(int1-uU+uV-uW);
	float UmVmWp = getID(int1-uU-uV+uW);
	float UmVmWm = getID(int1-uU-uV-uW);
	
	//线框模式：
	
	float uUp = step(0.001,Up);
	float uUm = step(0.001,Um);
	float uVp = step(0.001,Vp);
	float uVm = step(0.001,Vm);
	float uWp = step(0.001,Wp);
	float uWm = step(0.001,Wm);
	float uUpVp = step(0.001,UpVp);
	float uUpVm = step(0.001,UpVm);
	float uUmVm = step(0.001,UmVm);
	float uUmVp = step(0.001,UmVp);
	float uUpWp = step(0.001,UpWp);
	float uUpWm = step(0.001,UpWm);
	float uUmWm = step(0.001,UmWm);
	float uUmWp = step(0.001,UmWp);
	float uVpWp = step(0.001,VpWp);
	float uVpWm = step(0.001,VpWm);
	float uVmWm = step(0.001,VmWm);
	float uVmWp = step(0.001,VmWp);
	
	#define AAA 0.8
	#define BBB 0.2
	
	if(displayMode == 1){
		wireFrame = 
			step(AAA,uvw.x)*step(AAA,uvw.y)*mix(dUpVp+uUp+uUpVp+uVp+(1.-dUpVp)*(1.-dUp)*(1.-dVp), 1.-clamp((1.-uUp)*(1.-uUpVp)*(1.-uVp)+uUpVp*(uUp*(1.-uVp)+uVp*(1.-uUp)),0.,1.), dUp*dUpVp*dVp)+
			step(AAA,uvw.x)*step(uvw.y,BBB)*mix(dUpVm+uUp+uUpVm+uVm+(1.-dUpVm)*(1.-dUp)*(1.-dVm), 1.-clamp((1.-uUp)*(1.-uUpVm)*(1.-uVm)+uUpVm*(uUp*(1.-uVm)+uVm*(1.-uUp)),0.,1.), dUp*dUpVm*dVm)+
			step(uvw.x,BBB)*step(uvw.y,BBB)*mix(dUmVm+uUm+uUmVm+uVm+(1.-dUmVm)*(1.-dUm)*(1.-dVm), 1.-clamp((1.-uUm)*(1.-uUmVm)*(1.-uVm)+uUmVm*(uUm*(1.-uVm)+uVm*(1.-uUm)),0.,1.), dUm*dUmVm*dVm)+
			step(uvw.x,BBB)*step(AAA,uvw.y)*mix(dUmVp+uUm+uUmVp+uVp+(1.-dUmVp)*(1.-dUm)*(1.-dVp), 1.-clamp((1.-uUm)*(1.-uUmVp)*(1.-uVp)+uUmVp*(uUm*(1.-uVp)+uVp*(1.-uUm)),0.,1.), dUm*dUmVp*dVp)+
			step(AAA,uvw.x)*step(AAA,uvw.z)*mix(dUpWp+uUp+uUpWp+uWp+(1.-dUpWp)*(1.-dUp)*(1.-dWp), 1.-clamp((1.-uUp)*(1.-uUpWp)*(1.-uWp)+uUpWp*(uUp*(1.-uWp)+uWp*(1.-uUp)),0.,1.), dUp*dUpWp*dWp)+
			step(AAA,uvw.x)*step(uvw.z,BBB)*mix(dUpWm+uUp+uUpWm+uWm+(1.-dUpWm)*(1.-dUp)*(1.-dWm), 1.-clamp((1.-uUp)*(1.-uUpWm)*(1.-uWm)+uUpWm*(uUp*(1.-uWm)+uWm*(1.-uUp)),0.,1.), dUp*dUpWm*dWm)+
			step(uvw.x,BBB)*step(uvw.z,BBB)*mix(dUmWm+uUm+uUmWm+uWm+(1.-dUmWm)*(1.-dUm)*(1.-dWm), 1.-clamp((1.-uUm)*(1.-uUmWm)*(1.-uWm)+uUmWm*(uUm*(1.-uWm)+uWm*(1.-uUm)),0.,1.), dUm*dUmWm*dWm)+
			step(uvw.x,BBB)*step(AAA,uvw.z)*mix(dUmWp+uUm+uUmWp+uWp+(1.-dUmWp)*(1.-dUm)*(1.-dWp), 1.-clamp((1.-uUm)*(1.-uUmWp)*(1.-uWp)+uUmWp*(uUm*(1.-uWp)+uWp*(1.-uUm)),0.,1.), dUm*dUmWp*dWp)+
			step(AAA,uvw.y)*step(AAA,uvw.z)*mix(dVpWp+uVp+uVpWp+uWp+(1.-dVpWp)*(1.-dVp)*(1.-dWp), 1.-clamp((1.-uVp)*(1.-uVpWp)*(1.-uWp)+uVpWp*(uVp*(1.-uWp)+uWp*(1.-uVp)),0.,1.), dVp*dVpWp*dWp)+
			step(AAA,uvw.y)*step(uvw.z,BBB)*mix(dVpWm+uVp+uVpWm+uWm+(1.-dVpWm)*(1.-dVp)*(1.-dWm), 1.-clamp((1.-uVp)*(1.-uVpWm)*(1.-uWm)+uVpWm*(uVp*(1.-uWm)+uWm*(1.-uVp)),0.,1.), dVp*dVpWm*dWm)+
			step(uvw.y,BBB)*step(uvw.z,BBB)*mix(dVmWm+uVm+uVmWm+uWm+(1.-dVmWm)*(1.-dVm)*(1.-dWm), 1.-clamp((1.-uVm)*(1.-uVmWm)*(1.-uWm)+uVmWm*(uVm*(1.-uWm)+uWm*(1.-uVm)),0.,1.), dVm*dVmWm*dWm)+
			step(uvw.y,BBB)*step(AAA,uvw.z)*mix(dVmWp+uVm+uVmWp+uWp+(1.-dVmWp)*(1.-dVm)*(1.-dWp), 1.-clamp((1.-uVm)*(1.-uVmWp)*(1.-uWp)+uVmWp*(uVm*(1.-uWp)+uWp*(1.-uVm)),0.,1.), dVm*dVmWp*dWp);
	}
	
	//环境光遮蔽：
	
	float AO = 
		mix(0.0,1.0,uvw.x)*step(Up,0.001) +
		mix(1.0,0.0,uvw.x)*step(Um,0.001) +
		mix(0.0,1.0,uvw.y)*step(Vp,0.001) +
		mix(1.0,0.0,uvw.y)*step(Vm,0.001) +
		mix(0.0,1.0,uvw.z)*step(Wp,0.001) +
		mix(1.0,0.0,uvw.z)*step(Wm,0.001) +
		mix(0.0,1.0,uvw.x)*mix(0.0,1.0,uvw.y)*step(UpVp,0.001)+
		mix(0.0,1.0,uvw.x)*mix(1.0,0.0,uvw.y)*step(UpVm,0.001)+
		mix(1.0,0.0,uvw.x)*mix(1.0,0.0,uvw.y)*step(UmVm,0.001)+
		mix(1.0,0.0,uvw.x)*mix(0.0,1.0,uvw.y)*step(UmVp,0.001)+
		mix(0.0,1.0,uvw.x)*mix(0.0,1.0,uvw.z)*step(UpWp,0.001)+
		mix(0.0,1.0,uvw.x)*mix(1.0,0.0,uvw.z)*step(UpWm,0.001)+
		mix(1.0,0.0,uvw.x)*mix(1.0,0.0,uvw.z)*step(UmWm,0.001)+
		mix(1.0,0.0,uvw.x)*mix(0.0,1.0,uvw.z)*step(UmWp,0.001)+
		mix(0.0,1.0,uvw.y)*mix(0.0,1.0,uvw.z)*step(VpWp,0.001)+
		mix(0.0,1.0,uvw.y)*mix(1.0,0.0,uvw.z)*step(VpWm,0.001)+
		mix(1.0,0.0,uvw.y)*mix(1.0,0.0,uvw.z)*step(VmWm,0.001)+
		mix(1.0,0.0,uvw.y)*mix(0.0,1.0,uvw.z)*step(VmWp,0.001)+
		mix(0.0,1.0,uvw.x)*mix(0.0,1.0,uvw.y)*mix(0.0,1.0,uvw.z)*step(UpVpWp,0.001)+
		mix(0.0,1.0,uvw.x)*mix(0.0,1.0,uvw.y)*mix(1.0,0.0,uvw.z)*step(UpVpWm,0.001)+
		mix(0.0,1.0,uvw.x)*mix(1.0,0.0,uvw.y)*mix(0.0,1.0,uvw.z)*step(UpVmWp,0.001)+
		mix(0.0,1.0,uvw.x)*mix(1.0,0.0,uvw.y)*mix(1.0,0.0,uvw.z)*step(UpVmWm,0.001)+
		mix(1.0,0.0,uvw.x)*mix(0.0,1.0,uvw.y)*mix(0.0,1.0,uvw.z)*step(UmVpWp,0.001)+
		mix(1.0,0.0,uvw.x)*mix(0.0,1.0,uvw.y)*mix(1.0,0.0,uvw.z)*step(UmVpWm,0.001)+
		mix(1.0,0.0,uvw.x)*mix(1.0,0.0,uvw.y)*mix(0.0,1.0,uvw.z)*step(UmVmWp,0.001)+
		mix(1.0,0.0,uvw.x)*mix(1.0,0.0,uvw.y)*mix(1.0,0.0,uvw.z)*step(UmVmWm,0.001);
	AO *= 1.0 - clamp(light_Dir.y*2.0,0.0,1.0)*(0.9+N.y*0.1);
	float SO = MC_SHADOW * clamp(angleCos,0.0,1.0) * clamp(-light_Dir.y*2.0,0.0,1.0);			
	uvw *= 8.0;
	
	vec2 pixel = vec2(uvw.x + float(int(uvw.z)*8+MC_DIR*64), 8.0-uvw.y + float((MC_ID-1)*8))/512.0;
	
	vec4 delta = abs(int1 - focusPos + N);
	vec3 flag = 1.0 - step(3.0,abs(uvw-vec3(4.0,4.0,4.0)));//abs(uvw+vec3(1.0,1.0,1.0)));
	
	vec3 c = mix(
		texture2D(bloc,pixel).rgb*(SO + (AO-4.0)*0.05 + ambientLight),//贴图颜色*光照
		//阳光 + 环境光遮蔽 + 环境光
		vec3(1.0,0.0,0.0),
		(1.0-flag.x*flag.y*flag.z)*step(delta.x+delta.y+delta.z+delta.w,0.4)+wireFrame //与外面红框混合
	);
	c = 
		MC_ID!=0 ?
			c:
		dot(direct,light_Dir)<-0.98?
			sunColor:
			bgColor4;
	return c;
}
void main(void) {
	Prel = floor(vec4(chunkCenter.x,0.0,chunkCenter.yz)/4.0)*4.0;
	light_Dir_100 = light_Dir*100.;
	light_Dir_001 = light_Dir*0.001;
	vec3 color1 = raytracing(coord4);
	
	if((abs(coord.x)<0.08 || abs(coord.y)<0.08 || abs(coord.z)<0.08)&&(abs(coord.x)<0.5 && abs(coord.y)<0.5)){
		gl_FragColor=vec4(vec3(1.0,1.0,1.0)-color1.rgb,1.0);
	}else{
		gl_FragColor=vec4(
			color1.rgb,
			clamp(
				flow*(opacity(color1.rgb)+5.0*(1.-smoothstep(20.0,100.0,DISTANCE))*clamp(wireFrame*float(MC_ID),0.,1.))
				,0.0
				,1.0
			)
		);
	}
	
}
`