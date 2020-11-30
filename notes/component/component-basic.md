# 组件化
## 组件化简介
组件化即将页面拆分成多个组件，每个组件依赖的CSS、JavaScript、模板、图片等资源放在一起维护。组件是资源独立的，组件在系统内部可复用，组件和组件之间可以嵌套。
## createComponent
### vue.extend
- 传入一个对象，返回一个构造函数，通过构造一个子类构造器，将其继承父类Vue，将自身的options和Vue的options合并，然后将Vue的extend，mixin，use等属性赋值给该Sub子类，将该子类通过cachedCtors[SuperId]缓存起来，当调用Vue.extend时，如果SuperId相同就判断是否有缓存的构造器，避免多次重新构造初始化。这样就可以在多个组件在调用一个组件时，避免多次初始化。