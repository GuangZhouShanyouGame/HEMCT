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

			var Guide = new Array()

			function Brick() {
				scaleRate = (game.world.width / 4) / game.cache.getImage("brick").width; //放大倍数
				brickHeight = game.cache.getImage("brick").height * scaleRate;
				this.init = function() {
					this.bricks = game.add.group();
					this.bricks.enableBody = true;
					this.bricks.createMultiple(20, "brick");
					this.speed = game.world.height * 0.1; //移动速度
					this.loopTime = brickHeight / this.speed * 1000; //砖块高度/移动速度
					//this.bricks.setAll('outOfBoundsKill', true);
					//this.bricks.setAll('checkWorldBounds', true);					
					//console.log(this.loopTime);
					this.timerForBarriers = game.time.events.loop(this.loopTime, this.generateBricks, this); //每过一定时间生成一次砖块
					this.addSpeed = game.time.events.loop(1000,this.accelerate,this);
					
				}

				this.accelerate = function() {
					if (this.speed <= game.world.height * 0.45) {
						this.speed += game.world.height * 0.002;
						this.loopTime = brickHeight / this.speed * 1000;
						this.bricks.forEach(function(brick) {
							brick.body.velocity.y = this.speed;
						}, this);
						this.timerForBarriers.delay = this.loopTime;
					}
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
					if (self.score <= 8) {
						Guide.push(this.nullPosition);
					}					

					for (var i = 0; i < 4; i++) {
						if (i != this.nullPosition) {
							var b = this.bricks.getFirstDead(true, i * game.world.width / 4, -brickHeight * 3, 'brick');
							if (b) {
								b.reset(i * game.world.width / 4, -brickHeight * 2);
								b.width = game.world.width / 4;
								b.height = brickHeight;
								b.body.velocity.y = this.speed;								
								this.setBrickPos(b, i, maxY);
							}
						}
					}
					maxY++;
				}

				this.replaceBrick = function(myBrick, brick) { //把发射的砖块替换成上方滚动的砖块
					myBrick.kill();
					//console.log('kill');
					var b = this.bricks.getFirstDead(true, brick.x, brick.y + brickHeight, 'brick');
					if (b) {
						b.reset(brick.x, brick.y + brickHeight);
						b.width = game.world.width / 4;
						b.height = brickHeight;
						b.body.velocity.y = this.speed;
						//b.body.width *= 0.8;					
						this.setBrickPos(b, brick.posX, (brick.posY - 1));
						//console.log('Reset');
					}					
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
					game.load.image('bar0', "assets/images/bar0.png");
					game.load.image('bar1', "assets/images/bar1.png");
					game.load.image('bar2', "assets/images/bar2.png");
					game.load.image('bar3', "assets/images/bar3.png");
					game.load.image('operate_area', "assets/images/operate_area.png");
					game.load.image('guideText', "assets/images/guide.png");
					game.load.image('crash', "assets/images/crash.png");
					game.load.image('guideIcon', "assets/images/guideIcon.png");

					//加载得分榜图片
					game.load.image('white', 'assets/images/white.png');
					game.load.image('gold', 'assets/images/gold.png');
					//加载音效
					game.load.audio('bgm', "assets/audio/bgm.mp3");
					// 安卓只能同时播放一个音乐
					if (self.gameManager.device.platform != 'android') {
						game.load.audio('dead', "assets/audio/dead.mp3");
						game.load.audio('remove', "assets/audio/remove.mp3");
						game.load.audio('tap', "assets/audio/tap.mp3");
						game.load.audio('up_level', "assets/audio/up_level.mp3");
					}
				};
			};

			// State - create
			// 开始界面
			game.States.create = function() {
				this.create = function() {
					// 初始化音乐					
					if (self.gameManager.device.platform != 'android') {
						self.musicManager.init(['bgm', 'tap', 'dead', 'remove', 'up_level']);
					} else {
						self.musicManager.init(['bgm']);
					}
					game.state.start('play');
					minY = 0;
					maxY = 0;	
					Guide = new Array();
				}
			};

			// State - play
			// 游戏界面
			game.States.play = function() {
				this.create = function() {
					// 此处写游戏逻辑

					//示例-创建背景音乐
					//self.musicManager.stop("bgm");
					self.musicManager.play("bgm",true);					

					// 示例-创建游戏背景
					var bg = game.add.image(0, 0, "bg");
					bg.width = game.world.width;
					bg.height = game.world.height;

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
					
					this.line = this.add.sprite(0, game.world.height * 0.8, 'line');
					this.line.width = game.world.width;
					this.line.height *= scaleRate;
					game.physics.enable(this.line, Phaser.Physics.ARCADE);
					this.line.body.immovable = true;

					this.operate_area = this.add.image(0, this.line.y + this.line.height, 'operate_area');
					this.operate_area.width = game.world.width;
					this.operate_area.height = game.world.height - (this.line.y + this.line.height);

					this.guideText = this.add.image(game.world.width / 2, this.line.y - 30, 'guideText');
					this.guideText.anchor.setTo(0.5, 0);
					this.guideTextTween = this.add.tween(this.guideText).to({
						alpha: 0.2,
					}, 1000, null, true, 0, Number.MAX_VALUE, true);
					this.guideTextTween.start();

					this.bar0 = this.add.sprite(10 + this.white.width + 15, 45, 'bar0');
					this.bar1 = this.add.sprite(10 + this.white.width + 15, 45, 'bar1');
					this.bar2 = this.add.sprite(10 + this.white.width + 15, 45, 'bar2');
					this.bar3 = this.add.sprite(10 + this.white.width + 15, 45, 'bar3');

					this.bar0.width = game.world.width - this.bar0.x - 20;
					this.bar1.width = game.world.width - this.bar0.x - 20;
					this.bar2.width = game.world.width - this.bar0.x - 20;
					this.bar3.width = game.world.width - this.bar0.x - 20;

					this.explosions = game.add.group();
					this.explosions.createMultiple(20, 'crash');
					this.explosions.forEach(function(explosion) {
						explosion.animations.add('crash');
					}, this);
					game.input.onDown.add(this.isGuideShoot, this);
					game.input.onDown.add(this.generateGuide, this);

					this.multiple = 1; //存储倍数
					this.combo = 0; //存储连击的变量
					this.timeToMutiple = 100; //加倍所需的连击次数
					this.myBrickSpeed = -5000; //发射砖块的速度
					this.showOnce = false;
				};

				this.generateGuide = function() {
					if (self.score <= 9) {
						if (arguments[0].x >= Guide[self.score] * game.world.width / 8 && arguments[0].x < (Guide[self.score] + 1) * game.world.width / 8) {
							if (this.guideIcon) {
								this.guideIcon.destroy();
							}
							if (self.score <= 8) {
								//console.log(Guide[(self.score)]);
								this.guideIcon = game.add.sprite(Guide[(self.score + 1)] * game.world.width / 4 + game.world.width * 0.032, game.world.height * 0.84, 'guideIcon');
								this.guideIcon.width = game.world.width / 4 * 0.8;
								this.guideIcon.height = game.world.height * 0.13;
							}
							if (self.score === 9) {
								if (this.guideIcon) {
									this.guideIcon.destroy();
								}
								game.input.onDown.remove(this.generateGuide, this);
							}
						}

					}
				}

				var isNext = false;
				this.isGuideShoot = function() { //先验证是否还在教程范围									
					if (self.score <= 9) {
						if (!isNext) {
							if (arguments[0].x >= Guide[self.score] * game.world.width / 8 && arguments[0].x < (Guide[self.score] + 1) * game.world.width / 8) {
								this.shootBrick(arguments[0].x);
								isNext = true;
								setTimeout(function() {
									isNext = false;
								}, 300);
							}							
						}

					} else {
						this.shootBrick(arguments[0].x);
					}
				}

				this.shootBrick = function(x) {
					if (self.gameManager.device.platform != 'android') {
						self.musicManager.stop("tap");
						self.musicManager.play("tap");
					}
					if (x <= game.world.width / 8) { //4个位置
						this.resetShootBrick(0);
					} else if (x > game.world.width / 8 && x <= game.world.width / 4) {
						this.resetShootBrick(1);
					} else if (x > game.world.width / 4 && x <= game.world.width * 3 / 8) {
						this.resetShootBrick(2);
					} else {
						this.resetShootBrick(3);
					}
				}


				this.resetShootBrick = function(i) { //重置发射的砖块,发射速度在这里改
					if (i <= 3) {
						var myBrick = this.myBricks.getFirstExists(false);
						if (myBrick) {
							myBrick.reset((game.width / 4) * i, game.height);
							myBrick.width = game.world.width / 4;
							myBrick.height = brickHeight;
							myBrick.body.velocity.y = this.myBrickSpeed;
						}
					}
				}


				this.killBrick = function(brick) { //消除砖块函数
					var posX = brick.posX;
					var posY = brick.posY - 1;
					var currentBrick = this.Brick.getBrick(posX, posY);
					var count = this.Brick.countBricks(currentBrick)
					if (count == 4) {
						if (self.gameManager.device.platform != 'android') {
							self.musicManager.stop('remove'); 							
						}

						for (var i = 0; i < 4; i++) {
							this.Brick.getBrick(i, posY).destroy();
							//this.Brick.getBrick(i, posY).kill(); 							
						}
						this.moveBrickBehind(posY);
						this.combo++;
						if (this.combo > 1) {
							this.showCombo(brick.x, brick.y + brickHeight);
						}
						minY++;
						self.score = self.score + this.multiple;
						if (self.score == 9) {
							//this.guideTextTween.stop();
							this.guideText.destroy();
							//this.Brick.accelerate();
						}
						this.scoreText.text = self.score + ' ';
						if (self.gameManager.device.platform != 'android') {
							self.musicManager.play('remove');
						}

					} else if (count == 1) { //增加了一层
						minY--;
						this.combo = 0;
						this.multiple = 1;
					} else {
						this.combo = 0;
						this.multiple = 1;
					}
					//console.log('minY: ' + minY);
					var explosion = this.explosions.getFirstExists(false);
					if (explosion) {
						explosion.reset(brick.x, brick.y);
						explosion.play('crash', 10, false, true);
					}
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

				this.pauseGame = function() {
					this.Brick.bricks.setAll('body.velocity.y', 0);
					game.time.events.pause(true);
					this.myBricks.forEachExists(function(x) {
						x.body.velocity.y = 0;
					}, this);
					game.input.onDown.remove(this.isGuideShoot, this);
				}

				this.resumeGame = function() {
					this.Brick.bricks.setAll('body.velocity.y', this.Brick.speed);
					this.myBricks.forEachExists(function(x) {
						x.body.velocity.y = this.myBrickSpeed;
					}, this);
					game.input.onDown.add(this.isGuideShoot, this);
					game.time.events.resume();
				}

				this.showMultiple = function() {
					//this.pauseGame();
					if (self.gameManager.device.platform != 'android') {
						self.musicManager.play('up_level');
					}

					var doubleText = this.add.text(game.world.centerX, game.world.centerY, 'X' + this.multiple, this.style);
					doubleText.anchor.setTo(0.5, 0.5);
					doubleText.fontSize = 150;
					
					var doubleTween = game.add.tween(doubleText).to({
						alpha: 0.2
					}, 350,Phaser.Easing.Linear.None,false, 0, 1, true);
					doubleTween.start();

					doubleTween.onComplete.add(function() {
						doubleText.destroy();
						//this.resumeGame();
					}, this);
					
				}

				this.updateBar = function() {
					if (this.combo >= 0 && this.combo < this.timeToMutiple) {
						this.bar1.width = (game.world.width - this.bar0.x - 20) * (this.combo % this.timeToMutiple) / this.timeToMutiple;
						this.bar2.width = 0;
						this.bar3.width = 0;

					} else if (this.combo >= this.timeToMutiple && this.combo <= this.timeToMutiple * 2) {
						this.bar1.width = game.world.width - this.bar0.x - 20;
						this.bar2.width = (game.world.width - this.bar0.x - 20) * (this.combo % this.timeToMutiple) / this.timeToMutiple;
						this.bar3.width = 0;

					} else if (this.combo >= this.timeToMutiple * 2 && this.combo < this.timeToMutiple * 3) {
						this.bar1.width = game.world.width - this.bar0.x - 20;
						this.bar2.width = game.world.width - this.bar0.x - 20;
						this.bar3.width = (game.world.width - this.bar0.x - 20) * (this.combo % this.timeToMutiple) / this.timeToMutiple;

					} else {
						this.bar1.width = game.world.width - this.bar0.x - 20;
						this.bar2.width = game.world.width - this.bar0.x - 20;
						this.bar3.width = game.world.width - this.bar0.x - 20;
					}
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

				
				this.showFirstGuide = function() {
					if (Guide[0] != undefined && this.showOnce === false) {
						this.guideIcon = game.add.sprite(Guide[0] * game.world.width / 4 + game.world.width * 0.032, game.world.height * 0.84, 'guideIcon');
						this.guideIcon.width = game.world.width / 4 * 0.8;
						this.guideIcon.height = game.world.height * 0.13;
						this.showOnce = true;		
					}
				}

				
				this.update = function() {
					// 每一帧更新都会触发
					game.physics.arcade.overlap(this.myBricks, this.Brick.bricks, this.hitBrick, null, this);
					game.physics.arcade.overlap(this.line, this.Brick.bricks, this.gameEnd, null, this);
					//game.physics.arcade.collide(this.myBricks);
					this.updateBar();
					this.showFirstGuide();
				};


				// 游戏结束
				this.gameEnd = function() {
					//this.Brick.bricks.setAll('body.speed',0);
					game.state.start('end');
					if (self.gameManager.device.platform != 'android') {
						self.musicManager.play('dead');
					}
					self.musicManager.stop('bgm');
				};
			};

			// State - end
			// 游戏结束界面
			game.States.end = function() {
				this.create = function() {
					// 游戏结束
					
					console.log("得分是: " + self.score);
					alert("得分是: " + self.score);
					game.state.start('create');
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