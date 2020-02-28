var MCRenderer_FragmentShader = `
precision highp float;
varying vec4 coord;
varying vec4 coord4;
uniform float flow,ambientLight;
uniform mat4 mCamera3;
uniform vec3 Camera4Proj, chunkCenter, bgColor4,sunColor;
uniform vec4 vCam4,dx4,light_Dir, focusPos, N_glass;
uniform float light_Density, lineWidth;
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
int MC_GLASS_DIR = -1;
int MC_GLASS = 0;
float MC_SHADOW = 0.0;
int glass = 0;
vec4 MC_UV;
vec4 MC_GLASS_UV;
const int rdRange = renderDistance*2+1;
const int rdRange2 = rdRange*rdRange;
const float resolution = 1./2048.0;
float wireFrame, DISTANCE;
vec4 light_Dir_100,light_Dir_001;
vec4 Prel;
const float GLASS_ID = 30.0;
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
float isGlass(float id){
	return step((GLASS_ID-0.5)/256.0,id)-step((GLASS_ID+0.5)/256.0,id);
}
float isTransparent(float id){
	return step(step(0.001,id)-isGlass(id),0.5);
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
			found = found + step(0.001,ID)-isGlass(ID);
			//- (step((GLASS_ID-0.5)/256.0,ID)-step(ID,(GLASS_ID+0.5)/256.0));
			glass += int(isGlass(ID));
		}
		if(glass==1 && MC_GLASS_DIR==-1 && found<0.5){
			MC_GLASS_DIR = int(direction+0.5);
			MC_GLASS_UV = start;
			MC_GLASS = glass;
		}
		if(found>0.5&&found<1.5&&ID>0.001&&isGlass(ID)<0.5){
			MC_ID = int(ID*256.0 +0.5);
			MC_DIR = int(direction+0.5);
			MC_UV = start;
			MC_GLASS = glass;
			end = start - light_Dir_100 + 0.002;
			int2 = (floor(end));
			start = start - light_Dir_001 + 0.001;
		}else{
			start = start+d*0.0001;
		}
	}
	MC_GLASS = MC_GLASS>=2?1:MC_GLASS;
	MC_SHADOW = step(found,1.5);
	MC_GLASS_UV = mix(MC_UV,MC_GLASS_UV,float(MC_GLASS));
	MC_GLASS_DIR = MC_GLASS>0?MC_GLASS_DIR:MC_DIR;

}

vec3 raytracing(vec4 coord4){
	vec4 direct = normalize(coord4);
	vec4 ro = vCam4+dx4;
	MC_ID = 0;
	MC_DIR = -1;
	MC_GLASS_DIR = -1;
	raycastMC(ro,direct*100.0+ro);
	vec4 int1 = floor(MC_UV);
	vec4 int1_glass = floor(MC_GLASS_UV);
	MC_UV = MC_UV - int1;
	MC_GLASS_UV = MC_GLASS_UV - int1_glass;
	//sre bloc pos int1: (lup ambientlight sre)
	float direction = float(MC_DIR);
	float direction_glass = float(MC_GLASS_DIR);
	int1.x -= step(4.9,direction)*step(direction,5.1);
	int1.y -= step(0.9,direction)*step(direction,1.1);
	int1.z -= step(2.9,direction)*step(direction,3.1);
	int1.w -= step(6.9,direction)*step(direction,7.1);
	int1_glass.x -= step(4.9,direction_glass)*step(direction_glass,5.1);
	int1_glass.y -= step(0.9,direction_glass)*step(direction_glass,1.1);
	int1_glass.z -= step(2.9,direction_glass)*step(direction_glass,3.1);
	int1_glass.w -= step(6.9,direction_glass)*step(direction_glass,7.1);
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
	vec4 N_glass = 
		MC_GLASS_DIR == 0?
			vec4(0.0,1.0,0.0,0.0):
		MC_GLASS_DIR == 1?
			vec4(0.0,-1.0,0.0,0.0):
		MC_GLASS_DIR == 2?
			vec4(0.0,0.0,1.0,0.0):
		MC_GLASS_DIR == 3?
			vec4(0.0,0.0,-1.0,0.0):
		MC_GLASS_DIR == 4?
			vec4(1.0,0.0,0.0,0.0):
		MC_GLASS_DIR == 5?
			vec4(-1.0,0.0,0.0,0.0):
		MC_GLASS_DIR == 6?
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
	vec3 uvw_glass = (MC_GLASS_DIR < 2?
			MC_GLASS_UV.xzw:
		MC_GLASS_DIR < 4?
			MC_GLASS_UV.xyw:
		MC_GLASS_DIR < 6?
			MC_GLASS_UV.zyw:
			MC_GLASS_UV.xyz 
	);
	
	//访问上层相邻方块（用于AO，不考虑玻璃）	
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
	
	//define AAA 0.9
	//define BBB 0.1
	
	if(displayMode == 1){
		vec4 gU = MC_GLASS_DIR >= 4 && MC_GLASS_DIR <= 5?
			vec4(0.,0.,1.,0.):
			vec4(1.,0.,0.,0.);
				
		vec4 gV = MC_GLASS_DIR >1?
				vec4(0.,1.,0.,0.):
				vec4(0.,0.,1.,0.);
		vec4 gW = MC_GLASS_DIR >5?
				vec4(0.,0.,1.,0.):
				vec4(0.,0.,0.,1.);
		//访问下层相邻方块（用于线框边界检测）
		bool dUp = getID(int1_glass+gU)>0.001;
		bool dUm = getID(int1_glass-gU)>0.001;
		bool dVp = getID(int1_glass+gV)>0.001;
		bool dVm = getID(int1_glass-gV)>0.001;
		bool dWp = getID(int1_glass+gW)>0.001;
		bool dWm = getID(int1_glass-gW)>0.001;
		bool dUpVp = getID(int1_glass+gU+gV)>0.001;
		bool dUpVm = getID(int1_glass+gU-gV)>0.001;
		bool dUmVm = getID(int1_glass-gU-gV)>0.001;
		bool dUmVp = getID(int1_glass-gU+gV)>0.001;
		bool dUpWp = getID(int1_glass+gU+gW)>0.001;
		bool dUpWm = getID(int1_glass+gU-gW)>0.001;
		bool dUmWm = getID(int1_glass-gU-gW)>0.001;
		bool dUmWp = getID(int1_glass-gU+gW)>0.001;
		bool dVpWp = getID(int1_glass+gV+gW)>0.001;
		bool dVpWm = getID(int1_glass+gV-gW)>0.001;
		bool dVmWm = getID(int1_glass-gV-gW)>0.001;
		bool dVmWp = getID(int1_glass-gV+gW)>0.001;
		int1_glass -= N_glass;
		//用于线边框（要考虑玻璃）
		float glass_Up = getID(int1_glass+gU);
		float glass_Um = getID(int1_glass-gU);
		float glass_Vp = getID(int1_glass+gV);
		float glass_Vm = getID(int1_glass-gV);
		float glass_Wp = getID(int1_glass+gW);
		float glass_Wm = getID(int1_glass-gW);
		float glass_UpVp = getID(int1_glass+gU+gV);
		float glass_UpVm = getID(int1_glass+gU-gV);
		float glass_UmVm = getID(int1_glass-gU-gV);
		float glass_UmVp = getID(int1_glass-gU+gV);
		float glass_UpWp = getID(int1_glass+gU+gW);
		float glass_UpWm = getID(int1_glass+gU-gW);
		float glass_UmWm = getID(int1_glass-gU-gW);
		float glass_UmWp = getID(int1_glass-gU+gW);
		float glass_VpWp = getID(int1_glass+gV+gW);
		float glass_VpWm = getID(int1_glass+gV-gW);
		float glass_VmWm = getID(int1_glass-gV-gW);
		float glass_VmWp = getID(int1_glass-gV+gW);
		float glass_UpVpWp = getID(int1_glass+gU+gV+gW);
		float glass_UpVpWm = getID(int1_glass+gU+gV-gW);
		float glass_UpVmWp = getID(int1_glass+gU-gV+gW);
		float glass_UpVmWm = getID(int1_glass+gU-gV-gW);
		float glass_UmVpWp = getID(int1_glass-gU+gV+gW);
		float glass_UmVpWm = getID(int1_glass-gU+gV-gW);
		float glass_UmVmWp = getID(int1_glass-gU-gV+gW);
		float glass_UmVmWm = getID(int1_glass-gU-gV-gW);
		
		//线框模式：
		
		bool uUp = glass_Up>0.001;
		bool uUm = glass_Um>0.001;
		bool uVp = glass_Vp>0.001;
		bool uVm = glass_Vm>0.001;
		bool uWp = glass_Wp>0.001;
		bool uWm = glass_Wm>0.001;
		bool uUpVp = glass_UpVp>0.001;
		bool uUpVm = glass_UpVm>0.001;
		bool uUmVm = glass_UmVm>0.001;
		bool uUmVp = glass_UmVp>0.001;
		bool uUpWp = glass_UpWp>0.001;
		bool uUpWm = glass_UpWm>0.001;
		bool uUmWm = glass_UmWm>0.001;
		bool uUmWp = glass_UmWp>0.001;
		bool uVpWp = glass_VpWp>0.001;
		bool uVpWm = glass_VpWm>0.001;
		bool uVmWm = glass_VmWm>0.001;
		bool uVmWp = glass_VmWp>0.001;
		float AAA = 1. - lineWidth;
		float BBB = lineWidth;
		wireFrame = 
			//step(AAA,uvw.x)*step(AAA,uvw.y)*float((!(dUpVp^^dVp)&&dUp&&(!uUpVp^^uVp)&&!uUp)||(dVp&&(!dUp^^dUpVp)&&!uVp&&!(uUp^^uUpVp)))+
			step(AAA,uvw_glass.x)*step(AAA,uvw_glass.y)*float(!(((!(dUpVp^^dVp)&&(!uUpVp^^uVp)||(uUpVp&&uVp))&&dUp&&!uUp) || (((!dUp^^dUpVp)&&!(uUp^^uUpVp)||(uUp&&uUpVp))&&dVp&&!uVp)))+
			step(AAA,uvw_glass.x)*step(uvw_glass.y,BBB)*float(!(((!(dUpVm^^dVm)&&(!uUpVm^^uVm)||(uUpVm&&uVm))&&dUp&&!uUp) || (((!dUp^^dUpVm)&&!(uUp^^uUpVm)||(uUp&&uUpVm))&&dVm&&!uVm)))+
			step(uvw_glass.x,BBB)*step(uvw_glass.y,BBB)*float(!(((!(dUmVm^^dVm)&&(!uUmVm^^uVm)||(uUmVm&&uVm))&&dUm&&!uUm) || (((!dUm^^dUmVm)&&!(uUm^^uUmVm)||(uUm&&uUmVm))&&dVm&&!uVm)))+
			step(uvw_glass.x,BBB)*step(AAA,uvw_glass.y)*float(!(((!(dUmVp^^dVp)&&(!uUmVp^^uVp)||(uUmVp&&uVp))&&dUm&&!uUm) || (((!dUm^^dUmVp)&&!(uUm^^uUmVp)||(uUm&&uUmVp))&&dVp&&!uVp)))+
			step(AAA,uvw_glass.x)*step(AAA,uvw_glass.z)*float(!(((!(dUpWp^^dWp)&&(!uUpWp^^uWp)||(uUpWp&&uWp))&&dUp&&!uUp) || (((!dUp^^dUpWp)&&!(uUp^^uUpWp)||(uUp&&uUpWp))&&dWp&&!uWp)))+
			step(AAA,uvw_glass.x)*step(uvw_glass.z,BBB)*float(!(((!(dUpWm^^dWm)&&(!uUpWm^^uWm)||(uUpWm&&uWm))&&dUp&&!uUp) || (((!dUp^^dUpWm)&&!(uUp^^uUpWm)||(uUp&&uUpWm))&&dWm&&!uWm)))+
			step(uvw_glass.x,BBB)*step(uvw_glass.z,BBB)*float(!(((!(dUmWm^^dWm)&&(!uUmWm^^uWm)||(uUmWm&&uWm))&&dUm&&!uUm) || (((!dUm^^dUmWm)&&!(uUm^^uUmWm)||(uUm&&uUmWm))&&dWm&&!uWm)))+
			step(uvw_glass.x,BBB)*step(AAA,uvw_glass.z)*float(!(((!(dUmWp^^dWp)&&(!uUmWp^^uWp)||(uUmWp&&uWp))&&dUm&&!uUm) || (((!dUm^^dUmWp)&&!(uUm^^uUmWp)||(uUm&&uUmWp))&&dWp&&!uWp)))+
			step(AAA,uvw_glass.y)*step(AAA,uvw_glass.z)*float(!(((!(dVpWp^^dWp)&&(!uVpWp^^uWp)||(uVpWp&&uWp))&&dVp&&!uVp) || (((!dVp^^dVpWp)&&!(uVp^^uVpWp)||(uVp&&uVpWp))&&dWp&&!uWp)))+
			step(AAA,uvw_glass.y)*step(uvw_glass.z,BBB)*float(!(((!(dVpWm^^dWm)&&(!uVpWm^^uWm)||(uVpWm&&uWm))&&dVp&&!uVp) || (((!dVp^^dVpWm)&&!(uVp^^uVpWm)||(uVp&&uVpWm))&&dWm&&!uWm)))+
			step(uvw_glass.y,BBB)*step(uvw_glass.z,BBB)*float(!(((!(dVmWm^^dWm)&&(!uVmWm^^uWm)||(uVmWm&&uWm))&&dVm&&!uVm) || (((!dVm^^dVmWm)&&!(uVm^^uVmWm)||(uVm&&uVmWm))&&dWm&&!uWm)))+
			step(uvw_glass.y,BBB)*step(AAA,uvw_glass.z)*float(!(((!(dVmWp^^dWp)&&(!uVmWp^^uWp)||(uVmWp&&uWp))&&dVm&&!uVm) || (((!dVm^^dVmWp)&&!(uVm^^uVmWp)||(uVm&&uVmWp))&&dWp&&!uWp)));
			
			
			/*step(AAA,uvw.x)*step(AAA,uvw.y)*mix(dUpVp+uUp+uUpVp+uVp+(1.-dUpVp)*(1.-dUp)*(1.-dVp), 1.-clamp((1.-uUp)*(1.-uUpVp)*(1.-uVp)+uUpVp*(uUp*(1.-uVp)+uVp*(1.-uUp)),0.,1.), dUp*dUpVp*dVp)+
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
			step(uvw.y,BBB)*step(AAA,uvw.z)*mix(dVmWp+uVm+uVmWp+uWp+(1.-dVmWp)*(1.-dVm)*(1.-dWp), 1.-clamp((1.-uVm)*(1.-uVmWp)*(1.-uWp)+uVmWp*(uVm*(1.-uWp)+uWp*(1.-uVm)),0.,1.), dVm*dVmWp*dWp);*/
	}else{
		int1_glass -= N_glass;
	}
	
	//环境光遮蔽：
	
	float AO = 
		mix(0.0,1.0,uvw.x)*isTransparent(Up) +
		mix(1.0,0.0,uvw.x)*isTransparent(Um) +
		mix(0.0,1.0,uvw.y)*isTransparent(Vp) +
		mix(1.0,0.0,uvw.y)*isTransparent(Vm) +
		mix(0.0,1.0,uvw.z)*isTransparent(Wp) +
		mix(1.0,0.0,uvw.z)*isTransparent(Wm) +
		mix(0.0,1.0,uvw.x)*mix(0.0,1.0,uvw.y)*isTransparent(UpVp)+
		mix(0.0,1.0,uvw.x)*mix(1.0,0.0,uvw.y)*isTransparent(UpVm)+
		mix(1.0,0.0,uvw.x)*mix(1.0,0.0,uvw.y)*isTransparent(UmVm)+
		mix(1.0,0.0,uvw.x)*mix(0.0,1.0,uvw.y)*isTransparent(UmVp)+
		mix(0.0,1.0,uvw.x)*mix(0.0,1.0,uvw.z)*isTransparent(UpWp)+
		mix(0.0,1.0,uvw.x)*mix(1.0,0.0,uvw.z)*isTransparent(UpWm)+
		mix(1.0,0.0,uvw.x)*mix(1.0,0.0,uvw.z)*isTransparent(UmWm)+
		mix(1.0,0.0,uvw.x)*mix(0.0,1.0,uvw.z)*isTransparent(UmWp)+
		mix(0.0,1.0,uvw.y)*mix(0.0,1.0,uvw.z)*isTransparent(VpWp)+
		mix(0.0,1.0,uvw.y)*mix(1.0,0.0,uvw.z)*isTransparent(VpWm)+
		mix(1.0,0.0,uvw.y)*mix(1.0,0.0,uvw.z)*isTransparent(VmWm)+
		mix(1.0,0.0,uvw.y)*mix(0.0,1.0,uvw.z)*isTransparent(VmWp)+
		mix(0.0,1.0,uvw.x)*mix(0.0,1.0,uvw.y)*mix(0.0,1.0,uvw.z)*isTransparent(UpVpWp)+
		mix(0.0,1.0,uvw.x)*mix(0.0,1.0,uvw.y)*mix(1.0,0.0,uvw.z)*isTransparent(UpVpWm)+
		mix(0.0,1.0,uvw.x)*mix(1.0,0.0,uvw.y)*mix(0.0,1.0,uvw.z)*isTransparent(UpVmWp)+
		mix(0.0,1.0,uvw.x)*mix(1.0,0.0,uvw.y)*mix(1.0,0.0,uvw.z)*isTransparent(UpVmWm)+
		mix(1.0,0.0,uvw.x)*mix(0.0,1.0,uvw.y)*mix(0.0,1.0,uvw.z)*isTransparent(UmVpWp)+
		mix(1.0,0.0,uvw.x)*mix(0.0,1.0,uvw.y)*mix(1.0,0.0,uvw.z)*isTransparent(UmVpWm)+
		mix(1.0,0.0,uvw.x)*mix(1.0,0.0,uvw.y)*mix(0.0,1.0,uvw.z)*isTransparent(UmVmWp)+
		mix(1.0,0.0,uvw.x)*mix(1.0,0.0,uvw.y)*mix(1.0,0.0,uvw.z)*isTransparent(UmVmWm);
	AO *= 1.0 - clamp(light_Dir.y*2.0,0.0,1.0)*(0.9+N.y*0.1);
	float SO = MC_SHADOW * clamp(angleCos,0.0,1.0) * clamp(-light_Dir.y*2.0,0.0,1.0);			
	uvw *= 8.0;
	uvw_glass *= 8.0;
	vec2 pixel = vec2(uvw.x + float(int(uvw.z)*8+MC_DIR*64), 8.0-uvw.y + float((MC_ID-1)*8))/512.0;
	
	vec4 delta = abs(int1_glass - focusPos + N_glass);
	vec3 flag = 1.0 - step(3.0,abs(uvw_glass-vec3(4.0,4.0,4.0)));//abs(uvw+vec3(1.0,1.0,1.0)));
	
	vec3 c = mix(
		MC_ID==0?(dot(direct,light_Dir)<-0.98?
			sunColor:
			bgColor4):(texture2D(bloc,pixel).rgb*(SO + (AO-4.0)*0.05 + ambientLight)),//贴图颜色*光照
		//阳光 + 环境光遮蔽 + 环境光
		vec3(1.0,0.0,0.0),
		(MC_ID==0&&MC_GLASS<1)?0.0:((1.0-flag.x*flag.y*flag.z)*step(delta.x+delta.y+delta.z+delta.w,0.4)+wireFrame) //与外面红框混合
	);
	//c = MC_GLASS>0? vec3(0.9,0.1,0.3):c;
	return mix(c,vec3(0.1,0.8,0.9),float(MC_GLASS)*ambientLight*0.6);
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
				flow*(opacity(color1.rgb)+5.0*(1.-smoothstep(500.0*lineWidth,400.0,DISTANCE))*clamp(wireFrame*float(MC_ID),0.,1.))
				,0.0
				,1.0
			)
		);
	}
	
}
`