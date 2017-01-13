var obj = {}

obj.increate = function (){
  var todo = AV.Object.createWithoutData('Todo', '57328ca079bc44005c2472d0');
  todo.set('views', 0);
  todo.save().then(function (todo) {
    todo.increment('views', 1);
    todo.fetchWhenSave(true);
    return todo.save();
  }).then(function (todo) {
    // 使用了 fetchWhenSave 选项，save 成功之后即可得到最新的 views 值
  }, function (error) {
    // 异常处理
  });
}

module.exports = obj;