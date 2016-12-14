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
					game.load.image('platform', "assets/images/platform.png");
					game.load.atlasJSONArray('dog', 'assets/images/dog.png', 'assets/images/dog.json');
					game.load.atlasJSONArray('dinosaur', 'assets/images/dinosaur.png', 'assets/images/dinosaur.json');
					game.load.image('emitter', 'assets/images/emitter.png');
					game.load.image('emitter2', 'assets/images/emitter2.png');

					game.load.image('white', 'assets/images/white.png');
					game.load.image('gold', 'assets/images/gold.png');

					//加载音效
					game.load.audio('bg', "assets/audio/BGM.mp3");
					game.load.audio('hit', 'assets/audio/hit.mp3');
					game.load.audio('tap', 'assets/audio/tap.mp3');


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
					/*
                    game.input.onDown.add(function(){
                        self.musicManager.play("input");
                    });
					*/
					// 示例-创建游戏背景
					game.physics.startSystem(Phaser.Physics.ARCADE);
					this.tap = game.add.sound('tap');
					this.hit = game.add.sound('hit');

					this.platform = game.add.sprite(0, game.height * 0.68, 'platform');
					this.platform.anchor.setTo(0.5, 0);
					this.platform.width = game.world.width * 4;
					game.physics.enable(this.platform, Phaser.Physics.ARCADE);
					this.platform.body.immovable = true;

					this.bg = game.add.image(0, 0, "bg");
					this.bg.width = game.world.width;
					this.bg.height = game.world.height;

					this.scoreBoard = game.add.group();
					this.white = this.scoreBoard.create(10, 30, 'white');
					this.gold = this.scoreBoard.create(this.white.x, this.white.y, 'gold');

					this.offset = new Phaser.Point(0, 40);

					var style = {
						font: "45px sText",
						fill: "#FE9400"
					};

					this.scoreText = this.add.text(this.white.x + this.white.width / 2 + 23, this.white.y + 5 + 30, self.score, style);

					this.scoreText.anchor.setTo(0.5, 0.5);

					this.dinosaurshadow = game.add.sprite(game.world.centerX, game.world.centerY, 'dinosaur');
					this.dinosaurshadow.tint = 0x000000;
					this.dinosaurshadow.alpha = 0.6;
					this.dinosaurshadow.anchor.set(0.5);

					this.dinosaur = game.add.sprite(-game.world.width * 0.2, game.height - 448 - 130, 'dinosaur');
					this.dinosaur.animations.add('run', [0]);
					this.dinosaur.animations.add('jump', [0]);
					this.dinosaur.animations.play('run', 10, true);
					this.dinosaur.anchor.setTo(0.5, 0.5);

					this.dogshadow = game.add.sprite(game.world.centerX, game.world.centerY, 'dog');
					//this.dogshadow.anchor.setTo(0.5,0.5);
					this.dogshadow.tint = 0x000000;
					this.dogshadow.alpha = 0.6;
					this.dogshadow.anchor.set(0.5);

					this.dog = game.add.sprite(game.width + game.world.width * 0.2, game.height - 448 - 130, 'dog');
					this.dog.animations.add('run', [0]);
					this.dog.animations.add('jump', [0]);
					this.dog.animations.play('run', 10, true);
					this.dog.anchor.setTo(0.5, 0.5);
					this.rndSize();

					game.physics.enable(this.dog, Phaser.Physics.ARCADE);
					this.dog.body.gravity.y = 3000;

					game.physics.enable(this.dinosaur, Phaser.Physics.ARCADE);
					this.dinosaur.body.gravity.y = 3000;

					this.speed = game.world.width / 2;

					this.dinosaur.body.velocity.x = this.speed;
					this.dog.body.velocity.x = -this.speed;

					this.emitterdog = game.add.emitter(0, 0, 50);
					this.emitterdog.makeParticles('emitter2');


					this.emitterdinoasur = game.add.emitter(0, 0, 50);
					this.emitterdinoasur.makeParticles('emitter2');

					game.input.onDown.add(this.jump, this);
				};

				this.rndSize = function() {
					this.factor = game.rnd.integerInRange(0, 1); //生成一个随机数决定恐龙大小,等于1时，恐龙大
					console.log('factor:' + this.factor);
					if (this.factor == 1) {
						this.dog.scale.setTo(0.3, 0.3);
						this.dogshadow.scale.setTo(0.3, 0.10);
						this.dogshadow.y = this.platform.body.y - this.dog.height / 2 + this.offset.y;

						this.dinosaur.scale.setTo(0.6, 0.6);
						this.dinosaurshadow.scale.setTo(0.6, 0.2);
						this.dinosaurshadow.y = this.platform.body.y - this.dinosaurshadow.height / 2 + 　this.offset.y*1.5;
					} else {
						this.dog.scale.setTo(0.6, 0.6);
						this.dogshadow.scale.setTo(0.6, 0.2);
						this.dogshadow.y = this.platform.body.y - this.dog.height / 2 + this.offset.y*1.5;

						this.dinosaur.scale.setTo(0.3, 0.3);
						this.dinosaurshadow.scale.setTo(0.3, 0.10);
						this.dinosaurshadow.y = this.platform.body.y - this.dinosaurshadow.height / 2 + 　this.offset.y;
					}

				}

				this.jump = function() { //点击屏幕后挑跳起

					if (arguments[0].x >= game.width / 4 && (this.dog.body.y + this.dog.body.height == this.platform.body.y) && (this.dinosaur.body.y + this.dinosaur.body.height == this.platform.body.y)) { //点击屏幕左半边，并且狗在地面上，狗起跳
						this.dog.body.velocity.y = -900;
						this.dog.animations.play('jump', 10, true);
						this.tap.play();
					} else if (arguments[0].x < game.width / 4 && (this.dog.body.y + this.dog.body.height == this.platform.body.y) && (this.dinosaur.body.y + this.dinosaur.body.height == this.platform.body.y)) { //点击屏幕右半边，并且恐龙在地面上，恐龙起跳
						this.dinosaur.body.velocity.y = -900;
						this.dinosaur.animations.play('jump', 10, true);
						this.tap.play();
					} else {}
				}

				this.dog_run = function() {
					this.dog.animations.play('run', 10, true);
					this.emitterdog.x = this.dog.body.x + this.dog.body.width;
					this.emitterdog.y = this.dog.body.y + this.dog.body.height;
					this.emitterdog.start(true, 800, null, 1);
				}

				this.dinosaur_run = function() {
					this.dinosaur.animations.play('run', 10, true);
					this.emitterdinoasur.x = this.dinosaur.body.x;
					this.emitterdinoasur.y = this.dinosaur.body.y + this.dinosaur.body.height;
					this.emitterdinoasur.start(true, 800, null, 1);
				}

				this.next = function() {
					if (this.dinosaur.x > game.width) {
						self.score++;
						this.scoreText.text = self.score;
						this.dinosaur.reset(-game.world.width * 0.2, game.height - 448 - 130);
						this.dog.reset(game.width + game.world.width * 0.2, game.height - 448 - 130);
						this.rndSize();
						this.speed += 20; //每次速度加快
						this.dog.body.velocity.x = -this.speed;
						this.dinosaur.body.velocity.x = this.speed;
						console.log('speed:' + 　this.speed);
					}
				}


				this.update = function() {
					this.next();

					this.dogshadow.x = this.dog.x + this.offset.x;
					this.dinosaurshadow.x = this.dinosaur.x + this.offset.x;

					game.physics.arcade.collide(this.dinosaur, this.platform, this.dinosaur_run, null, this);
					game.physics.arcade.collide(this.dog, this.platform, this.dog_run, null, this);
					game.physics.arcade.collide(this.dog, this.dinosaur, this.gameEnd, null, this);
					// 每一帧更新都会触发
				};
				// 游戏结束
				this.gameEnd = function() {
					this.hit.play();

					if (this.dog.y > this.dinosaur.y) { //获取撞击的中间位置，用于生成粒子

						this.hitPositiony = this.dinosaur.y + (this.dog.y - this.dinosaur.y) / 2;
					} else {

						this.hitPositiony = this.dog.y + (this.dinosaur.y - this.dog.y) / 2;
					}


					if (this.dog.x > this.dinosaur.x) {

						this.hitPositionx = this.dinosaur.x + (this.dog.x - this.dinosaur.x) / 2;
					} else {

						this.hitPositionx = this.dog.x + (this.dinosaur.x - this.dog.x) / 2;

					}

					game.input.onDown.remove(this.jump, this);
					this.dog.body.destroy();
					this.dinosaur.body.destroy();

					this.emitter = game.add.emitter(0, 0, 40);
					this.emitter.makeParticles('emitter');
					this.emitter.x = this.hitPositionx;
					this.emitter.y = this.hitPositiony;

					//console.log('x:' +this.hitPositionx　+ ',y:' +　this.hitPositiony);
					//this.hitPositionx = Math.abs(this.dog.x-this.dinosaur.x);
					this.emitter.start(true, 2000, null, 40);

					game.time.events.add(Phaser.Timer.SECOND * 2, function() {
						game.state.start('end');
					}, this);


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