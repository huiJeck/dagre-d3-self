import request from '@/utils/request'

// 登录方法
export function login(data) {
  return request({
    url: '/person/login/auth',
    method: 'post',
    data: data
  })
}
// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/admin/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/person/login/verifyCode',
    method: 'get'
  })
}
export function sm3e(item) {
  return request({
    url: '/person/login/sm3e/' + item,
    method: 'post',
    data: item
  })
}
export function sm4e(item) {
  return request({
    url: '/person/login/sm4e/' + item,
    method: 'post',
    data: item
  })
}
export function codeBase64e(item) {
  return request({
    url: '/person/login/base64e/' + item,
    method: 'get',
    data: item
  })
}
