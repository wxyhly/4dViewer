var MCRenderer_FragmentShader = `
precision highp float;
varying vec4 coord;
varying vec4 coord4;
uniform float flow,ambientLight;
uniform mat4 mCamera3;
uniform vec3 Camera4Proj, chunkCenter, bgColor4,sunColor,light_Density;
uniform vec4 vCam4,dx4,light_Dir, focusPos, N_glass;
uniform float lineWidth;
uniform mat4 mCam4;
uniform int displayMode;
const int renderDistance = 9;
const float renderDistancef = float(renderDistance)+0.5;
uniform sampler2D chunk, bloc;
float opacity(vec3 cc){
	return 0.8;
}
const int chunkSize = 32*4*4;

const int rdRange = renderDistance*2+1;
const int rdRange2 = rdRange*rdRange;
const float resolution = 1./2048.0;
float wireFrame, DISTANCE;
const float GLASS_ID = 30.0;
const float WATER_ID = 8.0;
const float LEAVE_ID = 5.0;
vec4 Prel;
float getID(vec4 pos){
	
	vec4 p = pos - Prel;
	float chx = mod(pos.x,4.0);
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
float isLeave(float id){
	return step((LEAVE_ID-0.5)/256.0,id)-step((LEAVE_ID+0.5)/256.0,id);
}
float isGlass(float id){
	return step((GLASS_ID-0.5)/256.0,id)-step((GLASS_ID+0.5)/256.0,id);
}
float isWater(float id){
	return step((WATER_ID-0.5)/256.0,id)-step((WATER_ID+0.5)/256.0,id);
}
float isTransparent(float id){
	return step(step(0.001,id)-isGlass(id),0.5);
}
float raycastMC(in vec4 ro, in vec4 rd, out int oID, out vec4 oN, out vec4 oBlc, out vec4 oPos, out int oShadow, out int oGlass){
	// 终点方块坐标
	float t;
	lowp float found = 0.0;
	lowp float ID;
	vec4 pos = floor(ro);
	//camera ray
	vec4 ri = 1.0/rd;
	vec4 rs = sign(rd);

	//sun ray (cast shadow)
	vec4 li = -1.0/light_Dir;
	vec4 ls = -sign(light_Dir);

	//distance(along ray) to x, y, z, w-plane respectively
	vec4 dis = (pos-ro + 0.5 + rs*0.5) * ri;
	
	vec4 mm = vec4(0.0);
	//suppose we are not in the shadow
	oShadow = 0;
	oGlass = 0;
	float oT;
	for( int i=0; i<128; i++ ) 
	{
		//direction selector: a bool vec4, which selects the minimum distance
		mm = step(dis, dis.yzwx) * step(dis, dis.zwxy) * step(dis, dis.wxyz) * rs;
		//update distance for the next iteration
		dis += mm * ri;
		//update pos for the next iteration
		pos += mm;
		ID = getID(pos);
		if(isLeave(ID) > 0.01){
			vec4 mini = (pos-ro + 0.5 - 0.5*rs)*ri;
			t = max ( mini.x, max ( mini.y, max(mini.z, mini.w) ) );
			vec4 uvwt = ro + t * rd;
			uvwt = floor(fract(uvwt)*8.0 + 0.05)*31.0;
			if(sin(sin(uvwt.x + uvwt.y*29.0 + uvwt.z*17.0 + uvwt.w*53.0)*31.0)>0.2){
				continue;
			}
		}
		if(isWater(ID) > 0.01){
			oGlass += 3;
			vec4 mini = (pos-ro + 0.5 - 0.5*rs)*ri;
			t = max ( mini.x, max ( mini.y, max(mini.z, mini.w) ) );
				ro = ro + (t - 0.01) * rd;
				pos -= mm;
				rd = reflect(rd, mm);
				ri = 1.0/rd;
				rs = sign(rd);
				dis = (pos-ro + 0.5 + rs*0.5) * ri;
		}else if(isGlass(ID) > 0.01){
			oGlass += 1;
		}else if(ID > 0.001) {
			found += 1.0;
			//first hit, then we cal shadow
			if(found < 1.5){
				vec4 mini = (pos-ro + 0.5 - 0.5*rs)*ri;
				t = max ( mini.x, max ( mini.y, max(mini.z, mini.w) ) );
				oT = t;
				oBlc = pos;
				oN = -mm;
				oID = int(found * ID*256.0 +0.5);
				oPos = ro + t * rd;
				// break;
				ri = li;
				rs = ls;
				pos -= mm;
				ro = oPos - 0.01 * rd;
				dis = (pos-ro + 0.5 + rs*0.5) * ri;
				rd = light_Dir;
			}else{
				//we are in shadow, detected
				oShadow += 1;
				break;
			}
		}
	}
	
	return oT;
}

vec3 raytracing(vec4 coord4, out int MC_ID){
	vec4 direct = normalize(coord4);
	vec4 ro = vCam4+dx4;
	vec4 MC_NORM, MC_UV, MC_Blc;
	int MC_Shadow, MC_GLASS;
	DISTANCE = raycastMC(ro + vec4(0.4998) ,direct + vec4(0.001,0.002,0.003,0.004), MC_ID, MC_NORM, MC_Blc, MC_UV, MC_Shadow, MC_GLASS);
	MC_NORM = - MC_NORM;
	int MC_DIR = 
	MC_NORM.y>0.5?0:MC_NORM.y<-0.5?1:
	MC_NORM.z>0.5?2:MC_NORM.z<-0.5?3:
	MC_NORM.x>0.5?4:MC_NORM.x<-0.5?5:
	MC_NORM.w>0.5?6:7;
	MC_UV = fract(MC_UV);
	vec4 int1 = MC_Blc;
	vec4 N = MC_NORM;
		
	float angleCos = dot(N,light_Dir);
	vec4 uU = N.x != 0.0 ?
			vec4(0.,0.,1.,0.):
			vec4(1.,0.,0.,0.);
			
	vec4 uV = N.y == 0.0 ?
			vec4(0.,1.,0.,0.):
			vec4(0.,0.,1.,0.);
	vec4 uW = N.w != 0.0 ?
			vec4(0.,0.,1.,0.):
			vec4(0.,0.,0.,1.);
	
	vec3 uvw = (
		N.y != 0.0 ?
			MC_UV.xzw:
		N.z != 0.0 ?
			MC_UV.xyw:
		N.x != 0.0 ?
			MC_UV.zyw:
			MC_UV.xyz 
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
	
	// #define AAA 0.9
	// #define BBB 0.1
	
	// if(displayMode == 1){
	// 	int1 += N;
	// 	//访问下层相邻方块（用于线框边界检测）
	// 	bool dUp = getID(int1+uU)>0.001;
	// 	bool dUm = getID(int1-uU)>0.001;
	// 	bool dVp = getID(int1+uV)>0.001;
	// 	bool dVm = getID(int1-uV)>0.001;
	// 	bool dWp = getID(int1+uW)>0.001;
	// 	bool dWm = getID(int1-uW)>0.001;
	// 	bool dUpVp = getID(int1+uU+uV)>0.001;
	// 	bool dUpVm = getID(int1+uU-uV)>0.001;
	// 	bool dUmVm = getID(int1-uU-uV)>0.001;
	// 	bool dUmVp = getID(int1-uU+uV)>0.001;
	// 	bool dUpWp = getID(int1+uU+uW)>0.001;
	// 	bool dUpWm = getID(int1+uU-uW)>0.001;
	// 	bool dUmWm = getID(int1-uU-uW)>0.001;
	// 	bool dUmWp = getID(int1-uU+uW)>0.001;
	// 	bool dVpWp = getID(int1+uV+uW)>0.001;
	// 	bool dVpWm = getID(int1+uV-uW)>0.001;
	// 	bool dVmWm = getID(int1-uV-uW)>0.001;
	// 	bool dVmWp = getID(int1-uV+uW)>0.001;
	// 	int1 -= N;
		
	// 	//线框模式：
		
	// 	bool uUp = Up>0.001;
	// 	bool uUm = Um>0.001;
	// 	bool uVp = Vp>0.001;
	// 	bool uVm = Vm>0.001;
	// 	bool uWp = Wp>0.001;
	// 	bool uWm = Wm>0.001;
	// 	bool uUpVp = UpVp>0.001;
	// 	bool uUpVm = UpVm>0.001;
	// 	bool uUmVm = UmVm>0.001;
	// 	bool uUmVp = UmVp>0.001;
	// 	bool uUpWp = UpWp>0.001;
	// 	bool uUpWm = UpWm>0.001;
	// 	bool uUmWm = UmWm>0.001;
	// 	bool uUmWp = UmWp>0.001;
	// 	bool uVpWp = VpWp>0.001;
	// 	bool uVpWm = VpWm>0.001;
	// 	bool uVmWm = VmWm>0.001;
	// 	bool uVmWp = VmWp>0.001;
	// 	float AAA = 1. - lineWidth;
	// 	float BBB = lineWidth;
	// 	wireFrame = 
	// 		step(AAA,uvw.x)*step(AAA,uvw.y)*float(!(((!(dUpVp^^dVp)&&(!uUpVp^^uVp)||(uUpVp&&uVp))&&dUp&&!uUp) || (((!dUp^^dUpVp)&&!(uUp^^uUpVp)||(uUp&&uUpVp))&&dVp&&!uVp)))+
	// 		step(AAA,uvw.x)*step(uvw.y,BBB)*float(!(((!(dUpVm^^dVm)&&(!uUpVm^^uVm)||(uUpVm&&uVm))&&dUp&&!uUp) || (((!dUp^^dUpVm)&&!(uUp^^uUpVm)||(uUp&&uUpVm))&&dVm&&!uVm)))+
	// 		step(uvw.x,BBB)*step(uvw.y,BBB)*float(!(((!(dUmVm^^dVm)&&(!uUmVm^^uVm)||(uUmVm&&uVm))&&dUm&&!uUm) || (((!dUm^^dUmVm)&&!(uUm^^uUmVm)||(uUm&&uUmVm))&&dVm&&!uVm)))+
	// 		step(uvw.x,BBB)*step(AAA,uvw.y)*float(!(((!(dUmVp^^dVp)&&(!uUmVp^^uVp)||(uUmVp&&uVp))&&dUm&&!uUm) || (((!dUm^^dUmVp)&&!(uUm^^uUmVp)||(uUm&&uUmVp))&&dVp&&!uVp)))+
	// 		step(AAA,uvw.x)*step(AAA,uvw.z)*float(!(((!(dUpWp^^dWp)&&(!uUpWp^^uWp)||(uUpWp&&uWp))&&dUp&&!uUp) || (((!dUp^^dUpWp)&&!(uUp^^uUpWp)||(uUp&&uUpWp))&&dWp&&!uWp)))+
	// 		step(AAA,uvw.x)*step(uvw.z,BBB)*float(!(((!(dUpWm^^dWm)&&(!uUpWm^^uWm)||(uUpWm&&uWm))&&dUp&&!uUp) || (((!dUp^^dUpWm)&&!(uUp^^uUpWm)||(uUp&&uUpWm))&&dWm&&!uWm)))+
	// 		step(uvw.x,BBB)*step(uvw.z,BBB)*float(!(((!(dUmWm^^dWm)&&(!uUmWm^^uWm)||(uUmWm&&uWm))&&dUm&&!uUm) || (((!dUm^^dUmWm)&&!(uUm^^uUmWm)||(uUm&&uUmWm))&&dWm&&!uWm)))+
	// 		step(uvw.x,BBB)*step(AAA,uvw.z)*float(!(((!(dUmWp^^dWp)&&(!uUmWp^^uWp)||(uUmWp&&uWp))&&dUm&&!uUm) || (((!dUm^^dUmWp)&&!(uUm^^uUmWp)||(uUm&&uUmWp))&&dWp&&!uWp)))+
	// 		step(AAA,uvw.y)*step(AAA,uvw.z)*float(!(((!(dVpWp^^dWp)&&(!uVpWp^^uWp)||(uVpWp&&uWp))&&dVp&&!uVp) || (((!dVp^^dVpWp)&&!(uVp^^uVpWp)||(uVp&&uVpWp))&&dWp&&!uWp)))+
	// 		step(AAA,uvw.y)*step(uvw.z,BBB)*float(!(((!(dVpWm^^dWm)&&(!uVpWm^^uWm)||(uVpWm&&uWm))&&dVp&&!uVp) || (((!dVp^^dVpWm)&&!(uVp^^uVpWm)||(uVp&&uVpWm))&&dWm&&!uWm)))+
	// 		step(uvw.y,BBB)*step(uvw.z,BBB)*float(!(((!(dVmWm^^dWm)&&(!uVmWm^^uWm)||(uVmWm&&uWm))&&dVm&&!uVm) || (((!dVm^^dVmWm)&&!(uVm^^uVmWm)||(uVm&&uVmWm))&&dWm&&!uWm)))+
	// 		step(uvw.y,BBB)*step(AAA,uvw.z)*float(!(((!(dVmWp^^dWp)&&(!uVmWp^^uWp)||(uVmWp&&uWp))&&dVm&&!uVm) || (((!dVm^^dVmWp)&&!(uVm^^uVmWp)||(uVm&&uVmWp))&&dWp&&!uWp)));
	// }
	
	//环境光遮蔽：
	
	float AO = 
		mix(isTransparent(Wm), isTransparent(Wp),uvw.z) + 
		mix(
			mix(isTransparent(UmVm), isTransparent(UmVp),uvw.y) + 
			mix(isTransparent(UmWm), isTransparent(UmWp),uvw.z) +
			isTransparent(Um),

			mix(isTransparent(UpVm), isTransparent(UpVp),uvw.y) + 
			mix(isTransparent(UpWm), isTransparent(UpWp),uvw.z) +
			isTransparent(Up),
			uvw.x
		) +
		mix(
			mix(
				isTransparent(VmWm) + mix(isTransparent(UmVmWm), isTransparent(UpVmWm), uvw.x),
				isTransparent(VmWp) + mix(isTransparent(UmVmWp), isTransparent(UpVmWp), uvw.x),
				uvw.z
			) + isTransparent(Vm),
			mix(
				isTransparent(VpWm) + mix(isTransparent(UmVpWm), isTransparent(UpVpWm), uvw.x),
				isTransparent(VpWp) + mix(isTransparent(UmVpWp), isTransparent(UpVpWp), uvw.x),
				uvw.z
			) + isTransparent(Vp),
			uvw.y
		);
	AO *= 1.0 - clamp(light_Dir.y*2.0,0.0,1.0)*(0.9+N.y*0.1);
	float weight = clamp(5.0 - float(MC_GLASS),0.0,5.0)/5.0;
	float SO = weight * float(1 - MC_Shadow) * clamp(angleCos,0.0,1.0);// * clamp(-light_Dir.y*3.0,0.0,1.0);			
	uvw *= 8.0;
	// uvw *= 8.0;

	//texture3d coord
	vec2 pixel = vec2(uvw.x + float(int(uvw.z)*8+MC_DIR*64), 8.0-uvw.y + float((MC_ID-1)*8))/512.0;
	
	vec4 delta = abs(int1 - focusPos + N);
	vec3 flag = 1.0 - step(3.0,abs(uvw-vec3(4.0,4.0,4.0)));//abs(uvw+vec3(1.0,1.0,1.0)));
	vec3 sky = bgColor4;
		vec3 c = mix( MC_ID==0?
			mix(sunColor*2.0, sky, clamp(pow(dot(direct,light_Dir) + 1.0,0.2),0.0,1.0))
			:(texture2D(bloc,pixel).rgb*(SO * light_Density + (AO - 4.0)*0.05 + ambientLight)),//贴图颜色*光照
		//阳光 + 环境光遮蔽 + 环境光
		vec3(1.0,0.0,0.0),
		(MC_ID==0)?0.0:((1.0-flag.x*flag.y*flag.z)*step(delta.x+delta.y+delta.z+delta.w,0.4)+wireFrame) //与外面红框混合
	);
	return mix(
		(vec3(1.0) - vec3(1.0,0.4,0.6) * (1.0 - weight)) * c,//mix glass
		sky, 1.0 - exp(-0.01*DISTANCE)//mix fog
	);
}
void main(void) {
	Prel = floor(vec4(chunkCenter.x,0.0,chunkCenter.yz)/4.0)*4.0;
	int MC_ID;
	vec3 color1 = raytracing(coord4, MC_ID);
	
	if((abs(coord.x)<0.08 || abs(coord.y)<0.08 || abs(coord.z)<0.08)&&(abs(coord.x)<0.5 && abs(coord.y)<0.5)){
		gl_FragColor=vec4(vec3(1.0,1.0,1.0)-color1.rgb,1.0);
	}else{
		gl_FragColor=vec4(
			pow(color1.rgb,vec3(0.6)),//,flow*0.8
			clamp(
				flow*0.8+5.0*(1.-smoothstep(4.0,12.0,DISTANCE))*clamp(wireFrame*float(MC_ID),0.0,1.0)
				,0.0
				,1.0
			)
		);
	}
	
}
`