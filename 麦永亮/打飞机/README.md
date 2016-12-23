# 打飞机
##套工作室模板后的打飞机小游戏

##缺陷：
####1. 因为缩放原因，enableDrag无法使用


####2. 网上素材音乐无法获取

##1.  解决了无法拖动的缺陷：	
### 增加一个前提：
```javascript
this.checkInputIsOnPlane = function() {
  if ((game.input.x * 2 <= this.myplane.body.x + this.myplane.body.width * 2)
	 && (game.input.x * 2 >= this.myplane.body.x - this.myplane.body.width * 2) 
	 && (game.input.y * 2 <= this.myplane.body.y + this.myplane.body.height * 2)
	 && (game.input.y * 2 >= this.myplane.body.y - this.myplane.body.height * 2))
	 {
   		 return true;
 	 } else {
     return false;
     }
}				
```
##改良
1. 让飞机处于点击位置前方，这样可以在操控飞机时看到飞机，便于躲避子弹，增强了游戏的可操控性。
2. 改变了生成敌人的时间间隔，随时间增加，敌人生成间隔会减少，直到一个最小值，增强了游戏的可玩性。