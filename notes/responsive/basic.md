# 响应式原理
## 响应式对象
### Object.defineProperty
Object.defineProperty方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回这个对象
```JavaScript
Object.defineProperty(obj, prop, descriptor)
```
obj 是要在其定义属性的对象；prop是要定义或修改的属性的名称；descriptor是将定义或修改的属性描述符。
可以简单的认为一个对象如果拥有了getter和setter，就可以简单地称为响应式对象。
### 流程
在initstate时，会通过observe方法将data、props中的数据添加getter和setter变成响应式对象。
在初次observe时，会通过new Observer创建一个ob实例，在Observer中，会通过def这个封装的Object.defineProperty为value设置__ob__属性，同时将__ob__设置为不可枚举。再判断value是不是数据，如果是数据就循环value的值进行observe，如果是对象，就通过walk方法通过defineReactive，如果value的子属性还是对象，就再次执行observe方法。然后对value设置getter和setter将其变为响应式对象。
在这个过程中，会如果value是对象，且它的子属性也是对象，会先给其子属性设置为响应式对象，再对value设置为响应式对象。
## 依赖收集(触发getter)
- 在触发getter时会将当前的watcher收集起来作为一个订阅者，订阅数据变化的watcher的收集即为依赖收集
- 依赖收集的目的是为了当这些响应式数据发送变化，触发它们的setter的时候，能知道应该通知那些订阅者去做相应的逻辑处理
## 派发更新
对于渲染watcher，触发setter后执行dep.notify()函数，然后对订阅者集合排序后遍历执行watcher的update函数，经过判断后执行queueWatcher，判断当前watcher对于的id在不在queue队列中，不在就将has对象的相应id设置为true，如果flushing为false就将当前watcher push到queue中，然后执行flushSchedulerQueue函数，将flushing置为true，循环执行watcher.run在run的过程中会用this.get算出新的值，然后对比新旧值如果不一样就将新值改变并调用回调函数(对于渲染watcher就是调用updateComponent重新渲染过程)
- 派发更新就是当数据发生变化后，通知所有订阅者了这个数据变化的watcher执行update
- 派发更新的过程中会把所有要执行update的watcher推入到队列中，在nextTick后执行flush。
- 注意：当一个userWatcher(开发者自己定义的watch)中又改变了当前watch监听绑定的值(且该值每次监听后都会做不同的改变)就会再次执行setter，将当前的watch再次push到queue队列中造成死循环。

## nextTick
- nextTick是把要执行的任务推入到一个队列中，在下一个tick同步执行
- 数据改变后触发渲染watcher的update，但是watchers的flush是在nextTick后，所以重新渲染是异步的
## computed(计算属性)
### 依赖收集
- computed的初始化过程，会遍历computed的每一个属性，并为每一个属性实例化一个computed watcher，其中{lazy: true}是computed watcher的标志，最终会调用defineComputed将数据设置为响应式数据。(在vue.extends的过程中会调用initComputed执行defineComputed将数据设置为响应式数据，所以会在组件初始化时判断属性已经在vm中存在)
- 在非服务端渲染的情形，计算属性的计算结果会被缓存，缓存的意义在于，只有在相关响应式数据发生变化时，computed才会重新求值，其余情况多次访问计算属性的值都会返回之前计算的结果，这就是缓存的优化，computed属性有两种写法，一种是函数，另一种是对象，其中对象的写法需要提供getter和setter方法。
- 列举一个场景避免和data的处理脱节，computed在计算阶段，如果访问到data数据的属性值，会触发data数据的getter方法进行依赖收集，根据前面分析，<span style="color: red;">data的Dep收集器会将当前watcher作为依赖进行收集订阅，而这个watcher就是computed watcher</span>，并且会为当前的watcher添加访问的数据Dep
### 派发更新
- 当计算属性依赖的数据发生更新时，由于数据的Dep收集过computed watch这个依赖，所以会调用dep的notify方法，对依赖进行状态更新。
- 此时computed watcher和之前介绍的watcher不同，它不会立刻执行依赖的更新操作，而是通过一个dirty进行标记。我们再回头看依赖更新的代码。

由于lazy属性的存在，update过程不会执行状态更新的操作，只会将dirty标记为true。
- 由于data数据拥有渲染watcher这个依赖，所以同时会执行updateComponent进行视图重新渲染,而render过程中会访问到计算属性,此时由于this.dirty值为true,又会对计算属性重新求值。