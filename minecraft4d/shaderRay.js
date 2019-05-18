MCRTRenderer4ShaderRaycastMCCode = `
void raycastMC(vec4 s, vec4 e){
	// 终点方块坐标
	vec4 semi = vec4(0.5000,0.5000,0.5000,0.5000);
	vec4 start = s + semi;
	vec4 end = e + semi;
	
	vec4 int2;
	vec4 int1 = (floor(start));
	
	float found = 0.0;
	// 检测起点方块
	//if(id > 0) return null; //摄像机埋在了方块内，也忽略，但不继续算后面方块
	for (int count = 0; count < 60; count++){
		int2 = (floor(end));
		
		// 起点(当前)方块和终点方块XYZ不同(向某方向选了候选方块)
		vec4 changed = clamp(step(int1,int2-0.2) + step(int2,int1-0.2),0.0,1.0);
		// 各方向候选方块坐标
		vec4 new = int1 + step(int1,int2);
		vec4 d = end - start;
		// 向X方向选了候选方块
		vec4 Pt = (new - start)/d + (vec4(1.0,1.0,1.0,1.0)-changed)*1000.0;
		// 最终选了哪个方向的候选方块
		
		float minCoord = min(min(Pt.x,Pt.y),min(Pt.z,Pt.w))+0.00000001;
		start += d*minCoord;
		// 选出候选方块中离起点(当前)最近的，更新起点、要检测的方块坐标
		start = mix(new,start,step(minCoord,Pt));
		vec4 who = vec4(1.0,1.0,1.0,1.0)-step(minCoord,Pt);
		float direction = dot(
			(vec4(5.0,1.0,3.0,7.0)-step(int1,int2)),
			who
		); 
		int1 = (floor(start));
		int1.x -= step(4.9,direction)*step(direction,5.1);
		int1.y -= step(0.9,direction)*step(direction,1.1);
		int1.z -= step(2.9,direction)*step(direction,3.1);
		int1.w -= step(6.9,direction)*step(direction,7.1);
		// 检测新起点方块
		float ID = getID(int1)*256.0 +0.5;
		found = found + step(0.6,ID);
		float firstFound = step(0.5,found)*step(found,1.5)*step(0.6,ID);
		MC_ID = int(mix(float(MC_ID)+0.5,ID,firstFound));
		MC_DIR = int(mix(float(MC_DIR)+0.5,direction+0.5,firstFound));
		MC_UV = mix(MC_UV,start,firstFound);
		end = mix(end,start - light*100.0,firstFound);
	}
	MC_SHADOW = step(found,1.5);
}

`;