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
        score: 0,

        init: function(){
            var self = this;
            var game = this.game;
            game.States = {};

            game.States.boot = function(){
                this.preload = function(){
                    $(game.canvas).css("width",game.world.width / 2);
                    $(game.canvas).css("height",game.world.height / 2);
                    game.stage.backgroundColor = '#aaa';
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
                    game.load.image('ground',"assets/images/ground.png");
                    game.load.atlasJSONArray('pipe',"assets/images/pipes.png","assets/images/pipes.json");
                    game.load.atlasJSONArray('bird',"assets/images/bird.png","assets/images/bird.json");
                    game.load.image('scoreboard',"assets/images/scoreboard.png");
                    game.load.image('gameover',"assets/images/gameover.png");
                    game.load.audio('flap',"assets/audio/flap.wav");
                    game.load.audio('ground-hit',"assets/audio/ground-hit.wav");
                    game.load.audio('pipe-hit',"assets/audio/pipe-hit.wav");
                    game.load.audio('ouch',"assets/audio/ouch.wav");
                    game.load.audio('score',"assets/audio/score.wav");

                };
            };

            game.States.create = function(){
                this.create = function(){
                    if(self.gameManager.device.platform != 'android'){
                        self.musicManager.init(['flap','ouch','pipe-hit','score','ground-hit']);
                    } else {
                        self.musicManager.init(['flap']);
                    }
                    game.state.start('play');
                }
            };

            game.States.play = function(){
                this.create = function(){

                    //game background
                    this.bg = game.add.sprite(0,0,"background");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;

                    this.pipeGroup = game.add.group();
                    this.timer = this.game.time.events.loop(1500, this.gengeratePipes, this);


                    this.ground = game.add.sprite(0,game.world.height-224,"ground");
                    this.ground.width = game.world.width;
                    this.ground.height = 224;
                    game.physics.enable(this.ground,Phaser.Physics.ARCADE);//开启地面的物理系统
                    this.ground.body.immovable = true;

                    var spacr_key = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
                    spacr_key.onDown.add(this.jump,this);


                    
                    this.bird = game.add.sprite(100,245,"bird");
                    this.bird.animations.add('fly',[0,1],12,true);
                    this.bird.animations.play('fly');
                    game.physics.enable(this.bird,Phaser.Physics.ARCADE);
                    this.bird.body.gravity.y = 1000;
                    //this.bird.width = 68;
                    //this.bird.height = 48;
                    this.bird.anchor.setTo(0.5);

                    
                    this.hasScored = true;
                    this.hasHitGround = false;
                    var style = { font: "60px Arial", fill: "#ffffff" };
                    this.score = game.add.text(game.world.centerX,game.world.centerY - 400,"0",style);
                    label_score = 0;
                };
                this.jump = function(){
                    if(this.bird.alive == false){
                        return;
                    }
                    this.bird.body.velocity.y = -350;
                    game.add.tween(this.bird).to({angle:-30}, 100, null, true, 0, 0, false); 
                    self.musicManager.play('flap');
                };
                this.update = function(){
                    //do loop
                    if(this.bird.inWorld == false){
                        return;
                    }
                    if(this.bird.angle < 20){
                        this.bird.angle += 1;
                    }
                    game.physics.arcade.collide(this.bird,this.ground, this.ground_hit, null, this); 
                    game.physics.arcade.collide(this.bird, this.pipeGroup, this.pipe_hit, null, this);

                    this.pipeGroup.forEachExists(this.checkScore,this);
                };
                this.ground_hit = function(){
                    if(this.hasHitGround == true || this.bird.alive == false){
                        return;
                    }
                    this.hasHitGround = true;
                    this.bird.alive = false;
                    this.game.time.events.remove(this.timer);
                    self.musicManager.play('ground-hit');
                    game.state.start("end");
                }
                this.pipe_hit = function(){
                    if(this.bird.alive == false){
                        return;
                    }
                    this.bird.alive = false;
                    this.game.time.events.remove(this.timer);
                    this.pipeGroup.forEachAlive(function(p){
                        p.body.velocity.x = 0;
                    },this);
                    //pipes
                    self.musicManager.play('pipe-hit');
                    game.state.start("end");
                };
                this.gengeratePipes = function(gap){
                    gap = gap || 200; 
                    var position = (505 - 320 - gap) + Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random());
                    var topPipeY = position-360; 
                    var bottomPipeY = position+game.world.height / 2; 

                    var topPipe = game.add.sprite(game.world.width, topPipeY, 'pipe',0, this.pipeGroup); 
                    var bottomPipe = game.add.sprite(game.world.width, bottomPipeY, 'pipe',1,  this.pipeGroup); 

                    topPipe.height = topPipe.height * 2;
                    bottomPipe.height = bottomPipe.height * 2;
                    if(this.resetPipe(topPipeY,bottomPipeY)) return;
                    game.physics.enable(this.pipeGroup,Phaser.Physics.ARCADE);
                    this.pipeGroup.setAll('body.velocity.x', -200);
                };

                this.resetPipe = function(topPipeY,bottomPipeY){
                    var i = 0;
                    this.pipeGroup.forEachDead(function(pipe){ //
                        if(pipe.y<=0){
                            pipe.reset(game.world.width, topPipeY);
                        }else{
                            pipe.reset(game.world.width, bottomPipeY);
                        }
                        game.physics.enable(this.pipe,Phaser.Physics.ARCADE);
                        pipe.body.velocity.x = -200;
                        i++;
                    }, this);
                    return i == 2;
                };
                this.checkScore = function(pipe){
                    if(!pipe.hasScored && pipe.y<=0 && pipe.x<=this.bird.x-17-54){
                        pipe.hasScored = true; 
                        this.score.text = ++label_score;
                        self.musicManager.play('score');
                        return true;
                    }
                    return false;
                }
            };

            game.States.end = function(){
                this.create = function(){
                    console.log('The bestScore is '+ label_score);
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
