# 201612月PlaneFight游戏总结
> 第一个游戏开发结束也是遇到了很多小问题，归根到底是自己对phaser不够熟悉，对JavaScript运用不够灵活，在此总结一些以后可能还会遇到的问题解决方法和自己对以后的游戏开发学习的规划。

- **背景图片适配** 由于retina屏幕下1个px像素会被渲染成4个（宽2个高2个）所以模板对canvas画布进行了放大2倍后又缩小，图片也是基于iphone6的大小出的2倍图，所以要想让背景图适配不同屏幕大小在模板上只需要设置

```javascript
sprite.width = game.world.width;
sprite.height = game.world.height;
```
- **滚动背景适配** 滚动的背景一般是采用tileSprite.autoScroll()进行，以背景图片适配的方法设置tileSprite不起作用，用tileScale进行缩放即可。
```javascript
var planteS = game.world.width / game.cache.getImage('plante').width;
plante = game.add.tileSprite(0,0,game.world.width,game.world.height,"plante");
plante.tileScale.setTo(planteS,planteS);
game.physics.startSystem(Phaser.Physics.ARCADE);
plante.autoScroll(0,game.world.height / 20);
```
- **引用外来字体开始不能显示** 按照正常方法引用外来字体，在刚开始时字体并不会显示，这是因为游戏只有在字体需要调用的时候才会真正的加载进来，所以就需要在游戏开始的时候在别的地方进行一次看不见的调用。
```javascript
@font-face {
    font-family: 'score';
	src: url('assets/score.otf');
}
	
#fontText{
	position: absolute;
	left:-80px;
	font-family: "score";
}
<span id="fontText">12</span>
```
- **游戏分数位数过多时超出分数背景** 加个判断就好
```javascript
this.scoreBg.width = this.scoreText.right < 220 ? 220 : this.scoreText.right;
```
- **游戏碰撞检测** 使用`game.physics.arcade.collide`可能会出现不需要的物理碰撞效果，所以在一般情况下可使用`game.physics.arcade.overlap`需要的话可以模拟碰撞效果，性能相比collide也比较高。
- **游戏对象池** 在第一次使用对象池的时候总是会出现对象扎堆生成的问题，原因是我多次remove timer和新建timer，导致的一些问题。特别是在循环中新建timer要注意新建的timer是会一直存在，所以不小心会出现timer叠加，造成对象扎堆生成。
```javascript
if( score >= 130 && score < 300 && this.timerControl == 0){
    this.timerControl++;
    this.enemyLitileTimer1.delay = 1000;
    this.enemyMiddleTimer1 = game.time.events.loop(4000, this.generateEnemy2, this);
} //让判断执行一次，利用timer.delay改变时间间隔
```
- **音乐快速的多次播放时需要先停止再播放** 因为在音乐播放未完成不会开始下一次播放，所以就导致事件和音乐的播放不同步，好像音乐有延迟一样，需要先停止一次。
- **以input模拟按下事件** 由于做了屏幕缩放，所以在屏幕中`sprite.y = input.y * 2` 而不是input.y，所以在位置范围控制的时候会有些麻烦。
```javascript
// 判断输入是否在飞机上
this.checkInputInPlane = function(){
    if(game.input.x < this.plane.x / 2 + this.plane.width /4
        && game.input.x > this.plane.x / 2 - this.plane.width /4
        && game.input.y > this.plane.y / 2 - this.plane.height / 4 && game.input.y < this.plane.y / 2 + this.plane.height / 4)
    {
        this.inputInPlane = true;
    }
};
```
**经过这次的尝试和摸索在我第二次写游戏的时候代码也算是整洁了许多，也通过google解决了很多实现中的很多问题，自己动手解决问题时不停的思考不停的试探方法，虽说可能会花费很多时间最后被别人一句话点懂，但整个过程才是提升最多的时候，有了自己思考的程序才能帮助自己有所进步，而且通过自己解决的问题还会有些小小的成就感。**
**接下来可能想去更加深入的学习面向对象更加整洁优雅的组织自己的代码。**


