var obj = {};
/**
 * 功能：比较time1 和 time2 是否为相差一天
 * param：time1,time2： Date对象
 */
obj.compareTime = function(time1,time2){
    var oneday = 86400000;
    var day = (time1.getTime() - time2.getTime()) / oneday;
    // console.log(time1.getTime(), time2);
    // console.log(day);
    return (0<=day && day<=2);
}

/**
 * 功能：获取时间
 * 参数：count：0为今天，正整数向前推，负整数向后推推
 * return：返回Date 对象。
 */
obj.getDateStr = function(count)
{
    var date = new Date();
    date.setDate(date.getDate() + count);
    var year = date.getFullYear();
    var month = date.getMonth() ;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes= date.getMinutes();
    return new Date(year,month,day,hours,minutes)
}

module.exports = obj;