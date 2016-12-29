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
        velocity: 1400,
        //球放大缩小的比例
        scale: 1,
        //防止多次抛出球
        isBounced: false,
        //用于检测是否重新开始
        restart: false,
        //用于预加载彩带动画
        tieArray: null,

        // 初始化
        init: function() {
            var self = this;
            var restart = this.restart;
            var game = this.game;
            var scale = this.scale;
            var isBounced = this.isBounced;
            var velocity = this.velocity;
            var bestScore = this.bestScore;
            var score = this.score;
            var tieArray = this.tieArray;
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
                    game.load.image('restart', "assets/images/restart.png");

                    game.load.bitmapFont('font', 'assets/fonts/flappyfont.png', 'assets/fonts/flappyfont.fnt');

                };
            };

            // State - create
            // 开始界面
            game.States.create = function() {
                this.create = function() {      
                    game.state.start('play');
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

                    //创建两个得分提示，固定其大小为100 * 100， 并且将其设置为不可见
                    this.oneScore = game.add.image(this.board.x, this.board.y - this.board.height / 2 , 'one_score');
                    this.oneScore.anchor.set(0.5, 1);
                    this.oneScore.width = 100;
                    this.oneScore.height = 100;
                    this.oneScore.visible = false;
                    this.twoScore = game.add.image(this.board.x, this.board.y - this.board.height / 2 , 'two_score');
                    this.twoScore.anchor.set(0.5, 1);
                    this.twoScore.width = 100;
                    this.twoScore.height = 100;
                    this.twoScore.visible = false;

                    //创建篮框
                    this.basket = game.add.image(game.world.centerX, game.world.centerY * 2 / 3, 'basket');
                    this.basket.anchor.set(0.5, 0.5);

                    //用于存放彩带
                    tieArray = new Array(6);
                    for(var i = 1; i <= 3; i++)
                    {
                        tieArray[i - 1] = game.add.sprite(game.world.centerX, game.world.centerY * 2 / 3, 'tie'+i);
                        tieArray[i + 2] = game.add.sprite(game.world.centerX, game.world.centerY * 2 / 3, 'tie'+i);
                    }
                    for(var i = 0; i < 6; i++)
                    {
                        tieArray[i].visible = false;
                        tieArray[i].anchor.set(0.5, 0.5);
                        game.physics.enable(tieArray[i], Phaser.Physics.ARCADE);
                    }    
                    
                    //创建影子
                    this.bottom = game.add.sprite(game.world.centerX, game.world.height - 50, 'bottom');
                    this.bottom.anchor.set(0.5, 0.5);
                    this.bottom.height *= 2;
                    this.bottom.width *= 2;
                    //保存影子的原始尺寸
                    this.bottomHeight = this.bottom.height;
                    this.bottomWidth = this.bottom.width;

                    //创建用于检测的左右端点
                    this.left = game.add.sprite(this.basket.x - this.basket.width / 2, this.basket.y - this.basket.height / 2, 'left', 0, this.group);
                    this.left.anchor.set(1, 0);
                    game.physics.enable(this.left, Phaser.Physics.ARCADE);
                    this.left.body.immovable = true;
                    this.right = game.add.sprite(this.basket.x + this.basket.width / 2, this.basket.y - this.basket.height / 2, 'right', 0, this.group);
                    this.right.anchor.set(0, 0);
                    game.physics.enable(this.right, Phaser.Physics.ARCADE);
                    this.right.body.immovable = true;
                    

                    // 创建球
                    this.ballSprite = game.add.sprite(game.world.centerX, game.world.height * 2 / 3, "ball");
                    this.ballSprite.anchor.setTo(0.5, 0.5);
                    //先放大两倍
                    this.ballSprite.width *= (3 / 2);
                    this.ballSprite.height *= (3 / 2);
                    //保存球的原始尺寸;
                    this.ballHeight = this.ballSprite.height;
                    this.ballWidth = this.ballSprite.width;
                    //设置球的坐标
                    this.ballSprite.x = game.world.centerX;
                    this.ballSprite.y = game.world.height - this.ballSprite.height;
                    //为了能够在isUp事件中正常使用ballSprite
                    var ballSprite = this.ballSprite;

                    //画出一个圆
                    //this.graphics = game.add.graphics(this.ball.x, this.ball.y);
                    this.ball = game.add.graphics(this.ballSprite.x, this.ballSprite.y);
                    //this.ball.beginFill(0XFFFFFF);
                    this.ball.anchor.set(0.5, 0.5);
                    // this.graphics.beginFill(0XFFFFFF);
                    this.ball.drawCircle(0, 0, this.ballSprite.height);
                    game.physics.enable(this.ball, Phaser.Physics.ARCADE);
                    this.ball.body.bounce.x = 0.2;
                    this.ball.body.bounce.y = 1;
                    //为了能够在isUp事件中正常使用ball
                    var ball = this.ball;


                    //第一次进入游戏时创建提示
                    if(! restart)
                    {
                        //创建箭头提示
                        var tips = game.add.sprite(this.ballSprite.x, this.ballSprite.y - this.ballSprite.height / 2, 'tips');
                        tips.anchor.set(0.5, 1);

                        //创建绿色箭头
                        var greentips = game.add.sprite(tips.x, tips.y, 'greentips');
                        greentips.anchor.set(0.5, 1);

                        game.time.events.loop(1000, function()
                        {
                            var temp = greentips.y - tips.height / 3;
                            greentips.y = temp<(tips.y-tips.height * 2/3)?tips.y:temp;
                        }, this);
                        game.time.events.start();

                        //创建手指
                        var finger = game.add.sprite(this.ballSprite.x + this.ballSprite.width, this.ballSprite.y - this.ballSprite.height / 2, 'finger');
                        finger.anchor.set(1, 1);

                        //创建手指滑动的动画
                        game.add.tween(finger).to({ y: finger.y - tips.height / 2}, 3000, Phaser.Easing.Linear.None, true, 0, -1, false);
                    }


                    //添加分数条，位置为屏幕之外（先不让分数条出现）
                    this.scoreText = game.add.bitmapText(game.world.width*2, -game.world.height, 'font', ""+score, 36);
                    this.scoreText.anchor.set(0.5, 0.5);
                    var scoreText = this.scoreText;
                    //如果是重新开始，直接显示即可
                    if(restart)
                    {
                        scoreText.x = 50;
                        scoreText.y = 50;
                    }

                    //添加手指滑动事件
                    game.input.onDown.add(function()
                    {
                        if(! restart)
                        {
                            tips.destroy();
                            greentips.destroy();
                            finger.destroy();
                        }

                        //游戏开始时让分数条进入屏幕
                        scoreText.x = 50;
                        scoreText.y = 50;

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
                                        bounce(currentX, currentY, pointer.clientX, pointer.clientY, ball, ballSprite);
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

                };

                this.update = function() {
                    //抛出去的时候开始球大小开始变化
                    if(isBounced)
                    {
                        //要保证下落的时候球不会变化（下落的时候this.star.body.velocity.y>0）
                        //球最小的时候是还没抛出去的时候的一半
                        var velocityOfY =  -this.ball.body.velocity.y> velocity / 2?Math.abs(this.ball.body.velocity.y):(velocity / 2);
                        scale = velocityOfY / velocity;
                        this.ballSprite.height = this.ballHeight * scale;
                        this.ballSprite.width = this.ballWidth * scale;
                        
                        
                        //当球在上升时，影子的y坐标不断减小，其大小不断变小（球上升到最高点时消失）
                        if (this.ball.body.velocity.y < 0) 
                        {
                            //scale变化率先大后小，使用（1-scale）使得影子变化慢一点
                            this.bottom.y -= 1.2;

                            //改变球的大小
                            this.bottom.width = -this.bottomWidth * this.ball.body.velocity.y / velocity;
                            this.bottom.height = -this.bottomHeight * this.ball.body.velocity.y / velocity;
                        }
                        this.bottom.x = this.ball.x;
                    }
                    //需要时刻把球和自定义圆绑定在一起，不应该把这段语句放到上面的if语句里面，
                    //因为当isBounced被置为false的时候，ballSprite和ball的坐标停止绑定
                    this.ballSprite.x = this.ball.x;
                    this.ballSprite.y = this.ball.y;
                    this.ball.height = this.ballSprite.height;
                    this.ball.width = this.ballSprite.width;

                    //球y方向上的速度>0，说明开始下落
                    if(this.ball.body.velocity.y > 0)
                    {
                        game.physics.arcade.overlap(this.ball, this.left, function(){
                            game.add.tween(this.ballSprite).to({angle: this.ballSprite.angle - 360}, 1000, null, true, 0, 0, false);
                        }, null, this);
                        game.physics.arcade.overlap(this.ball, this.right, function(){
                            game.add.tween(this.ballSprite).to({angle: this.ballSprite.angle - 360}, 1000, null, true, 0, 0, false);
                        }, null, this);
                        game.physics.arcade.collide(this.left, this.ball, function(){
                            if (this.ball.x > this.left.x && !this.hit) 
                            {
                                this.ball.body.velocity.x = -this.ball.body.velocity.x;
                                this.hit = true;
                            }
                        }, null, this);
                        game.physics.arcade.collide(this.right, this.ball, function(){
                            if (this.ball.x < this.right.x && !this.hit) 
                            {
                                this.ball.body.velocity.x = -this.ball.body.velocity.x;
                                this.hit = true;
                            }
                        }, null, this);
                        this.fall();
                    }
                };

                //手指滑动结束之后调用的函数
                this.bounce = function(x1, y1, x2, y2, ball, ballSprite)
                {
                    game.add.tween(ballSprite).to({angle: ballSprite.angle - 360}, 1000, null, true, 0, 0, false);

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
                    
                    if(this.ball.x < 0 || this.ball.x > game.world.width || this.ball.y > game.world.height)
                    {
                        //如果得分就重置
                        if(this.isScored)
                            this.reset();
                        //没有得分
                        else
                        {
                            //球出界且分数为0的时候重置
                            if(score == 0)
                                this.reset();
                            //球出界或者没进篮框且分数不为0的时候重置，并且转换到结束场景
                            else
                                {
                                    this.reset();
                                    game.state.start('end');
                                }
                        }
                    }
                    
                }

                //空心进球时播放彩带动画
                this.shot = function()
                {
                     for(var i = 0; i < 6; i++)
                    {
                        tieArray[i].visible = true;
                        tieArray[i].body.gravity.y = 200;
                        tieArray[i].body.velocity.y = - Math.random() * 200 - 150;
                        if(i % 2 == 0)
                        {
                            tieArray[i].body.velocity.x = Math.random() * 200 + 100;
                        }
                        else
                        {
                            tieArray[i].body.velocity.x = -Math.random() * 200 - 100;
                        }
                    }    
                    //设置定时器，三秒后所有彩带消失
                    game.time.events.add(3000, function()
                    {
                        for(var i = 0; i < 6; i++)
                        {
                            tieArray[i].visible = false;
                            tieArray[i].body.gravity.y = 0;
                            tieArray[i].body.velocity.y = tieArray[i].body.velocity.x = 0;
                            tieArray[i].x = game.world.centerX;
                            tieArray[i].y = game.world.centerY * 2 / 3;
                        }
                    }, this);

                    game.time.events.start();
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
                                game.add.tween(this.twoScore).to({y: this.twoScore.y - 100}, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);
                                //无碰撞从篮框落下
                                this.shot();
                            }
                            else //普通得分
                            {
                                isBounced = false;
                                score ++;
                                this.scoreText.text = score;
                                this.oneScore.visible = true;

                                game.add.tween(this.oneScore).to({y: this.oneScore.y - 100}, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);
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
                    //恢复得分提示的坐标
                    this.twoScore.y = this.board.y - this.board.height / 2;
                    this.oneScore.y = this.board.y - this.board.height / 2;
                    
                    //复原影子的状态
                    this.bottom.x = game.world.centerX;
                    this.bottom.y = game.world.height - 50;
                    this.bottom.height *= 2;
                    this.bottom.width *= 2;
                    
                    //复原球的图片
                    this.ballSprite.x = game.world.centerX;
                    this.ballSprite.y = game.world.height - this.ballHeight;
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

                    //判断是否打破纪录
                    if(bestScore < score)
                    {
                        this.break = true;

                        bestScore = score;
                        //此处播放动画
                        this.recordText = game.add.image(game.world.centerX, 0, 'new');
                        this.recordText.anchor.set(0.5, 1); 
                        game.add.tween(this.recordText).to({y: this.recordText.y + game.world.centerY}, 1500, Phaser.Easing.Bounce.Out,true, 0, 0, false);
                        
                        var button;

                        //添加旋转的属性
                        for(var i = 0; i < 15; i++)
                        {
                            arr[i] = game.add.sprite(game.world.centerX, game.world.centerY, 'star');
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
                                var end = game.add.image(game.world.centerX, game.world.centerY - 100, 'end');
                                end.anchor.set(0.5, 0.5);

                                button = game.add.image(game.world.centerX, game.world.centerY, 'restart');
                                button.anchor.set(0.5, 0.5);
                            }, this);
                        //开启定时器
                        game.time.events.start();
                    }
                    if(!this.break)
                    {
                        var end = game.add.image(game.world.centerX, game.world.centerY -100, 'end');
                        end.anchor.set(0.5, 0.5);

                        button = game.add.image(game.world.centerX, game.world.centerY, 'restart');
                        button.anchor.set(0.5, 0.5);
                    }

                    game.input.onDown.add(function()
                    {
                        var pointer = game.input.activePointer;
                        if (Math.abs(pointer.clientX - button.x / 2) <= button.width / 2 && Math.abs(pointer.clientY - button.y / 2) <= button.height / 2) 
                        {
                            restart = true;
                            score = 0;
                            game.state.start('create');
                        }
                    }, this);
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
