import request from '@/utils/request'


export function getList(data) {
  return request({
    url: '/food/cms/order/list',
    method: 'get',
    params: data
  })
}
export function getDetail(data) {
    return request({
      url: '/food/cms/order/detail',
      method: 'get',
      params: data
    })
  }

