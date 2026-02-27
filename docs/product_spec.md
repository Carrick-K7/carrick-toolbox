# Toolbox v1.0.0 - Product Spec
> **Project**: Carrick Toolbox (Web工具箱)  
> **Version**: v1.0.0  
> **Team**: 🔨 Forge (主力)  
> **PTT Version**: V3  
> **Status**: 开发中 🟡  
> **Last Updated**: 2026-02-09

## 项目概述
Carrick Toolbox 是一个现代化的多合一网页实用工具集合，提供简洁、高效、美观的日常工具体验。

**当前版本**: V2.0 PTT
**更新时间**: 2026-02-08

---

## 工具清单与验收标准

### ✅ 已实现工具 (7个)

#### 1. 模拟时钟 (analog-clock)
**用户故事**: 作为用户，我希望能看到一个美观的模拟时钟，同时显示数字时间、日期和农历信息。

**验收标准**:
```gherkin
Feature: 模拟时钟功能

Scenario: 时钟正常运行
  Given 用户打开时钟工具
  Then 应该显示模拟表盘
  And 时针、分针、秒针应该按当前时间正确指向
  And 数字时间应该每秒更新

Scenario: 时区切换
  Given 用户选择不同时区
  Then 时钟应该切换到对应时区的时间
  And 数字时间和日期应该同步更新

Scenario: 表盘自定义
  Given 用户调整时钟大小
  Then 表盘应该按新大小重新渲染
  And 刻度和数字应该比例正确

Scenario: 配置持久化
  Given 用户修改配置（如隐藏秒针、切换12/24小时制）
  When 用户刷新页面
  Then 配置应该保持（通过 localStorage）

Scenario: 农历显示
  Given 当前日期有农历信息
  Then 应该正确显示农历日期、干支纪年、生肖
  And 应该显示传统节日

Scenario: 节假日倒计时
  Given 用户启用节假日倒计时
  Then 应该显示即将到来的法定节假日
  And 应该正确计算剩余天数
```

#### 2. 时间转换器 (time-converter)
**用户故事**: 作为开发者，我希望能快速在不同时间格式之间转换。

**验收标准**:
```gherkin
Feature: 时间格式转换

Scenario: Unix时间戳转换
  Given 用户输入有效的Unix时间戳（10位）
  Then 应该正确转换为本地日期时间
  And 应该显示ISO 8601格式
  And 应该显示中文日期格式

Scenario: 毫秒时间戳转换
  Given 用户输入毫秒时间戳（13位）
  Then 应该正确识别并转换

Scenario: 日期选择器
  Given 用户使用日期时间选择器
  Then 所有其他格式应该同步更新

Scenario: 复制功能
  Given 用户点击复制按钮
  Then 对应字段的值应该复制到剪贴板
  And 应该显示复制成功反馈（图标变化）

Scenario: 无效输入处理
  Given 用户输入无效的时间戳
  Then 应该显示"无效日期"提示
```

#### 3. 颜色转换器 (color-converter)
**用户故事**: 作为设计师，我希望能快速在不同颜色格式之间转换。

**验收标准**:
```gherkin
Feature: 颜色格式转换

Scenario: 颜色选择
  Given 用户使用颜色选择器选择颜色
  Then 所有格式（HEX/RGB/HSL/HSV/CMYK）应该同步更新
  And 颜色预览应该实时变化

Scenario: 手动输入HEX
  Given 用户输入有效的HEX颜色（如 #FF5733）
  Then 应该正确解析并更新所有格式

Scenario: 手动输入RGB
  Given 用户输入有效的RGB格式（如 rgb(255, 87, 51)）
  Then 应该正确解析并更新所有格式

Scenario: RGB滑块
  Given 用户拖动R/G/B滑块
  Then 颜色应该实时更新
  And 滑块背景应该显示对应颜色渐变

Scenario: 屏幕取色（支持EyeDropper API的浏览器）
  Given 用户点击取色按钮
  When 用户选择屏幕上某点
  Then 应该获取该点颜色并更新所有格式

Scenario: 颜色名称识别
  Given 输入的颜色在数据库中有名称
  Then 应该显示颜色名称
  Otherwise 应该显示HEX值

Scenario: 复制功能
  Given 用户点击任意格式的复制按钮
  Then 应该复制该格式的值到剪贴板
```

#### 4. 货币转换器 (currency-converter)
**用户故事**: 作为用户，我希望能快速换算不同货币的汇率。

**验收标准**:
```gherkin
Feature: 货币换算

Scenario: 基础换算
  Given 用户输入金额和选择源货币
  And 用户选择目标货币
  Then 应该显示正确的换算结果
  And 应该显示当前汇率

Scenario: 货币交换
  Given 用户点击交换按钮
  Then 源货币和目标货币应该互换
  And 结果应该重新计算

Scenario: 快速参考
  Given 用户启用快速参考
  Then 应该显示源货币对所有其他货币的换算结果

Scenario: 自定义汇率
  Given 用户在配置面板修改汇率
  Then 应该使用自定义汇率进行计算
  And 应该可以恢复默认汇率

Scenario: 配置持久化
  Given 用户修改显示配置（如隐藏数据来源）
  Then 配置应该在会话间保持
```

#### 5. Markdown编辑器 (markdown)
**用户故事**: 作为写作者，我希望能有一个简洁的Markdown编辑器，支持实时预览。

**验收标准**:
```gherkin
Feature: Markdown编辑与预览

Scenario: 实时预览
  Given 用户在编辑区输入Markdown
  Then 预览区应该实时渲染HTML
  And 应该正确解析Markdown语法

Scenario: 工具栏操作
  Given 用户点击粗体按钮
  Then 应该在光标处插入 **粗体文字**
  And 如果有选中文字，应该包裹选中文字

Scenario: 工具栏功能列表
  - 粗体、斜体、标题、链接、图片、代码、引用、无序列表、有序列表

Scenario: 光标位置
  Given 用户使用工具栏插入语法
  Then 光标应该位于合适位置（如链接的URL处）

Scenario: Marked.js加载
  Given 首次打开编辑器
  Then 应该自动加载Marked.js库
  And 预览应该正常显示
```

#### 6. JSON格式化 (json-formatter)
**用户故事**: 作为开发者，我希望能格式化和验证JSON数据。

**验收标准**:
```gherkin
Feature: JSON处理

Scenario: 格式化JSON
  Given 用户输入有效的JSON
  When 用户点击格式化按钮
  Then 应该输出格式化后的JSON
  And 应该根据缩进设置正确缩进

Scenario: 压缩JSON
  Given 用户输入有效的JSON
  When 用户点击压缩按钮
  Then 应该输出单行无空格JSON

Scenario: 转义JSON
  Given 用户输入任意文本
  When 用户点击转义按钮
  Then 应该输出转义后的JSON字符串

Scenario: 去转义JSON
  Given 用户输入转义的JSON字符串
  When 用户点击去转义按钮
  Then 应该还原原始文本

Scenario: 按键排序
  Given 用户启用"按键排序"选项
  When 用户点击格式化
  Then JSON键应该按字母顺序排列

Scenario: 实时验证
  Given 用户在输入框输入JSON
  Then 应该实时显示验证状态（有效/无效）

Scenario: 统计信息
  Given 用户成功格式化JSON
  Then 应该显示键数量和字节大小

Scenario: 复制功能
  Given 用户点击复制按钮
  Then 应该复制输出内容到剪贴板

Scenario: 清空功能
  Given 用户点击清空按钮
  Then 输入和输出应该都被清空
```

#### 7. 正则测试器 (regex-tester)
**用户故事**: 作为开发者，我希望能测试和调试正则表达式。

**验收标准**:
```gherkin
Feature: 正则表达式测试

Scenario: 基础匹配
  Given 用户输入正则表达式
  And 用户输入测试文本
  Then 应该高亮显示所有匹配
  And 应该显示匹配数量

Scenario: 标志位支持
  Given 用户勾选不同标志位（g/i/m/s）
  Then 正则应该应用对应标志
  And 结果应该相应更新

Scenario: 匹配详情
  Given 正则成功匹配文本
  Then 应该显示每个匹配的文本
  And 应该显示匹配位置
  And 如果有捕获组，应该显示组内容

Scenario: 替换测试
  Given 用户输入替换文本
  When 用户点击替换按钮
  Then 应该显示替换后的结果
  And 应该支持 $1, $2 等捕获组引用

Scenario: 预设加载
  Given 用户点击预设按钮（如邮箱、手机号）
  Then 应该加载对应的正则表达式

Scenario: 语法错误提示
  Given 用户输入无效的正则表达式
  Then 应该显示语法错误信息

Scenario: 快速参考
  Given 用户查看快速参考区域
  Then 应该显示常用正则语法说明
```

---

## 系统级验收标准

### 性能要求
```gherkin
Scenario: 工具加载性能
  Given 用户点击某个工具
  Then 工具应该在500ms内完成加载和渲染
  And 不应该阻塞UI

Scenario: 内存管理
  Given 用户切换不同工具
  Then 被卸载的工具应该清理定时器和事件监听
  And 不应该造成内存泄漏
```

### 响应式设计
```gherkin
Scenario: 移动端适配
  Given 用户在移动设备访问
  Then 侧边栏应该可折叠
  And 工具内容应该自适应屏幕宽度
  And 所有功能应该可操作

Scenario: 平板适配
  Given 用户在平板设备访问
  Then 布局应该自动调整
  And 不应该出现横向滚动条
```

### 主题切换
```gherkin
Scenario: 明暗主题
  Given 用户点击主题切换按钮
  Then 页面应该在明暗主题间切换
  And 所有工具应该正确响应主题变化
  And 主题偏好应该持久化到localStorage
```

---

## 待开发工具

### 优先级：高
- [ ] Base64编解码器
- [ ] 密码生成器
- [ ] 文本对比工具

### 优先级：中
- [ ] HTTP请求测试器
- [ ] 二维码生成器
- [ ] 单位换算器

### 优先级：低
- [ ] 图片压缩工具
- [ ] 代码美化器（HTML/CSS/JS）

---

## 变更日志

### V2.0 (2026-02-08)
- 添加所有现有工具的详细验收标准
- 明确测试策略（Jest + TDD）
- 定义系统级验收标准
- 规划未来工具路线图
