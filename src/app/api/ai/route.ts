/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

/**
 * AI API 代理路由
 * 解决前端直接调用第三方AI API时的CORS跨域问题
 */

import { NextRequest, NextResponse } from 'next/server'

// 在开发环境中设置环境变量来忽略SSL证书验证
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, apiKey, model, messages, stream = false, ...otherParams } = body

    if (!provider || !model || !messages) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 对于免费模型，不需要验证apiKey
    if (provider !== 'free' && !apiKey) {
      return NextResponse.json(
        { error: '缺少API密钥' },
        { status: 400 }
      )
    }

    let apiUrl = ''
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    let requestBody: any = {}

    // 根据不同的AI提供商配置请求
    switch (provider) {
      case 'openai':
        apiUrl = 'https://api.openai.com/v1/chat/completions'
        headers['Authorization'] = `Bearer ${apiKey}`
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      case 'claude':
        apiUrl = 'https://api.anthropic.com/v1/messages'
        headers['Authorization'] = `Bearer ${apiKey}`
        headers['anthropic-version'] = '2023-06-01'
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          stream
        }
        break

      case 'free':
      case 'siliconflow':
        apiUrl = 'https://api.siliconflow.cn/v1/chat/completions'
        // 免费模型使用环境变量中的API密钥
        if (provider === 'free') {
          headers['Authorization'] = `Bearer ${process.env.SILICONFLOW_API_KEY || 'sk-zmrdsvzbzkvkdiiawyjybagheekcjsfbpqffhzjizozmlsmf'}`
        } else {
          headers['Authorization'] = `Bearer ${apiKey}`
        }
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      case 'deepseek':
        apiUrl = 'https://api.deepseek.com/chat/completions'
        headers['Authorization'] = `Bearer ${apiKey}`
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      case 'custom':
        // 自定义端点的处理逻辑
        apiUrl = `${otherParams.customEndpoint || 'https://api.openai.com/v1'}/chat/completions`
        headers['Authorization'] = `Bearer ${apiKey}`
        requestBody = {
          model,
          messages,
          max_tokens: otherParams.max_tokens || 1000,
          temperature: otherParams.temperature || 0.7,
          stream
        }
        break

      default:
        return NextResponse.json(
          { error: '不支持的AI提供商' },
          { status: 400 }
        )
    }

    // 发送请求到AI API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`AI API错误 (${response.status}):`, errorText)
      return NextResponse.json(
        { error: `AI API调用失败: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // 如果是流式请求，直接返回流
    if (stream && provider !== 'custom') {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // 非流式请求的处理
    const data = await response.json()

    // 统一响应格式
    let content = ''
    if (provider === 'claude') {
      content = data.content?.[0]?.text || ''
    } else {
      content = data.choices?.[0]?.message?.content || ''
    }

    return NextResponse.json({
      success: true,
      content,
      usage: data.usage || null
    })

  } catch (error) {
    console.error('AI API代理错误:', error)
    
    // 提供更详细的错误信息
    let errorMessage = '服务器内部错误'
    if (error instanceof Error) {
      if (error.message.includes('UNABLE_TO_GET_ISSUER_CERT_LOCALLY')) {
        errorMessage = 'SSL证书验证失败，请检查网络连接或联系管理员'
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = '无法连接到AI服务，请检查网络连接'
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else {
        errorMessage = `请求失败: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}