# 介绍

Fdev4是基于jQuery的web基础框架，它包括css和js两部分。

* css部分提供了reset文件，网站公共样式，栅格系统和组件样式
* js部分使用原生的jQuery框架，在此基础之上提供了包管理工具、网站常用功能扩展和组件库

# 目录结构
* css/
    * common/ 网站公共的样式
    * core/ 合并了reset grid common后的文件
    * gird/ 栅格化样式体系，目前提供浮动布局和双飞翼布局两套
    * reset/ 浏览器样式重置
    * widget/ 组件样式
* js/
    * app/ 应用框架
    * core/ 框架核心文件，包括jQuery 核心扩展 包管理器和网站全局配置文件
    * widget/ 组件
          * external/ 第三方组件
          * fx/ 动画插件
          * ui/ 扩展到jQuery.fn的UI组件
          * util/ 扩展到jQuery.util的功能性组件
          * web/ 扩展到FE.ui FE.util的UI及功能组件

本项目API及DEMO请访问 https://github.com/alicnwd/fdevlib-doc