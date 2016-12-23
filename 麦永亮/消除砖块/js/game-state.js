/* 游戏场景 */
define(function() {
	var GameState = function(_game, _gameManager, _musicManager) {
		this.game = _game;
		this.gameManager = _gameManager;
		this.musicManager = _musicManager;
		this.init();
	};
	GameState.prototype = {
		// Phaser游戏示例
		game: null,
		// 游戏管理器
		gameManager: null,
		// 音乐管理器
		musicManager: null,
		// 游戏得分
		score: 0,

		// 初始化
		init: function() {
			var self = this;
			var game = this.game;
			game.States = {};

			var minY = 0;
			var maxY = 0;
			var scaleRate = 0;
			var brickHeight = 0;

			function Brick() {
				scaleRate = (game.world.width / 4) / game.cache.getImage("brick").width * 1.5; //放大倍数
				brickHeight = game.cache.getImage("brick").height * scaleRate;
				this.init = function() {
					this.bricks = game.add.group();
					this.bricks.enableBody = true;
					this.bricks.createMultiple(1070, "brick");
					this.speed = 120; //移动速度
					this.loopTime = game.cache.getImage('brick').height * scaleRate / this.speed * 1000; //砖块高度/移动速度
					//this.bricks.setAll('outOfBoundsKill', true);
					//this.bricks.setAll('checkWorldBounds', true);					
					//console.log(this.loopTime);
					this.timerForBarriers = game.time.events.loop(this.loopTime, this.generateBricks, this); //每过一定时间生成一次砖块
				}

				this.setBrickPos = function(brick, posX, posY) { //给brick加上posX，poxY（横纵的第几个）,和ID
					brick.posX = posX;
					brick.posY = posY;
					brick.id = this.setID(posX, posY);
				}

				this.setID = function(posX, posY) { //给每个砖块生成一个ID
					//console.log('ID: ' + posX + posY * 10);	
					return posX + posY * 10;
				}

				this.getBrick = function(posX, posY) {
					return this.bricks.iterate("id", this.setID(posX, posY), Phaser.Group.RETURN_CHILD); //根据ID返回一个brick
				}

				this.generateBricks = function() { //在屏幕上方生成一行砖块，其中随机一个不生成
					this.nullPosition = game.rnd.integerInRange(0, 3);

					for (var i = 0; i < 4; i++) {
						if (i != this.nullPosition) {
							var b = this.bricks.getFirstExists(false);
							if (b) {
								b.reset(i * game.world.width / 4, -brickHeight * 2);
								b.width = game.world.width / 4;
								b.height = brickHeight;
								b.body.velocity.y = this.speed;
								//b.body.width *= 0.8;
								this.setBrickPos(b, i, maxY);
							}
						}
					}
					maxY++;
				}

				this.replaceBrick = function(myBrick, brick) { //把发射的砖块替换成上方滚动的砖块
					myBrick.kill();
					console.log('kill');
					var b = this.bricks.getFirstExists(false);
					if (b) {
						b.reset(brick.x, brick.y + brickHeight);
						b.width = game.world.width / 4;
						b.height = brickHeight;
						b.body.velocity.y = this.speed;
						//b.body.width *= 0.8;					
						this.setBrickPos(b, brick.posX, (brick.posY - 1));
						console.log('Reset');
					}
					//console.log('brick.posX: ' + brick.posX);
					//console.log('brick.posY: ' + brick.posY);
					//console.log('hit brick id:' + brick.id);
				}

				this.countBricks = function(startBrick) { //返回某一行砖块的个数
					var moveX = 1;
					var curX = startBrick.posX + moveX;
					var curY = startBrick.posY;
					var count = 1;

					while (this.getBrick(curX, curY) != null) {
						count++;
						curX += moveX;
					}

					moveX = -1;
					curX = startBrick.posX + moveX;

					while (this.getBrick(curX, curY) != null) {
						count++;
						curX += moveX;
					}
					console.log('count: ' + count);
					return count;
				}
			}
			// State - boot
			// 游戏启动
			game.States.boot = function() {
				this.preload = function() {
					// 设置画布大小
					$(game.canvas).css("width", game.world.width / 2);
					$(game.canvas).css("height", game.world.height / 2);
					// 设置默认背景颜色
					game.stage.backgroundColor = '#aaa';
				};
				this.create = function() {
					// 进入preload状态
					game.state.start('preload');
				};
			};

			// State - preload
			// 加载游戏所需资源
			game.States.preload = function() {
				this.preload = function() {
					// 加载完成回调
					function callback() {
						game.state.start('create');
					}
					// 全部文件加载完成
					game.load.onLoadComplete.add(callback);

					game.load.image('bg', "assets/images/bg.png");
					game.load.image('brick', "assets/images/brick.png");
					game.load.image('line', "assets/images/line.png");
					game.load.image('emitter', "assets/images/emitter.png");
					game.load.image('bar', "assets/images/bar.png");

					//加载得分榜图片
					game.load.image('white', 'assets/images/white.png');
					game.load.image('gold', 'assets/images/gold.png');
					//加载音效
					//game.load.audio('bg', "assets/audio/bg.mp3");
					// 安卓只能同时播放一个音乐
					//if (self.gameManager.device.platform != 'android') {
					//	game.load.audio('input', "assets/audio/tap.mp3");
					//}
				};
			};

			// State - create
			// 开始界面
			game.States.create = function() {
				this.create = function() {
					// 初始化音乐
					/*
					if (self.gameManager.device.platform != 'android') {
						self.musicManager.init(['bg', 'input']);
					} else {
						self.musicManager.init(['bg']);
					}
					*/
					game.state.start('play');
				}
			};

			// State - play
			// 游戏界面
			game.States.play = function() {
				this.create = function() {
					// 此处写游戏逻辑

					// 示例-创建背景音乐
					//self.musicManager.play("bg");
					//game.input.onDown.add(function() {
					//	self.musicManager.play("input");
					//});

					// 示例-创建游戏背景
					//var bg = game.add.image(0, 0, "bg");
					//bg.width = game.world.width;
					//bg.height = game.world.height;

					this.Brick = new Brick(); //初始化上方砖块
					this.Brick.init();

					this.myBricks = game.add.group(); //发射的砖块组
					this.myBricks.enableBody = true;
					this.myBricks.createMultiple(10, 'brick');
					this.myBricks.setAll('checkWorldBounds', true);
					this.myBricks.setAll('outOfBoundsKill', true);

					this.scoreBoard = game.add.group();
					this.white = this.scoreBoard.create(10, 30, 'white'); //白色底
					this.gold = this.scoreBoard.create(this.white.x, this.white.y, 'gold'); //金牌		
					this.style = {
						font: "45px sText",
						fill: "#FE9400"
					};
					self.score = 0;
					this.scoreText = this.add.text(this.white.x + this.white.width / 2 + 23, this.white.y + 5 + 30, self.score + ' ', this.style, this.scoreBoard);
					this.scoreText.anchor.setTo(0.5, 0.5);
					//this.myBricks.setAll('outOfBoundsKill', true);
					//this.myBricks.setAll('checkWorldBounds', true);
					this.line = this.add.sprite(0, game.world.height * 0.8, 'line');
					this.line.width = game.world.width;
					this.line.height *= scaleRate;
					game.physics.enable(this.line, Phaser.Physics.ARCADE);
					this.line.body.immovable = true;

					this.bar = this.add.sprite(10 + this.white.width + 15, 45, 'bar');

					game.input.onDown.add(this.shootBrick, this);
				};

				this.resetShootBrick = function(i) { //重置发射的砖块,发射速度在这里改
					if (i <= 3) {
						var myBrick = this.myBricks.getFirstExists(false);
						if (myBrick) {
							myBrick.reset((game.width / 4) * i, game.height);
							myBrick.width = game.world.width / 4;
							myBrick.height = brickHeight;
							myBrick.body.velocity.y = -5000;
							//console.log(i);
						}
					}
					//console.log('Living: ' + this.myBricks.countLiving() + '   Dead: ' + this.myBricks.countDead());
				}

				this.shootBrick = function() { //点击后发射砖块
					if (arguments[0].x <= game.width / 8) { //4个位置
						this.resetShootBrick(0);
					} else if (arguments[0].x > game.width / 8 && arguments[0].x <= game.width / 4) {
						this.resetShootBrick(1);
					} else if (arguments[0].x > game.width / 4 && arguments[0].x <= game.width * 3 / 8) {
						this.resetShootBrick(2);
					} else {
						this.resetShootBrick(3);
					}
				}

				this.multiple = 1;	//存储倍数
				this.combo = 0;		//存储连击的变量
				this.timeToMutiple = 10;	//加倍所需的连击次数

				this.killBrick = function(brick) { //消除砖块函数
					var posX = brick.posX;
					var posY = brick.posY - 1;
					var currentBrick = this.Brick.getBrick(posX, posY);
					var count = this.Brick.countBricks(currentBrick)
					if (count == 4) {
						for (var i = 0; i < 4; i++) {
							this.Brick.getBrick(i, posY).destroy();
							//this.Brick.getBrick(i, posY).kill(); 							
						}
						//console.log('Living: ' + this.Brick.bricks.countLiving() + '   Dead: ' + this.Brick.bricks.countDead());
						this.moveBrickBehind(posY);
						//this.createEmitter(brick.y+brickHeight * 1.5);
						this.combo++;
						this.showCombo(brick.x, brick.y + brickHeight);
						minY++;
						self.score = self.score + this.multiple;
						this.scoreText.text = self.score + ' ';

					} else if (count == 1) { //增加了一层
						minY--;
						this.combo = 0;
						this.multiple = 1;
					} else {
						this.combo = 0;
						this.multiple = 1;
					}
					//console.log('minY: ' + minY);
				}

				this.moveBrickBehind = function(posY) { //移动后方的砖块，并重置他们的posY与ID
					for (var j = posY - 1; j >= minY; j--) {
						for (var i = 0; i < 4; i++) {
							var a = this.Brick.getBrick(i, j)
							if (a) {
								a.y -= brickHeight; //向上移
								this.Brick.setBrickPos(a, i, j + 1); //重置后面的posY和id									
							}
						}
					}
				}

				this.createEmitter = function(y) { //撞击后粒子效果函数、暂不启动
					// 粒子器坐标点在(game.world.centerX, y)，最大粒子数150
					this.emitter = game.add.emitter(game.world.centerX, y, 100);
					// 发射器宽度
					this.emitter.width = game.world.width;
					// 发射粒子
					this.emitter.makeParticles('emitter', 0, 100, 1, true);
					// 最小速度和最大速度
					this.emitter.minParticleSpeed.set(0, 0);
					this.emitter.maxParticleSpeed.set(0, 120);
					// 旋转、透明度、尺寸范围
					//this.emitter.setRotation(0, 0);
					this.emitter.setAlpha(0.8, 0.2);
					this.emitter.setScale(0.2, 0.2, 0.1, 0.1);
					// 重力
					this.emitter.gravity = -200;
					this.emitter.bounce.setTo(0.5, 0.5);
					// true代表粒子一次性全部发射
					// 500代表生命时长，每个粒子最多存在500ms					
					this.emitter.start(true, 500, null, 100);
				}

				this.showCombo = function(x, y) { //显示连击效果的函数
					this.comboText = this.add.text(x + game.world.width / 8, y, 'x' + this.combo, this.style);
					this.comboText.anchor.setTo(0.5, 0);
					this.comboTween = game.add.tween(this.comboText).to({
						alpha: 0
					}, 380, Phaser.Easing.Linear.None, false, 0, 0, false); //150ms内变透明的动画
					this.comboTween.start();
					this.comboTween.onComplete.add(function() {
						this.comboText.destroy();
					}, this);

					if (this.combo === this.timeToMutiple) {
						this.multiple = 2;
						this.showMultiple();
					} else if (this.combo === this.timeToMutiple * 2) {
						this.multiple = 3;
						this.showMultiple();
					} else if (this.combo === this.timeToMutiple * 3) {
						this.multiple = 4;
						this.showMultiple();
					}

				}

				this.showMultiple = function() {
					this.Brick.bricks.setAll('body.velocity.y',0);
					game.time.events.pause(true);  
					var doubleText = this.add.text(game.world.centerX, game.world.centerY, 'X' + this.multiple, this.style);
					doubleText.anchor.setTo(0.5, 0.5);
					var doubleTween = game.add.tween(doubleText).to({
						fontSize: 250
					}, 500, Phaser.Easing.Linear.None, false, 0, 0, false);
					doubleTween.start();
					doubleTween.onComplete.add(function() {
						doubleText.destroy();
						this.Brick.bricks.setAll('body.velocity.y',this.Brick.speed);
						game.time.events.resume();
					}, this);

				}

				var hit = false;
				this.hitBrick = function(mybrick, brick) { //砖块撞击时的函数
					if (!hit) {
						this.Brick.replaceBrick(mybrick, brick);
						//console.log('hitBrick');
						hit = true;
						setTimeout(function() {
							hit = false;
						}, 10);

						this.killBrick(brick);
					}
				}

				this.update = function() {
					// 每一帧更新都会触发
					game.physics.arcade.overlap(this.myBricks, this.Brick.bricks, this.hitBrick, null, this);
					game.physics.arcade.overlap(this.line, this.Brick.bricks, this.gameEnd, null, this);
					//game.physics.arcade.collide(this.myBricks);
					this.bar.width = (game.world.width - this.bar.x - 20) * (this.combo % this.timeToMutiple) / this.timeToMutiple;

				};

				// 游戏结束
				this.gameEnd = function() {
					//this.Brick.bricks.setAll('body.speed',0);
					game.state.start('end');
				};
			};

			// State - end
			// 游戏结束界面
			game.States.end = function() {
				this.create = function() {
					// 游戏结束

					game.state.start('play');
					console.log("得分是: " + self.score);
					alert("得分是: " + self.score);
				}
			};

			// 添加游戏状态
			game.state.add('boot', game.States.boot);
			game.state.add('preload', game.States.preload);
			game.state.add('create', game.States.create);
			game.state.add('play', game.States.play);
			game.state.add('end', game.States.end);
			game.state.start('boot');
		}
	};
	return GameState;
});