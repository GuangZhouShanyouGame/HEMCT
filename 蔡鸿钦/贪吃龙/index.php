<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no,maximum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
    <meta content="black" name="apple-mobile-web-app-status-bar-style">
    <meta content="yes" name="apple-mobile-web-app-capable">
    <meta content="telephone=no, email=no" name="format-detection">
    <!-- 引用平台样式 -->
    <link rel="stylesheet" href="http://24haowan-cdn.shanyougame.com/24haowan/css/t/layout.css">
    <title>贪吃龙</title>
    <!--引入外部字体-->
    <!--<script src="http://24haowan-cdn.shanyougame.com/public/js/vconsole.min.js"></script>-->
    <style type="text/css">
    html, body {
        padding: 0px;
        margin: 0px;
    }
    @font-face {
        font-family: 'score';
        src: url('assets/fonts/score.otf');
    }

    #dragon{
        font-family: 'score';
        height: 0;
        width: 0;
        overflow: hidden;
    }
    </style>
    <!-- 引入公共头部 -->
    <?php include("modules/head.php") ?>
</head>
<body>
    <div id="dragon">12</div>
    <div class="game-tpl-container">
        <!-- 贪吃龙 分数类 Phaser -->
        <?php require_once('main.php'); ?>
        <div id="game_div"></div>
        <script src="/static_resource/public/js/phaser.min.js"></script>
        <script type="text/javascript" src="/static_resource/js/main.js?v=<?php echo Yii::app()->params['version']; ?>"></script>
    </div>
</body>
</html>