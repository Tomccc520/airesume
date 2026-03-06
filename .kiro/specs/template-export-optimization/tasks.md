# 实现计划: 模板选择器重构与导出样式优化

## 概述

本实现计划将设计文档转换为可执行的编码任务，按照以下顺序进行：
1. 提取职业模板数据
2. 重构 TemplateSelector 组件
3. 增强导出样式捕获服务
4. 优化 TemplatePreview 组件
5. 集成测试和验证

## 任务

- [x] 1. 创建职业模板数据文件
  - [x] 1.1 创建 `src/data/careerTemplates.ts` 文件，包含类型定义和数据结构
    - 定义 CareerTemplateId 类型
    - 创建 careerTemplateDataMap 对象
    - 导出 getCareerTemplateData 和 isCareerTemplate 函数
    - _需求: 1.1, 1.3, 1.4_
  
  - [x] 1.2 迁移 UI 设计师模板数据
    - 从 TemplateSelector.tsx 复制 career-ui-designer 数据
    - 确保数据结构符合 ResumeData 类型
    - _需求: 1.1_
  
  - [x] 1.3 迁移前端开发模板数据
    - 从 TemplateSelector.tsx 复制 career-frontend-developer 数据
    - _需求: 1.1_
  
  - [x] 1.4 迁移后端开发模板数据
    - 从 TemplateSelector.tsx 复制 career-backend-developer 数据
    - _需求: 1.1_
  
  - [x] 1.5 迁移运营专员模板数据
    - 从 TemplateSelector.tsx 复制 career-operations 数据
    - _需求: 1.1_
  
  - [x] 1.6 迁移产品经理模板数据
    - 从 TemplateSelector.tsx 复制 career-product-manager 数据
    - _需求: 1.1_
  
  - [x] 1.7 编写职业模板数据属性测试
    - **Property 1: 职业模板数据获取一致性**
    - **验证: 需求 1.3**

- [x] 2. 重构 TemplateSelector 组件
  - [x] 2.1 更新 TemplateSelector 导入职业模板数据
    - 从 careerTemplates.ts 导入 getCareerTemplateData 和 isCareerTemplate
    - 删除组件内的 getCareerTemplateData 函数（约 600 行）
    - _需求: 1.2, 2.3_
  
  - [x] 2.2 简化 handleApplyCareerTemplate 函数
    - 使用导入的 getCareerTemplateData 函数
    - 保持相同的功能逻辑
    - _需求: 2.4, 2.5_
  
  - [x] 2.3 验证组件行数减少到 500 行以下
    - 检查重构后的文件行数
    - 确保所有功能正常工作
    - _需求: 2.1_

- [x] 3. 检查点 - 确保模板选择功能正常
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 增强导出样式捕获服务
  - [x] 4.1 添加 Flex 布局检测方法
    - 实现 isFlexContainer(element) 方法
    - 检测 display: flex 或 inline-flex
    - _需求: 6.1_
  
  - [x] 4.2 添加百分比转像素转换方法
    - 实现 convertPercentToPixels(percent, containerWidth) 方法
    - 处理边界情况（无效值、零宽度）
    - _需求: 3.2, 6.3, 6.5_
  
  - [x] 4.3 实现 Flex 子元素信息获取
    - 实现 getFlexChildrenInfo(container) 方法
    - 获取原始宽度、flex-basis、flex-grow、flex-shrink
    - _需求: 4.4, 6.1_
  
  - [x] 4.4 实现 Flex 布局处理主方法
    - 实现 processFlexLayouts(element, config) 方法
    - 支持递归处理嵌套容器
    - 将百分比宽度转换为固定像素值
    - _需求: 3.4, 6.1, 6.2, 6.4_
  
  - [x] 4.5 编写 Flex 布局处理属性测试
    - **Property 2: 百分比宽度转像素计算正确性**
    - **Property 3: Flex 容器检测准确性**
    - **Property 4: Flex 子元素宽度应用完整性**
    - **Property 6: 嵌套 Flex 容器递归处理**
    - **Property 8: Flex 属性保留完整性**
    - **验证: 需求 3.2, 3.4, 4.4, 6.1-6.5**

- [x] 5. 更新导出预处理流程
  - [x] 5.1 创建 prepareForExport 方法
    - 克隆预览元素
    - 调用 processFlexLayouts 处理 Flex 布局
    - 调用 resolveCSSVariables 解析 CSS 变量
    - 应用内联样式
    - _需求: 4.1, 4.2_
  
  - [x] 5.2 更新 ExportButton 使用新的预处理方法
    - 在导出前调用 prepareForExport
    - 等待字体加载完成
    - 使用处理后的元素进行 html2canvas 捕获
    - _需求: 4.3_
  
  - [x] 5.3 编写 CSS 变量解析属性测试
    - **Property 5: CSS 变量解析完整性**
    - **验证: 需求 3.5**

- [x] 6. 检查点 - 确保导出功能正常
  - 确保所有测试通过，如有问题请询问用户

- [x] 7. 优化 TemplatePreview 组件
  - [x] 7.1 移除未使用的导入
    - 删除 MapPin 图标导入
    - 检查并移除其他未使用的导入
    - _需求: 5.1_
  
  - [x] 7.2 添加 useMemo 优化
    - 对 sampleData 使用 useMemo
    - 对 getLayoutType 结果使用 useMemo
    - _需求: 5.2_
  
  - [x] 7.3 编写布局类型支持属性测试
    - **Property 7: 布局类型支持完整性**
    - **验证: 需求 5.4**

- [x] 8. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

## 注意事项

- 所有任务均为必需任务，包括测试任务
- 每个任务都引用了具体的需求以便追溯
- 检查点用于确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
