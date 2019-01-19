/**
reserved:
	Vec2, Vec3, Vec4, Bivec, Mat2, Mat3, Mat4, 
	fft, ifft

Matrix: Mat (Mat2||Mat3||Mat4)

	Construct Matrices:
	
		Mat2(a,b,c,d);
		Mat3(a,b,c,d..i);
		Mat4(a,b,c,d.....p);
		
	1-variable operations:
	
		Note: Set flag to false can avoid modification of source matrix, i.e. return a new matrix.
		
		Mat.add(Mat m, bool flag):Mat;
		Mat.sub(Mat m, bool flag):Mat;
		Mat.mul(Number n, bool flag):Mat;
		Mat.mul(Vec v):Vec;
		Mat.mul(Mat m):Mat; Attention no flag needed
		Mat.div(Number n, bool flag):Mat;
	
	non-variable operations:
	
		Mat.sub():Mat; -Mat
		Mat.inv(bool flag):Mat;
		Mat.t(bool flag):Mat;
		Mat.det():Number;
		
Bivector: Bivec (only 4d Bivec)

	Construct Bivector:
	
		Bivec(xy,xz,xt,yz,yt,zt);
		
	1-variable operations:
	
		Note: Set flag to false can avoid modification of source bivector, i.e. return a new bivector.
		
		Bivec.add(Bivec b, bool flag):Bivec;
		Bivec.sub(Bivec b, bool flag):Bivec;
		Bivec.mul(Number n, bool flag):Bivec;
		Bivec.div(Number n, bool flag):Bivec;
		Bivec.dot(Bivec b):Number;
		Bivec.cross(Bivec b):Number;
		Bivec.cross(Vec4 v):Vec4;
		Bivec.commutate(Bivec b):Bivec; Attention no flag needed
		
	non-variable operations:
	
		Bivec.sub():Bivec; -Bivec
		Bivec.len(bool flag):Number;  return len^2 if flag is false
		Bivec.norm(bool flag):Bivec; normalize the vector
		Bivec.clone():Bivec;
		Bivec.dual(bool flag):Bivec; hodge dual
		Bivec.decompose():Bivec[2];
	
	special geometric utilisations:
		
		Bivec.exp(Number angle):Mat4;
		Bivec.expQ(Number angle):Vec4[2]; quaternion representation
		Bivec.getAngle(Bivec b):Number[2]; calculate planar angle between Bivec and b
		Bivec.getAngle(Vec4 b):Number; calculate angle between plane Bivec and vector b
	
Vector: Vec (Vec2||Vec3||Vec4)

	Construct vectors:
	
		Vec2(x,y);
		Vec3(x,y,z);
		Vec4(x,y,z,t);

	1-variable operations:
		
		Note: Set flag to false can avoid modification of source vector, i.e. return a new vector.
		
		Vec.add(Vec v, bool flag):Vec;
		Vec.sub(Vec v, bool flag):Vec;
		Vec.mul(Number n, bool flag):Vec;
		Vec.div(Number n, bool flag):Vec;
		Vec.dot(Vec v):Number;
		
		rule only for 2d complex number:
		
		Vec2.mul(Vec2 v, bool flag):Vec2;
		Vec2.div(Vec2 v, bool flag):Vec2;
		Vec2.pow(Vec2 v, bool flag):Vec2;
		
		rule for cross product in different dimension:

		Vec2.cross(Vec2 v):Number;
		Vec3.cross(Vec3 v, bool flag):Vec3;
		Vec4.cross(Vec4 v):Bivec;
		Vec4.cross(Bivec b, bool flag):Vec4;
		
		rule only for 4d quaternion number:
		
		Vec4.mul(Vec4 v, bool flag):Vec4;
		Vec4.mul(Vec3 v):Vec3; Quantenion rotation in R3
		
	special geometric utilisations:
		
		Vec3.exp(Number angle):Mat3; normalized Vec3, generate rotaion
		Vec3.exp():Mat3; rotaion generator, angle is the norm of Vec3
		Vec3.expQ():Vec4; quaternion representation, angle is the norm of Vec3
		Vec3.expQ(Number angle):Vec4; quaternion representation
		Vec4.toMatrixL():Mat4; quaternion mul to Matrix
		Vec4.toMatrixR():Mat4; mul quaternion to Matrix
		Vec4.toMatrixLR():Mat3; 3d quaternion to Matrix
		
	non-variable operations:

		Vec.sub():Vec; -Vec
		Vec.len(bool flag):Number;  return len^2 if flag is false
		Vec.abs(bool flag):Number;  same as len
		Vec.norm(bool flag):Vec; normalize the vector
		Vec.clone():Vec;
		Vec.flat():Number[]; flatten to an array
		
		rule only for 2d complex number:
		
		Vec2.arg():Number
		Vec2.conj(bool flag):Vec2;
		Vec2.log(bool flag):Vec2;
		Vec2.exp(bool flag):Vec2;
		
		rule only for 4d quaternion number:
		
		Vec4.conj(Vec4 v, bool flag):Vec4;
		

fourier transform and inverse:

	fft((Number||Vec2)[]):Vec2[];
	ifft((Number||Vec2)[]):Vec2[];
**/
'use strict';

var Vec2 = function(x,y){
	this.x = x||0;
	this.y = y||0;
}
var Vec3 = function(x,y,z){
	this.x = x||0;
	this.y = y||0;
	this.z = z||0;
}
var Vec4 = function(x,y,z,t){
	this.x = x||0;
	this.y = y||0;
	this.z = z||0;
	this.t = t||0;
}


Vec2.prototype.flat = function(){return [this.x,this.y];}
Vec3.prototype.flat = function(){return [this.x,this.y,this.z];}
Vec4.prototype.flat = function(){return [this.x,this.y,this.z,this.t];}
Vec2.prototype.set = function(v){this.x = v.x||0;this.y = v.y||0;return this;}
Vec3.prototype.set = function(v){this.x = v.x||0;this.y = v.y||0;this.z = v.z||0;return this;}
Vec4.prototype.set = function(v){this.x = v.x||0;this.y = v.y||0;this.z = v.z||0;this.t = v.t||0;return this;}

Vec2.prototype.add = function (v2,flag){
	if(typeof v2 =="number")v2 = new Vec2(v2);
	if(flag === false){
		return new Vec2(this.x+v2.x,this.y+v2.y);
	}else{
		this.x += v2.x;
		this.y += v2.y;
		return this;
	}
}
Vec3.prototype.add = function (v3,flag){
	if(flag === false){
		return new Vec3(this.x+v3.x,this.y+v3.y,this.z+v3.z);
	}else{
		this.x += v3.x;
		this.y += v3.y;
		this.z += v3.z;
		return this;
	}
}
Vec4.prototype.add = function (v4,flag){
	if(flag === false){
		return new Vec4(this.x+v4.x,this.y+v4.y,this.z+v4.z,this.t+v4.t);
	}else{
		this.x += v4.x;
		this.y += v4.y;
		this.z += v4.z;
		this.t += v4.t;
		return this;
	}
}
Vec2.prototype.sub = function (v2,flag){
	if(!v2){
		this.x = -this.x;
		this.y = -this.y;
		return this;
	}
	if(typeof v2 =="number")v2 = new Vec2(v2);
	if(flag === false){
		return new Vec2(this.x-v2.x,this.y-v2.y);
	}else{
		this.x -= v2.x;
		this.y -= v2.y;
		return this;
	}
}
Vec3.prototype.sub = function (v3,flag){
	if(!v3){
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	}
	if(flag === false){
		return new Vec3(this.x-v3.x,this.y-v3.y,this.z-v3.z);
	}else{
		this.x -= v3.x;
		this.y -= v3.y;
		this.z -= v3.z;
		return this;
	}
}
Vec4.prototype.sub = function (v4,flag){
	if(!v4){
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		this.t = -this.t;
		return this;
	}
	if(flag === false){
		return new Vec4(this.x-v4.x,this.y-v4.y,this.z-v4.z,this.t-v4.t);
	}else{
		this.x -= v4.x;
		this.y -= v4.y;
		this.z -= v4.z;
		this.t -= v4.t;
		return this;
	}
}
Vec2.prototype.mul = function (k,flag){
	if(k instanceof Vec2){
		if(flag === false){
			return new Vec2(this.x*k.x - k.y*this.y, this.x*k.y + k.x*this.y);
		}else{
			var x = this.x*k.x - k.y*this.y;
			this.y = this.x*k.y + k.x*this.y;
			this.x = x;
			return this;
		}
	}
	if(flag === false){
		return new Vec2(k*this.x,k*this.y);
	}else{
		this.x *= k;
		this.y *= k;
		return this;
	}
}
Vec2.prototype.div = function (k,flag){
	if(k instanceof Vec2){
		var x = k.x*k.x+k.y*k.y;
		if(flag === false){
			return new Vec2((this.x*k.x + k.y*this.y)/x, (k.x*this.y - this.x*k.y)/x);
		}else{
			var y = (k.x*this.y - this.x*k.y)/x;
			this.x = (this.x*k.x + k.y*this.y)/x;
			this.y = y;
			return this;
		}
	}
	return this.mul(1/k,flag)
}
Vec3.prototype.mul = function (k,flag){
	if(flag === false){
		return new Vec3(k*this.x,k*this.y,k*this.z,k*this.t);
	}else{
		this.x *= k;
		this.y *= k;
		this.z *= k;
		return this;
	}
}
Vec3.prototype.div = function (k,flag){
	return this.mul(1/k,flag)
}
Vec4.prototype.mul = function (k,flag){
	if(k instanceof Vec4){//quanternion multiplication
		if(flag === false){
			return new Vec4(
				this.x*k.x-this.y*k.y-this.z*k.z-this.t*k.t,
				this.x*k.y+this.y*k.x+this.z*k.t-this.t*k.z,
				this.x*k.z-this.y*k.t+this.z*k.x+this.t*k.y,
				this.x*k.t+this.y*k.z-this.z*k.y+this.t*k.x
			);
		}else{
			var x = this.x*k.x-this.y*k.y-this.z*k.z-this.t*k.t;
			var y = this.x*k.y+this.y*k.x+this.z*k.t-this.t*k.z;
			var z = this.x*k.z-this.y*k.t+this.z*k.x+this.t*k.y;
			this.t = this.x*k.t+this.y*k.z-this.z*k.y+this.t*k.x;
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}
	}
	if(k instanceof Vec3){//quaternion rotation in R3: this.k.this*
		var R = this.mul(new Vec4(0,k.x,k.y,k.z),false).mul(this.conj(false));
		return new Vec3(R.y,R.z,R.t);
	}
	if(flag === false){
		return new Vec4(k*this.x,k*this.y,k*this.z,k*this.t);
	}else{
		this.x *= k;
		this.y *= k;
		this.z *= k;
		this.t *= k;
		return this;
	}
}
Vec4.prototype.div = function (k,flag){
	return this.mul(1/k,flag)
}
Vec2.prototype.dot = function (v2){
	return this.x*v2.x + this.y*v2.y;
}
Vec3.prototype.dot = function (v3){
	return this.x*v3.x + this.y*v3.y + this.z*v3.z;
}
Vec4.prototype.dot = function (v4){
	return this.x*v4.x + this.y*v4.y + this.z*v4.z + this.t*v4.t;
}
Vec2.prototype.len = function (flag){
	var L = this.x*this.x + this.y*this.y;
	if(flag === false){
		return L;
	}
	return Math.sqrt(L);
}
Vec3.prototype.len = function (flag){
	var L = this.x*this.x + this.y*this.y + this.z*this.z;
	if(flag === false){
		return L;
	}
	return Math.sqrt(L);
}
Vec4.prototype.len = function(flag){
	var L = this.x*this.x + this.y*this.y + this.z*this.z + this.t*this.t;
	if(flag === false){
		return L;
	}
	return Math.sqrt(L);
}
Vec2.prototype.norm = Vec3.prototype.norm = Vec4.prototype.norm = function (flag){
	if(this.len()==0)return this;
	return this.div(this.len(),flag);
}

Vec2.prototype.cross = function (v2){
	return this.x*v2.y - this.y*v2.x;
}
Vec3.prototype.cross = function (v3,flag) {
	var X = this.y*v3.z - this.z*v3.y;
	var Y = this.z*v3.x - this.x*v3.z;
	var Z = this.x*v3.y - this.y*v3.x;
	if(flag === false){
		return new Vec3(X,Y,Z);
	}
	this.x = X;
	this.y = Y;
	this.z = Z;
	return this;
}
Vec2.prototype.clone = function (){
	return new Vec2(this.x, this.y);
}
Vec3.prototype.clone = function (){
	return new Vec3(this.x, this.y, this.z);
}
Vec4.prototype.clone = function (){
	return new Vec4(this.x, this.y, this.z, this.t);
}

Vec2.prototype.abs = Vec2.prototype.len;
Vec3.prototype.abs = Vec3.prototype.len;
Vec4.prototype.abs = Vec4.prototype.len;
Vec2.prototype.arg = function (){
	return Math.atan2(this.y,this.x);
}
Vec2.prototype.conj = function (flag){
	if(flag === false){
		return new Vec2(this.x,-this.y);
	}
	this.y = -this.y;
	return this;
}
Vec4.prototype.conj = function (flag){
	if(flag === false){
		return new Vec4(this.x,-this.y,-this.z,-this.t);
	}
	this.y = -this.y;
	this.z = -this.z;
	this.t = -this.t;
	return this;
}
Vec2.prototype.log = function (flag){
	if(flag === false){
		return new Vec2(Math.log(this.x*this.x+this.y*this.y)/2,this.arg());
	}
	var a = this.arg();
	this.x = Math.log(this.x*this.x+this.y*this.y)/2;
	this.y = a;
	return this;
}
Vec2.prototype.exp = function (flag){
	var x = Math.exp(this.x);
	if(flag === false){
		return new Vec2(Math.cos(this.y)*x,Math.sin(this.y)*x);
	}
	this.x = Math.cos(this.y)*x;
	this.y = Math.sin(this.y)*x;
	return this;
}
Vec2.prototype.pow = function (v2,flag){
	if(flag === false){
		return this.log(false).mul(v2).exp();
	}
	return this.log().mul(v2).exp();
}

function fft(d) {
	var dataArray = d.slice(0);
    this.sort = function(data, r) {
        if(data.length <=2) return data;
        var index = [0,1];
        for(var i=0; i<r-1; i++) {
            var tempIndex = [];
            for(var j=0; j<index.length; j++) {
                tempIndex[j] = index[j]*2;
                tempIndex[j+index.length] = index[j]*2+1;
            }
            index = tempIndex;
        }
        var datatemp = [];
        for(var i=0; i<index.length; i++) {
            datatemp.push(data[index[i]]);
        }
        return datatemp;
    };
    var dataLen = dataArray.length;
    var r = 1, i = 1;
    while(i*2 < dataLen) {
        i *= 2;
        r++;
    }
    var count = 1<<r; 
	for(var i=0; i<dataLen; i++) {
		if(typeof dataArray[i] == "number") dataArray[i] = new Vec2(dataArray[i]);
    }
    for(var i=dataLen; i<count; i++) {
        dataArray[i] = new Vec2(0,0);
    }
    dataArray = this.sort(dataArray, r);
    var w = [];
    for(var i=0; i<count/2; i++) {
        var angle = -i*Math.PI*2/count;
        w.push(new Vec2(Math.cos(angle), Math.sin(angle)));
    }
    for(var i=0; i<r; i++) {
        var group = 1<<(r-1-i);
        var distance = 1<<i;
        var unit = 1<<i;
        for(var j=0; j<group; j++) {
            var step = 2*distance*j;
            for(var k=0; k<unit; k++) {
                var temp = dataArray[step+k+distance].mul(w[count*k/2/distance],false);
                dataArray[step+k+distance] = dataArray[step+k].sub(temp,false);
                dataArray[step+k] = dataArray[step+k].add(temp,false);
            }
        }
    }
    return dataArray;
}
function ifft(d) {
	var dataArray = d.slice(0);
    for(var i=0, dataLen=dataArray.length; i<dataLen; i++) {
        if(typeof(dataArray[i])!='object'){
            dataArray[i] = new Vec2(dataArray[i],0);
        }
        dataArray[i].y *= -1;
    }
    dataArray = fft(dataArray);
    for(var i=0, dataLen=dataArray.length; i<dataLen; i++) {
        dataArray[i].x *= 1/dataLen;
        dataArray[i].y *= -1/dataLen;
    }
    return dataArray;
}

var Bivec = function(xy,xz,xt,yz,yt,zt){
	this.xy = (xy)?xy:0;
	this.xz = (xz)?xz:0;
	this.xt = (xt)?xt:0;
	this.yz = (yz)?yz:0;
	this.yt = (yt)?yt:0;
	this.zt = (zt)?zt:0;
}

var Mat2 = function(a,b,c,d){
	if(typeof a =="undefined")
		this.array = [1,0,0,1];
	else if(a.length==4)
		this.array = a;
	else 
		this.array = [a,b,c,d];
}
Mat2.prototype.d = 2;

var Mat3 = function(a,b,c,d,e,f,g,h,i){
	if(typeof a =="undefined")
		this.array = [1,0,0,0,1,0,0,0,1];
	else if(a.length==9)
		this.array = a;
	else 
		this.array = [a,b,c,d,e,f,g,h,i];
}
Mat3.prototype.d = 3;

var Mat4 = function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){
	if(typeof a =="undefined")
		this.array = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	else if(a.length==16)
		this.array = a;
	else 
		this.array = [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p];
}
Mat4.prototype.d = 4;

Bivec.prototype.add = function (bv,flag){
	if(flag === false){
		return new Bivec(
			this.xy + bv.xy,
			this.xz + bv.xz,
			this.xt + bv.xt,
			this.yz + bv.yz,
			this.yt + bv.yt,
			this.zt + bv.zt
		);
	}else{
		this.xy += bv.xy;
		this.xz += bv.xz;
		this.xt += bv.xt;
		this.yz += bv.yz;
		this.yt += bv.yt;
		this.zt += bv.zt;
		return this;
	}
}
Bivec.prototype.sub = function (bv,flag){
	if(!bv){
		this.xy = -this.xy;
		this.xz = -this.xz;
		this.xt = -this.xt;
		this.yz = -this.yz;
		this.yt = -this.yt;
		this.zt = -this.zt;
		return this;
	}
	if(flag === false){
		return new Bivec(
			this.xy - bv.xy,
			this.xz - bv.xz,
			this.xt - bv.xt,
			this.yz - bv.yz,
			this.yt - bv.yt,
			this.zt - bv.zt
		);
	}else{
		this.xy -= bv.xy;
		this.xz -= bv.xz;
		this.xt -= bv.xt;
		this.yz -= bv.yz;
		this.yt -= bv.yt;
		this.zt -= bv.zt;
		return this;
	}
}

Bivec.prototype.mul = function (k,flag){
	if(flag === false){
		return new Bivec(k*this.xy,k*this.xz,k*this.xt,k*this.yz,k*this.yt,k*this.zt);
	}else{
		this.xy *= k;
		this.xz *= k;
		this.xt *= k;
		this.yz *= k;
		this.yt *= k;
		this.zt *= k;
		return this;
	}
}
Bivec.prototype.div = function (k,flag){
	return this.mul(1/k,flag)
}
Bivec.prototype.dot = function (biv){
	return this.xy*biv.xy + this.yz*biv.yz + this.zt*biv.zt + this.xt*biv.xt + this.xz*biv.xz + this.yt*biv.yt;
}
Bivec.prototype.len = function(flag){
	var L = this.xy*this.xy + this.xz*this.xz + this.yz*this.yz + this.yt*this.yt + this.zt*this.zt + this.xt*this.xt;
	if(flag === false){
		return L;
	}
	return Math.sqrt(L);
}
Bivec.prototype.clone = function(){
	return new Bivec(this.xy, this.xz, this.xt, this.yz, this.yt, this.zt);
}
Bivec.prototype.norm = function (flag){
	return this.div(this.len(flag))
}
Bivec.prototype.dual = function (flag){
	if(flag === false){
		return new Bivec(this.zt,-this.yt,this.yz,this.xt,-this.xz,this.xy);
	}
	var temp;
	temp = this.xy; this.xy = this.zt; this.zt = temp;
	temp = this.xz; this.xz = -this.yt; this.yt = -temp;
	temp = this.xt; this.xt = this.yz; this.yz = temp;
	return this;
}
Bivec.prototype.cross = function (V){
	if(V instanceof Vec4){
		return new Vec4(
			-this.yz*V.t - this.zt*V.y + this.yt*V.z,
			this.xz*V.t + this.zt*V.x - this.xt*V.z,
			-this.xy*V.t - this.yt*V.x + this.xt*V.y,
			this.xy*V.z + this.yz*V.x - this.xz*V.y
		);
	}
	if(V instanceof Bivec){
		return this.dot(V.dual(false));
	}
}
Bivec.prototype.commutate = function (V){
	if(V instanceof Bivec){
		return new Bivec(
			V.xz*this.yz-this.xz*V.yz+V.xt*this.yt-this.xt*V.yt,
			-V.xy*this.yz+this.xy*V.yz+V.xt*this.zt-this.xt*V.zt,
			-V.xy*this.yt+this.xy*V.yt-V.xz*this.zt+this.xz*V.zt,
			V.xy*this.xz-this.xy*V.xz+V.yt*this.zt-this.yt*V.zt,
			V.xy*this.xt-this.xy*V.xt-V.yz*this.zt+this.yz*V.zt,
			V.xz*this.xt-this.xz*V.xt+V.yz*this.yt-this.yz*V.yt
		);
	}else{
		throw "type error: Bivec must commutate with another Bivec."
	}
}
Bivec.prototype.toMat4 = function(){
	return new Mat4(
		0,this.xy,this.xz,this.xt,
		-this.xy,0,this.yz,this.yt,
		-this.xz,-this.yz,0,this.zt,
		-this.xt,-this.yt,-this.zt,0
	);
}
Bivec.prototype._generateSimpleRotation = function (){
	var angle = this.len();
	var F = this.toMat4();
	var P = F.mul(F,false);
	if(Math.abs(angle)<0.001)return new Mat4().add(F.mul(1-angle*angle/6)).add(P.mul(0.5));
	return new Mat4().add(F.mul(Math.sin(angle)/angle)).add(P.mul((1-Math.cos(angle))/angle/angle));
}
Bivec.prototype.expQ = function (s){//quanternion [L,R]
	if(typeof s == "number"){
		var A = this.dual(false).add(this).div(2),
			B = this.dual(false).sub(this).div(-2);
		var a = A.len()*Math.sqrt(2);
		var b = B.len()*Math.sqrt(2);
		var sa = Math.sin(s*a);
		var sb = Math.sin(s*b);
		if(sa) A.div(a);
		if(sb) B.div(b);
		return [
			new Vec4(Math.cos(s*a),sa*A.xy,-sa*A.xz,sa*A.xt),
			new Vec4(Math.cos(s*b),sb*B.xy,-sb*B.xz,sb*B.xt)
		];
	}else{
		var A = this.dual(false).add(this).div(Math.sqrt(2)*2),
			B = this.dual(false).sub(this).div(-Math.sqrt(2)*2);
		var a = A.len()//Math.sqrt(2);
		var b = B.len()//Math.sqrt(2);
		var sa = -Math.sin(a)/a*Math.sqrt(2);
		var sb = -Math.sin(b)/b*Math.sqrt(2);
		return [
			new Vec4(Math.cos(a),sa*A.xy,sa*A.xz,sa*A.xt),
			new Vec4(Math.cos(b),sb*B.xy,sb*B.xz,sb*B.xt)
		];
	}
	
}
Bivec.prototype.exp = function (s){
	var n = this;
	if(typeof s == "number"){
		n = this.mul(s/this.len(),false);
	}
	var R = n.decompose();
	return R[0]._generateSimpleRotation().mul(R[1]._generateSimpleRotation());
}
Bivec.prototype.decompose = function (){
	var FA = this.dual(false).add(this).div(2);
	var FB = this.dual(false).sub(this).div(-2);
	var A = FA.len();
	var B = FB.len();
	if(Math.abs(B)<0.00000001){
		var I = new Bivec(1,0,0,0,0,-1).mul(A/2/Math.sqrt(2));
		return [FA.div(2).add(I,false),FA.sub(I)];
	}else if(Math.abs(A)<0.00000001){
		var I = new Bivec(1,0,0,0,0,1).mul(B/2/Math.sqrt(2));
		return [FB.div(2).add(I,false),FB.sub(I)];
	}else{
		var fa = FA.norm();
		var fb = FB.norm();
		return [fa.add(fb,false).mul((A+B)/2),fa.sub(fb).mul((A-B)/2)];
	}
}
Bivec.prototype.getAngle = function (W) {
	if (W instanceof Bivec){
		var M = 1 / (this.len() * W.len())*0.99999999999999999;
		var P = Math.abs(this.dot(W)), Q = Math.abs(this.cross(W));
		var cmm = Math.acos((P + Q) * M);
		var cpp = Math.acos((P - Q) * M);
		return [(cpp+cmm)*90/Math.PI,(cpp-cmm)*90/Math.PI];
	}else if (W instanceof Vec4){
		var P = 1 / (this.len() * W.len());
		return Math.asin(this.cross(W).length() * P)*180/Math.PI;
	}
}

Vec3.prototype.expQ = function(angle){
	if (typeof angle == "undefined"){
		var g = this.len()/2;
		var s = Math.sin(g)/g/2;
		if(Math.abs(g<0.001)) s = 1-g*g/6;
		return new Vec4(Math.cos(g),s*this.x,s*this.y,s*this.z);
	}else{
		var n = this.norm(false);
		var s = Math.sin(angle/2);
		return new Vec4(Math.cos(angle/2),s*n.x,s*n.y,s*n.z);
	}
}
Vec3.prototype.exp = function(angle){
	if(typeof angle == "undefined"){//no argument angle
		var n = this;
	}else{
		var n = this.mul(angle/this.len());
	}
	angle = n.len();
	var F = new Mat3(
		0,n.z,-n.y,
		-n.z,0,n.x,
		n.y,-n.x,0
	);
	var P = F.mul(F,false);
	if(Math.abs(angle)<0.001)return new Mat3().add(F.mul(1-angle*angle/6)).add(P.mul(0.5));
	return new Mat3().add(F.mul(Math.sin(angle)/angle)).add(P.mul((1-Math.cos(angle))/angle/angle));
}
Vec4.prototype.toMatL = function(){
	return new Mat4(
		this.x,-this.y,-this.z,-this.t,
		this.y,this.x,-this.t,this.z,
		this.z,this.t,this.x,-this.y,
		this.t,-this.z,this.y,this.x
	);
}
Vec4.prototype.toMatR = function(){
	return new Mat4(
		this.x,-this.y,-this.z,-this.t,
		this.y,this.x,this.t,-this.z,
		this.z,-this.t,this.x,this.y,
		this.t,this.z,-this.y,this.x
	);
}
Vec4.prototype.toMatLR = function(){//3d rotation
	var a = this.toMatL().mul(this.conj(false).toMatR()).array;
	return new Mat3(a[5],a[6],a[7],a[9],a[10],a[11],a[13],a[14],a[15]);
}
//add additional method to vec4 which use Bivec
Vec4.prototype.cross = function (V,flag) {
	if(V instanceof Vec4){
		return new Bivec(
			this.x*V.y - this.y*V.x,
			this.x*V.z - this.z*V.x,
			this.x*V.t - this.t*V.x,
			this.y*V.z - this.z*V.y,
			this.y*V.t - this.t*V.y,
			this.z*V.t - this.t*V.z
		);
	} if(V instanceof Bivec){
		if(flag === false){
			return V.cross(this);
		}
		this.x = -V.yz*this.t - V.zt*this.y + V.yt*this.z;
		this.y = V.xz*this.t + V.zt*this.x - V.xt*this.z;
		this.z = -V.xy*this.t - V.yt*this.x + V.xt*this.y;
		this.t = V.xy*this.z + V.yz*this.x - V.xz*this.y;
		return this;
	}
}
Mat2.prototype.add = Mat3.prototype.add = Mat4.prototype.add = function(m,flag){
	if(flag === false){
		var x = new this.constructor();
		for(var i =0; i< this.array.length; i++){
			x.array[i] = this.array[i] + m.array[i];
		}
		return x;
	}
	for(var i =0; i< this.array.length; i++){
		this.array[i] += m.array[i];
	}
	return this;
}
Mat2.prototype.clone = Mat3.prototype.clone = Mat4.prototype.clone = function(){
	var x = new this.constructor();
	for(var i =0; i< this.array.length; i++){
		x.array[i] = this.array[i];
	}
	return x;
}
Mat2.prototype.sub = Mat3.prototype.sub = Mat4.prototype.sub = function(m,flag){
	if(!m){
		for(var i =0; i< this.array.length; i++){
			this.array[i] = - this.array[i];
		}
		return this;
	}
	if(flag === false){
		var x = new this.constructor();
		for(var i =0; i< this.array.length; i++){
			x.array[i] = this.array[i] - m.array[i];
		}
		return x;
	}
	for(var i =0; i< this.array.length; i++){
		this.array[i] -= m.array[i];
	}
	return this;
}
Mat2.prototype.mul = Mat3.prototype.mul = Mat4.prototype.mul = function(m,flag){
	if(typeof m == "number"){
		if(flag === false){
			var x = new this.constructor();
			for(var i =0; i< this.array.length; i++){
				x.array[i] = this.array[i]*m;
			}
			return x;
		}
		for(var i =0; i< this.array.length; i++){
			this.array[i] *= m;
		}
		return this;
	}else if(typeof m.x != "undefined"){
		var a = this.array;
		switch(this.d){
			case 2:
				return new Vec2(m.x*a[0]+m.y*a[1], m.x*a[2]+m.y*a[3]);
			case 3:
				return new Vec3(m.x*a[0]+m.y*a[1]+m.z*a[2], m.x*a[3]+m.y*a[4]+m.z*a[5], m.x*a[6]+m.y*a[7]+m.z*a[8]);
			case 4:
				return new Vec4(
					m.x*a[0]+m.y*a[1]+m.z*a[2]+m.t*a[3],
					m.x*a[4]+m.y*a[5]+m.z*a[6]+m.t*a[7],
					m.x*a[8]+m.y*a[9]+m.z*a[10]+m.t*a[11],
					m.x*a[12]+m.y*a[13]+m.z*a[14]+m.t*a[15]
				);
		}
	}else if(m.d == this.d){
		var a = this.array;
		var b = m.array;
		switch(this.d){
			case 2:
				return new Mat2(
					a[0]*b[0]+a[1]*b[2], a[0]*b[1]+a[1]*b[3],
					a[2]*b[0]+a[3]*b[2], a[2]*b[1]+a[3]*b[3],
				);
			case 3:
				return new Mat3(
					a[0]*b[0]+a[1]*b[3]+a[2]*b[6], a[0]*b[1]+a[1]*b[4]+a[2]*b[7], a[0]*b[2]+a[1]*b[5]+a[2]*b[8],
					a[3]*b[0]+a[4]*b[3]+a[5]*b[6], a[3]*b[1]+a[4]*b[4]+a[5]*b[7], a[3]*b[2]+a[4]*b[5]+a[5]*b[8],
					a[6]*b[0]+a[7]*b[3]+a[8]*b[6], a[6]*b[1]+a[7]*b[4]+a[8]*b[7], a[6]*b[2]+a[7]*b[5]+a[8]*b[8],
				);
			case 4:
				return new Mat4(
					a[0]*b[0]+a[1]*b[4]+a[2]*b[8]+a[3]*b[12], a[0]*b[1]+a[1]*b[5]+a[2]*b[9]+a[3]*b[13], a[0]*b[2]+a[1]*b[6]+a[2]*b[10]+a[3]*b[14], a[0]*b[3]+a[1]*b[7]+a[2]*b[11]+a[3]*b[15],
					a[4]*b[0]+a[5]*b[4]+a[6]*b[8]+a[7]*b[12], a[4]*b[1]+a[5]*b[5]+a[6]*b[9]+a[7]*b[13], a[4]*b[2]+a[5]*b[6]+a[6]*b[10]+a[7]*b[14], a[4]*b[3]+a[5]*b[7]+a[6]*b[11]+a[7]*b[15],
					a[8]*b[0]+a[9]*b[4]+a[10]*b[8]+a[11]*b[12], a[8]*b[1]+a[9]*b[5]+a[10]*b[9]+a[11]*b[13], a[8]*b[2]+a[9]*b[6]+a[10]*b[10]+a[11]*b[14], a[8]*b[3]+a[9]*b[7]+a[10]*b[11]+a[11]*b[15],
					a[12]*b[0]+a[13]*b[4]+a[14]*b[8]+a[15]*b[12], a[12]*b[1]+a[13]*b[5]+a[14]*b[9]+a[15]*b[13], a[12]*b[2]+a[13]*b[6]+a[14]*b[10]+a[15]*b[14], a[12]*b[3]+a[13]*b[7]+a[14]*b[11]+a[15]*b[15],
				);
		}
	}else{
		throw "Matrice dimension must agree";
	}
}
Mat2.prototype.div = Mat3.prototype.div = Mat4.prototype.div = function(k,flag){
	var K = 1/k;
	if(flag === false){
		var x = new this.constructor();
		for(var i =0; i< this.array.length; i++){
			x.array[i] = this.array[i]*K;
		}
		return x;
	}
	for(var i =0; i< this.array.length; i++){
		this.array[i] *= K;
	}
	return this;
}
Mat2.prototype.t = function (flag) {
	var te = this.array;
	if(flag==false){
		var M = mat4();
		var me = M.array;
		me[1] = te[2]; me[2] = te[1];
		return M;
	}
	var tmp;
	tmp = te[1]; te[1] = te[2]; te[2] = tmp;
	return this;
},
Mat2.prototype.det = function (){
	var te = this.array;
	var a = te[0], b = te[1], c = te[2], d = te[3];
	return a * d - b * c;
}
Mat2.prototype.inv = function (flag){
	var me = this.array;
	var Matrix = this;
	var a = te[0], b = te[1], c = te[2], d = te[3];
	det = a * d - b * c;
	if (det === 0) {
		var msg = "Mat2.inv() can't invert matrix, determinant is 0";
		console.warn(msg);
		return new Mat2();
	}
	var detInv = 1 / det;
	var te;
	if(flag === false){
		Matrix = new Mat2();
		te = Matrix.array;
	}else{
		te = me;
	}
	te[0] = d * detInv;
	te[1] = -b * detInv;
	te[2] = -c * detInv;
	te[3] = a * detInv;
	return Matrix;
}
Mat3.prototype.t = function (flag) {
	var te = this.array;
	if(flag==false){
		var M = new Mat3();
		var me = M.array;
		me[1] = te[3]; me[3] = te[1];
		me[2] = te[6]; me[6] = te[2];
		me[5] = te[7]; me[7] = te[5];
		return M;
	}
	var tmp;
	tmp = te[1]; te[1] = te[3]; te[3] = tmp;
	tmp = te[2]; te[2] = te[6]; te[6] = tmp;
	tmp = te[5]; te[5] = te[7]; te[7] = tmp;
	return this;
},
Mat3.prototype.det = function (){
	var te = this.array;
	var a = te[0], b = te[1], c = te[2],
	d = te[3], e = te[4], f = te[5],
	g = te[6], h = te[7], i = te[8];
	return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
}
Mat3.prototype.inv = function (flag){
	var me = this.array;
	var Matrix = this,
	n11 = me[0], n21 = me[1], n31 = me[2],
	n12 = me[3], n22 = me[4], n32 = me[5],
	n13 = me[6], n23 = me[7], n33 = me[8],
	t11 = n33 * n22 - n32 * n23,
	t12 = n32 * n13 - n33 * n12,
	t13 = n23 * n12 - n22 * n13,
	det = n11 * t11 + n21 * t12 + n31 * t13;
	if (det === 0) {
		var msg = "Mat3.inv() can't invert matrix, determinant is 0";
		console.warn(msg);
		return new Mat3();
	}
	var detInv = 1 / det;
	var te;
	if(flag === false){
		Matrix = new Mat3();
		te = Matrix.array;
	}else{
		te = me;
	}
	te[0] = t11 * detInv;
	te[1] = (n31 * n23 - n33 * n21) * detInv;
	te[2] = (n32 * n21 - n31 * n22) * detInv;
	te[3] = t12 * detInv;
	te[4] = (n33 * n11 - n31 * n13) * detInv;
	te[5] = (n31 * n12 - n32 * n11) * detInv;
	te[6] = t13 * detInv;
	te[7] = (n21 * n13 - n23 * n11) * detInv;
	te[8] = (n22 * n11 - n21 * n12) * detInv;
	return Matrix;
}
Mat4.prototype.t = function (flag) {
	var te = this.array;
	if(flag==false){
		var M = new Mat4();
		var me = M.array;
		me[1] = te[4]; me[4] = te[1];
		me[2] = te[8]; me[8] = te[2];
		me[6] = te[9]; me[9] = te[6];
		me[3] = te[12]; me[12] = te[3];
		me[7] = te[13]; me[13] = te[7];
		me[11] = te[14]; me[14] = te[11];
		return M;
	}
	var tmp;
	tmp = te[1]; te[1] = te[4]; te[4] = tmp;
	tmp = te[2]; te[2] = te[8]; te[8] = tmp;
	tmp = te[6]; te[6] = te[9]; te[9] = tmp;
	tmp = te[3]; te[3] = te[12]; te[12] = tmp;
	tmp = te[7]; te[7] = te[13]; te[13] = tmp;
	tmp = te[11]; te[11] = te[14]; te[14] = tmp;
	return this;
},
Mat4.prototype.det = function (){
	var me = this.array;
	var n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
	n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
	n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
	n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],
	t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
	t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
	t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
	t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
	return (n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14);
}
Mat4.prototype.inv = function (flag){
	var me = this.array;
	var Matrix = this;
	var n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
	n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
	n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
	n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],
	t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
	t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
	t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
	t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
	var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
	if (det === 0) {
		var msg = "Mat4.inv() can't invert matrix, determinant is 0";
		console.warn(msg);
		return new Mat4();
	}
	var detInv = 1 / det;
	var te;
	if(flag === false){
		Matrix = new Mat4();
		te = Matrix.array;
	}else{
		te = me;
	}
	te[0] = t11 * detInv;
	te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
	te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
	te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
	te[4] = t12 * detInv;
	te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
	te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
	te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
	te[8] = t13 * detInv;
	te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
	te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
	te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
	te[12] = t14 * detInv;
	te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
	te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
	te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
	return Matrix;
}