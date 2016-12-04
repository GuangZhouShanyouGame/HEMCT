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

                    //以下为要加载的资源
                    //加载普通图片
                    game.load.image('background', 'assets/background.png'); //游戏背景图
                    game.load.image('ground', 'assets/ground.png'); //地面
                    game.load.image('title', 'assets/title.png'); //游戏标题
                    game.load.image('btn', 'assets/start-button.png'); //按钮
                    game.load.image('ready_text', 'assets/get-ready.png'); //get ready图片
                    game.load.image('play_tip', 'assets/instructions.png'); //玩法提示图片
                    game.load.image('game_over', 'assets/gameover.png'); //gameover图片
                    game.load.image('score_board', 'assets/scoreboard.png'); //得分板

                    //加载sprite
                    game.load.spritesheet('bird', 'assets/bird.png', 34, 24, 3); //鸟 :宽 高 数量
                    game.load.spritesheet('pipe', 'assets/pipes.png', 54, 320, 2); //管道

                    //加载声音
                    game.load.audio('fly_sound', 'assets/flap.wav'); //飞翔的音效
                    game.load.audio('score_sound', 'assets/score.wav'); //得分的音效
                    game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞击管道的音效
                    game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效

                    //加载字体
                    game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt'); //显示分数的字体

                    game.load.image('bg', "assets/images/bg.png");
                    game.load.image('star', "assets/images/star.png");

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

                this.expand = function(...rest) {
                    for (let i = 0; i < rest.length; i++) {
                        rest[i].width *= 2;
                        rest[i].height *= 2;
                    }
                    // image.width *= 2;
                    // image.height *= 2;
                }

                this.create = function() {
                    // 此处写游戏逻辑


                    // 示例-创建背景音乐
                    // self.musicManager.play("bg");
                    // game.input.onDown.add(function() {
                    //     self.musicManager.play("input");
                    // });

                    // 示例-创建游戏背景
                    this.bg = game.add.image(0, 0, "background");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;

                    //创建存放管道的组
                    this.pipeGroup = game.add.group();
                    this.pipeGroup.enableBody = true; //启用物理系统
                    //this.expand(this.pipeGroup);

                    // var bg = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background'); //背景图,这里先不用移动，游戏开始后再动
                    // bg.tileScale.setTo(2, 2);

                    this.ground = game.add.tileSprite(0, game.world.height - 224, game.world.width, 224, 'ground');
                    this.ground.tileScale.setTo(2, 2);
                    game.physics.enable(this.ground, Phaser.Physics.ARCADE); //开启地面的物理系统
                    this.ground.body.immovable = true; //让地面在物理环境中固定不动



                    //鸟的创建、动画播放、及相关设置
                    this.bird = game.add.sprite(50 * 2, 150 * 2, 'bird');
                    this.expand(this.bird);
                    this.bird.animations.add('fly');
                    this.bird.animations.play('fly', 12, true);
                    this.bird.anchor.setTo(0.5, 0.5);
                    this.game.physics.enable(this.bird, Phaser.Physics.ARCADE); //开启鸟的物理系统
                    this.bird.body.gravity.y = 0; //重力为0

                    //场景添加声音
                    this.soundFly = game.add.sound('fly_sound');
                    this.soundScore = game.add.sound('score_sound');
                    this.soundHitPipe = game.add.sound('hit_pipe_sound');
                    this.soundHitGround = game.add.sound('hit_ground_sound');



                    this.readyText = game.add.image(game.width / 2, 40 * 2, 'ready_text'); //get ready 文字
                    this.playTip = game.add.image(game.width / 2, 300 * 2, 'play_tip'); //提示点击屏幕的图片
                    this.expand(this.readyText, this.playTip);

                    this.readyText.anchor.setTo(0.5, 0);
                    this.playTip.anchor.setTo(0.5, 0);

                    this.generateTime = 1400;
                    this.hasStarted = false; //游戏是否已开始
                    game.time.events.loop(this.generateTime, this.generatePipes, this); //利用时钟事件来循环产生管道
                    game.time.events.stop(false); //先不要启动时钟
                    game.input.onDown.addOnce(this.startGame, this); //点击屏幕后正式开始游戏


                    // 示例-创建游戏元素
                    // var star = game.add.sprite(game.world.centerX, game.world.centerY, "star");
                    // star.anchor.setTo(0.5, 0.5);

                    // 示例-创建动画
                    // game.add.tween(star).to({
                    //     y: star.y - 100
                    // }, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);
                };

                this.startGame = function() {
                    //场景添加分数
                    this.scoreText = game.add.bitmapText(game.world.centerX - 20, 30, 'flappy_font', '0', 36);
                    this.expand(this.scoreText);

                    this.gameSpeed = 220;
                    this.gameIsOver = false;
                    this.hasHitGround = false;
                    this.hasHitTop = false;

                    this.hasStarted = true;
                    this.score = 0;

                    this.gap = 250;
                    this.scoreBand = 10;
                    this.lastGapPos = 500;

                    //地面，背景移动
                    //this.bg.autoScroll(-(this.gameSpeed / 10), 0);
                    this.ground.autoScroll(-this.gameSpeed, 0);

                    this.bird.body.gravity.y = 1175; //鸟的重力

                    //去除准备场景的东西
                    this.readyText.destroy();
                    this.playTip.destroy();

                    game.input.onDown.add(this.fly, this); //给鼠标按下事件绑定鸟的飞翔动作
                    game.time.events.start(); //启动时钟事件，开始制造管道
                }

                this.update = function() {
                    // 每一帧更新都会触发
                    if (!this.hasStarted) return; //游戏未开始
                    game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this); //检测与地面的碰撞
                    game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this); //检测与管道的碰撞
                    if (this.bird.y <= 0 + 12) this.hitTop();
                    if (this.bird.angle < 90) this.bird.angle += 2.5; //下降时鸟的头朝下的动画
                    this.pipeGroup.forEachExists(this.checkScore, this); //分数检测和更新

                    //增加游戏难度：每当分数增加超过10的倍数，增加一次难度
                    if (this.score > this.scoreBand) {
                        this.gap -= 10 * 2; //缩短管道间隔
                        this.bird.body.gravity.y += 40; //增加鸟的重力
                        this.scoreBand += 10;
                        this.gameSpeed += 20;

                        this.generateTime -= 20;
                    }
                };

                this.stopGame = function() {
                    //this.bg.stopScroll();
                    this.ground.stopScroll();

                    this.pipeGroup.forEachExists(function(pipe) {
                        pipe.body.velocity.x = 0;
                    }, this);

                    this.bird.animations.stop('fly', 0);
                    game.input.onDown.remove(this.fly, this);
                    game.time.events.stop(true);
                };

                this.fly = function() {
                    this.bird.body.velocity.y = -400 //给鸟向上的速度
                    game.add.tween(this.bird).to({
                        angle: -30
                    }, 100, null, true, 0, 0, false); //上升时头朝上的动画

                    this.soundFly.play();
                }

                this.hitPipe = function() {
                    if (this.gameIsOver) return;
                    this.soundHitPipe.play();
                    this.gameOver();
                }

                this.hitGround = function() {
                    if (this.hasHitGround) return;
                    this.hasHitGround = true;
                    if (!this.gameIsOver) {
                        this.soundHitGround.play();
                    }
                    this.gameOver(true);
                }

                this.hitTop = function() {
                    if (this.hasHitTop) return;
                    this.hasHitTop = true;
                    this.soundHitGround.play();
                    this.gameOver(true);
                }

                this.gameOver = function(show_text) {
                    this.gameIsOver = true;
                    this.stopGame();
                    if (show_text) this.showGameOverText();
                }

                this.generatePipes = function(gap) {
                    gap = this.gap;
                    var position = 0;
                    //var position = (game.world.height - 320 * 2 - gap )+ Math.floor((505 - 112 - 30 - gap  - 505 + 320 + gap ) * 2 * Math.random()); //计算出一个上下管道之间的间隙的随机位置
                    // if (this.scoreBand % 10 === 0) {
                    //     position = this.lastGapPos;
                    // } else {
                    do {
                        position = Math.random() * 320 * 2.5;
                    } while (position - this.lastGapPos > 500);
                    // }

                    this.lastGapPos = position;
                    if (position < 284) {
                        position += 284;
                    }

                    var topPipeY = position - 320 * 2.5; //上方管道的位置
                    var bottomPipeY = position + gap; //下方管道的位置


                    if (this.resetPipe(topPipeY, bottomPipeY)) return; //如果有出了边界的管道，则重置他们，不再制造新的管道了,达到循环利用的目的

                    //生成管道并加入场景
                    var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup); //上方的管道
                    var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup); //下方的管道
                    topPipe.height *= 2.5;
                    topPipe.width *= 2;
                    bottomPipe.height *= 2.5;
                    bottomPipe.width *= 2;
                    this.pipeGroup.setAll('checkWorldBounds', true); //边界检测
                    this.pipeGroup.setAll('outOfBoundsKill', true); //出边界后自动kill
                    this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed); //设置管道运动的速度

                }

                this.resetPipe = function(topPipeY, bottomPipeY) { //重置出了边界的管道，做到回收利用
                    var i = 0;
                    this.pipeGroup.forEachDead(function(pipe) {
                        if (pipe.y <= 0) { //上方管道
                            pipe.reset(game.width, topPipeY);
                            pipe.hasScored = false //重置为未得分
                        } else { //下方管道
                            pipe.reset(game.width, bottomPipeY);
                            // pipe.hasScored = false;
                        }
                        pipe.body.velocity.x = -this.gameSpeed;
                        i++;
                    }, this);
                    return i == 2; //如果 i==2 代表有一组管道已经出了边界，可以回收这组管道了
                }

                this.showGameOverText = function() {
                    this.scoreText.destroy();
                    game.bestScore = game.bestScore || 0;
                    if (this.score > game.bestScore) game.bestScore = this.score; //最好分数
                    this.gameOverGroup = game.add.group(); //添加一个组
                    var gameOverText = this.gameOverGroup.create(game.width / 2, 0, 'game_over'); //game over 文字图片
                    var scoreboard = this.gameOverGroup.create(game.width / 2, 70 * 2, 'score_board'); //分数板
                    var currentScoreText = game.add.bitmapText(game.width / 2 + 60, 105 * 2, 'flappy_font', this.score + '', 20, this.gameOverGroup); //当前分数
                    var bestScoreText = game.add.bitmapText(game.width / 2 + 60, 153 * 2, 'flappy_font', game.bestScore + '', 20, this.gameOverGroup); //最好分数
                    var replayBtn = game.add.button(game.width / 2, 210 * 2, 'btn', function() { //重玩按钮
                        game.state.start('play');
                    }, this, null, null, null, null, this.gameOverGroup);
                    this.expand(gameOverText, scoreboard, currentScoreText, bestScoreText, replayBtn);
                    gameOverText.anchor.setTo(0.5, 0);
                    scoreboard.anchor.setTo(0.5, 0);
                    replayBtn.anchor.setTo(0.5, 0);
                    this.gameOverGroup.y = 30 * 2;

                    console.log(replayBtn.x);
                    console.log(replayBtn.y);
                    game.input.onTap.add(function(e) {
                        console.log('x:' + e.x * 2);
                        console.log('y:' + e.y * 2);
                        if (e.x * 2 >= replayBtn.x - 104 && e.x * 2 <= replayBtn.x + 104 && e.y * 2 >= replayBtn.y + 50 && e.y * 2 <= replayBtn.y + 220) {
                            game.state.start('play');
                        }
                    }, this);
                }

                this.checkScore = function(pipe) { //负责分数的检测和更新,pipe表示待检测的管道
                        //pipe.hasScored 属性用来标识该管道是否已经得过分
                        //pipe.y<0是指一组管道中的上面那个管道，一组管道中我们只需要检测一个就行了
                        //当管道的x坐标 加上管道的宽度小于鸟的x坐标的时候，就表示已经飞过了管道，可以得分了
                        if (!pipe.hasScored && pipe.y <= 0 && pipe.x <= this.bird.x - 17 * 2 - 54 * 2) {
                            pipe.hasScored = true; //标识为已经得过分
                            this.scoreText.text = ++this.score; //更新分数的显示
                            this.soundScore.play(); //得分的音效
                            return true;
                        }
                        return false;
                    }
                    // 游戏结束
                this.gameEnd = function() {
                    game.state.start('end');
                };
            };



            // State - end
            // 游戏结束界面
            game.States.end = function() {
                this.create = function() {
                    self.score = this.score;
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