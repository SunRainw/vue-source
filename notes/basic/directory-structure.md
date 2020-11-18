# vue源码src目录结构
## vue源码src目录
```
—— compiler       # 编译相关
—— core           # 核心代码
—— platforms      # 不同平台的支持
—— server         # 服务的渲染
—— sfc            # .vue文件解析
—— shared         # 共享代码
```

## compiler
compiler目录包含vue编译相关的代码，编译很耗性能，一般选择在构建时编译，而不选择在构建时。
vue2.0新增了virtualDom，virtualDom的生成实际执行render function，通常是使用template代替render function；而template to render function就是在compiler目录
## core
core目录主要包含了vue的核心代码
### components
主要包括内置组件（如：keep-alive）
### global-api
主要是一些全局API，如：混入mixin，Vue.use， Vue.extends等
### instance
主要包含了渲染的辅助函数，如：事件、初始化、注入、代理、渲染函数、生命周期、状态之类等
### observe
与vue核心响应式数据相关
### util
主要包含各种工具类方法
### vdom
virtualDom的核心代码
## platform
vue是一个跨平台的MVVM框架，可以在web和配合weex在native上运行，可以根据不同的入口打包编译出不同的vuejs
### web
浏览器网站相关程序
### weex
vue推出的类似于react-native的移动端
类似美团开源的mpvue是基于vue的小程序开发框架
## server
vue相关的服务的渲染的内容，即为运行在服务端的Node.js。
服务端渲染主要把组件渲染为服务器端的HTML字符串，直接发送到浏览器，最后将静态标记混合为客户端上完成交互的应用程序
## sfc
将.vue文件内容解析为JavaScript对象
## shared
Vue的一些工具方法，被浏览器端的Vuejs和服务端的Vuejs所共享
## 目录相关小结
根据vuejs的src目录分析，作者将功能模块拆分的非常清晰，相关逻辑放在一个独立的目录下维护，同时将复用的代码抽成单独的目录，如此设计可以增强代码的阅读性和可维护性。


