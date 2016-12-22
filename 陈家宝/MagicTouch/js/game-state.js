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

        drawres: {},

        // 初始化
        init: function() {
            var self = this;
            var game = this.game;
            game.States = {};

            //礼物的构造函数
            function Gift(config) {

                this.init = function() {

                    //初始化礼物
                    this.gifts = game.add.group();
                    this.gifts.enableBody = true;
                    this.gifts.physicsBodyType = Phaser.Physics.ARCADE;
                    this.gifts.createMultiple(10, config.giftPic);
                    this.gifts.setAll('outOfBoundsKill', true);
                    this.gifts.setAll('checkWorldBounds', true);
                    //this.gifts.checkWorldBounds = true;


                    this.giftMaxWidth = game.width - 80;

                    //game.time.events.loop(Phaser.Timer.SECOND * config.balloonNum * config.balloonNum * 3, this.generateGift, this);

                    //console.log(config.giftPic);
                    //气球
                    this.balloons = game.add.group();
                    this.balloons.enableBody = true;
                    this.balloons.physicsBodyType = Phaser.Physics.ARCADE;
                    this.balloons.createMultiple(20, config.balloonPic);
                    this.balloons.setAll('outOfBoundsKill', true);
                    this.balloons.setAll('checkWorldBounds', true);

                    //气球爆破
                    this.explosions = game.add.group();
                    this.explosions.createMultiple(10, 'balloonExplode');
                    this.explosions.forEach(function(explosion) {
                        explosion.animations.add('balloonExplode');
                    }, this);

                    this.gesturesPicArray = [];

                    //获取下降的礼物
                    this.fallGifts = [];
                    //+1分数
                    this.scorePlus = game.add.group();

                    // if(config.balloonNum == 1){
                        this.generateGift();
                    // }
                    game.time.events.loop(Phaser.Timer.SECOND * config.balloonNum  * 3, this.generateGift, this);
                }


                //返回场景中存在的所有气球
                this.getBalloonsExists = function() {
                    var balloonArray = [];
                    this.balloons.forEachExists(function(balloon) {
                        balloonArray.push(balloon);
                    }, this);
                    return balloonArray;
                }

                this.balloonsCollide = function(balloonArray) {

                    for (var i = 0; i < balloonArray.length; i++) {
                        //线跟着气球和礼物而移动
                        balloonArray[i].line.fromSprite(balloonArray[i].gift, balloonArray[i], false);
                        //手势跟着气球移动
                        balloonArray[i].gesture.x = balloonArray[i].x;
                        balloonArray[i].gesture.y = balloonArray[i].y - balloonArray[i].height / 2;

                        var gift = balloonArray[i].gift;

                        if (Math.abs(balloonArray[i].x - gift.x) <= 5 && balloonArray[i].body.velocity.x != 0) { //当气球的x坐标与礼物相等时且速度不为0，则停止
                            balloonArray[i].body.velocity.x = 0;
                            console.log("该停止啦");
                        }
                        // console.log(balloonArray[i].body.onCollide);
                        game.physics.arcade.collide(balloonArray[i], balloonArray, function() {
                                balloonArray[i].body.velocity.x = 0;
                                //gift.balloons[j + 1].body.velocity.x = 0;
                                console.log("碰撞");
                            }, null, this);

                        // for(var j = 0; j < gift.balloons.length; j++){
                        //     if(gift.balloons[j + 1] != null){
                        //         game.physics.arcade.collide(gift.balloons[j], balloonArray, function() {
                        //         gift.balloons[j].body.velocity.x = 0;
                        //         //gift.balloons[j + 1].body.velocity.x = 0;
                        //         console.log("碰撞");
                        //     }, null, this);
                        //     }
                        // }


                        // if (balloonArray[i + 1] != null) {
                        //     game.physics.arcade.collide(balloonArray[i], balloonArray[i + 1], function() {
                        //         balloonArray[i].body.velocity.x = 0;
                        //         balloonArray[i + 1].body.velocity.x = 0;
                        //         console.log("碰撞");
                        //     }, null, this);

                        // }

                    }
  
                }

                //礼物与台阶碰撞
                this.giftHitStair = function(stair, effectFunction){
                    console.log(this.fallGifts);
                    game.physics.arcade.collide(this.fallGifts, stair, effectFunction, null, this); //检测与台阶的碰撞

                }

                //检测气球图案是否与手势相同
                this.checkBallonsPattern = function(res) {
                    this.balloons.forEachExists(function(balloon) {
                        if(balloon.gift.y <= game.height - 139.2 - 97){//礼物越过台阶时才算入检测

                            if (balloon.resName == res.name && res.score >= 1.5) {

                                var index = balloon.gift.balloons.indexOf(balloon); //礼物所绑气球的下标
                                console.log("kill balloon!!!index：" + index);
                                var gift = balloon.gift; //气球所绑的礼物

                                for (var i = 0; i < gift.balloonNum; i++) {

                                    if (i == index) continue;
                                    var ball = gift.balloons[i];
                                    //气球向中间靠拢
                                    if (Math.abs(ball.x - gift.x) > 10) {

                                        var sign = (ball.x < gift.x) ? 1 : -1; //气球在礼物的左边的向右移动，反之向左移动
                                        gift.balloons[i].body.velocity.x = 50 * sign;
                                    }

                                    //gift.balloons[i].body.angularVelocity  = -50 * sign;
                                    // game.add.tween(gift.balloons[i]).to({
                                    //     //y: gift.balloons[i].gift.y
                                    //     x: gift.x
                                    // }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
                                }
                                //console.log(balloon.gift.balloons.indexOf(balloon));
                                balloon.kill();
                                this.explosion(balloon);
                                balloon.gesture.kill();
                                gift.balloons[index] = gift.balloons[gift.balloonNum - 1];
                                gift.balloonNum--;

                                if (balloon.gift.balloonNum <= 0) { //礼物所绑的气球没了，礼物下降，这里要设置得分
                                    // balloon.gift.body.velocity.y = 0;
                                    // balloon.gift.body.gravity.y = 1000;
                                    this.giftDown(balloon.gift);
                                    this.fallGifts.push(balloon.gift);
                                }
                            }
                        }
                    }, this);
                }

                //气球爆破
                this.explosion = function(balloon){
                    var explosion = this.explosions.getFirstExists(false);
                        if (explosion) {
                            explosion.reset(balloon.body.x, balloon.body.y);
                            explosion.play('balloonExplode', 30, false, true);
                            var expanim = explosion.animations.getAnimation('balloonExplode');
                            expanim.onComplete.add(function(){
                                explosion.kill();
                            }, this);
                        }
                }

                //礼物生成
                this.generateGift = function() {
                    //生成礼物并设置向上的速度
                    console.log("generateGift");
                    var gift = this.gifts.getFirstExists(false);
                    if (gift) {
                        // console.log("gift");
                        //console.log(this.gitfMaxWidth);
                        // gift.reset(game.rnd.integerInRange(0, this.gitfMaxWidth), -game.cache.getImage(config.giftPic).height);
                        gift.balloonNum = config.balloonNum; //礼物绑定的气球数
                        gift.balloonTotalNum = config.balloonNum; //礼物绑定的总气球数，用于分数增加
                        gift.width = 89 * gift.balloonNum * 0.5;    
                        gift.reset(game.rnd.integerInRange(0 + 89 * gift.balloonNum, 800 - 89 * gift.balloonNum), game.height - game.cache.getImage(config.giftPic).height);

                        // if(gift.id == null){
                        //     gift.id = game.rnd.integerInRange(0,100);
                        // }

                        //gift.width = game.cache.getImage(config.giftPic).width * 2;
                        // gift.height = game.cache.getImage(config.giftPic).height * 2;
                        gift.hasScore = false; //未设置得分
                        gift.body.velocity.y = -config.giftVelocity; //刚开始有向上飞的速度
                        gift.body.gravity.y = 0;
                        //gift.bringToTop();
                        gift.body.bounce.set(0.5); //设置弹性
                        gift.anchor.setTo(0.5, 0.18);
                        gift.balloons = [];

                        console.log("礼物绑定的气球数: " + gift.balloonNum);
                        //生成气球
                        var resNameArray = ["triangle", "circle", "rope", "caret", "v", "thunder", "scarve", "z", "upright"];
                        for (var i = 0; i < gift.balloonNum; i++) {
                            var balloon = this.balloons.getFirstExists(false);
                            if (balloon) {
                                balloon.gift = gift; //气球绑定的礼物

                                balloon.resName = resNameArray[game.rnd.integerInRange(0, resNameArray.length - 1)]; //气球的名称

                                balloon.anchor.setTo(0.5, 1);
                                var sign = (i % 2 == 0) ? 1 : -1; //奇数气球在左边，偶数气球在右边
                                if (i <= 1)
                                    balloon.reset(gift.x + i * balloon.width * sign + i * 2 * sign, gift.y - balloon.height);
                                else
                                    balloon.reset(gift.x + Math.ceil(i / 2.0) * balloon.width * sign + i * 2 * sign, gift.y - balloon.height);

                                balloon.body.velocity.y = gift.body.velocity.y;

                                //气球绑礼物的线
                                balloon.line = new Phaser.Line(gift.x, gift.y, balloon.x, balloon.y);
                                
                                //气球手势图案
                                balloon.gesture = game.add.image(balloon.x,balloon.y - balloon.height/2,balloon.resName);
                                balloon.gesture.anchor.setTo(0.5);
                                balloon.gesture.width *= 0.8;
                                balloon.gesture.height *= 0.8;
                                //将气球与礼物关联
                                gift.balloons.push(balloon);
                                console.log(balloon.resName + " " + gift.balloons.indexOf(balloon));

                                balloon.body.onCollide = new Phaser.Signal();
                                balloon.body.onCollide.add(function(){balloon.body.velocity.x = 0}, this);
                            }
                        }
                    }



                }



                //礼物绳子被切断而下降
                this.giftDown = function(gift) {
                    gift.body.velocity.y = 0; 
                    gift.body.gravity.y = 1000;

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

                    game.load.image('bg', "assets/背景.png");
                    game.load.image('stair', "assets/台阶.png");
                    game.load.image('star', "assets/images/star.png");

                    game.load.image('gift', "assets/礼物.png");
                    game.load.image('balloon', "assets/气球.png");

                    game.load.image('v',"assets/gestures/v.png");
                    game.load.image('caret',"assets/gestures/caret.png");
                    game.load.image('circle',"assets/gestures/circle.png");
                    game.load.image('rope',"assets/gestures/rope.png");
                    game.load.image('scarve',"assets/gestures/scarve.png");
                    game.load.image('thunder',"assets/gestures/thunder.png");
                    game.load.image('triangle',"assets/gestures/triangle.png");
                    game.load.image('upright',"assets/gestures/upright.png");
                    game.load.image('z',"assets/gestures/z.png");

                    game.load.atlasJSONArray('balloonExplode', 'assets/气球爆破动画.png', 'assets/气球爆破动画.json');

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
                    game.physics.startSystem(Phaser.Physics.ARCADE);
                    game.physics.arcade.checkCollision.down = true;

                    // 示例-创建游戏背景
                    this.bg = game.add.image(0, 0, "bg");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;
                    //创建手势
                    var lastPoints = [];
                    var options = {
                        //el: document.getElementsByTagName('canvas')[0],
                        el: document.body,
                        enablePath: true,
                        timeDelay: -200,
                        lineColor: '#ff8cc1', //'#666'
                        lineWidth: '4',
                        triggerMouseKey: 'left',
                        activeColor: 'rgba(0, 0, 0, .05)',
                        eventType: "touch",
                        onSwipe: function(list) {
                            console.log(list);

                        },
                        onGesture: function(res, points) {

                            self.res = res;
                            lastPoints = points;
                            console.log(self.res);
                        }
                    };

                    this.canvas = new smartGesture(options);

                    //礼物
                    var giftTeam = {
                        gift1: {
                            game: this,
                            giftPic: 'gift',
                            balloonPic: 'balloon',
                            balloonNum: 1,
                            giftVelocity: 100
                        },

                        gift2: {
                            game: this,
                            giftPic: 'gift',
                            balloonPic: 'balloon',
                            balloonNum: 2,
                            giftVelocity: 150
                        },

                        gift3: {
                            game: this,
                            giftPic: 'gift',
                            balloonPic: 'balloon',
                            balloonNum: 3,
                            giftVelocity: 100
                        },

                        gift5: {
                            game: this,
                            giftPic: 'gift',
                            balloonPic: 'balloon',
                            balloonNum: 5,
                            giftVelocity: 100
                        }
                    };

                    // this.gift1 = new Gift(giftTeam.gift1);
                    // this.gift1.init();
                    // this.gift2 = new Gift(giftTeam.gift2);
                    // this.gift2.init();
                    // this.gift3 = new Gift(giftTeam.gift3);
                    // this.gift3.init();

                    this.gift5 = new Gift(giftTeam.gift5);
                    this.gift5.init();

                    // this.gifts = [this.gift1,this.gift2,this.gift3,this.gift5];
                    this.gifts = [this.gift5];
                    //气球
                    this.balloonArray;

                    //台阶
                    this.stair = game.add.image(0,game.height - 117 * 1.1, 'stair');
                    this.stair.width *= 2;
                    this.stair.height *= 1.2;

                    game.physics.enable(this.stair, Phaser.Physics.ARCADE); //开启台阶的物理系统


                    // // 示例-创建背景音乐
                    // self.musicManager.play("bg");
                    // game.input.onDown.add(function() {
                    //     self.musicManager.play("input");
                    // });



                    // 示例-创建游戏元素
                    // this.star = game.add.sprite(game.world.centerX, game.world.centerY, "star");
                    // this.star.anchor.setTo(0.5, 0.5);

                    // // 示例-创建动画
                    // game.add.tween(this.star).to({
                    //     y: this.star.y - 100
                    // }, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);


                };

                this.render = function(){
                    for(var i = 0; i <this.balloonArray.length; i++){
                        // game.context.fillStyle = 'rgb(20, 10, 22)';
                        // game.context.fillRect(p1.x, p1.y, 4, 4);
                        game.debug.geom(this.balloonArray[i].line, '#fff09e', false );

                        // game.debug.body(this.balloonArray[i]);
                        //game.debug.body(this.balloonArray[i].gift);
                    }



                    
                }

                this.update = function() {
                    // 每一帧更新都会触发
                    if (self.res) {

                        if (self.res.name == "rope" && self.res.score >= 2.0) {
                            // this.star.kill();
                            //self.res = null;
                            //this.shake();

                            //this.bg.tint = 0xe26c6c;//礼物即将到达边界时，背景需要变红

                            // this.fade();
                            // game.camera.onFadeComplete.add(this.resetFade, this);
                            //this.canvas.destroy(); //取消手势
                        }
                        if (self.res.name != null) {
                            // this.gift1.checkBallonsPattern(self.res.name);
                            // this.gift2.checkBallonsPattern(self.res.name);
                            //this.gift3.checkBallonsPattern(self.res);
                            //this.gift5.checkBallonsPattern(self.res);
                             // for(var gift in this.gifts){
                             //    gift.checkBallonsPattern(self.res);
                             // }
                             for(var i = 0; i < this.gifts.length; i++){
                                this.gifts[i].checkBallonsPattern(self.res);
                             }
                        }


                        self.res.name = null;
                    }
                    this.balloonArray = [];
                    // this.balloonArray = this.gift5.getBalloonsExists();
                    // this.gift5.balloonsCollide(this.balloonArray);
                    for(var i = 0; i < this.gifts.length; i++){
                        var balloonArr = this.gifts[i].getBalloonsExists();
                        this.gifts[i].balloonsCollide(balloonArr);
                        this.balloonArray = this.balloonArray.concat(balloonArr);

                        this.gifts[i].giftHitStair(this.stair, this.shake());
                        //game.physics.arcade.collide(this.gifts[i], this.stair, this.shake(), null, this); //检测与台阶的碰撞
                    }
                    


                };



                this.fade = function() {
                    //颜色淡入淡出
                    game.camera.fade('0xe26c6c', 2000);
                }

                this.resetFade = function() {

                    game.camera.resetFX();

                }

                this.shake = function() {
                    //屏幕震动
                    //  You can set your own intensity and duration
                    game.camera.shake(0.02, 200);


                }

                this.flash = function() {
                    //屏幕闪红
                    //  You can set your own flash color and duration
                    game.camera.flash(0xff0000, 500);

                }

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
            game.state.add('render',game.States.play.render);
            game.state.start('boot');
        }
    };
    return GameState;
});