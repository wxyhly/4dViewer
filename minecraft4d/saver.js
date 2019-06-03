MCSaver = function(world){
	this.world = world;
}
MCSaver.version = 1;

MCSaver.prototype.save = function(camera){
	/*
	struct MC4a{
		char[4]: "MC4a",
		//unsigned int32: headerLength,
		unsigned int32: version,
		unsigned int32: seed,
		char[4]: generatorType,
		unsigned int32: chunkQuantity,
		//player: p,
		Chunk[]: chunkData
	}
	*/
	//MC4a
	var header = ["M".charCodeAt(0),"C".charCodeAt(0),"4".charCodeAt(0),"a".charCodeAt(0)];
	//version
	this.writeUint32(header,MCSaver.version);
	var seed = this.world.terrainGen.seed || 0;
	//seed
	this.writeUint32(header,seed);
	//generatorType
	if(this.world.terrainGen == TerrainFlat){
		header.push("f".charCodeAt(0),"l".charCodeAt(0),"a".charCodeAt(0),"t".charCodeAt(0));
	}else{
		header.push(0,0,0,0);
	}
	var chunkQuantity = 0;
	var body = [];
	for(var i in this.world.chunks){
		if(!i.modified) continue;
		this.writeChunk(body,i);
		chunkQuantity++;
	}
	this.writeUint32(header,chunkQuantity);
	
	
	var binary = new Uint8Array(header.length+body.length);
	this.writeArray(binary,header);
	this.writeArray(binary,body,header.length);
	
	var blob = new Blob([binary],{type:"application/octet-binary"});
	var type = blob.type;
	var force_saveable_type = 'application/octet-binary';
	if (type && type != force_saveable_type) { // 强制下载，而非在浏览器中打开
		var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
		blob = slice.call(blob, 0, blob.size, force_saveable_type);
	}
	var a = document.createElement('a');
	var url = window.URL.createObjectURL(blob);
	var filename = "World_"+new Date().toLocaleDateString().replace(/\//g,"/")+'.mc4a';
	a.href = url;
	a.download = filename;
	a.click();
	window.URL.revokeObjectURL(url);
}
MCSaver.prototype.writeChunk = function(out,i){
	/*
	struct chunk{
		char[4]: "Chnk",
		varInt: chx,
		varInt: chz,
		varInt: cht,
		byte[32*4*4*4]: blockData
	}
	*/
	out.push("C".charCodeAt(0),"h".charCodeAt(0),"n".charCodeAt(0),"k".charCodeAt(0));
	var ch = i.split(",");
	this.writeVarInt(out,Number(ch[0]));
	this.writeVarInt(out,Number(ch[1]));
	this.writeVarInt(out,Number(ch[2]));
	//out.push("D".charCodeAt(0),"A".charCodeAt(0),"T".charCodeAt(0),"A".charCodeAt(0));
	var data = this.world.chunks[i].bufferData;
	for(var x=0; x<32*4*4*4; x++){
		out.push(data[x]);
	}
}
MCSaver.prototype.writeVarInt = function(out,i){
	var arr = [];
	var n = false;//positif/negatif
	if(i<0){
		i=-i;
		n = true;
	}
	arr.push(i&0x3F+(n?0x80:0));
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
	out.push(i&0xFF,(i>>8)&0xFF,(i>>16)&0xFF,(i>>24)&0xFF);
}