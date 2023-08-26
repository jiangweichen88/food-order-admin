import request from '@/utils/request'


export function getCommunityList(data) {
  return request({
    url: '/food/cms/meal/list/community',
    method: 'get',
    params: data
  })
}
// 生成随机的boundary字符串
const boundary = Math.random().toString().substr(2);
export function addMeal(data) {
  let formData = new FormData();  
  for(let i in data){
    formData.append(i, data[i]);  
  }

  return request({
    url: '/food/cms/meal/add',
    method: 'post',
    transformRequest: [function(data2, headers) {
      // 去除post请求默认的Content-Type
      delete headers.post['Content-Type']
      return data2
    }],
    // headers: {
    //   // 'Content-Type': `multipart/form-data; boundary=${boundary}`
    //   'Content-Type': `multipart/form-data`
    // },
    data:formData
  })
}
export function deleteMeal(data) {
  return request({
    url: `/food/cms/meal/delete?meal_id=${String(data.meal_id) }`,
    method: 'post',
    // data
  })
}
export function updateMeal(data) {
  let formData = new FormData();  
  for(let i in data){
    formData.append(i, data[i]);  
  }
  return request({
    url: '/food/cms/meal/update',
    method: 'post',
    transformRequest: [function(data2, headers) {
      // 去除post请求默认的Content-Type
      delete headers.post['Content-Type']
      return data2
    }],
    data:formData

  })
}
