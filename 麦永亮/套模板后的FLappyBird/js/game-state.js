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

                    //game.load.image('bg', "assets/images/bg.png");
                   // game.load.image('star', "assets/images/star.png");

                    game.load.image('background','assets/background.png'); //背景
                    game.load.image('ground','assets/ground.png'); //地面
                    game.load.image('title','assets/title.png'); //游戏标题
                    game.load.image('btn','assets/start-button.png');  //按钮

                    game.load.spritesheet('bird','assets/bird.png',34,24,3); //鸟        
                    game.load.spritesheet('pipe','assets/pipes.png',54,320,2); //管道
                    game.load.spritesheet('medals','assets/medals.png',44,46,2); //奖牌       

                    game.load.audio('fly_sound', 'assets/flap.wav');//飞翔的音效
                    game.load.audio('score_sound', 'assets/score.wav');//得分的音效
                    game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞击管道的音效
                    game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效

                    game.load.image('ready_text','assets/get-ready.png');//ready文字
                    game.load.image('play_tip','assets/instructions.png'); //提示图片
                    game.load.image('game_over','assets/gameover.png'); //gameover文字图片
                    game.load.image('score_board','assets/scoreboard.png'); //得分榜

                    //加载音效
                    // game.load.audio('bg', "assets/audio/bg.mp3");
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
                    if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['bg','input']);
                    }else{
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

                    this.bg = game.add.image(0,0,'background');
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;
                    
                    
                    this.pipeGroup = game.add.group();
                    this.pipeGroup.enableBody = true;  //该组内所有内容开启物理系统，默认物理系统为physicsBodyType

                    this.ground = game.add.tileSprite(0,game.height-224,game.width,224,'ground'); //ground放在pipeGroup后面定义，这样地面可以覆盖管道
                    this.ground.tileScale.setTo(2,2);

                    //this.testText = game.add.text(game.width/2,game.height/2,'game.width/2');
                    //console.log("game.width:" +　game.width/2);

                    //this.testText = game.add.text(375,game.height/2,'375');

                    this.scoreText = game.add.text(game.world.centerX-20, 30, '0');  //跟上面同理\
                    this.scoreText.fontSize = 72;

                    this.bird = game.add.sprite(100,300,'bird');
                    this.bird.animations.add('fly');
                    this.bird.animations.play('fly',10,true);
                    this.bird.anchor.setTo(0.5,0.5);
                    this.bird.width = this.bird.width *2;  
                    this.bird.height = this.bird.height *2;


                    game.physics.enable(this.bird,Phaser.Physics.ARCADE); //小鸟开启arcade物理系统
                    this.bird.body.gravity.y = 0;  //开始前重力为0        
                    game.physics.enable(this.ground,Phaser.Physics.ARCADE);//地面开启arcade物理系统
                    this.ground.body.immovable = true;   //地面不会受到其他物理撞击的影响

                    this.soundFly = game.add.sound('fly_sound');
                    this.soundScore = game.add.sound('score_sound');
                    this.soundHitPipe = game.add.sound('hit_pipe_sound');
                    this.soundHitGround = game.add.sound('hit_ground_sound');       
             
                    this.readyText = game.add.image(game.width/2, 60, 'ready_text'); //get ready 文字
                    this.readyText.width*=2;
                    this.readyText.height*=2;

                    this.playTip = game.add.image(game.width/2,game.height/2,'play_tip'); //提示点击屏幕的图片
                    this.playTip.width*=2;
                    this.playTip.height*=2;
                    

                    this.readyText.anchor.setTo(0.5, 0.2);
                    this.playTip.anchor.setTo(0.5, 0.2);

                    this.hasStarted = false;  //游戏是否开始标记
                    game.time.events.loop(1000,this.generatePipes,this);  //每900ms调用一次generatePipes函数(生成一组管道)        
                    game.input.onDown.addOnce(this.startGame, this); //点击屏幕后调用startGame函数（开始游戏），仅生效一次


                    /*
                    // 示例-创建背景音乐
					self.musicManager.play("bg");
                    game.input.onDown.add(function(){
                        self.musicManager.play("input");
                    });

                    // 示例-创建游戏背景
                    var bg = game.add.image(0, 0, "bg");
                    bg.width = game.world.width;
                    bg.height = game.world.height;

                    // 示例-创建游戏元素
                    var star = game.add.sprite(game.world.centerX, game.world.centerY, "star");
                    star.anchor.setTo(0.5, 0.5);

                    // 示例-创建动画
                    game.add.tween(star).to({ y: star.y - 100 }, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);
                };
                */
            }

            this.startGame = function(){  //设置开始游戏后相关参数
                this.gameSpeed = 200*2;  //移动速度
                this.hasGameOvered = false;  //是否gameover标记
                this.hasHitGround = false;   //是否碰到地面标记
                this.hasStarted = true;      //是否开始游戏标记，设为TRUE，游戏开始
                this.score = 0;              //初始化得分为0
                //.bg.autoScroll(-(this.gameSpeed/10),0);   //背景开始向左移动，速度为gameSpeed的十分之一
                this.ground.autoScroll(-(this.gameSpeed),0);  //地面开始向左移动，速度为gameSpeed
                this.bird.body.gravity.y = 1400;   //给小鸟施加重力，让小鸟向下掉
                this.readyText.destroy();  //去掉ready文字
                this.playTip.destroy();    //去掉Tip图片
                game.input.onDown.add(this.fly,this);   //点击屏幕后，调用fly函数
                game.time.events.start();   //启动时钟，开始计时
            }

            this.fly = function(){  //小鸟飞翔函数
                this.bird.body.velocity.y = -550;   //让小鸟有一个向上的速度，即向上飞一段距离
                game.add.tween(this.bird).to({angle:-30},100,null,true,0,0,false);  //给小鸟施加向上30度的动画，即让小鸟抬头
                this.soundFly.play(); //播放飞的声音
            }

            this.generatePipes = function(){    //生成管道函数
                gap =  118*2;  //管道间间隙
                var upPosition = (game.height-112*2)/2 -150*2
                var buttomPosition = upPosition +　203*2;
                var position = (upPosition + Math.floor( 203 *2 * Math.random()));//计算出一个上下管道之间的间隙左上角的随机位置
                var topPipeY = position - 320*2.5;      //上方管道左上角位置
                var bottomPipeY = position + gap;   //下方管道左上角位置

                if(this.resetPipe(topPipeY,bottomPipeY)) return; //如果有出了边界的管道，则重置他们，不再制造新的管道了,达到循环利用的目的

                var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup); //上方的管道
                var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup); //下方的管道

                topPipe.width *=2;
                topPipe.height *=2.5;
                bottomPipe.width*=2;
                bottomPipe.height*=2.5;
                
                this.pipeGroup.setAll('body.immovable',true); //让管道不受小鸟撞击影响
                this.pipeGroup.setAll('checkWorldBounds',true); //开启边界检测，才能让outOfBoundsKill生效
                this.pipeGroup.setAll('outOfBoundsKill',true); //出边界后自动kill
                this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed); //设置管道运动的速度         
            }

            this.resetPipe = function(topPipeY,bottomPipeY){//重置出了边界的管道，做到回收利用
                var i = 0;
                this.pipeGroup.forEachDead(function(pipe){ //对组调用forEachDead方法来获取那些已经出了边界，也就是“死亡”了的对象
                    if(pipe.y<=0){ //是上方的管道
                        pipe.reset(game.width, topPipeY); //重置到初始位置
                        pipe.hasScored = false; //重置为未得分
                    }else{//是下方的管道
                        pipe.reset(game.width, bottomPipeY); //重置到初始位置
                    }
                    pipe.body.velocity.x = -this.gameSpeed; //设置管道速度
                    i++;
                }, this);
                return i == 2; //如果 i==2 代表有一组管道已经出了边界，可以回收这组管道了
            }

            this.update = function(){
                if(!this.hasStarted) 
                    return; //若游戏还没开始，返回
                game.physics.arcade.collide(this.bird,this.ground,this.hitGround,null,this);  //检测小鸟与地面碰撞，碰撞后调用hitGround函数
                game.physics.arcade.collide(this.bird,this.pipeGroup,this.hitPipe,null,this); //检测小鸟与管道组碰撞，碰撞后调用hitPipe函数
                if(this.bird.angle < 90)  //当小鸟的头未超过垂直向下时
                    this.bird.angle += 2.5; //下降时头朝下
                this.pipeGroup.forEachExists(this.checkScore,this); //对每一个存在的管道，调用checkScore函数
            }

            this.hitGround = function(){
                if(this.hasGameOvered)  //如果游戏已经结束，返回
                    return;
                this.hasHitGround = true;   //碰撞到地面标记为真
                this.soundHitGround.play(); //播放撞击地面声音
                this.gameOver(true);        //调用gameoOver函数，传入参数为true   //撞击地面函数
            }

            this.hitPipe = function(){      //撞击管道函数
                if(this.hasGameOvered)  //如果游戏已经结束，返回
                    return;
                this.hasHitPipe = true; //碰撞到管道标记为真
                this.soundHitPipe.play(); //播放撞击管道声音
                this.gameOver();        //调用gameOver函数
            }

            this.gameOver = function(){         
                this.hasGameOvered = true;  //标记游戏结束
                this.stopGame();            //调用停止游戏函数
                this.showResult();          //调用输出结果函数//死亡后函数
            }

            this.stopGame = function(){
                //this.bg.stopScroll();   //背景开始停止移动
                this.ground.stopScroll();  //地面开始停止移动
                this.pipeGroup.setAll('body.velocity.x',0); //管道停止移动
                game.time.events.stop(true);    //时钟停止
                game.input.onDown.remove(this.fly,this);   //去除fly函数
                this.bird.animations.stop();    //小鸟动画停止                停止游戏
            }

            this.checkScore = function(pipe){   //每一帧都检查分数
                if(!pipe.hasScored && pipe.y<0 && pipe.x+54<=this.bird.x &&pipe.y< this.bird.y) {  //未得分的，上方的管道，当小鸟经过时
                    pipe.hasScored = true;
                    this.score++;  //游戏得分+1
                    this.scoreText.text = this.score;
                    this.soundScore.play();
                }
            }
            
            this.showResult = function(){
                this.scoreText.destroy();   //去除上方得分文字

                game.bestScore = game.bestScore || 0;   //若存在最高分数，则继承，若无，则设为0

                if(game.bestScore < this.score)
                    game.bestScore = this.score;  //如果这次的分数比游戏记录好，那么这次分数设为游戏记录

                this.scoreGroup = this.add.group();   //创建一个组存放得分面板内容

               


                var scoreBoard = this.scoreGroup.create(game.width/2,game.height/3.3,'score_board'); //得分面板
                scoreBoard.anchor.setTo(0.5,0);
                scoreBoard.width *=2;
                scoreBoard.height *=2;

                var gameOverText = this.scoreGroup.create(game.width/2,scoreBoard.y -120,'game_over');  //GameOver文字
                gameOverText.anchor.setTo(0.5,0);
                gameOverText.width*=2;
                gameOverText.height*=2;

                var currentScoreText = this.add.text(scoreBoard.x+155,scoreBoard.y+55,this.score+'', 20 , this.scoreGroup );  //显示本次分数
                currentScoreText.fontSize =65;
                var bestScoreText = this.add.text(scoreBoard.x+155,scoreBoard.y+145,game.bestScore+'', 20 , this.scoreGroup ); //显示最高分数
                bestScoreText.fontSize =65;
                var returnBtn = this.add.image(game.width/2,scoreBoard.y+200,'btn');
                returnBtn.anchor.setTo(0.5,0);
                returnBtn.width *=2;
                returnBtn.height *=2;

                game.input.onTap.add(function(e){
                    //console.log('x:'+e.x +',y:'+e.y);
                    //console.log(returnBtn.x + ',' +returnBtn.width);
                    //console.log(returnBtn.y + ',' +returnBtn.height);
                    if( (e.x*2<returnBtn.x+returnBtn.width/2) && (e.x*2>returnBtn.x-returnBtn.width/2) && (e.y*2<returnBtn.y+returnBtn.height*2) && (e.y*2>returnBtn.y) )
                    {
                        console.log('restart');
                        game.state.start('play');              
                    }
                }
                , this.scoreGroup);

                currentScoreText.anchor.setTo(0.5,0);
                bestScoreText.anchor.setTo(0.5,0);

                if(this.score > 5 && this.score <=10)
                    {
                        var silverMedal = this.add.sprite(scoreBoard.x -177, scoreBoard.y+87, 'medals', 0, this.scoreGroup); //显示银牌
                        silverMedal.width *=2;
                        silverMedal.height *=2;
                    }
                else if(this.score >10)
                    {
                        var goldMedal = this.add.sprite(scoreBoard.x -177, scoreBoard.y+87, 'medals', 1, this.scoreGroup); //显示金牌
                        goldMedal.width *=2;
                        goldMedal.height *=2;
                    }
                else
                    ;    //展示得分榜
            }

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
