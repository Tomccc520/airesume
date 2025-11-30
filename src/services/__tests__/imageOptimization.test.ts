/**
 * 图片优化服务测试
 */

import { ImageOptimizationService } from '../imageOptimization';

// Mock Canvas API
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
  })),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,mock'),
  toBlob: jest.fn((callback) => {
    callback(new Blob(['mock'], { type: 'image/jpeg' }));
  }),
};

global.document.createElement = jest.fn((tagName) => {
  if (tagName === 'canvas') {
    return mockCanvas as any;
  }
  return {} as any;
});

// Mock Image
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';
  width: number = 800;
  height: number = 600;

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
}

global.Image = MockImage as any;

// Mock URL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('ImageOptimizationService', () => {
  describe('isValidImageType', () => {
    it('应该验证有效的图片类型', () => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      validTypes.forEach((type) => {
        expect((ImageOptimizationService as any).isValidImageType(type)).toBe(true);
      });
    });

    it('应该拒绝无效的图片类型', () => {
      const invalidTypes = ['image/gif', 'image/svg+xml', 'text/plain'];
      invalidTypes.forEach((type) => {
        expect((ImageOptimizationService as any).isValidImageType(type)).toBe(false);
      });
    });
  });

  describe('calculateTargetSize', () => {
    it('应该保持宽高比缩放', () => {
      const result = (ImageOptimizationService as any).calculateTargetSize(
        1600,
        1200,
        800,
        800,
        true
      );
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('应该在图片小于最大尺寸时保持原尺寸', () => {
      const result = (ImageOptimizationService as any).calculateTargetSize(
        400,
        300,
        800,
        800,
        true
      );
      expect(result.width).toBe(400);
      expect(result.height).toBe(300);
    });

    it('应该支持不保持宽高比', () => {
      const result = (ImageOptimizationService as any).calculateTargetSize(
        1600,
        1200,
        800,
        600,
        false
      );
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });
  });

  describe('determineOutputFormat', () => {
    it('应该在指定格式时返回指定格式', () => {
      const result = (ImageOptimizationService as any).determineOutputFormat(
        'image/jpeg',
        'png'
      );
      expect(result).toBe('png');
    });

    it('应该为 PNG 保持 PNG 格式', () => {
      const result = (ImageOptimizationService as any).determineOutputFormat(
        'image/png',
        'auto'
      );
      expect(result).toBe('png');
    });
  });

  describe('formatFileSize', () => {
    it('应该正确格式化文件大小', () => {
      expect(ImageOptimizationService.formatFileSize(0)).toBe('0 B');
      expect(ImageOptimizationService.formatFileSize(1024)).toBe('1.00 KB');
      expect(ImageOptimizationService.formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(ImageOptimizationService.formatFileSize(1536)).toBe('1.50 KB');
    });
  });

  describe('supportsWebP', () => {
    it('应该检测 WebP 支持', () => {
      const result = ImageOptimizationService.supportsWebP();
      expect(typeof result).toBe('boolean');
    });
  });
});
