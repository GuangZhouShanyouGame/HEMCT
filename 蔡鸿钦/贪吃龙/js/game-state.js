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
        // game: null,
        // 游戏管理器
        gameManager: null,
        // 音乐管理器
        musicManager: null,
        //游戏当前得分
        score: 0,
        //球放大缩小的比例
        scale: 1,
        //用于检测是否重新开始
        restart: false,
        //龙的长度
        length: 10,
        //龙的速度
        speed: 10,
        //用于各类计数
        count: 0,
        tween: null,

        // 初始化
        init: function() {
            var self = this;
            var g_restart = this.restart;
            var game = this.game;
            var g_scale = this.scale;
            var score = this.score;
            var g_length = this.length;
            var g_speed = this.speed;
            var g_count = this.count;
            var tween = this.tween;
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

                    game.load.image('bg', "assets/images/background.png");
                    game.load.image('head', "assets/images/head.png");
                    game.load.image('body', "assets/images/body.png");
                    game.load.image('tail', "assets/images/tail.png");
                    game.load.image('tea', "assets/images/tea.png");
                    game.load.image('alcohol', "assets/images/alcohol.png");
                    game.load.image('tips', "assets/images/tips.png");
                    game.load.image('end', "assets/images/end.png");
                    game.load.image('knew', "assets/images/knew.png");
                    game.load.image('score',"assets/images/score.png");
                    game.load.image('score_bg',"assets/images/score_bg.png");
                    game.load.image('one_score',"assets/images/one_score.png");
                    game.load.image('button',"assets/images/knew.png")

                    // game.load.audio('bgm', "assets/music/bgm.mp3");
                    // game.load.audio('breakRecord', "assets/music/breakRecord.mp3");
                    // game.load.audio('oneScore', "assets/music/oneScore.mp3");
                    // game.load.audio('twoScore', "assets/music/twoScore.mp3");
                    // game.load.audio('hit', "assets/music/hit.mp3");
                    // game.load.audio('shot', "assets/music/shot.mp3");
                };
            };

            // State - create
            // 开始界面
            game.States.create = function() {
                this.create = function() {
                    // self.bgm = game.add.audio('bgm', 1, true);
                    // self.breakRecord = game.add.audio('breakRecord');
                    // self.oneScore = game.add.audio('oneScore');
                    // self.twoScore = game.add.audio('twoScore');
                    // self.hit = game.add.audio('hit');
                    // self.shot = game.add.audio('shot');
                    // self.bgm.play();
                    game.state.start('play');
                }
            };

            // State - play
            // 游戏界面
            game.States.play = function() {
                var that = this;
                this.create = function() {
                    // 创建游戏背景
                    this.bg = game.add.image(0, 0, "bg");


                    if(! g_restart)
                    {
                        var temp_tips = game.add.image(0, 0, 'tips');

                        var temp_knew = game.add.image(game.world.centerX, game.world.height * 4 / 5, 'knew');
                        temp_knew.anchor.set(0.5, 0.5);
                    }
                    else
                    {
                        //创建龙
                        that.dragon = new Array(g_length);
                        that.dragon[0] = game.add.sprite(game.world.width - 70, game.world.centerY, 'tail');
                        that.dragon[0].anchor.set(0.5, 0.5);
                        for(var i = 1;i < g_length;i++)
                        {
                            that.dragon[i] = game.add.sprite(that.dragon[i - 1].x - that.dragon[i - 1].width, game.world.centerY, 'body');
                            that.dragon[i].anchor.set(0.5, 0.5);
                        }
                        g_speed = that.dragon[1].width;
                        that.moveX = -g_speed;
                        that.moveY = 0;

                        //创建属性
                        that.inflexion = new Array(g_length);
                        that.inflectedRotation = new Array(g_length);
                        for(i = 0; i < g_length; i++)
                        {
                            that.inflexion[i] = false;
                            that.inflectedRotation[i] = 0;
                        }

                        setInterval(this.move, 1000);

                        //添加分数条
                        that.titleGroup = game.add.group();
                        that.scoreBg = game.add.sprite(0,16,"score_bg");
                        that.score = game.add.sprite(-10,16,"score");
                        that.scoreText = game.add.text(that.score.width + 45,50, score+" ", { font: "bold 40pt score", fill: "#FE9400"});
                        that.scoreText.anchor.setTo(0.3,0.5);
                        //添加组的元素
                        that.titleGroup.add(that.scoreBg);
                        that.titleGroup.add(that.score);
                        that.titleGroup.add(that.scoreText);
                        that.titleGroup.x = 50 ;
                        that.titleGroup.y = 50 ;
                    }

                    that.create = false;
                    game.input.onDown.add(function(p)
                    {
                        if(! g_restart && !that.create)
                        {
                            if (Math.abs(p.x - temp_knew.x / 2) <= temp_knew.width / 2 && Math.abs(p.y - temp_knew.y / 2) <= temp_knew.height / 2)
                            {
                                temp_tips.destroy();
                                temp_knew.destroy();

                                that.create = true;

                                //创建龙
                                that.dragon = new Array(5);
                                that.dragon[0] = game.add.sprite(game.width - 70, game.world.centerY, 'tail');
                                that.dragon[0].anchor.set(0.5, 0.5);
                                //顺时针旋转
                                //that.dragon[0].angle = 90;
                                for(var i = 1;i < g_length;i++)
                                {
                                    that.dragon[i] = game.add.sprite(that.dragon[i - 1].x - that.dragon[i - 1].width, game.world.centerY, 'body');
                                    that.dragon[i].anchor.set(0.5, 0.5);
                                }
                                g_speed = that.dragon[1].width;
                                that.moveX = -g_speed;
                                that.moveY = 0;

                                //创建属性
                                that.inflexion = new Array(g_length);
                                that.inflectedRotation = new Array(g_length);
                                for(i = 0; i < g_length; i++)
                                {
                                    that.inflexion[i] = false;
                                    that.inflectedRotation[i] = 0;
                                }

                                setInterval(this.move, 100);

                                //添加分数条
                                that.titleGroup = game.add.group();
                                that.scoreBg = game.add.sprite(0,16,"score_bg");
                                that.score = game.add.sprite(-10,16,"score");
                                that.scoreText = game.add.text(that.score.width + 45,50, score+" ", { font: "bold 40pt score", fill: "#FE9400"});
                                that.scoreText.anchor.setTo(0.3,0.5);
                                //添加组的元素
                                that.titleGroup.add(that.scoreBg);
                                that.titleGroup.add(that.score);
                                that.titleGroup.add(that.scoreText);
                                that.titleGroup.x = 50;
                                that.titleGroup.y = 50;
                           }
                        }

                        var temp_up = false;
                        var temp_turn = false;
                        var temp_currentX = p.x;
                        var temp_currentY = p.y;
                        game.input.addMoveCallback(function()
                        {
                            game.input.onUp.add(function(q)
                            {
                                if(! temp_up)
                                {
                                    //往右
                                    if(temp_currentX < q.x && that.moveX == 0 && !temp_turn)
                                    {
                                        that.moveX = g_speed;
                                        that.moveY = 0;
                                        that.inflexion[g_length - 1] = true;
                                        that.inflectedRotation[g_length - 1] = 180;
                                        temp_turn = true;
                                    }
                                    //往左
                                    if(temp_currentX > q.x && that.moveX == 0 && !temp_turn)
                                    {
                                        that.moveX = -g_speed;
                                        that.moveY = 0;
                                        that.inflexion[g_length - 1] = true;
                                        that.inflectedRotation[g_length - 1] = 0;
                                        temp_turn = true;
                                    }
                                    //往上
                                    if(temp_currentY > q.y && that.moveY == 0 && !temp_turn)
                                    {
                                        that.moveX = 0;
                                        that.moveY = -g_speed;
                                        that.inflexion[g_length - 1] = true;
                                        that.inflectedRotation[g_length - 1] = 90;
                                        temp_turn = true;
                                    }
                                    //往下
                                    if(temp_currentY < q.y && that.moveY == 0 && !temp_turn)
                                    {
                                        that.moveX = 0;
                                        that.moveY = g_speed;
                                        that.inflexion[g_length - 1] = true;
                                        that.inflectedRotation[g_length - 1] = -90;
                                        temp_turn = true;
                                    }   
                                }
                                temp_up = true;
                            });
                        });

                    }, this);

                    
                    // //创建两个得分提示，固定其大小为100 * 100， 并且将其设置为不可见
                    // this.oneScore = game.add.image(this.board.x, this.board.y - this.board.height / 2 , 'one_score');
                    // this.oneScore.anchor.set(0.5, 1);
                    // //固定分数标签的大小
                    // this.oneScore.width = 100;
                    // this.oneScore.height = 100;
                    // this.oneScore.visible = false;
                };

                this.update = function() {
                };


                this.move = function()
                {   
                    for(g_count = 0; g_count < g_length - 1; g_count++)
                    {
                        that.dragon[g_count].x = that.dragon[g_count + 1].x;
                        that.dragon[g_count].y = that.dragon[g_count + 1].y;
                    }
                    for(g_count = g_length - 1; g_count > 0; g_count--)
                    {
                        that.inflectedRotation[g_count - 1] = that.inflectedRotation[g_count];
                        that.dragon[g_count].angle = that.inflectedRotation[g_count];
                    }
                    that.dragon[g_length - 1].x += that.moveX;
                    that.dragon[g_length - 1].y += that.moveY;
                    that.dragon[0].angle = that.inflectedRotation[0];
                }

                //用于增加分数的函数
                this.getScore = function()
                {
                    if(this.ball.y > this.basket.bottom &&
                            (this.ball.x > this.basket.x - this.basket.width / 2) && (this.ball.x < this.basket.x + this.basket.width / 2))
                    {
                        if(!this.isScored)
                        {
                            if(!this.hit)     //空心进球，加两分
                            {
                                //增加分数，并且改变分数标签
                                score += 2;
                                this.scoreText.text = score;
                                //播放得分音效
                                self.twoScore.play();
                                //显示得分标签
                                this.twoScore.visible = true;
                                //让得分提示向上运动
                                game.add.tween(this.twoScore).to({y: this.twoScore.y - 100}, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);
                                //无碰撞从篮框落下
                                //播放彩带动画
                                this.shot();
                            }
                            else //普通得分
                            {
                                //增加分数，并且改变分数标签
                                score ++;
                                this.scoreText.text = score;
                                //播放得分音效
                                self.oneScore.play();
                                //显示得分标签
                                this.oneScore.visible = true;
                                //让得分提示向上运动
                                game.add.tween(this.oneScore).to({y: this.oneScore.y - 100}, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);
                            }
                            //设置得分状态为已得分
                            this.isScored = true;
                        }
                    }
                }

                // 篮球成功入篮，一次投篮结束
                this.reset = function() {
                    //设置定时器，在一秒后执行所有重置操作
                    game.time.events.add(1000, function(){
                        //防止调用太多次reset函数
                        if(!this.hasReseted)
                        {
                            //调用第一次reset函数之后，就无法再调用
                            this.hasReseted = true;

                            //把得分提示设置为不可见
                            this.twoScore.visible = false;
                            this.oneScore.visible = false;
                            //恢复得分提示的坐标
                            this.twoScore.y = this.board.y - this.board.height / 2;
                            this.oneScore.y = this.board.y - this.board.height / 2;

                            //复原影子的状态
                            this.bottom.x = game.world.centerX;
                            this.bottom.y = game.world.height - 50;
                            this.bottom.height = this.bottomHeight;
                            this.bottom.width = this.bottomWidth;

                            //复原球的图片
                            this.ballSprite.x = game.world.centerX;
                            this.ballSprite.y = this.bottom.y - this.ballHeight / 2;
                            this.ballSprite.width = this.ballWidth;
                            this.ballSprite.height = this.ballHeight;

                            //复原球的状态
                            this.ball.body.gravity.y = 0;
                            this.ball.body.velocity.x = 0;
                            this.ball.body.velocity.y = 0;
                            this.ball.width = this.ballWidth;
                            this.ball.height = this.ballHeight;
                            this.ball.x = this.ballSprite.x;
                            this.ball.y = this.ballSprite.y;
                            this.ballSprite.bringToTop();

                            //复原各类状态
                            isBounced = false;
                            this.isScored = false;
                            this.hit = false;
                            this.change = false;
                            this.hasChanged = false;
                        }
                    }, this);
                    //开启定时器
                    game.time.events.start();
                };
            };



            // State - end
            // 游戏结束界面
            game.States.end = function() {
                this.create = function() {

                    this.bg = game.add.image(0, 0, "bg");

                    var temp_button;

                    var temp_end = game.add.image(game.world.centerX, 0, 'end');
                    temp_end.anchor.set(0.5, 1);
                    temp_end.add.tween(temp_end).to({y: temp_end.y + game.world.centerY}, 1500, Phaser.Easing.Bounce.Out,true, 0, 0, false)

                    //设置定时器，四秒后关闭
                    game.time.events.add(1500, function(){
                        temp_button = game.add.image(game.world.centerX, game.world.height * 4 / 5, 'knew');
                        temp_button.anchor.set(0.5, 0.5);

                        game.input.onDown.add(function(p)
                        {
                            if (Math.abs(p.x - temp_button.x / 2) <= temp_button.width / 2 && Math.abs(p.y - temp_button.y / 2) <= temp_button.height / 2)
                            {
                                g_restart = true;
                                score = 0;
                                game.state.start('play');
                            }
                        }, this);
                    }, this);
                    //不需开启定时器，会自动开始
                    //game.time.events.start();
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
