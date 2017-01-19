# jQuery学习笔记 #

---
## jQuery教程 ##
### jQuery语法 ###
-  通过jQuery可以选取（查询，query）HTML元素，并对他们执行“操作”（action）。
-  语法实例：$(this).hide()
			演示 jQuery hide() 函数，隐藏当前的 HTML 元素。
			$("#test").hide()
			演示 jQuery hide() 函数，隐藏 id="test" 的元素。
			$("p").hide()
			演示 jQuery hide() 函数，隐藏所有 <p> 元素。
- 基本语法：$(selector).action()
### jQuery选择器 ###
- 元素选择器：$("p.intro") 选取所有 class="intro" 的 <p> 元素
- 属性选择器：jQuery 使用 XPath 表达式来选择带有给定属性的元素。例:$("[href$='.jpg']") 选取所有 href 值以 ".jpg" 结尾的元素。
- css选择器：$("p").css("background-color","red");把所有的p元素的背景颜色改为红色
- 实例：$("div#intro .head")	id="intro" 的 <div> 元素中的所有 class="head" 的元素；$("ul li:first")	每个 <ul> 的第一个 <li> 元素
### jQuery事件 ###
- 有ready（	将函数绑定到文档的就绪事件（当文档完成加载时）），click，dbclick等。

---
## jQueryHTML ##
### jQuery尺寸 ###
- jQuery width() 和 height() 方法：不包括内边距（padding），边框（border），外边距（margin）。
- innerWidth() 和 innerHeight() 方法：包括内边距。
- outerWidth() 和 outerHeight() 方法：包括内边距和边框。
- outerWidth(true) 方法返回元素的宽度（包括内边距、边框和外边距）。
```javascript
{	
	//引入jQuery库
	<script type="text/javascript" src="jquery.js"></script>
}
```