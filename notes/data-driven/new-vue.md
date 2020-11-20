# new Vue发生了什么
## 初始化data
1. 调取_init方法进行初始化，在初始化data之前，先初始化props，然后初始化methods，然后才初始化data。
2. 根据判断data的类型为对象还是function做不同的处理。如果是data是function则获取它的返回值，同时判断返回值是否为对象，如果不是对象则抛错，如果data是对象，则获取data。遍历data的key值，与props和methods的属性名和方法名相同就抛错。
3. 用proxy代理函数，将data的每一个key都设置为可枚举属性，描述符配置为可修改，添加getter和setter方法，通过this[key]访问时，就相当于通过getter访问用this._data[key]访问。
## $mount(Vue实例挂载的实现)
$mount对于runtime+compiler版本会在entry-runtime-with-compiler中重新定义，而对于runtime only版本在runtime/index.js中
1. 在compiler版本中的$mount，先暂存一个runtime only版本的$mount作为基类，
2. 然后重新定义一个$mount，对el做处理，判断this.$options中是否具有render方法，如果没有，再判断是否有template属性，如果有template且template为"#id"形式，就调用idToTemplate方法，创建去创建或获取该id的dom节点，如果template为标签，则出去他的innerHTML，如果template如果既不是string也不是标签，则会报错。如果有el则获取整个el的dom，然后进行编译。
3. 调用基类的mount(runtime/index.js)中的$mount方法，该方法其实是调用mountComponent方法(来自instance/lifecycle.js中)，该方法会判断options上是否有render属性，没有就会创建一个空的虚拟节点作为render，在开发环境中，如果定义了template，并且template的第一个值不是#，或者定义了el，或者mountComponent中传入了Element类型的el，则抛出警告。后面定义了一个updateComponent，通过是否配置performance来判断是否需要性能埋点。然后执行vm._update(vm._render(), hydrating)【此处hydrating为是否是服务端渲染】。
4. 用一个渲染Wather来执行updateComponent，即new Watcher一个实例，然后在this.get()实际就是updateComponent方法中执行渲染，渲染得到的值通过判断是否为lazy模式，传递给this.value。这个过程除了首次触发，在视图发生变化是，也会通过updateComponent执行update，然后触发渲染Watcher，再次渲染。
