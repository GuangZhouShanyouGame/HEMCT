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

					//加载音效
					game.load.audio('bgm', "assets/audio/BGM.mp3");
					game.load.audio('hit', 'assets/audio/hit.mp3');
					game.load.audio('tap', 'assets/audio/tap.mp3');
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

					//加载游戏图片
					game.load.atlasJSONArray('dog', 'assets/images/dog.png', 'assets/images/dog.json')
					game.load.atlasJSONArray('dinosaur', 'assets/images/dinosaur.png', 'assets/images/dinosaur.json')
					game.load.image('bg', "assets/images/bg.png");
					game.load.image('platform', "assets/images/platform.png");
					game.load.image('crash', 'assets/images/crash.png')

					//加载得分榜图片
					game.load.image('white', 'assets/images/white.png');
					game.load.image('gold', 'assets/images/gold.png');		

					// 安卓只能同时播放一个音乐					
					if (self.gameManager.device.platform != 'android') {
						game.load.audio('tap', "assets/audio/tap.mp3");
					}					
				};
			};

			// State - create
			// 开始界面
			game.States.create = function() {
				this.create = function() {
					// 初始化音乐					
					if (self.gameManager.device.platform != 'android') {
						self.musicManager.init(['bgm', 'tap']);
					} else {
						self.musicManager.init(['bgm']);
					}					
					game.state.start('play');					
				}
			};

			// State - play
			// 游戏界面
			game.States.play = function() {
				this.create = function() {
					// 此处写游戏逻辑					
					self.musicManager.play("bgm",true);	 //play(key, volume, loop)

					//this.BGM = game.add.sound('bgm');
					//this.BGM.loop = true;
					//this.BGM.play();					

					game.physics.startSystem(Phaser.Physics.ARCADE);
					this.tap = game.add.sound('tap');
					this.hit = game.add.sound('hit');

					this.platform = game.add.sprite(0, game.height * 0.66, 'platform');
					this.platform.anchor.setTo(0.5, 0);
					this.platform.width = game.world.width * 3;
					game.physics.enable(this.platform, Phaser.Physics.ARCADE);
					this.platform.body.immovable = true;

					this.bg = game.add.image(0, 0, "bg");
					this.bg.width = game.world.width;
					this.bg.height = game.world.height;

					this.scoreBoard = game.add.group();
					this.white = this.scoreBoard.create(10, 30, 'white');	//白色底
					this.gold = this.scoreBoard.create(this.white.x, this.white.y, 'gold');	//金牌		
					this.style = {
						font: "45px sText",
						fill: "#FE9400"
					};
					this.scoreText = this.add.text(this.white.x + this.white.width / 2 + 23, this.white.y + 5 + 30, self.score + ' ', this.style ,this.scoreBoard);
					this.scoreText.anchor.setTo(0.5, 0.5);

					this.offset = new Phaser.Point(0, 40);	//阴影偏移量

					this.dinosaurshadow = game.add.sprite(game.world.centerX, game.world.centerY, 'dinosaur');
					this.dinosaurshadow.tint = 0x000000;
					this.dinosaurshadow.alpha = 0.6;
					this.dinosaurshadow.anchor.set(0.5);

					this.dogshadow = game.add.sprite(game.world.centerX, game.world.centerY, 'dog');
					this.dogshadow.tint = 0x000000;
					this.dogshadow.alpha = 0.6;
					this.dogshadow.anchor.set(0.5);

					this.dinosaur = game.add.sprite(-game.world.width * 0.2, game.height - 448 - 130, 'dinosaur');
					this.dinosaur.animations.add('run', [0]);
					this.dinosaur.animations.add('crash', [1]);
					this.dinosaur.anchor.setTo(0.5, 0.5);
					this.dinosaur.scale.setTo(-1, -1);

					this.dog = game.add.sprite(game.width + game.world.width * 0.2, game.height - 448 - 130, 'dog');
					this.dog.animations.add('run', [0]);
					this.dog.animations.add('crash', [1]);
					this.dog.anchor.setTo(0.5, 0.5);

					game.physics.enable(this.dog, Phaser.Physics.ARCADE);
					this.dog.body.gravity.y = 3000;

					game.physics.enable(this.dinosaur, Phaser.Physics.ARCADE);
					this.dinosaur.body.gravity.y = 3000;

					this.rndSize();
					this.speed = game.world.width / 2;

					this.dinosaur.body.velocity.x = this.speed;
					this.dog.body.velocity.x = -this.speed;

					game.input.onDown.add(this.jump, this);		//增加点击跳起功能

					this.dogShadowTween = game.add.tween(this.dogshadow).to({ //狗跳起时阴影变化动画
						width: this.dogshadow.width * 0.6,
						height: this.dogshadow.height * 0.6
					}, 300, null, false, 0, 0, true);
					this.dinosaurShadowTween = game.add.tween(this.dinosaurshadow).to({ //恐龙跳起时阴影变化动画
						width: this.dinosaurshadow.width * 0.6,
						height: this.dinosaurshadow.height * 0.6
					}, 300, null, false, 0, 0, true);

					this.dogJumpTween = game.add.tween(this.dog).to({ //狗跳起时角度改变的动画
						rotation: -0.2
					}, 600, null, false, 0, 0, false);
					this.dinosaurJumpTween = game.add.tween(this.dinosaur).to({ //恐龙跳起时角度改变的动画
						rotation: 0.2
					}, 600, null, false, 0, 0, false);
				};

				this.rndSize = function() {
					this.factor = game.rnd.integerInRange(0, 1); //生成一个随机数决定恐龙大小,等于1时，恐龙大

					if (this.factor == 1) {
						this.dog.scale.setTo(0.3, 0.3);
						this.dogshadow.scale.setTo(0.3, 0.10); //让阴影有扁平的效果
						this.dogshadow.y = this.platform.body.y - this.dog.height / 2 + this.offset.y; //阴影y坐标位置

						this.dinosaur.scale.setTo(-0.6, 0.6);
						this.dinosaurshadow.scale.setTo(-0.6, 0.2); //让阴影有扁平的效果
						this.dinosaurshadow.y = this.platform.body.y - this.dinosaurshadow.height / 2 + this.offset.y / 2;
					} 
					else {
						this.dog.scale.setTo(0.6, 0.6);
						this.dogshadow.scale.setTo(0.6, 0.2); //让阴影有扁平的效果
						this.dogshadow.y = this.platform.body.y - this.dog.height / 2 + this.offset.y * 1.5;

						this.dinosaur.scale.setTo(-0.3, 0.3);
						this.dinosaurshadow.scale.setTo(-0.3, 0.10); //让阴影有扁平的效果
						this.dinosaurshadow.y = this.platform.body.y - this.dinosaurshadow.height / 2 + 　this.offset.y / 2;
					}

					//console.log('dog: '+ (this.dog.body.y + this.dog.body.height));
					//console.log('dinosaur: '+ (this.dinosaur.body.y + this.dinosaur.body.height));
				}

				this.jump = function() { //点击屏幕后挑跳起
					if ((this.dog.body.y + this.dog.body.height == this.platform.body.y) && (this.dinosaur.body.y + this.dinosaur.body.height == this.platform.body.y)) {
						//当两个动物都在地面时才执行
						this.tap.play(); //点击时的音效		
						if (arguments[0].x >= game.width / 4) {
							//点击屏幕右半边，并且狗在地面上，狗起跳
							this.dog.body.velocity.y = -900; //起跳速度
							this.dog.rotation = 0.2; //跳起时角度改变
							this.dogJumpTween.start(); //播放狗跳起的动画
							this.dogShadowTween.start(); //播放阴影动画							
						} else if (arguments[0].x < game.width / 4) {
							//点击屏幕左半边，并且恐龙在地面上，恐龙起跳						
							this.dinosaur.body.velocity.y = -900;
							this.dinosaur.rotation = -0.2;
							this.dinosaurJumpTween.start();
							this.dinosaurShadowTween.start();
						} 
					}
				}

				this.next = function() { //更新下一轮
					if (this.dinosaur.x > game.width) { //当恐龙跑到屏幕右边时
						self.score++;
						this.scoreText.text = self.score + ' '; //更新分数

						this.dinosaur.reset(-game.world.width * 0.2, game.height - 448 - 130);
						this.dog.reset(game.width + game.world.width * 0.2, game.height - 448 - 130); //重置位置

						this.rndSize(); //随机分配大小

						this.speed += 20; //每次速度加快
						//速度要设定一个上限

						this.dog.body.velocity.x = -this.speed;
						this.dinosaur.body.velocity.x = this.speed;


						//console.log('speed:' + this.speed);
					}
				}

				this.dogRun = function() {
					this.dog.rotation = 0; //在地上时角度为0
				}

				this.dinosaurRun = function() {
					this.dinosaur.rotation = 0; //在地上时角度为0
				}

				this.update = function() {
					this.next();
					this.dogshadow.x = this.dog.x + this.offset.x; //阴影随着狗移动
					this.dinosaurshadow.x = this.dinosaur.x + this.offset.x;

					game.physics.arcade.collide(this.dinosaur, this.platform, this.dinosaurRun, null, this);
					game.physics.arcade.collide(this.dog, this.platform, this.dogRun, null, this);

					game.physics.arcade.collide(this.dog, this.dinosaur, this.gameEnd, null, this); //狗和恐龙撞击时，游戏结束
					// 每一帧更新都会触发
				};

				this.getCrashPosition = function(i) {
					if (i == 'x') { //当i=='x'时，返回x坐标
						if (this.dog.x > this.dinosaur.x) {

							this.hitPositionx = this.dinosaur.x + (this.dog.x - this.dinosaur.x) / 2;
						} else {

							this.hitPositionx = this.dog.x + (this.dinosaur.x - this.dog.x) / 2;
						}
						return this.hitPositionx;

					} else { //否则，返回y坐标
						if (this.dog.y > this.dinosaur.y) { //获取撞击的中间位置，用于生成粒子

							this.hitPositiony = this.dinosaur.y + (this.dog.y - this.dinosaur.y) / 2;
						} else {

							this.hitPositiony = this.dog.y + (this.dinosaur.y - this.dog.y) / 2;
						}
						return this.hitPositiony;
					}
				}

				this.playCrash = function() { //撞击后效果函数
					this.hit.play(); //播放撞击音效
					this.dog.play('crash'); //播放小狗撞击动画（其实就是换张图）
					this.dinosaur.play('crash');
					this.crash = game.add.sprite(this.getCrashPosition('x'), this.getCrashPosition('y'), 'crash'); //生成撞击效果图
					this.crash.anchor.set(0.5);
					this.crashTweenScale = game.add.tween(this.crash).to({
						width: this.crash.width * 2.5,
						height: this.crash.height * 2.5,
					}, 150, Phaser.Easing.Linear.None, false, 0, 0, false); //150ms内变大的动画

					this.crashTweenAlpha = game.add.tween(this.crash).to({
						alpha: 0,
					}, 1500, Phaser.Easing.Linear.None, false, 0, 0, false); //1500ms内变透明的动画

					this.crashTweenScale.start(); //开始执行动画
					this.crashTweenAlpha.start();
				}

				/*
				this.render = function(){
					game.debug.body(this.dog);
					game.debug.body(this.dinosaur);		//debug狗和恐龙的碰撞体积
				}*/

				// 游戏结束
				this.gameEnd = function() {
					this.playCrash(); //撞击后效果

					game.input.onDown.remove(this.jump, this); //去除点击跳起功能

					self.musicManager.stop("bgm"); //bgm停止播放

					this.dogShadowTween.stop();
					this.dinosaurShadowTween.stop();

					this.dogJumpTween.stop();
					this.dinosaurJumpTween.stop();

					this.dog.body.destroy();
					this.dinosaur.body.destroy();

					game.time.events.add(Phaser.Timer.SECOND * 2, function() {
						game.state.start('end');
					}, this); //延迟两秒后进入end界面
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