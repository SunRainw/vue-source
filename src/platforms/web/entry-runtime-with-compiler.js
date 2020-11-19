/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// * 首先获取原型上的$mount方法，使用mount缓存起来
const mount = Vue.prototype.$mount
// * 重新定义$mount主要是用于runtime+compiler版本，上面的是runtime only版本的$mount
Vue.prototype.$mount = function (
  el?: string | Element, // * el 可以是string也可以是Element节点
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  // * 如果el是一个body或者html文档标签，就会抛错
  // * 不能是body或者html文档标签的原因是，在编译之后会直接将body或者html文档标签直接覆盖
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // * 判断是否具有render方法
  if (!options.render) {
    // * 判断是否存在template
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        // * template可以为"#id"这种形式
        if (template.charAt(0) === '#') {
          // * 如果是"#id"形式就调用idToTemplate方法，判断是否具有该id的dom，如果有就返回它，没有就创建一个并返回
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        // * 如果template是一个标签，那么就将内部的如有节点取出来给template
        template = template.innerHTML
      } else {
        // * 如果既不是string也不是标签，则会报错
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // * 如果没有template，有el，如果el所在dom不存在，就创建一个空的div，将InnerHTML传入
      template = getOuterHTML(el)
    }
    if (template) {
      // * 这里是编译部分
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // * 以上步骤主要获取el，然后判断是否有render属性，如果没有render函数，将template转换为render函数，即Vue只识别render函数
  // * 如果有render函数就会直接指向到这一部，将mount中的el和hydrating指向this也就是Vue
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    // * 如果存在就返回el本身的标签
    return el.outerHTML
  } else {
    // * 不存在则创建一个新的div并返回
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
