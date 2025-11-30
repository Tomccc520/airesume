'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * 全局底部页脚组件
 * 提供网站信息、链接和版权信息
 */
export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-white/70 backdrop-blur-xl border-t border-white/40 shadow-lg shadow-blue-900/5 mt-auto" role="contentinfo" aria-label="页面底部">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Logo和标题 */}
          <Link href="/" className="logo-container group relative" aria-label="返回首页">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center transform group-hover:scale-105 transition-transform duration-300">
              <div className="logo-wrapper flex items-center" aria-hidden="true">
                <svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink" className="logo-svg drop-shadow-sm">
                  <title>logo-3</title>
                  <defs>
                    <polygon id="path-9z3bcfbp2n-1" points="4.24080877e-17 0 51 0 51 49 4.24080877e-17 49"></polygon>
                  </defs>

                  <g id="page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="logo-3">
                      {/* 背景填充 */}
                      <rect id="background-rect" x="0" y="0" width="204" height="96" rx="48"></rect>

                      {/* 新Logo 使用从左到右的描边和填充动画 */}
                      <g id="logo-copy" transform="translate(19, 24)">
                        <path
                          d="M118,0 L115.645416,11.671646 L89.1332623,11.6686726 L87.7228145,17.840708 L112.989339,17.840708 C113.408529,18.1263717 113.114499,18.8863009 113.032836,19.3722478 C112.438806,22.9040708 111.360981,26.3980885 110.730064,29.9260885 L85.5115139,29.9743009 C84.8626866,30.1945487 84.4307036,35.0482832 83.8848614,35.8938053 L110.750533,35.8938053 L108.191898,48 L68,48 L78.1279318,0 L118,0 Z"
                          className="svg-elem"></path>

                        <g id="group">
                          <mask id="mask-9z3bcfbp2n-2" fill="white">
                            <use xlinkHref="#path-9z3bcfbp2n-1"></use>
                          </mask>
                          <g id="Clip-4"></g>
                          <path
                            d="M44.5484942,30.672481 C43.6369216,34.1601855 42.3502837,37.0948777 40.1324788,39.9385435 C28.0481786,55.4312424 -2.16172007,50.8094556 0.122748964,27.9765993 L5.84733956,0 L18.8393787,0 L13.1475876,27.5812233 C12.2451734,40.7777001 30.3841898,38.4394988 31.9817846,27.4591408 L37.5819924,0 L51,0"
                            className="svg-elem" mask="url(#mask-9z3bcfbp2n-2)"></path>
                        </g>

                        <path
                          d="M120.705221,11.6887342 L123.39497,0 L145.56178,0.00424573989 C177.801018,2.69604483 171.345066,47.5474041 141.724125,48 L119,47.8847282 L129.665791,35.9981425 C135.974363,35.4867431 142.366969,37.0738007 147.947383,33.3899845 C154.358119,29.1580432 155.653618,18.4243882 148.929352,13.8476929 C147.754359,13.0480078 144.776461,11.6887342 143.420175,11.6887342 L120.705221,11.6887342 Z"
                          className="svg-elem"></path>

                        <polygon points="70 0 59.7432432 48 47 48 56.9459459 0" className="svg-elem"></polygon>

                        <polygon points="133 18 130.359061 29.1389362 113 48 119.628981 18" className="svg-elem"></polygon>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="tools-text font-bold ml-2" aria-label="UIED Tools">Tools</div>
            </div>
          </Link>

          {/* 主要内容区域 */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-8 mt-8">
            {/* 快捷链接区域 */}
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-8" aria-label="底部导航">
              {/* 工具快捷入口 */}
              <section className="w-full bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm transition-all duration-300" aria-labelledby="quick-tools">
                <h2 id="quick-tools" className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                  {t.footer.quickTools}
                </h2>
                <div className="flex flex-col space-y-4">
                  {/* 图像工具 */}
                  <div className="flex items-start gap-4 group/item">
                    <span className="text-sm font-medium text-gray-500 shrink-0 mt-0.5 w-12">{t.footer.image}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <a href="/tools/image-compress"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.imageCompress}
                      </a>
                      <a href="/tools/qrcode"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.qrcode}
                      </a>
                      <a href="/tools/img-cut"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.imgCut}
                      </a>
                      <a href="/tools/signimage"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.signImage}
                      </a>
                      <a href="/tools/gif-compress"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.gifCompress}
                      </a>
                    </div>
                  </div>

                  {/* PDF工具 */}
                  <div className="flex items-start gap-4 group/item">
                    <span className="text-sm font-medium text-gray-500 shrink-0 mt-0.5 w-12">{t.footer.pdf}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <a href="/tools/img-to-pdf"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.imgToPdf}
                      </a>
                      <a href="/tools/pdf-to-images"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.pdfToImages}
                      </a>
                      <a href="/tools/pdf-merge"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.pdfMerge}
                      </a>
                      <a href="/tools/pdf-split"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.pdfSplit}
                      </a>
                    </div>
                  </div>

                  {/* 文本工具 */}
                  <div className="flex items-start gap-4 group/item">
                    <span className="text-sm font-medium text-gray-500 shrink-0 mt-0.5 w-12">{t.footer.text}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <a href="/tools/diff"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.diff}
                      </a>
                      <a href="/tools/markdown"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.markdown}
                      </a>
                      <a href="/tools/wordcount"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.wordCount}
                      </a>
                    </div>
                  </div>

                  {/* 开发工具 */}
                  <div className="flex items-start gap-4 group/item">
                    <span className="text-sm font-medium text-gray-500 shrink-0 mt-0.5 w-12">{t.footer.dev}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <a href="/tools/json"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.json}
                      </a>
                      <a href="/tools/reg"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.reg}
                      </a>
                      <a href="/tools/timetran"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.timestamp}
                      </a>
                    </div>
                  </div>

                  {/* 文案工具 */}
                  <div className="flex items-start gap-4 group/item">
                    <span className="text-sm font-medium text-gray-500 shrink-0 mt-0.5 w-12">{t.footer.copywriting}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <a href="/tools/copywriting/kfc"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.kfc}
                      </a>
                      <a href="/tools/copywriting/daily-poem"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.poem}
                      </a>
                      <a href="/tools/copywriting/dog-diary"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.dogDiary}
                      </a>
                      <a href="/tools/copywriting/moments"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap hover:underline decoration-blue-200 underline-offset-4">
                        {t.footer.tools.moments}
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* 友情链接 */}
              <section className="w-full bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm transition-all duration-300" aria-labelledby="friend-links">
                <h2 id="friend-links" className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                  {t.footer.friendLinks}
                </h2>
                <div className="space-y-4">
                  {/* AI相关链接 */}
                  <div className="flex items-start gap-4 group/item">
                    <span className="text-sm font-medium text-gray-500 shrink-0 mt-0.5 w-12">{t.footer.ai}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <a href="https://www.uied.cn/category/aigc/ai" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.aiArticle}
                      </a>
                      <a href="https://hot.uied.cn/ai-realtime" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.aiNews}
                      </a>
                      <a href="https://hao.uied.cn/ai" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.aiTools}
                      </a>
                      <a href="https://www.uied.cn/wechat" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.aiChat}
                      </a>
                    </div>
                  </div>

                  {/* 设计相关链接 */}
                  <div className="flex items-start gap-4 group/item">
                    <span className="text-sm font-medium text-gray-500 shrink-0 mt-0.5 w-12">{t.footer.design}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <a href="https://www.uied.cn/category/wenzhang/ui-wenzhang" target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.designArticle}
                      </a>
                      <a href="https://hao.uied.cn/" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.designNav}
                      </a>
                      <a href="https://uiedtool.com/" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.designTools}
                      </a>
                      <a href="https://hot.uied.cn/" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.designNews}
                      </a>
                    </div>
                  </div>

                  {/* 其他友情链接 */}
                  <div className="flex items-start gap-4 group/item">
                    <span className="text-sm font-medium text-gray-500 shrink-0 mt-0.5 w-12">{t.footer.other}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <a href="https://uied.cn" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.aigcLearn}
                      </a>
                      <a href="https://fsuied.com" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.uiedTeam}
                      </a>
                      <a href="https://www.88sheji.cn/" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.baibaiNav}
                      </a>
                      <a href="https://www.tomda.top/" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.tomda}
                      </a>
                      <a href="https://fsuied.com/contact.html" target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap hover:underline decoration-purple-200 underline-offset-4">
                        {t.footer.links.applyLink}
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* 官方媒体 */}
              <section className="w-full md:col-span-2 bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300" aria-labelledby="official-media">
                <h2 id="official-media" className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-pink-500 to-red-500 rounded-full"></span>
                  {t.footer.officialMedia}
                </h2>
                <div className="flex flex-wrap gap-6">
                  <a href="https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi" target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors"></span>
                    知乎
                  </a>
                  <a href="https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83" target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-red-100 group-hover:bg-red-500 transition-colors"></span>
                    小红书
                  </a>
                  <a href="https://weibo.com/u/7542146005" target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-orange-100 group-hover:bg-orange-500 transition-colors"></span>
                    微博
                  </a>
                  <a href="https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0" target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm text-gray-600 hover:text-pink-500 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-pink-100 group-hover:bg-pink-500 transition-colors"></span>
                    B站
                  </a>
                </div>
              </section>
            </nav>
          </div>

          {/* 底部信息 */}
          <div className="w-full flex flex-col items-center text-sm text-gray-500 border-t border-gray-200/50 pt-8 mt-4 space-y-4">
            <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-6">
              {/* 左侧信息 */}
              <div className="flex flex-col space-y-3 text-center sm:text-left">
                <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                  <span itemProp="name" className="font-medium text-gray-700">UIED-Tools</span>
                  <span>是由</span>
                  <a href="https://fsuied.com" target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition-colors font-semibold hover:underline decoration-blue-200 underline-offset-4" itemProp="creator">
                    UIED技术团队
                  </a>
                  <span>设计开发的在线工具平台</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-400">
                  <span>{t.footer.techSupport}</span>
                  <a href="https://www.tomda.top/" target="_blank" rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors">
                    Tomda
                  </a>
                  <span>&</span>
                  <a href="https://fsuied.com" target="_blank" rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors">
                    UIED技术团队
                  </a>
                </div>
              </div>

              {/* 右侧信息 */}
              <div className="flex flex-col items-center sm:items-end space-y-2">
                <div className="text-gray-400 font-medium" itemProp="copyrightNotice">{t.footer.copyright}</div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
                  <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors whitespace-nowrap">
                    粤ICP备2022056875号
                  </a>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors whitespace-nowrap">
                    {t.footer.sitemap}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Logo 相关样式 */
        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
        }

        .logo-wrapper {
          background: #6C54FF;
          border-radius: 6px;
          padding: 1px;
          box-shadow: 0 4px 6px -1px rgba(108, 84, 255, 0.1), 0 2px 4px -1px rgba(108, 84, 255, 0.06);
          height: 32px;
          width: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .logo-svg {
          transform: scale(1.1);
          margin: 0 auto;
        }

        .svg-elem {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          stroke-width: 1;
          fill: transparent;
          stroke: #fff;
          stroke-linejoin: round;
          stroke-linecap: round;
          animation: draw 2s linear forwards, fill-color 2s linear forwards;
        }

        @keyframes draw {
          from {
            stroke-dashoffset: 1000;
          }

          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fill-color {
          0% {
            fill: transparent;
          }

          100% {
            fill: #fff;
          }
        }

        #矩形 {
          fill: #6C54FF;
        }

        .tools-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: #6C54FF;
          letter-spacing: 0.5px;
          height: 32px;
          line-height: 32px;
          display: flex;
          align-items: center;
        }
      `}</style>
    </footer>
  )
}