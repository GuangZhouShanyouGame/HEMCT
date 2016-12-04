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
        bestScore: 0,
        // 各组件放大比例
        scale: 1,
        //地面运动速度
        gameSpeed: 350,
        //用来播放音频
        soundFlap: null,
        soundScore: null,
        soundHitPipe: null,
        soundHitGround: null,
        soundOuch: null,
        // 初始化
        init: function() {
            var self = this;
            var game = this.game;
            var scale = this.scale;
            var gameSpeed = this.gameSpeed;
            var soundFlap = this.soundFlap;
            var soundScore = this.soundScore;
            var soundHitPipe = this.soundHitPipe;
            var soundHitGround = this.soundHitGround;
            var soundOuch = this.soundOuch;
            var bestScore = this.bestScore;
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

                    game.load.image('preloader', 'assets/preloader.gif');
                };
                this.create = function() {
                    // 进入preload状态
                    game.state.start('loader');
                };
            };

            // State - preload
            // 加载游戏所需资源
            game.States.loader = function() {
                var progresstext;
                this.init = function()
                {
                    var sprite = game.add.image(game.world.centerX, game.world.centerY, 'preloader');
                    sprite.anchor = {x:0.5, y:0.5};
                    progresstext = game.add.text(game.world.centerX, game.world.centerY + 30, '0%',
                        { fill:'#fff', fontSize:'16px'});
                    progresstext.anchor = {x:0.5, y:0.5};
                };

                this.preload = function() {
                    // 加载完成回调
                    function callback() {
                        game.state.start('create');
                    }
                    // 全部文件加载完成
                    game.load.onLoadComplete.add(callback);

                    game.load.atlasJSONArray('bird', "assets/bird.png", "assets/bird.json");

                    game.load.spritesheet('pipes', 'assets/pipes.png', 54, 320);

                    game.load.image('background', 'assets/background.png');
                    game.load.image('game-over', 'assets/gameover.png');
                    game.load.image('get-ready', 'assets/get-ready.png');
                    game.load.image('ground', 'assets/ground.png');
                    game.load.image('instructions', 'assets/instructions.png');
                    game.load.image('medals', 'assets/medals.png');
                    game.load.image('particle', 'assets/particle.png');     
                    game.load.image('poop', 'assets/poop.png');
                    game.load.image('scoreboard', 'assets/scoreboard.png');
                    game.load.image('start-button', 'assets/start-button.png');
                    game.load.image('title', 'assets/title.png');

                    game.load.audio('score', 'assets/score.wav');
                    game.load.audio('pipe-hit', 'assets/pipe-hit.wav');
                    game.load.audio('ouch', 'assets/ouch.wav');
                    game.load.audio('flap', 'assets/flap.wav');
                    game.load.audio('ground-hit', 'assets/ground-hit.wav');

                    game.load.bitmapFont('flappy_font', 
                        'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');

                    game.load.onFileComplete.add(function(progress)        //加载进度事件动态改变文字内容
                    {
                        progresstext.text = progress + '%';
                    });

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
                    // if(self.gameManager.device.platform != 'android'){
                    //     self.musicManager.init(['score','pipe-hit','ouch','ground-hit']);
                    // }else{
                    //     self.musicManager.init(['score','pipe-hit','ouch','ground-hit']);
                    // }
                    soundFlap = game.add.sound('flap');
                    soundScore = game.add.sound('score');
                    soundHitPipe = game.add.sound('pipe-hit');
                    soundHitGround = game.add.sound('ground-hit');
                    soundOuch = game.add.sound('ouch');
                    
                    game.state.start('play');
                }
            };

            // State - play
            // 游戏界面
            game.States.play = function() {
                this.createPipes = function(gap)         //制造管道
                {
                    //如果gap存在的话，取gap的值，如果不存在，则取100;
                    gap = gap || 300; //上下管道之间的间隙宽度
                    var position = (game.world.height - 320 * scale - gap) + Math.floor(160 * scale * Math.random());
                    var topPipeY = position - 320 * scale;
                    var bottomPipeY = position+gap;
                    //根据放大的比例重置坐标

                    //一旦有管道出了边界，说明已经不需要继续制造管道了，可以直接进行回收
                    if(this.resetPipe(topPipeY,bottomPipeY)) return;

                    var topPipe = game.add.sprite(game.width, topPipeY, 'pipes', 0, this.pipeGroup);
                    var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipes', 1, this.pipeGroup);

                    // topPipe.anchor.set(0, 1);
                    // bottomPipe.anchor.set(0, 0);

                    topPipe.height *= scale;
                    topPipe.width *= scale;
                    bottomPipe.height *= scale;
                    bottomPipe.width *= scale;  
                    this.pipeGroup.setAll('checkWorldBounds',true);
                    this.pipeGroup.setAll('outOfBoundsKill',true);
        //为什么这里的this.gameSpeed是undefined？
        //this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed);
                    this.pipeGroup.setAll('body.velocity.x', -gameSpeed);
                    console.log(gameSpeed);
                }

                this.resetPipe = function(topPipeY,bottomPipeY)     //重置出了边界的管道，做到回收利用
                {
                    var i = 0;
                    this.pipeGroup.forEachDead(function(pipe){
                        if(pipe.y<=0){ //topPipe
                            pipe.reset(game.world.width, topPipeY);
                            this.hasScored = false; //重置为未得分
                        }else{
                            pipe.reset(game.world.width, bottomPipeY);
                        }
                        pipe.body.velocity.x = -gameSpeed;
                        i++;
                    }, this);
                    //如果 i==2 代表有一组管道已经出了边界，可以回收这组管道了
                    return i == 2; 
                }

                this.create = function() {
                    // 此处写游戏逻辑

                    // 示例-创建背景音乐
					//self.musicManager.play("bg");
                    // game.input.onDown.add(function(){
                    //     self.musicManager.play("input");
                    // });

                    //检测是否碰撞管道，避免出现多次碰撞
                    this.isHitPipe = false;

                    //本次游戏的分数
                    this.score = 0;

                    //示例-创建游戏背景
                    this.background = game.add.sprite(0, 0, "background");
                    //这里仅仅是为了得出其他组件放大的比例
                    if(this.background.width > this.background.height)
                    {
                        scale = game.world.width / this.background.width;
                    }
                    else
                    {
                        scale = game.world.height / this.background.height;
                    }
                    //这里不能按比例放大，因为图片的比例不一定符合屏幕的长宽比，所以需要直接放到铺满屏幕
                    this.background.width = game.world.width;
                    this.background.height = game.world.height;

                    //越后添加，其所在层次越高，层次低的会被层次高的遮蔽
                    //添加一个存放管道精灵的组
                    this.pipeGroup = game.add.group();
                    this.pipeGroup.enableBody = true;
                    
                    //示例-创建游戏元素 
                    this.ground = game.add.tileSprite(game.world.centerX, game.world.centerY, game.world.width, 300, "ground");
                    console.log(this.ground.width+" "+this.ground.height);
                    console.log(game.world.width+" "+game.world.height);
                    console.log(this.ground.x+" "+this.ground.y);

                    //放大ground这张图片，但是还不是很理解这个Image和TileSprite之间的关系
                    this.ground.tileScale.set(1, 3);
                    this.ground.x = 0;
                    this.ground.y = game.world.height - this.ground.height;
                    this.ground.autoScroll(-gameSpeed, 0);
                    //开启地面的物理系统，检测鸟与地面是否发生碰撞
                    game.physics.enable(this.ground, Phaser.Physics.ARCADE);
                    this.ground.body.immovable = true;

                    
                    //创建鸟扇动翅膀的动画
                    this.bird = game.add.sprite(100, 300, 'bird');
                    this.bird.animations.add('fly', ['bird01.png', 'bird02.png', 'bird03.png']);
                    this.bird.play('fly', 10, true);
                    this.bird.width *= scale;
                    this.bird.height *= scale;
                    this.bird.anchor.set(0.5, 0.5);

                    //开启鸟的物理系统，并为鸟设置一个向下的重力
                    game.physics.enable(this.bird, Phaser.Physics.ARCADE);
                    this.bird.body.gravity.y = 1200;

                    //加上显示分数的图片
                    this.scoreText = game.add.bitmapText(game.world.centerX, 50, 'flappy_font', '0', 36 * scale);
                    this.scoreText.anchor.set(0.5, 0.5);

        //为什么这里要加上第二个参数this才能正常运行??
                    game.input.onDown.add(this.flap, this);
                    // game.add.tween(this.bird).to({angle: 0}, 10, Phaser.Easing.Default, true, 0, 0, false);

                    //每隔多长时间创建一个管道需要根据管道的宽度以及gameSpeed的大小来判断
                    game.time.events.loop(2000, this.createPipes, this);
                    game.time.events.start();

                };

                //飞行的动画
                this.flap = function()
                {
                    soundFlap.play();
                    game.add.tween(this.bird).to({angle: -35}, 100, Phaser.Easing.Default, true, 0, 0, false);
                    this.bird.body.velocity.y = -700;

                }

                this.getScore = function(pipe)
                {
                    if(!this.hasScored && pipe.x < this.bird.x - this.bird.width / 2 - pipe.width)
                    {
                        this.score++;
                        this.scoreText.text = this.score;
                        soundScore.play();
                        //设置得分状态，避免重复得分
                        this.hasScored = true;

                        //设置最好分数
                        if(bestScore < this.score)
                        {
                            bestScore = this.score;
                        }
                    }
                }

                this.update = function() {
                    if(this.bird.y < 0 && !this.isHitPipe)
                    {
                        this.hitPipe();
                    }

                    // 开启碰撞检测
                    game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this);
                    if(!this.isHitPipe)
                        game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this);
                    this.pipeGroup.forEachExists(this.getScore, this);
                    if(this.bird.angle < 90)
                    {
                        this.bird.angle += 1;
                    }
                };

                this.hitGround = function()
                {
                    soundHitGround.play();
                    game.paused = true;
                    this.gameEnd();
                }

                this.hitPipe = function()
                {
                    soundHitPipe.play();
                    soundOuch.play();
                    this.ground.stopScroll();
                    this.pipeGroup.forEachExists(function(pipe){
                        pipe.body.velocity = 0;
                    }, this);
                    //后面的数字值的是停止动画之后要保留哪一帧
                    this.bird.animations.stop('fly', 0);
                    game.input.onDown.remove(this.flap, this);

                    game.time.events.stop();
                    this.isHitPipe = true;
                }

                // 游戏结束
                this.gameEnd = function() {
                    //销毁显示的分数图片
                    this.scoreText.destroy();

                    var gameOver = game.add.image(game.world.centerX, game.world.centerY / 4, 'game-over');
                    gameOver.width *= scale;
                    gameOver.height *= scale;
                    gameOver.anchor.set(0.5, 0.5);

                    var scoreboard = game.add.image(game.world.centerX, game.world.centerY, 'scoreboard');
                    scoreboard.width *= scale;
                    scoreboard.height *= scale;
                    scoreboard.anchor.set(0.5, 1);

                    //创建按钮图片，用范围判断来触发事件，起到点击按钮触发事件的效果
                    var button = game.add.image(game.world.centerX, game.world.height * 3 / 5, 'start-button');
                    button.width *= scale;
                    button.height *= scale;
                    button.anchor.set(0.5, 0.5);
                    // console.log(button.x, button.y);
                    game.input.onDown.add(function()
                    {
                        // console.log(game.input.position.x, game.input.position.y);
                        if(Math.abs(game.input.position.x - 189) < button.width / 2 && Math.abs(game.input.position.y - 400) < button.height / 2)
                        {
        //这里要先把game.paused设置为false，才能恢复正常的场景转化功能
                            game.paused = false;
                            game.state.start('create');
                        }
                    });

                    //创建最好分数条
                    var bestScoreText = game.add.bitmapText(game.world.centerX + 190, game.world.centerY - 40, 'flappy_font', bestScore+"", 30 * scale);
                    bestScoreText.anchor.set(0.5, 0.5);
                    //创建当前分数条
                    var currentScoreText = game.add.bitmapText(game.world.centerX + 190, game.world.centerY - 175, 'flappy_font', this.score+"", 30 * scale);
                    currentScoreText.anchor.set(0.5, 0.5);
                };
            };

    //如果切换场景，需要把所有的图片重新添加一遍，觉得比较浪费，所以直接在上面定义了一个创造游戏结束画面的函数
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
            game.state.add('loader', game.States.loader);
            game.state.add('create', game.States.create);
            game.state.add('play', game.States.play);
            game.state.add('end', game.States.end);
            game.state.start('boot');
        }
    };
    return GameState;
});
