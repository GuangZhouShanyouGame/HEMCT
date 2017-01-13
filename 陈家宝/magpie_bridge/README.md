# Phaser-Example
##### 24好玩 Phaser本地开发用脚手架

#### 项目依赖
- [Phaser](http://phaser.io/) - H5游戏引擎
- [Zepto](http://zeptojs.com/) - 轻量级的针对现代高级浏览器的JavaScript库
- [RequireJS](http://requirejs.org/) - JavaScript模块加载器

---

#### 目录结构
- assets
	- audio
	- images
- js
	- game-manager.js 游戏管理器
	- game-state.js 游戏场景（只需要在这个脚本中开发）
	- main.js 脚本总入口
	- music-manager.js 音乐管理器
- index.html

---

#### 游戏场景说明
游戏场景分为5个，其中主要游戏逻辑运行在play场景：
- boot 启动场景
- preload 加载场景
- create 开始场景
- play 游戏场景
- end 结束场景

---

#### Node官网以及anywhere官网

> https://nodejs.org/zh-cn/

> https://www.npmjs.com/package/anywhere
 
环境搭建完成后，直接anywhere 8080就可开启本地服务器。

---

#### 开发说明

本地服务器的环境搭建完毕之后，把Github上的开发模板下载到本地。通过开启anywhere 8080本地服务器访问下载下来的模板。可以看到这样的一个页面（记得右键－检查，然后点击模拟手机端，不然看不到效果）

![](http://images2015.cnblogs.com/blog/763758/201611/763758-20161128162559599-1856076741.png)

![](http://images2015.cnblogs.com/blog/763758/201611/763758-20161128162054787-963110631.png)

这个页面的代码也是很简单的，它的逻辑就写在game-state.js中

![](http://images2015.cnblogs.com/blog/763758/201611/763758-20161128163129115-290762067.png)


![](http://images2015.cnblogs.com/blog/763758/201611/763758-20161128163238990-1907238409.png)

所以，实际开发的过程中，需要做的也就是修改game-state.js里面的游戏代码就行。

---

#### 去除微信的顶部条之后的尺寸

iphone5 320 504

ihpone6 375 604

iphone6plus 414 672

在这里可以进行添加新的尺寸

![](http://images2015.cnblogs.com/blog/763758/201611/763758-20161128173902021-466689851.png)

![](http://images2015.cnblogs.com/blog/763758/201611/763758-20161128173925115-780447852.png)
