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

            var score = 0;                              

            function Enemy(config) {
                this.timerForBarriers;
                this.init = function() {
                    this.enemys = game.add.group();
                    this.enemys.enableBody = true;
                    this.enemys.createMultiple(config.selfPool, config.selfPic);
                    this.enemys.setAll('outOfBoundsKill', true);
                    this.enemys.setAll('checkWorldBounds', true);

                    this.enemyBullets = game.add.group();
                    this.enemyBullets.enableBody = true;
                    this.enemyBullets.createMultiple(config.bulletsPool, config.bulletPic);
                    this.enemyBullets.setAll('outOfBoundsKill', true);
                    this.enemyBullets.setAll('checkWorldBounds', true);
                    this.maxWidth = game.width - game.cache.getImage(config.selfPic).width;  

                    //this.generateEnemyTime = config.selfTimeInterval - game.time.totalElapsedSeconds() * 0.3;
                    //console.log(config.selfPic + ' ' + this.generateEnemyTime);
                    this.timerForBarriers = game.time.events.loop(Phaser.Timer.SECOND * config.selfTimeInterval, this.generateEnemy, this);                    

                    this.explosions = game.add.group();
                    this.explosions.createMultiple(config.explosionPool, config.explosionPic);
                    this.explosions.forEach(function(explosion) {
                        explosion.animations.add(config.explosionPic);
                    }, this);
                }                

                this.barriers = config.selfTimeInterval*Phaser.Timer.SECOND;

                this.generateEnemy = function() {
                    var e = this.enemys.getFirstExists(false);
                    if (e) {
                        e.reset(game.rnd.integerInRange(0, this.maxWidth), -game.cache.getImage(config.selfPic).height);
                        e.width = game.cache.getImage(config.selfPic).width * 2;
                        e.height = game.cache.getImage(config.selfPic).height * 2;
                        e.life = config.life;
                        e.body.velocity.y = config.velocity;                        
                    }
                    //改变生成敌人时间间隔
                    if (this.barriers >= config.selfTimeInterval * Phaser.Timer.SECOND * 0.25)
                        this.barriers = (config.selfTimeInterval - game.time.totalElapsedSeconds()*0.02)*Phaser.Timer.SECOND;

                    console.log(config.selfPic + ': ' + this.barriers);
                    //console.log(game.time.totalElapsedSeconds());
                    this.timerForBarriers.delay = this.barriers;

                }

                this.enemyFire = function() {
                    this.enemys.forEachExists(function(enemy) {
                        var bullet = this.enemyBullets.getFirstExists(false);
                        if (bullet) {
                            if (game.time.now > (enemy.bulletTime || 0)) {
                                bullet.reset(enemy.x + config.bulletX * 2, enemy.y + config.bulletY * 2);
                                bullet.body.velocity.y = config.bulletVelocity;
                                enemy.bulletTime = game.time.now + config.bulletTimeInterval;
                            }
                        }
                    }, this);
                };
                this.hitEnemy = function(myBullet, enemy) {
                    myBullet.kill();
                    enemy.life--;
                    if (enemy.life <= 0) {
                        enemy.kill();
                        var explosion = this.explosions.getFirstExists(false);
                        if (explosion) {
                            explosion.reset(enemy.body.x, enemy.body.y);
                            explosion.play(config.explosionPic, 30, false, true);
                        }
                        self.score
                        score += config.score;
                        self.score = score;
                        //console.log(config.score);
                        config.game.updateText();
                    }
                };
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

                    //game.load.image('bg', "assets/images/bg.png");
                    //game.load.image('star', "assets/images/star.png");
                    game.load.image('background', 'http://game.webxinxin.com/plane/assets/bg.jpg');
                    game.load.image('copyright', 'http://game.webxinxin.com/plane/assets/copyright.png');
                    game.load.spritesheet('myplane', 'http://game.webxinxin.com/plane/assets/myplane.png', 40, 40, 4);
                    game.load.spritesheet('startbutton', 'http://game.webxinxin.com/plane/assets/startbutton.png', 100, 40, 2);
                    game.load.spritesheet('replaybutton', 'http://game.webxinxin.com/plane/assets/replaybutton.png', 80, 30, 2);
                    game.load.spritesheet('sharebutton', 'http://game.webxinxin.com/plane/assets/sharebutton.png', 80, 30, 2);
                    game.load.image('mybullet', 'http://game.webxinxin.com/plane/assets/mybullet.png');
                    game.load.image('bullet', 'http://game.webxinxin.com/plane/assets/bullet.png');
                    game.load.image('enemy1', 'http://game.webxinxin.com/plane/assets/enemy1.png');
                    game.load.image('enemy2', 'http://game.webxinxin.com/plane/assets/enemy2.png');
                    game.load.image('enemy3', 'http://game.webxinxin.com/plane/assets/enemy3.png');
                    game.load.spritesheet('explode1', 'http://game.webxinxin.com/plane/assets/explode1.png', 20, 20, 3);
                    game.load.spritesheet('explode2', 'http://game.webxinxin.com/plane/assets/explode2.png', 30, 30, 3);
                    game.load.spritesheet('explode3', 'http://game.webxinxin.com/plane/assets/explode3.png', 50, 50, 3);
                    game.load.spritesheet('myexplode', 'http://game.webxinxin.com/plane/assets/myexplode.png', 40, 40, 3);
                    game.load.image('award', 'http://game.webxinxin.com/plane/assets/award.png');
                    game.load.audio('normalback', 'http://game.webxinxin.com/plane/assets/normalback.mp3');
                    game.load.audio('playback', 'http://game.webxinxin.com/plane/assets/playback.mp3');
                    game.load.audio('fashe', 'http://game.webxinxin.com/plane/assets/fashe.mp3');
                    game.load.audio('crash1', 'http://game.webxinxin.com/plane/assets/crash1.mp3');
                    game.load.audio('crash2', 'http://game.webxinxin.com/plane/assets/crash2.mp3');
                    game.load.audio('crash3', 'http://game.webxinxin.com/plane/assets/crash3.mp3');
                    game.load.audio('ao', 'http://game.webxinxin.com/plane/assets/ao.mp3');
                    game.load.audio('pi', 'http://game.webxinxin.com/plane/assets/pi.mp3');
                    game.load.audio('deng', 'http://game.webxinxin.com/plane/assets/deng.mp3');
                    //加载音效
                    game.load.audio('bg', "http://game.webxinxin.com/plane/assets/audio/bg.mp3");
                    // 安卓只能同时播放一个音乐
                    if (self.gameManager.device.platform != 'android') {
                        game.load.audio('input', "http://game.webxinxin.com/plane/assets/audio/tap.mp3");
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
                    */
                    // 物理系统
                    game.physics.startSystem(Phaser.Physics.ARCADE);
                    // 背景
                    var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
                    bg.autoScroll(0, 20);
                    // 我的飞机
                    this.myplane = game.add.sprite(game.width / 2, 100 * 2, 'myplane');
                    this.myplane.anchor.setTo(0.5, 0.5);
                    this.myplane.width *= 2;
                    this.myplane.height *= 2;
                    this.myplane.animations.add('fly');
                    this.myplane.animations.play('fly', 12, true);
                    game.physics.arcade.enable(this.myplane);
                    this.myplane.body.collideWorldBounds = true;
                    this.myplane.level = 2;
                    // 动画
                    var tween = game.add.tween(this.myplane).to({
                        y: game.height - 40
                    }, 1000, Phaser.Easing.Sinusoidal.InOut, true);
                    tween.onComplete.add(this.onStart, this);
                    // 背景音乐
                    this.playback = game.add.audio('playback', 0.2, true);
                    this.playback.play();
                    // 开火音乐
                    this.pi = game.add.audio('pi', 1, false);
                    // 打中敌人音乐
                    this.firesound = game.add.audio('fashe', 5, false);
                    // 爆炸音乐
                    this.crash1 = game.add.audio('crash1', 10, false);
                    this.crash2 = game.add.audio('crash2', 10, false);
                    this.crash3 = game.add.audio('crash3', 20, false);
                    // 挂了音乐
                    this.ao = game.add.audio('ao', 10, false);
                    // 接到了奖音乐
                    this.deng = game.add.audio('deng', 10, false);
                };

                this.onStart = function() {
                    this.mybullets = game.add.group();
                    this.mybullets.enableBody = true;
                    this.mybullets.createMultiple(50, 'mybullet');
                    this.mybullets.setAll('outOfBoundsKill', true);
                    this.mybullets.setAll('checkWorldBounds', true);

                    this.myStartFire = true;
                    this.bulletTime = 0;

                    this.myplane.inputEnabled = true;
                    //this.myplane.input.enableDrag(false);
                    

                    this.awards = game.add.group();
                    this.awards.enableBody = true;
                    this.awards.createMultiple(1, 'award');
                    this.awards.setAll('outOfBoundsKill', true);
                    this.awards.setAll('checkWorldBounds', true);
                    this.awardMaxWidth = game.width - game.cache.getImage('award').width;
                    game.time.events.loop(Phaser.Timer.SECOND * 30, this.generateAward, this);

                    /*
                    game.input.onDown.add(function(e) {
                        if (e.x < game.width / 4)
                            this.myplane.body.velocity.x = -400;
                        else
                            this.myplane.body.velocity.x = 400;
                    }, this);

                    game.input.onUp.add(function() {
                        this.myplane.body.velocity.x = 0;
                    }, this);
                    */

                    var style = {
                        font: "16px Arial",
                        fill: "#ff0000"
                    };
                    this.text = game.add.text(0, 0, 'Score :0', style);

                    var enemyTeam = {
                        enemy1: {
                            game: this,
                            selfPic: 'enemy1',
                            bulletPic: 'bullet',
                            explodePic: 'explode1',
                            selfPool: 10,
                            bulletsPool: 50,
                            explodePool: 10,
                            life: 2,
                            velocity: 50 * 2,
                            bulletX: 9 * 2,
                            bulletY: 20 * 2,
                            bulletVelocity: 200 * 2,
                            selfTimeInterval: 2,
                            bulletTimeInterval: 1000,
                            score: 10,
                            firesound: this.firesound,
                            crashsound: this.crash1
                        },
                        enemy2: {
                            game: this,
                            selfPic: 'enemy2',
                            bulletPic: 'bullet',
                            explodePic: 'explode2',
                            selfPool: 10,
                            bulletsPool: 50,
                            explodePool: 10,
                            life: 3,
                            velocity: 40 * 2,
                            bulletX: 13 * 2,
                            bulletY: 30 * 2,
                            bulletVelocity: 250 * 2,
                            selfTimeInterval: 3,
                            bulletTimeInterval: 1200,
                            score: 20,
                            firesound: this.firesound,
                            crashsound: this.crash2
                        },
                        enemy3: {
                            game: this,
                            selfPic: 'enemy3',
                            bulletPic: 'bullet',
                            explodePic: 'explode3',
                            selfPool: 5,
                            bulletsPool: 25,
                            explodePool: 5,
                            life: 10,
                            velocity: 30 * 2,
                            bulletX: 22 * 2,
                            bulletY: 50 * 2,
                            bulletVelocity: 300 * 2,
                            selfTimeInterval: 10,
                            bulletTimeInterval: 1500,
                            score: 50,
                            firesound: this.firesound,
                            crashsound: this.crash3
                        }
                    }

                    this.enemy1 = new Enemy(enemyTeam.enemy1);
                    this.enemy1.init();                    
                    this.enemy2 = new Enemy(enemyTeam.enemy2);
                    this.enemy2.init();
                    this.enemy3 = new Enemy(enemyTeam.enemy3);
                    this.enemy3.init();
                };

                this.generateAward = function() {
                    var award = this.awards.getFirstExists(false);
                    if (award) {
                        award.reset(game.rnd.integerInRange(0, this.awardMaxWidth), -game.cache.getImage('award').height);
                        award.body.velocity.y = 500;
                    }
                };

                this.myFireBullet = function() {
                    if (this.myplane.alive && game.time.now > this.bulletTime) {
                        var bullet = this.mybullets.getFirstExists(false);

                        if (bullet) {
                            bullet.reset(this.myplane.x - 3, this.myplane.y - 60);
                            bullet.body.velocity.y = -400 * 2;
                            this.bulletTime = game.time.now + 200;
                        }
                        if (this.myplane.level >= 2) {

                            bullet = this.mybullets.getFirstExists(false);
                            if (bullet) {
                                bullet.reset(this.myplane.x - 3, this.myplane.y - 60);
                                bullet.body.velocity.y = -400 * 2;
                                bullet.body.velocity.x = -40 * 2;
                                this.bulletTime = game.time.now + 200 * 2;
                            }

                            bullet = this.mybullets.getFirstExists(false);
                            if (bullet) {
                                bullet.reset(this.myplane.x - 3, this.myplane.y - 60);
                                bullet.body.velocity.y = -400 * 2;
                                bullet.body.velocity.x = 40 * 2;
                                this.bulletTime = game.time.now + 200;
                            }
                        }
                        if (this.myplane.level >= 3) {
                            bullet = this.mybullets.getFirstExists(false);
                            if (bullet) {
                                bullet.reset(this.myplane.x - 3, this.myplane.y - 60);
                                bullet.body.velocity.y = -400 * 2;
                                bullet.body.velocity.x = -80 * 2;
                                //this.bulletTime = game.time.now + 200;
                            }

                            bullet = this.mybullets.getFirstExists(false);
                            if (bullet) {
                                bullet.reset(this.myplane.x - 3, this.myplane.y - 60);
                                bullet.body.velocity.y = -400 * 2;
                                bullet.body.velocity.x = 80 * 2;
                                //this.bulletTime = game.time.now + 200;
                            }
                        }
                    }
                };

                this.hitMyplane = function(myplane, bullet) {
                    bullet.kill();
                    myplane.level--;
                    if (myplane.level <= 0) {
                        myplane.kill();
                        this.dead();
                    }
                };

                this.crashMypanle = function(myplane, enemy) {
                    myplane.kill();
                    this.dead();
                };

                this.getAward = function(myplane, award) {
                    award.kill();
                    if (myplane.level < 3) {
                        myplane.level++;
                    }
                };

                this.updateText = function() {
                    this.text.setText('Score: ' + score);
                };

                this.dead = function() {
                    var myexplode = game.add.sprite(this.myplane.x, this.myplane.y, 'myexplode');
                    var anim = myexplode.animations.add('myexplode');
                    myexplode.animations.play('myexplode', 30, false, true);
                    anim.onComplete.add(this.gotOver, this);
                };

                this.gotOver = function() {
                    this.playback.stop();
                    game.state.start('end');
                };

                this.checkInputIsOnPlane = function() {
                    if ((game.input.x * 2 <= this.myplane.body.x + this.myplane.body.width * 2) && (game.input.x * 2 >= this.myplane.body.x - this.myplane.body.width * 2) &&
                        (game.input.y * 2 <= this.myplane.body.y + this.myplane.body.height * 2) && (game.input.y * 2 >= this.myplane.body.y - this.myplane.body.height * 2)) {
                        return true;
                    } else {
                        return false;
                    }
                }

                this.update = function() {
                    if (this.myStartFire) {
                        this.myFireBullet();
                        this.enemy1.enemyFire();
                        this.enemy2.enemyFire();
                        this.enemy3.enemyFire();

                        game.physics.arcade.overlap(this.mybullets, this.enemy1.enemys, this.enemy1.hitEnemy, null, this.enemy1);
                        game.physics.arcade.overlap(this.mybullets, this.enemy2.enemys, this.enemy2.hitEnemy, null, this.enemy2);
                        game.physics.arcade.overlap(this.mybullets, this.enemy3.enemys, this.enemy3.hitEnemy, null, this.enemy3);

                        game.physics.arcade.overlap(this.myplane, this.enemy1.enemyBullets, this.hitMyplane, null, this);
                        game.physics.arcade.overlap(this.myplane, this.enemy2.enemyBullets, this.hitMyplane, null, this);
                        game.physics.arcade.overlap(this.myplane, this.enemy3.enemyBullets, this.hitMyplane, null, this);

                        game.physics.arcade.overlap(this.myplane, this.enemy1.enemys, this.crashMypanle, null, this);
                        game.physics.arcade.overlap(this.myplane, this.enemy2.enemys, this.crashMypanle, null, this);
                        game.physics.arcade.overlap(this.myplane, this.enemy3.enemys, this.crashMypanle, null, this);

                        game.physics.arcade.overlap(this.awards, this.myplane, this.getAward, null, this);
                    }

                    //this.myplane.x = game.input.x * 2;
                    //this.myplane.y = game.input.y * 2;

                    if (this.checkInputIsOnPlane()) {
                        if (game.input.x * 2 < this.myplane.width / 2) { //如果指针位置距离屏幕左边太近，则默认去到最左边
                            this.myplane.x = this.myplane.width / 2
                        } else if (game.input.x * 2 > game.width - this.myplane.width / 2) { //同上，这次是右边
                            this.myplane.x = game.width - this.myplane.width / 2;
                        } else {
                            this.myplane.x = game.input.x * 2;
                        }

                        if (game.input.y * 2 < this.myplane.height / 2) { //如果指针位置距离屏幕上方太近，则默认去到最上方
                            this.myplane.y = this.myplane.height / 2
                        } else if (game.input.y * 2 > game.height) { //同上，这次是下方
                            this.myplane.y = game.height - this.myplane.height / 2;
                        } else {
                            this.myplane.y = game.input.y * 2 - this.myplane.width/2;
                        }
                    }
                    /*
                    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                        this.myplane.body.velocity.x = -400;                        
                    }

                    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                        this.myplane.body.velocity.x = 400;                        
                    }

                    else
                        this.myplane.body.velocity.x = 0;

                    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                        this.myplane.body.velocity.y = -400;                        
                    }

                    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                        this.myplane.body.velocity.y = 400;                        
                    }

                    else
                        this.myplane.body.velocity.y = 0;
                    */

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
                    game.input.onDown.add(this.reStart, this);
                }

                this.reStart = function() {
                    console.log('123');
                    game.state.start('play'); //为什么就是不跳
                };
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