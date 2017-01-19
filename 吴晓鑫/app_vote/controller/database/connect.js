/*
* 初始化leanCloud sdk,建立连接
*/
const AV = require('../../libs/av-weapp-min.js');
const config = require("./config.js");

// 初始化leanCloud
function init(){
    AV.init({
        appId: config.appId, 
        appKey: config.appKey, 
    })
}



module.exports = {
    AV:AV,
    init:init
};