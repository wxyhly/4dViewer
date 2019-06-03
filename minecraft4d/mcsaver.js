MCSaver = function(world){
	this.world = world;
}
MCSaver.version = 1;

MCSaver.prototype.save = function(camera){
	/*
	struct MC4a{
		char[4] "MC4a",
		unsigned int32 version,
		unsigned int32 seed,
		char generatorType[4],
		unsigned int32 time,
		float32 playerPosition[4],
		//int8 playerRotation[8], quantenion*128 to int8
		unsigned int32 chunkQuantity,
		Chunk chunkData[]
	}
	*/
	//MC4a
	var header = ["M".charCodeAt(0),"C".charCodeAt(0),"4".charCodeAt(0),"a".charCodeAt(0)];
	//version
	this.writeUint32(header,MCSaver.version);
	var seed = this.world.terrain.seed || 0;
	//seed
	this.writeUint32(header,seed);
	//generatorType
	if(this.world.terrain.constructor == TerrainFlat){
		header.push("f".charCodeAt(0),"l".charCodeAt(0),"a".charCodeAt(0),"t".charCodeAt(0));
	}else{
		header.push("n".charCodeAt(0),"o".charCodeAt(0),"r".charCodeAt(0),"m".charCodeAt(0));//normal(default)
	}
	//time
	this.writeFloat32(header,this.world.time);
	var player = camera.position;
	//player
	this.writeFloat32(header,player.x);
	this.writeFloat32(header,player.y);
	this.writeFloat32(header,player.z);
	this.writeFloat32(header,player.t);
	var chunkQuantity = 0;
	var body = [];
	for(var i in this.world.chunks){
		var chunk = this.world.chunks[i];
		if(!chunk.modified) continue;
		this.writeChunk(body,chunk,i);
		chunkQuantity++;
	}
	this.writeUint32(header,chunkQuantity);
	
	
	var binary = new Uint8Array(header.length+body.length);
	this.writeArray(binary,header);
	this.writeArray(binary,body,header.length);
	MCSaver.saveBin(binary,"World_"+new Date().toLocaleDateString().replace(/\//g,"/")+'.mc4a');
}
MCSaver.saveBin = function(binary,filename){
	var blob = new Blob([binary],{type:"application/octet-binary"});
	var type = blob.type;
	var force_saveable_type = 'application/octet-binary';
	if (type && type != force_saveable_type) { // 强制下载，而非在浏览器中打开
		var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
		blob = slice.call(blob, 0, blob.size, force_saveable_type);
	}
	var a = document.createElement('a');
	var url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	a.click();
	window.URL.revokeObjectURL(url);
}
MCSaver.prototype.writeChunk = function(out,chunk,i){
	/*
	struct chunk{
		char[4] "Chnk",
		unsigned int32 chunkLength,
		varInt chx,
		varInt chz,
		varInt cht,
		byte blockData[32*4*4*4]
	}
	*/
	var chunkStart = out.length;
	out.push("C".charCodeAt(0),"h".charCodeAt(0),"n".charCodeAt(0),"k".charCodeAt(0),0,0,0,0);
	var ch = i.split(",");
	this.writeVarInt(out,Number(ch[0]));
	this.writeVarInt(out,Number(ch[1]));
	this.writeVarInt(out,Number(ch[2]));
	var start = out.length;
	var data = chunk.bufferData;
	var next = data[0];
	var count = 0;
	var dataRawLength = 32*4*4*4;
	for(var x=0; x<dataRawLength; x++){
		var d = next;//data[x];
		next = (x+1<dataRawLength)?data[x+1]:-1;
		if(count){
			if(d == next && count < 256){
				count++;
			}else{
				out.push(count-1);//注意，1xxx 0000 == 0xxx 0xxx; 1xxx 0001 == 0xxx 0xxx 0xxx
				count = 0;
			}
		}else{
			if(d == next){
				out.push(d+0x80);
				count = 1;
			}else{
				out.push(d);
			}
		}		
	}
	var length = out.length - start;
	out[chunkStart+4] = (length>>24)&0xFF;
	out[chunkStart+5] = (length>>16)&0xFF;
	out[chunkStart+6] = (length>>8)&0xFF;
	out[chunkStart+7] = (length)&0xFF;
}
MCSaver.prototype.writeVarInt = function(out,i){
	var arr = [];
	var n = false;//positif/negatif
	if(i<0){
		i=-i;
		n = true;
	}
	arr.push((i&0x3F)+(n?0x40:0));
	i = i>>6;
	while(i>0){
		arr.push(0x80+(i&0x7F));
		i = i>>7;
	}
	var l = arr.length;
	while(l--){
		out.push(arr[l]);
	}
}
MCSaver.prototype.writeUint32 = function(out,i){
	out.push((i>>24)&0xFF,(i>>16)&0xFF,(i>>8)&0xFF,i&0xFF);
}
MCSaver.prototype.writeFloat32 = function(out,f){
	var A = new Float32Array(1);
	A[0] = f;
	var B = new DataView(A.buffer);
	out.push(B.getUint8(0),B.getUint8(1),B.getUint8(2),B.getUint8(3));
}
MCSaver.prototype.writeArray = function(out,arr,offset){
	offset = offset||0;
	for(var i=0; i<arr.length; i++){
		out[i+offset] = arr[i];
	}
}
