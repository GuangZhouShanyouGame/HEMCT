
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
                    game.load.image('plane',"assets/images/plane.png");
                    game.load.image('enemy1',"assets/images/enemy1.png");
                    game.load.image('enemy2',"assets/images/enemy2.png");
                    game.load.image('enemy3',"assets/images/enemy3.png");
                    game.load.image('bullet',"assets/images/bullet.png");
                    game.load.atlasJSONArray('myexplode',"assets/images/myexplode.png","assets/images/myexplode.json");
                    game.load.image('score',"assets/images/score.png");
                    game.load.image('boomAward',"assets/images/boomAward.png");
                    game.load.image('bulletAward',"assets/images/bulletAward.png");
                    game.load.image('bombIcon',"assets/images/bomb.png");
                    game.load.audio('bgm',"assets/audio/BGM.mp3");
                    if (self.gameManager.device.platform != 'android') {
                        game.load.audio('fire',"assets/audio/gun.mp3");
                        game.load.audio('bomb',"assets/audio/bomb.mp3");
                        game.load.audio('bomb-fly',"assets/audio/fly2.mp3");
                        game.load.audio('enemy-bomb',"assets/audio/HurtMetal.mp3");
                    }

                };
            };
            game.States.create = function(){
                this.create = function(){
                    if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['bgm','fire','bomb','bomb-fly','HurtMetal']);
                    } else {
                        self.musicManager.init(['fire']);
                    }
                    game.state.start('play');
                }
            };
            game.States.play = function(){
                this.create = function(){
                    this.bulletTime = 0;
                    this.hasBulletAward = true;
                    this.BulletAward = 1;
                    this.interval = 6;
                    self.musicManager.play('bgm');

                    this.bg = game.add.tileSprite(0,0,game.world.width,game.world.height,"background");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;
                    game.physics.startSystem(Phaser.Physics.ARCADE);
                    this.bg.autoScroll(0,20);

                    this.titleGroup = game.add.group();
                    this.style = {
                        font: "bold 64px Arial",
                        fill: "#ffffff"
                    }
                    this.score = game.add.sprite(game.world.centerX - 96 ,16,"score");
                    this.scoreText = game.add.text(game.world.centerX + 50,64,"0",this.style);
                    this.scoreText.anchor.setTo(0.5);
                    this.titleGroup.add(this.scoreText);
                    this.plane = game.add.sprite(game.world.centerX,game.world.centerY * 1.5 ,"plane");
                    this.plane.anchor.setTo(0.5);
                    game.physics.enable(this.plane,Phaser.Physics.ARCADE);
                    this.plane.body.collideWorldBounds = true;

                    this.bombIcon = game.add.sprite(50,game.world.height - 250,"bombIcon");
                    this.boomCountText = game.add.text(150, game.world.height - 240, "X " + boomCount, this.style);

                    this.boomawards = game.add.group();
                    this.boomawards.enableBody = true;
                    this.boomawards.physicsBodyType = Phaser.Physics.ARCADE;
                    this.boomawards.setAll('outOfBoundsKill', true);
                    this.boomawards.setAll('checkWorldBounds', true);
                    this.boomawards.createMultiple(6, 'boomAward');
                    this.awardMaxWidth = game.width - game.cache.getImage('boomAward').width;
                    enemyTeam = {
                        enemy1: {
                            pic: 'enemy1',
                            count: 5,
                            speed: 667/1.5,
                            score: 10
                        },
                        enemy2: {
                            pic: 'enemy2',
                            count: 2,
                            speed: 667/3,
                            score: 40
                        },
                        enemy3: {
                            pic: 'enemy3',
                            count: 2,
                            speed: 667/3,
                        },
                        bullet:{
                            pic: 'bullet',
                            count: 20
                        }
                    };
                    this.bulletGroup = groupInit(enemyTeam.bullet);
                    this.enemyGroup1 = groupInit(enemyTeam.enemy1);
                    this.enemyGroup2 = groupInit(enemyTeam.enemy2);
                    this.enemyGroup3 = groupInit(enemyTeam.enemy3);
                    this.enemyLitileTimer1 = this.game.time.events.loop(2000, this.generateEnemy1, this);

                    game.input.onTap.add(function(e){
                        if(e.x < this.bomb.x + this.bomb.width / 4 && e.x > this.bomb.x - this.bomb.width / 2
                            && e.y < this.bomb.y / 2 + this.bomb.height / 2 && e.y > this.bomb.y / 2 - this.bomb.height / 2){
                            if(boomCount > 0){
                                this.clearEnemy();
                                boomCount--;
                                this.boomCountText.setText("X " +boomCount)
                            }
                        }
                    },this);
                };
                this.generateBullet = function(){
                    if(this.plane.alive && game.time.now > this.bulletTime){
                        self.musicManager.play('fire');
                        var bullet;
                        bullet = this.bulletGroup.getFirstExists(false);
                        if(bullet && this.BulletAward == 1){
                            bullet.reset(this.plane.x,this.plane.y - 45);
                            bullet.body.velocity.y = -400;
                            this.bulletTime = game.time.now + 200;
                        }
                        if(bullet && this.BulletAward == 2){
                            bullet = this.bulletGroup.getFirstExists(false);
                            if(bullet){
                                bullet.reset(this.plane.x,this.plane.y - 45);
                                bullet.body.velocity.y = -400;
                                this.bulletTime = game.time.now + 200;
                            }
                            bullet = this.bulletGroup.getFirstExists(false);
                            if(bullet){
                                bullet.reset(this.plane.x -15,this.plane.y - 45);
                                bullet.body.velocity.y = -400;
                                this.bulletTime = game.time.now + 200;
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

                this.generateEnemy1 = function(){
                    var enemy1 = this.enemyGroup1.getFirstExists(false);
                    var maxWidth = game.world.width - game.cache.getImage('enemy1').width;
                    if(enemy1){
                        enemy1.life = 1;
                        enemy1.score = 10;
                        var random;
                        var randomX = game.rnd.integerInRange(0, maxWidth);
                        var randomY = -game.cache.getImage('enemy1').height;
                        if(randomX != random && randomX != random + 100 && randomX != random - 100){
                            enemy1.reset(randomX, randomY);
                            game.physics.enable(enemy1,Phaser.Physics.ARCADE);
                            enemy1.body.velocity.y = 667/1.5;
                            random = randomX;
                        }
                    }
                };
                this.generateEnemy2 = function(){
                    var maxWidth = game.world.width - game.cache.getImage('enemy2').width;
                    var enemy2 = this.enemyGroup2.getFirstExists(false);
                    if(enemy2){
                        enemy2.life = 2;
                        enemy2.score = 40;
                        var random;
                        var randomX = game.rnd.integerInRange(0, maxWidth);
                        var randomY = -game.cache.getImage('enemy2').height;
                        if(randomX != random && randomX != random + 200 && randomX != random - 200){
                            enemy2.reset(randomX , randomY );
                            game.physics.enable(enemy2,Phaser.Physics.ARCADE);
                            enemy2.body.velocity.y = 667/3;
                            random = randomX;
                        }

                    }
                };
                this.generateEnemy3 = function(){
                    var maxWidth = game.world.width - game.cache.getImage('enemy2').width;
                    var enemy3 = this.enemyGroup3.getFirstExists(false);
                    if(enemy3){
                        enemy3.life = 4;
                        enemy3.score = 80;
                        var random;
                        var randomX = game.rnd.integerInRange(0, maxWidth);
                        var randomY = -game.cache.getImage('enemy3').height;
                        if(randomX != random && randomX != random + 200 && randomX != random - 200){
                            enemy3.reset(randomX , randomY );
                            game.physics.enable(enemy3,Phaser.Physics.ARCADE);
                            enemy3.body.velocity.y = 667/3;
                            random = randomX;
                        }

                    }
                };
                this.generateBoomAward = function(){
                    var boomAward = this.boomawards.getFirstExists(false);
                    if(boomAward) {
                        var randomX = game.rnd.integerInRange(0, this.awardMaxWidth);
                        var randomY = game.cache.getImage('boomAward').height;
                        boomAward.reset(randomX, -randomY);
                        game.physics.enable(boomAward,Phaser.Physics.ARCADE);
                        boomAward.body.velocity.y = 500;
                    }
                };
                this.generateBulletAward = function(){
                    var randomX = game.rnd.integerInRange(0, game.width - game.cache.getImage('bulletAward').width);
                    var randomY = game.cache.getImage('bulletAward').height;
                    this.bulletAward = game.add.sprite(randomX, randomY, 'bulletAward');
                    game.physics.enable(this.bulletAward,Phaser.Physics.ARCADE);
                    this.bulletAward.body.velocity.y = game.world.height / 2;
                };
                this.updateScore = function(){
                    this.scoreText.setText(score);
                    if( score >= 30 && score < 130 ){
                        game.time.events.remove(this.enemyLitileTimer1);
                        this.enemyLitileTimer2 = game.time.events.loop(1000, this.generateEnemy1, this);
                     } else if( score >= 130 && score < 300 ){
                        game.time.events.remove(this.enemyLitileTimer2);
                        this.enemyLitileTimer3 = game.time.events.loop(500, this.generateEnemy1, this);
                        this.enemyMiddleTimer1 = game.time.events.loop(4000, this.generateEnemy2, this);
                    } else if( score >= 300 && score < 500 ){
                        game.time.events.remove(this.enemyLitileTimer3);
                        game.time.events.remove(this.enemyMiddleTimer1);
                        this.enemyLitileTimer4 = game.time.events.loop(300, this.generateEnemy1, this);
                        this.enemyMiddleTimer2 = game.time.events.loop(4000, this.generateEnemy2, this);
                        this.enemyBigTimer1 = game.time.events.loop(4000, this.generateEnemy3, this);
                    } else{
                        game.time.events.remove(this.enemyLitileTimer4);
                        game.time.events.remove(this.enemyMiddleTimer2);
                    }
                    if( score >= 1000){
                        this.enemyMiddleTimer = game.time.events.loop(500, this.generateEnemy2, this);
                        this.enemyBigTimer = game.time.events.loop(500, this.generateEnemy3, this);
                        if(score % 500 == 0){
                            this.interval++;
                            game.time.events.loop(1000 / this.interval,this.generateEnemy1, this);
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
                    if(enemy.life <= 0){
                        var Enemyexplode = game.add.sprite(enemy.x, enemy.y, 'myexplode');
                        Enemyexplode.width = enemy.width;
                        Enemyexplode.height = enemy.height;
                        var anim = Enemyexplode.animations.add('Enemyexplode',[0,1],32);

                        enemy.kill();
                        Enemyexplode.animations.play('Enemyexplode');
                        anim.onComplete.add(function(e){
                            e.destroy();
                        },this);

                        score += enemy.score;
                        this.updateScore();
                    }
                };

                this.getBoomAward = function(plane, award){
                    award.kill();
                    boomCount++;
                    this.boomCountText.setText("X " +boomCount)
                };

                this.getBulletAward = function(plane,award){
                    award.kill();
                    this.BulletAward = 2;
                };
                this.crashPlane = function(plane,enemy){
                    var myexplode = game.add.sprite(this.plane.x, this.plane.y, 'myexplode');
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
                    anim.onComplete.add(this.gameOver, this);
                };

                this.clearEnemy = function(){
                    this.enemyGroup1.forEachExists(function(e){
                        e.kill();
                        score += e.score;
                    },true);
                    this.enemyGroup2.forEachExists(function(e){
                        e.kill();
                        score += e.score;
                    },true);
                    this.updateScore();
                };
                this.gameOver = function(){
                    setInterval(function () {
                        game.state.start("end");
                    },1000)
                };
                this.update = function(){
                    this.generateBullet();
                    if (game.input.pointer1.isDown
                        && game.input.x < this.plane.x / 2 + this.plane.width /2
                        && game.input.x > this.plane.x / 2 - this.plane.width /2)
                    {
                        this.plane.x = game.input.x * 2;
                        this.plane.y = game.input.y * 2;
                    }
                    game.physics.arcade.overlap(this.bulletGroup, this.enemyGroup1, this.hitEnemy, null, this);
                    game.physics.arcade.overlap(this.bulletGroup, this.enemyGroup2, this.hitEnemy, null, this);
                    game.physics.arcade.overlap(this.plane, this.enemyGroup1, this.crashPlane, null, this);
                    game.physics.arcade.overlap(this.plane, this.enemyGroup2, this.crashPlane, null, this);
                    game.physics.arcade.overlap(this.plane, this.boomawards, this.getBoomAward, null, this);
                    game.physics.arcade.overlap(this.plane, this.bulletAward, this.getBulletAward, null, this);
                };
            };
            game.States.end = function(){
                this.create = function(){
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




























