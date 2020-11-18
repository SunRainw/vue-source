# vue源码的构建
## vue的package.json
<strong style="color:skyblue">main:</strong> npm包的入口，import的时候会通过main去查找入口

<strong style="color:skyblue">module:</strong> webpack2.0以上将module作为默认入口

<strong style="color:skyblue">script:</strong> 定义了很多脚本，每个脚本都是一个任务，源码在src目录下，通过构建生成的代码在dist下

## 构建过程
build通过nodejs执行node scripts/build.js
1. 在script/build.js中，通过调取config中的getAllBuilds方法获取所有的配置，然后通过判断进行过滤，最后通build方法进行构建
2. 在script/config.js中，创建了builds对象，不同的属性值代表不同的vuejs编译配置，entry代表入口，dest代表目标，format代表构建出来的文件格式，entry和dest通过alias.js提供的真实文件映射对于相应的真实地址，通过config.js的getAllBuilds方法遍历builds对象，调用genConfig方法，将bulids装换为rollup打包需要的config结构属性
3. 最后在build.js中调用buildEntry方法进行rollup打包，最后在dist目标目录下生成对于的vuejs
## Runtime Only VS Runtime+Compiler
### Runtime Only
在使用时Runtime Only版本的Vue.js时，通常在编译阶段做处理，将如用webpack的vue-load工具将.vue文件编译成JAvaScript，减少运行时间，也会使代码体积更加轻量
### Runtime+Compiler
如果没有预编译，则需要在客户端运行时进行编译

```
// 需要编译器的版本(Runtime+Compiler)
new Vue({
  template: '<div>{{ hi }}</div>'
})

// 这种情况不需要(Runtime Only)
// <template></template>与下例相同，因为在编译阶段会将template转换为render function
new Vue({
  render (h) {
    return h('div', this.hi)
  }
})
```

## 总结
基本清晰了build构建过程，以及runtime版本选取，实际开发中尽量选取Runtime Only版本开发，可以加快运行速度，减小代码体积

