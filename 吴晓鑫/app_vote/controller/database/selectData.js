const AV = require('../../libs/av-weapp-min.js');

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
    var query = new AV.Query('TodoTheme');
        
    // query.greaterThanOrEqualTo('createdAt', yesterday);

    query.select(['theme_count', 'theme_name']);

    return query.descending('theme_count').find().then(function (todo) {
        return todo;
    }, function (error) {
        // 异常处理
        console.error(error);
    });
}




module.exports = {
    querytheme:querytheme,

}