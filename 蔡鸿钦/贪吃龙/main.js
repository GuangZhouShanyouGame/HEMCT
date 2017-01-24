/* 游戏管理器 */
var Game = function(bestScore, config, domId) {
	this.bestScore = bestScore || 0;
	this.config = config;
	this.domId = domId || '';
};

Game.prototype = {
	// 得分
	score: 0,
	// 最高得分
	bestScore: 0,
	// 初始化标记
	isInit: false,
	// 音乐管理器
	musicManager: null,
	// 游戏实例插入的domId
	domId: null,


	//用于检测是否重新开始
    restart: false,
    //龙的长度
    length: 8,
    //龙的正常速度
    normalSpeed: 5,
    //龙减速之后的速度
    lowSpeed: 8,
    //龙加速之后的速度
    highSpeed: 3,


	// 设备信息
	device: {
		type : null,
		platform : null,
		width : 0,
		height : 0
	},
	// 画布大小
	canvasSize : {
		width : 0,
		height : 0,
		ratio : 0
	},
	// Phaser游戏对象实例
	instance : null,
	// 是否已经播放过音乐了（Safari访问必须同步调用才能播放音乐）
	playedMusic: false,

	// 初始化-设备信息
	initDevice : function() {
		this.device.width = game_width;
		this.device.height = game_height;
		if (game_width > game_height) {
			this.device.width = game_height;
			this.device.height = game_width;
		}
		this.device.platform = (navigator.userAgent.toLowerCase().indexOf('android') < 0) ? 'apple' : 'android';
		this.device.type = (this.device.width > 700) ? 'pad' : 'mobile';
	},
	// 初始化-画布大小
	initCanvasSize : function() {
		if (game_width < game_height) {
			this.canvasSize.width = game_width * 2;
			this.canvasSize.height = game_height * 2;
			this.canvasSize.ratio = this.canvasSize.width/this.canvasSize.height;
		}
	},
	// 开始游戏时的播放音乐方法（Safari访问必须同步调用才能播放音乐）
	toPlayMusic: function() {
		if (!this.playedMusic) {
			this.musicManager.play("bg", true);
			this.playedMusic = true;
		}
	},
	// 初始化-游戏
	init : function() {
		/**
		 * 上线用
		 * 显示加载页面
		 */
		// hwsdk.showLoadingPage();

		// Game实例（用于闭包）
		var self = this;

		// 初始化设备信息
		this.initDevice();

		// 初始化画布大小
		this.initCanvasSize();

		// 设置初始化标记
		this.isInit = true;

		// 创建Phaser游戏实例
		this.instance = new Phaser.Game(this.canvasSize.width, this.canvasSize.height, Phaser.CANVAS, this.domId);

		// 声明游戏场景集合
		this.instance.States = {};

		// Phaser游戏实例（非必须，game只是为了方便理解）
		var game = this.instance;

		//游戏逻辑添加部分
		var g_restart = this.restart;
        var score = this.score;
        var g_length = this.length;
        var g_normalSpeed = this.normalSpeed;
        var g_lowSpeed = this.lowSpeed;
        var g_highSpeed = this.highSpeed;
        //龙移动的速度
        var g_speed = g_normalSpeed;
        //在update函数中自增，判断是否要调用Move函数
        var g_timer = 0;
        //判断是否已经拐弯了
        var g_hasTurned = false;


        //这些变量用于手指移动检测
        var g_selectX = null;
		var g_selectY = null;
		var g_slectAble = true; 
        var g_eventStart, g_eventMove, g_eventEnd;

        //兼容移动端和浏览器端
		if ('ontouchstart' in document.documentElement || (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints >= 1)) {
			g_eventStart = 'touchstart';
			g_eventMove = 'touchmove';
			g_eventEnd = 'touchend';
		} else {
			g_eventStart = 'mousedown';
			g_eventMove = 'mousemove';
			g_eventEnd = 'mouseup';
		}


		// State - boot
		// 启动场景
		game.States.boot = function() {
			this.preload = function() {
				// 设置画布大小（视网膜屏下需要将Canvas压缩一下，才能保持高清）
				game.canvas.style.width = self.canvasSize.width/2 + "px";
				game.canvas.style.height = self.canvasSize.height/2 + "px";
				// 设置默认背景颜色
				game.stage.backgroundColor = '#aaa';
			};
			this.create = function() {
				game.state.start('preload');
			};
		};

		// State - preload
		// 加载场景
		game.States.preload = function() {
			this.preload = function() {
				/**
				 * 上线用
				 * 资源加载最小时长，平台要求加载页至少显示3秒
				 */
				// var deadLine = false;
				// setTimeout(function() {
				// 	deadLine = true;
				// }, 3000);

				/**
				 * 上线用
				 * 资源加载回调函数
				 */
				// function callback() {
				// 	if (deadLine == true) { // 已达到加载最少时长，进入准备场景
				// 		game.state.start('create');
				// 	} else { // 未达到加载最少时长，1秒后重试
				// 		setTimeout(function() {
				// 			callback();
				// 		}, 1000);
				// 	}
				// }

				/**
				 * 上线用
				 * 设置Phaser加载资源回调事件
				 */
				// game.load.onLoadComplete.add(callback);
				// game.load.onFileComplete.add(function(progress){
				// 	// 设置通用加载页进度条进度
				// 	hwsdk.configLoadingPage({progress: progress});
				// });

				/**----------------------------
				 * 加载资源示例
				 * 按需要参考下面的示例进行资源的加载
				------------------------------ */
				// 游戏资源集合，详情参考配置表
				// var config = self.config['game']; 

				// 加载游戏背景
				// if (config['bg'].indexOf('#') !== 0) game.load.image('bg', config['bg']); 

				// 加载普通图片资源
				// game.load.image('man', config['man']);

				// 加载音频资源
				// game.load.audio('bg', config['music_bg']);
				// if (self.device.platform != 'android') { // 大部分Android在浏览器中不支持多个音频同时播放，因此不加载以下音效
				// 	game.load.audio('dead', "//24haowan-cdn.shanyougame.com/skip/assets/audio/dead.mp3");
				// 	game.load.audio('pickup', "//24haowan-cdn.shanyougame.com/skip/assets/audio/pickup.mp3");
				// 	game.load.audio('move', config['music_move']);
				// }

				// 加载合图资源
				// game.load.atlasJSONArray('people', config['man'][0], config['man'][1]);

				/**
		         * 本地开发用，上线时请删除
		         */
				// 加载完成回调
                function callback() {
                    game.state.start('create');
                }
                // 全部文件加载完成
                game.load.onLoadComplete.add(callback);

                game.load.image('bg', "assets/images/background.png");
                game.load.image('head', "assets/images/head.png");
                game.load.image('body', "assets/images/body.png");
                game.load.image('tail', "assets/images/tail.png");
                game.load.image('happy', "assets/images/happy.png");
                game.load.image('sleepy', "assets/images/sleepy.png");
                game.load.image('round', "assets/images/round.png");
                game.load.image('tea', "assets/images/tea.png");
                game.load.image('alcohol', "assets/images/alcohol.png");
                game.load.image('redPaper', "assets/images/redPaper.png")
                game.load.image('tips', "assets/images/tips.png");
                game.load.image('end', "assets/images/end.png");
                game.load.image('knew', "assets/images/knew.png");
                game.load.image('score',"assets/images/score.png");
                game.load.image('score_bg',"assets/images/score_bg.png");
                game.load.image('one_score',"assets/images/one_score.png");
                game.load.image('button',"assets/images/knew.png");
			};
		};

		// State - create
		// 准备场景
		game.States.create = function() {
			this.create = function() {
				/**----------------------------
				 * 创建音乐播放器实例，详见下面的MusicManager
				 * 参数说明：（三个参数都是必须）
				 * 1: 游戏对象实例
				 * 2: 设备信息
				 * 3: 音频资源索引集合（数组类型，每个元素的值为音频资源的key）
				 * 注：这里不用考虑Android的音频播放问题，音乐播放器在播放时会进行判断
				---------------------------- */
				// self.musicManager = new MusicManager(game, self.device, ['bg', 'dead', 'pickup', 'move']);

				// 准备完毕，进入游戏场景
                game.state.start('play');
			};
		};

		// State - play
		// 游戏场景
		game.States.play = function() {
			var that = this;

			this.create = function() {
				/**
				 * 上线用
				 * 第一次开始游戏时执行的操作
				 * 说明：由于还没有播放过音乐，需要暂停游戏，让用户通过点击同步调用音乐的播放才能正常播放（Safari）
				 */
				// if (!self.playedMusic) {
				// 	// 暂停游戏
				// 	game.paused = true;
				// 	// 隐藏加载页面，显示开始页面，悬浮按钮
				// 	hwsdk.hideLoadingPage().showStartPage().showPageBtn();
				// 	// 工作台特殊处理
				// 	if (skip) { // 工作台直接开始游戏
				// 		game.paused = false;
				// 		gameManager.toPlayMusic();
				// 	} else { // 正常游戏
				// 		hwsdk.showBox(); // 弹出提示框
				// 	}
				// }

				/**----------------------------
				 * 游戏逻辑写在这里
				---------------------------- */
				// 在游戏结束的时候，执行gameover方法
				// this.gameover();
				 
				 
				// 创建游戏背景
                that.bg = game.add.image(0, 0, "bg");
                if(that.bg.width > that.bg.height)
                {
                	var temp_bgScale = that.bg.width / that.bg.height;
                	that.bg.height = game.world.width;
                	that.bg.width = that.bg.height * temp_bgScale;
                }
                else
                {
                	temp_bgScale = that.bg.height / that.bg.width;
                	that.bg.width = game.world.width;
                	that.bg.height = that.bg.width * temp_bgScale;
                }

                //创建存放茶道具的组
                that.teaGroup = game.add.group();
                //创建存放酒道具的组并开启物理引擎
                that.alcoholGroup = game.add.group();
                //创建存放红包的组
                that.redPaperGroup = game.add.group();
                //创建存放龙的数组
                that.dragonGroup = game.add.group();
                //创建存放加分标签的数组
                that.oneScoreGroup = game.add.group();
                //创建存放拐弯图片的数组
                that.roundGroup = game.add.group();

                //用于检测是否创建了游戏元素
                that.hasCreated = false;

                //不是重新开始游戏，加载提示图片
                if(! g_restart)
                {
                	//创建遮罩并进行缩放
                    var temp_tips = game.add.image(0, 0, 'tips');
                    if(temp_tips.width > temp_tips.height)
		            {
		            	var temp_bgScale = temp_tips.width / temp_tips.height;
		            	temp_tips.height = game.world.width;
		            	temp_tips.width = temp_tips.height * temp_bgScale;
		            }
		            else
		            {
		            	temp_bgScale = temp_tips.height / temp_tips.width;
		            	temp_tips.width = game.world.width;
		            	temp_tips.height = temp_tips.width * temp_bgScale;
		            }

		            //创建‘知道了’按钮
                    var temp_knew = game.add.image(game.world.centerX, game.world.height * 4 / 5, 'knew');
                    temp_knew.anchor.set(0.5, 0.5);


                    //添加一次点击监听事件
                    game.input.onDown.addOnce(function(p)
	                {
	                    if(! g_restart && !that.hasCreated)
	                    {
	                        if (Math.abs(p.x - temp_knew.x / 2) <= temp_knew.width / 2 && Math.abs(p.y - temp_knew.y / 2) <= temp_knew.height / 2)
	                        {
	                            temp_tips.destroy();
	                            temp_knew.destroy();


	                            //创建游戏元素
	                            that.CreateGameElement();
	                       }
	                    }
	                }, this);
                }
                else
                {
                	//创建游戏元素
                    that.CreateGameElement();
                }

                console.log('add');
                //添加点击事件
				$(game.canvas).off(g_eventStart, this.Select);
				$(game.canvas).off(g_eventMove, this.Swipe);
				$(game.canvas).off(g_eventEnd, this.SelectEnd);
				$(game.canvas).on(g_eventStart, this.Select);
				$(game.canvas).on(g_eventMove, this.Swipe);
				$(game.canvas).on(g_eventEnd, this.SelectEnd);
				console.log('yes');
			};

			//创建游戏元素
			this.CreateGameElement = function()
			{

	            that.hasCreated = true;
				//创建龙
                that.dragon = new Array(g_length);
                //创建龙尾
                that.dragon[0] = game.add.sprite(game.world.width - 70, game.world.centerY, 'tail');
                that.dragon[0].anchor.set(0.5, 0.5);
                that.dragonGroup.add(that.dragon[0]);
                //创建龙身，暂时先把身体的第一节当做龙头
                for(var i = 1;i < g_length - 1;i++)
                {
                    that.dragon[i] = game.add.sprite(that.dragon[i - 1].x - that.dragon[i - 1].width, game.world.centerY, 'body');
                    that.dragon[i].anchor.set(0.5, 0.5);
                    that.dragonGroup.add(that.dragon[i]);
                }
                //创建龙头
                that.dragon[g_length - 1] = game.add.sprite(0, game.world.centerY, 'head');
                that.dragon[g_length - 1].anchor.set(0.5, 0.5);
                that.dragon[g_length - 1].x = that.dragon[g_length - 2].x - that.dragon[g_length - 2].width;
                game.physics.enable(that.dragon[g_length - 1], Phaser.Physics.ARCADE);

                //创建龙头高兴的图片
                that.happy = game.add.sprite(game.world.centerX, game.world.centerY, 'happy');
                that.happy.anchor.set(0.5, 0.5);
                that.happy.visible = false;
                //创建龙头困的图片
                that.sleepy = game.add.sprite(game.world.centerX, game.world.centerY, 'sleepy');
                that.sleepy.anchor.set(0.5, 0.5);
                that.sleepy.visible = false;
                //用于检测是否替换了龙头的图片
                that.changeHead = false;

                //每次移动一节，所以把游戏速度设置为身体的宽度（这里高度和宽度相同，所以没什么关系）
                //默认蛇往左走
                that.moveX = -that.dragon[1].width;
                that.moveY = 0;


                //创建旋转角度数组，用于保存每个节点的角度信息，初始角度为0
                that.inflectedRotation = new Array(g_length);
                for(i = 0; i < g_length; i++)
                {
                    that.inflectedRotation[i] = 0;
                }

                //创建转弯数组，用于保存每个节点的拐弯信息
                that.round = new Array(g_length);
                for(i = 0; i < g_length; i++)
                {
                	that.round[i] = 0;
                }

                

                //开启定时器
                that.timeManager = game.time.events;
                //每隔三秒随机产生一个道具
                that.timeManager.loop(3000, this.CreateProp, this);

                //添加分数条
                that.titleGroup = game.add.group();
                that.scoreBg = game.add.sprite(0,16,"score_bg");
                that.score = game.add.sprite(-10,16,"score");
                that.scoreText = game.add.text(that.score.width + 45,50, score+" ", { font: "bold 40pt score", fill: "#FE9400"});
                that.scoreText.anchor.setTo(0.3,0.5);
                //添加组的元素
                that.titleGroup.add(that.scoreBg);
                that.titleGroup.add(that.score);
                that.titleGroup.add(that.scoreText);
                that.titleGroup.x = 50;
                that.titleGroup.y = 50;
			}

			//手指开始触摸
			this.Select = function(e) 
            {
				var x, y;
				if (g_eventStart == "mousedown") 
				{
					x = (e.clientX-(window.innerWidth-game_width)/2) * 2;
					y = (e.clientY-(window.innerHeight-game_height)/2) * 2;
				} 
				else 
				{
					x = e.touches[0].clientX * 2;
					y = e.touches[0].clientY * 2;
				}
				g_selectX = x;
				g_selectY = y;
				console.log('Select');
			};

			//手指移动
			this.Swipe = function(e) 
			{
				if (g_slectAble && g_selectX != null && g_selectY != null && that.hasCreated) 
				{
					var x, y;
					if (g_eventStart == "mousedown") 
					{
						x = (e.clientX-(window.innerWidth-game_width)/2) * 2;
						y = (e.clientY-(window.innerHeight-game_height)/2) * 2;
					} else 
					{
						x = e.touches[0].clientX * 2;
						y = e.touches[0].clientY * 2;
					}

					var deltaX = Math.abs(x - g_selectX);
					var deltaY = Math.abs(y - g_selectY);

					if (deltaX > 60 || deltaY > 60) // 滑动
					{ 
						g_slectAble = false;
						// 横向
						if (deltaX > deltaY) 
						{ 
							if (x >= g_selectX && that.moveX >= 0) //右
							{
								that.moveX = that.dragon[1].width;
                                that.moveY = 0;
                                if(that.inflectedRotation[g_length - 1] === 90) //由上往右拐弯
                                {
                                	that.round[g_length - 1] = 3;
                                	g_hasTurned = false;
                                }
                                if(that.inflectedRotation[g_length - 1] === -90) //由下往右拐弯
                                {
                                	that.round[g_length - 1] = 4;
                                	g_hasTurned = false;
                                }
                                that.inflectedRotation[g_length - 1] = 180;
							} 
							if (x < g_selectX && that.moveX <= 0)  //左
							{
								that.moveX = -that.dragon[1].width;
                                that.moveY = 0;
                                if(that.inflectedRotation[g_length - 1] === 90) //由上往左拐弯
                                {
                                	that.round[g_length - 1] = 1;
                                	g_hasTurned = false;;
                                }
                                if(that.inflectedRotation[g_length - 1] === -90) //由下往左拐弯
                                {
                                	that.round[g_length - 1] = 2;
                                	g_hasTurned = false;
                                }
                                that.inflectedRotation[g_length - 1] = 0;
							}
						} 
						// 纵向
						else 
						{ 
							if (y >= g_selectY && that.moveY >= 0) //下
							{
								that.moveX = 0;
                                that.moveY = that.dragon[1].height;
                                if(that.inflectedRotation[g_length - 1] === 0) //由左往下拐弯
                                {
                                	that.round[g_length - 1] = 3;
                                	g_hasTurned = false;;
                                }
                                if(that.inflectedRotation[g_length - 1] === 180) //由右往下拐弯
                                {
                                	that.round[g_length - 1] = 1;
                                	g_hasTurned = false;
                                }
                                that.inflectedRotation[g_length - 1] = -90;
							} 
							if (y <= g_selectY && that.moveY <= 0) //上
							{
								that.moveX = 0;
                                that.moveY = -that.dragon[1].height;
                                if(that.inflectedRotation[g_length - 1] === 0) //由左往上拐弯
                                {
                                	that.round[g_length - 1] = 4;
                                	g_hasTurned = false;
                                }
                                if(that.inflectedRotation[g_length - 1] === 180) //由右往上拐弯
                                {
                                	that.round[g_length - 1] = 2;
                                	g_hasTurned = false;
                                }
                                that.inflectedRotation[g_length - 1] = 90;
							}
						}
					}
				}
			};

			//手指触摸结束
			this.SelectEnd = function(e) 
			{
				g_slectAble = true;
				g_selectX = null;
				g_selectY = null;
			};


			this.update = function() {	
				//进行判断游戏元素是否已经被加载了
				if(that.hasCreated || g_restart)
				{	
					if(g_timer % g_speed == 0)
					{
						that.Move();
					}
					g_timer++;

					if(that.changeHead)
					{
						if(g_speed === g_highSpeed)
						{
							that.happy.x = that.dragon[g_length - 1].x;
			            	that.happy.y = that.dragon[g_length - 1].y;
			            	that.happy.width = that.dragon[g_length - 1].width;
			            	that.happy.angle = that.dragon[g_length - 1].angle;
			            	that.dragon[g_length - 1].visible = false;
			            	that.happy.visible = true;
						}
						else
						{
							that.sleepy.x = that.dragon[g_length - 1].x;
			            	that.sleepy.y = that.dragon[g_length - 1].y;
			            	that.sleepy.width = that.dragon[g_length - 1].width;
			            	that.sleepy.angle = that.dragon[g_length - 1].angle;
			            	that.dragon[g_length - 1].visible = false;
			            	that.sleepy.visible = true;
						}
					}

					that.dragonGroup.forEachExists(function(dragon)
					{
						if(dragon.x === that.dragon[g_length - 1].x && dragon.y === that.dragon[g_length - 1].y)
						{
							that.gameover();
						}
					}, that);

					//检测是否吃到道具
					that.teaGroup.forEachExists(function(prop)
						{
							if(Math.abs(that.dragon[g_length - 1].x - prop.x) < prop.width / 2 
								&& Math.abs(that.dragon[g_length - 1].y - prop.y) < prop.height / 2)
							{
								prop.x = -game.world.width;
								that.GetTea();
							}
						}, this);
					that.alcoholGroup.forEachExists(function(prop)
						{
							if(Math.abs(that.dragon[g_length - 1].x - prop.x) < prop.width / 2 
								&& Math.abs(that.dragon[g_length - 1].y - prop.y) < prop.height / 2)
							{
								prop.x = -game.world.width;
								that.GetAlcohol()
							}
						}, this);
					that.redPaperGroup.forEachExists(function(prop)
						{
							if(Math.abs(that.dragon[g_length - 1].x - prop.x) < prop.width / 2 
								&& Math.abs(that.dragon[g_length - 1].y - prop.y) < prop.height / 2)
							{
								that.GetRedPaper(prop);
								prop.x = -game.world.width;
							}
						}, this);	
				}
            };


            //这里的move只是移动了一步
            this.Move = function()
            {   
            	var temp_length = g_length - 1;
            	//改变龙各节的坐标以及角度值
                for(var temp_count = 0; temp_count < temp_length; temp_count++)
                {
                	that.inflectedRotation[temp_count] = that.inflectedRotation[temp_count + 1];
                    that.dragon[temp_count].x = that.dragon[temp_count + 1].x;
                    that.dragon[temp_count].y = that.dragon[temp_count + 1].y;
                    that.dragon[temp_count].angle = that.inflectedRotation[temp_count];
                }
            	that.dragon[temp_length].x = (that.dragon[temp_length].x + that.moveX + game.world.width) % game.world.width;
            	that.dragon[temp_length].y = (that.dragon[temp_length].y + that.moveY + game.world.height) % game.world.height;

            	//转弯的时候，每一步只有一个节点是拐弯的
            	//先加载拐弯图片，每次拐弯只加载一张
            	for(temp_count = g_length - 2; temp_count > 0; temp_count--)
            	{
            		//如果有拐点，更新round数组
            		if(that.round[temp_count + 1] != 0)
            		{
	            		if(!g_hasTurned)
	            		{
            				that.CreateRound(that.dragon[temp_count].x, that.dragon[temp_count].y, that.round[temp_count + 1]);
            				g_hasTurned = true;
	            		}
            		}
            	}
            	//把处于拐弯点的图片设置为不可见
            	//离开拐弯点的图片设置为可见
            	for(temp_i = 1; temp_i < temp_length; temp_i++)
            	{
            		if(that.round[temp_i + 1] != 0)
            		{
            			that.dragon[temp_i].visible = false;
            		}
            		else
            		{
            			that.dragon[temp_i].visible = true;
            		}
            	}
            	//更新round数组，此时为下次运动的信息
            	for(temp_count = 1; temp_count < g_length - 1; temp_count++)
            	{
            		//如果有拐点，更新round数组
            		if(that.round[temp_count + 1] != 0)
            		{
            			//更新round数组
            			that.round[temp_count] = that.round[temp_count + 1];
            			that.round[temp_count + 1] = 0;
            		}
            	}
            	//此时，一次拐弯结束
            	if(that.roundGroup[1] != 0)
            	{
            		that.dragon[1].visible = true;
        			that.roundGroup.forEachExists(function(round)
        			{
        				if(round.x === that.dragon[1].x && round.y === that.dragon[1].y)
        				{
        					round.kill();
        				}
        			}, that);
        			that.round[1] = 0;
            	}


            	//判断龙的当前朝向，改变龙头的朝向
            	if(that.inflectedRotation[temp_length] === 180)
            	{
            		if(that.dragon[temp_length].width > 0)
            		{
            			that.dragon[temp_length].angle = 0;
            			that.dragon[temp_length].width *= -1;
            		}	
            	}
            	else
            	{
            		if(that.dragon[temp_length].width < 0)
            		{
            			that.dragon[temp_length].width *= -1;
            			that.dragon[temp_length].angle = that.inflectedRotation[temp_length];
            		}
            		else
            		{
            			that.dragon[temp_length].angle = that.inflectedRotation[temp_length];
            		}
            	}
            };


            this.CreateRound = function(x, y, r)
            {
            	//如果已经进行回收，就不再创造新的拐弯图片
            	if(that.ResetRound(x, y, r))
            		return;
            	
            	var temp_round = game.add.sprite(x, y, 'round');
            	if(r === 2)
            	{
            		temp_round.angle = 90;
            	}
            	if(r === 3)
            	{
            		temp_round.angle = -90;
            	}
            	if(r === 4)
            	{
            		temp_round.angle = 180;
            	}
            	temp_round.anchor.set(0.5, 0.5);
            	that.roundGroup.add(temp_round);
            }

            this.ResetRound = function(x, y, r)
            {
            	var temp_i = 0;
            	that.roundGroup.forEachDead(function(round)
            	{
            		
            		if(temp_i < 1)
            		{
            			round.reset(x, y);
	            		if(r === 1)
	            		{
	            			round.angle = 0;
	            		}
	            		if(r === 2)
		            	{
		            		round.angle = 90;
		            	}
		            	if(r === 3)
		            	{
		            		round.angle = -90;
		            	}
		            	if(r === 4)
		            	{
		            		round.angle = 180;
		            	}
		            	temp_i ++;
            		}
            	}, that);
            	return temp_i > 0;
            }

            //随机生成道具
            this.CreateProp = function()
            {
            	//随机生成一个数字
            	that.groupNumber = Math.floor(Math.random() * 9) % 3;
            	var temp_positionX = (Math.random() * game.world.width * 5 / 6) + game.world.width / 12;
            	var temp_positionY = (Math.random() * game.world.height * 5 / 6)  + game.world.height / 12 - game.world.height / 6;

            	//如果已经有道具被回收了，那就不需要再生成新的道具
            	if(this.ResetProp(temp_positionX, temp_positionY))
            		return;

            	//判断生成哪种道具
            	if(that.groupNumber === 0)
            	{
            		var temp_prop = game.add.sprite(temp_positionX, temp_positionY, 'tea');
            		that.teaGroup.add(temp_prop);
            	}
            	else if(that.groupNumber === 1)
            	{
            		temp_prop = game.add.sprite(temp_positionX, temp_positionY, 'alcohol');
            		that.alcoholGroup.add(temp_prop);
            	}
            	else
            	{
            		temp_prop = game.add.sprite(temp_positionX, temp_positionY, 'redPaper', that.redPaperGroup);
            		that.redPaperGroup.add(temp_prop);
            	}

            	//给道具添加动画
            	temp_prop.anchor.set(0.5, 0.5);
            	temp_prop.alpha = 0;
            	game.add.tween(temp_prop).to({y: temp_prop.y + game.world.height / 6, alpha: 1}, 2000, Phaser.Easing.Bounce.Out,true, 0, 0, false);
            	//设置道具的回收时间
            	game.time.events.add(10000, function()
            	{
            		temp_prop.kill();
            	}, this);
            	game.time.events.start();
            }

            //回收道具
            this.ResetProp = function(x, y)
            {
            	var temp_i = 0;
            	//判断要对哪种道具进行回收
            	if(that.groupNumber === 0)
            	{
            		that.teaGroup.forEachDead(function(prop)
            		{
            			if(temp_i < 1)
            			{
            				//reset不改变锚点位置
	            			prop.reset(x, y);
			            	//先把道具设置为透明
			            	prop.alpha = 0;
			            	//给道具添加动画
			            	game.add.tween(prop).to({y: prop.y + game.world.height / 6, alpha: 1}, 2000, Phaser.Easing.Bounce.Out,true, 0, 0, false);
			            	//设置道具的回收时间
			            	game.time.events.add(10000, function()
			            	{
			            		prop.kill();
			            	}, this);
			            	game.time.events.start();
	            			temp_i ++;
            			}
            			else
            			{
            				temp_i++;
            			}
            		}, that);
            	}
            	else if(that.groupNumber === 1)
            	{
            		that.alcoholGroup.forEachDead(function(prop)
            		{
            			if(temp_i < 1)
            			{
            				//reset不改变锚点位置
	            			prop.reset(x, y);
			            	//先把道具设置为透明
			            	prop.alpha = 0;
			            	//给道具添加动画
			            	game.add.tween(prop).to({y: prop.y + game.world.height / 6, alpha: 1}, 2000, Phaser.Easing.Bounce.Out,true, 0, 0, false);
			            	//设置道具的回收时间
			            	game.time.events.add(10000, function()
			            	{
			            		prop.kill();
			            	}, this);
			            	game.time.events.start();
	            			temp_i ++;
            			}
            			else
            			{
            				temp_i++;
            			}
            		}, that);
            	}
            	else
            	{
            		that.redPaperGroup.forEachDead(function(prop)
            		{
            			if(temp_i < 1)
            			{
            				//reset不改变锚点位置
	            			prop.reset(x, y);
			            	//先把道具设置为透明
			            	prop.alpha = 0;
			            	//给道具添加动画
			            	game.add.tween(prop).to({y: prop.y + game.world.height / 6, alpha: 1}, 2000, Phaser.Easing.Bounce.Out,true, 0, 0, false);
			            	//设置道具的回收时间
			            	game.time.events.add(10000, function()
			            	{
			            		prop.kill();
			            	}, this);
			            	game.time.events.start();
	            			temp_i ++;
            			}
            		}, that);
            	}
            	return temp_i > 0;
            }

            //吃到茶道具之后进行回调的函数
            this.GetTea = function()
            {
            	//如果已经喝过茶了，就不会继续再减速
            	if(g_speed === g_lowSpeed)
            	{
            		that.timeManager.remove(that.slowDown);
            		that.slowDown = that.timeManager.add(5000, function()
	            	{
	            		g_timer = 0;
            			g_speed = g_normalSpeed;
            			that.changeHead = false;
            			that.dragon[g_length - 1].visible = true;
			            that.sleepy.visible = false;
	            	}, that);
	            	return;
            	}
            	//如果是喝过酒，直接减速
            	if(g_speed === g_highSpeed)
            	{
            		//这里需要手动把龙吃到酒道具的图片设置为不可见
            		that.happy.visible = false;
            		that.timeManager.remove(that.speedUp);
            	}
            	//变换速度
            	g_speed = g_lowSpeed;
            	//重置计时器
            	g_timer = 0;
            	//此时龙头图片已被替换
            	that.changeHead = true;
        		that.slowDown = that.timeManager.add(5000, function()
            	{
            		g_timer = 0;
            		g_speed = g_normalSpeed;
            		that.changeHead = false;
            		that.dragon[g_length - 1].visible = true;
			        that.sleepy.visible = false;
            	}, that);
            }
            //吃到酒道具之后进行回调的函数
            this.GetAlcohol = function()
            {
            	//如果已经喝过酒了，就不会继续再加速
            	if(g_speed === g_highSpeed)
            	{
            		that.timeManager.remove(that.speedUp);
            		that.speedUp = that.timeManager.add(5000, function()
	            	{
	            		g_timer = 0;
	            		g_speed = g_normalSpeed;
	            		that.changeHead = false;
	            		that.dragon[g_length - 1].visible = true;
			            that.happy.visible = false;
	            	}, that);
	            	return;
            	}
            	//如果是喝过茶，直接加速
            	if(g_speed === g_lowSpeed)
            	{
            		that.sleepy.visible = false;
            		that.timeManager.remove(that.slowDown);
            	}
            	//变换速度
            	g_speed = g_highSpeed;
            	//重置计时器
            	g_timer = 0;
            	//此时龙头图片已被替换
            	that.changeHead = true;
            	that.speedUp = that.timeManager.add(5000, function()
            	{
            		g_timer = 0;
            		g_speed = g_normalSpeed;
            		that.changeHead = false;
            		that.dragon[g_length - 1].visible = true;
			        that.happy.visible = false;
            	}, that);
            }

            this.CreateOneScore = function(prop)
            {

            	if(that.ResetOneScore(prop.x, prop.top))
            		return;

            	//创建一个临时的‘+1’标签
            	var temp_oneScore = game.add.sprite(prop.x, prop.top, 'one_score');
            	temp_oneScore.anchor.set(0.5, 0.5);
            	//对‘+1’标签按照原始比例进行缩放
            	var temp_oneScoreScale = temp_oneScore.height / temp_oneScore.width;
                temp_oneScore.width = that.dragon[2].width;
                temp_oneScore.height = temp_oneScore.width * temp_oneScoreScale;
                //把创建的临时‘+1’标签添加到组里面
                that.oneScoreGroup.add(temp_oneScore);

                //让加分标签上升并且渐变消失
                game.add.tween(temp_oneScore).to({y: temp_oneScore.y - temp_oneScore.height, alpha: 0}, 1000, null, true, 0, 0, false);
                game.time.events.add(1100, function()
                {
                	temp_oneScore.kill();
                }, that);
                game.time.events.start();
            }

            this.ResetOneScore = function(x, y)
            {
            	var temp_i = 0;
            	that.oneScoreGroup.forEachDead(function(oneScore)
            	{
            		oneScore.reset(x, y);
            		oneScore.alpha = 1;
            		//让加分标签上升并且渐变消失
	                game.add.tween(oneScore).to({y: oneScore.y - oneScore.height, alpha: 0}, 1000, null, true, 0, 0, false);
	                game.time.events.add(1100, function()
	                {
	                	oneScore.kill();
	                }, that);
	                game.time.events.start();
            		temp_i ++;
            	}, that);
            	return temp_i > 0;
            }

            //吃到红包道具之后进行回调的函数
            this.GetRedPaper = function(prop)
            {
            	//分数加一并且更新分数条内容
            	score ++;
            	that.scoreText.text = score + " ";

            	//制造+1分效果
            	that.CreateOneScore(prop);

				var temp_body = game.add.sprite(that.dragon[g_length - 2].x + that.moveX, that.dragon[g_length - 2].y + that.moveY, 'body');
            	temp_body.anchor.set(0.5, 0.5);
            	// that.dragonGroup.add(that.dragon[g_length - 4]);
            	that.dragonGroup.add(temp_body);
            	that.dragon.splice(g_length - 1, 0, temp_body);
            	g_length++;
            	that.dragon[g_length - 1].x += that.moveX;
            	that.dragon[g_length - 1].y += that.moveY;
            	that.dragon[g_length - 1].bringToTop();
            	that.sleepy.bringToTop();
            	that.happy.bringToTop();
            	//that.titleGroup.bringToTop();
  	
            	that.inflectedRotation.length = g_length;
            	that.inflectedRotation[g_length - 1] = that.inflectedRotation[g_length - 2];
	
            	that.round.length = g_length;
            	that.round[g_length - 1] = 0;
            }

			this.gameover = function() {
				/**
				 * 上线用
				 * 游戏结束后调用hwsdk的接口进行数据的提交等
				 */
				// if (skip) { // 工作台不提交数据，继续循环游戏
				//     game.state.start('play');
				// } else {
				// 	/**
				// 	 * 调用得分接口示例
				// 	 */
				// 	// 提交分数
				//     hwsdk.requestGameScore({
				//         'game_score': score,
				//         'game_id': game_info['game_id'],
				//         'device_type': self.device.platform
				//     }, function() {
				//     	// 提交分数后的回调操作
				//         // 显示结束页，悬浮按钮，弹框
				//         hwsdk.showOverPage().showPageBtn().showBox();
				//     });
				//     // 设置微信分享参数
				//     // 1.获取微信分享参数对象，具体属性请查看HWSDK文档
				//     var wxObj = hwsdk.getWxShareObj();
				//     // 2.游戏分享链接后添加得分参数（分享登录页用）
				//     wxObj.link = wxObj.link + "?score="+score;
				//     // 3.正则匹配替换{score}为游戏的得分，注：如果为通关类的游戏，则替换{level}
				//     var reg = /\{score\}/ig;
				//     if (score != 0) {
				//         wxObj["title"] = wxObj["title"].replace(reg, function(){return score});
				//         wxObj["desc"] = wxObj["desc"].replace(reg, function(){return score});
				//     }
				//     // 4.设置微信分享参数
				//     hwsdk.setWxShare(wxObj, score);

				// 	/**
				// 	 * 调用抽奖接口示例
				// 	 */
				//     // 抽奖
				//     hwsdk.requestLottery(null, function(result) {
				//         // 判断是否中奖
				//         if (result && result != "empty") { // 已中奖
				//             var giftImg = result['lottery'].img; // 获得的奖品图片
				//             var giftName = result['lottery'].name; // 获得的奖品名称
				//         	// 设置微信分享参数
				//         	// 1.获取微信分享参数对象，具体属性请查看HWSDK文档
				//             var wxObj = hwsdk.getWxShareObj();
				//             // 2.游戏分享链接后添加奖品图片和名称的参数（分享登录页用）
				//             wxObj.link = wxObj.link + "?banner_img="+giftImg+"&gift_name="+giftName;
				//             // 3.正则匹配替换{result}为抽奖的结果（奖品名称）
				//             var reg = /\{result\}/ig;
				//             wxObj["title"] = wxObj["title"].replace(reg, function(){return giftName});
				//             wxObj["desc"] = wxObj["desc"].replace(reg, function(){return giftName});
				//             // 4.设置微信分享参数
				//             hwsdk.setWxShare(wxObj, 1);
				//         }
				//         // 显示结束页，悬浮按钮，弹框
				//         hwsdk.showOverPage().showPageBtn().showBox();
				//     });

			    // 示例：进入结束场景
			    game.state.start("end");
				// }
			};
		}

		// State - end
		// 结束场景
		game.States.end = function() {
			this.create = function() {
				/**----------------------------
				 * 游戏结束后的逻辑
				 * 说明：
				 * 1.此时背景音乐会继续播放
				 * 2.为了游戏结束后停止运行（例如计时，碰撞计算等），因此可以切换到结束场景来
				---------------------------- */

				this.bg = game.add.image(0, 0, "bg");
				if(this.bg.width > this.bg.height)
                {
                	var temp_bgScale = this.bg.width / this.bg.height;
                	this.bg.height = game.world.width;
                	this.bg.width = this.bg.height * temp_bgScale;
                }
                else
                {
                	temp_bgScale = this.bg.height / this.bg.width;
                	this.bg.width = game.world.width;
                	this.bg.height = this.bg.width * temp_bgScale;
                }

                var temp_button;

                var temp_end = game.add.image(game.world.centerX, 0, 'end');
                temp_end.anchor.set(0.5, 1);
                game.add.tween(temp_end).to({y: temp_end.y + game.world.centerY}, 1500, Phaser.Easing.Bounce.Out,true, 0, 0, false)

                //设置定时器，四秒后关闭
                game.time.events.add(1500, function(){
                    temp_button = game.add.image(game.world.centerX, game.world.height * 4 / 5, 'knew');
                    temp_button.anchor.set(0.5, 0.5);

                    game.input.onDown.addOnce(function(p)
                    {
                        if (Math.abs(p.x - temp_button.x / 2) <= temp_button.width / 2 && Math.abs(p.y - temp_button.y / 2) <= temp_button.height / 2)
                        {
                            g_restart = true;
                            score = 0;
                            g_length = 8;
                            g_slectAble = true;
							g_selectX = null;
							g_selectY = null;
                            game.state.start('play');
                        }
                    }, this);
                }, this);
                //不需开启定时器，会自动开始
                //game.time.events.start();
		}
		};

		// 注册各个游戏场景
		game.state.add('boot',game.States.boot);
		game.state.add('preload',game.States.preload);
		game.state.add('create',game.States.create);
		game.state.add('play',game.States.play);
		game.state.add('end',game.States.end);
		// 进入启动场景
		game.state.start('boot');
	}
};

/* 音乐管理器 */
var MusicManager = function(gameInstance, deviceInfo, assets) {
	this.gameInstance = gameInstance;
	this.deviceInfo = deviceInfo;
	this.assets = assets;
	this.init();
};
MusicManager.prototype = {
	// 游戏实例
	gameInstance : null,
	// 设备信息
	deviceInfo : null,
	// 资源
	assets : null,
	// 音乐对象
	musicObject : null,
	// 静音标记
	isBaned : false,
	// 是否播放中
	isPlaying : false,
	// 正在播放列表
	playingList : [],
	// 初始化
	init : function() {
		var self = this;
		if (this.assets) {
			this.musicObject = {};
			for (var index=0,len = this.assets.length;index<len;index++) {
				var audio = this.gameInstance.add.audio(this.assets[index]);
				audio.name = this.assets[index];
				audio.onPause.add(function() {
					self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
					if (self.playingList.length == 0) self.isPlaying = false;
				});
				audio.onStop.add(function() {
					self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
					if (self.playingList.length == 0) self.isPlaying = false;
				});
				this.musicObject[this.assets[index]] = audio;
			}
		}
	},
	// 播放
	play : function(assetName, loop) {
		if (!this.isBaned) {
			var playTag = false;
			if (this.deviceInfo.platform == "apple") {
				playTag = true;
			} else if (this.deviceInfo.platform == "android" && !this.isPlaying) {
				playTag = true;
			}
			if (playTag) {
				if (loop) {
					if (!this.musicObject[assetName].isPlaying){
						this.musicObject[assetName].loopFull();
						this.playingList.push(assetName);
					}
				} else {
					this.musicObject[assetName].stop();
					this.musicObject[assetName].play();
					this.playingList.push(assetName);
				}
				this.isPlaying = true;
			}
		}
	},
	resume : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].resume();
		}
		this.isPlaying = true;
	},
	pause : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].pause();
		}
		this.isPlaying = false;
	},
	stop : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].stop();
		}
		this.isPlaying = false;
		this.playingList = [];
	},
	ban : function() {
		this.isBaned = true;
		this.pause();
	},
	disban : function() {
		this.isBaned = false;
		this.resume();
	}
};

/**
 * 本地开发用，上线时请删除
 */
var game_width = window.innerWidth; // 游戏窗口宽度
var game_height = window.innerHeight; // 游戏窗口高度
var gameManager = new Game(null, null, "game_div");
gameManager.init(); // 初始化游戏
