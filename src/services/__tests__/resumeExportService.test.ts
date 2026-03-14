/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-14
 */

const mockHtml2canvas = jest.fn()
const mockJsPDFConstructor = jest.fn()

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockHtml2canvas(...args)
}))

jest.mock('jspdf', () => ({
  jsPDF: mockJsPDFConstructor
}))

import { exportResumeFile, exportResumeJsonFile } from '@/services/resumeExportService'

/**
 * 创建用于导出的测试节点
 * 包含真实 DOM 结构，便于验证样式恢复与尺寸读取
 */
function createExportElement(scrollHeight: number): HTMLElement {
  const wrapper = document.createElement('div')
  const element = document.createElement('div')
  wrapper.appendChild(element)
  document.body.appendChild(wrapper)

  Object.defineProperty(element, 'scrollHeight', {
    value: scrollHeight,
    configurable: true
  })

  element.getBoundingClientRect = jest.fn(() => ({
    width: 612,
    height: scrollHeight || 792,
    top: 0,
    left: 0,
    right: 612,
    bottom: scrollHeight || 792,
    x: 0,
    y: 0,
    toJSON: () => ({})
  } as DOMRect))

  return element
}

/**
 * 创建 html2canvas 的返回对象
 * 仅保留导出流程必需字段
 */
function createCapturedCanvas(width: number, height: number): HTMLCanvasElement {
  return {
    width,
    height,
    toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
    getContext: jest.fn(() => null)
  } as unknown as HTMLCanvasElement
}

describe('resumeExportService', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      configurable: true
    })

    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({
      fillStyle: '#ffffff',
      fillRect: jest.fn(),
      drawImage: jest.fn()
    } as unknown as CanvasRenderingContext2D))

    jest.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(
      () => 'data:image/png;base64,mock'
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('应在多页 PDF 场景下按页拆分并保存文件', async () => {
    const addPage = jest.fn()
    const addImage = jest.fn()
    const save = jest.fn()

    mockJsPDFConstructor.mockImplementation(() => ({
      addPage,
      addImage,
      save
    }))

    const canvasWidth = 1000
    const canvasHeight = 5000
    mockHtml2canvas.mockResolvedValue(createCapturedCanvas(canvasWidth, canvasHeight))

    const element = createExportElement(canvasHeight)
    const onStep = jest.fn()
    const onProgress = jest.fn()

    await exportResumeFile({
      format: 'pdf',
      element,
      fileName: 'multi-page.pdf',
      onStep,
      onProgress
    })

    const contentWidth = 210 - 10 * 2
    const contentHeight = 297 - 10 * 2
    const pageHeightPx = Math.floor(contentHeight / (contentWidth / canvasWidth))
    const expectedPages = Math.ceil(canvasHeight / pageHeightPx)

    expect(mockJsPDFConstructor).toHaveBeenCalledTimes(1)
    expect(addPage).toHaveBeenCalledTimes(Math.max(0, expectedPages - 1))
    expect(save).toHaveBeenCalledWith('multi-page.pdf')
    expect(onStep).toHaveBeenCalledWith('rendering-page')
    expect(onStep).toHaveBeenCalledWith('generating-file')
  })

  it('应在 Canvas 尺寸为 0 时抛出明确错误', async () => {
    mockHtml2canvas.mockResolvedValue(createCapturedCanvas(0, 0))

    const element = createExportElement(0)

    await expect(
      exportResumeFile({
        format: 'png',
        element,
        fileName: 'empty.png'
      })
    ).rejects.toThrow('Canvas尺寸为0，无法导出')
  })

  it('应导出 JSON 文件并释放 blob URL', () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const createObjectURLMock = jest.fn(() => 'blob:resume-json')
    const revokeObjectURLMock = jest.fn()

    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURLMock,
      writable: true,
      configurable: true
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURLMock,
      writable: true,
      configurable: true
    })

    const originalCreateElement = document.createElement.bind(document)
    let createdLink: HTMLAnchorElement | null = null

    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName)
      if (tagName.toLowerCase() === 'a') {
        createdLink = element as HTMLAnchorElement
      }
      return element
    })

    exportResumeJsonFile({
      resumeData: { personalInfo: { name: '张三' } },
      resumeName: '张三/前端'
    })

    expect(createObjectURLMock).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:resume-json')
    expect(createdLink?.download).toMatch(/^张三_前端_\d{4}-\d{2}-\d{2}\.json$/)
  })
})
