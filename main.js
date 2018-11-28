const path = require('path')
const _ = require('lodash')
const Glob = require('glob')
const pify = require('pify')

const glob = pify(Glob)
const ID = 'pure-webpack-plugin'

module.exports = class {
  constructor({src = 'src', exclude} = {}) {
    this.src = src
    this.exclude = exclude
    this.fullSrc = path.resolve(src)
    this.watching = false
    this.hasFilter = _.isArray(this.exclude) && _.every(this.exclude, _.isRegExp)
  }

  apply(compiler) {
    if ('hooks' in compiler) { // webpack 4
      compiler.hooks.run.tapAsync(ID, run.bind(this))
      compiler.hooks.watchRun.tapAsync(ID, watchRun.bind(this))
      compiler.hooks.emit.tapAsync(ID, emit.bind(this))
    } else { // webpack 2 / 3
      compiler.plugin('run', run.bind(this))
      compiler.plugin('watch-run', watchRun.bind(this))
      compiler.plugin('emit', emit.bind(this))
    }

    async function run(compilation, callback) {
      this.watching = false
      callback()
    }

    async function watchRun(compilation, callback) {
      this.watching = true
      callback()
    }

    function emit(compilation, callback) {
      if (!this.watching) {
        this.run(compilation, callback)
      } else {
        callback()
      }
    }
  }

  async run(compilation, callback) {
    let allFile = await this.getAllFile()
    let dependFile = this.getDependenciesFile(compilation.fileDependencies)
    let withoutFile = _.without(allFile, ...dependFile)
    compilation.assets['withoutFile.md'] = {
      source: () => _.join(withoutFile, '\n'),
      size: () => withoutFile.length
    }
    callback()
  }

  // 获取依赖文件
  getDependenciesFile(fileDependencies = []) {
    let files = []
    if (_.isArray(fileDependencies)) {
      fileDependencies = fileDependencies
    } else {
      fileDependencies = [...fileDependencies]
    }
    _.forEach(fileDependencies, path => {
      if (path.startsWith(this.fullSrc)) {
        path = path
          .replace(this.fullSrc, this.src)
          .replace(/\\+/g, '/')
        files.push(path)
      }
    })
    return files
  }

  // 获取所有文件
  async getAllFile() {
    let allFile = await glob(this.src + '/**/*.*')
    return _.filter(allFile, path => !(this.hasFilter && _.some(this.exclude, reg => reg.test(path))))
  }
}