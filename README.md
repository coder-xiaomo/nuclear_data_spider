# 辐射环境历史数据查询

> 可查询自 2023-08-25 起的国家核安全局辐射环境监测数据历史数据

数据来源：[国家核安全局](https://nnsa.mee.gov.cn/) - [辐射环境监测数据](https://data.rmtc.org.cn/gis)

视频版说明(B站)：https://www.bilibili.com/video/BV1kh4y127Mg/



## 开源地址

GitHub: https://github.com/coder-xiaomo/nuclear_data_spider

Gitee: https://gitee.com/coder-xiaomo/nuclear_data_spider

自建仓库: https://git.only4.work/coder-xiaomo/nuclear_data_spider



## 目录结构

- 后端服务：backend

- 前端页面：html

- 数据采集：spider

- 数据库表结构：sql



## 项目环境

数据库使用 MySQL 8.0，逻辑上讲 MySQL 5.7 版本应该也能使用，但我没有测试过。

后端和数据采集端需要在 node 环境下运行，初次使用需要 `npm i` 安装依赖。



## 一些说明

这个项目代码写的比较烂，毕竟只是一个数据采集工具，除非官方网站更新，否则后期应该不会改动太多。大家如果要看代码，可以带着审视的眼光来看，相信大家能够写出比我的更优雅的代码。



## 免责声明

本站仅记录自 2023-08-25 起的辐射环境监测数据历史值，不对数据来源真实性做保证，数据使用权请查阅上方数据来源自行获取，仅通过技术层面保存监测数据历史记录，方便学术研究使用。

