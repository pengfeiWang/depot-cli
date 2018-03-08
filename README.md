# Depot

framework for React apps.

# 安装

```
npm install depot-cli -g
```

# 使用


开发环境

```
depot dev
```

运行 `depot dev` 后, 程序会启动 `http`服务, 默认端口 `8000`

1. 正常

当前运行程序目录下有 `src/modules` 目录的话, 程序会读取其中文件, 并编译

2. 异常

`src/modules` 不存在, 会列出当前目录下的资源

# 部署前打包

```
depot build
```

1. 部署前需要打包, 在工程目录下运行 `depot build`, 会编译目录下的文件, 并在当前目录新建 `dist/` 文件夹, 正式环境的文件会生成到这里

2. `nginx` , `apache` 分别需要配置规则

# 构建开发环境

```
depot cli myApp
```

`depot cli myApp` , `myApp` 为所要创建的目录名称
执行完毕后, 程序会创建  `myApp` 目录, 并生成开发所依赖的环境, 与文件结构

