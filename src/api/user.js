import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/food/cms/user/login', 
    method: 'post',
    data
  })
}
export function getInfo(token) {
  return request({
    url: '/food/cms/user/info',
    method: 'get',
    // params: { token }
  })
}

export function logout() {
  return request({
    url: '/food/cms/user/logout',
    method: 'post'
  })
}

export function getAuditList(data) {
const params = new URLSearchParams(data).toString();
const url =  '/food/cms/user/audit/list'+ '?'+ params; 
  return request({
    url: url,
    method: 'post',
    // data
  })
}
export function updateAudit(data) {
  return request({
    url: '/food/cms/user/audit',
    method: 'post',
    data
  })
}
export function updateUser(data) {
  return request({
    url: '/food/cms/user/update',
    method: 'post',
    data
  })
}