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

			function Brick() {
				scaleRate = (game.world.width / 4) / game.cache.getImage("brick").width; //放大倍数
				this.init = function() {
					this.bricks = game.add.group();
					this.bricks.enableBody = true;
					this.bricks.createMultiple(100, "brick");
					this.speed = 100; //移动速度
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
					return bricks.iterate("id", this.setID(posX, posY), Phaser.Group.RETURN_CHILD); //根据ID返回一个brick
				}

				this.generateBricks = function() { //生成一行砖块，其中随机一个不生成
					this.nullPosition = game.rnd.integerInRange(0, 3);
					for (var i = 0; i < 4; i++) {
						if (i != this.nullPosition) {
							var b = this.bricks.getFirstExists(false);
							if (b) {
								b.reset(i * game.world.width / 4, -game.cache.getImage("brick").height * scaleRate);
								b.width = game.world.width / 4;
								b.height = game.cache.getImage("brick").height * scaleRate;
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
					var b = this.bricks.getFirstExists(false);
					if (b) {
						b.reset(brick.x, brick.y + game.cache.getImage("brick").height * scaleRate);
						b.width = game.world.width / 4;
						b.height = game.cache.getImage("brick").height * scaleRate;
						b.body.velocity.y = this.speed; 	
						//b.body.width *= 0.8;					
						this.setBrickPos(b, brick.posX, (brick.posY - 1));
					}
					//console.log('brick.posX: ' + brick.posX);
					//console.log('brick.posY: ' + brick.posY);
					console.log('hit brick id:' + brick.id);
				}

				this.countBricks = function(startBrick) { //返回某一行其他砖块的个数
					var moveX = 1;
					var curX = startBrick.poxX + moveX;
					var curY = startBrick.posY;
					var count = 0;

					while (getBrick(curX, curY) != null) {
						count++;
						curX += moveX;
					}

					moveX = -1;
					curX = startBrick.poxX + moveX;

					while (getBrick(curX, curY) != null) {
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

					//加载音效
					game.load.audio('bg', "assets/audio/bg.mp3");
					// 安卓只能同时播放一个音乐
					if (self.gameManager.device.platform != 'android') {
						game.load.audio('input', "assets/audio/tap.mp3");
					}
				};
			};

			// State - create
			// 开始界面
			game.States.create = function() {
				this.create = function() {
					// 初始化音乐
					if (self.gameManager.device.platform != 'android') {
						self.musicManager.init(['bg', 'input']);
					} else {
						self.musicManager.init(['bg']);
					}
					game.state.start('play');
				}
			};

			// State - play
			// 游戏界面
			game.States.play = function() {
				this.create = function() {
					// 此处写游戏逻辑

					// 示例-创建背景音乐
					self.musicManager.play("bg");
					game.input.onDown.add(function() {
						self.musicManager.play("input");
					});

					// 示例-创建游戏背景
					var bg = game.add.image(0, 0, "bg");
					bg.width = game.world.width;
					bg.height = game.world.height;

					this.Brick = new Brick(); //初始化上方砖块
					this.Brick.init();

					this.myBricks = game.add.group(); //发射的砖块组
					this.myBricks.enableBody = true;
					this.myBricks.createMultiple(10, 'brick');
					//this.myBricks.setAll('outOfBoundsKill', true);
					//this.myBricks.setAll('checkWorldBounds', true);

					game.input.onDown.add(this.shootBrick, this);
				};

				this.resetShootBrick = function(i) { //重置发射的砖块
					if (i <= 3) {
						var myBrick = this.myBricks.getFirstExists(false);
						if (myBrick) {
							myBrick.reset((game.width / 4) * i, game.height);
							myBrick.width = game.world.width / 4;
							myBrick.height = game.cache.getImage("brick").height * scaleRate;
							myBrick.body.velocity.y = -300;
							console.log(i);
						}
					}
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

				this.hitBrick = function() {
					this.Brick.replaceBrick(arguments[0], arguments[1]);
					console.log('hitBrick');
				}

				this.update = function() {
					// 每一帧更新都会触发
					game.physics.arcade.overlap(this.myBricks, this.Brick.bricks, this.hitBrick, null, this);
					//game.physics.arcade.overlap(this.Brick.bricks);
				};
				// 游戏结束
				this.gameEnd = function() {

				};
			};

			// State - end
			// 游戏结束界面
			game.States.end = function() {
				this.create = function() {
					// 游戏结束
					game.paused = true;
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