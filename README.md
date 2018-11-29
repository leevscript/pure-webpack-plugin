# pure-webpack-plugin

> 查询非依赖文件的webpack插件，将在输出编译结果时(一般是dist文件夹)生成一份未被引用文件的列表

## 安装
```
npm i pure-webpack-plugin --save-dev
```

## 使用
```
plugins: [
  new Pure({
    src: 'src', // 清理的文件夹
    exclude: [/\.d\.ts$/] // 忽略文件，必须是正则数组
  })
]
```
