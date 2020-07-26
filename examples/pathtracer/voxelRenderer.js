'use strict';
var VoxelRenderer_FragmentShader = `
precision highp float;
varying vec3 screenCoord;
varying vec3 realCoord;
uniform float flow, TIME;
uniform mat4 mCamera3;
uniform vec3 Camera4Proj, bgColor4;
uniform sampler2D imgTxt;
uniform int imgdir;
float opacity(){
	return float(abs(realCoord.x)<1.0 && abs(realCoord.y)<1.0 && abs(realCoord.z)<1.0)*1.0;//1.0-dot(coord,coord);
}

void main(void) {
    vec3 color1;
    if(imgdir == 5 || imgdir == 6)
        color1 = texture2D(imgTxt,vec2(realCoord.x,-realCoord.y)/2.0+vec2(0.5,0.5)).rgb;
    else if(imgdir == 3 || imgdir == 4)
        color1 = texture2D(imgTxt,vec2(realCoord.x,-realCoord.z)/2.0+vec2(0.5,0.5)).rgb;
    else
        color1 = texture2D(imgTxt,vec2(-realCoord.z,-realCoord.y)/2.0+vec2(0.5,0.5)).rgb;
    gl_FragColor=vec4(
        color1.rgb,
        clamp(
            flow*(opacity())
            ,0.0
            ,1.0
        )
    );
	
}
`;
var VoxelRenderer4 = function(ctxt,ctxt2d,imgdir,imgLayers,onload){
    Renderer4.call(this,ctxt,null,new Camera4(90,0.1,100));
    this.imgLayers = imgLayers;
    this.imgdir = imgdir;
    this.ctxt2d = ctxt2d;
    this.onload = onload;
    this.enableThumbnail = false;
	this.initGL(this.gl);
}
VoxelRenderer4.prototype = Object.create(Renderer4.prototype);
VoxelRenderer4.ShaderProgram = {
	fbo4D: {
		F: VoxelRenderer_FragmentShader,
		V: `
		attribute vec4 V;
        varying vec3 screenCoord;
        varying vec3 realCoord;
		uniform mat4 mCamera3;
		uniform vec3 Camera4Proj;
		uniform vec4 vCam4;
		uniform mat4 mCam4;
		
		void main(void) {
			vec4 v = vec4(V.xyz*Camera4Proj.x,V.w*Camera4Proj.y+Camera4Proj.z);
            vec4 pos = mCamera3*vec4(v.xyz,1.0);
            screenCoord = v.xyz; 
            realCoord = screenCoord*exp(-vCam4.w) + vCam4.xyz ;
			gl_Position = pos;
		}
		`,
		attribute:{
			"vec4 V":{}
		},
		uniform:{
			"mat4 mCamera3":{},
			"vec3 Camera4Proj":{},//vec3(ctg,mtt,mtw)
			"float flow":{},//opacity per layer
			"int renderDistance":{},//opacity per layer
			"vec4 vCam4":{},"mat4 mCam4":{},//PMat5 Cam4
			"float TIME":{},
			"vec3 bgColor4":{},
			"int imgdir":{}
		}
	}
}

VoxelRenderer4.prototype.initGL = function(gl){
	Webgl(gl);
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, this.width, this.height);
	//var ext = gl.getExtension('OES_texture_float');
	gl.fboProgram = new Webgl.ShaderProgram(gl,VoxelRenderer4.ShaderProgram.fbo4D);
	gl.VfboBuffer = new Webgl.ArrayBuffer(gl);
	gl.FfboBuffer = new Webgl.ElementBuffer(gl);
    this.images = [];
    this.imageBuffer = [];
    this.imageBufferDir = [[],[],this.imageBuffer];
    this.imgtxt = gl.createTexture();
    var _this = this;
    this._loadImg = this.imgLayers;
    var _this = this;
    var WIDTH = _this.imgLayers;
    for(var i = 0; i < this.imgLayers; i++)
        loadImg(this.images,i,check);
    function loadImg(img,i,callback){
        img[i] = new Image();
        img[i].src = _this.imgdir+i+".png";
        img[i].onload = check.bind(null,i);
    }
    function check(i){
        _this.ctxt2d.drawImage(_this.images[i],0,0);
        var imgdata = _this.ctxt2d.getImageData(0,0,WIDTH,WIDTH);
		_this.imageBuffer[i] = imgdata.data;
        _this._loadImg--;
        if(_this._loadImg>0){
            console.log("Loaded Image "+i+", rest: "+_this._loadImg);
        }else{
            console.log("All Loaded !");
            _this._loadImg = 0;
            _this.renders = [renderX, renderY];
            _this._prerenderDir = 0;
            _this._slice = 0;
            smallloop();
        }
    }
    function smallloop(){
        var data = _this.ctxt2d.createImageData(WIDTH,WIDTH);
        var rawData = new Float32Array(WIDTH*WIDTH*3);
        _this.renders[_this._prerenderDir](rawData,_this._slice);
        var indice = -1;
        for(var x = 0; x < WIDTH*WIDTH*3; x++){
            indice++;
            if(x&&!(x % 3)){
                data.data[indice] = 255;
                indice++;
            }
            data.data[indice] = Math.round(rawData[x]);
        }
        _this.ctxt2d.putImageData(data,0,0);
        _this.imageBufferDir[_this._prerenderDir].push(data.data);
        _this._slice++;
        if(_this._slice>=800){
            _this._slice = 0;
            _this._prerenderDir++;
        }
        if(_this._prerenderDir<=1){
            window.requestAnimationFrame(smallloop);
        }else{
            _this.ctxt2d.canvas.style.display = "none";
            _this.onload();
        }
    }
    function renderY(rawData, slice){
        var indice = -1;
        var X = 0, Y = 0;
        for(var x = 0; x < WIDTH*WIDTH*3; x++){
            indice++;
            if(x&&!(x % 3)){
                indice++;
            }
            rawData[x] = _this.imageBuffer[Y][slice*WIDTH*4+(X*4)+(x%3)];
            if(x%3==2){
                X++;
                if(X>=WIDTH){
                    Y++;
                    X = 0;
                }
            }
            
        }
    }
    function renderX(rawData,slice){
        var indice = -1;
        var X = 0, Y = 0;
        for(var x = 0; x < WIDTH*WIDTH*3; x++){
            indice++;
            if(x&&!(x % 3)){
                indice++;
            }
            rawData[x] = _this.imageBuffer[X][Y*WIDTH*4+slice*4+(x%3)];
            if(x%3==2){
                X++;
                if(X>=WIDTH){
                    Y++;
                    X = 0;
                }
            }
            
        }
    }
}

VoxelRenderer4.prototype.beforeRender = function(){
	document.bgColor = "#"+this.bgColor3.toString(16);
    this.gl.fboProgram.use();
	this.clearColor(this.bgColor3);
}
VoxelRenderer4.prototype._renderLayers = function(){
	var mt = 0.99/this.camera4.projectMat.ctg;
    var camf = this.camera3.rotation.conj(false).mul(new Vec3(0,0,1));
    var camx = Math.abs(camf.x), camy = Math.abs(camf.y), camz = Math.abs(camf.z);
    var dir;
    if(camx>=camy && camx>=camz){
        dir = camf.x<0?1:2;
    }else if(camy>=camx && camy>=camz){
        dir = camf.y>0?3:4;
    }else if(camz>=camx && camz>=camy){
        dir = camf.z>0?5:6;
    }
    this._imgdir = dir;
	for(var j = 0; j <= 1; j += this.thickness);
	j -= this.thickness;
	function renderLayer(i,dir){
		if(i> -1){
            var s = (dir & 1)?1:-1;
            var realCoordz = dir==5 || dir==6 ?
                    (s*i*Math.exp(-this.camera4.position.t) - this.camera4.position.z):
                dir==3 || dir==4 ?
                    (s*i*Math.exp(-this.camera4.position.t) - this.camera4.position.y):
                    (s*i*Math.exp(-this.camera4.position.t) + this.camera4.position.x);
            if(this.setImage(Math.round((realCoordz+1)*this.imgLayers/2),dir)){
                this._setFboProgramUniform();
                var vecteur;
                vecteur = dir==5? new Vec4(0,0,1,mt*i): dir==6?new Vec4(0,0,1,-mt*i): dir==3?new Vec4(0,1,0,mt*i): dir==4?new Vec4(0,1,0,-mt*i): dir==2?new Vec4(1,0,0,mt*i): new Vec4(1,0,0,-mt*i);
                this.renderCrossSection(vecteur,false,false);
            }
            //window.requestAnimationFrame(renderLayer.bind(this,i));
            i -= this.thickness;
			renderLayer.bind(this,i,dir)();
		}else{
			//window.requestAnimationFrame(loop);
		}
	}
	renderLayer.bind(this)(j,dir);
}
VoxelRenderer4.prototype.setImage = function(index,dir){
    var gl = this.gl;
    if(index<0 || index>=this.imgLayers) return false;
    var iimg = this.imageBufferDir[(dir-1)>>1][index];
    if(!iimg) return false;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.imgtxt);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.imgLayers, this.imgLayers, 0, gl.RGBA, gl.UNSIGNED_BYTE, iimg);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return true;
}
VoxelRenderer4.prototype._setFboProgramUniform = function(){
	var gl = this.gl;
	var matProject = this._matProject;
	gl.fboProgram.uniform["mat4 mCam4"].set(this._matCamera.t(false).array);
	gl.fboProgram.uniform["float TIME"].set(Math.random());
	gl.fboProgram.uniform["vec4 vCam4"].set([this.camera4.position.x,this.camera4.position.y,this.camera4.position.z,this.camera4.position.t]);
	gl.fboProgram.uniform["vec3 Camera4Proj"].set([matProject.ctg,matProject.mtt,matProject.mtw]);
	gl.fboProgram.uniform["float flow"].set(this.thickness * this.flow);
	gl.fboProgram.uniform["int imgdir"].set(this._imgdir);
	var c = this.bgColor4;
    gl.fboProgram.uniform["vec3 bgColor4"].set([(c >> 16)/256,(c>> 8 & 0xFF)/256,(c & 0xFF)/256]);
}
VoxelRenderer4.prototype.renderCrossSection = function(frustum,mode3d,thumbnail){
	var _this = this;
	this._viewportSection = this.viewport4.crossSection(0,frustum).flat();

	var gl = this.gl;
	var viewport4 = this._viewportSection;
	gl.fboProgram.attribute["vec4 V"].bind(gl.VfboBuffer);
	gl.VfboBuffer.set(viewport4.v,true);
	gl.FfboBuffer.set(viewport4.f,true);
	gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.viewportL();
    gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
    gl.drawFaces(gl.FfboBuffer);
    this.viewportR();
    gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
    gl.drawFaces(gl.FfboBuffer);
    gl.disable(gl.BLEND);
}