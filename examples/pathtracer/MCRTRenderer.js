var MCRTRenderer4 = function(ctxt, world, camera){
    this.ctxt = ctxt;
    this.width = ctxt.canvas.height;
    this.world = world;
    this.camera = camera;
    this.imageData = this.ctxt.createImageData(this.width,this.width);
    this.pixelBuffer = this.createPixelBuffer();
    this.resolutionStep = 1/(this.width>>1);
    this.initUniforms();
    this.pixel_z = 0.3;//切片位置(-1 - +1)
    // TerrainGen.TerrainConfig.riverLevel = 5;
}
MCRTRenderer4.prototype.createPixelBuffer = function(){
    var pb = [];
    for(var i = 0; i<this.width; i++){
        pb.push([]);
        for(var j = 0; j<this.width; j++){
            pb[i].push([0,0,0]);
        }
    }
    return pb;
}
MCRTRenderer4.prototype.putPixelBuffer = function(pb){
    var offset = 0;
    var data = this.imageData.data;
    var width = this.width;
    for(var i = 0; i<width; i++){
        for(var j = 0; j<width; j++){
            data[offset++] = pb[i][j][0]*256;
            data[offset++] = pb[i][j][1]*256;
            data[offset++] = pb[i][j][2]*256;
            data[offset++] = 255;
        }
    }
    this.ctxt.putImageData(this.imageData,0,0);
}
MCRTRenderer4.prototype.initUniforms = function(){
    var M = new Bivec(-0.2,0,0.1,0,0,1.57).expQ();
    var N = new Bivec(0,0,0,0,1.5,0).expQ();
    this.camera.rotation[0] = M[0].mul(N[0]);
    this.camera.rotation[1] = N[1].mul(M[1]);
    var cameraMat = this.camera.coordMat().t();
    this.camera.fov = 67;
    var focuslength = 1/Math.tan(this.camera.fov/180*Math.PI/2);
    this.camera.r = cameraMat.mul(new Vec4(1,0,0,0)).norm();
    this.camera.u = cameraMat.mul(new Vec4(0,1,0,0)).norm();
    this.camera.biais = cameraMat.mul(new Vec4(0,0,this.pixel_z,focuslength));
    this.sunPos = new Vec4(-1.9,0.3,0.0,1.4).norm();
    this.samples = 3;
    this.explosure = 0.3;
    this.sunSize = Math.PI/180*3;

    this.STATE_AIR = 0;
    this.STATE_WATER = 1;
    this.STATE_LEAVES = 2;
    this.water_id = 8;
    this.leave_id = 5;
    this.glass_id = 30;
    this.leave_mask_id = 26;
    this.waterPerlin0 = new Perlin3(1);
    this.waterPerlin1 = new Perlin3(2);
    this.waterPerlin2 = new Perlin3(3);
    this.waterPerlin3 = new Perlin3(4);
    
}
MCRTRenderer4.prototype.render = function(){
    this.ExplosureCoeff = this.explosure/this.samples;
    this.sunSizeCosine = Math.sqrt(1 - this.sunSize*this.sunSize);
    this.camera.position.add(this.camera.r.mul(25,false));
    this.renderLine(1,0);
    //for(var pixel_y = 1, pixel_y_index = 0; pixel_y_index<this.width; pixel_y-=resolutionStep, pixel_y_index++){
    //}
}
MCRTRenderer4.prototype.renderLine = function(pixel_y,pixel_y_index){
    var resolutionStep = this.resolutionStep, camera = this.camera, samples = this.samples;
    if(true||pixel_y_index>620){
        var ray_o = new Vec4();
        var ray_r;
        var glFragColorY = this.pixelBuffer[pixel_y_index];
        for(var pixel_x = -1, pixel_x_index = 0; pixel_x_index<this.width; pixel_x+=resolutionStep, pixel_x_index++){
            var glFragColor = glFragColorY[pixel_x_index];
            ray_o.set(camera.position);
            ray_r = camera.r.mul(pixel_x+Math.random()*resolutionStep/2,false).add(camera.u.mul(pixel_y+Math.random()*resolutionStep/2,false).add(camera.biais)).norm();
            var ncolor = [0,0,0];
            for(var sample = 0; sample<samples; sample++){
                this.radiance(ncolor,ray_o, ray_r, 0, this.STATE_AIR);
                glFragColor[0] += ncolor[0];
                glFragColor[1] += ncolor[1];
                glFragColor[2] += ncolor[2];
            }
            glFragColor[0] *= this.ExplosureCoeff;
            glFragColor[1] *= this.ExplosureCoeff;
            glFragColor[2] *= this.ExplosureCoeff;
            ACESFilm(glFragColor);
        }
        this.putPixelBuffer(this.pixelBuffer);
    }
    pixel_y-=resolutionStep, pixel_y_index++;
    if(pixel_y_index<this.width)
        window.requestAnimationFrame(this.renderLine.bind(this,pixel_y,pixel_y_index));
 }


MCRTRenderer4.prototype.radiance = function(glFragColor,ray_o, ray_r, depth, state){
    if(depth>7) return;
    var sunPos = this.sunPos;
    var pos = this.rayCast(ray_o, ray_r.mul(10000,false).add(ray_o),state);
    if(!pos){
        var color = (Math.tanh(ray_r.y*4 - 1) + 0.9);
        var atm = Math.pow(1 - ray_r.y*ray_r.y + ray_r.y*0.3,32)*0.2;
        var sunangle = ray_r.dot(sunPos);
        var sun = (sunangle>this.sunSizeCosine?10:sunangle>0?Math.pow(sunangle,32)/5:0);
        glFragColor[0] = color*0.2 + atm*6 + sun*2;
        glFragColor[1] = color*0.3 + atm*4 + sun*1.5;
        glFragColor[2] = color*0.4 + atm*2 + sun*1.2;
    }else{
        var d = pos.direction;
        var N = d == 1? new Vec4(0,-1,0,0): d == 0? new Vec4(0,1,0,0): d == 3? new Vec4(0,0,-1,0): d == 2? new Vec4(0,0,1,0): d == 5? new Vec4(-1,0,0,0): d == 4? new Vec4(1,0,0,0): d == 7? new Vec4(0,0,0,-1): new Vec4(0,0,0,1);
        N.sub();
        if(state == this.STATE_AIR && (pos.id == this.water_id||pos.id == this.glass_id)){
            var NewN;
            if(pos.id == this.water_id){
                var px = pos.point.x*4*0.4+0.25;
                var py = pos.point.y*3*0.4+0.25;
                var pz = pos.point.z*3*0.4+0.25;
                var pt = pos.point.t*7*0.4+0.25;
                var pertub = new Vec4(
                    this.waterPerlin0.value(py*1.4,pz,pt),
                    this.waterPerlin1.value(px+pz/2,pz,pt),
                    this.waterPerlin2.value(px,py*2.8,pt),
                    this.waterPerlin3.value(px,py,pz*1.61)
                ).mul(0.02);
                NewN = N.add(pertub,false).norm();
            }else{
                NewN = N;
            }
            var COS = NewN.dot(ray_r);
            const η = 1/1.1;
            const f0 = (1-η)*(1-η)/(1+η)/(1+η);
            var fresnel = 0;//f0 + (1-f0)*Math.pow(1 - Math.abs(COS),5);
            if(fresnel > Math.random()){
                var nr = NewN.mul(2*COS,false).sub(ray_r).sub();
                var new_o = pos.point.add(N.mul(0.000001,false)).sub(new Vec4(0.5,0.5,0.5,0.5));
                this.radiance(glFragColor,new_o, nr, depth+1, state);
            }else{
                //var nr = ray_r.add(pertub.mul(1),false).norm();
                
                var sqr = 1 - η * η * (1 - COS*COS);
                if(sqr>0){
                    var nr = ray_r.sub(NewN.mul(-COS,false),false).mul(η).add(NewN.mul(-Math.sqrt(sqr),false));
                    var new_o = pos.point.add(N.mul(-0.000001,false)).sub(new Vec4(0.5,0.5,0.5,0.5));
                    this.radiance(glFragColor,new_o, nr, depth+1, this.STATE_WATER);
                    glFragColor[0] *= 0.4;
                    glFragColor[1] *= 0.55;
                    glFragColor[2] *= 0.6;
                }
            }
        }else if(state == this.STATE_WATER && pos.id == 0){
            //var pertub = new Vec4(this.waterPerlin0.value(py,pz,pt),this.waterPerlin1.value(px,pz,pt),this.waterPerlin2.value(px,py,pt),this.waterPerlin3.value(px,py,pz)).mul(0.01);
            var nr = ray_r;//.add(pertub,false).norm();
            var new_o = pos.point.add(N.mul(-0.000001,false)).sub(new Vec4(0.5,0.5,0.5,0.5));
            this.radiance(glFragColor,new_o, nr, depth+1, this.STATE_AIR);
        }else{
            var tx, ty, tz;
            if(d<2){
                tx = pos.point.x - Math.floor(pos.point.x);
                ty = pos.point.z - Math.floor(pos.point.z);
                tz = pos.point.t - Math.floor(pos.point.t);
            }else if(d<4){
                tx = pos.point.x - Math.floor(pos.point.x);
                ty = pos.point.y - Math.floor(pos.point.y);
                tz = pos.point.t - Math.floor(pos.point.t);
            }else if(d<6){
                tx = pos.point.z - Math.floor(pos.point.z);
                ty = pos.point.y - Math.floor(pos.point.y);
                tz = pos.point.t - Math.floor(pos.point.t);
            }else{
                tx = pos.point.x - Math.floor(pos.point.x);
                ty = pos.point.y - Math.floor(pos.point.y);
                tz = pos.point.z - Math.floor(pos.point.z);
            }
            var color, alpha = false;
            /*if((state == this.STATE_AIR && pos.id == this.leave_id)||(state == this.STATE_LEAVES && pos.id == 0)){
                color = this.blocTxt[this.leave_mask_id-1][(d<<3)+Math.floor(tz*7.9999)][Math.floor((1-ty)*7.9999)][Math.floor(tx*7.9999)];
                if(color){
                    color = this.blocTxt[this.leave_id-1][(d<<3)+Math.floor(tz*7.9999)][Math.floor((1-ty)*7.9999)][Math.floor(tx*7.9999)];
                }else{
                    alpha = true;
                    var new_o = pos.point.add(N.mul(-0.000001,false)).sub(new Vec4(0.5,0.5,0.5,0.5));
                    this.radiance(glFragColor,new_o, ray_r, depth, state == this.STATE_AIR ? this.STATE_LEAVES : this.STATE_AIR);
                    return;
                }
            }else{*/
            color = this.blocTxt[pos.id-1][(d<<3)+Math.floor(tz*7.9999)][Math.floor((1-ty)*7.9999)][Math.floor(tx*7.9999)];
            //}
            
            var a = Math.random();
            var b = Math.random();
            var c = Math.asin(Math.sqrt(Math.random()));
            var sin_c = Math.sin(c);
            var cos_c = Math.cos(c);
            //var c = -N.dot(sunPos);
            var uniformS3 = new Vec4(
                sin_c*Math.cos(a),
                sin_c*Math.sin(a),
                cos_c*Math.cos(b),
                cos_c*Math.sin(b)
            );
            var nr = uniformS3.add(N,false).norm();
                
            //MCWorld.ColorTable[pos.id];
            var albedo_r = (color >> 16)/256 + 0.01;
            var albedo_g = ((color >> 8)&0xFF)/256 + 0.01;
            var albedo_b = (color&0xFF)/256 + 0.01;
        
            var new_o = pos.point.add(N.mul(0.000001,false)).sub(new Vec4(0.5,0.5,0.5,0.5));
            this.radiance(glFragColor,new_o, nr, depth+1, state);
            if(!this.rayCast(new_o, this.sunPos.mul(10000,false).add(new_o).add(uniformS3.mul(10000*this.sunSize)),state==this.STATE_WATER || state==this.STATE_LEAVES?this.STATE_SUN:state)){
                var COS = N.dot(sunPos)/2;
                glFragColor[0] += 18*COS;
                glFragColor[1] += 5*COS;
                glFragColor[2] += 2*COS;
            }
            glFragColor[0] *= albedo_r/Math.PI;
            glFragColor[1] *= albedo_g/Math.PI;
            glFragColor[2] *= albedo_b/Math.PI;
        }
    }
}
function ACESFilm(glFragColor){
    const a = 2.51;
    const b = 0.03;
    const c = 2.43;
    const d = 0.59;
    const e = 0.14;
    var x = glFragColor[0], y = glFragColor[1], z = glFragColor[2]; 
    x = x>0?x:0; y = y>0?y:0; z = z>0?z:0;
    x = Math.min(Math.max((x*(a*x + b)) / (x*(c*x + d) + e), 0.0), 1.0);
    y = Math.min(Math.max((y*(a*y + b)) / (y*(c*y + d) + e), 0.0), 1.0);
    z = Math.min(Math.max((z*(a*z + b)) / (z*(c*z + d) + e), 0.0), 1.0);
    glFragColor[0] = (x<0.0031308) ? x*12.92 : Math.pow(x, 1.0 / 2.4) * 1.055 - 0.055;
    glFragColor[1] = (y<0.0031308) ? y*12.92 : Math.pow(y, 1.0 / 2.4) * 1.055 - 0.055;
    glFragColor[2] = (z<0.0031308) ? z*12.92 : Math.pow(z, 1.0 / 2.4) * 1.055 - 0.055;
}

MCRTRenderer4.prototype.rayCast = function(s, e, state){
    // 终点方块坐标
    var half = new Vec4(0.5,0.5,0.5,0.5);
    var range = (x,z,t)=>(Math.abs(x-this.camera.position.x)<500&&Math.abs(t-this.camera.position.t-450)<500&&Math.abs(z-this.camera.position.z)<500);
    //var range = (x,z,t)=>(Math.abs(x)<2000&&Math.abs(t-1000)<2400&&Math.abs(z-2)<Math.max(2,10-Math.abs(t)));
	var start = s.add(half,false);
	var end = e.add(half,false);
	var intX2 = Math.floor(end.x);
	var intY2 = Math.floor(end.y);
	var intZ2 = Math.floor(end.z);
	var intT2 = Math.floor(end.t);
	// 起点(当前)方块坐标
	var intX1 = Math.floor(start.x);
	var intY1 = Math.floor(start.y);
	var intZ1 = Math.floor(start.z);
	var intT1 = Math.floor(start.t);

	// 检测起点方块
	var id = this.world.getBlockId(intX1, intY1, intZ1, intT1, range);
	if(state == this.STATE_AIR && id > 0){
        return null;//摄像机埋在了方块内，也忽略，但不继续算后面方块
    }else if(state == this.STATE_WATER && (id != this.water_id && id != this.glass_id)){
        return null;//水中的光线但出发不是水！
    }else if(state == this.STATE_LEAVES && id != this.leave_id){
        return null;//树叶中的光线但出发不是树叶！
    }

	var count = MCWorld.MaxIntersectBlock; // 最多检测30个方块

	while (count-- >= 0) {
		
		// 检测了终点方块
		if (intX1 == intX2 && intY1 == intY2 && intZ1 == intZ2 && intT1 == intT2){
			return null;
		}

		// 起点(当前)方块和终点方块XYZ不同(向某方向选了候选方块)
		var Xchanged = true;
		var Ychanged = true;
		var Zchanged = true;
		var Tchanged = true;
		// 各方向候选方块坐标
		var newX;
		var newY;
		var newZ;
		var newT;

		// 尝试向X方向选候选方块
		if (intX2 > intX1)
			newX = intX1 + 1;
		else if (intX2 < intX1)
			newX = intX1;
		else
			Xchanged = false;

		if (intY2 > intY1)
			newY = intY1 + 1;
		else if (intY2 < intY1)
			newY = intY1;
		else
			Ychanged = false;
		
		if (intZ2 > intZ1)
			newZ = intZ1 + 1;
		else if (intZ2 < intZ1)
			newZ = intZ1;
		else
			Zchanged = false;

		if (intT2 > intT1)
			newT = intT1 + 1;
		else if (intT2 < intT1)
			newT = intT1;
		else
			Tchanged = false;

		// 各方向候选方块离起点(当前)有多近，初始化为很大的数
		var Xt = Infinity;
		var Yt = Infinity;
		var Zt = Infinity;
		var Tt = Infinity;
		var dX = end.x - start.x;
		var dY = end.y - start.y;
		var dZ = end.z - start.z;
		var dT = end.t - start.t;

		// 向X方向选了候选方块
		if (Xchanged)
			Xt = (newX - start.x) / dX;
		if (Ychanged)
			Yt = (newY - start.y) / dY;
		if (Zchanged)
			Zt = (newZ - start.z) / dZ;
		if (Tchanged)
			Tt = (newT - start.t) / dT;

		// 最终选了哪个方向的候选方块
		var direction;

		// 选出候选方块中离起点(当前)最近的，更新起点、要检测的方块坐标
		if (Xt < Yt && Xt < Zt && Xt < Tt){
			if (intX2 > intX1)
				direction = 4;
			else
				direction = 5;

			start.x = newX;
			start.y += dY * Xt;
			start.z += dZ * Xt;
			start.t += dT * Xt;
		}else if (Yt < Zt && Yt < Tt){
			if (intY2 > intY1)
				direction = 0;
			else
				direction = 1;

			start.x += dX * Yt;
			start.y = newY;
			start.z += dZ * Yt;
			start.t += dT * Yt;
		}else if (Zt < Tt){
			if (intZ2 > intZ1)
				direction = 2;
			else
				direction = 3;

			start.x += dX * Zt;
			start.y += dY * Zt;
			start.z = newZ;
			start.t += dT * Zt;
		}else{
			if (intT2 > intT1)
				direction = 6;
			else
				direction = 7;

			start.x += dX * Tt;
			start.y += dY * Tt;
			start.z += dZ * Tt;
			start.t = newT;
		}

		intX1 = Math.floor(start.x);

		if (direction == 5) // X-方向
		{
			// MC以方块内各轴最小坐标为方块坐标，这里得到的是X上最大坐标所以要-1
			--intX1;
		}

		intY1 = Math.floor(start.y);

		if (direction == 1) // Y-方向
		{
			--intY1;
		}

		intZ1 = Math.floor(start.z);

		if (direction == 3) // Z-方向
		{
			--intZ1;
		}
		intT1 = Math.floor(start.t);
		if (direction == 7) // T-方向
		{
			--intT1;
		}
		if (intY1>=32 && direction == 0) // Y+方向
		{
			return null;
		}
		// 检测新起点方块
        id = this.world.getBlockId(intX1, intY1, intZ1, intT1, range);//强制加载区块读取
        //树叶alpha穿透：
        if((state == this.STATE_AIR && id == this.leave_id)||(state == this.STATE_LEAVES && id == 0)){
            var tx, ty, tz;
            var d = direction;
            if(d<2){
                tx = start.x - Math.floor(start.x);
                ty = start.z - Math.floor(start.z);
                tz = start.t - Math.floor(start.t);
            }else if(d<4){
                tx = start.x - Math.floor(start.x);
                ty = start.y - Math.floor(start.y);
                tz = start.t - Math.floor(start.t);
            }else if(d<6){
                tx = start.z - Math.floor(start.z);
                ty = start.y - Math.floor(start.y);
                tz = start.t - Math.floor(start.t);
            }else{
                tx = start.x - Math.floor(start.x);
                ty = start.y - Math.floor(start.y);
                tz = start.z - Math.floor(start.z);
            }
            var color = this.blocTxt[this.leave_mask_id-1][(d<<3)+Math.floor(tz*7.9999)][Math.floor((1-ty)*7.9999)][Math.floor(tx*7.9999)];
            if(color){
                return {position: new Vec4(intX1, intY1, intZ1, intT1),direction:direction,id:this.leave_id,point:start};
            }
            state = state == this.STATE_LEAVES?this.STATE_AIR:this.STATE_LEAVES;
        }else if(state == this.STATE_AIR){
            if(id >0) return {position: new Vec4(intX1, intY1, intZ1, intT1),direction:direction,id:id,point:start};
        }else if(state == this.STATE_WATER){
            if(id>-1000 && (id != this.water_id&&id != this.glass_id)) return {position: new Vec4(intX1, intY1, intZ1, intT1),direction:direction,id:id,point:start};
        }else if(state == this.STATE_LEAVES){
            if(id>-1000 && id != this.leave_id) return {position: new Vec4(intX1, intY1, intZ1, intT1),direction:direction,id:id,point:start};
        }else if(state == this.STATE_SUN){
            if(!(id == 0 || id == this.leave_id || id == this.water_id||id == this.glass_id)) return {position: new Vec4(intX1, intY1, intZ1, intT1),direction:direction,id:id,point:start};
        }

		//所有非空气方块
	}
}