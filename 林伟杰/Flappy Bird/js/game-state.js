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
            game.States.boot = function() {
                this.preload = function() {
                    // 设置画布大小
                    $(game.canvas).css("width", game.world.width / 2);
                    $(game.canvas).css("height", game.world.height / 2);
                    // 设置默认背景颜色
                    game.stage.backgroundColor = '#aaa';
                };
                this.create = function() {
                    // 加载完成之后，进入preload状态
                    game.state.start('preload');
                };
            };

            // State - preload
            game.States.preload = function() {
                this.preload = function() {
                    // 加载完成回调
                    function callback() {
                        game.state.start('create');
                    }
                    // 全部文件加载完成
                    game.load.onLoadComplete.add(callback);
                    //加载图片
                    game.load.image('background','assets/images/background.png');//游戏背景图
                    game.load.image('ground','assets/images/ground.png');//游戏地面
                    game.load.image('game_over','assets/images/game-over.png');//游戏结束的图片
                    game.load.image('ready_text','assets/images/get-ready.png');//准备游戏的图片
                    game.load.image('play_tip','assets/images/instructions.png');//玩法提示的图片
                    game.load.image('game_over','assets/images/gameover.png');//游戏结束的图片
                    game.load.image('score_board','assets/images/scoreboard.png');//游戏得分板
                    game.load.atlasJSONArray('bird','assets/images/bird.png','assets/images/bird.json');
                    game.load.atlasJSONArray('pipe',"assets/images/pipes.png","assets/images/pipes.json");

                    game.load.audio('fly_sound','assets/audio/flap.wav');//小鸟飞翔的音效
                    game.load.audio('score_sound','assets/audio/score.wav');//得分的音效
                    game.load.audio('hit_pipe_sound','assets/audio/pipe-hit.wav');//撞机管道的音效
                    game.load.audio('hit_ground_sound','assets/audio/ground-hit.wav');//撞机地面的音效

                    // 安卓只能同时播放一个音乐
                     if (self.gameManager.device.platform != 'android') {
                        game.load.audio('fly_sound','assets/audio/flap.wav');
                    }
                };
            };

            // State - create
            game.States.create = function() {
                this.create = function() {
                  // 初始化音乐
                  //安卓系统只能播放一个音乐
                    if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['fly_sound','score_sound','hit_pipe_sound','hit_ground_sound','ouch']);
                    }else{
                        self.musicManager.init(['fly_sound']);
                    }
                    game.state.start('play');
                };   
            };

            // State - play
            game.States.play = function() {
                this.create = function() {
                    //创建游戏背景
                    this.bg = game.add.sprite(0,0,"background");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;
                    
                    //创建游戏元素
                    this.pipeGroup = game.add.group();//用于存放管道的组
                    this.ground = game.add.tileSprite(0,game.world.height - 112,game.world.width,112,'ground'); 
                    game.physics.enable(this.ground,Phaser.Physics.ARCADE);//开启地面的物理系统
                    this.ground.body.immovable = true;//让地面在物理环境中固定不动
                    this.bird = game.add.sprite(100,300,'bird');//鸟
                    this.bird.width = 68;
                    this.bird.height = 48;
                    this.bird.animations.add('fly',[0,2],12,true);
                    this.bird.animations.play('fly');

                    this.bird.anchor.setTo(0.5,0.5);//设置中心点
                    game.physics.enable(this.bird,Phaser.Physics.ARCADE); 
                    this.bird.body.gravity.y = 0;//鸟的重力

                    this.readyText = game.add.image(game.width / 2, 80, 'ready_text');
                    this.playTip = game.add.image(game.width / 2, 800, 'play_tip');
                    this.readyText.width = this.readyText.width * 2;
                    this.readyText.height = this.readyText.height * 2;
                    this.readyText.anchor.setTo(0.5,0);
                    this.playTip.width = this.playTip.width * 2.5;
                    this.playTip.height = this.playTip.height * 2.5;
                    this.playTip.anchor.setTo(0.5,0);

                    this.hasStarted = false;
                    game.input.onDown.addOnce(this.startGame,this);
                    score = 0;//分数初始化
                };
                this.startGame = function() {
                    this.gameSpeed = 200;
                    this.gameIsOver = false;
                    this.hasHitGround = false;
                    this.hasStarted = true;
                    this.gap = 300;
                    this.scoreGrade = 10;
                    var style = { //设置分数的字体格式
                        font:"60px Arial",fill:"#ffffff"
                    };
                    this.score = game.add.text(game.world.centerX,game.world.centerY -400,"0",style);
                    this.ground.autoScroll(-this.gameSpeed,0);
                    this.bird.body.gravity.y = 1150;
                    this.readyText.destroy();
                    this.playTip.destroy();
                    var spacr_key = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
                    spacr_key.onDown.add(this.fly,this);//每点击一次空格键就触发一次fly事件
                    game.input.onDown.add(this.fly,this);//添加一个鼠标点击事件
                    this.timer = this.game.time.events.loop(1500,this.generatePipes,this);//利用时钟时间来循环产生管道 
                }
                /*1.小鸟的飞翔动作*/
                this.fly = function() {
                    if(this.bird.alive == false){
                        return;
                    }
                    this.bird.body.velocity.y = -350; //飞翔，给鸟设置一个向上的速度
                    game.add.tween(this.bird).to({angle:-30},100,null,true,0,0,false); //上升是头朝上的动画
                    self.musicManager.play('fly_sound'); //播放飞翔的音效
                };
                /*2.碰撞地面*/
                this.ground_hit = function(){
                    if(this.hasHitGround == true || this.bird.alive == false) {
                        return;
                    }
                    this.hasHitGround = true;
                    this.bird.alive = false;
                    this.game.time.events.remove(this.timer);
                    self.musicManager.play('hit_ground_sound');
                    game.state.start("end");
                }
                /*3.碰撞管道*/
                this.pipe_hit = function(){
                    if(this.bird.alive == false){
                        return;
                    }
                    this.bird.alive = false;
                    this.game.time.events.remove(this.timer);
                    this.pipeGroup.forEachAlive(function(p){
                        p.body.velocity.x = 0;
                    },this);
                    self.musicManager.play('hit_pipe_sound');
                    game.state.start("end");
                };
                /*4.碰撞上面*/
                this.top_hit = function() {
                    if(this.hasHitTop == true || this.bird.alive == false) {
                        return;
                    }
                    this.hasHitTop = true;
                    this.bird.alive = false;
                    this.game.time.events.remove(this.timer);
                    game.state.start('end');
                }               
                /*5.管道的生成*/
                this.generatePipes = function(gap) { 
                    gap = this.gap; 

                    var position = (game.world.height /2 - 112) + Math.floor(gap * Math.random());  
                    var topPipeY = position - gap - 640; //上方管道的位置
                    var bottomPipeY = position; //下方管道的位置
                    var topPipe = game.add.sprite(game.world.width,topPipeY,'pipe',0,this.pipeGroup); //上方的管道
                    var bottomPipe = game.add.sprite(game.world.width,bottomPipeY,'pipe',1,this.pipeGroup); //下方管道
                    topPipe.height = topPipe.height * 2;
                    topPipe.width = topPipe.width * 1.5;//让管道变粗
                    bottomPipe.height = bottomPipe.height * 2;
                    bottomPipe.width = bottomPipe.width * 1.5;
                    if(this.resetPipe(topPipeY,bottomPipeY)) {
                        return; //如果有出了边界的管道，则重置他们，不再制造新的管道，达到循环利用的目的
                    }
                    game.physics.enable(this.pipeGroup,Phaser.Physics.ARCADE);//启动管道的物理系统才能使用velocity属性
                    this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed);
                };
                /*6.管道的回收*/
                this.resetPipe = function(topPipeY,bottomPipeY) { 
                    var i = 0;
                    this.pipeGroup.forEachDead(function(pipe) { //pipe表示待检测的管道
                        //对pipeGroup调用forEachDead方法来获取那些已经出了边界，也就是“死亡”了的对象
                        if(pipe.y <= 0) { //是上方的管道
                            pipe.reset(game.world.width,topPipeY); //重置到初始位置
                        } else {
                            pipe.reset(game.world.width,bottomPipeY);//重置回到初始位置
                        }
                        game.physics.enable(this.pipe,Phaser.Physics.ARCADE);
                        pipe.body.velocity.x = -this.gameSpeed; //设置管道速度
                        i++;
                    },this);
                    return i == 2; //如果i == 2代表有一组管道已经出了边界，可以回收这组管道了                
                };
                /*7.执行update事件*/
                this.update = function() {
                    if(this.bird.inWorld == false) {
                        return; 
                    }
                    if(this.bird.angle < 20) {
                        this.bird.angle += 1; //下降时鸟的头朝下的动画
                    }
                    if(this.bird.y <= 0) { //当小鸟触碰到上面的时候游戏结束
                        this.top_hit();
                    }
                    if(score > this.scoreGrade) {
                        this.gap -= 40;
                        this.gameSpeed += 20;
                        this.scoreGrade += 10;
                        this.bird.body.gravity.y += 30;

                    }
                    game.physics.arcade.collide(this.bird,this.ground,this.ground_hit,null,this);//检测与地面的碰撞 
                    game.physics.arcade.collide(this.bird,this.pipeGroup,this.pipe_hit,null,this);//检测与管道的碰撞
                    this.pipeGroup.forEachExists(this.checkScore,this); //分数检测和更新
                };
                /*8.分数管理*/   
                this.checkScore = function(pipe) { 
                    if(!pipe.hasScored && pipe.y<=0 && pipe.x<=this.bird.x-96) {
                        pipe.hasScored = true;
                        this.score.text = ++score; 
                        self.musicManager.play('score_sound'); 
                        return true;
                    }
                    return false;
                };
                /*9.游戏结束*/
                this.gameEnd = function() {

                };
            };
            // 游戏结束界面
            game.States.end = function() {
                this.create = function() {
                    console.log("得分是: " + score);
                    alert("Game Over！你的得分是：" + score);
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
