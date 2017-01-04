
define(function(){
    var GameState = function(_game, _gameManager,_musicManager) {
        this.game = _game;
        this.gameManager = _gameManager;
        this.musicManager = _musicManager;
        this.init();
    };
    GameState.prototype = {
        game: null,
        gameManager: null,
        musicManager: null,
        init: function(){
            var self = this;
            var game = this.game;

            score = 0;
            
            enemyTeam = {
                enemy1: {
                    pic: 'enemy1',
                    count: 10,
                    speed: game.height,
                    life: 1,
                    score: 10,
                },
                enemy2: {
                    pic: 'enemy2',
                    count: 5,
                    speed: 2 * game.height / 3,
                    life: 6,
                    score: 40,
                },
                enemy3: {
                    pic: 'enemy3',
                    count: 5,
                    speed: 2 * game.height / 6,
                    life: 12,
                    score: 80,
                },
                bullet:{
                    pic: 'bullet',
                    count: 50
                }
            };
            game.States = {};
            game.States.boot = function(){
                this.preload = function(){
                    $(game.canvas).css("width",game.world.width / 2);
                    $(game.canvas).css("height",game.world.height / 2);
                    game.stage.backgroundColor = '#fff';
                };
                this.create = function(){
                    game.state.start('preload');
                };
            };
            game.States.preload = function(){
                this.preload = function(){
                    function callback(){
                        game.state.start('create');
                    }
                    game.load.onLoadComplete.add(callback);

                    game.load.image('background',"assets/images/background.png");
                    game.load.image('plante',"assets/images/plante.png");
                    game.load.image('plane',"assets/images/plane.png");
                    game.load.image('enemy1',"assets/images/enemy1.png");
                    game.load.image('enemy2',"assets/images/enemy2.png");
                    game.load.image('enemy3',"assets/images/enemy3.png");
                    game.load.image('bullet',"assets/images/bullet.png");
                    game.load.atlasJSONArray('myexplode',"assets/images/myexplode.png","assets/images/myexplode.json");
                    game.load.image('myexplode2',"assets/images/myexplode2.png");
                    game.load.image('score',"assets/images/score.png");
                    game.load.image('score_bg',"assets/images/score_bg.png");
                    game.load.image('boomAward',"assets/images/boomAward.png");
                    game.load.image('bulletAward',"assets/images/bulletAward.png");
                    game.load.image('bombIcon',"assets/images/bomb.png");
                    game.load.audio('bgm',"assets/audio/BGM.mp3");
                    if (self.gameManager.device.platform != 'android') {
                        game.load.audio('fire',"assets/audio/gun.mp3");
                        game.load.audio('bomb',"assets/audio/bomb.mp3");
                        game.load.audio('HurtMetal',"assets/audio/HurtMetal.mp3");
                    }

                };
            };
            //bgm;
            var boomCount = 8;
            var bgm,explosions,anim;
            
            game.States.create = function(){
                this.create = function(){
                    if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['bgm','fire','bomb','HurtMetal']);
                    } else {
                        self.musicManager.init(['bgm']);
                    }
                    bgm = game.add.sound("bgm",true);
                    bgm.play();
                    game.state.start('play');
                    
                }
            };
            game.States.play = function(){
                this.create = function(){
                    // self.musicManager.play('bgm',true);
                    this.timerControl = 0;
                    this.bulletTime = 0;
                    this.hasBulletAward = true;
                    this.inputInPlane = false;
                    this.BulletAward = 1;

                    var bg = game.add.sprite(0,0,"background");
                    bg.width = game.world.width;
                    bg.height = game.world.height;

                    //解决tile无法缩放
                    var planteS = game.world.width / game.cache.getImage('plante').width;
                    plante = game.add.tileSprite(0,0,game.world.width,game.world.height,"plante");
                    plante.tileScale.setTo(planteS,planteS);
                    game.physics.startSystem(Phaser.Physics.ARCADE);
                    plante.autoScroll(0,game.world.height / 20);

                    this.plane = game.add.sprite(game.world.centerX,game.world.centerY * 1.5 ,"plane");
                    var scalePlane = game.world.width * 0.21 / this.plane.width;
                    this.plane.scale.set(scalePlane);
                    this.plane.anchor.setTo(0.5,0.8);
                    game.physics.enable(this.plane,Phaser.Physics.ARCADE);
                    this.plane.body.collideWorldBounds = true;
                    this.plane.body.setSize(100,60,30,30);            

                    this.boomawards = game.add.group();
                    this.boomawards.enableBody = true;
                    this.boomawards.physicsBodyType = Phaser.Physics.ARCADE;
                    this.boomawards.setAll('outOfBoundsKill', true);
                    this.boomawards.setAll('checkWorldBounds', true);
                    this.boomawards.createMultiple(6, 'boomAward');

                    this.bulletGroup = groupInit(enemyTeam.bullet);
                    this.bulletAwardTimer = game.time.events.loop(250,this.generateBullet,this);
                    this.enemyGroup1 = groupInit(enemyTeam.enemy1);
                    this.enemyGroup1.scale.set(game.world.width * 0.1 / 80);
                    this.enemyGroup2 = groupInit(enemyTeam.enemy2);
                    this.enemyGroup2.scale.set(game.world.width * 0.22 / 180);
                    this.enemyGroup3 = groupInit(enemyTeam.enemy3);
                    this.enemyGroup3.scale.set(game.world.width * 0.3 / 249);
                    this.enemyLitileTimer1 = game.time.events.loop(2000, this.generateEnemy1, this);
                    // add
                    explosions = game.add.group();
                    explosions.createMultiple(10, 'myexplode');
                    explosions.forEach(function(explosion) {
                      explosion.animations.add('myexplode',[0,1]);
                    }, this);

                    this.bombIcon = game.add.sprite(100,game.world.height - 150,"bombIcon");
                    this.bombIcon.anchor.setTo(0.5);
                    this.boomCountText = game.add.text(this.bombIcon.width + 70, game.world.height - 150, "X " + boomCount+" ", { font: " 36px score",fill: "#FE9400"});

                    this.titleGroup = game.add.group();
                    this.scoreBg = game.add.sprite(0,16,"score_bg");
                    this.score = game.add.sprite(4,16,"score");
                    this.scoreText = game.add.text(this.score.width + 27,54,"0 ",{ font: " 36px score",fill: "#FE9400"});
                    this.scoreText.anchor.setTo(0.1,0.5);
                    this.scoreBg.width = this.scoreText.right < 220 ? 220 : this.scoreText.right;

                    this.titleGroup.add(this.scoreBg);
                    this.titleGroup.add(this.score);
                    this.titleGroup.add(this.scoreText);
                    this.titleGroup.x = 50 ;
                    this.titleGroup.y = 50 ;
                    game.input.onDown.add(function(e){
                        if(e.x < this.bombIcon.x /2 + this.bombIcon.width / 2 && e.x > this.bombIcon.x / 2- this.bombIcon.width / 4
                            && e.y < this.bombIcon.y / 2 + this.bombIcon.height / 2 && e.y > this.bombIcon.y / 2 - this.bombIcon.height / 4){
                            if(boomCount > 0){
                                var bombIconScale = game.add.tween(this.bombIcon.scale).to({
                                    x:1.5,y:1.5
                                },300,Phaser.Easing.Quadratic.Out,true,0,0,true);
                                this.clearEnemy();
                                boomCount--;
                                this.boomCountText.text = "X "+ boomCount + " ";                              
                            }
                        }
                        this.checkInputInPlane();
                    },this);
                };
                this.generateBullet = function(){
                    if(this.plane.alive){
                        var bullet;
                        var bulletHeight = game.cache.getImage('bullet').height;
                        var bulletWidth = game.cache.getImage('bullet').width;                        
                        bullet = this.bulletGroup.getFirstExists(false);
                        bullet.height = bulletHeight * 1.7;
                        bullet.width = bulletWidth * 1.3;
                        var bulletScale = game.world.width * 0.09 / bullet.height;
                        bullet.scale.setTo(1.2,bulletScale);
                        if(bullet && this.BulletAward == 1){
                            bullet.reset(this.plane.x - 5,this.plane.y - this.plane.height * 0.84 );
                            bullet.body.velocity.y = -game.world.height  / 1.5;
                        }
                        if(bullet && this.BulletAward == 2){
                            bullet = this.bulletGroup.getFirstExists(false);
                            if(bullet){
                                bullet.reset(this.plane.x - 40,this.plane.y - this.plane.height * 0.84);
                                bullet.body.velocity.y = -game.world.height  / 1.5;
                            }
                            bullet = this.bulletGroup.getFirstExists(false);
                            bullet.height = bulletHeight * 1.7;
                            bullet.width = bulletWidth * 1.3;
                            if(bullet){
                                bullet.reset(this.plane.x + 40,this.plane.y - this.plane.height * 0.84);
                                bullet.body.velocity.y = -game.world.height  / 1.5;
                            }
                        }
                        if(self.gameManager.device.platform != 'android'){
                            self.musicManager.stop('fire');
                            self.musicManager.play('fire',false);
                        }
                    }
                };

                function groupInit(enemyType){
                    var enemyGroup = game.add.group();
                    enemyGroup.enableBody = true;
                    enemyGroup.physicsBodyType = Phaser.Physics.ARCADE;
                    enemyGroup.createMultiple(enemyType.count,enemyType.pic);
                    enemyGroup.setAll('outOfBoundsKill',true);
                    enemyGroup.setAll('checkWorldBounds',true);
                    return enemyGroup;
                };
                function generateEnemy(enemy,enemyGroup){
                    var picWidth = game.cache.getImage(enemy.pic).width;
                    var maxWidth = game.world.width - picWidth;
                    var randomX = game.rnd.integerInRange(0, maxWidth);
                    var randomY = -game.cache.getImage(enemy.pic).height;
                    var e = enemyGroup.getFirstExists(false);
                    if(e){
                        e.reset(randomX, randomY);                        
                        game.physics.enable(e,Phaser.Physics.ARCADE);
                        e.body.velocity.y = enemy.speed;
                        e.life = enemy.life;
                        e.score = enemy.score;
                        return e;
                    }
                };
                this.generateEnemy1 = function(){
                     var enemy1 = generateEnemy(enemyTeam.enemy1,this.enemyGroup1);
                };
                this.generateEnemy2 = function(){
                    generateEnemy(enemyTeam.enemy2,this.enemyGroup2);
                }
                this.generateEnemy3 = function(){
                    generateEnemy(enemyTeam.enemy3,this.enemyGroup3);
                }
                this.generateBoomAward = function(){
                    var awardMaxWidth = game.width - game.cache.getImage('boomAward').width;
                    var boomAward = this.boomawards.getFirstExists(false);
                    if(boomAward) {
                        var randomX = game.rnd.integerInRange(0, awardMaxWidth);
                        var randomY = -game.cache.getImage('boomAward').height / 2;
                        boomAward.reset(randomX, -randomY);
                        game.physics.enable(boomAward,Phaser.Physics.ARCADE);
                        boomAward.body.velocity.y = game.height / 5;
                    }
                };
                this.generateBulletAward = function(){
                    var randomX = game.rnd.integerInRange(0, game.width - game.cache.getImage('bulletAward').width);
                    var randomY = -game.cache.getImage('bulletAward').height / 2;
                    this.bulletAward = game.add.sprite(randomX, randomY, 'bulletAward');
                    game.physics.enable(this.bulletAward,Phaser.Physics.ARCADE);
                    this.bulletAward.body.velocity.y = game.height / 5;
                };

                this.updateScore = function(){
                    this.scoreText.text = score + " ";
                    if( score >= 30 && score < 130 ){
                        this.enemyLitileTimer1.delay = 1000;
                    } else if( score >= 130 && score < 300 && this.timerControl == 0){
                        this.timerControl++;
                        this.enemyLitileTimer1.delay = 1000;
                        this.enemyMiddleTimer1 = game.time.events.loop(4000, this.generateEnemy2, this);
                    } else if( score >= 300 && score < 500 && this.timerControl == 1){
                        this.timerControl++;
                        this.enemyLitileTimer1.delay = 500;
                        this.enemyBigTimer1 = game.time.events.loop(6000, this.generateEnemy3, this);
                    } else if( score >= 500 && score < 2000 && this.timerControl == 2){
                        this.timerControl++;
                        this.enemyLitileTimer1.delay = 330;
                        this.enemyMiddleTimer1.delay = 5000;
                    } else if( score >= 2000 && score < 5500 && this.timerControl == 3){
                        this.timerControl++;
                        this.enemyLitileTimer1.delay = 330;
                        this.enemyMiddleTimer1.delay = 4000;
                        this.enemyBigTimer1.delay = 4000;
                    } else if( score >= 5500 && this.timerControl == 4){
                        this.enemyMiddleTimer1.delay = 2000;
                        this.enemyBigTimer1.delay = 2000;
                        this.timerControl++;
                    }
                    if(score % 1000 == 0){
                        this.enemyLitileTimer1.delay++;                        
                    }
                    if(score % 3000 == 0){
                        this.generateBoomAward();
                    }
                    if( score >= 5000 && this.hasBulletAward){
                        this.generateBulletAward();
                        this.hasBulletAward = false;
                    }
                };

                this.hitEnemy = function(bullet,enemy){
                    bullet.kill();
                    enemy.life--;
                    if(enemy.life > 0){
                        if(self.gameManager.device.platform != 'android'){
                            self.musicManager.stop('HurtMetal');
                            self.musicManager.play('HurtMetal',false);
                        }
                    }
                    if(enemy.life <= 0){
                        if(self.gameManager.device.platform != 'android'){
                            self.musicManager.stop('bomb');
                            self.musicManager.play('bomb',false);
                        }
                        enemy.kill();
                        boomAnimat(enemy);
                        score += enemy.score;
                        this.updateScore();
                    }
                };
                this.getBoomAward = function(plane, award){
                    award.kill();
                    boomCount++;
                    this.boomCountText.textContent = boomCount;
                };
                this.getBulletAward = function(plane,award){
                    award.kill();
                    this.BulletAward = 2;
                    this.bulletAwardTimer.delay = 330;
                };
                this.crashPlane = function(plane,enemy){
                    var myexplode = game.add.sprite(this.plane.x - this.plane.width / 2, this.plane.y - this.plane.height / 2, 'myexplode');
                    myexplode.width = plane.width;
                    myexplode.height = plane.height;
                    plane.kill();
                    if(myexplode.x < 0){
                        myexplode.x = 0;
                    } else if( myexplode.x + myexplode.width > game.world.width){
                        myexplode.x = game.world.width - myexplode.width;
                    } else if( myexplode.y + myexplode.height > game.world.height){
                        myexplode.y = game.world.height - myexplode.height;
                    }
                    var anim = myexplode.animations.add('myexplode',[0,1],6);
                    myexplode.animations.play('myexplode');
                    if(self.gameManager.device.platform != 'android'){
                            self.musicManager.stop();
                            self.musicManager.play('bomb',false);
                        }
                    anim.onComplete.add(function(e){
                        e.destroy();
                        game.state.start("end");
                    }, this);
                };
                function boomAnimat(enemy){
                    var Enemyexplode = explosions.getFirstExists(false);
                    Enemyexplode.width = enemy.width;
                    Enemyexplode.height = enemy.height;
                    Enemyexplode.reset(enemy.body.x, enemy.body.y);                    
                    Enemyexplode.animations.play('myexplode',6,false,true);
                }
                this.checkInputInPlane = function(){
                    if(game.input.x < this.plane.x / 2 + this.plane.width /4
                        && game.input.x > this.plane.x / 2 - this.plane.width /4
                        && game.input.y > this.plane.y / 2 - this.plane.height / 4 && game.input.y < this.plane.y / 2 + this.plane.height / 4)
                    {
                        this.inputInPlane = true;
                    }
                };
                this.clearEnemy = function(){
                    this.enemyGroup1.forEachExists(function(enemy1){
                        enemy1.kill();
                        boomAnimat(enemy1);
                        score += enemy1.score;
                    },true);
                    this.enemyGroup2.forEachExists(function(enemy2){
                        enemy2.kill();
                        boomAnimat(enemy2);
                        score += enemy2.score;
                    },true);
                    this.enemyGroup3.forEachExists(function(enemy3){
                        enemy3.kill();
                        boomAnimat(enemy3);
                        score += enemy3.score;
                    },true);
                    if(self.gameManager.device.platform != 'android'){
                        self.musicManager.play('bomb',false);
                    }
                    this.updateScore();
                };
                this.update = function(){
                    if(this.inputInPlane){
                        if (game.input.pointer1.isDown){
                            // this.plane.x = game.input.pointer1.x * 2 - this.plane.width / 2 < 0 ? 70 : game.input.pointer1.x * 2;
                            if(game.input.pointer1.x * 2 - this.plane.width / 2 > 0 
                                && game.input.pointer1.x * 2 + this.plane.width < game.world.width){
                                this.plane.x = game.input.pointer1.x * 2;
                            } else if(game.input.pointer1.x * 2 - this.plane.width / 2 < 0){
                                this.plane.x = this.plane.width / 2;
                            } else {
                                this.plane.x = game.world.width - this.plane.width / 2;
                            }
                            //this.plane.x = game.input.pointer1.x * 2 + this.plane.width / 4 > game.world.width ? game.world.width - this.plane.width / 2: game.input.pointer1.x * 2;
                            if(game.input.pointer1.y * 2 > game.world.height){
                                this.plane.y = game.world.height * 0.99;
                            }else{
                                this.plane.y = game.input.pointer1.y * 2;
                            }
                            
                        }
                        if(game.input.pointer1.isUp){
                            this.inputInPlane = false;
                        };
                    }
                    game.physics.arcade.overlap(this.bulletGroup, this.enemyGroup1, this.hitEnemy, null, this);
                    game.physics.arcade.overlap(this.bulletGroup, this.enemyGroup2, this.hitEnemy, null, this);
                    game.physics.arcade.overlap(this.bulletGroup, this.enemyGroup3, this.hitEnemy, null, this);
                    game.physics.arcade.overlap(this.plane, this.enemyGroup1, this.crashPlane, null, this);
                    game.physics.arcade.overlap(this.plane, this.enemyGroup2, this.crashPlane, null, this);
                    game.physics.arcade.overlap(this.plane, this.enemyGroup3, this.crashPlane, null, this);
                    game.physics.arcade.overlap(this.plane, this.boomawards, this.getBoomAward, null, this);
                    game.physics.arcade.overlap(this.plane, this.bulletAward, this.getBulletAward, null, this);
                };
            };
            game.States.end = function(){
                this.create = function(){
                    //self.musicManager.stop();
                    bgm.fadeOut(1000);
                    var style = {font: "bold 32px Arial", fill: "#ff0000", boundsAlignH: "center", boundsAlignV: "middle"};
                    this.text = game.add.text(0, 0, "Score: " + score, style);
                    this.text.setTextBounds(0, 0, game.width, game.height);
                }
            };
            game.state.add('boot',game.States.boot);
            game.state.add('preload',game.States.preload);
            game.state.add('create',game.States.create);
            game.state.add('play',game.States.play);
            game.state.add('end',game.States.end);
            game.state.start('boot');
        }
    };
    return GameState;

});



























