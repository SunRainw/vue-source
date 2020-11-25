/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

// * nodeOPs是一些实际的dom操作
// * modules是platformModules和baseModules的合集，实际是dom的属性、类等的钩子函数
export const patch: Function = createPatchFunction({ nodeOps, modules })
// * 运用函数柯里化的技巧将nodeOps和modules传入，避免在patch过程中去判断平台差异