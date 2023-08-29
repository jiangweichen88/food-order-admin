import request from '@/utils/request'

//在注册时根据邮箱名获取验证码
export function getEmailCode(email) {
  return request({
    url: '/food/cms/user/send-email-code',
    method: 'post',
    data:{
      email
    }  
  })
}

//提交注册
export function register(code, data) {
  return request({
    url: '/food/cms/user/register',
    method: 'post',
    data
  })
}


