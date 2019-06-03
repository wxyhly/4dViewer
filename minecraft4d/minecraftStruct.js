var MCStruct = {
	generate: function(fn,data, bx,bz,bt, cx,cz,ct,list){
		//fn: generateFn, data:currentChunkData, uuid: structName, bxzt: structPos(absolute), cxzt:currentChunk(absolute)
		var size = fn(data,bx,bz,bt,cx,cz,ct,list);
		//var size = obj.size;
		if(!(size.xn<=cx-bx && size.xp>=cx-bx && size.zn<=cz-bz && size.zp>=cz-bz && size.tn<=ct-bt && size.tp>=ct-bt))
			return null;//out of range
	},
	list:{},
	chunkList:{},
	setBlock: function(id, x,y,z,t){
		if(x>=0&&y>=0&&z>=0&&t>=0&&x<MCChunk.SIZE&&y<MCChunk.SIZE_Y&&z<MCChunk.SIZE&&t<MCChunk.SIZE){
			MCStruct.currentData[x+((y+((z+(t<<2))<<5))<<2)] = id;
		}
	},
	currentData:null,
	get: function(x,y,z,t){
		if(x>=0&&y>=0&&z>=0&&t>=0&&x<MCChunk.SIZE&&y<MCChunk.SIZE_Y&&z<MCChunk.SIZE&&t<MCChunk.SIZE){
			return MCStruct.currentData[x+((y+((z+(t<<2))<<5))<<2)];
		}
		return null;
	},
	set: function(id,x1,y1,z1,t1,x2,y2,z2,t2,lock){//id can be int or function
		var data = MCStruct.currentData;
		var xm = Math.max(0,Math.min(x1,x2)), xp = Math.min(MCChunk.SIZE-1,Math.max(x1,x2));
		var ym = Math.max(0,Math.min(y1,y2)), yp = Math.min(MCChunk.SIZE_Y-1,Math.max(y1,y2));
		var zm = Math.max(0,Math.min(z1,z2)), zp = Math.min(MCChunk.SIZE-1,Math.max(z1,z2));
		var tm = Math.max(0,Math.min(t1,t2)), tp = Math.min(MCChunk.SIZE-1,Math.max(t1,t2));
		for(var x = xm; x<=xp; x++){
			for(var y = ym; y<=yp; y++){
				for(var z = zm; z<=zp; z++){
					for(var t = tm; t<=tp; t++){
						if(typeof id == "number" || !id){
							data[x+((y+((z+(t<<2))<<5))<<2)] = id//;(id, x,y,z,t,lock);
						}else{
							data[x+((y+((z+(t<<2))<<5))<<2)] = id(x,y,z,t)//, x,y,z,t,lock);
						}
					}
				}
			}
		}
	},
	hset: function(id,x1,y1,z1,t1,x2,y2,z2,t2,hid){//hollow set(to save time)
		var data = MCStruct.currentData;
		var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
		var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
		var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
		var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
		var xm1 = Math.max(0,xm), xp1 = Math.min(MCChunk.SIZE-1  ,xp);
		var ym1 = Math.max(0,ym), yp1 = Math.min(MCChunk.SIZE_Y-1,yp);
		var zm1 = Math.max(0,zm), zp1 = Math.min(MCChunk.SIZE-1  ,zp);
		var tm1 = Math.max(0,tm), tp1 = Math.min(MCChunk.SIZE-1  ,tp);
		//var hid = typeof lock=="number";
		for(var x = xm1; x<=xp1; x++){
			var hx = x==xm||x==xp;
			for(var y = ym1; y<=yp1; y++){
				var hy = y==ym||y==yp;
				for(var z = zm1; z<=zp1; z++){
					var hz = z==zm||z==zp;
					for(var t = tm1; t<=tp1; t++){
						var ht = t==tm||t==tp;
						if(hx||hy||hz||ht){
							if(typeof id == "number" || !id){
								data[x+((y+((z+(t<<2))<<5))<<2)] = id;
							}else{
								data[x+((y+((z+(t<<2))<<5))<<2)] = id(x,y,z,t);
							}
						}else if(hid){
							data[x+((y+((z+(t<<2))<<5))<<2)] = hid;
						}
					}
				}
			}
		}
	},
	h2set: function(id,x1,y1,z1,t1,x2,y2,z2,t2,hid){//hollow set(to save time)
		var data = MCStruct.currentData;
		var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
		var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
		var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
		var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
		var xm1 = Math.max(0,xm), xp1 = Math.min(MCChunk.SIZE-1  ,xp);
		var ym1 = Math.max(0,ym), yp1 = Math.min(MCChunk.SIZE_Y-1,yp);
		var zm1 = Math.max(0,zm), zp1 = Math.min(MCChunk.SIZE-1  ,zp);
		var tm1 = Math.max(0,tm), tp1 = Math.min(MCChunk.SIZE-1  ,tp);
		for(var x = xm1; x<=xp1; x++){
			var hx = x==xm||x==xp;
			for(var y = ym1; y<=yp1; y++){
				var hy = y==ym||y==yp;
				for(var z = zm1; z<=zp1; z++){
					var hz = z==zm||z==zp;
					for(var t = tm1; t<=tp1; t++){
						var ht = t==tm||t==tp;
						if((hx&&hy)||(hx&&hz)||(hx&&ht)||(hy&&hz)||(hy&&ht)||(ht&&hz)){
							if(typeof id == "number" || !id){
								data[x+((y+((z+(t<<2))<<5))<<2)] = id;
							}else{
								data[x+((y+((z+(t<<2))<<5))<<2)] = id(x,y,z,t);
							}
						}else if(hid){
							data[x+((y+((z+(t<<2))<<5))<<2)] = hid;
						}
					}
				}
			}
		}
	},
	repl: function(id,x1,y1,z1,t1,x2,y2,z2,t2,lock){//id can be int or function
		var data = MCStruct.currentData;
		var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
		var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
		var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
		var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
		var xm1 = Math.max(0,xm), xp1 = Math.min(MCChunk.SIZE-1  ,xp);
		var ym1 = Math.max(0,ym), yp1 = Math.min(MCChunk.SIZE_Y-1,yp);
		var zm1 = Math.max(0,zm), zp1 = Math.min(MCChunk.SIZE-1  ,zp);
		var tm1 = Math.max(0,tm), tp1 = Math.min(MCChunk.SIZE-1  ,tp);
		for(var x = xm1; x<=xp1; x++){
			for(var y = ym1; y<=yp1; y++){
				for(var z = zm1; z<=zp1; z++){
					for(var t = tm1; t<=tp1; t++){
						var i = x+((y+((z+(t<<2))<<5))<<2);
						var d = data[i];
						if(typeof id=="number" && d){
							data[i] = id;
						}else{
							data[i] = id(d);
						}
					}
				}
			}
		}
	},
}
MCStruct.city1 = function(seed,terrain, data,bx,bz,bt,cx,cz,ct,list){
	var seed1 = Math.floor(Math.sin((seed+(bx<<2)+(bz<<6)+(bt<<11))*1352.3)*75264224);
	if(!list[bx+","+bz+","+bt])list[bx+","+bz+","+bt] = {};
	var sublist = list[bx+","+bz+","+bt];
	for(var x = -1; x<=1; x++){
	for(var z = -1; z<=1; z++){
	for(var t = -1; t<=1; t++){
		var _seed = Math.floor(Math.sin((seed1/1332+(x<<2)+(z<<6)+(t<<11))*1352.3)*85264224);
		if(_seed%31<(seed1%7)+20-(x*x+z*z+t*t)){
			var px = (x+1)*18+18+(seed1%3)*6;
			var pz = (z+1)*18+24+(seed1%3)*6;
			var pt = (t+1)*18+24+(seed1%3)*6;
			//if(!list[px+","+pz+","+pt])list[px+","+pz+","+pt] = {};
			MCStruct.generate(MCStruct.building1.bind(null, px,pz,pt,_seed,terrain),data, bx,bz,bt,cx,cz,ct,sublist);
		}
	}
	}
	}
	return {
		xn: 0,
		xp: 32,
		zn: 0,
		zp: 32,
		tn: 0,
		tp: 32
	}
}
MCStruct.building1 = function(px,pz,pt,seed,terrain, data, bx,bz,bt, cx,cz,ct,list){
	//MCStruct.currentL = L;
	var s = 6, h = 5;//size and height of room
	var rnd = Math.floor(seed*Math.PI*2346241);
	MCStruct.currentData = data;
	function chambre(x00,z00,t00){
		//console.log("chamber "+x+" "+z+" "+t+" of "+rx+" "+rz+" "+rt);
		x = (bx-cx)*MCChunk.SIZE+x00*s+px;
		z = (bz-cz)*MCChunk.SIZE+z00*s+pz;
		t = (bt-ct)*MCChunk.SIZE+t00*s+pt;
		if(Math.abs(x)>s+2||Math.abs(z)>s+2||Math.abs(t)>s+2) return 0;
		TerrainGen.currentBlocInfo.building = true;
		var Info = terrain.getTerrain_Y(x+cx*MCChunk.SIZE+s/2,z+cz*MCChunk.SIZE+s/2,t+ct*MCChunk.SIZE+s/2,false);
		var _rnd = terrain.seed + (x+cx*MCChunk.SIZE)*12+ (z+cz*MCChunk.SIZE)*143+ (t+ct*MCChunk.SIZE)*37;
		//无房屋查重功能，必须生成一样
		if(Info.hill>1 || Info.riverDistance<0.11)return 0;
		var brickId = (Info.sand>0)?6:12;
		var terrainY = Info.Terrain_Y;
		var xn=Infinity;
		var xp=Infinity;
		var zn=Infinity;
		var zp=Infinity;
		var tn=Infinity;
		var tp=Infinity;
		//whether chamber lin:(detect bedRock bloc)	
		xn = (list[((x00-1)*s+px)+","+(z00*s+pz)+","+(t00*s+pt)] || xn)-terrainY;
		xp = (list[((x00+1)*s+px)+","+(z00*s+pz)+","+(t00*s+pt)] || xp)-terrainY;
		zn = (list[(x00*s+px)+","+((z00-1)*s+pz)+","+(t00*s+pt)] || zn)-terrainY;
		zp = (list[(x00*s+px)+","+((z00+1)*s+pz)+","+(t00*s+pt)] || zp)-terrainY;
		tn = (list[(x00*s+px)+","+(z00*s+pz)+","+((t00-1)*s+pt)] || tn)-terrainY;
		tp = (list[(x00*s+px)+","+(z00*s+pz)+","+((t00+1)*s+pt)] || tp)-terrainY;
		
		list[(x00*s+px)+","+(z00*s+pz)+","+(t00*s+pt)] = terrainY;
		//wall, floor and roof edge:
		var edgeH = terrainY+h+1;
		MCStruct.hset(brickId, x,terrainY,z,t, x+s,terrainY+h,z+s,t+s, 255);//chambre wall, 255 is for replace
		MCStruct.repl((id)=>(id==0)?10:id, x,edgeH,z,t, x+s,edgeH,z+s,t+s);//edge fill
		MCStruct.repl((id)=>(id!=255&&id!=brickId)?11:id, x-1,terrainY-1,z-1,t-1, x+s+1,terrainY-1,z+s+1,t+s+1);//bedRock
		s-=1;
		MCStruct.set( 0, x+1,edgeH,z+1,t+1, x+s,edgeH,z+s,t+s);//edge hollow
		MCStruct.set( 9, x+1,terrainY,z+1,t+1, x+s,terrainY,z+s,t+s);//floor
		s+=1;
		//cancel roof edge if connected:
		if(Math.abs(xp)<2) MCStruct.repl((id)=>id==10?0:id, x+s,edgeH,z+1,t+1, x+s,edgeH,z+s-1,t+s-1);
		if(Math.abs(xn)<2) MCStruct.repl((id)=>id==10?0:id, x  ,edgeH,z+1,t+1, x  ,edgeH,z+s-1,t+s-1);
		if(Math.abs(zp)<2) MCStruct.repl((id)=>id==10?0:id, x+1,edgeH,z+s,t+1, x+s-1,edgeH,z+s,t+s-1);
		if(Math.abs(zn)<2) MCStruct.repl((id)=>id==10?0:id, x+1,edgeH,z  ,t+1, x+s-1,edgeH,z  ,t+s-1);
		if(Math.abs(tp)<2) MCStruct.repl((id)=>id==10?0:id, x+1,edgeH,z+1,t+s, x+s-1,edgeH,z+s-1,t+s);
		if(Math.abs(tn)<2) MCStruct.repl((id)=>id==10?0:id, x+1,edgeH,z+1,t  , x+s-1,edgeH,z+s-1,t  );
		//stair:
		var dir;
		dir = (xp>9)?0:(zn>9)?3:(xn>9)?1:(tp>9)?4:(tn>9)?5:(zp>9)?1:-1;
		var F2 = false;
		if(dir>=0 && Math.abs(_rnd*3.323436)%5<2){
			function rotSet(id,x0,y0,z0,t0, x1,y1,z1,t1, dir){
				switch(dir){
					case 0: MCStruct.set(id,x+s-x0,y0+terrainY,z+z0  ,t+t0  ,  x+s-x1,y1+terrainY,z+z1  ,t+t1  );break;
					case 1: MCStruct.set(id,x+x0  ,y0+terrainY,z+z0  ,t+t0  ,  x+x1  ,y1+terrainY,z+z1  ,t+t1  );break;
					case 2: MCStruct.set(id,x+z0  ,y0+terrainY,z+s-x0,t+t0  ,  x+z1  ,y1+terrainY,z+s-x1,t+t1  );break;
					case 3: MCStruct.set(id,x+z0  ,y0+terrainY,z+x0  ,t+t0  ,  x+z1  ,y1+terrainY,z+x1  ,t+t1  );break;
					case 4: MCStruct.set(id,x+t0  ,y0+terrainY,z+z0  ,t+s-x0,  x+t1  ,y1+terrainY,z+z1  ,t+s-x1);break;
					case 5: MCStruct.set(id,x+t0  ,y0+terrainY,z+z0  ,t+x0  ,  x+t1  ,y1+terrainY,z+z1  ,t+x1  );break;
				}
			}
			rotSet(9, 1,1,1,3, 2,1,2,3, dir);
			rotSet(9, 1,2,1,4, 2,2,2,5, dir);
			rotSet(9, 1,3,3,4, 2,3,3,5, dir);
			rotSet(9, 1,4,4,4, 2,4,5,5, dir);
			rotSet(0, 1,5,1,4, 2,5,5,5, dir);
			if(Math.abs(_rnd*14237.03)%7<3){//二楼简易棚
				var top = edgeH+3;
				var bottom = edgeH+1;
				MCStruct.set(9, x,top+1,z,t,  x+s,top+1,z+s,t+s);//top shield
	
				MCStruct.set(brickId, x,bottom,z,t,  x,top,z,t);
				MCStruct.set(brickId, x+s,bottom,z,t,  x+s,top,z,t);
				MCStruct.set(brickId, x,bottom,z+s,t,  x,top,z+s,t);
				MCStruct.set(brickId, x+s,bottom,z+s,t,  x+s,top,z+s,t);
				MCStruct.set(brickId, x,bottom,z,t+s,  x,top,z,t+s);
				MCStruct.set(brickId, x+s,bottom,z,t+s,  x+s,top,z,t+s);
				MCStruct.set(brickId, x,bottom,z+s,t+s,  x,top,z+s,t+s);
				MCStruct.set(brickId, x+s,bottom,z+s,t+s,  x+s,top,z+s,t+s);
				F2 = true;
			}
		}
		//window:
		var fenetre = (_rnd%2)?1:0;
		_rnd = Math.floor(_rnd/2);
		var xph = (xp==0)?0:(xp==1)?0:(xp==-1)?-1:(xp==2)?1:(xp==-2)?-1:0;
		var xnh = (xn==0)?0:(xn==1)?0:(xn==-1)?-1:(xn==2)?1:(xn==-2)?-1:0;
		var zph = (zp==0)?0:(zp==1)?0:(zp==-1)?-1:(zp==2)?1:(zp==-2)?-1:0;
		var znh = (zn==0)?0:(zn==1)?0:(zn==-1)?-1:(zn==2)?1:(zn==-2)?-1:0;
		var tph = (tp==0)?0:(tp==1)?0:(tp==-1)?-1:(tp==2)?1:(tp==-2)?-1:0;
		var tnh = (tn==0)?0:(tn==1)?0:(tn==-1)?-1:(tn==2)?1:(tn==-2)?-1:0;
		
		if(_rnd%3!=0||Math.abs(xp)<3) MCStruct.set(0, x+s,terrainY+1+(xp!=0&&xp<5?xph:fenetre),z+3,t+3, x+s,terrainY+3+xph,z+4,t+4);
		_rnd = Math.floor(_rnd/2);                                                                                   
		if(_rnd%3!=0||Math.abs(xn)<3) MCStruct.set(0, x  ,terrainY+1+(xn!=0&&xn<5?xnh:fenetre),z+3,t+3, x  ,terrainY+3+xnh,z+4,t+4);
		_rnd = Math.floor(_rnd/2);                                                                                   
		                                                                                                           
		if(_rnd%3!=0||Math.abs(zp)<3) MCStruct.set(0, x+3,terrainY+1+(zp!=0&&zp<5?zph:fenetre),z+s,t+3, x+4,terrainY+3+zph,z+s,t+4);
		_rnd = Math.floor(_rnd/2);                                                                                   
		if(_rnd%3!=0||Math.abs(zn)<3) MCStruct.set(0, x+3,terrainY+1+(zn!=0&&zn<5?znh:fenetre),z  ,t+3, x+4,terrainY+3+znh,z  ,t+4);
		_rnd = Math.floor(_rnd/2);                                                                                   
		                                                                                                           
		if(_rnd%3!=0||Math.abs(tp)<3) MCStruct.set(0, x+3,terrainY+1+(tp!=0&&tp<5?tph:fenetre),z+3,t+s, x+4,terrainY+3+tph,z+4,t+s);
		_rnd = Math.floor(_rnd/2);                                                                                   
		if(_rnd%3!=0||Math.abs(tn)<3) MCStruct.set(0, x+3,terrainY+1+(tn!=0&&tn<5?tnh:fenetre),z+3,t  , x+4,terrainY+3+tnh,z+4,t  );
		
		if(!F2 && Math.abs(_rnd*1431.433)%4<1.5){
			terrainY = terrainY+h;
			edgeH = terrainY+h+1;
			fenetre = 1;
			MCStruct.hset(brickId, x,terrainY+1,z,t, x+s,terrainY+h,z+s,t+s, 255);//chambre wall
			MCStruct.repl((id)=>(id==0)?10:id, x,edgeH,z,t, x+s,edgeH,z+s,t+s);//edge fill
			s-=1;
			MCStruct.set(255, x+1,terrainY+1,z+1,t+1, x+s,terrainY+1,z+s,t+s, 255);//chambre wall remove bottom(deja)
			MCStruct.set( 0, x+1,edgeH,z+1,t+1, x+s,edgeH,z+s,t+s);//edge hollow
			s+=1;
			_rnd*=14321.4324523;
			_rnd = Math.round(_rnd);
			if(_rnd%3!=0||Math.abs(xp)<3) MCStruct.set(0, x+s,terrainY+1+(xp!=0&&xp<5?xph:fenetre),z+3,t+3, x+s,terrainY+3+xph,z+4,t+4);
			_rnd = Math.floor(_rnd/2);                                                                                   
			if(_rnd%3!=0||Math.abs(xn)<3) MCStruct.set(0, x  ,terrainY+1+(xn!=0&&xn<5?xnh:fenetre),z+3,t+3, x  ,terrainY+3+xnh,z+4,t+4);
			_rnd = Math.floor(_rnd/2);                                                                                   
																													   
			if(_rnd%3!=0||Math.abs(zp)<3) MCStruct.set(0, x+3,terrainY+1+(zp!=0&&zp<5?zph:fenetre),z+s,t+3, x+4,terrainY+3+zph,z+s,t+4);
			_rnd = Math.floor(_rnd/2);                                                                                   
			if(_rnd%3!=0||Math.abs(zn)<3) MCStruct.set(0, x+3,terrainY+1+(zn!=0&&zn<5?znh:fenetre),z  ,t+3, x+4,terrainY+3+znh,z  ,t+4);
			_rnd = Math.floor(_rnd/2);                                                                                   
																													   
			if(_rnd%3!=0||Math.abs(tp)<3) MCStruct.set(0, x+3,terrainY+1+(tp!=0&&tp<5?tph:fenetre),z+3,t+s, x+4,terrainY+3+tph,z+4,t+s);
			_rnd = Math.floor(_rnd/2);                                                                                   
			if(_rnd%3!=0||Math.abs(tn)<3) MCStruct.set(0, x+3,terrainY+1+(tn!=0&&tn<5?tnh:fenetre),z+3,t  , x+4,terrainY+3+tnh,z+4,t  );
		}
	}
	function jardin(x00,z00,t00,dir){
		if (dir ==1){
			var temp;
			temp = x00; x00 = z00; z00 = temp;
		}else if(dir==2){
			var temp;
			temp = x00; x00 = t00; t00 = temp;
		}
		x = (bx-cx)*MCChunk.SIZE+x00*s+px;
		z = (bz-cz)*MCChunk.SIZE+z00*s+pz;
		t = (bt-ct)*MCChunk.SIZE+t00*s+pt;
		if(Math.abs(x)>s+2||Math.abs(z)>s+2||Math.abs(t)>s+2) return 0;
		TerrainGen.currentBlocInfo.building = true;
		var Info = terrain.getTerrain_Y(x+cx*MCChunk.SIZE+s/2,z+cz*MCChunk.SIZE+s/2,t+ct*MCChunk.SIZE+s/2,false);
		var _rnd = terrain.seed + (x+cx*MCChunk.SIZE)*12+ (z+cz*MCChunk.SIZE)*143+ (t+ct*MCChunk.SIZE)*37;
		//无房屋查重功能，必须生成一样
		if(Info.hill>1 || Info.riverDistance<0.11)return 0;
		var terrainY = Info.Terrain_Y;
		MCStruct.h2set(11, x,terrainY,z,t, x+s,terrainY,z+s,t+s, 3);//ground
		
		var xn=Infinity;
		var xp=Infinity;
		var zn=Infinity;
		var zp=Infinity;
		var tn=Infinity;
		var tp=Infinity;
		xn = (list[((x00-1)*s+px)+","+(z00*s+pz)+","+(t00*s+pt)] || xn)-terrainY;
		xp = (list[((x00+1)*s+px)+","+(z00*s+pz)+","+(t00*s+pt)] || xp)-terrainY;
		zn = (list[(x00*s+px)+","+((z00-1)*s+pz)+","+(t00*s+pt)] || zn)-terrainY;
		zp = (list[(x00*s+px)+","+((z00+1)*s+pz)+","+(t00*s+pt)] || zp)-terrainY;
		tn = (list[(x00*s+px)+","+(z00*s+pz)+","+((t00-1)*s+pt)] || tn)-terrainY;
		tp = (list[(x00*s+px)+","+(z00*s+pz)+","+((t00+1)*s+pt)] || tp)-terrainY;
		var xph = (xp==0)?0:(xp==1)?0:(xp==-1)?-1:(xp==2)?1:(xp==-2)?-1:0;
		var xnh = (xn==0)?0:(xn==1)?0:(xn==-1)?-1:(xn==2)?1:(xn==-2)?-1:0;
		var zph = (zp==0)?0:(zp==1)?0:(zp==-1)?-1:(zp==2)?1:(zp==-2)?-1:0;
		var znh = (zn==0)?0:(zn==1)?0:(zn==-1)?-1:(zn==2)?1:(zn==-2)?-1:0;
		var tph = (tp==0)?0:(tp==1)?0:(tp==-1)?-1:(tp==2)?1:(tp==-2)?-1:0;
		var tnh = (tn==0)?0:(tn==1)?0:(tn==-1)?-1:(tn==2)?1:(tn==-2)?-1:0;
		var w = s-1;
		terrainY++;
		if(xn>2){
			MCStruct.set(5 ,  x,terrainY+1,z+1,t+1,  x,terrainY+1,z+w,t+w);
			MCStruct.set(11,  x,terrainY  ,z+1,t+1,  x,terrainY  ,z+w,t+w);
		}
		MCStruct.set(255 , x  ,terrainY+xnh,z+3,t+3, x,terrainY+2,z+4,t+4);
		if(xp>2){
			MCStruct.set(5 ,x+s,terrainY+1,z+1,t+1,x+s,terrainY+1,z+w,t+w);
			MCStruct.set(11,x+s,terrainY  ,z+1,t+1,x+s,terrainY  ,z+w,t+w);
		}
		MCStruct.set(255 , x+s,terrainY+xph,z+3,t+3, x+s,terrainY+2,z+4,t+4);
		if(zn>2){
			MCStruct.set(5 ,  x+1,terrainY+1,z,t+1,  x+w,terrainY+1,z,t+w);
			MCStruct.set(11,  x+1,terrainY  ,z,t+1,  x+w,terrainY  ,z,t+w);
		}
		MCStruct.set(255 , x+3,terrainY+znh,z,t+3, x+4,terrainY+2,z,t+4);
		if(zp>2){
			MCStruct.set(5 ,  x+1,terrainY+1,z+s,t+1, x+w,terrainY+1,z+s,t+w);
			MCStruct.set(11,  x+1,terrainY  ,z+s,t+1, x+w,terrainY  ,z+s,t+w);
		}
		MCStruct.set(255 , x+3,terrainY+zph,z+s,t+3, x+4,terrainY+2,z+s,t+4);
		if(tn>2){
			MCStruct.set(5 ,  x+1,terrainY+1,z+1,t,  x+w,terrainY+1,z+w,t);
			MCStruct.set(11,  x+1,terrainY  ,z+1,t,  x+w,terrainY  ,z+w,t);
		}
		MCStruct.set(255 , x+3,terrainY+tnh,z+3,t, x+4,terrainY+2,z+4,t);
		if(tp>2){
			MCStruct.set(5 ,  x+1,terrainY+1,z+1,t+s, x+w,terrainY+1,z+w,t+s);
			MCStruct.set(11,  x+1,terrainY  ,z+1,t+s, x+w,terrainY  ,z+w,t+s);
		}
		MCStruct.set(255 , x+3,terrainY+tph,z+3,t+s, x+4,terrainY+2,z+4,t+s);
	}
	if(rnd%5<3){//带花园的八合院x
		var dir = rnd%5;
		chambre(0 ,-1,0,dir);
		chambre(0,1,0,dir);
		chambre(0 ,0,-1,dir);
		chambre(0,0,1,dir);
		
		chambre(0 ,-1,-1,dir);
		chambre(0 ,1,-1,dir);
		chambre(0 ,-1,1,dir);
		chambre(0 ,1,1,dir);
		
		//附加房：
		rnd = Math.floor((seed+(rnd<<6))*Math.PI);
		if(rnd%3<2) chambre(1,0,0,dir);
		else if(rnd%7<3) chambre(-1,0,0,dir);
		chambre(1,rnd%2?-1:0,rnd%2?0:1,dir);
		rnd = Math.floor((rnd<<2)/Math.PI);
		chambre(1,rnd%2?-1:0,rnd%2?0:1,dir);
		
		jardin(0,0,0);
	}else{
		chambre(0 ,-2,0);
		chambre(0 ,-1,0);
		chambre(0,0,0);
		chambre(0,1,0);
		chambre(0 ,rnd%2?-1:1,Math.floor(rnd/2)%2?-1:1);
		rnd = Math.floor((seed+(rnd<<6))*Math.PI);
		chambre(rnd%2?-1:1,0,Math.floor(rnd/2)%2?-1:1);
		rnd = Math.floor((rnd<<2)/Math.PI);
		chambre(rnd%2?-1:1,1,Math.floor(rnd/2)%2?-1:1);
		chambre(rnd%2?-1:1,2,Math.floor(rnd/2)%2?-1:1);
		chambre(0 ,2,0);
		chambre(-2,0 ,0);
		chambre(-1,0 ,0);
		chambre(1,0 ,0);
		if(rnd%11<7)
			jardin(0,0,rnd%2?-1:1);
	}
	var x0 = Math.round(px/4);
	var z0 = Math.round(pz/4);
	var t0 = Math.round(pt/4);
	return {
		xn: x0-10,
		xp: x0+10,
		zn: z0-10,
		zp: z0+10,
		tn: t0-10,
		tp: t0+10
	}
}
MCStruct.observatoir = function(seed,terrain,data,bx,bz,bt,cx,cz,ct,list){
	MCStruct.currentData = data;
	var seed1 = Math.floor(Math.sin((seed*1.414+(bx<<6)+(bz<<1)+(bt<<12))*452.3)*2655242);
	var ox = Math.abs(seed1%10)+20;
	var oz = Math.abs((seed*seed1)%10)+20;
	var ot = Math.abs(seed%10)+20;
	function hall(x0,z0,t0){
		var Info = terrain.getTerrain_Y(
			bx*MCChunk.SIZE+ox,
			bz*MCChunk.SIZE+oz,
			bt*MCChunk.SIZE+ot,
			false //临时的info
		);
		if(Info.hill>2||Info.riverDistance<0.3)return 0;
		var yc = Info.Terrain_Y;
		var r = Math.min(MCChunk.SIZE_Y - yc,Math.abs(seed1<<2)%5+5);
		var xc = (bx-cx)*MCChunk.SIZE+x0;
		var zc = (bz-cz)*MCChunk.SIZE+z0;
		var tc = (bt-ct)*MCChunk.SIZE+t0;
		var xn = Math.max(0,xc-r);
		var xp = Math.min(3,xc+r);
		var yn = Math.max(0,yc-3);
		var yp = Math.min(31,yc+r);
		var zn = Math.max(0,zc-r);
		var zp = Math.min(3,zc+r);
		var tn = Math.max(0,tc-r);
		var tp = Math.min(3,tc+r);
		//if(xn>3 || xp<0 || zn>3 || zp<0 || tn>3 || tp<0) return 0;
		var mat = Info.sand>0?13:9;
		for(var x = xn; x<=xp; x++){
			var X = (x-xc)*(x-xc);
			for(var y = yn; y<=yp; y++){
				var Y = (y-yc)*(y-yc);
				for(var z = zn; z<=zp; z++){
					var Z = (z-zc)*(z-zc);
					for(var t = tn; t<=tp; t++){
						var T = (t-tc)*(t-tc);
						if(X+Y+Z+T<=r*r && X+Y+Z+T>=(r-1)*(r-1)){
							data[x+((y+((z+(t<<2))<<5))<<2)] = mat;
						}
					}
				}
			}
		}
		MCStruct.repl((id)=>id==mat?0:id, xc-r,yc-1,zc-1,tc-1, xc+r,yc+1,zc+1,tc+1);
		MCStruct.repl((id)=>id==mat?0:id, xc-1,yc-r,zc-1,tc-1, xc+1,yc+r,zc+1,tc+1);
		MCStruct.repl((id)=>id==mat?0:id, xc-1,yc-1,zc-r,tc-1, xc+1,yc+1,zc+r,tc+1);
		MCStruct.repl((id)=>id==mat?0:id, xc-1,yc-1,zc-1,tc-r, xc+1,yc+1,zc+1,tc+r);
		//Info.building = true;
	}
	hall(ox,oz,ot);
	ox = Math.round(ox/4);
	oz = Math.round(oz/4);
	ot = Math.round(ot/4);
	return {
		xn: ox-4,
		xp: ox+4,
		zn: oz-4,
		zp: oz+4,
		tn: ot-4,
		tp: ot+4,
	}
}

MCStruct.pyramid = function(seed,terrain,data,bx,bz,bt,cx,cz,ct,list){
	MCStruct.currentData = data;
	var seed1 = Math.floor(Math.sin((seed*3.414+(bx<<12)+(bz<<5)+(bt<<1))*452.3)*245721);
	var ox = Math.abs(seed1%10)+20;
	var oz = Math.abs((seed*seed1)%10)+20;
	var ot = Math.abs(seed%10)+20;
	var Info = terrain.getTerrain_Y(
		bx*MCChunk.SIZE+ox,
		bz*MCChunk.SIZE+oz,
		bt*MCChunk.SIZE+ot,
		false //临时的info
	);
	if(Info.hill>2||Info.riverDistance<0.3)return 0;
	var yc = Info.Terrain_Y;
	var r = Math.min(MCChunk.SIZE_Y - yc,Math.abs(seed1<<2)%3+12);
	var xc = (bx-cx)*MCChunk.SIZE+ox;
	var zc = (bz-cz)*MCChunk.SIZE+oz;
	var tc = (bt-ct)*MCChunk.SIZE+ot;
	var xn = Math.max(0,xc-r);
	var xp = Math.min(3,xc+r);
	var yn = Math.max(0,yc-3);
	var yp = Math.min(31,yc+r);
	var zn = Math.max(0,zc-r);
	var zp = Math.min(3,zc+r);
	var tn = Math.max(0,tc-r);
	var tp = Math.min(3,tc+r);
	var mat = 7;//Info.sand>0?13:9;
	var roomSize = 2;
	var roomHeight = 4;
	for(var y = yn; y<=yp; y++){
		var Y = r-(y-yc);
		for(var x = xn; x<=xp; x++){
			var X = Math.abs(x-xc);
			if(X>Y)continue;
			for(var z = zn; z<=zp; z++){
				var Z = Math.abs(z-zc);
				if(Z>Y)continue;
				for(var t = tn; t<=tp; t++){
					var T = Math.abs(t-tc);
					if(T>Y)continue;
					if(X<=roomSize && Z<=roomSize &&  T<=roomSize && y>=yc &&y<=roomHeight+yc)
						data[x+((y+((z+(t<<2))<<5))<<2)] = 255;
					else data[x+((y+((z+(t<<2))<<5))<<2)] = mat;
				}
			}
		}
	}
	
	var dir = Math.abs(11*seed+7*seed1)%6;
	switch(dir){
		case 0:
			MCStruct.repl((id)=>id==mat?255:id, xc-r,yc,zc,tc, xc,yc+1,zc,tc);break;
		case 1:
			MCStruct.repl((id)=>id==mat?255:id, xc+r,yc,zc,tc, xc,yc+1,zc,tc);break;
		case 2:
			MCStruct.repl((id)=>id==mat?255:id, xc,yc,zc-r,tc, xc,yc+1,zc,tc);break;
		case 3:                                         
			MCStruct.repl((id)=>id==mat?255:id, xc,yc,zc+r,tc, xc,yc+1,zc,tc);break;
		case 4:
			MCStruct.repl((id)=>id==mat?255:id, xc,yc,zc,tc-r, xc,yc+1,zc,tc);break;
		case 5:                                            
			MCStruct.repl((id)=>id==mat?255:id, xc,yc,zc,tc+r, xc,yc+1,zc,tc);break;
	}
	var head = Math.floor(Math.abs(29*seed+37*seed1+dir*31))%5;
	switch(head){
		case 0: //creeper
			MCStruct.setBlock(16, xc,yc,zc,tc);
			MCStruct.setBlock(23, xc,yc+1,zc,tc);
			break;
		case 1: //enderman
			MCStruct.setBlock(21, xc,yc,zc,tc);
			MCStruct.setBlock(24, xc,yc+1,zc,tc);
			break;
		case 2: //steve
			MCStruct.setBlock(18, xc,yc,zc,tc);
			MCStruct.setBlock(25, xc,yc+1,zc,tc);
			break;
	}
	ox = Math.round(ox/4);
	oz = Math.round(oz/4);
	ot = Math.round(ot/4);
	return {
		xn: ox-4,
		xp: ox+4,
		zn: oz-4,
		zp: oz+4,
		tn: ot-4,
		tp: ot+4,
	}
}

MCStruct.well = function(seed,terrain,data,bx,bz,bt,cx,cz,ct,list){
	MCStruct.currentData = data;
	var seed1 = Math.floor(Math.sin((seed*24.14+(bx<<12)+(bz<<5)+(bt<<1))*83772.3)*50781);
	var ox = Math.abs(seed1%10)+20;
	var oz = Math.abs((seed*seed1)%10)+20;
	var ot = Math.abs(seed%10)+20;
	var Info = terrain.getTerrain_Y(
		bx*MCChunk.SIZE+ox,
		bz*MCChunk.SIZE+oz,
		bt*MCChunk.SIZE+ot,
		false //临时的info
	);
	if(Info.hill>2||Info.riverDistance<0.3)return 0;
	var yc = Info.Terrain_Y;
	var r = Math.min(MCChunk.SIZE_Y - yc,Math.abs(seed1<<2)%3+7);
	var xc = (bx-cx)*MCChunk.SIZE+ox;
	var zc = (bz-cz)*MCChunk.SIZE+oz;
	var tc = (bt-ct)*MCChunk.SIZE+ot;
	MCStruct.set(11, xc-2,yc-1,zc-2,tc-2,  xc+3,yc-1,zc+3,tc+3);//bedrock
	MCStruct.hset(10, xc-1,yc,zc-1,tc-1,  xc+2,1,zc+2,tc+2,8);//wall and water
	MCStruct.set(255, xc,yc,zc,tc,  xc+1,yc-3+Math.abs(seed1%3),zc+1,tc+1,8);//clear top wall and top water
	MCStruct.set(9, xc-1,yc+4,zc-1,tc-1,  xc+2,yc+4,zc+2,tc+2);//top shield
	
	MCStruct.set(12, xc-1,yc+1,zc-1,tc-1,  xc-1,yc+3,zc-1,tc-1);
	MCStruct.set(12, xc+2,yc+1,zc-1,tc-1,  xc+2,yc+3,zc-1,tc-1);
	MCStruct.set(12, xc-1,yc+1,zc+2,tc-1,  xc-1,yc+3,zc+2,tc-1);
	MCStruct.set(12, xc+2,yc+1,zc+2,tc-1,  xc+2,yc+3,zc+2,tc-1);
	
	MCStruct.set(12, xc-1,yc+1,zc-1,tc+2,  xc-1,yc+3,zc-1,tc+2);
	MCStruct.set(12, xc+2,yc+1,zc-1,tc+2,  xc+2,yc+3,zc-1,tc+2);
	MCStruct.set(12, xc-1,yc+1,zc+2,tc+2,  xc-1,yc+3,zc+2,tc+2);
	MCStruct.set(12, xc+2,yc+1,zc+2,tc+2,  xc+2,yc+3,zc+2,tc+2);
	ox = Math.round(ox/4);
	oz = Math.round(oz/4);
	ot = Math.round(ot/4);
	return {
		xn: ox-2,
		xp: ox+2,
		zn: oz-2,
		zp: oz+2,
		tn: ot-2,
		tp: ot+2,
	}
}