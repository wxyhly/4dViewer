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
uniform float nonRiverTransparency;
float opacity(vec3 c){
	return float(abs(realCoord.x)<1.0 && abs(realCoord.y)<1.0 && abs(realCoord.z)<1.0)*mix(c.b*c.b,1.0,nonRiverTransparency);
}

void main(void) {
    vec3 color1;
    if(imgdir == 5 || imgdir == 6)
        color1 = texture2D(imgTxt,vec2(realCoord.x,-realCoord.y)/2.0+vec2(0.5,0.5)).rgb;
    else if(imgdir == 3 || imgdir == 4)
        color1 = texture2D(imgTxt,vec2(realCoord.x,-realCoord.z)/2.0+vec2(0.5,0.5)).rgb;
    else
        color1 = texture2D(imgTxt,vec2(-realCoord.y,-realCoord.z)/2.0+vec2(0.5,0.5)).rgb;
    gl_FragColor=vec4(
        color1.rgb,
        clamp(
            flow*(opacity(color1))
            ,0.0
            ,1.0
        )
    );
	
}
`;
var VoxelRenderer4 = function(ctxt,ctxt2d,imgdir_o_videoDom,imgLayers,onload){
    Renderer4.call(this,ctxt,null,new Camera4(90,0.1,100));
    this.imgLayers = imgLayers;
    if(typeof imgdir_o_videoDom == "string"){
        this.imgdir = imgdir_o_videoDom;
        this.video = null;
    }else{
        this.video = imgdir_o_videoDom;
        this.imgdir = null;
    }
    this.nonRiverTransparency = 0;
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
			"float nonRiverTransparency":{},
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
    if(this.video){
        this.video.playbackRate = 0.8;
        this.loading = true;
        this.video.onplay = shot;
    }else{
        for(var i = 0; i < this.imgLayers; i++)
            loadImg(this.images,i,check);
    }
    function shot(){
        var i = Math.floor(_this.video.currentTime*10);
        if(!_this.imageBuffer[i]) check(i);
        if(_this.loading && i<WIDTH) setTimeout(shot,80);
    }
    function loadImg(img,i){
        if(_this.video){
            /*_this.video.currentTime += 0.1;//10 fps +0.1 for 1 frame
            _this.video.ontimeupdate = check.bind(null,i);*/
        }else if(_this.imgdir){
            img[i] = new Image();
            img[i].src = _this.imgdir+i+".png";
            img[i].onload = check.bind(null,i);
        }
    }
    function check(i){
        if(_this.video){
            _this.ctxt2d.drawImage(_this.video,0,0);
        }else if(_this.imgdir){
            _this.ctxt2d.drawImage(_this.images[i],0,0);
        }
        var imgdata = _this.ctxt2d.getImageData(0,0,WIDTH,WIDTH);
		_this.imageBuffer[i] = imgdata.data;
        _this._loadImg--;
        if(_this._loadImg>0){
            console.log("Error: "+(1-(WIDTH - i - _this._loadImg))+"| Loaded Image "+i+", rest: "+_this._loadImg);
        }else{
            console.log("All Loaded !");
            _this._loadImg = 0;
            _this.renders = [renderX, renderY];
            _this._prerenderDir = 0;
            _this._slice = 0;
            smallloop();
            _this.loading = false;
        }
    }
    function smallloop(){
        var data = _this.ctxt2d.createImageData(WIDTH,WIDTH);
        _this.renders[_this._prerenderDir](data.data,_this._slice);
        _this.imageBufferDir[_this._prerenderDir].push(data.data);
        _this._slice++;
        if(_this._slice>=800){
            _this._slice = 0;
            _this._prerenderDir++;
        }
        if(_this._prerenderDir<=1){
            if(_this._slice%4==0){
                _this.ctxt2d.putImageData(data,0,0);
                window.requestAnimationFrame(smallloop);
            }else{
                smallloop();
            }
        }else{
            if(_this.video)_this.video.style.display = "none";
            _this.ctxt2d.canvas.style.display = "none";
            _this.onload();
        }
    }
    function renderY(rawData, slice){
        var indice = -1;
        var X = 0, Y = 0;
        var WIDTH_4 = WIDTH*4;
        var slice_WIDTH_4 = slice*WIDTH_4;
        var W2_3 = WIDTH*WIDTH*3;
        var imgY = _this.imageBuffer[Y];
        for(var x = 0; x < W2_3; x++){
            indice++;
            var xm3 = x % 3;
            if(x&&!xm3){
                rawData[indice] = 255;
                indice++;
            }
            rawData[indice] = imgY[slice_WIDTH_4+X+xm3];
            if(xm3==2){
                X+=4;
                if(X>=WIDTH_4){
                    Y++;
                    imgY = _this.imageBuffer[Y];
                    X = 0;
                }
            }
            
        }
    }
    function renderX(rawData,slice){
        var indice = -1;
        var X = 0, Y = 0;
        var slice_4 = slice*4;
        var W2_3 = WIDTH*WIDTH*3;
        var W_4 = WIDTH*4;
        var W2_4 = W_4*WIDTH;
        var imgY = _this.imageBuffer[Y];
        for(var x = 0; x < W2_3; x++){
            indice++;
            var xm3 = x % 3;
            if(x&&!xm3){
                rawData[indice] = 255;
                indice++;
            }
            rawData[indice] = imgY[X+slice_4+xm3];
            if(xm3==2){
                X += W_4;
                if(X>=W2_4){
                    Y++;
                    imgY = _this.imageBuffer[Y];
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
    gl.fboProgram.uniform["float nonRiverTransparency"].set(this.nonRiverTransparency); 
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