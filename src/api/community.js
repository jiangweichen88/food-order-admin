import request from '@/utils/request'


export function getCommunitys(data) {
  return request({
    url: '/food/cms/community/list',
    method: 'get',
    params: data
  })
}