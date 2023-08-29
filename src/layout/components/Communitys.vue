<template>
  <el-select v-model="value" size="small" placeholder="请选择社区">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
    </el-option>
  </el-select>
</template>
<script>
import { getCommunitys } from "@/api/community";
import { mapGetters } from "vuex";
export default {
  components: {},
  data() {
    return {
      value: "",
      options: [],
    };
  },
  computed: {
    ...mapGetters(["userinfo"]),
  },
  watch: {
    value(val) {
      this.$store.commit("user/SET_COMMUNITY_ID", val);
    },
  },
  methods: {},
  created() {
    getCommunitys().then((res) => {
      this.options = res.data
        .map((v) => {
          return {
            label: v.name,
            value: v.id,
          };
        })
        .filter((v) => {
          return (
            this.userinfo.community_ids &&
            this.userinfo.community_ids.length > 0 &&
            this.userinfo.community_ids.indexOf(v.value) > -1
          );
        });
      this.$store.commit("user/SET_COMMUNITYS", this.options);
      if (this.options.length > 0) {
        this.value = this.options[0].value;
      }
    });
  },
  mounted() {},
};
</script>
<style scoped></style>
