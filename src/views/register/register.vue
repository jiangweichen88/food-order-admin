<template>
  <div class="register-container dis-f">
    <div class="flex1 dis-f a-center j-center" style="flex-direction: column">
      <h1 style="color: #fff">预约订餐管理系统</h1>
    </div>
    <div class="right-box dis-f" style="flex-direction: column">
      <!-- <article class="header dis-f a-center j-end">
        <header>
          <span class="login">
            <em class="bold">已有账号？</em>
            <a href="/login">
              <el-button type="primary" size="mini">登录</el-button>
            </a>
          </span>
        </header>
      </article> -->
      <section
        class="flex1 dis-f a-center j-center"
        style="flex-direction: column"
      >
        <!-- :rules="rules" -->
        <p style="font-size: 18px; font-weight: 500">请填写注册信息</p>
        <el-form
          :rules="rules"
          class="register-form"
          ref="ruleForm"
          :model="ruleForm"
          label-width="100px"
          autocomplete="off"
          size="medium"
        >
          <div style="padding-top: 10px">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="ruleForm.email"
                placeholder="输入邮箱并点击发送验证码"
              />
            </el-form-item>
            <el-form-item label="邮箱验证码" prop="captcha">
              <el-input
                v-model="ruleForm.captcha"
                maxlength="6"
                placeholder="请登录邮箱接收验证码"
              >
                <el-button
                  slot="append"
                  :loading="codeLoading"
                  :disabled="isDisable"
                  size="small"
                  @click="sendMsg"
                  >发送验证码</el-button
                >
              </el-input>
              <span class="status">{{ statusMsg }}</span>
            </el-form-item>
            <el-form-item label="用户名" prop="nick_name">
              <el-input v-model="ruleForm.nick_name" />
            </el-form-item>
            <el-form-item label="密码" prop="passwd" show-password>
              <el-input v-model="ruleForm.passwd" type="password" />
            </el-form-item>
            <el-form-item label="确认密码" prop="cpwd" show-password>
              <el-input v-model="ruleForm.cpwd" type="password" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%" @click="register"
                >注册</el-button
              >
            </el-form-item>
            <div class="tx-r">
              <a href="/login">
                <el-button
                  style="font-size: 14px; font-weight: 500"
                  type="text"
                  size="mini"
                  >去登录</el-button
                >
              </a>
            </div>
          </div>
        </el-form>
      </section>

      <div class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import { getEmailCode, register } from "@/api/register";
// import { encrypt } from "@/utils/rsaEncrypt";
export default {
  name: "Register",
  data() {
    return {
      statusMsg: "",
      error: "",
      isDisable: false,
      codeLoading: false,
      ruleForm: {
        email: "",
        captcha: "",
        pwd: "",
        cpwd: "",
      },
      rules: {
        email: [
          {
            required: true,
            type: "email",
            message: "请输入邮箱",
            trigger: "blur",
          },
        ],
        captcha: [
          {
            required: true,
            type: "string",
            message: "请输入验证码",
            trigger: "blur",
          },
        ],
        nick_name: [
          {
            required: true,
            type: "string",
            message: "请输入用户名",
            trigger: "blur",
          },
        ],
        passwd: [
          {
            required: true,
            message: "创建密码",
            trigger: "blur",
          },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
            message: "密码必须同时包含数字与字母,且长度为 8-20位",
          },
        ],
        cpwd: [
          {
            required: true,
            message: "确认密码",
            trigger: "blur",
          },
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("请再次输入密码"));
              } else if (value !== this.ruleForm.passwd) {
                callback(new Error("两次输入密码不一致"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    sendMsg: function () {
      const self = this;
      let emailPass;
      let timerid;
      if (timerid) {
        return false;
      }
      self.statusMsg = "";
      this.$refs["ruleForm"].validateField("email", (valid) => {
        emailPass = valid;
      });
      // 向后台API验证码发送
      if (!emailPass) {
        self.codeLoading = true;
        self.statusMsg = "验证码发送中...";
        getEmailCode(self.ruleForm.email)
          .then((res) => {
            this.$message({
              showClose: true,
              message: "发送成功，验证码有效期30分钟",
              type: "success",
            });
            let count = 60;
            self.ruleForm.captcha = "";
            self.codeLoading = false;
            self.isDisable = true;
            self.statusMsg = `验证码已发送,${count--}秒后重新发送`;
            timerid = window.setInterval(function () {
              self.statusMsg = `验证码已发送,${count--}秒后重新发送`;
              if (count <= 0) {
                window.clearInterval(timerid);
                self.isDisable = false;
                self.statusMsg = "";
              }
            }, 1000);
          })
          .catch((err) => {
            this.isDisable = false;
            this.statusMsg = "";
            this.codeLoading = false;
            console.log(err.response.data.message);
          });
      }
    },

    // 用户注册
    register: function () {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          const user = {
            nick_name: this.ruleForm.nick_name,
            email: this.ruleForm.email,
            captcha: this.ruleForm.captcha,
            password: this.ruleForm.passwd,
            // password: encrypt(this.ruleForm.passwd),
          };
          register(this.ruleForm.captcha, user)
            .then((res) => {
              this.$message({
                showClose: true,
                message: "注册成功，正在跳转到登录界面...",
                type: "success",
              });
              setTimeout(() => {
                this.$router.push("/");
              }, 2000);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    },
  },
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

// @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
//   .register-container .el-input input {
//     color: $cursor;
//   }
// }

/* reset element-ui css */
.register-container {
  // .el-input {
  //   display: inline-block;
  //   height: 47px;
  //   width: 95%;

  //   input {
  //     background: rgba(0, 0, 0, 0.1);
  //     border-radius: 5px;
  //     border: 1px solid rgba(255, 255, 255, 0.1);
  //     -webkit-appearance: none;
  //     padding: 12px 5px 12px 15px;
  //     color: $light_gray;
  //     height: 47px;
  //     caret-color: $cursor;

  //     &:-webkit-autofill {
  //       box-shadow: 0 0 0px 1000px $bg inset !important;
  //       -webkit-text-fill-color: $cursor !important;
  //     }
  //   }
  // }

  // .el-form-item {
  //   label {
  //     font-style: normal;
  //     font-size: 12px;
  //     color: $light_gray;
  //   }
  // }
}
</style>

<style lang="scss" scoped>
$bg: #081c42;
$dark_gray: #889aa4;
$light_gray: #eee;

.register-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .header {
    border-bottom: 1px solid rgb(235, 232, 232);
    color: #666;

    header {
      padding: 10px;

      .login {
        float: right;
      }

      .bold {
        font-style: normal;
        color: #222;
      }
    }
  }

  > section {
    margin: 0 auto 30px;
    padding-top: 30px;
    width: 980px;
    min-height: 300px;
    padding-right: 100px;
    box-sizing: border-box;

    .status {
      font-size: 12px;
      margin-left: 20px;
      color: #e6a23c;
    }

    .error {
      color: red;
    }
  }

  .tips {
    float: right;
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
}
</style>

<style scoped>
/* 修改验证器样式 */
/* /deep/ .el-form-item.is-error .el-input__inner {
  border-color: #889aa4;
}
/deep/ .el-form-item.is-error .el-input__validateIcon {
  color: #889aa4;
}
/deep/ .el-form-item__error {
  color: #e6a23c;
} */
.right-box {
  width: 600px;
  background: #fff;
}
.register-form {
  width: 380px;
}
</style>
