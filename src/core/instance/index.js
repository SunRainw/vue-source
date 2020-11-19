import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

/**
 * * 执行new Vue即执行function Vue这个Vue的构造函数，然后使用_init方法对传入的options进行初始化
 * * _init是在initMixin是添加到Vue的原型链上
 */
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

/**
 * * 每个mixin都是在Vue的原型上加上一些方法
 * * 此处不使用ES6的Class写法，在于class难以实现这种拆分成多个方法的写法，不利于将每个方法的实现拆分成文件
 */

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
