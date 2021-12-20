import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function refreshToken() {
  return request({
    url: '/webapi/refresh_token',
    method: 'get'
  })
}

export function getInfo() {
  return request({
    url: '/webapi/user_info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/webapi/logout',
    method: 'post'
  })
}
