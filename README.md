# Anti BV bot

[![](https://img.shields.io/badge/Telegram-%40antibvbot-blue.svg)](https://t.me/antibvbot)

## 如何使用？

此 bot 接受以下格式：

- av 号（不变）
- BV 号（转换为 av 号）
- cv 号（不变）
- b23.tv 或 b23.wtf 短链接（转换为 av 号、cv 号或相应跳转结果）

此 bot 接受以下来源：

- PM（私聊），不需加 `/convert` 指令。
- Inline bot（行内模式），不需加 `/convert` 指令。
- 群组内聊天，需要加 `/convert` 指令。

## FAQ

### 关于某视频网站为什么使用 BV 号来替代 av 号

> 简单猜测几个原因：
>
> 1. 隐藏稿件发布数据
> 2. 防止批量爬取
> 3. 消除 AV 一词其它含义对 Bilibili 的影响
>
> 总而言之就是和 YouTube 接轨什么的？
>
> 至于「维护 UP 主权益」...什么权益？

### 关于连某网站自己都不允许用户谈及这个

> 然而 Astrian 在 B 站谈及这个的时候被审核了…
>
> https://t.me/AstrianFM/1393

### 关于这带来的问题

> BV 号比 av 号难记忆得多，于是大家开始分享 Bilibili 生成的短链接（而不是 av/BV 号）。这带来的一个直接结果是 Bilibili 将能更好地追踪视频观看者的来源。
>
> 总之，这样的改变确实是维护了 Bilibili 的利益，而不是 UP 主的权益。

### 关于算法

感谢 [mcfx@zhihu](https://www.zhihu.com/question/381784377/answer/109943878) 和油猴脚本[Bilibili AntiBV](https://greasyfork.org/zh-CN/scripts/398499-bilibili-antibv)。
