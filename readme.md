[English Version](https://github.com/wxyhly/4dViewer/blob/master/readme_en.md)

设想你是一个四维人，你的眼睛看到的图像是三维的，因为除了上下左右前后，还多出了两个新方向。
由于可怜的三维生物（我们）只有二维视觉，所以只好把四维人眼中的三维视野图像做成半透明的给三维生物们观看，这就是4DViewer所做的。但三维视野图像感觉上就是看一团雾，我们可以选择一些截面去截这个视野。比如我们可以抽取过三维图像中心的x、y、z三个方向的截面，单独放到三个角落上一边观察。
## 引导教程：[体验四维人的视觉与方向感](https://wxyhly.github.io/archives/eye3d/)


## 初探四维

### 简单的例子：超立方体 [examples/hypercube.html](https://wxyhly.github.io/4dViewer/examples/hypercube.html)

使用鼠标左右键均可拖动改变观察角度，滚动鼠标滚轮将拉近/推远相机位置。你现在处于超立方体内部。试着推远相机，你将钻出来从外面看到整个立方体。
超立方体由8个全等的正方体胞（“胞”指三维面，下同）围成。为区分方便，每个正方体胞心上还画了不同颜色的球形图案。

### 正多胞体以及其它基本几何体 [examples/polychora.html](https://wxyhly.github.io/4dViewer/examples/polychora.html)

在右侧的控制栏中选择形状栏下拉菜单中可选择正多胞体、柱体、锥体、旋转体、直积形等等大量四维图形。对于比较复杂的几何体（如超球）会有一点卡顿的现象，此时建议将显示模式改为仅显示胞，然后按键盘`C`显示边。

## 四维入门

在见识了一些基本形状之后，我们来体会一下*第一人称视角*。
- **操作说明：**使用`W` `S` `A` `D`前后左右平移，新的四维方向（对应三维立方体视野图像的前后）使用`Q` `E`平移，它本质上是一种新的“侧面”方向，因为它不是重力方向（上下）也不是你面对的方向（前后），本文暂且叫它们**侧前**、**侧后**；按住空格键升高，松开后会在重力作用下掉回地面。鼠标上下左右移动或`U` `O` `J` `L`可以环视六周（注意四维有六“周”而不是四周），分别对应向侧前、侧后、左、右环视转向。最后鼠标滚轮或`I` `K`键控制抬头或俯视；按`Z` `X`可旋转三维视野图像，按`C`可以显示边（其实画的是每张截面的顶点），以便在模糊的透明图像中看清物体的轮廓。按`H`可隐藏右边的控制栏。

**一些例子：**

### Slope [examples/slope.html](https://wxyhly.github.io/4dViewer/examples/slope.html)
包含斜坡、平台和一个隧道的简单场景。
- 目标：找好合适的角度走上斜坡，通过平台穿过隧道来到另一头。

### 游戏Tetraspace [examples/tetraspace.html](https://wxyhly.github.io/4dViewer/examples/tetraspace.html)
（这是一个[免费的四维截面游戏](https://rantonels.itch.io/brane)，这个例子照搬了里面的前11个关卡，在这里向作者致敬）
+ 初级目标：在不使用空格键跳跃的情况下找到空中悬浮的白色小超立方体，触碰通关。注：蓝色超立方体方块可以面朝着把它推动，绿色的超立方体是激光器，不能碰到它以及它发出的激光束。
+ 高级目标：在只有三维视野（可按键盘`C`开启线框模式）不看三个截面缩略图的情况下通关。

## 四维进阶

### 四维Minecraft [minecraft4d/](https://wxyhly.github.io/4dViewer/minecraft4d/)

### [Minecraft4D 详细教程](https://wxyhly.github.io/archives/mc4tutorial/)

基于随机种子的无限世界，使用鼠标左键破坏、右键放置！目前生物群系有被森林覆盖的平原、小丘陵、湿地和沙漠。

## 四维刚体物理引擎

### 请看[教程讲解](https://wxyhly.github.io/archives/newton4/)

### 一些场景

- 正24胞体骰子[physique/dice.html](https://wxyhly.github.io/4dViewer/physique/dice.html)
- 四维积木块[physique/cubes.html](https://wxyhly.github.io/4dViewer/physique/cubes.html)
- 四维汽车[physique/car.html](https://wxyhly.github.io/4dViewer/physique/car.html)
- 圆锥锥陀螺[physique/gyro.html](https://wxyhly.github.io/4dViewer/physique/gyro.html)
- 四维锁链
    +  球环-球环链（一动就会脱）[physique/unlink.html](https://wxyhly.github.io/4dViewer/physique/unlink.html)
    +  球环-环球链[physique/st_ts_link.html](https://wxyhly.github.io/4dViewer/physique/st_ts_link.html)
    +  球环-双圆环链[physique/st_tiger_link.html](https://wxyhly.github.io/4dViewer/physique/st_tiger_link.html)
    +  环球-双圆环链[physique/tiger_ts_link.html](https://wxyhly.github.io/4dViewer/physique/tiger_ts_link.html)
    +  双圆环-双圆环链（一大一小）[physique/tiger_tiger_link.html](https://wxyhly.github.io/4dViewer/physique/tiger_tiger_link.html)
- 四维齿轮1:绝对垂直的齿轮相互传动[physique/cogwheel.html](https://wxyhly.github.io/4dViewer/physique/cogwheel.html)
- 四维齿轮2:双旋转合成器[physique/cogwheel2.html](https://wxyhly.github.io/4dViewer/physique/cogwheel2.html)

## 参数调节
### 相机设置
- ***视野***  调整相机视野，也可通过按大键盘`9` `0`实现。

### 渲染设置
4DViewer中，三维视野其实是通过Webgl渲染很多二维的视野截面叠在一起的。展开右侧面板Renderer项可以看到渲染器的很多设置：
- ***层距***  可调整截面间距（设小后三维视野质量更高，但会导致卡顿），也可通过按大键盘`+` `-`实现。
- ***流量***  调整图像不透明度。建议其值保持适中，过大将导致只有视野表面才可见，也可通过按键盘`[` `]`实现。
- ***缩略图***  调整屏幕三角的截面缩略图大小，也可通过按键盘`;` `'`实现。
- ***线框模式***  即通过显示每个截面截得物体顶点得到的线框模式，也可通过按键盘`C`实现切换，通过`Ctrl+[`与`Ctrl+]`（或`Alt+[`与`Alt+]`）调节线框粗细。
- ***4D背景色***  为四维世界中的背景颜色（如天空颜色）
- ***4D背景色流量***  为将3D视野投影到2D的屏幕背景颜色。可以通过按键盘`,` `.`在黑-灰-白的范围内调整。
- ***透明度***  当3D视野中物体复杂时往往太模糊，不便于观察，有时我们希望某些像素变得透明以便观察。按住`Alt+1` `Alt+2` `Alt+3` `Alt+4` 并点击鼠标右键可以存储4种希望透明处理的颜色，只按住Alt键点击将清除所有透明色设置。
如果渲染帧率过低，可调小节画面分辨率：`Ctrl+,`（或`Alt+,`）为降低，`Ctrl+.`（或`Alt+.`）为升高。

以下为一些渲染设置的快捷键汇总：（`Alt`可替换为`Ctrl`）
|快捷键|命令|
|-----|-----|
|`=`   |增加3D视野层叠数|
|`-`   |减少3D视野层叠数|
|`]`   |增加3D视野像素不透明度|
|`[`   |减少3D视野像素不透明度|
|`;`   |减小截面视图尺寸|
|`'`   |增加截面视图尺寸|
|`,`   |背景变暗|
|`.`   |背景变亮|
|`9`   |减小摄像机视角(FOV)|
|`0`   |提高摄像机视角(FOV)|
|`C`   |线框模式|
|`Alt+[`   |线框模式|
|`Alt+,`   |降低画面分辨率|
|`Alt+.`   |提高画面分辨率|
|`Alt+1`   |默认画面配置|
|`Alt+2`   |3D视野优化配置（隐藏截面、增加层数降、低分辨率）|
|`Alt+3`   |截面优化配置（取消3D视野叠加、放大截面）|
|方向键   |调整3D视野显示视角|

### 太阳控制

关于四维行星、太阳系统请参考[这篇文章](https://wxyhly.github.io/2018/08/12/orbit4d/)。下面仅介绍展开面板中Sun下的参数设置：
- ***纬度*** 设置当地的纬度值，范围0至90（注意不是-90至90）；
- ***南方时*** 与 ***北方时*** 分别对应南北方两种计时系统的时刻，它们反映的是当地的两个经度值。
- ***季节*** 为公转轨道的角度值；
- ***南回归线*** 和 ***北回归线*** 为一年中太阳最南、最北直射纬度值，即两个黄赤交角。
- ***阴阳自转周期***  与 ***东西自转周期***  分别对应南北极自转一周的小时数。
- 后面的 ***太阳高度角*** 和 ***直射点纬度*** 为只读量。
- ***TimeStep***  可以调节时间流逝速度。

## 灵感来源（感谢）
- [4DToys](http://4dtoys.com/)
- [4DBlock](http://www.urticator.net/blocks/)
- [Tetraspace](https://rantonels.itch.io/brane)

## 后续计划

- 四维光线追踪离线渲染器（~~又要无限搁置了~~动工一部分了）
- 四维流体离线模拟（又双叒叕要无限搁置了）
- 最新计划：重新制作一个基于WebGPU技术的全新4D渲染引擎——Tesserxel