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
        // 游戏最高得分
        bestScore: 1,
        //游戏当前得分
        score: 9,
        //球抛出的固定速度
        velocity: 2500 / 604 * window.innerHeight,
        //球放大缩小的比例
        scale: 1,
        //设置球的重力
        gravity: 3800 / 604 * window.innerHeight,
        //防止多次抛出球
        isBounced: false,
        //用于检测是否重新开始
        restart: false,
        //用于控制篮框的移动
        gameSpeed: 0,
        //用于操作篮球旋转动画
        tween: null,

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
            var gameSpeed = this.gameSpeed;
            var tween = this.tween;
            var gravity = this.gravity;
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
                    game.load.image('finger', "assets/images/finger.png");
                    game.load.image('tips', "assets/images/tips.png");
                    game.load.image('greentips', "assets/images/greentips.png");
                    game.load.image('new', "assets/images/new.png");
                    game.load.image('star', "assets/images/star.png");
                    game.load.image('end', "assets/images/end.png");
                    game.load.image('restart', "assets/images/restart.png");
                    game.load.image('score',"assets/images/score.png");
                    game.load.image('score_bg',"assets/images/score_bg.png");

                    game.load.audio('bgm', "assets/music/bgm.mp3");
                    game.load.audio('lose', "assets/music/lose.mp3");
                    game.load.audio('oneScore', "assets/music/oneScore.mp3");
                    game.load.audio('twoScore', "assets/music/twoScore.mp3");
                    game.load.audio('hit', "assets/music/hit.mp3");
                    game.load.audio('shot', "assets/music/shot.mp3");
                };
            };

            // State - create
            // 开始界面
            game.States.create = function() {
                this.create = function() { 
                    self.bgm = game.add.audio('bgm', 1, true);
                    self.oneScore = game.add.audio('oneScore');
                    self.twoScore = game.add.audio('twoScore');
                    self.hit = game.add.audio('hit');
                    self.shot = game.add.audio('shot');
                    self.lose = game.add.audio('lose');
                    self.bgm.play();
                    game.state.start('play');
                }
            };

            // State - play
            // 游戏界面
            game.States.play = function() {
                this.create = function() {
                    //用于适配
                    var t;

                    // 创建游戏背景
                    this.bg = game.add.image(0, 0, "bg");
                    this.bg.width = game.world.width;
                    this.bg.height = game.world.height;


                    //创建篮板
                    this.board = game.add.sprite(game.world.centerX, game.world.centerY / 2, 'board');
                    this.board.anchor.set(0.5, 0.5);
                    if(this.board.width > this.board.height)
                    {
                        t = this.board.height / this.board.width;
                        this.board.width = 260;
                        this.board.height = this.board.width * t;
                    }
                    else
                    {
                        t = this.board.width / this.board.height;
                        this.board.height = 195;
                        this.board.width = this.board.height * t;
                    }
                    //固定篮板的尺寸
                    this.board.width *= window.innerHeight / 604;
                    this.board.height *= window.innerHeight / 604;
                    //开始篮板的物理系统
                    game.physics.enable(this.board, Phaser.Physics.ARCADE);

                    //创建篮框
                    this.basket = game.add.sprite(game.world.centerX, game.world.centerY * 2 / 3, 'basket');
                    this.basket.anchor.set(0.5, 0.3);
                    //固定篮框的大小
                    this.basket.width = 195 / 604 * window.innerHeight;
                    this.basket.height = 130 / 604 * window.innerHeight;
                    //开启篮框的物理系统
                    game.physics.enable(this.basket, Phaser.Physics.ARCADE);

                    
                    //创建影子
                    this.bottom = game.add.sprite(game.world.centerX, game.world.height - 50, 'bottom');    
                    this.bottom.anchor.set(0.5, 0.5);
                    this.bottom.height *= (3 / 2) / 604 * window.innerHeight;;
                    this.bottom.width *= (3 / 2) / 604 * window.innerHeight;;
                    //保存影子的原始尺寸
                    this.bottomHeight = this.bottom.height;
                    this.bottomWidth = this.bottom.width;

                    //创建用于检测的左端点，并将其设置为不可见
                    this.left = game.add.sprite(this.basket.x - this.basket.width / 2, this.basket.y - this.basket.height * 0.3, 'left');
                    this.left.anchor.set(1, 0);
                    //固定左端点的大小
                    this.left.width = this.left.height = 10 / 604 * window.innerHeight;
                    game.physics.enable(this.left, Phaser.Physics.ARCADE);
                    this.left.body.immovable = true;
                    //创建用于检测的左端点，并将其设置为不可见
                    this.right = game.add.sprite(this.basket.x + this.basket.width / 2, this.basket.y - this.basket.height * 0.3, 'right');
                    this.right.anchor.set(0, 0);
                    //固定右端点的大小
                    this.right.width = this.right.height = 10 / 604 * window.innerHeight;
                    game.physics.enable(this.right, Phaser.Physics.ARCADE);
                    this.right.body.immovable = true;


                    //把this.basket放到this.group的上面
                    this.bg.bringToTop();
                    this.board.bringToTop();
                    this.basket.bringToTop();
                    this.bottom.bringToTop();


                    // 创建球
                    this.ballSprite = game.add.sprite(game.world.centerX, game.world.height * 2 / 3, "ball");
                    this.ballSprite.anchor.setTo(0.5, 0.5);
                    //适配
                    if(this.ballSprite.width > this.ballSprite.height)
                    {
                        t = this.ballSprite.height / this.ballSprite.width;
                        this.ballSprite.width = 147;
                        this.ballSprite.height = t * this.ballSprite.width;
                    }
                    else
                    {
                        s = this.ballSprite.width / this.ballSprite.height;
                        this.ballSprite.height = 147;
                        this.ballSprite.width = this.ballSprite.height * s;
                    }

                    //先放大两倍
                    this.ballSprite.width *= (3 / 2) / 604 * window.innerHeight;
                    this.ballSprite.height *= (3 / 2) / 604 * window.innerHeight;

                    //保存球的原始尺寸;
                    //在上升时缩小球和重置的时候需要用到
                    this.ballHeight = this.ballSprite.height;
                    this.ballWidth = this.ballSprite.width;
                    //设置球的坐标
                    this.ballSprite.x = game.world.centerX;
                    this.ballSprite.y = this.bottom.y - this.ballSprite.height / 2;
                    //为了能够在isUp事件中正常使用ballSprite
                    var ballSprite = this.ballSprite;

                    //画出一个圆
                    this.ball = game.add.graphics(this.ballSprite.x, this.ballSprite.y);
                    this.ball.anchor.set(0.5, 0.5);
                    //this.ball.beginFill(0XFFFFFF);
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


                    //创建两个得分提示，固定其大小为100 * 100， 并且将其设置为不可见
                    this.oneScore = game.add.text(this.board.x, this.board.y - this.board.height / 2 , '+1 ', {font: "bold 60px score", fill: "#FE9400"});
                    this.oneScore.anchor.set(0.5, 1);
                    //固定分数标签的大小
                    this.oneScore.width = 100 / 604 * window.innerHeight;
                    this.oneScore.height = 100 / 604 * window.innerHeight;
                    this.oneScore.visible = false;

                    this.twoScore = game.add.text(this.board.x, this.board.y - this.board.height / 2, '+2 ', {font: "bold 60px score", fill: "#FE9400"});
                    this.twoScore.anchor.set(0.5, 1);
                    //固定分数标签的大小
                    this.twoScore.width = 100 / 604 * window.innerHeight;
                    this.twoScore.height = 100 / 604 * window.innerHeight;
                    this.twoScore.visible = false;

                    //添加分数条
                    this.titleGroup = game.add.group();
                    this.scoreBg = game.add.sprite(0,16,"score_bg");
                    this.score = game.add.sprite(-10,16,"score");
                    this.scoreText = game.add.text(this.scoreBg.width / 2,50, score+" ", {font: "bold 50px score", fill: "#FE9400"});
                    this.scoreText.text = score + " ";
                    this.scoreText.anchor.setTo(0.3,0.5);
                    //添加组的元素
                    this.titleGroup.add(this.scoreBg);
                    this.titleGroup.add(this.score);
                    this.titleGroup.add(this.scoreText);
                    this.titleGroup.width = this.titleGroup.width / 604 * window.innerHeight;
                    this.titleGroup.height = this.titleGroup.height / 604 * window.innerHeight;
                    this.titleGroup.x = 50 / 604 * window.innerHeight;
                    this.titleGroup.y = 50 / 604 * window.innerHeight;
                    //先不让分数框出现
                    this.titleGroup.visible = false;
                    var titleGroup = this.titleGroup;


                    //如果是从end场景跳转过来，直接显示分数框
                    if(restart)
                    {
                        titleGroup.visible = true;
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
                        titleGroup.visible = true;

                        //判断其是否在滑动
                        var isUp = false;
                        var pointer = game.input.activePointer;
                        var currentX = pointer.clientX;
                        var currentY = pointer.clientY;

                        game.input.addMoveCallback(function()
                        {
                            game.input.onUp.add(function()
                            {
                                //有时候点击球会出现球只旋转不抛出去的情况
                                if( ((currentX - ballSprite.x / 2)*(currentX - ballSprite.x / 2) + (currentY - ballSprite.y / 2)*(currentY - ballSprite.y / 2))
                                     < (ballSprite.width * ballSprite.width / 4) && 
                                     ((pointer.clientX - ballSprite.x / 2)*(pointer.clientX - ballSprite.x / 2) + (pointer.clientY - ballSprite.y / 2)*(pointer.clientY - ballSprite.y / 2))
                                     > (ballSprite.width * ballSprite.width / 4))
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
                                }
                            });
                        }); 
                    }); 


                    //用来防止在改变速度方向的时候多次改变
                    this.change = false;
                    //用来标记是否已经改变过方向了
                    this.hasChanged = false;
                    //用来标记是否已经碰撞过了
                    this.hit = false;
                    //用于防止下落时多次得分；
                    this.isScored = false;
                    //为了在onUp里面能够正常使用this.bounce;
                    var bounce = this.bounce;
                };

                this.update = function() {
                    //console.log(this.ball.body.velocity.y);

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
                        //若球碰撞，也会上升，此时不应该让影子出现
                        if (this.ball.body.velocity.y < 0 && !this.hit) 
                        {
                            //影子的上升速率应该恒定
                            this.bottom.y -= 1.2;

                            //影子的大小随着球的改变而改变，最后消失
                            this.bottom.width = -this.bottomWidth * this.ball.body.velocity.y / velocity;
                            this.bottom.height = -this.bottomHeight * this.ball.body.velocity.y / velocity;
                        }
                        //让影子跟着球运动
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
                        //使用overlap来给球和左右端点碰撞的时候添加旋转效果
                        //自定义碰撞函数
                        game.physics.arcade.overlap(this.ball, this.left, function(){
                            game.add.tween(this.ballSprite).to({angle: this.ballSprite.angle - 360}, 1000, null, true, 0, 0, false);
                            this.hit = true;
                            self.hit.play();
                            //用于计算碰撞后球的速度
                            var leng = Math.sqrt((this.ball.x - this.left.x) * (this.ball.x - this.left.x) 
                                + (this.ball.y - this.left.y) * (this.ball.y - this.left.y));
                            var veloc = this.ball.body.velocity.y;
                            //碰撞的时候，x方向上的速度和y方向上的速度减少50，模拟能量损失
                            veloc = veloc - 70 / 604 * window.innerHeight<200/ 604 * window.innerHeight?
                                200 / 604 * window.innerHeight:veloc - 70 / 604 * window.innerHeight;

                            this.ball.body.velocity.x = veloc * (this.ball.x - this.left.x) / leng;
                            //这里为了增加碰撞后的入篮率，将碰撞后x方向上的速度设置为最少30 / 604 * window.innerHeight，30这个参数可变
                            var x = Math.abs(this.ball.x - this.left.x) < 30 / 604 * window.innerHeight?
                                (this.ball.x - this.left.x) / Math.abs(this.ball.x - this.left.x) * 30 / 604 * window.innerHeight:this.ball.x - this.left.x;
                            this.ball.body.velocity.x = veloc * x / leng;
                            this.ball.body.velocity.y = veloc * (this.ball.y - this.left.y) / leng;
                        }, null, this);

                        game.physics.arcade.overlap(this.ball, this.right, function(){
                            game.add.tween(this.ballSprite).to({angle: this.ballSprite.angle - 360}, 1000, null, true, 0, 0, false);
                            this.hit = true;
                            self.hit.play();
                            //用于计算碰撞后球的速度
                            var leng = Math.sqrt((this.ball.x - this.right.x) * (this.ball.x - this.right.x) 
                                + (this.ball.y - this.right.y) * (this.ball.y - this.right.y));
                            var veloc = this.ball.body.velocity.y;
                            //碰撞的时候，x方向上的速度和y方向上的速度减少50，模拟能量损失
                            veloc = veloc - 70 / 604 * window.innerHeight<200/ 604 * window.innerHeight?
                                200 / 604 * window.innerHeight:veloc - 70 / 604 * window.innerHeight;

                            this.ball.body.velocity.x = veloc * (this.ball.x - this.right.x) / leng;
                            //这里为了增加碰撞后的入篮率，将碰撞后x方向上的速度设置为最少30 / 604 * window.innerHeight，30这个参数可变
                            var x = Math.abs(this.ball.x - this.right.x) < 30 / 604 * window.innerHeight?
                                (this.ball.x - this.right.x) / Math.abs(this.ball.x - this.right.x) * 30 / 604 * window.innerHeight:this.ball.x - this.right.x;
                            this.ball.body.velocity.x = veloc * x / leng;
                            this.ball.body.velocity.y = veloc * (this.ball.y - this.right.y) / leng;
                        }, null, this);

                        this.fall();
                    }


                    //在开始游戏的时候开始移动
                    if(this.titleGroup.visible)
                    {
                        if(! this.hasChanged)
                        {
                            gameSpeed = Math.floor(score / 10);
                            this.board.body.velocity.x = gameSpeed*50;
                            this.basket.body.velocity.x = gameSpeed*50;
                            this.left.body.velocity.x = gameSpeed*50;
                            this.right.body.velocity.x = gameSpeed*50;
                        }
                        if(this.board.left <= 0 && !this.change)
                        {
                            gameSpeed = Math.floor(score / 10);
                            this.board.body.velocity.x = gameSpeed*50;
                            this.basket.body.velocity.x = gameSpeed*50;
                            this.left.body.velocity.x = gameSpeed*50;
                            this.right.body.velocity.x = gameSpeed*50;
                            this.change = true;
                            this.hasChanged = true;
                        }
                        if(this.board.right >= game.world.width && !this.change)
                        {
                            gameSpeed = -Math.floor(score / 10);
                            this.board.body.velocity.x = gameSpeed*50;
                            this.basket.body.velocity.x = gameSpeed*50;
                            this.left.body.velocity.x = gameSpeed*50;
                            this.right.body.velocity.x = gameSpeed*50;
                            this.change = true;
                            this.hasChanged = true;
                        }
                        if (this.board.left > 0 && this.board.right < game.world.width) 
                        {
                            this.change = false;
                        }
                    }
                    
                };

                //手指滑动结束之后调用的函数
                this.bounce = function(x1, y1, x2, y2, ball, ballSprite)
                {
                    //滑动手指结束之后再给球添加重力和速度
                    
                    ball.body.gravity.y = gravity;
                    var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
                    //计算出抛出去的角度，根据角度来设置左右方向上的速度
                    var rateX = (x2 - x1) / length / 2;
                    var rateY = (y2 - y1) / length;
                    //在这里设置左右方向的速度
                    //velocity是球的固定速度
                    ball.body.velocity.x = velocity * rateX;
                    ball.body.velocity.y = velocity * rateY;
                    if(-ball.body.velocity.y < 2420 / 604 * window.innerHeight)
                    {
                        ball.body.velocity.y = -2420;
                    }

                    tween = game.add.tween(ballSprite);
                    tween.to({angle: ballSprite.angle - 360}, 1000, null, true, 0, -1, false);

                    self.shot.play();
                }

                //球下落时调用的函数
                //在这里，this.score()不可以使用？
                this.fall = function()
                {
                    //把球放到篮框的下层
                    this.basket.bringToTop();
                    
                    //重置，让reset函数可以正常被调用
                    this.hasReseted = false;
                    this.getScore();
                    
                    //空心进球，让+2出现并向上运动
                    if(this.isScored && !this.hit)
                    {
                        this.twoScore.y -= 5 / 6 / 604 * window.innerHeight;
                    }
                    //碰撞进球，让+1出现并向上运动
                    if(this.isScored && this.hit)
                    {
                        this.oneScore.y -= 5 / 6 / 604 * window.innerHeight;
                    }

                    //判断条件
                    if(this.ball.right < 0 || this.ball.left > game.world.width || this.ball.top > game.world.height)
                    {
                        tween.stop();
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
                                    //在进入end的场景的时候，必须先重置所有状态
                                    //但是reset要延时一秒之后才可以重置所有状态，所以这里如果使用reset，会因为无法及时重置所有状态导致
                                    //在end场景跳转会play场景的时候发生错误
                                    //this.resetRightNow就是一个没有延时的this.reset函数
                                    this.resetRightNow();
                                    game.state.start('end');
                                }
                        }
                    }
                        
                }

                //空心进球时播放彩带动画
                this.shot = function()
                {
                    //用于保存星星
                    var arr = new Array(15);
                    //添加旋转的属性
                    for(var i = 0; i < 15; i++)
                    {
                        arr[i] = game.add.sprite(this.basket.x, this.basket.y, 'star');
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
                            arr[i].body.velocity.x = Math.random() * 300 / 604 * window.innerHeight;
                            arr[i].body.velocity.y = -Math.random() * 300 / 604 * window.innerHeight;
                        }
                        else
                        {
                            arr[i].body.velocity.x = -Math.random() * 300 / 604 * window.innerHeight;
                            arr[i].body.velocity.y = -Math.random() * 300 / 604 * window.innerHeight;
                        }
                    }

                    //设置定时器，四秒后关闭
                    game.time.events.add(2500, function(){
                            for(var i = 0; i < 15; i++)
                            {
                                if(arr[i] != null)
                                    arr[i].destroy();
                            }
                        }, this);
                    //开启定时器
                    game.time.events.start();
                }

                //用于增加分数的函数
                this.getScore = function()
                {
                    if(this.ball.top > this.basket.top && 
                            (this.ball.x > this.basket.x - this.basket.width / 2) && (this.ball.x < this.basket.x + this.basket.width / 2))
                    {
                        if(!this.isScored)
                        {
                            if(!this.hit)     //空心进球，加两分
                            {
                                //增加分数，并且改变分数标签
                                score += 2;
                                this.scoreText.text = score+" ";
                                //播放得分音效
                                self.twoScore.play();
                                //显示得分标签
                                this.twoScore.visible = true;
                                //无碰撞从篮框落下
                                //播放彩带动画
                                this.shot();
                            }
                            else //普通得分
                            {
                                //增加分数，并且改变分数标签
                                score ++;
                                this.scoreText.text = score+" ";
                                //播放得分音效
                                self.oneScore.play();
                                //显示得分标签
                                this.oneScore.visible = true;
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
                            this.bottom.y = game.world.height - 50;
                            this.bottom.height = this.bottomHeight;
                            this.bottom.width = this.bottomWidth;

                            //复原球的图片
                            this.ballSprite.x = (game.world.width - this.ballWidth) * Math.random() + this.ballWidth / 2;
                            this.ballSprite.y = this.bottom.y - this.ballHeight / 2;
                            this.ballSprite.width = this.ballWidth;
                            this.ballSprite.height = this.ballHeight;

                            //复原影子的状态
                            this.bottom.x = this.ballSprite.x;
                            

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
                        }
                    }, this);
                    //开启定时器
                    game.time.events.start();
                };


                this.resetRightNow = function()
                {
                    isBounced = false;
                    //把得分提示设置为不可见
                    this.twoScore.visible = false;
                    this.oneScore.visible = false;
                    //恢复得分提示的坐标
                    this.twoScore.y = this.board.y - this.board.height / 2;
                    this.oneScore.y = this.board.y - this.board.height / 2;
                    console.log(this.oneScore.y, this.twoScore.y);
                    
                    //复原影子的状态
                    this.bottom.x = game.world.centerX;
                    this.bottom.y = game.world.height - 50;
                    this.bottom.height = this.bottomHeight;
                    this.bottom.width = this.bottomWidth;
                    
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
                    this.isScored = false;
                    this.hit = false;
                    this.change = false;
                    this.hasChanged = false;
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
                    this.board = game.add.sprite(game.world.centerX, game.world.centerY / 2, 'board');
                    this.board.anchor.set(0.5, 0.5);
                    if(this.board.width > this.board.height)
                    {
                        t = this.board.height / this.board.width;
                        this.board.width = 260;
                        this.board.height = this.board.width * t;
                    }
                    else
                    {
                        t = this.board.width / this.board.height;
                        this.board.height = 195;
                        this.board.width = this.board.height * t;
                    }
                    //固定篮板的尺寸
                    this.board.width *= window.innerHeight / 604;
                    this.board.height *= window.innerHeight / 604;

                    //创建篮框
                    this.basket = game.add.sprite(game.world.centerX, game.world.centerY * 2 / 3, 'basket');
                    this.basket.anchor.set(0.5, 0.3);
                    this.basket.width = 195 / 604 * window.innerHeight;
                    this.basket.height = 130 / 604 * window.innerHeight;

                    //创建影子
                    this.bottom = game.add.sprite(game.world.centerX, game.world.height - 50, 'bottom');
                    this.bottom.anchor.set(0.5, 0.5);
                    this.bottom.height *= (3 / 2) / 604 * window.innerHeight;
                    this.bottom.width *= (3 / 2) / 604 * window.innerHeight;


                    // 创建球
                    this.ballSprite = game.add.sprite(game.world.centerX, game.world.height * 2 / 3, "ball");
                    this.ballSprite.anchor.setTo(0.5, 0.5);
                    //先放大两倍
                    this.ballSprite.width *= (3 / 2) / 604 * window.innerHeight;
                    this.ballSprite.height *= (3 / 2) / 604 * window.innerHeight;
                    //设置球的坐标
                    this.ballSprite.x = game.world.centerX;
                    this.ballSprite.y = this.bottom.y - this.ballSprite.height / 2;

                    self.lose.play();

                    //判断是否打破纪录
                    if(bestScore < score)
                    {
                        this.break = true;

                        bestScore = score;
                        
                        var button;

                        var end = game.add.image(game.world.centerX, game.world.centerY -100, 'end');
                        end.anchor.set(0.5, 0.5);
                        end.y = - end.height;
                        game.add.tween(end).to({y: end.y + game.world.height / 2}, 1500, Phaser.Easing.Bounce.Out,true, 0, 0, false);

                        //设置定时器，四秒后关闭
                        game.time.events.add(4000, function(){
                                button = game.add.image(game.world.centerX, game.world.centerY, 'restart');
                                button.anchor.set(0.5, 0.5);

                                game.input.onDown.add(function()
                                {
                                    var pointer = game.input.activePointer;
                                    if (Math.abs(pointer.clientX - button.x / 2) <= button.width / 2 && Math.abs(pointer.clientY - button.y / 2) <= button.height / 2) 
                                    {
                                        restart = true;
                                        score = 0;
                                        game.state.start('play');
                                    }
                                }, this);
                            }, this);
                        //开启定时器
                        game.time.events.start();
                    }
                    if(!this.break)
                    {
                        var end = game.add.image(game.world.centerX, game.world.centerY -100, 'end');
                        end.anchor.set(0.5, 0.5);
                        end.y = - end.height;
                        game.add.tween(end).to({y: end.y + game.world.height / 2}, 1500, Phaser.Easing.Bounce.Out,true, 0, 0, false);

                        button = game.add.image(game.world.centerX, game.world.centerY, 'restart');
                        button.anchor.set(0.5, 0.5);

                        //不能把点击事件添加在外面，不然在打破纪录的时候，
                        //因为要在4秒后才会添加button，提前点击会导致bug
                        game.input.onDown.add(function()
                        {
                            var pointer = game.input.activePointer;
                            if (Math.abs(pointer.clientX - button.x / 2) <= button.width / 2 && Math.abs(pointer.clientY - button.y / 2) <= button.height / 2) 
                            {
                                restart = true;
                                score = 0;
                                game.state.start('play');
                            }
                        }, this);
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
