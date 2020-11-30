/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  // * 传入一个对象，返回一个构造函数
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    // * 由于是一个静态的方法，此时的this是调用它的Vue
    const Super = this
    const SuperId = Super.cid
    // * 缓存优化
    // * 当多个组件引用一个组件时，多个构造器组件只会引用一次，避免重新初始化构造器
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    // * name即组件的name
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      // * 对组件的name进行校验，避免与内置html标签一样
      validateComponentName(name)
    }

    // * 定义一个子的构造函数
    const Sub = function VueComponent (options) {
      this._init(options) // * 指向this._init()即执行Vue.prototype._init
    }
    // * 将子类的原型指向父类的原型
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    // * 将自身的options与vue的options进行合并
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // * 判断是否存在props，存在就初始化它
    if (Sub.options.props) {
      initProps(Sub)
    }
    // * 判断是否存在computed，存在就初始化它
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // * 将子类sub缓存下来
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
