/**
 * Debug test to understand flex property handling in JSDOM
 */

import { ExportStyleCapture } from '../exportStyleCapture';

const exportStyleCapture = new ExportStyleCapture();

describe('Debug flex properties', () => {
  it('should debug flex property handling', () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.width = '794px';

    const child = document.createElement('div');
    child.style.flexBasis = '10%';
    child.style.flexGrow = '1';
    child.style.flexShrink = '1';
    child.textContent = 'Flex Child';

    container.appendChild(child);
    document.body.appendChild(container);

    console.log('=== Before processing ===');
    console.log('child.style.flexGrow:', child.style.flexGrow);
    console.log('child.style.flexBasis:', child.style.flexBasis);
    console.log('child.style.width:', child.style.width);

    const computedStyle = window.getComputedStyle(child);
    console.log('computedStyle.flexGrow:', computedStyle.flexGrow);
    console.log('computedStyle.flexBasis:', computedStyle.flexBasis);
    console.log('computedStyle.width:', computedStyle.width);

    // Check getBoundingClientRect
    const rect = child.getBoundingClientRect();
    console.log('getBoundingClientRect().width:', rect.width);

    // Process flex layouts
    exportStyleCapture.processFlexLayouts(container);

    console.log('=== After processing ===');
    console.log('child.style.flexGrow:', child.style.flexGrow);
    console.log('child.style.flexBasis:', child.style.flexBasis);
    console.log('child.style.width:', child.style.width);

    // Check if width is pixel
    const width = child.style.width;
    const isPixelWidth = width.endsWith('px') && !width.includes('%');
    console.log('isPixelWidth:', isPixelWidth);

    // Check if flex-grow is preserved
    const newFlexGrow = child.style.flexGrow;
    console.log('newFlexGrow:', newFlexGrow);
    console.log('flexGrow preserved:', newFlexGrow === '1');

    document.body.removeChild(container);

    // The test should pass
    expect(isPixelWidth).toBe(true);
    expect(newFlexGrow).toBe('1');
  });
});
