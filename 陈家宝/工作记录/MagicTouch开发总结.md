#MagicTouch开发总结
##开发过程中遇到的问题与解决方法：

### 一、手势轨迹没有显示
  * 原因：canvas不是像div这样的标签，一般都是不可以内嵌标签在里面的
  * 解决方案：将手势轨迹生成的**svm**标签直接放在**body**里

###二、magictouch在电脑上运行的没问题，且没报错，但在手机上运行却黑屏
 
  * 解决方案：引入vconsole库，并在手机端查找报错。
 ```javascript
 <script src="http://24haowan-cdn.shanyougame.com/public/js/vconsole.min.js"></script>
 ```
 **报错代码**
  ```javascript
onSwipe: (list) => {
     console.log(list);
},
onGesture: (res, points) => {
console.log(res);
this.res = res;
lastPoints = points;
}</script>
 ```
 **报错原因** 手机不支持es 6语法
**解决方法** 不适用es 6语法，改为普通函数定义
```javascript
onSwipe : function(list){
console.log(list);
},
 onGesture : function(res,points){
self.res = res;
lastPoints = points;
console.log(self.res);
 }
```
> 在函数定义里面，this是指向该函数对象，因此this.res = res;需改为self.res = res;

###三、3个气球的情况，左（或右）气球炸裂后，右（或左）气球会向中间移动，覆盖住中间的气球，写了检测碰撞的函数，但没有效，有时却不会。而中间气球炸裂，左右两个气球正常向中间靠拢，碰撞后则停止。
  * 解决方案：将参数改为数组传入
```javascript
	game.physics.arcade.collide(balloonArray[i], balloonArray, function() {
    balloonArray[i].body.velocity.x = 0;
}, null, this);
```

###四、如何使气球的绳子跟着气球移动，且是角度移动？
* 解决方案： 绳子用划线代替
```javascript
//气球绑礼物的线
balloon.line = new Phaser.Line(gift.x, gift.y, balloon.x, balloon.y);
//线跟着气球和礼物而移动（需要每帧执行）
this.lineMove = function(balloon) {
     balloon.line.fromSprite(balloon.gift, balloon, false);
}
```
**发现问题** 线没有显示出来
* 解决方案： 在render中写
```javascript
this.render = function(){
       for(var i = 0; i <this.balloonArray.length; i++){                        
           game.debug.geom(this.balloonArray[i].line, '#140a16', false );
        }                    
}

//在外面添加
game.state.add('render',game.States.play.render);
```

###五、画完手势后不能立即画下一个，画手势有点延长
 * **解决方法** 手势库使用的是DOM方法，这里面通过定时器来画手势，之前设置定时器的延迟时间为0也会延迟，这次干脆直接不用定时器，代码函数提到外面，结果发现解决问题

###六、引导动画重复播放问题
 * PS：这里定义了两个动画
```javascript
var tween1 = game.add.tween(finger).to({
    x: game.width * 0.5,
    y: game.height * 0.32
}, 1500, null, true, 0);

var tween2 = game.add.tween(finger).to({
    x: game.width * 0.8,
    y: game.height * 0.65
}, 1500, null, false, 0);
```
 **问题**：如何让这两个动画重复播放？有前后顺序
 想法，定义一个tween，让其添加这两个子动画，然后不断重复tween。但找文档和样例都没找到添加子动画的方法。
 **解决方法** 用chain将两个动画绑定起来
```javascript
tween2.onComplete.add(function() {
    finger.x = game.width * 0.2;
    finger.y = game.height * 0.65;
});
tween1.chain(tween2);
tween2.chain(tween1);
```

###七、游戏玩着玩着会导致浏览器崩溃，没有报错
* 解决方案： 一点点的测试游戏，看出问题出现的规律性，这里发现一到30多分时，就会卡住，猜测是生成多个气球的礼物时出现问题，就在最初就开始生成多个气球的礼物，发现生成一个和两个气球的礼物没问题，生成三个或以上气球的礼物就导致浏览器崩溃，那么问题应该出现在生成礼物的函数里面。然后根据最初的猜测——出现死循环导致浏览器崩溃，找到其中的一个do while循环，问题的根源所在，这个循环用于生成随机数，**随机数生成尽量不要在循环里写，若非要写，应该在循环执行超过预想次数后，return或break，并在此前console.warn输出警告**

##开发过程中遇到的问题（未找到解决方法的或用别的方法替代）：
### 一、开启了物理系统，以及礼物弹性，并且开启了边界检测，但实现不了礼物碰撞边界后反弹的效果，礼物直接跑去界外。
* 这里我用一个开了物理系统的地面放到边界外，用于检测礼物碰撞边界

>   在开发过程中，代码需要更系统、更专业的组织，因为需求也经常会变动，挺多参数需要提取出来，便于测试，这里需要提高自己组织，编写更简洁代码的能力。
> 这次MagicTouch游戏的开发过程，遇到了许多大大小小的问题，也调用了别人的手势库，学习并去修改、添加，挺多问题看似合理，但我们需要敢于去测试，去怀疑。 比如手势库这里，别人提供了一个timedelay的参数——长按一定时间后才会触发手势识别,我将他调为零，在移动端仍会有延迟，不能顺畅，一筹莫展，但仔细去看他的代码，实际timedelay就是定时器的延迟参数，设为0不行，那么直接去掉，结果问题就解决了，之前在这里徘徊过，但没有去修改，问题也没解决到。
> 遇到最多的问题就是更改一个需求，会导致其他问题需要解决，以后在代码组织这块需要提高多些，看些设计模式。