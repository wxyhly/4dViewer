var MCLoader = function(){
}
MCLoader.version = 1;

MCLoader.msg = function(msg){
	console.log(msg);
}
MCLoader.load = function(input){
	MCLoader.buffer = null;
	var file = input.files[0];
	if(!file) return 0;
	filename = file.name.split(".")[0];
	var reader = new FileReader();
	reader.onload = function() {
		MCLoader.buffer = this.result;
		if(MCLoader.buffer && MCLoader.buffer.byteLength)
		MCLoader.msg("读取成功！["+MCLoader.buffer.byteLength+"B]");
		MCLoader.decode();
	}
	reader.readAsArrayBuffer(file);
	MCLoader.msg("读取本地文件中");
	input.value = '';
}
MCLoader.EOF = function(){
	MCLoader.msg("EOF：格式错误！");
	return NaN;
}
MCLoader.decode = function(){
	if(!MCLoader.buffer) MCLoader.msg("读取失败。。");
	MCLoader.msg("开始解码");
	MCLoader.data = new DataView(MCLoader.buffer);
	MCLoader.offset = 0;
	MCLoader.EOFStack.push(MCLoader.buffer.byteLength);
	var header = [0x4d, 0x43, 0x34, 0x61, 0x00, 0x00, 0x00, 0x01];//MC4a + version 1
	for(var i of header){
		if(i != MCLoader.next()){
			MCLoader.msg("意外文件头格式！");
			return 0;
		}
	}
	var out = {};
	MCLoader.out = out;
	out.seed = MCLoader.nextInt32();
	MCLoader.msg("种子:" + out.seed);
	var chars = "";
	chars+=String.fromCharCode(MCLoader.next());
	chars+=String.fromCharCode(MCLoader.next());
	chars+=String.fromCharCode(MCLoader.next());
	chars+=String.fromCharCode(MCLoader.next());
	out.generatorType = chars;
	MCLoader.msg("地形生成器类型:" + out.generatorType);
	out.time = MCLoader.nextFloat32();
	out.player = {
		x: MCLoader.nextFloat32(),
		y: MCLoader.nextFloat32(),
		z: MCLoader.nextFloat32(),
		t: MCLoader.nextFloat32()
	};
	out.chunkNumber = MCLoader.nextInt32();
	MCLoader.msg("区块数："+out.chunkNumber);
	out.chunks = {};
	for(var i = 0; i<out.chunkNumber; i++){
		MCLoader.nextChunk(i);
	}
	if(MCLoader.EOFStack.pop() == MCLoader.offset){
		MCLoader.msg("解码完成！");
		MCLoader.loadToWorld(MCLoader.out);
	}else{
		MCLoader.msg("格式错误！");
	}
}
MCLoader.EOFStack = [];
MCLoader.EOFPos = function(){
	return MCLoader.EOFStack[MCLoader.EOFStack.length-1];
}
MCLoader.nextChunk = function(){
	var chunkHeader = [0x43, 0x68, 0x6e, 0x6b];//Chnk
	for(var i of chunkHeader){
		if(i != MCLoader.next()){
			MCLoader.msg("意外区块头格式！");
			return 0;
		}
	}
	var chunkLength = MCLoader.nextInt32();
	var chx = MCLoader.nextVarInt();
	var chz = MCLoader.nextVarInt();
	var cht = MCLoader.nextVarInt();
	MCLoader.msg("区块"+chx+","+chz+","+cht+"："+chunkLength+"[B]");
	MCLoader.EOFStack.push(MCLoader.offset + chunkLength);
	var bufferData = new Uint8Array(32*4*4*4);
	var bufferOffset = 0;
	var prevID = 255;
	while (MCLoader.EOFPos() != MCLoader.offset){
		var d = MCLoader.next();
		if(prevID >= 128){//no prevID
			if(d>=0x80){
				prevID = d - 0x80;
			}else{
				bufferData[bufferOffset++] = d;
			}
		}else{
			for(var c = 0; c < d+2; c++){
				bufferData[bufferOffset++] = prevID;
			}
			prevID = 255;
		}
	}
	if(bufferOffset!=32*4*4*4){
		MCLoader.msg("意外区块内容格式！");
		return 0;
	}
	MCLoader.EOFStack.pop();
	
	var chunk = new MCChunk(chx,chz,cht,bufferData);
	chunk.modified = true;
	MCLoader.out.chunks[chx+","+chz+","+cht] = chunk;
}

MCLoader.next = function(){
	if(MCLoader.offset >= MCLoader.EOFPos())return MCLoader.EOF();
	return MCLoader.data.getUint8(MCLoader.offset++);
}
MCLoader.nextInt8 = function(){
	if(MCLoader.offset >= MCLoader.EOFPos())return MCLoader.EOF();
	return MCLoader.data.getInt8(MCLoader.offset++);
}
MCLoader.nextVarInt = function(){
	var data = [];
	while(true){
		var bit = MCLoader.next();
		if (bit & 0x80){
			data.unshift(bit & 0x7F);
		}else{
			data.unshift(bit);
			break;
		}
	}
	var negatif = (data[0] & 0x40);
	if(negatif) data[0] -= 0x40;
	var num = 0;
	for(var i in data){
		num += data[i] << (7 * i);
	}
	return negatif?-num:num;
}
MCLoader.nextInt32 = function(){
	if(MCLoader.offset+3 >= MCLoader.EOFPos())return MCLoader.EOF();
	MCLoader.offset += 4;
	return MCLoader.data.getUint32(MCLoader.offset-4);
}
MCLoader.nextFloat32 = function(){
	if(MCLoader.offset+3 >= MCLoader.EOFPos())return MCLoader.EOF();
	MCLoader.offset += 4;
	return MCLoader.data.getFloat32(MCLoader.offset-4,true);
}
MCLoader.nextInt16 = function(){
	if(MCLoader.offset+1 >= MCLoader.EOFPos())return MCLoader.EOF();
	MCLoader.offset += 2;
	return MCLoader.data.getUint16(MCLoader.offset-2);
}
////////////////////////

MCLoader.loadToWorld = function(out){
	var world = HUD.controler.renderer.scene4;
	switch(out.generatorType){
		case "flat":
			world.terrain = new TerrainFlat(out.seed,world); break;
		case "norm":
			world.terrain = new TerrainGen (out.seed,world); break;
	}
	var camera4 = HUD.controler.camera4;
	camera4.position.x = out.player.x;
	camera4.position.y = out.player.y;
	camera4.position.z = out.player.z;
	camera4.position.t = out.player.t;
	world.chunks = out.chunks;
	initSun(HUD.planet,out.seed);
	world.time = out.time;
	HUD.togglePause(false);
}