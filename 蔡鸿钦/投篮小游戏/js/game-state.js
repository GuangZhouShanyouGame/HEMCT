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
        // 游戏最高得分
        bestScore: 1,
        //游戏当前得分
        score: 0,
        //球抛出的固定速度
        velocity: 1200,
        //球放大缩小的比例
        scale: 1,
        //防止多次抛出球
        isBounced: false,
        tie1: null,
        tie2: null,
        tie3: null,

        // 初始化
        init: function() {
            var self = this;
            var game = this.game;
            var scale = this.scale;
            var isBounced = this.isBounced;
            var velocity = this.velocity;
            var bestScore = this.bestScore;
            var score = this.score;
            var tie1 = this.tie1;
            var tie2 = this.tie2;
            var tie3 = this.tie3;
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
                    game.load.image('ball', "assets/images/ball.png");
                    game.load.image('board', "assets/images/board.png");
                    game.load.image('basket', "assets/images/basket.png");
                    game.load.image('left', "assets/images/left.png");
                    game.load.image('right', "assets/images/right.png");
                    game.load.image('bottom', "assets/images/bottom.png");
                    game.load.image('one_score', "assets/images/one_score.png");
                    game.load.image('two_score', "assets/images/two_score.png");
                    game.load.image('finger', "assets/images/finger.png");
                    game.load.image('tips', "assets/images/tips.png");
                    game.load.image('greentips', "assets/images/greentips.png");
                    game.load.image('new', "assets/images/new.png");
                    game.load.image('tie1', "assets/images/tie1.png");
                    game.load.image('tie2', "assets/images/tie2.png");
                    game.load.image('tie3', "assets/images/tie3.png");
                    game.load.image('star', "assets/images/star.png");
                    game.load.image('end', "assets/images/end.png");

                    game.load.bitmapFont('font', 'assets/fonts/flappyfont.png', 'assets/fonts/flappyfont.fnt');

                };
            };

            // State - create
            // 开始界面
            game.States.create = function() {
                this.create = function() {            
                    this.bg = game.add.image(0, 0, "bg");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;

                    //创建篮板
                    this.board = game.add.image(game.world.centerX, game.world.centerY / 2 - 50, 'board');
                    this.board.anchor.set(0.5, 0.5);

                    //创建篮框
                    this.basket = game.add.image(game.world.centerX, game.world.centerY * 2 / 3, 'basket');
                    this.basket.anchor.set(0.5, 0.5);
                    //创建左边的端点
                    this.left = game.add.sprite(this.basket.x - this.basket.width / 2, this.basket.y - this.basket.height / 2, 'left', 0, this.group);
                    this.left.anchor.set(1, 0);
                    //创建右端点
                    this.right = game.add.sprite(this.basket.x + this.basket.width / 2, this.basket.y - this.basket.height / 2, 'right', 0, this.group);
                    this.right.anchor.set(0, 0);

                    // 创建球
                    this.ball = game.add.sprite(game.world.centerX, game.world.height * 2 / 3, "ball");
                    this.ball.anchor.setTo(0.5, 0.5);
                    this.ball.width *= 2;
                    this.ball.height *= 2;

                    //创建影子
                    this.bottom = game.add.sprite(game.world.centerX, game.world.height - 50, 'bottom');
                    this.bottom.anchor.set(0.5, 0.5);
                    this.bottom.height *= 2;
                    this.bottom.width *= 2;

                    //创建箭头提示
                    this.tips = game.add.sprite(this.ball.x, this.ball.y - this.ball.height / 2, 'tips');
                    this.tips.anchor.set(0.5, 1);

                    //创建绿色箭头
                    this.greentips = game.add.sprite(this.tips.x, this.tips.y, 'greentips');
                    this.greentips.anchor.set(0.5, 1);

                    game.time.events.loop(1000, function()
                    {
                        var temp = this.greentips.y - this.tips.height / 3;
                        this.greentips.y = temp<(this.tips.y-this.tips.height * 2/3)?this.tips.y:temp;
                    }, this);
                    game.time.events.start();

                    //创建手指
                    this.finger = game.add.sprite(this.ball.x + this.ball.width, this.ball.y - this.ball.height / 2, 'finger');
                    this.finger.anchor.set(1, 1);

                    game.add.tween(this.finger).to({ y: this.finger.y - this.tips.height / 2}, 3000, Phaser.Easing.Linear.None, true, 0, -1, false);

                    game.input.onDown.add(function()
                    {
                        game.state.start('play');
                    });
                }
            };

            // State - play
            // 游戏界面
            game.States.play = function() {
                this.create = function() {

                    //为了在onUp里面能够正常使用this.bounce;
                    var bounce = this.bounce;
                    
                    //用于判断球下落的时候有没有碰撞过篮框
                    this.hit = false;

                    //用于防止下落时多次得分；
                    this.isScored = false;


                    // 创建游戏背景
                    this.bg = game.add.image(0, 0, "bg");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;

                    //创建篮板
                    this.board = game.add.image(game.world.centerX, game.world.centerY / 2 - 50, 'board');
                    this.board.anchor.set(0.5, 0.5);

                    //创建两个得分提示，并且将其设置为不可见
                    this.oneScore = game.add.image(this.board.x, this.board.y - this.board.height / 2 , 'one_score');
                    this.oneScore.anchor.set(0.5, 1);
                    this.oneScore.visible = false;
                    this.twoScore = game.add.image(this.board.x, this.board.y - this.board.height / 2 , 'two_score');
                    this.twoScore.anchor.set(0.5, 1);
                    this.twoScore.visible = false;

                    //创建篮框
                    this.basket = game.add.image(game.world.centerX, game.world.centerY * 2 / 3, 'basket');
                    this.basket.anchor.set(0.5, 0.5);

                    
                    //创建用于检测的左右端点
                    this.left = game.add.sprite(this.basket.x - this.basket.width / 2, this.basket.y - this.basket.height / 2, 'left', 0, this.group);
                    this.left.anchor.set(1, 0);
                    game.physics.enable(this.left, Phaser.Physics.ARCADE);
                    //this.left.body.immoveable = true;
                    this.right = game.add.sprite(this.basket.x + this.basket.width / 2, this.basket.y - this.basket.height / 2, 'right', 0, this.group);
                    this.right.anchor.set(0, 0);
                    game.physics.enable(this.right, Phaser.Physics.ARCADE);
                    // this.group.enbaleBody = true;
                    // this.group.immoveable = true;
                    
                    // 创建球
                    this.ball = game.add.sprite(game.world.centerX, game.world.height * 2 / 3, "ball");
                    this.ball.anchor.setTo(0.5, 0.5);
                    game.physics.enable(this.ball, Phaser.Physics.ARCADE);
                    //为了能够在isUp事件中正常使用ball
                    var ball = this.ball;
                    //先放大两倍
                    this.ball.width *= 2;
                    this.ball.height *= 2;
                    //保存球的原始尺寸;
                    this.ballHeight = this.ball.height;
                    this.ballWidth = this.ball.width;

                    //创建影子
                    this.bottom = game.add.sprite(game.world.centerX, game.world.height - 50, 'bottom');
                    this.bottom.anchor.set(0.5, 0.5);
                    this.bottom.height *= 2;
                    this.bottom.width *= 2;
                    //保存影子的原始尺寸
                    this.bottomHeight = this.bottom.height;
                    this.bottomWidth = this.bottom.width;

                    //添加分数条
                    this.scoreText = game.add.bitmapText(game.world.centerX, game.world.centerY, 'font', ""+score, 36);
                    this.scoreText.anchor.set(0.5, 0.5);

                    //添加手指滑动事件
                    game.input.onDown.add(function()
                    {
                        var isUp = false;
                        var pointer = game.input.activePointer;
                        var currentX = pointer.clientX;
                        var currentY = pointer.clientY;

                        game.input.addMoveCallback(function()
                        {
                            game.input.onUp.add(function()
                            {
                                if(!isUp && !isBounced)
                                {
                                    //向下不能够滑动
                                    if(pointer.clientY < currentY)
                                    {
                                        bounce(currentX, currentY, pointer.clientX, pointer.clientY, ball);
                                        isUp = true;
                                        isBounced = true;
                                    }
                                    //球抛出之后就立即删除掉所有事件，用户无法再进行任何操作;
        //为什么这里删除掉所有事件之后，重新开始游戏，无法正常运行？？？
                                    // game.input.destroy();
                                }
                            });
                        }); 
                    }); 

                    //创建得分时出现的彩带
                    tie1 = game.add.sprite(this.basket.x, this.basket.y, 'tie1');
                    tie1.anchor.set(0.5, 0.5);
                    tie1.visible = false;
                    tie2 = game.add.sprite(this.basket.x, this.basket.y, 'tie2');
                    tie2.anchor.set(0.5, 0.5);
                    tie2.visible = false;
                    tie3 = game.add.sprite(this.basket.x, this.basket.y, 'tie3');
                    tie3.anchor.set(0.5, 0.5);
                    tie3.visible = false;
                };

                this.update = function() {

                    //抛出去的时候开始球大小开始变化
                    if(isBounced)
                    {
                        //要保证下落的时候球不会变化（下落的时候this.star.body.velocity.y>0）
                        //球最小的时候是还没抛出去的时候的一半
                        var velocityOfY =  -this.ball.body.velocity.y> velocity / 2?Math.abs(this.ball.body.velocity.y):(velocity / 2);
                        scale = velocityOfY / velocity;
                        this.ball.height = this.ballHeight * scale;
                        this.ball.width = this.ballWidth * scale;
                        this.bottom.width = this.bottomWidth * scale;
                        this.bottom.height = this.bottomHeight * scale;
                        //scale变化率先大后小，使用（1-scale）使得影子变化慢一点
                        this.bottom.y = this.bottom.y> game.world.height - 150?this.bottom.y - 200 * ( 1 - scale):game.world.height - 150; 
                        this.bottom.x = this.ball.x;
                    }

                    if(this.ball.body.velocity.y > 0)
                    {
                        //碰撞函数
                         game.physics.arcade.overlap(this.ball, this.left, function(){
                            var temp = this.ball.x - this.left.x;
                            temp /= 2;
                            if(temp > 0)
                            {
                                this.ball.body.velocity.x = Math.abs(this.ball.body.velocity.x) + temp;
                            }
                            else
                            {
                                this.ball.body.velocity.x = - (Math.abs(this.ball.body.velocity.x) - temp);
                            }
                            this.ball.body.velocity.y = - this.ball.body.velocity.y;
                            this.hit = true;
                         }, null, this);
                         //碰撞函数
                         game.physics.arcade.overlap(this.ball, this.right, function(){
                            var temp = this.ball.x - this.right.x;
                            temp /= 2;
                            if(temp > 0)
                            {
                                this.ball.body.velocity.x = Math.abs(this.ball.body.velocity.x) + temp;
                            }
                            else
                            {
                                this.ball.body.velocity.x = - (Math.abs(this.ball.body.velocity.x) - temp);
                            }
                            this.ball.body.velocity.y = - this.ball.body.velocity.y;
                            this.hit = true;
                         }, null, this);

                        this.fall();
                    }

                    //彩带过了中点时就重置它们的状态
                    if(tie1.y > game.world.centerY)
                    {
                        tie1.visible = tie2.visible = tie3.visible = false;
                        tie1.body.gravity.y =  tie2.body.gravity.y =  tie3.body.gravity.y = 0;
                        tie1.body.velocity.x = tie2.body.velocity.x = tie3.body.velocity.x = 0;
                        tie1.body.velocity.y = tie2.body.velocity.y = tie3.body.velocity.y = 0;
                        tie1.x = tie2.x = tie3.x = this.basket.x;
                        tie1.y = tie2.y = tie3.y = this.basket.y;
                    }
                };

                //手指滑动结束之后调用的函数
                this.bounce = function(x1, y1, x2, y2, ball)
                {
                    //滑动手指结束之后再给球添加重力和速度
                    ball.body.gravity.y = 1000;
                    var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
                    var rateX = (x2 - x1) / length;
                    var rateY = (y2 - y1) / length;
                    ball.body.velocity.x = velocity * rateX;
                    ball.body.velocity.y = velocity * rateY;
                }

                //球下落时调用的函数
                //在这里，this.score()不可以使用？
                this.fall = function()
                {
                    //把球放到篮框的下层
                    this.basket.bringToTop();
                    this.getScore();
                    //球出界且没有得分的时候立即重置
                    if(this.ball.x < 0 || this.ball.x > game.world.width || this.ball.y > game.world.centerY + 100)
                    {
                        if(this.isScored)
                            this.reset();
                        else
                        {
                            if(score == 0)
                                this.reset();
                            else
                                game.state.start('end');
                        }
                    }
                    
                }

                //空心进球时播放彩带动画
                this.shot = function()
                {
                    tie1.visible = true;
                    game.physics.enable(tie1, Phaser.Physics.ARCADE);
                    tie1.body.gravity.y = 200;
                    tie1.body.velocity.x = -(Math.random() + 1) * 100;
                    tie1.body.velocity.y = Math.random() * 50 + 50;

                    tie2.visible = true;
                    game.physics.enable(tie2, Phaser.Physics.ARCADE);
                    tie2.body.gravity.y = 200;
                    tie2.body.velocity.x = (Math.random() + 1) * 200;
                    tie2.body.velocity.y = Math.random() * 50 + 50;

                    tie3.visible = true;
                    game.physics.enable(tie3, Phaser.Physics.ARCADE);
                    tie3.body.gravity.y = 200;
                    tie3.body.velocity.x = (Math.random() + 1) * 200;
                    tie3.body.velocity.y = Math.random() * 50 + 50;

                }

                //用于增加分数的函数
                this.getScore = function()
                {
                    if(this.ball.y > game.world.centerY && 
                            (this.ball.x > this.basket.x - this.basket.width / 2) && (this.ball.x < this.basket.x + this.basket.width / 2))
                    {
                        if(!this.isScored)
                        {
                            if(!this.hit)     //空心进球，加两分
                            {
                                isBounced = false;
                                score += 2;
                                this.scoreText.text = score;
                                this.twoScore.visible = true;

                                this.shot();
                            }
                            else //普通得分
                            {
                                isBounced = false;
                                score ++;
                                this.scoreText.text = score;
                                this.oneScore.visible = true;
                            }
                            this.isScored = true;
                        }
                    }
                }

                // 篮球成功入篮，一次投篮结束
                this.reset = function() {
                    isBounced = false;
                    //把得分提示设置为不可见
                    this.twoScore.visible = false;
                    this.oneScore.visible = false;
                    //复原球的状态
                    this.ball.x = this.ballX;
                    this.ball.y = this.ballY;
                    this.ball.body.gravity.y = 0;
                    this.ball.body.velocity.x = 0;
                    this.ball.body.velocity.y = 0;
                    this.ball.width *= 2;
                    this.ball.height *= 2;
                    this.ball.x = game.world.centerX;
                    this.ball.y = game.world.height * 2 / 3;
                    this.ball.bringToTop();
                    //复原影子的状态
                    this.bottom.x = game.world.centerX;
                    this.bottom.y = game.world.height - 50;
                    this.bottom.height *= 2;
                    this.bottom.width *= 2;
                    
                    //复原各类状态
                    this.oneScore.visible = false;
                    this.twoScore.visible = false;
                    this.isScored = false;
                    this.hit = false;
                };
            };

            // State - end
            // 游戏结束界面
            game.States.end = function() {
                this.create = function() {
                    //用于判断有无打破纪录
                    this.break = false;

                    this.bg = game.add.image(0, 0, "bg");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;

                    //创建篮板
                    this.board = game.add.image(game.world.centerX, game.world.centerY / 2 - 50, 'board');
                    this.board.anchor.set(0.5, 0.5);

                    //创建篮框
                    this.basket = game.add.image(game.world.centerX, game.world.centerY * 2 / 3, 'basket');
                    this.basket.anchor.set(0.5, 0.5);
                    //创建左边的端点
                    this.left = game.add.sprite(this.basket.x - this.basket.width / 2, this.basket.y - this.basket.height / 2, 'left', 0, this.group);
                    this.left.anchor.set(1, 0);
                    //创建右端点
                    this.right = game.add.sprite(this.basket.x + this.basket.width / 2, this.basket.y - this.basket.height / 2, 'right', 0, this.group);
                    this.right.anchor.set(0, 0);

                    // 创建球
                    this.ball = game.add.sprite(game.world.centerX, game.world.height * 2 / 3, "ball");
                    this.ball.anchor.setTo(0.5, 0.5);
                    this.ball.width *= 2;
                    this.ball.height *= 2;
                    //用于保存星星
                    var arr = new Array(15);

                    if(bestScore < score)
                    {
                        this.break = true;

                        bestScore = score;
                        //此处播放动画
                        this.recordText = game.add.image(game.world.centerX, game.world.centerY - 50, 'new');
                        this.recordText.anchor.set(0.5, 1); 
                        game.add.tween(this.recordText).to({y: this.recordText.y + 50}, 1000, Phaser.Easing.Bounce.Out,true, 0, 0, false);
                        
                        //添加旋转的属性
                        for(var i = 0; i < 15; i++)
                        {
                            arr[i] = game.add.sprite(this.recordText.x, this.recordText.y, 'star');
                            arr[i].anchor.set(0.5, 0.5);
                            game.physics.enable(arr[i], Phaser.Physics.ARCADE);
                            game.add.tween(arr[i]).to({angle: arr[i].angle - 360}, 1000, null, true, 0, -1, false);
                        }
                        //添加抛物线运动的属性
                        for(var i = 0; i < 15; i ++)
                        {
                            arr[i].body.gravity.y = 100;
                            if(i % 2 == 0)
                            {
                                arr[i].body.velocity.x = Math.random() * 300;
                                arr[i].body.velocity.y = -Math.random() * 300;
                            }
                            else
                            {
                                arr[i].body.velocity.x = -Math.random() * 300;
                                arr[i].body.velocity.y = -Math.random() * 300;
                            }
                        }
                        //设置定时器，四秒后关闭
                        game.time.events.add(4000, function(){
                                this.recordText.destroy();
                                for(var i = 0; i < 15; i++)
                                {
                                    if(arr[i] != null)
                                        arr[i].destroy();
                                }
                                var end = game.add.image(game.world.centerX, game.world.centerY, 'end');
                                end.anchor.set(0.5, 0.5);
                            }, this);
                        //开启定时器
                        game.time.events.start();
                    }
                    if(!this.break)
                    {
                        var end = game.add.image(game.world.centerX, game.world.centerY, 'end');
                        end.anchor.set(0.5, 0.5);
                    }
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
