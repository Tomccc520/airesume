#!/usr/bin/env bash

# 统一在 macOS 下为 Node 进程补充系统根证书与钥匙串证书。
# 解决本机 curl 能访问、但 Next/Node fetch 因证书链不完整而失败的问题。

set -euo pipefail

CA_OUTPUT_FILE="/tmp/uied-resume-node-extra-ca.pem"
SYSTEM_ROOT_KEYCHAIN="/System/Library/Keychains/SystemRootCertificates.keychain"
SYSTEM_KEYCHAIN="/Library/Keychains/System.keychain"
LOGIN_KEYCHAIN="${HOME}/Library/Keychains/login.keychain-db"

##
# 判断当前是否为可注入证书链的 macOS 环境
# 仅在 macOS 且 security 命令存在时生成证书包，其它系统直接透传原命令。
##
is_macos_security_ready() {
  [[ "$(uname -s)" == "Darwin" ]] && command -v security >/dev/null 2>&1
}

##
# 生成给 Node 使用的额外 CA 证书包
# 合并系统根证书、系统钥匙串和登录钥匙串，保证代理证书与企业证书也能被 Node 识别。
##
build_macos_ca_bundle() {
  : > "${CA_OUTPUT_FILE}"

  if [[ -f "${SYSTEM_ROOT_KEYCHAIN}" ]]; then
    security find-certificate -a -p "${SYSTEM_ROOT_KEYCHAIN}" >> "${CA_OUTPUT_FILE}"
  fi

  if [[ -f "${SYSTEM_KEYCHAIN}" ]]; then
    security find-certificate -a -p "${SYSTEM_KEYCHAIN}" >> "${CA_OUTPUT_FILE}"
  fi

  if [[ -f "${LOGIN_KEYCHAIN}" ]]; then
    security find-certificate -a -p "${LOGIN_KEYCHAIN}" >> "${CA_OUTPUT_FILE}"
  fi
}

##
# 以补充后的证书环境执行目标命令
# 仅设置当前进程树的 NODE_EXTRA_CA_CERTS，不污染全局 shell 环境。
##
run_with_macos_ca_bundle() {
  build_macos_ca_bundle
  export NODE_EXTRA_CA_CERTS="${CA_OUTPUT_FILE}"
  exec "$@"
}

if is_macos_security_ready; then
  run_with_macos_ca_bundle "$@"
else
  exec "$@"
fi
