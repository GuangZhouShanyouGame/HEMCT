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
		//血量
		HP: 50,

		// 初始化
		init: function() {
			var self = this;
			var game = this.game;
			game.States = {};

			var foodPosition; //记录每次食物生成位置：0代表左边，1代表右边

			function Food(config) { //食物的函数
				this.init = function() { //初始化食物
					this.foods = game.add.group();
					this.foods.enableBody = true;
					this.foods.createMultiple(10, config.selfPic);
					this.foods.setAll('outOfBoundsKill', true);
					this.foods.setAll('checkWorldBounds', true);
				}

				this.generate = function(y) { //生成食物
					this.YPosition = y || 8;
					foodPosition = game.rnd.integerInRange(0, 1);
					if (foodPosition === 1) {
						this.Pos = game.world.width * (1 - 0.128);
					} else {
						this.Pos = game.world.width * 0.128;
					}
					var f = this.foods.getFirstExists(false);
					if (f) {
						f.reset(this.Pos, game.world.height * (2 * this.YPosition / 18 + 1 / 18));
						if (foodPosition != 0) {
							f.anchor.setTo(1, 0.5);
						} else {
							f.anchor.setTo(0, 0.5);
						}
						f.width = game.world.width / 7;
						f.height = game.world.height / 13;
					}
				}

				this.hitFood = function(actor, food) { //接触食物时HP增加，分数增加
					food.kill();
					self.HP += config.score;
					if (self.HP > 100)
						self.HP = 100;
					self.score++;
					config.game.updateHP();
				}

				this.whenTap = function() { //点击时食物向上移动
					this.foods.forEachExists(function(f) {
						f.y -= game.world.height / 9;
					});
				}
			}

			function Barrier() { //障碍物的函数
				this.init = function() { //初始化障碍物
					this.barriers = game.add.group();
					this.barriers.enableBody = true;
					this.barriers.createMultiple(10, 'barrier');
					this.barriers.setAll('outOfBoundsKill', true);
					this.barriers.setAll('checkWorldBounds', true);
					this.Times = 0; //记录已有多少次没有生成障碍物
					this.intervalTime = 4; //生成障碍物的间隔，每次生成障碍物后重新生成这一个东西
					this.Position; //障碍物生成位置
				}

				this.generate = function(y) { //生成障碍物的函数
					this.YPosition = y || 8;
					foodPosition === 0 ? this.Position = 1 : this.Position = 0;
					if (this.Position === 0) {
						this.Pos = game.world.width * 0.128;
					} else {
						this.Pos = game.world.width * (1 - 0.128);
					}

					var b = this.barriers.getFirstExists(false);
					if (b) {
						b.reset(this.Pos, game.world.height * (2 * this.YPosition + 1) / 18);
						b.width = game.world.width / 4;
						b.height = game.world.height / 13;
						b.anchor.setTo(1, 0.5);
						if (this.Position === 0) {
							b.width *= -1;
						}
					}
				}

				this.timeToGenerate = function(y) { //计算何时需要生成障碍
					this.Times++;
					if (this.Times >= this.intervalTime) {
						this.generate(y);
						this.Times = 0;
						if (self.score <= 20) {
							this.minInterval = 3;
							this.maxInterval = 5;
						} else if (self.score <= 50) {
							this.minInterval = 2;
							this.maxInterval = 4;
						} else {
							this.minInterval = 1;
							this.maxInterval = 3;
						}
						this.intervalTime = game.rnd.integerInRange(this.minInterval, this.maxInterval);
					}
				}

				this.whenTap = function() {
					this.barriers.forEachExists(function(b) {
						b.y -= game.world.height / 9;						
					});					
					this.timeToGenerate();
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
					game.load.image('wall', "assets/images/wall.png");
					game.load.image('actor', "assets/images/actor.png");
					game.load.image('food1', "assets/images/food1.png");
					game.load.image('food2', "assets/images/food2.png");
					game.load.image('food3', "assets/images/food3.png");
					game.load.image('barrier', "assets/images/barrier.png");
					game.load.image('hp0', "assets/images/hp0.png");
					game.load.image('hp1', "assets/images/hp1.png");
					game.load.image('guideIcon', "assets/images/guideIcon.png");

					//加载得分榜图片
					game.load.image('white', 'assets/images/white.png');
					game.load.image('gold', 'assets/images/gold.png');

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

					var play = this;
					// 示例-创建背景音乐
					self.musicManager.play("bg");
					game.input.onDown.add(function() {
						self.musicManager.play("input");
					});

					// 示例-创建游戏背景
					var bg = game.add.image(0, 0, "bg");
					bg.width = game.world.width;
					bg.height = game.world.height;

					this.initAll();
					game.input.onDown.add(this.next, this);

				};

				this.initAll = function() { //初始化
					this.initWall();
					this.initBarrier();
					this.initFood();
					this.initActor();
					this.initScoreBoard();
					this.initHPBar();
					this.initGuide();
					this.isGameOver = false;
				}

				this.initGuide = function() {
					this.leftGuideIcon = this.add.image(game.world.width * 0.45, game.world.height * 0.85, 'guideIcon');
					this.leftGuideIcon.width = -game.world.width * 0.23;
					this.leftGuideIcon.height *= -this.leftGuideIcon.width / game.cache.getImage('guideIcon').width;
					this.leftGuideIcon.anchor.setTo(0.5, 0.5);
					this.leftGuideIcon.x += this.leftGuideIcon.width / 2;

					this.rightGuideIcon = this.add.image(game.world.width * 0.55, game.world.height * 0.85, 'guideIcon');
					this.rightGuideIcon.width = game.world.width * 0.23;
					this.rightGuideIcon.height *= this.rightGuideIcon.width / game.cache.getImage('guideIcon').width;
					this.rightGuideIcon.anchor.setTo(0.5, 0.5);
					this.rightGuideIcon.x += this.rightGuideIcon.width / 2;

					this.leftGuideIconTween = this.add.tween(this.leftGuideIcon).to({
						height: this.leftGuideIcon.height * 0.8,
						width: this.leftGuideIcon.width * 0.8,
					}, 1000, null, true, 0, Number.MAX_VALUE, true);

					this.rightGuideIconTween = this.add.tween(this.rightGuideIcon).to({
						height: this.rightGuideIcon.height * 0.8,
						width: this.rightGuideIcon.width * 0.8,
					}, 1000, null, true, 0, Number.MAX_VALUE, true);

					game.input.onDown.addOnce(function() {
						this.leftGuideIcon.destroy();
						this.rightGuideIcon.destroy();
						game.time.events.resume();
					}, this);

				}

				this.initHPBar = function() { //初始化血条
					self.HP = 50; //一开始的生命值
					this.bar0 = this.add.sprite(10 + this.white.width + 15, 45, 'hp0');
					this.bar0.width = game.world.width - this.bar0.x - 20;
					this.bar0.height *= this.bar0.width / game.cache.getImage("hp0").width; //进度条底框

					this.bar1 = this.add.sprite(10 + this.white.width + 15, 45, 'hp1'); //三种颜色的进度条
					this.bar1.width = this.bar0.width * self.HP / 100;
					this.bar1.height = this.bar0.height;

					this.reduceAmount = 3; //一开始每过一秒减少多少HP
					this.reduceHpEvent = game.time.events.loop(1000, this.reduceHp, this);

					this.reduceRate = 1; //该参数为每过15秒减少多少HP
					this.reduceRateTime = 15; //该参数为每过多少秒减少一次
					game.time.events.loop(1000 * this.reduceRateTime, this.accelerateReduce, this); //加速减少HP接口	
					game.time.events.start();
					game.time.events.pause();
				}

				this.reduceHp = function() { //每过一秒减少HP
					if (self.HP > 0) {
						self.HP -= this.reduceAmount;
						if (self.HP < 0)
							self.HP = 0;
						this.updateHP();
					}
				}

				this.accelerateReduce = function() { //加速减少HP
					rR = this.reduceRate || 0;
					this.reduceAmount += rR;
				}

				this.initScoreBoard = function() { //初始化得分榜
					this.scoreBoard = game.add.group();
					this.white = this.scoreBoard.create(10, 30, 'white'); //白色底
					this.white.width = game.world.width * 0.28;
					this.white.height *= this.white.width / game.cache.getImage("white").width * 1.1;

					this.gold = this.scoreBoard.create(this.white.x, this.white.y, 'gold'); //金牌
					this.gold.width = game.world.width * 0.09;
					this.gold.height *= this.gold.width / game.cache.getImage("gold").width;

					this.style = {
						font: "sText",
						fill: "#FE9400"
					};
					self.score = 0;
					this.scoreText = this.add.text(this.white.x + this.white.width * 0.65, this.white.y + this.white.height * 0.55, self.score + ' ', this.style, this.scoreBoard);
					this.scoreText.anchor.setTo(0.5, 0.5);
					this.scoreText.fontSize = game.world.width * 0.055;
				}

				this.initActor = function() { //初始化主角
					this.actor = this.add.sprite(game.world.width * 0.128, game.world.height / 18 * 5, 'actor');
					this.actor.width = game.world.width / 7;
					this.actor.height = game.world.height / 15;
					this.actor.anchor.setTo(0, 0.5);
					game.physics.enable(this.actor, Phaser.Physics.ARCADE);
				}

				this.initWall = function() { //初始化墙
					this.walls = game.add.group();
					this.walls.enableBody = true;
					this.walls.createMultiple(20, "wall");
					this.walls.setAll('checkWorldBounds', true);
					this.walls.setAll('outOfBoundsKill', true);
					for (var i = 0; i < 9; i++) {
						for (var y = 0; y < 2; y++) {
							var w = this.walls.getFirstExists(false);
							if (w) {
								w.reset(y * game.world.width, i * game.world.height / 9);
								w.width = game.world.width * 0.128;
								w.height = game.world.height / 9;
								if (y != 0) {
									w.anchor.setTo(1, 0);
								}
							}
						}
					}
				}

				this.initFood = function() { //初始化食物
					var foodTeam = {
						food1: {
							game: this,
							selfPic: 'food1',
							score: 2	//食物增加的血量在这
						},
						food2: {
							game: this,
							selfPic: 'food2',
							score: 4
						},
						food3: {
							game: this,
							selfPic: 'food3',
							score: 6
						}
					}
					this.food1 = new Food(foodTeam.food1);
					this.food1.init();
					this.food2 = new Food(foodTeam.food2);
					this.food2.init();
					this.food3 = new Food(foodTeam.food3);
					this.food3.init();

					for (var i = 3; i < 9; i++) {
						this.type = game.rnd.integerInRange(0, 9);
						if (this.type > 0 && this.type < 5) {
							this.food1.generate(i);
						} else if (this.type >= 5 && this.type < 8) {
							this.food2.generate(i);
						} else {
							this.food3.generate(i);
						}
						if (i === 4 || i === 7) {
							this.barrier.generate(i);
						}
					}
				}

				this.initBarrier = function() { //初始化障碍
					this.barrier = new Barrier();
					this.barrier.init();
				}

				this.next = function() { //点击后各种效果
					if (arguments[0].x >= game.world.width / 4) {
						if (this.actor.x != game.world.width * (1 - 0.128)) {
							this.actor.x = game.world.width * (1 - 0.128);
							this.actor.width *= -1;
						}

					} else {
						if (this.actor.x != game.world.width * 0.128) {
							this.actor.x = game.world.width * 0.128;
							this.actor.width *= -1;
						}
					}

					//this.newWall();
					this.food1.whenTap();
					this.food2.whenTap();
					this.food3.whenTap();
					this.type = game.rnd.integerInRange(0, 9);
					if (this.type >= 0 && this.type < 5) {
						this.food1.generate();
					} else if (this.type >= 5 && this.type < 8) {
						this.food2.generate();
					} else {
						this.food3.generate();
					}
					this.barrier.whenTap();
				}

				this.updateHP = function() {
					this.scoreText.text = self.score + ' ';
					this.bar1.width = this.bar0.width * self.HP / 100;
					if (self.HP <= 0) {
						console.log('Game Over');
						this.isGameOver = true;
						game.time.events.stop();
						this.actor.body.gravity.y = 2500;
						//屏幕震动
						game.camera.shake(0.01, 100);
						//屏幕闪红
						//  You can set your own flash color and duration
						game.camera.flash(0xffffff, 500);
						this.gameEnd();
					}
				}

				this.newWall = function() { //点击后移动墙，并在下方生成新的墙，是否开启取决策划。
					this.walls.forEachExists(function(w) {
						w.y -= game.world.height / 9;
					});
					for (var y = 0; y < 2; y++) {
						var w = this.walls.getFirstDead(true, y * game.world.width, game.world.height * 8 / 9, 'wall');
						if (w) {
							w.reset(y * game.world.width, game.world.height * 8 / 9);
							w.width = game.world.width * 0.128;
							w.height = game.world.height / 9;
							if (y != 0) {
								w.anchor.setTo(1, 0);
							}
							//this.setWallPos(xxx);
						}
					}
				}

				this.hitBarrier = function() {
					self.HP = 0;
					this.updateHP();
				}

				this.update = function() {
					// 每一帧更新都会触发
					if (!this.isGameOver) {
						game.physics.arcade.overlap(this.actor, this.food1.foods, this.food1.hitFood, null, this.food1);
						game.physics.arcade.overlap(this.actor, this.food2.foods, this.food2.hitFood, null, this.food2);
						game.physics.arcade.overlap(this.actor, this.food3.foods, this.food3.hitFood, null, this.food3);
						game.physics.arcade.overlap(this.actor, this.barrier.barriers, this.hitBarrier, null, this);
					}
					if (this.isGameOver) {
						if (this.actor.y > this.world.height) {
							game.state.start('end');
						}
					}
				};
				// 游戏结束
				this.gameEnd = function() {
					game.input.onDown.remove(this.next, this);
					game.time.events.stop();
				};
			};

			// State - end
			// 游戏结束界面
			game.States.end = function() {
				this.create = function() {
					// 游戏结束
					//game.paused = true;
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