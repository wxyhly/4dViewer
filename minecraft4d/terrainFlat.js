var TerrainFlat = function(seed,world){
	this.seed = seed;
	this.world = world;
}
TerrainFlat.prototype.generateChunk = function(cx,cz,ct,data){
	this.generateTerrain(data);
}
TerrainFlat.prototype.getTerrain_Y = function(X,Z,T,dont){
	return 6;
}
TerrainFlat.prototype.generateTerrain = function(data){
	for(var x = 0; x<MCChunk.SIZE; x++){
		for(var z = 0; z<MCChunk.SIZE; z++){
			for(var t = 0; t<MCChunk.SIZE; t++){
				for(var y = 0; y<5; y++){
					data[x+4*y+32*4*z+32*4*4*t] = y<2?1:y<4?3:y<5?2:0;
				}
			}
		}
	}
}