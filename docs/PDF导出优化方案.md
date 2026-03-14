/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.28
 */

# PDF 导出功能优化方案

## 📋 当前实现分析

### 现有方案：html2canvas + jsPDF
```typescript
// 当前流程
HTML → Canvas (html2canvas) → Image → PDF (jsPDF)
```

### 存在的问题
1. ❌ **文本不可选择** - 导出的是图片，无法复制文本
2. ❌ **文件体积大** - 图片格式占用空间大（通常 > 1MB）
3. ❌ **质量损失** - 可能出现模糊、字体渲染问题
4. ❌ **性能较差** - 需要渲染整个页面为图片
5. ❌ **不利于 ATS** - 招聘系统无法解析图片中的文本

---

## 🎯 优化方案（基于 PDF Skill）

### 方案 1：使用 pdf-lib（推荐）✅

**优势：**
- ✅ 纯 JavaScript，浏览器端运行
- ✅ 生成真正的 PDF（文本可选择）
- ✅ 文件体积小（通常 < 200KB）
- ✅ 支持嵌入字体
- ✅ 完全控制布局

**实现步骤：**

```typescript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

async function exportToPDF(resumeData: ResumeData) {
  // 1. 创建 PDF 文档
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 尺寸
  
  // 2. 嵌入字体
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  // 3. 绘制内容
  const { width, height } = page.getSize()
  let y = height - 50
  
  // 姓名
  page.drawText(resumeData.personalInfo.name, {
    x: 50,
    y: y,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1)
  })
  
  y -= 30
  
  // 联系方式
  page.drawText(`${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}`, {
    x: 50,
    y: y,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4)
  })
  
  // ... 继续绘制其他内容
  
  // 4. 保存 PDF
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'resume.pdf'
  link.click()
}
```

**需要安装：**
```bash
npm install pdf-lib
```

---

### 方案 2：混合方案（当前 + pdf-lib）

保留当前的 html2canvas 方案作为备选，同时提供 pdf-lib 方案：

```typescript
interface ExportOptions {
  method: 'image' | 'native' // 图片方式 或 原生PDF
  quality: 'high' | 'medium' | 'low'
}

async function exportPDF(options: ExportOptions) {
  if (options.method === 'native') {
    // 使用 pdf-lib 生成原生 PDF
    return await exportWithPdfLib()
  } else {
    // 使用当前的 html2canvas 方式
    return await exportWithHtml2Canvas()
  }
}
```

---

### 方案 3：服务端生成（未来考虑）

使用 Python + reportlab 在服务端生成 PDF：

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_resume_pdf(resume_data):
    c = canvas.Canvas("resume.pdf", pagesize=letter)
    width, height = letter
    
    # 绘制姓名
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 50, resume_data['name'])
    
    # 绘制联系方式
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 80, f"{resume_data['email']} | {resume_data['phone']}")
    
    # ... 继续绘制
    
    c.save()
```

**优势：**
- ✅ 更强大的排版能力
- ✅ 支持复杂布局
- ✅ 可以使用 Python 生态的工具

**劣势：**
- ❌ 需要后端服务
- ❌ 增加服务器成本
- ❌ 网络延迟

---

## 🚀 推荐实施方案

### 阶段 1：立即优化（使用 pdf-lib）

1. **安装依赖**
```bash
npm install pdf-lib
```

2. **创建 PDF 生成服务**
```typescript
// src/services/pdfGenerator.ts
export class PDFGenerator {
  async generateResumePDF(resumeData: ResumeData): Promise<Blob> {
    // 使用 pdf-lib 生成 PDF
  }
}
```

3. **更新 ExportButton 组件**
```typescript
// 添加导出方式选择
const [exportMethod, setExportMethod] = useState<'image' | 'native'>('native')
```

### 阶段 2：优化体验

1. **添加字体支持**
   - 嵌入自定义字体（Crimson Pro, DM Sans）
   - 支持中文字体

2. **模板适配**
   - 为每个模板创建对应的 PDF 布局
   - 保持视觉一致性

3. **性能优化**
   - 使用 Web Worker 生成 PDF
   - 添加进度提示

### 阶段 3：高级功能

1. **ATS 优化**
   - 添加 PDF 元数据
   - 优化文本结构
   - 添加关键词标签

2. **多语言支持**
   - 根据语言选择合适的字体
   - 处理 RTL 语言

---

## 📊 方案对比

| 特性 | html2canvas + jsPDF | pdf-lib | reportlab (服务端) |
|------|---------------------|---------|-------------------|
| 文本可选择 | ❌ | ✅ | ✅ |
| 文件大小 | 大 (1-3MB) | 小 (100-300KB) | 小 (100-300KB) |
| 生成速度 | 慢 (2-5s) | 快 (< 1s) | 中 (1-2s + 网络) |
| 样式还原度 | 高 | 中 | 中 |
| ATS 友好 | ❌ | ✅ | ✅ |
| 实现难度 | 低 | 中 | 高 |
| 维护成本 | 低 | 中 | 高 |

---

## 🎯 实施建议

### 短期（本周）
1. ✅ 保持当前 html2canvas 方案作为备选
2. ✅ 实现 pdf-lib 基础版本
3. ✅ 添加导出方式选择（图片 vs 原生）

### 中期（本月）
1. 完善 pdf-lib 实现
2. 添加自定义字体支持
3. 优化所有模板的 PDF 输出

### 长期（未来）
1. 考虑服务端生成方案
2. 添加 PDF 编辑功能
3. 支持批量导出

---

## 📝 代码示例

### 完整的 pdf-lib 实现

```typescript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { ResumeData } from '@/types/resume'

export class NativePDFExporter {
  private doc: PDFDocument | null = null
  private currentPage: any = null
  private currentY: number = 0
  
  async export(resumeData: ResumeData): Promise<Blob> {
    // 创建文档
    this.doc = await PDFDocument.create()
    this.currentPage = this.doc.addPage([595.28, 841.89]) // A4
    
    const { height } = this.currentPage.getSize()
    this.currentY = height - 50
    
    // 嵌入字体
    const regularFont = await this.doc.embedFont(StandardFonts.Helvetica)
    const boldFont = await this.doc.embedFont(StandardFonts.HelveticaBold)
    
    // 绘制个人信息
    await this.drawPersonalInfo(resumeData.personalInfo, boldFont, regularFont)
    
    // 绘制工作经历
    await this.drawWorkExperience(resumeData.workExperience, boldFont, regularFont)
    
    // 绘制教育背景
    await this.drawEducation(resumeData.education, boldFont, regularFont)
    
    // 绘制技能
    await this.drawSkills(resumeData.skills, boldFont, regularFont)
    
    // 保存
    const pdfBytes = await this.doc.save()
    return new Blob([pdfBytes], { type: 'application/pdf' })
  }
  
  private async drawPersonalInfo(info: any, boldFont: any, regularFont: any) {
    // 姓名
    this.currentPage.drawText(info.name, {
      x: 50,
      y: this.currentY,
      size: 24,
      font: boldFont,
      color: rgb(0.11, 0.10, 0.09) // stone-900
    })
    
    this.currentY -= 30
    
    // 联系方式
    const contact = `${info.email} | ${info.phone} | ${info.location}`
    this.currentPage.drawText(contact, {
      x: 50,
      y: this.currentY,
      size: 10,
      font: regularFont,
      color: rgb(0.39, 0.45, 0.55) // stone-600
    })
    
    this.currentY -= 40
  }
  
  private async drawWorkExperience(experiences: any[], boldFont: any, regularFont: any) {
    // 标题
    this.currentPage.drawText('工作经历', {
      x: 50,
      y: this.currentY,
      size: 16,
      font: boldFont,
      color: rgb(0.85, 0.47, 0.02) // amber-600
    })
    
    this.currentY -= 25
    
    // 绘制每个经历
    for (const exp of experiences) {
      // 公司名称和职位
      this.currentPage.drawText(`${exp.company} - ${exp.position}`, {
        x: 50,
        y: this.currentY,
        size: 12,
        font: boldFont,
        color: rgb(0.11, 0.10, 0.09)
      })
      
      this.currentY -= 20
      
      // 时间
      this.currentPage.drawText(`${exp.startDate} - ${exp.endDate}`, {
        x: 50,
        y: this.currentY,
        size: 9,
        font: regularFont,
        color: rgb(0.39, 0.45, 0.55)
      })
      
      this.currentY -= 20
      
      // 描述
      const description = exp.description || ''
      const lines = this.wrapText(description, 500, regularFont, 10)
      for (const line of lines) {
        this.currentPage.drawText(line, {
          x: 50,
          y: this.currentY,
          size: 10,
          font: regularFont,
          color: rgb(0.28, 0.28, 0.28)
        })
        this.currentY -= 15
      }
      
      this.currentY -= 10
    }
  }
  
  private wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    // 简单的文本换行实现
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const width = font.widthOfTextAtSize(testLine, fontSize)
      
      if (width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }
  
  // ... 其他绘制方法
}
```

---

## 🔧 使用方式

```typescript
// 在 ExportButton 组件中
import { NativePDFExporter } from '@/services/nativePDFExporter'

const handleNativePDFExport = async () => {
  const exporter = new NativePDFExporter()
  const blob = await exporter.export(resumeData)
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'resume.pdf'
  link.click()
  URL.revokeObjectURL(url)
}
```

---

## ✅ 总结

**推荐方案：** 使用 pdf-lib 生成原生 PDF

**理由：**
1. 文本可选择，ATS 友好
2. 文件体积小，加载快
3. 纯前端实现，无需后端
4. 完全控制布局和样式
5. 符合 PDF skill 的最佳实践

**下一步：**
1. 安装 pdf-lib
2. 实现基础版本
3. 测试各个模板
4. 逐步替换当前方案

