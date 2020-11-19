# new Vue发生了什么
## 初始化data
1. 调取_init方法进行初始化，在初始化data之前，先初始化props，然后初始化methods，然后才初始化data。
2. 根据判断data的类型为对象还是function做不同的处理。如果是data是function则获取它的返回值，同时判断返回值是否为对象，如果不是对象则抛错，如果data是对象，则获取data。遍历data的key值，与props和methods的属性名和方法名相同就抛错。
3. 用proxy代理函数，将data的每一个key都设置为可枚举属性，描述符配置为可修改，添加getter和setter方法，通过this[key]访问时，就相当于通过getter访问用this._data[key]访问。
## $mount(Vue实例挂载的实现)
$mount对于runtime+compiler版本会在entry-runtime-with-compiler中重新定义，而对于runtime only版本在runtime/index.js中
在compiler版本中
