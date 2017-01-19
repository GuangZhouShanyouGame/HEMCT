const AV = require('../../libs/av-weapp-min.js');
var obj = {}
// var user_id = wx.getStorageSync('user_id');
/*
* 功能：更新选项选择情况。
* param：ischoosee：布尔类型  ,id:投票情况的id
*/
obj.updateIschoose = function (ischoose,id){
 // 执行 CQL 语句实现更新一个 TodoFolder 对象
  AV.Query.doCloudQuery("update UserItem set ischoose="+ischoose+" where objectId='"+id+"'")
  .then(function (data) {
    // data 中的 results 是本次查询返回的结果，AV.Object 实例列表
    var results = data.results;
    // console.log(data)
  }, function (error) {
    // 异常处理
    console.error(error);
  });
}

module.exports = obj;