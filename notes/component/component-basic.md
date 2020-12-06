# 组件化
## 组件化简介
组件化即将页面拆分成多个组件，每个组件依赖的CSS、JavaScript、模板、图片等资源放在一起维护。组件是资源独立的，组件在系统内部可复用，组件和组件之间可以嵌套。
## createComponent
createComponent最后生成了一个vnode，这个vnode是一个tag使用vue-component特别标识，没有children，具有componentOptions的vnode
### vue.extend
- 传入一个对象，返回一个构造函数，通过构造一个子类构造器，将其继承父类Vue，将自身的options和Vue的options合并，然后将Vue的extend，mixin，use等属性赋值给该Sub子类，将该子类通过cachedCtors[SuperId]缓存起来，当调用Vue.extend时，如果SuperId相同就判断是否有缓存的构造器，避免多次重新构造初始化。这样就可以在多个组件在调用一个组件时，避免多次初始化。
## 组件patch
- 组件patch就是 createComponent => 子组件初始化 => 子组件render => 子组件patch， 通过递归这个过程，直到没有子组件为止
- activeInstance为当前激活的vm实例，会作为传入子组件当做子组件的parent实例，
- vm.$node为组件的占位vnode(即类似为<App />)，vm._node为组件的渲染vnode，即整个组件node
- 嵌套组件的插入顺序是先子后父，即insert，完成组件的DOM插入
## 配置合并
- 外部调用场景下的合并配置是通过mergeOption，并遵循一定的合并策略。
    * 1. 生命周期合并：对于生命周期钩子选项，子类和父类相同的选项将合并成数组，这样在执行子类钩子函数时，父类钩子选项也会执行，并且父会优先于子执行。
    * 2. data的合并：将父类的数据整合到子类的数据中，如果子类和父类冲突，就保留子类的数据。
        * 疑问：为什么Vue组件的data是一个function而不是一个对象？组件的设计师为了复用，而每次通过函数创建相当于一个独立的内存空间中生成一个data的副本，这样每个组件之间的数据不会互相影响。
    * 3. watch合并：对于watch选项的合并，最终和父类选项合并成数组，并且数组的选项成员，可以是回调函数，选项对象，或者函数名。
    * 4. props.methods,inject,computed的合并：如果父类不存在选项，则返回子类选项，子类父类都存在时，用子类选项去覆盖父类选项。
- 组件合并是通过initInternalComponent，它的合并更快。
- 框架、库的设计都是类似，自身定义了默认配置，同时可以在初始化阶段传入配置，然后merge配置，来达到定制化不同需求的目的。
## 生命周期
- beforeMounted: beforeMounted是根据mountComponent来执行，而这是根据patch的顺序而来，所以是先执行父组件的beforeMounted后执行子组件的beforeMounted。
- mounted：mounted的执行顺序是在节点插入时执行，由于插入节点时是先子后父的顺序所以是子组件先执行mounted，父组件后执行。
- beforeUpdate：每次nextTick时会执行flushSchedulerQueue，这时会执行beforeUpdate
- updated: 在callUpdatedHooks中，根据判断是否为渲染watcher且执行过mounted后，并且数据发生变化，执行updated
## 组件注册
- 全局注册的组件可以在任意地方使用，而局部注册的组件只能在当前组件内使用（原因：全局注册是网Vue.options上扩展，而局部注册是往Sub.options上扩展）
- 通常组件库中的基础组件建议全局注册，而业务组件建议局部注册
- 局部注册添加的是一个子组件的配置对象，而全局注册添加的是一个子类构造器
## 异步组件
异步组件的实现方式有3种，工厂函数、promise和高阶函数。
- 1. 工厂函数：在createComponent时判断组件是否为普通的object，如果不是则是异步组件，调用resolveAsyncComponent方法，构造异步组件的resolve和reject方法(为防止当多个地方调用异步组件时，resolve和reject不会重复执行，once函数保证了函数在代码中只执行一次)，最后返回undefined，当ctor为undefined时，就创建一个注释节点，当改组件patch时，调用就不再是异步组件就因此会正常走组件的render,patch过程。这时，旧的注释节点也会被取代。
- 2. promise函数：即在工厂函数中返回一个promise对象，如：es6的import方法就是一个异步方法，而require是一个同步方法，可以用import返回一个promise对象。
```
Vue.component('asyncComponent', () => import('./test.vue'))
```
- 3. 高级异步组件：即使用loading组件处理组件加载时间过长的等待问题，使用error组件处理加载组件失败的错误提示等。
```
Vue.component('asyncComponent', () => ({
  // 需要加载的组件 (应该是一个 `Promise` 对象)
  component: import('./MyComponent.vue'),
  // 异步组件加载时使用的组件
  loading: LoadingComponent,
  // 加载失败时使用的组件
  error: ErrorComponent,
  // 展示加载时组件的延时时间。默认值是 200 (毫秒)
  delay: 200,
  // 如果提供了超时时间且组件加载也超时了，
  // 则使用加载失败时使用的组件。默认值是：`Infinity`
  timeout: 3000
}))
```