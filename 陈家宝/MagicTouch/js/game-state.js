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

            self.score = 0;
            //礼物的构造函数
            function Gift(config) {

                this.init = function() {

                    //初始化礼物
                    this.gifts = game.add.group();
                    this.gifts.enableBody = true;
                    this.gifts.physicsBodyType = Phaser.Physics.ARCADE;
                    this.gifts.createMultiple(15, config.giftPic);
                    //this.gifts.setAll('outOfBoundsKill', true);
                    this.gifts.setAll('checkWorldBounds', true);
                    this.gifts.checkWorldBounds = true;



                    this.giftMaxWidth = game.width - 80;

                    //game.time.events.loop(Phaser.Timer.SECOND * config.balloonNum * config.balloonNum * 3, this.generateGift, this);

                    //console.log(config.giftPic);
                    //气球
                    this.balloons = game.add.group();
                    this.balloons.enableBody = true;
                    this.balloons.physicsBodyType = Phaser.Physics.ARCADE;
                    this.balloons.createMultiple(config.balloonsPool, config.balloonPic);
                    //this.balloons.setAll('outOfBoundsKill', true);
                    //this.balloons.setAll('checkWorldBounds', true);

                    //气球爆破
                    this.explosions = game.add.group();
                    this.explosions.createMultiple(15, 'balloonExplode');
                    this.explosions.forEach(function(explosion) {
                        explosion.animations.add('balloonExplode');
                    }, this);

                    //缓存池
                    this.gesturesPicArray = []; //手势图缓存池
                    this.scorePlusPicArray = []; //加分缓存池


                    //获取下降的礼物
                    this.fallGifts = [];
                    //+1分数
                    this.scorePlus = game.add.group();

                    if (config.balloonNum == 1) {
                        this.generateGift();
                    }
                    // if (config.balloonNum == 1 && self.score <= 10) {
                    //     this.loop = game.time.events.loop(Phaser.Timer.SECOND * config.balloonNum * 2, this.generateGift, this);
                    // }


                    //game.time.events.loop(1500, this.generateGift, this);
                }

                //返回场景中存在的所有礼物
                this.getGiftsExists = function() {
                    var giftArray = [];
                    this.gifts.forEachExists(function(gift) {
                        giftArray.push(gift);
                    }, this);
                    return giftArray;
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
                this.giftHitStair = function(stair, effectFunction) {
                    //console.log(this.fallGifts);
                    game.physics.arcade.collide(this.fallGifts, stair, effectFunction, null, this); //检测与台阶的碰撞

                    // for(var i = 0; i < this.fallGifts.length; i++){
                    //     this.fallGifts[i].body.rotation = this.fallGifts[i].rotation;
                    // }
                }

                //检测气球图案是否与手势相同
                this.checkBallonsPattern = function(res) {
                    this.balloons.forEachExists(function(balloon) {
                        if (balloon.gift.y <= game.height - balloon.gift.height * 0.82) { //礼物越过台阶时才算入检测

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

                                // balloon.gesture.destroy();
                                balloon.gesture.x = -1000;
                                balloon.gesture.y = -1000;

                                this.gesturesPicArray.push(balloon.gesture);
                                if(this.gesturesPicArray.length > 20){
                                    this.gesturesPicArray.shift().destroy();
                                }

                                gift.balloons[index] = gift.balloons[gift.balloonNum - 1];
                                gift.balloonNum--;

                                

                                if (balloon.gift.balloonNum <= 0) { //礼物所绑的气球没了，礼物下降，这里要设置得分
                                    // balloon.gift.body.velocity.y = 0;
                                    // balloon.gift.body.gravity.y = 1000;
                                    this.giftDown(balloon.gift);
                                    this.fallGifts.push(balloon.gift);

                                    this.showScorePlus(balloon.gift);
                                    //分数增加
                                    self.score += balloon.gift.balloonTotalNum;
                                    config.game.updateText();

                                    // if (self.score >= 10 && this.config.balloonNum == 1) { //0~10分：1个气球 100%
                                    //     game.time.events.remove(this.loop);
                                    // }
                                }
                            }
                        }
                    }, this);
                }

                //气球爆破
                this.explosion = function(balloon) {
                    var explosion = this.explosions.getFirstExists(false);
                    if (explosion) {
                        explosion.width = (107 / 2);
                        explosion.height = (107 / 2);
                        explosion.reset(balloon.body.x, balloon.body.y);
                        explosion.play('balloonExplode', 30, false, true);
                        var expanim = explosion.animations.getAnimation('balloonExplode');
                        expanim.onComplete.add(function() {
                            explosion.kill();
                        }, this);
                    }
                }

                this.showScorePlus = function(gift){
                    
                    var hasPic = false;
                    var scorePlus;
                    var scorePlusPicArray = this.scorePlusPicArray;
                    console.log(scorePlusPicArray);
                    for(var j = 0; j < scorePlusPicArray.length; j++){
                        if(scorePlusPicArray[j].key == gift.balloonTotalNum.toString()){
                            hasPic = true;

                            scorePlus = scorePlusPicArray[j];
                            scorePlus.x = gift.x + gift.width / 2 + 29;
                            scorePlus.y = gift.y + gift.height / 2;
                            scorePlusPicArray.splice(scorePlusPicArray.indexOf(this.scorePlusPicArray[j]),1);
                            break;
                        }
                    }

                    if(hasPic == false){
                        scorePlus = game.add.sprite(gift.x + gift.width / 2 + 29, gift.y + gift.height / 2, gift.balloonTotalNum.toString());
                        scorePlus.width *= 0.1;
                        scorePlus.height *= 0.1;
                    }
                    
                    scorePlus.anchor.set(0.5);
                    var y1 = scorePlus.y - 60;
                    var tween = game.add.tween(scorePlus).to({
                        y: y1
                    }, 500, Phaser.Easing.Linear.None, true, 0);

                    tween.onComplete.add(function(){
                        // scorePlus.destroy();
                        scorePlus.x = -2000;
                        scorePlus.y = -2000;

                        scorePlusPicArray.push(scorePlus);
                        if(scorePlusPicArray.length > 20){
                            scorePlusPicArray.shift().destroy();
                        }
                    })
                }

                //礼物生成
                this.generateGift = function() {
                    //生成礼物并设置向上的速度
                    // console.log("generateGift");
                    var gift = this.gifts.getFirstExists(false);

                    if (gift) {
                        // console.log("gift");
                        //console.log(this.gitfMaxWidth);
                        // gift.reset(game.rnd.integerInRange(0, this.gitfMaxWidth), -game.cache.getImage(config.giftPic).height);

                        gift.balloonNum = config.balloonNum; //礼物绑定的气球数
                        gift.balloonTotalNum = config.balloonNum; //礼物绑定的总气球数，用于分数增加
                        // if(gift.balloonNum == 1){
                        //     gift.width = 89 * 1.5 * 0.3;
                        // }else if(gift)
                        // gift.width = 89 * (gift.balloonNum == 1 ? 1.5 : gift.balloonNum ) * 0.3;
                        gift.width = 89 * (1.5 + (gift.balloonNum - 1) * 0.2) * 0.3;
                        gift.height = gift.width * 119 / 89;
                        gift.body.height = gift.height;
                        gift.body.width = gift.width;
                        gift.alpha = 1;
                        gift.hasScore = false; //未设置得分
                        gift.hasHitStair = false;
                        gift.rotation = 0;
                        gift.reset(game.rnd.integerInRange(0 + gift.width * gift.balloonNum, game.width - gift.width * gift.balloonNum), game.height + 100);
                        // if(gift.id == null){
                        //     gift.id = game.rnd.integerInRange(0,100);
                        // }
                        gift.offset = gift.body.offset;
                        gift.body.velocity.x = 0;
                        gift.body.velocity.y = -config.giftVelocity; //刚开始有向上飞的速度
                        gift.body.angularVelocity = 0;
                        gift.body.gravity.y = 0;
                        //gift.width = game.cache.getImage(config.giftPic).width * 2;
                        // gift.height = game.cache.getImage(config.giftPic).height * 2;

                        //gift.bringToTop();
                        gift.body.bounce.set(0.3); //设置弹性
                        gift.anchor.setTo(0.5, 0.5);
                        //gift.body.setCircle(gift.height / 2, gift.x, gift.y * 0.82 + game.height / 2);
                        // gift.body.setCircle(gift.height / 2);
                        gift.balloons = [];

                        // console.log("礼物绑定的气球数: " + gift.balloonNum);
                        //生成气球
                        var resNameArray = ["triangle", "circle", "rope", "caret", "thunder", "scarve", "z"];
                        var integerRandomArr = [];
                        for (var i = 0; i < gift.balloonNum; i++) {
                            var balloon = this.balloons.getFirstExists(false);
                            if (balloon) {
                                balloon.gift = gift; //气球绑定的礼物

                                balloon.height = 107 / 2;
                                balloon.width = 107 / 2;
                                balloon.body.height = balloon.height;
                                balloon.body.width = balloon.width;

                                do{
                                    var integerRandom = game.rnd.integerInRange(0, resNameArray.length - 1)
                                }while(integerRandomArr.indexOf(integerRandom) != -1);
                                integerRandomArr.push(integerRandom);
                                
                                balloon.resName = resNameArray[integerRandom]; //气球的名称

                                balloon.anchor.setTo(0.5, 1);
                                var sign = (i % 2 == 0) ? 1 : -1; //奇数气球在左边，偶数气球在右边
                                if (i <= 1)
                                    balloon.reset(gift.x + i * balloon.width * sign + i * 2 * sign, gift.y - balloon.height - gift.height * 0.22);
                                else
                                    balloon.reset(gift.x + Math.ceil(i / 2.0) * balloon.width * sign + i * 2 * sign, gift.y - balloon.height - gift.height *0.22);

                                balloon.body.velocity.y = gift.body.velocity.y;

                                //气球绑礼物的线
                                balloon.line = new Phaser.Line(gift.x, gift.y, balloon.x, balloon.y);

                                //气球手势图案
                                var hasPic = false;
                                for(var j = 0; j < this.gesturesPicArray.length; j++){
                                    // console.log(this.gesturesPicArray[j].key);
                                    if(this.gesturesPicArray[j].key == balloon.resName){
                                        hasPic = true;
                                        // console.log(balloon.resName);
                                        balloon.gesture = this.gesturesPicArray[j];
                                        balloon.gesture.x = balloon.gift.x;
                                        balloon.gesture.y = balloon.gift.y - balloon.height / 2;
                                        this.gesturesPicArray.splice(this.gesturesPicArray.indexOf(this.gesturesPicArray[j]),1);
                                        // console.log("已经有啦");
                                        break;
                                    }
                                }

                                
                                if(hasPic == false){
                                     balloon.gesture = game.add.image(balloon.gift.x, balloon.gift.y - balloon.height / 2, balloon.resName);
                                }  
                               
                                balloon.gesture.anchor.set(0.5, 0.55);
                                balloon.gesture.width = 90 * 0.4;
                                balloon.gesture.height = 90 * 0.4;

                                //将气球与礼物关联
                                gift.balloons.push(balloon);
                                // console.log(balloon.resName + " " + gift.balloons.indexOf(balloon));

                                balloon.body.onCollide = new Phaser.Signal();
                                balloon.body.onCollide.add(function() {
                                    balloon.body.velocity.x = 0
                                }, this);
                            }
                        }
                    }



                }



                //礼物绳子被切断而下降
                this.giftDown = function(gift) {
                    gift.body.velocity.y = 0;
                    gift.body.gravity.y = 1000;

                    gift.hasScore = true;
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

                    game.load.image('v', "assets/gestures/v.png");
                    game.load.image('caret', "assets/gestures/caret.png");
                    game.load.image('circle', "assets/gestures/circle.png");
                    game.load.image('rope', "assets/gestures/rope.png");
                    game.load.image('scarve', "assets/gestures/scarve.png");
                    game.load.image('thunder', "assets/gestures/thunder.png");
                    game.load.image('triangle', "assets/gestures/triangle.png");
                    game.load.image('upright', "assets/gestures/upright.png");
                    game.load.image('z', "assets/gestures/z.png");

                    game.load.image('roleFront', "assets/角色姿势正面.png");
                    game.load.image('roleLeft', "assets/角色姿势向左.png");
                    game.load.image('roleRight', "assets/角色姿势向右.png");

                    game.load.image('1', "assets/加分数字/1.png");
                    game.load.image('2', "assets/加分数字/2.png");
                    game.load.image('3', "assets/加分数字/3.png");
                    game.load.image('4', "assets/加分数字/4.png");
                    game.load.image('5', "assets/加分数字/5.png");

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

                    //台阶
                    this.stair = game.add.sprite(0, 0, 'stair');
                    this.stair.width *= 2;
                    this.stair.height *= 1.1;
                    game.physics.enable(this.stair, Phaser.Physics.ARCADE); //开启台阶的物理系统
                    this.stair.body.immovable = true; //台阶固定
                    this.stair.anchor.setTo(0, 0);
                    this.stair.y = game.height;


                    //人物
                    this.role = game.add.sprite(0, 0, 'roleFront');
                    this.role.anchor.set(0);
                    // this.role.y = this.stair.y - this.role.height;
                    this.role.y = game.height - this.role.height;
                    this.role.x = game.width / 2;

                    //this.role.loadTexture('roleRight', 0, false);

                    //分数
                    this.style = {
                        font: "60px sText",
                        fill: "#FE9400",
                        align: "center"
                    };
                    this.scoreText = this.add.text(game.width / 2, game.height / 2, self.score + ' ', this.style);
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
                            // console.log(list);

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
                            giftVelocity: 100,
                            balloonsPool: 15,
                        },

                        gift2: {
                            game: this,
                            giftPic: 'gift',
                            balloonPic: 'balloon',
                            balloonNum: 2,
                            giftVelocity: 100,
                            balloonsPool: 20
                        },

                        gift3: {
                            game: this,
                            giftPic: 'gift',
                            balloonPic: 'balloon',
                            balloonNum: 3,
                            giftVelocity: 100,
                            balloonsPool: 30
                        },

                        gift4: {
                            game: this,
                            giftPic: 'gift',
                            balloonPic: 'balloon',
                            balloonNum: 4,
                            giftVelocity: 100,
                            balloonsPool: 40
                        },

                        gift5: {
                            game: this,
                            giftPic: 'gift',
                            balloonPic: 'balloon',
                            balloonNum: 5,
                            giftVelocity: 100,
                            balloonsPool: 50
                        }
                    };

                    this.gift1 = new Gift(giftTeam.gift1);
                    this.gift1.init();

                    this.gift2 = new Gift(giftTeam.gift2);
                    this.gift2.init();

                    this.gift3 = new Gift(giftTeam.gift3);
                    this.gift3.init();

                    this.gift4 = new Gift(giftTeam.gift3);
                    this.gift4.init();

                    this.gift5 = new Gift(giftTeam.gift5);
                    this.gift5.init();

                    this.gifts = [this.gift1, this.gift2, this.gift3, this.gift4, this.gift5];
                    //this.gifts = [this.gift5];

                    //气球
                    this.balloonArray;
                    this.giftArray;

                    

                    this.randomBallonNum = 0; //生成随机数（0~9）
                    this.randomRoleX = 0; //角色移动随机
                    this.roleMoveTime = 0;

                    // 示例-创建背景音乐
                    self.musicManager.play("bg");
                    game.input.onDown.add(function() {
                        self.musicManager.play("input");
                    });


                    // 示例-创建游戏元素
                    // this.star = game.add.sprite(game.world.centerX, game.world.centerY, "star");
                    // this.star.anchor.setTo(0.5, 0.5);

                    // // 示例-创建动画
                    // game.add.tween(this.star).to({
                    //     y: this.star.y - 100
                    // }, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);

                    this.generateGiftLoop = game.time.events.loop(Phaser.Timer.SECOND * 2, this.generateGift, this);

                    this.roleMove();
                    this.roleMoveLoop = game.time.events.loop(this.roleMoveTime * 2, this.roleMove, this);
                };

                this.render = function() {
                    for (var i = 0; i < this.balloonArray.length; i++) {
                        // game.context.fillStyle = 'rgb(20, 10, 22)';
                        // game.context.fillRect(p1.x, p1.y, 4, 4);
                        //if(this.balloonArray[i].y < this.stair.y)
                            game.debug.geom(this.balloonArray[i].line, '#fff09e', false);

                        //  game.debug.body(this.balloonArray[i]);
                         // game.debug.body(this.balloonArray[i].gift);
                        // game.debug.body(this.stair);
                    }

                    // for(var i = 0; i < this.giftArray.length; i++){
                    //     game.debug.body(this.giftArray[i]);
                    // }



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
                            for (var i = 0; i < this.gifts.length; i++) {
                                this.gifts[i].checkBallonsPattern(self.res);
                            }
                        }


                        self.res.name = null;
                    }
                    this.balloonArray = [];
                    this.giftArray = [];
                    // this.balloonArray = this.gift5.getBalloonsExists();
                    // this.gift5.balloonsCollide(this.balloonArray);
                    for (var i = 0; i < this.gifts.length; i++) {
                        var balloonArr = this.gifts[i].getBalloonsExists();
                        this.gifts[i].balloonsCollide(balloonArr);
                        this.balloonArray = this.balloonArray.concat(balloonArr);

                        this.giftArray =  this.giftArray.concat(this.gifts[i].getGiftsExists());

                        this.gifts[i].giftHitStair(this.stair, this.hitStair);//检测礼物与台阶的碰撞
                        //game.physics.arcade.collide(this.gifts[i], this.stair, this.shake(), null, this); //检测与台阶的碰撞
                    }

                    for(var i = 0; i < this.giftArray.length; i++){
                        if(this.giftArray[i].y <= -100 || this.giftArray[i].x <= -50 || this.giftArray[i].x >= game.width + 50){
                            this.giftArray[i].kill();
                        }

                        if(this.giftArray[i].balloonNum != 0){
                            this.giftArray[i].body.velocity.x = 0;
                            this.giftArray[i].body.angularVelocity = 0;
                            // this.giftArray[i].body.x = this.giftArray[i].x ;
                            // this.giftArray[i].body.y = this.giftArray[i].y / 2;
                            // this.giftArray[i].angle = 0;
                            // this.giftArray[i].rotation = 0;
                            // this.giftArray[i].body.angle = this.giftArray[i].angle;
                            // console.log(this.giftArray[i].body.rotation);
                            // this.giftArray[i].body.rotation = this.giftArray[i].rotation;
                        }
                        // if(this.giftArray[i].x <= 0 + this.giftArray[i].width / 2 ||
                        //  this.giftArray[i].x >= game.width - this.giftArray[i].width / 2){
                        //     this.giftArray[i].body.velocity.x = -this.giftArray[i].body.velocity.x;
                        // }
                    }

                    for(var i = 0; i < this.balloonArray.length; i++){

                        if(this.balloonArray[i].y <= -100){
                            this.balloonArray[i].kill();
                            //this.bg.visible = false;


                            // this.bg.tint = 0xff0000;//礼物即将到达边界时，背景需要变红,  16777215为原色

                        }
                    }


                };

                this.roleMove = function() {

                    var shift = 0; //位移量,大于0向右移动
                    var role = this.role;
                    var roleX = role.x;
                    while (Math.abs(shift) <= 50) {
                        this.randomRoleX = game.rnd.integerInRange(0 + this.role.width, game.width - this.role.width);                    
                        shift = this.randomRoleX - roleX; //位移量,大于0向右移动
                    }

                    this.roleMoveTime = Math.abs(shift) * 15;

                    if (shift > 0) {
                        role.loadTexture('roleRight', 0, false);
                    } else if (shift < 0) {
                        role.loadTexture('roleLeft', 0, false);
                    }
                    var tween = game.add.tween(role).to({
                        x: this.randomRoleX
                    }, this.roleMoveTime, Phaser.Easing.Linear.None, true, 0);

                    tween.onComplete.add(function(){
                        role.loadTexture('roleFront', 0, false);
                        // console.log("我停");
                    })

                }

                this.generateGift = function() {
                    if (self.score <= 10) { //0~10分：1个 100%
                        this.gifts[0].generateGift();
                    } else if (self.score >= 11 && self.score <= 20) { //11~20分：1个 80% 2个20%
                        this.randomBallonNum = game.rnd.integerInRange(0, 9);
                        if (this.randomBallonNum != 2 || this.randomBallonNum != 6) { //生成一个气球
                            this.gifts[0].generateGift();
                        } else {
                            this.gifts[1].generateGift();
                        }
                        // console.log(this.randomBallonNum + "   " + self.score);
                    } else if (self.score >= 21 && self.score <= 30) { //21~30分：1个 60% 2个30% 3个10%
                        this.randomBallonNum = game.rnd.integerInRange(0, 9);
                        if (this.randomBallonNum <= 5) { //生成一个气球
                            this.gifts[0].generateGift();
                        } else if (this.randomBallonNum > 6) {
                            this.gifts[1].generateGift();
                        } else if (this.randomBallonNum == 6) {
                            this.gifts[2].generateGift();
                        }
                    } else if (self.score >= 31 && self.score <= 40) { //31~40分：1个 50% 2个30% 3个20% 
                        this.randomBallonNum = game.rnd.integerInRange(0, 9);
                        if (this.randomBallonNum <= 4) { //生成一个气球
                            this.gifts[0].generateGift();
                        } else if (this.randomBallonNum > 6) {
                            this.gifts[1].generateGift();
                        } else {
                            this.gifts[2].generateGift();
                        }
                    } else if (self.score >= 41 && self.score <= 50) { //41~50分：2个 60% 3个30% 4个10%
                        this.randomBallonNum = game.rnd.integerInRange(0, 9);
                        if (this.randomBallonNum <= 5) {
                            this.gifts[1].generateGift();
                        } else if (this.randomBallonNum > 6) {
                            this.gifts[2].generateGift();
                        } else {
                            this.gifts[3].generateGift();
                        }
                    } else if (self.score >= 51 && self.score <= 60) { //51~60分：2个 50% 3个30% 4个20% 
                        this.randomBallonNum = game.rnd.integerInRange(0, 9);
                        if (this.randomBallonNum <= 4) {
                            this.gifts[1].generateGift();
                        } else if (this.randomBallonNum > 6) {
                            this.gifts[2].generateGift();
                        } else {
                            this.gifts[3].generateGift();
                        }
                    } else if (self.score >= 61 && self.score <= 70) { //61~70分：3个 60% 4个30% 5个10%
                        this.randomBallonNum = game.rnd.integerInRange(0, 9);
                        if (this.randomBallonNum <= 5) {
                            this.gifts[2].generateGift();
                        } else if (this.randomBallonNum > 6) {
                            this.gifts[3].generateGift();
                        } else {
                            this.gifts[4].generateGift();
                        }
                    } else if (self.score >= 71) { //71分及以后：3个 50% 4个30% 5个20%
                        this.randomBallonNum = game.rnd.integerInRange(0, 9);
                        if (this.randomBallonNum <= 4) {
                            this.gifts[2].generateGift();
                        } else if (this.randomBallonNum > 6) {
                            this.gifts[3].generateGift();
                        } else {
                            this.gifts[4].generateGift();
                        }
                    }
                }

                this.updateText = function() {
                    this.scoreText.setText(self.score);
                }

                this.hitStair = function(gift, stair) {
                    //console.log(gift.body.velocity.y);
                    // gift.body.velocity.x = game.rnd.integerInRange(0, 200);
                    var sign = game.rnd.integerInRange(-1, 1);
                    sign = sign >= 0 ? 1 : -1;
                    gift.body.velocity.x = gift.body.velocity.y / 5 * sign * 5;
                    gift.body.angularVelocity = gift.body.velocity.x * 2;

                    // gift.body.rotation = gift.rotation;
                    // gift.body.x = gift.x;
                    // gift.body.y = gift.y;
                    // gift.body.angle = gift.angle;
                    // console.log("gift.x: " + gift.x + " gift.body.x:" + gift.body.x);
                    // console.log("gift.y: " + gift.y + " gift.body.y:" + gift.body.y);
                    if (gift.body.velocity.y <= -50 && gift.hasScore == true && gift.hasHitStair == false) {
                        self.shake();
                        gift.hasHitStair = true;

                    } else if (gift.body.velocity.y >= -6.89 && gift.hasScore == true) {
                        // 创建礼物渐变消失动画

                        var tween = game.add.tween(gift).to({
                            alpha: 0
                        }, 200, Phaser.Easing.Linear.None, true, 0);
                        gift.hasScore = false;

                        tween.onComplete.add(function() {
                            gift.body.velocity.x = 0;
                            gift.kill();

                        });
                    }

                }


                this.fade = function() {
                    //颜色淡入淡出
                    game.camera.fade('0xe26c6c', 2000);
                }

                this.resetFade = function() {

                    game.camera.resetFX();

                }

                self.shake = function() {
                    //屏幕震动
                    //  You can set your own intensity and duration
                    game.camera.shake(0.01, 100);
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
            game.state.add('render', game.States.play.render);
            game.state.start('boot');
        }
    };
    return GameState;
});