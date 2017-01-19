const leancloud = require("./controller/database/connect.js");
// 初始化连接leanCloud
leancloud.init();              

const user = leancloud.AV.User.current();

var getUserInfo = ()=>{
    return new Promise(function(resolve,reject){
        leancloud.AV.User.loginWithWeapp().then(user => {
          // console.log(user)
          wx.getUserInfo({
            success: function(userInfo){
              // 更新当前用户的信息
              user.set(userInfo).save().then(user => {
                // 成功，此时可在控制台中看到更新后的用户信息
                // console.log(user.id)
                resolve( user.id )
              }).catch(console.error);
            },
            fail: function(err) {
              reject(err);
            }
          })
        }).catch(console.error);

    })
}
// app.js
App({
    onLaunch: ()=>{
      
    },
    getuserMsg: ()=>{
        return getUserInfo().then( (userMsg)=>{
            
            return userMsg;
        }).catch((err)=>{
            console.error(err);
        })
    },
    globalData:{
      user:{
        user_id:""
      },
      AV:leancloud.AV
    }
})

