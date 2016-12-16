
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
            boomCount = 8;
            enemyTeam = {
                enemy1: {
                    pic: 'enemy1',
                    count: 10,
                    speed: game.height /2,
                    life: 1,
                    score: 10
                },
                enemy2: {
                    pic: 'enemy2',
                    count: 5,
                    speed: game.height / 3,
                    life: 4,
                    score: 40
                },
                enemy3: {
                    pic: 'enemy3',
                    count: 5,
                    speed: game.height / 6,
                    life: 8,
                    score: 80
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
            game.States.create = function(){
                this.create = function(){
                    if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['bgm','fire','bomb','HurtMetal']);
                    } else {
                        self.musicManager.init(['bgm']);
                    }
                    game.state.start('play');
                    self.musicManager.play('bgm');
                }
            };
            game.States.play = function(){
                this.create = function(){
                    this.timerControl = 0;
                    this.bulletTime = 0;
                    this.hasBulletAward = true;
                    this.inputInPlane = false;
                    this.BulletAward = 1;

                    this.bg = game.add.sprite(0,0,"background");
                    if(this.bg.width>this.bg.height){
                        var bgScale=game.world.height/this.bg.height;
                    }else{
                        bgScale=game.world.width/this.bg.width;
                    }
                    this.bg.scale.setTo(bgScale,bgScale);

                    this.plante = game.add.tileSprite(0,0,game.width,game.height,"plante");
                    if(this.plante.width>this.plante.height){
                        var planteScale=game.world.height/this.plante.height;
                    }else{
                        planteScale=game.world.width/this.plante.width;
                    }
                    this.plante.scale.setTo(planteScale,planteScale);
                    game.physics.startSystem(Phaser.Physics.ARCADE);
                    this.plante.autoScroll(0,game.height / 20);

                    this.plane = game.add.sprite(game.world.centerX,game.world.centerY * 1.5 ,"plane");
                    this.plane.anchor.setTo(0.5);
                    game.physics.enable(this.plane,Phaser.Physics.ARCADE);
                    this.plane.body.collideWorldBounds = true;
                    this.plane.body.setSize(100,60,30,30);
                    
                    this.bombIcon = game.add.sprite(50,game.world.height - 250,"bombIcon");
                    this.boomCountText = document.getElementById("bombCountText");
                    this.boomCountText.textContent = "X" + boomCount;
                    //this.boomCountText = game.add.text(150, game.world.height - 210, "X " + boomCount, style);

                    this.boomawards = game.add.group();
                    this.boomawards.enableBody = true;
                    this.boomawards.physicsBodyType = Phaser.Physics.ARCADE;
                    this.boomawards.setAll('outOfBoundsKill', true);
                    this.boomawards.setAll('checkWorldBounds', true);
                    this.boomawards.createMultiple(6, 'boomAward');

                    this.bulletGroup = groupInit(enemyTeam.bullet);
                    game.time.events.loop(250,this.generateBullet,this);
                    this.enemyGroup1 = groupInit(enemyTeam.enemy1);
                    this.enemyGroup2 = groupInit(enemyTeam.enemy2);
                    this.enemyGroup3 = groupInit(enemyTeam.enemy3);
                    this.enemyLitileTimer1 = game.time.events.loop(2000, this.generateEnemy1, this);


                    this.titleGroup = game.add.group();
                    this.scoreBg = game.add.sprite(0,16,"score_bg");
                    this.score = game.add.sprite(12,16,"score");
                    this.scoreText = document.getElementById("score");
                    this.scoreText.textContent = score;
                    //this.scoreText = game.add.text(game.world.centerX + 100,35,"0",style);
                    //this.scoreText.font = "score";

                    this.titleGroup.add(this.scoreBg);
                    this.titleGroup.add(this.score);
                    //this.titleGroup.add(this.scoreText);
                    this.titleGroup.x = 50 ;
                    this.titleGroup.y = 50 ;
                    game.input.onDown.add(function(e){
                        if(e.x < this.bombIcon.x + this.bombIcon.width / 4 && e.x > this.bombIcon.x - this.bombIcon.width / 2
                            && e.y < this.bombIcon.y / 2 + this.bombIcon.height / 2 && e.y > this.bombIcon.y / 2 - this.bombIcon.height / 2){
                            if(boomCount > 0){
                                this.clearEnemy();
                                boomCount--;
                                this.boomCountText.textContent = boomCount;
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
                        if(bullet && this.BulletAward == 1){
                            bullet.reset(this.plane.x - 5,this.plane.y - 60 );
                            bullet.body.velocity.y = -game.world.height  / 1.5;
                            if(self.gameManager.device.platform != 'android'){
                                self.musicManager.play('fire');
                            }
                        }
                        if(bullet && this.BulletAward == 2){
                            bullet = this.bulletGroup.getFirstExists(false);
                            if(bullet){
                                bullet.reset(this.plane.x - 40,this.plane.y - 60);
                                bullet.body.velocity.y = -game.world.height  / 1.5;
                            }
                            bullet = this.bulletGroup.getFirstExists(false);
                            if(bullet){
                                bullet.reset(this.plane.x + 40,this.plane.y - 60);
                                bullet.body.velocity.y = -game.world.height  / 1.5;
                            }
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
                    var maxWidth = game.world.width - game.cache.getImage(enemy.pic).width;
                    var randomX = game.rnd.integerInRange(0, maxWidth);
                    var randomY = -game.cache.getImage(enemy.pic).height;
                    var e = enemyGroup.getFirstExists(false);
                    if(e){
                        e.reset(randomX, randomY);
                        game.physics.enable(e,Phaser.Physics.ARCADE);
                        e.body.velocity.y = enemy.speed;
                        e.life = enemy.life;
                        e.score = enemy.score;
                    }
                };
                this.generateEnemy1 = function(){
                    generateEnemy(enemyTeam.enemy1,this.enemyGroup1);
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
                        var randomY = game.cache.getImage('boomAward').height;
                        boomAward.reset(randomX, -randomY);
                        game.physics.enable(boomAward,Phaser.Physics.ARCADE);
                        boomAward.body.velocity.y = game.height / 5;
                    }
                };
                this.generateBulletAward = function(){
                    var randomX = game.rnd.integerInRange(0, game.width - game.cache.getImage('bulletAward').width);
                    var randomY = game.cache.getImage('bulletAward').height;
                    this.bulletAward = game.add.sprite(randomX, randomY, 'bulletAward');
                    game.physics.enable(this.bulletAward,Phaser.Physics.ARCADE);
                    this.bulletAward.body.velocity.y = game.world.height / 5;
                };

                this.updateScore = function(){
                    this.scoreText.textContent = score;
                    if( score >= 30 && score < 130 ){
                        this.enemyLitileTimer1.delay = 1000;
                    } else if( score >= 130 && score < 300 && this.timerControl == 0){
                        this.timerControl++;
                        this.enemyLitileTimer1.delay = 500;
                        this.enemyMiddleTimer1 = game.time.events.loop(4000, this.generateEnemy2, this);
                    } else if( score >= 300 && score < 500 && this.timerControl == 1){
                        this.timerControl++;
                        this.enemyLitileTimer1.delay = 300;
                        this.enemyBigTimer1 = game.time.events.loop(4000, this.generateEnemy3, this);
                    } else if( score >= 500 && score < 7000 && this.timerControl == 2){
                        this.timerControl++;
                        this.enemyLitileTimer1.delay = 250;
                        this.enemyMiddleTimer1.delay = 3000;
                        this.enemyBigTimer1.delay = 3000;
                        console.log(2);
                    } else if( score >= 700 && score < 1000 && this.timerControl == 3){
                        this.timerControl++;
                        this.enemyLitileTimer1.delay = 200;
                        this.enemyMiddleTimer1.delay = 2000;
                    } else if( score >= 1000){
                        this.enemyMiddleTimer1.delay = 2000;
                        this.enemyBigTimer1.delay = 2000;
                        if(score % 500 == 0){
                            this.enemyLitileTimer1.delay++;
                        }
                        if(score % 3000 == 0){
                            this.generateBoomAward();
                        }
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
                            self.musicManager.play('HurtMetal');
                        }
                    }
                    if(enemy.life <= 0){
                        enemy.kill();
                        boomAnimat(enemy);
                        if(self.gameManager.device.platform != 'android'){
                            self.musicManager.play('bomb');
                        }
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
                    var anim = myexplode.animations.add('myexplode',[0,1],32);
                    myexplode.animations.play('myexplode');

                    anim.onComplete.add(function(e){
                        e.destroy();
                        game.state.start("end");
                    }, this);
                };
                function boomAnimat(enemy){
                    var Enemyexplode = game.add.sprite(enemy.x,enemy.y, 'myexplode');
                        Enemyexplode.width = enemy.width;
                        Enemyexplode.height = enemy.height;
                        var anim = Enemyexplode.animations.add('Enemyexplode',[0,1],32);
                        Enemyexplode.animations.play('Enemyexplode');
                        anim.onComplete.add(function(e){
                            e.destroy();
                        },this);
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
                        self.musicManager.play('bomb');
                    }
                    this.updateScore();
                };
                /*this.checkPlaneInWorld = function(){
                 game.input.y = game.input.y > game.world.height / 2 - this.plane.height ? game.world.height / 2 - this.plane.height : game.input.y;
                 game.input.x = game.input.x < 0 ? 0 : game.input.x;
                 game.input.x = game.input.x > game.world.width / 2 - this.plane.width ? game.world.width / 2 - this.plane.width : game.input.x;
                }*/
                this.update = function(){
                    if(this.inputInPlane){
                        if (game.input.pointer1.isDown){
                            this.plane.x = game.input.x * 2;
                            this.plane.y = game.input.y * 2;
                        }
                        game.input.onUp.add(function(){
                            this.inputInPlane = false;
                        },this);
                    }
                    game.physics.arcade.overlap(this.bulletGroup, this.enemyGroup1, this.hitEnemy, null, this);
                    game.physics.arcade.overlap(this.bulletGroup, this.enemyGroup2, this.hitEnemy, null, this);
                    game.physics.arcade.overlap(this.bulletGroup, this.enemyGroup3, this.hitEnemy, null, this);
                    //game.physics.arcade.overlap(this.plane, this.enemyGroup1, this.crashPlane, null, this);
                    //game.physics.arcade.overlap(this.plane, this.enemyGroup2, this.crashPlane, null, this);
                    //game.physics.arcade.overlap(this.plane, this.enemyGroup3, this.crashPlane, null, this);
                    game.physics.arcade.overlap(this.plane, this.boomawards, this.getBoomAward, null, this);
                    game.physics.arcade.overlap(this.plane, this.bulletAward, this.getBulletAward, null, this);
                };
            };
            game.States.end = function(){
                this.create = function(){
                    self.musicManager.stop("bgm");
                    document.getElementById("bombCountText").style.display = "none";
                    document.getElementById("score").style.display = "none";
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




























