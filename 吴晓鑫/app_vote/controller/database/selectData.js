const AV = require('../../libs/av-weapp-min.js');
const Model = require("../../model/model.js");
const timeHandle = require("../timeUtil/timeHandle.js");
const insert = require("./insert.js");
// const co = require("../../libs/co.js");

/*
* 功能：查询主题的内容
* return：promise，调用then，里面就有todo数组，存放主题内容
*/
function querytheme(){
    // 应该在昨天到今天
    // var now = new Date(),
    //     // yesterday = getDateStr(-1),
    //     yesterday = new Date(getDateStr(-1)),
    //     startDateQuery = new AV.Query('TodoTheme');
    // startDateQuery.greaterThanOrEqualTo('createdAt', yesterday);

    // var endDateQuery = new AV.Query('TodoTheme');
    // endDateQuery.lessThan('createdAt', now);

    // var query = AV.Query.and(startDateQuery,endDateQuery);
    // query.greaterThanOrEqualTo('createdAt', yesterday);
    var query = new AV.Query('TodoTheme');
    query.select(['theme_count', 'theme_name']);

    return query.descending('theme_count').find().then(function (todo) {
        return todo;
    }, function (error) {
        // 异常处理
        console.error(error);
    });
}
/*
* 功能：更新统计24H内投票情况
*/
function updateThemeCount(){
    var querytheme = new AV.Query('TodoTheme');
    // 查找所有的主题
    return querytheme.find().then(res=>{
        // 统计所有主题的投票情况
        return allthemeCount(res).then(res_count=>{
            var newR = res.map(function(item,index){
                item.set("theme_count",res_count[index]);
                return item;
            })
            return AV.Object.saveAll(newR);
        })
    })
}
/*
* 功能：统计所有主题的投票情况
* 参数：arr：AV.object对象数组。
* return：promise数组。投票统计情况
*/
function allthemeCount(arr){
    var all_arr = arr.map(function(item){
        return themeCount(item.id);
    })
    return Promise.all(all_arr).then(res=>{
        return res;
    }).catch(err=>{
        console.error(err)
    })
}

/*
* 功能：统计单个主题的投票情况
* 参数：theme_id：主题id
* return：promise，投票情况
*/
function themeCount(theme_id){
    var query = new AV.Query('UserItem');
    var yesterday = timeHandle.getDateStr(-1);
    // console.log(yesterday);
    query.greaterThanOrEqualTo('updatedAt', yesterday);
    query.equalTo('ischoose', true);
    query.equalTo('theme_id', theme_id);
    return query.count().then(function (count) {
        //  console.log(count);
        return count;
    }, function (error) {
    });    
}
/*
* 功能：查询某个主题的所有选项情况
*（先获取所有的item_id,然后通过item_id和user_id这两个候选码获取当前用户的投票情况，然后通过item_id，user_id，theme_id获取当前24H每个的投票情况）
* 参数：theme_id：主题id，user_id：当前用户的id
* return ：promise（objArray：model数组）
*/
function queryitem(theme_id,user_id){
  // 带有占位符的 cql 语句
  var cql = "select * from TodoItem where theme_id='"+theme_id+"' order by item_count desc limit 10";
  return AV.Query.doCloudQuery(cql).then(function (data) {
      // results 即为查询结果，它是一个 AV.Object 数组，存放着某个主题的所有选项情况
        var results = data.results;
        // console.log(results);
        if(results.length == 0){
            return [];
        }
        // 查询用户 点赞情况。
        return all(results,user_id).then(res=>{
            // var addNoArray = addNo(res,results,user_id,theme_id);
            // console.log(addNoArray)
            var objArray = [];  // 存放model数组,最后的返回数组
            // 遍历存放model
            objArray = res.map(function(item,index){
                var result_item = results[index];
                if( item.length != 0 ){
                    // model，组成我们试图所需要的内容字段。查看model.js文件
                    var temp = new Model.itemModel(result_item.get("item_name"),item[0].get("ischoose"),result_item.get("item_count"),result_item.id,item[0].id);
                    // objArray.push(temp);
                }else{
                    var temp = {i:index};
                    // objArray.push(temp);
                 }
                 return temp;
            })
            // console.log(objArray);
            // 添加当前用户没有关联的选项
            return addNo(res,results,user_id,theme_id).then(function(add_new){
                // console.log(add_new);
                objArray.forEach(function(item,index){
                    if( Array.isArray(item) ){
                    }else{
                        objArray[item.i] = add_new.shift();
                    }
                });
                // 统计24H内的计算量
                return allcount(results).then(count_res=>{
                    console.log(count_res,objArray)
                    objArray = count_res.map(function(item,index){
                        objArray[index].item_count = item;
                        return objArray[index];
                    })
                    // console.log(objArray)
                    return objArray;
                })
            })
        }).catch(err=>{
            console.error(err);
        })
  }, function (error) {
      console.error(err)
  });    
}
// 递归调用promise数组。
function zhixing(all_arr,result){
    var temp = all_arr.shift();
    // console.log(all_arr,temp);
    return temp.then(res=>{
        result.push(res);
        // console.log(res);
        if(all_arr.length == 0){
            // console.log(result)
            return result;
        }else{
            return zhixing(all_arr,result);
        }
    })
}
// 新增于当前用户没有关联的选项
function addNo(arr,itemArray,user_id,theme_id){
    var noArray = [];
    arr.forEach(function(item,index){
        var result_item = itemArray[index];
        if(item.length != 0){
            
        }else{
            var temp = insert.expandUserItem(result_item.id,user_id,false,theme_id).then(function(addUItem){
                var temp = new Model.itemModel(result_item.get("item_name"),false,result_item.get("item_count"),result_item.id,addUItem);
                return temp;
            }) 
            noArray.push(temp);
        }
    })
    console.log(noArray);
    if(noArray.length == 0){
        return new Promise(function(resolve, reject) { 
            resolve([])
         });
    }
    return zhixing(noArray,[])
    // return noitem;
}
// 获取用户所有的选项情况
function all(arr,user_id){
    var all_arr = arr.map(function(item){
        return queryChoose(item.id,user_id);
    })
    return zhixing(all_arr,[]);
    // return all_arr;
    // console.log(all_arr);
}
// 获取所有选项的投票情况
function allcount(arr){
    var all_arr = arr.map(function(item){
        return count(item.id);
    })
    return zhixing(all_arr,[]);
    // console.log(all_arr);
    // return all_arr;
}

// 获取单个用户的选项情况
function queryChoose(item_id,user_id){
    var cql = "select * from UserItem where item_id='"+item_id+"' and user_id='"+user_id+"'";
    return AV.Query.doCloudQuery(cql).then(function (data) {
        // results 即为查询结果，它是一个 AV.Object 数组
        var results = data.results;
        // if(results.length==0){
        //     return false;
        // }else{
        //     return results[0].get("ischoose");
        // }
        return results;
    }, function (error) {
    });    
}
// 获取单个选项的投票情况
function count(item_id){
    var query = new AV.Query('UserItem');
    var yesterday = timeHandle.getDateStr(-1);
    // console.log(yesterday);
    query.greaterThanOrEqualTo('updatedAt', yesterday);
    query.equalTo('ischoose', true);
    query.equalTo('item_id', item_id);
    return query.count().then(function (count) {
        //  console.log(count);
        return count;
    }, function (error) {
    });
    // return query;
    // console.log(query)
}
    // var todo = AV.Object.createWithoutData('TodoTheme', '587d65bc128fe1006b082139');
    // var todo2 = AV.Object.createWithoutData('TodoTheme', '587c8b86570c352201064bb6');
    // var arr = [todo,todo2]
    // console.log(arr);
    // AV.Object.fetchAll(arr).then(function (objects) {
    //     console.log("111")
    //     console.log(objects);
    //     // 成功
    // }, function (error) {
    //     // 异常处理
    // });

module.exports = {
    querytheme:querytheme,
    queryitem:queryitem,
    updateThemeCount:updateThemeCount
}