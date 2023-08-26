import request from '@/utils/request'


export function getList(data) {
  return request({
    url: '/food/cms/meal/package/list/community',
    method: 'get',
    params: data
  })
}
export function addList(data) {
  return request({
    url: '/food/cms/meal/package/add',
    method: 'post',
    data
  })
}
export function deleteList(data) {
  return request({
    url: '/food/cms/meal/package/delete?meal_package_id='+data.meal_package_id,
    method: 'post',
  })  
}
export function updateList(data) {
  return request({
    url: '/food/cms/meal/package/update',
    method: 'post',
    data

  })
}
