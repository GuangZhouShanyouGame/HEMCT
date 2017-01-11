const leancloud = require("./controller/database/connect.js");
// 初始化连接leanCloud
leancloud.init();
// const insert =  require("./controller/database/insert.js");
// // // leancloud.expandTheme("你好").then(function(id){
// // //   console.log(id);
// // // });
// // console.log(insert)
// insert.expandItem("你好","58744bdb61ff4b006d4fa2df").then(function(id){
//   console.log(id);
// });
//  var startDateQuery = new leancloud.AV.Query('TodoTheme');
//   startDateQuery.greaterThanOrEqualTo('createdAt', new Date('2016-11-13 00:00:00')).find().then(function(re){
//     console.log(re)
//   });



var getUserInfo = ()=>{
    return new Promise(function(resolve,reject){
        wx.login({
          success: function(res){
            wx.getUserInfo({
              success: function(res){
                resolve(res.userInfo)
              },
              fail: function(err) {
                reject("wx.getUserInfo_err:",err);
              }
            })
          },
          fail: function(err) {
            reject("wx.logion_err:",err);
          }
        })
    })
}
// app.js
App({
    onLaunch: ()=>{
        
    },

    getuserMsg: ()=>{
        getUserInfo().then( (userMsg)=>{
            console.log(userMsg);
        }).catch((title,err)=>{
            console.error(title,err);
        })
    }
})

