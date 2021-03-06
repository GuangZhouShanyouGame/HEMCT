require(["base/hwsdk"], function(hwsdk) {
    // 初始化hwsdk
    hwsdk.init();

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
	    // 时间
	    time: 30,
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
	    normalSpeed: 2,
	    //龙减速之后的速度
	    lowSpeed: 3,
	    //龙加速之后的速度
	    highSpeed: 1,


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
	        hwsdk.showLoadingPage();

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
	        var g_time = this.time;
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
	        //判断当前是否正在拐弯
	        var g_turn = false;
	        //判断当前是否正在直行
	        var g_slide = false;
	        // 用于检测龙是否越界
	        var g_changeBound = false;
	        // 各遊戲元素的縮放比例
	        var g_scale = 5 / 6;
	        //这里设置产生道具的间隔.单位为毫秒
	        var g_generator = 2000;
	        // 用于记录是否吃到了红包
	        var g_hasGottenRedpaper = false;
	        // 用于设置生成加速道具的概率
	        // 生成加速道具的概率为1 / g_number
	        // 若为0则只产生红包
	        var g_number = 4;



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
	                var deadLine = false;
	                setTimeout(function() {
	                	deadLine = true;
	                }, 3000);

	                /**
	                 * 上线用
	                 * 资源加载回调函数
	                 */
	                function callback() {
		                if (deadLine == true) { // 已达到加载最少时长，进入准备场景
		                    game.state.start('create');
		                } else { // 未达到加载最少时长，1秒后重试
		                    	setTimeout(function() {
		                        	callback();
		                    }, 1000);
		                }
	                }

	                /**
	                 * 上线用
	                 * 设置Phaser加载资源回调事件
	                 */
	                game.load.onLoadComplete.add(callback);
	                game.load.onFileComplete.add(function(progress){
	                 // 设置通用加载页进度条进度
	                 hwsdk.configLoadingPage({progress: progress});
	                });

	                /**----------------------------
	                 * 加载资源示例
	                 * 按需要参考下面的示例进行资源的加载
	                ------------------------------ */
	                // 游戏资源集合，详情参考配置表
	                var config = self.config['game']; 

	                // 加载游戏背景
	                if (config['bg'].indexOf('#') !== 0) 
	                	game.load.image('bg', config['bg']); 

	                // 加载普通图片资源
	                game.load.image('head', config['head']);
	                game.load.image('body', config['body']);
	                game.load.image('tail', config['tail']);
	                game.load.image('happy', config['happy']);
	                game.load.image('round', config['round']);
	                game.load.image('alcohol', config['alcohol']);
	                game.load.image('redPaper', config['redPaper']);
	                game.load.image('end', config['end']);
	                game.load.image('timeUp', config['timeUp']);

	                game.load.image('tips', "/static_resource/images/tips.png");
	                game.load.image('knew', "/static_resource/images/knew.png");
	                game.load.image('score',"/static_resource/images/score.png");
	                game.load.image('score_bg',"/static_resource/images/score_bg.png");
	                game.load.image('one_score',"/static_resource/images/one_score.png");
	                game.load.image('button',"/static_resource/images/knew.png");
	                game.load.image('time', "/static_resource/images/time.png");
	                

	                // 加载音频资源
	                game.load.audio('bg', config['music_bg']);
	                game.load.audio('end', config['music_end']);
	                if (self.device.platform != 'android') { // 大部分Android在浏览器中不支持多个音频同时播放，因此不加载以下音效
		                 game.load.audio('speedUp', config['music_speedUp']);
		                 game.load.audio('score', config['music_score']);
	                }

	                game.load.audio('bg', "assets/music/bgm.mp3");
	                game.load.audio('score', "assets/music/score.mp3");
	                game.load.audio('end', "assets/music/end.mp3");
	                game.load.audio('speedUp', "assets/music/speedUp.mp3");
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
	                self.musicManager = new MusicManager(game, self.device, ['bg']);

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
	                if (!self.playedMusic) {
		                // 暂停游戏
		                game.paused = true;
		                // 隐藏加载页面，显示开始页面，悬浮按钮
		                hwsdk.hideLoadingPage().showStartPage().showPageBtn();
		                // 工作台特殊处理
		                if (skip) { // 工作台直接开始游戏
		                     game.paused = false;
		                     gameManager.toPlayMusic();
		                } else { // 正常游戏
		                     hwsdk.showBox(); // 弹出提示框
		                }
	                }

	                /**----------------------------
	                 * 游戏逻辑写在这里
	                ---------------------------- */
	                
	                
	                that.speedUpBgm = game.add.audio('speedUp', 1, true);
	                that.scoreBgm = game.add.audio('score', 1, false);

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

	                //添加点击事件
	                $(game.canvas).off(g_eventStart, this.Select);
	                $(game.canvas).off(g_eventMove, this.Swipe);
	                $(game.canvas).off(g_eventEnd, this.SelectEnd);
	                $(game.canvas).on(g_eventStart, this.Select);
	                $(game.canvas).on(g_eventMove, this.Swipe);
	                $(game.canvas).on(g_eventEnd, this.SelectEnd);
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
	                that.dragon[0].width *= g_scale;
	                that.dragon[0].height *= g_scale;
	                //创建龙身，暂时先把身体的第一节当做龙头
	                for(var i = 1;i < g_length - 1;i++)
	                {
	                    that.dragon[i] = game.add.sprite(that.dragon[i - 1].x - that.dragon[i - 1].width, game.world.centerY, 'body');
	                    that.dragon[i].anchor.set(0.5, 0.5);
	                    that.dragon[i].width *= g_scale;
	                    that.dragon[i].height *= g_scale;
	                }
	                //创建龙头
	                that.dragon[g_length - 1] = game.add.sprite(0, game.world.centerY, 'head');
	                that.dragon[g_length - 1].anchor.set(0.5, 0.5);
	                that.dragon[g_length - 1].width *= g_scale;
	                that.dragon[g_length - 1].height *= g_scale;
	                that.dragon[g_length - 1].x = that.dragon[g_length - 2].x - that.dragon[g_length - 2].width;

	                // 给龙的所有元素都开启物理引擎
	                for(i = 0; i < g_length; i++)
	                {
	                    game.physics.enable(that.dragon[i], Phaser.Physics.ARCADE);
	                }

	                //创建龙头高兴的图片
	                that.happy = game.add.sprite(game.world.centerX, game.world.centerY, 'happy');
	                that.happy.anchor.set(0.5, 0.5);
	                that.happy.width *= g_scale;
	                that.happy.height *= g_scale;
	                that.happy.visible = false;
	                

	                //用于检测是否替换了龙头的图片
	                that.changeHead = false;
	                //用于检测龙是否死亡
	                that.dead = false;

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

	                //用于保存已生成道具的位置，避免道具发生重叠
	                that.propX = [];
	                that.propY = [];

	                //添加分数条
	                that.titleGroup = game.add.group();
	                that.scoreBg = game.add.sprite(0,16,"score_bg");
	                that.score = game.add.sprite(-10,16,"score");
	                that.scoreText = game.add.text(that.score.width + 45,50, score+" ", { font: "bold 40pt score", fill: "#FB8124"});
	                that.scoreText.anchor.setTo(0.3,0.5);
	                //添加组的元素
	                that.titleGroup.add(that.scoreBg);
	                that.titleGroup.add(that.score);
	                that.titleGroup.add(that.scoreText);
	                that.titleGroup.x = 20;
	                that.titleGroup.y = 20;

	                // 添加定时器
	                that.timeGroup = game.add.group();
	                that.timeBg = game.add.sprite(0, 16, "score_bg");
	                that.time = game.add.sprite(-10, 16, 'time');
	                that.timeText = game.add.text(that.score.width + 45,50, g_time+" ", { font: "bold 40pt score", fill: "#506F82"});
	                that.timeText.anchor.setTo(0.3,0.5);
	                that.timeGroup.add(that.timeBg);
	                that.timeGroup.add(that.time);
	                that.timeGroup.add(that.timeText);
	                that.timeGroup.x = game.world.width - that.timeGroup.width - 20;
	                that.timeGroup.y = 20;

	                //创建存放酒道具的组并开启物理引擎
	                that.alcoholGroup = game.add.group();
	                //创建存放红包的组
	                that.redPaperGroup = game.add.group();

	                //创建存放龙的数组
	                that.dragonGroup = game.add.group();
	                for(i = 0; i < g_length - 1; i++)
	                {
	                    that.dragonGroup.add(that.dragon[i]);
	                }

	                that.headGroup = game.add.group();
	                that.headGroup.add(that.dragon[g_length - 1]);
	                that.headGroup.add(that.happy);

	                //创建存放拐弯图片的数组
	                that.roundGroup = game.add.group();
	                //创建存放加分标签的数组
	                that.oneScoreGroup = game.add.group();

	                //开启定时器
	                that.timeManager = game.time.events;
	                //每隔四秒随机产生一个道具
	                that.createProp = that.timeManager.loop(g_generator, this.CreateProp, this);
	                //添加计时器
	                that.tick = that.timeManager.loop(1000, function()
	                {
	                    g_time--;
	                    that.timeText.text = g_time + " ";
	                    console.log(self.time);
	                }, that)
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
	                                    g_turn = true;
	                                    g_slide = false;
	                                    for(var temp_t = 0; temp_t < g_length; temp_t++)
	                                    {
	                                        that.dragon[temp_t].body.velocity.x = 0;
	                                        that.dragon[temp_t].body.velocity.y = 0;
	                                    }
	                                }
	                                if(that.inflectedRotation[g_length - 1] === -90) //由下往右拐弯
	                                {
	                                    that.round[g_length - 1] = 4;
	                                    g_hasTurned = false;
	                                    g_turn = true;
	                                    g_slide = false;
	                                    for(var temp_t = 0; temp_t < g_length; temp_t++)
	                                    {
	                                        that.dragon[temp_t].body.velocity.x = 0;
	                                        that.dragon[temp_t].body.velocity.y = 0;
	                                    }
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
	                                    g_hasTurned = false;
	                                    g_turn = true;
	                                    g_slide = false;
	                                    for(var temp_t = 0; temp_t < g_length; temp_t++)
	                                    {
	                                        that.dragon[temp_t].body.velocity.x = 0;
	                                        that.dragon[temp_t].body.velocity.y = 0;
	                                    }
	                                }
	                                if(that.inflectedRotation[g_length - 1] === -90) //由下往左拐弯
	                                {
	                                    that.round[g_length - 1] = 2;
	                                    g_hasTurned = false;
	                                    g_turn = true;
	                                    g_slide = false;
	                                    for(var temp_t = 0; temp_t < g_length; temp_t++)
	                                    {
	                                        that.dragon[temp_t].body.velocity.x = 0;
	                                        that.dragon[temp_t].body.velocity.y = 0;
	                                    }
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
	                                    g_hasTurned = false;
	                                    g_turn = true;
	                                    g_slide = false;
	                                    for(var temp_t = 0; temp_t < g_length; temp_t++)
	                                    {
	                                        that.dragon[temp_t].body.velocity.x = 0;
	                                        that.dragon[temp_t].body.velocity.y = 0;
	                                    }
	                                }
	                                if(that.inflectedRotation[g_length - 1] === 180) //由右往下拐弯
	                                {
	                                    that.round[g_length - 1] = 1;
	                                    g_hasTurned = false;
	                                    g_turn = true;
	                                    g_slide = false;
	                                    for(var temp_t = 0; temp_t < g_length; temp_t++)
	                                    {
	                                        that.dragon[temp_t].body.velocity.x = 0;
	                                        that.dragon[temp_t].body.velocity.y = 0;
	                                    }
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
	                                    g_turn = true;
	                                    g_slide = false;
	                                    for(var temp_t = 0; temp_t < g_length; temp_t++)
	                                    {
	                                        that.dragon[temp_t].body.velocity.x = 0;
	                                        that.dragon[temp_t].body.velocity.y = 0;
	                                    }
	                                }
	                                if(that.inflectedRotation[g_length - 1] === 180) //由右往上拐弯
	                                {
	                                    that.round[g_length - 1] = 2;
	                                    g_hasTurned = false;
	                                    g_turn = true;
	                                    g_slide = false;
	                                    for(var temp_t = 0; temp_t < g_length; temp_t++)
	                                    {
	                                        that.dragon[temp_t].body.velocity.x = 0;
	                                        that.dragon[temp_t].body.velocity.y = 0;
	                                    }
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

	            this.update = function() 
	            {   
	                //进行判断游戏元素是否已经被加载了
	                if((that.hasCreated || g_restart) && !that.dead)
	                {   
	                    //时间到了之后让蛇停止
	                    if(g_time === 0)
	                    {
	                        that.Die();
	                    }
	                    if(g_turn) //蛇进行拐弯
	                    {
	                        if(g_timer % g_speed == 0)
	                        {
	                            that.Move();
	                        }
	                        g_timer++;
	                    }
	                    else //蛇进行直行
	                    {
	                        if(!g_slide) //改变一次速度即可
	                        {
	                            for(var temp_q = 0; temp_q < g_length; temp_q++)
	                            {
	                                that.dragon[temp_q].body.velocity.x = that.moveX * 60 / g_speed - that.moveX / that.dragon[1].width * 50;
	                                that.dragon[temp_q].body.velocity.y = that.moveY * 60 / g_speed - that.moveY / that.dragon[1].height * 50;
	                            }
	                            g_slide = true;
	                        }


	                        //進行修正
	                        that.Revise();

	                        var temp_width = game.world.width + that.dragon[1].width;
	                        var temp_height = game.world.height + that.dragon[1].height;
	                        for(temp_q = 0; temp_q < g_length; temp_q++)
	                        {
	                            // 只需在越界的时候改变坐标
	                            if(that.dragon[temp_q].x < -that.dragon[1].width / 2 
	                                || that.dragon[temp_q].x > game.world.width + that.dragon[1].width / 2)
	                            {
	                                that.dragon[temp_q].x = (that.dragon[temp_q].x + temp_width + that.dragon[1].width / 2) % temp_width 
	                                    - that.dragon[1].width / 2;
	                            }
	                            else if(that.dragon[temp_q].y < -that.dragon[1].height / 2 
	                                || that.dragon[temp_q].y > game.world.height + that.dragon[1].height / 2)
	                            {
	                                that.dragon[temp_q].y = (that.dragon[temp_q].y + temp_height + that.dragon[1].height / 2) % temp_height 
	                                    - that.dragon[1].height / 2;
	                            } 
	                        }
	                    }

	                    //吃到道具，龙头图片发生改变
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
	                    }

	                    //判断是否碰到自己
	                    that.dragonGroup.forEachExists(function(body)
	                    {
	                        if(Math.abs(that.dragon[g_length - 1].x - body.x) < body.width / 2 
	                            && Math.abs(that.dragon[g_length - 1].y - body.y) < body.height / 2)
	                        {
	                            that.Die();
	                        }
	                    })

	                    //检测是否吃到道具
	                    that.alcoholGroup.forEachExists(function(prop)
	                    {
	                        if(Math.abs(that.dragon[g_length - 1].x - prop.x) < prop.width * 2 / 3
	                            && Math.abs(that.dragon[g_length - 1].y - prop.y) < prop.height * 2 / 3)
	                        {
	                            that.RemoveProp(prop.x, prop.y);
	                            prop.x = -game.world.width;

	                            // 播放加速音效
	                            that.speedUpBgm.play();

	                            that.GetAlcohol();
	                        }
	                    }, this);
	                    that.redPaperGroup.forEachExists(function(prop)
	                    {
	                        if(Math.abs(that.dragon[g_length - 1].x - prop.x) < prop.width * 2 / 3
	                            && Math.abs(that.dragon[g_length - 1].y - prop.y) < prop.height * 2 / 3)
	                        {
	                            g_hasGottenRedpaper = true;
	                            //分数增加并且更新分数条内容
	                            score ++;
	                            that.scoreText.text = score + " ";

	                            //制造+1分效果
	                            that.CreateOneScore(prop);
	                            that.RemoveProp(prop.x, prop.y);
	                            prop.x = -game.world.width;

	                            // 播放得分音效
	                            that.scoreBgm.play();

	                            // 吃到一个红包增加一节
	                            //that.GetRedPaper(that.moveX, that.moveY);
	                            that.GetRedPaper(that.moveX, that.moveY);
	                        }
	                    }, this);   
	                }
	            };

	            // 龙死亡之后调用的函数
	            this.Die = function()
	            {
	                //停止背景音乐
	                self.musicManager.stop();
	                //停止加速音效
	                that.speedUpBgm.stop();

	                that.dead = true;
	                // 停止产生道具
	                that.timeManager.remove(that.createProp);
	                // 停止倒计时    
	                that.timeManager.remove(that.tick);
	                for(var temp_q = 0; temp_q < g_length; temp_q++)
	                {
	                    that.dragon[temp_q].body.velocity.x = 0;
	                    that.dragon[temp_q].body.velocity.y = 0;
	                }

	                // 我也不知道为什么，这一块就是和其他的不一样
	                that.dragon[g_length - 2].visible = false;
	                // 让整条龙闪烁
	                game.add.tween(that.dragonGroup).to({alpha: 0}, 400, null, true, 0, 4, true);
	                game.add.tween(that.headGroup).to({alpha: 0}, 400, null, true, 0, 4, true);
	                game.add.tween(that.roundGroup).to({alpha: 0}, 400, null, true, 0, 4, true);
	                game.time.events.add(2000, that.gameover, that);
	                game.time.events.start();
	            }

	            // 修正函数,用于修正在有速度的时候改变各节点的相对坐标而产生的误差
	            that.Revise = function()
	            {
	                // 判断龙是否越界
	                if(Math.abs(that.dragon[g_length - 1].x - that.dragon[g_length - 3].x) <= 3*that.dragon[1].width 
	                    && Math.abs(that.dragon[g_length - 1].y - that.dragon[g_length - 3].y) <= 3*that.dragon[1].height)
	                {
	                    g_changeBound = false;
	                }
	                else
	                {
	                    g_changeBound = true;
	                }

	                // 对贪吃龙前三节的坐标进行修正
	                // 每次只在吃到红包之后修正一次
	                // 假如吃到红包之后，龙头发生越界，那么不进行修正
	                if(g_hasGottenRedpaper && !g_changeBound)
	                {
	                    // that.dragon[g_length - 2].x = (2 * that.dragon[g_length - 1].x + that.dragon[g_length - 4].x) / 3;
	                    // that.dragon[g_length - 2].y = (2 * that.dragon[g_length - 1].y + that.dragon[g_length - 4].y) / 3;
	                    // that.dragon[g_length - 3].x = (that.dragon[g_length - 1].x + 2 * that.dragon[g_length - 4].x) / 3;
	                    // that.dragon[g_length - 3].y = (that.dragon[g_length - 1].y + 2 * that.dragon[g_length - 4].y) / 3;
	                    that.dragon[g_length - 2].x = (that.dragon[g_length - 1].x + that.dragon[g_length - 3].x) / 2;
	                    that.dragon[g_length - 2].y = (that.dragon[g_length - 1].y + that.dragon[g_length - 3].y) / 2;
	                    g_hasGottenRedpaper = false;
	                }
	            }

	            //这里的move只是移动了一步
	            this.Move = function()
	            {   
	                var temp_length = g_length - 1;

	                
	                // 进行修正
	                that.Revise();


	                //改变龙各节的坐标以及角度值
	                for(var temp_count = 0; temp_count < temp_length; temp_count++)
	                {
	                    that.inflectedRotation[temp_count] = that.inflectedRotation[temp_count + 1];
	                    that.dragon[temp_count].x = that.dragon[temp_count + 1].x;
	                    that.dragon[temp_count].y = that.dragon[temp_count + 1].y;
	                    that.dragon[temp_count].angle = that.inflectedRotation[temp_count];
	                }
	                
	                var temp_width = game.world.width + that.dragon[1].width;
	                var temp_height = game.world.height + that.dragon[1].height;


	                var temp_headX = that.dragon[temp_length].x + that.moveX + that.dragon[1].width / 2 + temp_width;
	                var temp_headY = that.dragon[temp_length].y + that.dragon[1].height / 2 + that.moveY + temp_height;
	                
	                // 实现龙的越界
	                that.dragon[temp_length].x = temp_headX % temp_width - that.dragon[1].width / 2;
	                that.dragon[temp_length].y = temp_headY % temp_height - that.dragon[1].height / 2;

	                
	                //转弯的时候，每一步只有一个节点是拐弯的
	                //先加载拐弯图片，每次拐弯只加载一张
	                //如果有拐点，加載拐彎圖片
	                if(that.round[temp_length] != 0)
	                {
	                    if(!g_hasTurned)
	                    {
	                        that.CreateRound(that.dragon[temp_length - 1].x, that.dragon[temp_length - 1].y, that.round[temp_length]);
	                        g_hasTurned = true;
	                    }
	                }

	                //把处于拐弯点的图片设置为不可见
	                //离开拐弯点的图片设置为可见
	                for(temp_count = 1; temp_count < temp_length; temp_count++)
	                {
	                    if(that.round[temp_count + 1] != 0)
	                    {
	                        that.dragon[temp_count].visible = false;
	                    }
	                    else
	                    {
	                        that.dragon[temp_count].visible = true;
	                    }
	                }

	                //更新round数组，此时为下次运动的信息
	                for(temp_count = 0; temp_count < g_length - 1; temp_count++)
	                {
	                    //如果有拐点，更新round数组
	                    if(that.round[temp_count + 1] != 0)
	                    {
	                        //更新round数组
	                        that.round[temp_count] = that.round[temp_count + 1];
	                        that.round[temp_count + 1] = 0;
	                    }
	                }

	                //用於檢測拐點的個數
	                temp_count = 0;

	                //此时，一次拐弯结束
	                if(that.round[0] != 0)
	                {
	                    that.dragon[0].visible = true;
	                    that.roundGroup.forEachExists(function(round)
	                    {
	                        if(round.x === that.dragon[0].x && round.y === that.dragon[0].y)
	                        {
	                            round.kill();
	                        }
	                    }, that);
	                    that.round[0] = 0;
	                }

	                //檢測拐點個數
	                that.roundGroup.forEachExists(function(round)
	                {
	                    temp_count++;
	                }, that);

	                //此时没有拐点，拐彎結束
	                if(temp_count === 0)
	                {
	                    g_turn = false;
	                    g_timer = 0;
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

	            // 创建拐弯图片
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
	                temp_round.width *= g_scale;
	                temp_round.height *= g_scale;
	                that.roundGroup.add(temp_round);
	            }

	            // 回收拐弯图片
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

	            // 移除掉不在游戏场景中的道具的坐标
	            this.RemoveProp = function(x, y)
	            {
	                for(var temp_count = 0; temp_count < that.propX.length; temp_count++)
	                {
	                    if(that.propX[temp_count] === x)
	                    {
	                        that.propX.splice(temp_count, 1);
	                        that.propY.splice(temp_count, 1);
	                    }
	                }
	            }

	            //随机生成道具
	            this.CreateProp = function()
	            {
	                //随机生成一个数字
	                that.groupNumber = Math.floor(Math.random() * g_number);

	                var temp_positionX = (Math.random() * (game.world.width - 80)) + 40;
	                var temp_positionY = (Math.random() * (game.world.height - 80 - that.titleGroup.bottom)) + 
	                    that.titleGroup.bottom + 40 - game.world.height / 6;

	                //假如位置发生重叠，就重新生成一次
	                for(var temp_count = 0; temp_count < that.propX.length; temp_count++)
	                {
	                    if(Math.abs(temp_positionX - that.propX[temp_count]) < 80 
	                        && Math.abs(temp_positionY - that.propY[temp_count]) < 80)
	                    {
	                        that.CreateProp();
	                        return;
	                    }
	                }

	                //位置不重叠，记录当前的位置
	                that.propX.push(temp_positionX);
	                that.propY.push(temp_positionY);

	                //如果已经有道具被回收了，那就不需要再生成新的道具
	                if(this.ResetProp(temp_positionX, temp_positionY))
	                    return;

	                //判断生成哪种道具
	                if(that.groupNumber === g_number - 1)
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
	                if(temp_prop.width > temp_prop.height)
	                {
	                    var temp_scale = temp_prop.width / temp_prop.height;
	                    temp_prop.height = 80;
	                    temp_prop.width = temp_prop.height * temp_scale;
	                }
	                else
	                {
	                    temp_scale = temp_prop.height / temp_prop.width;
	                    temp_prop.width = 80;
	                    temp_prop.height = temp_prop.width * temp_scale;
	                }
	                game.add.tween(temp_prop).to({y: temp_prop.y + game.world.height / 6, alpha: 1}, 
	                    2000, Phaser.Easing.Bounce.Out,true, 0, 0, false);
	                // 设置道具的回收时间
	                game.time.events.add(10000, that.Kill, that, temp_prop);
	                game.time.events.start();
	            }

	            // 让道具消失
	            this.Kill = function(prop)
	            {
	                var temp_tween = game.add.tween(prop).to({alpha: 0}, 2000, Phaser.Easing.Bounce.Out, true, 0, 0, false);
	                temp_tween.onComplete.add(function(pro)
	                {
	                    pro.kill();
	                }, this, 0, prop);
	                that.RemoveProp(prop.x, prop.y);
	            }

	            //回收道具
	            this.ResetProp = function(x, y)
	            {
	                var temp_i = 0;
	                //判断要对哪种道具进行回收              
	                if(that.groupNumber === g_number - 1)
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
	                            game.add.tween(prop).to({y: prop.y + game.world.height / 6, alpha: 1}, 
	                                2000, Phaser.Easing.Bounce.Out,true, 0, 0, false);
	                            //设置道具的回收时间
	                            game.time.events.add(10000, that.Kill, that, prop);
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
	                            game.add.tween(prop).to({y: prop.y + game.world.height / 6, alpha: 1}, 
	                                2000, Phaser.Easing.Bounce.Out,true, 0, 0, false);
	                            //设置道具的回收时间
	                            game.time.events.add(10000, that.Kill, that, prop);
	                            game.time.events.start();
	                            temp_i ++;
	                        }
	                    }, that);
	                }
	                return temp_i > 0;
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
	                        that.speedUpBgm.stop();
	                    }, that);
	                    return;
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
	                    that.speedUpBgm.stop();
	                }, that);
	            }

	            //创建'+1'标签
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

	            // 回收已经创建的'+1'标签
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
	            this.GetRedPaper = function(temp_x, temp_y)
	            {
	                // 创建临时的身体并设置其属性
	                var temp_body = game.add.sprite(that.dragon[g_length - 2].x + temp_x, that.dragon[g_length - 2].y + temp_y, 'body');
	                game.physics.enable(temp_body, Phaser.Physics.ARCADE);
	                //假如是在直行，应该有速度
	                if(!g_turn)
	                {
	                    temp_body.body.velocity.x = that.dragon[g_length - 1].body.velocity.x;
	                    temp_body.body.velocity.y = that.dragon[g_length - 1].body.velocity.y;
	                }
	                temp_body.anchor.set(0.5, 0.5);
	                temp_body.width *= g_scale;
	                temp_body.height *= g_scale;

	                // 添加临时创建的身体
	                that.dragonGroup.add(temp_body);
	                temp_body.bringToTop();

	                //更新g_length
	                g_length++;

	                that.dragon.push(that.dragon[g_length - 2]);
	                that.dragon[g_length - 2] = temp_body;

	                // 更新龙头的坐标
	                that.dragon[g_length - 1].x += that.moveX;
	                that.dragon[g_length - 1].y += that.moveY;
	                
	                // 更新数据
	                that.inflectedRotation.push(that.inflectedRotation[g_length - 2]);
	                that.round.push(that.round[g_length - 2]);
	            }

				// 在游戏结束的时候，执行gameover方法
	            this.gameover = function() {
	                /**
	                 * 上线用
	                 * 游戏结束后调用hwsdk的接口进行数据的提交等
	                 */
	                if (skip) { // 工作台不提交数据，继续循环游戏
	                    game.state.start('play');
	                } else {
	                /**
	                 * 调用得分接口示例
	                 */
	                // 提交分数
                    hwsdk.requestGameScore({
                        'game_score': score,
                        'game_id': game_info['game_id'],
                        'device_type': self.device.platform
                    }, function() {
                     	// 提交分数后的回调操作
                        // 显示结束页，悬浮按钮，弹框
                        hwsdk.showOverPage().showPageBtn().showBox();
                    });
                    // 设置微信分享参数
                    // 1.获取微信分享参数对象，具体属性请查看HWSDK文档
                    var wxObj = hwsdk.getWxShareObj();
                    // 2.游戏分享链接后添加得分参数（分享登录页用）
                    wxObj.link = wxObj.link + "?score="+score;
                    // 3.正则匹配替换{score}为游戏的得分，注：如果为通关类的游戏，则替换{level}
                    var reg = /\{score\}/ig;
                    if (score != 0) {
                        wxObj["title"] = wxObj["title"].replace(reg, function(){return score});
                        wxObj["desc"] = wxObj["desc"].replace(reg, function(){return score});
                    }
                    // 4.设置微信分享参数
                    hwsdk.setWxShare(wxObj, score);

	                //  /**
	                //   * 调用抽奖接口示例
	                //   */
	                //     // 抽奖
	                //     hwsdk.requestLottery(null, function(result) {
	                //         // 判断是否中奖
	                //         if (result && result != "empty") { // 已中奖
	                //             var giftImg = result['lottery'].img; // 获得的奖品图片
	                //             var giftName = result['lottery'].name; // 获得的奖品名称
	                //          // 设置微信分享参数
	                //          // 1.获取微信分享参数对象，具体属性请查看HWSDK文档
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

	                this.end = game.add.audio('end');
	                this.end.play();
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

	                if(time === 0)
	                {
	                    var temp_end = game.add.image(game.world.centerX, 0, 'timeUp');
	                    temp_end.anchor.set(0.5, 1);
	                    game.add.tween(temp_end).to({y: temp_end.y + game.world.centerY}, 1500, Phaser.Easing.Bounce.Out,true, 0, 0, false);
	                }
	                else
	                {
	                    temp_end = game.add.image(game.world.centerX, 0, 'end');
	                    temp_end.anchor.set(0.5, 1);
	                    game.add.tween(temp_end).to({y: temp_end.y + game.world.centerY}, 1500, Phaser.Easing.Bounce.Out,true, 0, 0, false);
	                }

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
	                            g_time = self.time;
	                            g_length = 8;
	                            g_slectAble = true;
	                            g_turn = false;
	                            g_changeBound = false;
	                            g_slide = false;
	                            g_hasGottenRedpaper = false;
	                            g_selectX = null;
	                            g_selectY = null;
	                            g_speed = g_normalSpeed;
	                            game.state.start('play');
	                        }
	                    }, this);
	                }, this);
	                game.time.events.start();
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


   //启动游戏
    gameManager = new Game(bestScore, configJson, 'game_div');
    orientationChange(hwsdk.getDeviceOrientation());
    //绑定屏幕旋转事件
    hwsdk.onOrientationChanged(orientationChange);
    //根据设备屏幕方向启动游戏与否
    function orientationChange(direction) {
        if (direction == "portrait") { // 手机竖屏
            hwsdk.hideRotateMask();
            if (!gameManager.isInit) gameManager.init();
        } else if (direction == "landscape") {  //手机横屏
            hwsdk.showRotateMask();
        } else if (hwsdk.detectDevice() == "pc") { //PC直接启动
            gameManager.init();
        } else if (direction == "undefined" && hwsdk.detectDevice() == "mobile") {
            //PC开发者工具手机模式直接启动
            gameManager.init();
        }
    }
});