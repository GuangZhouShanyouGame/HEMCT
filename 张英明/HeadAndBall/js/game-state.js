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
                    game.load.image("score","assets/images/score.png");
                    game.load.image("scoreBg","assets/images/score_bg.png");
                    game.load.image("bg","assets/images/bg.png");
                    game.load.image('ground',"assets/images/ground.png");
                    game.load.image('ground2',"assets/images/ground2.png");
                    game.load.image('star',"assets/images/star.png");
                    game.load.image('soccer',"assets/images/soccer.png");
                    game.load.image('bomb',"assets/images/bomb.png");
                    game.load.image('player_die',"assets/images/player_die.png");
                    game.load.atlasJSONArray('star_die',"assets/images/star_die.png","assets/images/player_die.json");
                    game.load.atlasJSONArray('player',"assets/images/player.png","assets/images/player.json");
                    game.load.atlasJSONArray('ballOrBomb',"assets/images/soccerOrBomb.png","assets/images/soccerOrBomb.json");
                };
            };

            
            // 开始界面
            game.States.create = function() {
                this.create = function() {
                    // 初始化音乐
                    /*if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['bg','input']);
                    }else{
                        self.musicManager.init(['bg']);
                    }*/
                    game.state.start('play');
                }
            };

            var ground2,ground,player,soccerGroup,starGroup,delayNum = 0,scoreText,soccerOrBomb,createSoccerTimer,speed,shadow;
            // var offset = new Phaser.Point(10,8);
            // 游戏界面
            game.States.play = function() {
                this.create = function() {
                    this.getBomb = false;  //代表没有碰到炸弹
                    this.addScore = false;
                    this.isJump = false;
                    speed = game.world.width / 0.88;
                    game.physics.startSystem(Phaser.Physics.ARCADE);
                    var bg = game.add.sprite(0,0,'bg');
                    bg.width = game.world.width;
                    bg.height = game.world.height;

                    // 球着地的草地
                    ground2 = game.add.sprite(0,game.world.height - game.cache.getImage('ground').height / 2 ,'ground2');
                    ground2.width = game.world.width;
                    game.physics.enable(ground2, Phaser.Physics.ARCADE);
                    ground2.body.immovable = true;
                    //人站的草地
                    ground = game.add.sprite(0,game.world.height - game.cache.getImage('ground').height ,'ground');
                    ground.width = game.world.width;
                    game.physics.enable(ground, Phaser.Physics.ARCADE);
                    ground.body.immovable = true;
                    // 人
                    player = game.add.sprite(game.world.centerX, game.world.height - game.cache.getImage('ground').height - 235, 'player');
                    player.anchor.setTo(0.5,0);
                    game.physics.enable(player,Phaser.Physics.ARCADE);
                    player.body.setSize(140,230,20,5);
                    player.body.checkWorldBounds = true;
                    // player.body.immovable = true;
                    player.body.gravity.y = 3700;
                    player.animations.add('stand',[0,1],2,true);
                    player.animations.play('stand');
                    //阴影
                    // shadow = game.add.sprite(player.x + offset.x,player.y + offset.y,'player');
                    // shadow.anchor.set(0.5);
                    // shadow.tint = 0x000000;
                    // shadow.alpha = 0.6;

                    game.input.onDown.add(this.jump,this);

                    soccerGroup = game.add.group();
                    soccerGroup.createMultiple(5,'ballOrBomb');
                    soccerGroup.enableBody = true;
                    soccerGroup.physicsBodyType = Phaser.Physics.ARCADE;
                    soccerGroup.setAll('checkWorldBounds',true);
                    soccerGroup.setAll('outOfBoundsKill',true);
                    
                    starGroup = game.add.group();
                    starGroup.createMultiple(2,'star');
                    starGroup.enableBody = true;
                    starGroup.physicsBodyType = Phaser.Physics.ARCADE;

                    // 生成足球或者炸弹的timer
                    createSoccerTimer = game.time.events.loop(1000,this.choseBallOrBomb,this);
                    // 分数背景随内容的增加而变宽
                    var scoreBg = game.add.sprite(50,50,"scoreBg");
                    var scoreIcon = game.add.sprite(50,50,"score");
                    scoreText = game.add.text(scoreIcon.x + 70,60,"0 ",{ font:"38px score", fill: "#FE9400",align: "center"});
                    scoreBg.width = scoreText.right < 220 ? 220 : scoreText.right;

                    // 星星消失的粒子
                    this.emitter = game.add.emitter(0,0,30);
                    this.emitter.makeParticles('star');
                    this.emitter.maxParticleScale = 1;
                    // this.emitter.minParticleScale = 0.05;

                    // this.soccer = game.add.sprite(game.world.centerX, game.world.centerY,'soccer');
                    // this.soccer.anchor.set(0.5);
                    // game.physics.enable(this.soccer,Phaser.Physics.ARCADE);

                };
                
                this.jump = function(){
                    this.isJump = true;
                    //在地面上时进行跳跃，位置有一些偏差
                    if(player.body.y + player.body.height > ground.y - 3 && player.body.y + player.body.height < ground.y + 3){
                        var jumpAni = player.animations.add('jump',[2],60);
                        player.animations.play('jump');
                        player.body.velocity.y = -1000; 
                        jumpAni.onComplete.add(function(){
                            // this.jumpTween.stop();
                            player.animations.play('stand');
                            this.isJump = false;
                        })   
                        // player.body.gravity.y = 1000;
                    }  
                };
                this.choseBallOrBomb = function(){
                    this.addScore = false;  //生成的时候碰撞星星不加分，只有在被头顶到弹飞的时候才加分
                    // this.isBall = false;
                    this.isBomb = false;
                    ballOrBomb = soccerGroup.getFirstExists(false);
                    //随机方向
                    var randomDir = game.rnd.between(0,1);
                    
                    if(ballOrBomb){
                        game.physics.enable(ballOrBomb,Phaser.Physics.ARCADE);
                        // var randomY = gameme.rnd.integerInRange(game.world.height / 3, game.world.height / 3);  //96足球的高度
                        var randomY = game.world.height / 2.57;
                        
                        // 足球在左边或者右边随机生成，0=左边
                        if(randomDir == 0){
                            var randomSOB = game.rnd.between(0,4);    //随机球和炸弹，比例5:1
                            var randomX = 0;
                            // 随机选择足球或者炸弹
                            if(randomSOB == 0){
                                this.isBomb = true;
                                ballOrBomb.frameName = 'bomb.png';  
                                generateBallOrBomb(ballOrBomb,randomX,randomY);
                                ballOrBomb.body.velocity.x = speed;

                            } else{
                                // this.isBall = true;
                                ballOrBomb.frameName = 'soccer.png';
                                generateBallOrBomb(ballOrBomb,randomX,randomY);
                                ballOrBomb.body.velocity.x = speed;
                                setTimeout(function(){   //左边出来的球会受到边界碰撞的影响，右边不会奇怪
                                    ballOrBomb.body.collideWorldBounds = true; 
                                },100);                              
                            }   
                        } else{
                            var randomSOB = game.rnd.between(0,4);
                            var randomX = game.world.width - 96;
                            if(randomSOB == 0){
                                this.isBomb = true;
                                ballOrBomb.frameName = 'bomb.png';  
                                generateBallOrBomb(ballOrBomb,randomX,randomY);
                                ballOrBomb.body.velocity.x = -speed;

                            } else{
                                // this.isBall = true;
                                ballOrBomb.frameName = 'soccer.png';
                                generateBallOrBomb(ballOrBomb,randomX,randomY);
                                ballOrBomb.body.velocity.x = -speed;
                                ballOrBomb.body.collideWorldBounds = true;
                            }   
                        }
                        speed--;
                    }
                    // 生成足球/炸弹的同时生成星星
                    var star = starGroup.getFirstExists(false);
                    if(star){
                        star.anchor.set(0.5);
                        game.physics.enable(star,Phaser.Physics.ARCADE);
                        var starWidth = game.cache.getImage('star').width;
                        var randomStarX = game.rnd.integerInRange(starWidth, game.world.width - starWidth);
                        var randomStarY = game.rnd.integerInRange(80+game.cache.getImage('star').height, game.world.height / 3);
                        star.reset(randomStarX,randomStarY);  
                    }
                    // 足球/炸弹绑定出界事件kill star
                    ballOrBomb.events.onOutOfBounds.add(function(){
                        star.kill();
                    },this)   
                };
                function generateBallOrBomb(obj,randomX,randomY){
                    obj.reset(randomX,randomY);
                    obj.anchor.set(0.5);
                    obj.body.angularVelocity = 500;
                    obj.body.gravity.y = game.world.height / 1.77;
                    // obj.body.velocity.x = speed || game.world.width / 0.88;
                    obj.body.bounce.x = 0.3;
                    obj.body.bounce.y = 0.5;
                
                }
                var hitBall = false;
                this.playBall = function(player,soccer){                                              
                    if(ballOrBomb.frameName == 'soccer.png'){
                        // soccer.body.velocity.y = -800; 
                        if(!hitBall){
                            // 根据撞击的位置改变速度方向
                            if(soccer.body.velocity.x > 0 && soccer.x + soccer.width / 2 < game.world.width / 2){
                                soccer.body.velocity.x = -soccer.body.velocity.x;
                                soccer.body.velocity.y = -game.world.height / 1.2;
                            } else if(soccer.body.velocity.x < 0 && Math.abs(soccer.x - game.world.width) < game.world.width / 2 ){
                                soccer.body.velocity.x = -soccer.body.velocity.x;
                                soccer.body.velocity.y = -game.world.height / 1.2;
                            } else {
                                soccer.body.velocity.y = -game.world.height / 1.2;
                            }
                            //更新分数
                            hitBall = true;
                            self.score++;
                            scoreText.text = self.score + " ";
                            // createSoccerTimer.delay--;
                        }
                        setTimeout(function(){
                            hitBall = false;
                        },100);
                        // 此时球可以吃星星 
                        this.addScore = true;
                    }
                    if(ballOrBomb.frameName == 'bomb.png'){
                        this.getBomb = true;
                    }
                    soccer.body.collideWorldBounds = false;  
                };
                // function boomAnimat(pos,pic){
                //     var Enemyexplode = game.add.sprite(pos.x,pos.y, 'player_die');
                //         Enemyexplode.width = pos.width;
                //         Enemyexplode.height = pos.height;
                //         var anim = Enemyexplode.animations.add('Enemyexplode',20);
                //         Enemyexplode.animations.play('Enemyexplode');
                //         anim.onComplete.add(function(e){
                //             e.destroy();
                //         },this);
                // }
                this.getStar = function(ball,star){
                    if(this.addScore){
                        star.kill();
                        this.emitter.x = star.x;
                        this.emitter.y = star.y;
                        this.emitter.start(true, 1000, null, 10);
                        this.emitter.forEach(function(e){
                            var starScale = game.add.tween(e.scale).to({
                                x:0.01,y:0.01
                            },1000,Phaser.Easing.Linear.In,true,0,0,true);
                        })
                        // boomAnimat(star,'star_die');
                        self.score = self.score + 3;
                        scoreText.text = self.score + " ";
                    } 
                };
                this.render = function(){
                    // game.debug.spriteBounds(ground);
                    // game.debug.spriteBounds(player);
                    // game.debug.body(player);
                    // game.debug.body(this.soccer);
                };
                this.hitBomb = function(player,bomb){
                    // var playerDie = game.add.sprite(bomb.x,bomb.y,'player_die');
                    // playerDie.width = bomb.width;
                    // playerDie.height = bomb.height;
                    // var playerDieAni = playerDie.animations.add('die',[0,1],6);
                    // playerDie.animations.play('die');
                    
                    // playerDieAni.onComplete.add(function(e){
                    //     e.destroy();
                    //     // game.state.start('end');
                    // },this)
                    bomb.destroy();
                    game.state.start('end');
                };
                
                this.update = function() {
                    // 每一帧更新都会触发
                    game.physics.arcade.collide(player,ground);
                    if(!this.isBomb){
                        game.physics.arcade.collide(soccerGroup, ground2,this.gameEnd);  //边界效果
                    }
                    if(this.isJump){
                        game.physics.arcade.overlap(player, soccerGroup, this.playBall, null, this);  //人打到球
                    } 
                    game.physics.arcade.overlap(soccerGroup, starGroup, this.getStar, null, this);  //球打到星星
                    if(this.getBomb){
                        game.physics.arcade.overlap(player, soccerGroup, this.hitBomb, null, this);  //人打到炸弹
                    }
                };

                // 游戏结束
                this.gameEnd = function() {
                    game.time.events.remove(createSoccerTimer);
                    arguments[0].angularVelocity = 0;
                    // game.state.start('end');
                    setTimeout(function(){
                        game.state.start('end');
                    },300)
                };
            };

            // State - end
            // 游戏结束界面
            game.States.end = function() {
                this.create = function() {
                    // 游戏结束
                    game.paused = true;
                    console.log("得分是: " + self.score);
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
