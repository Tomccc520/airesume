/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-10-4
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // 开发模式下禁用图片优化以避免问题
  },
}

module.exports = nextConfig