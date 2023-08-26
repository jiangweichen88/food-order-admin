<template>
  <el-upload
    class="avatar-uploader"
    action="#"
    :show-file-list="false"
    :http-request="httpRequest"
    :on-success="handleAvatarSuccess"
    :before-upload="beforeAvatarUpload"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
  </el-upload>
</template>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<script>
export default {
  props: {
    imageUrl: "",
  },
  data() {
    return {};
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.$emit("update:imageUrl", URL.createObjectURL(file.raw));
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      // return isJPG && isLt2M;
      return isLt2M;
    },
    httpRequest(data) {
      this.$emit("update:file", data.file);
      let rd = new FileReader();
      let file = data.file;
      rd.readAsDataURL(file);
      rd.onloadend = (e) => {
        // 获取Base64字符串
        const base64String = event.target.result;
        this.$emit("update:imageUrl", base64String);
      };
      // _this.addData.icon 是新增的时候图片的参数字段，this.result就是选中的图片转成的base64
    },
  },
};
</script>
