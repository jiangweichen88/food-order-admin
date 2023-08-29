<template>
  <div class="app-container">
    <div class="tx-r">
      <el-form
        size="small"
        :inline="true"
        :model="listQuery"
        class="demo-form-inline"
      >
        <el-form-item label="状态">
          <el-select
            style="width: 100px"
            clearable
            v-model="listQuery.is_audit"
            placeholder="请选择"
          >
            <el-option
              v-for="item in auditStatusOptions._data_"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-button
        size="small"
        @click="handleFilter"
        v-waves
        class="filter-item marl10"
        type="primary"
        icon="el-icon-search"
      >
        筛选
      </el-button>
      </el-form>
    
    </div>
    <div class="flex1" ref="tableParentBox" style="height: 0">
      <el-table
        :max-height="tableMaxH"
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column label="uid" prop="uid" align="center" width="80">
          <template slot-scope="{ row }">
            <span>{{ row.uid }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户名" width="150px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.nickname }}</span>
          </template>
        </el-table-column>
          <el-table-column label="账号" width="150px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.login_email }}</span>
          </template>
        </el-table-column>
        </el-table-column>
        <el-table-column label="类别" width="110px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.is_admin ? "管理员" : "普通用户" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.is_audit ? "已审核" : "未审核" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核结果" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.status ? "审核通过" : "未通过" }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="创建日期" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.create_time }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.actions')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row, $index }">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              {{ row.is_audit?'修改': '审核'}} 
            </el-button>

            <!-- <el-button
              v-if="!row.state"
              size="mini"
              type="success"
              @click="handleModifyStatus(row, 1)"
            >
              审核通过
            </el-button>

            <el-button
              v-if="row.state"
              size="mini"
              @click="handleModifyStatus(row, 0)"
            >
              取消审核
            </el-button>

            <el-button
              v-if="row.status != 'deleted'"
              size="mini"
              type="danger"
              @click="handleDelete(row, $index)"
            >
              {{ $t("table.delete") }}
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.size"
        @pagination="getAuditList"
      />
    </div>
    <!-- 新增 编辑 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="right"
        label-width="90px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="绑定社区" prop="community_ids">
          <el-select
          collapse-tags
            clearable
            multiple
            v-model="temp.community_ids"
            class="filter-item"
            placeholder="请选择"
          >
            <el-option
              v-for="item in communitys"
              :multiple-limit="3"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审核通过" prop="audit_approved">
          <el-select
            v-model="temp.audit_approved"
            class="filter-item"
            placeholder="请选择"
          >
            <el-option
              v-for="item in blOptions"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item   label="设为管理员" prop="set_admin">
          <!-- v-if="!temp.is_audit" -->
          <el-select
            clearable
            v-model="temp.set_admin"
            class="filter-item"
            placeholder="请选择"
          >
            <el-option
              v-for="item in blOptions"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="temp.is_audit" label="更新账户名" prop="nickname">
          <el-input
            v-model="temp.nickname"
            type="nickname"
            placeholder="请输入账户名"
          />
        </el-form-item>
        <el-form-item v-if="temp.is_audit" label="更新密码" prop="password">
          <el-input
            v-model="temp.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{
          $t("table.confirm")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAuditList, updateAudit ,updateUser} from "@/api/user";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import Upload from "@/components/common/upload";
import tableMixins from "@/mixins/table";
import { get } from "lodash-es";
import { typeOptions, statusOptions,auditStatusOptions } from "@/dict";
import dayjs from "dayjs";
import { mapGetters } from "vuex";

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = typeOptions._data_.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});
const statusMap = {
  published: "上架",
  draft: "info",
  deleted: "danger",
};
const format = "YYYY-MM-DD";
export default {
  name: "user-management",
  components: { Pagination, Upload },
  directives: { waves },
  mixins: [tableMixins],
  filters: {},
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      typeOptions,
      auditStatusOptions,
      listQuery: {
        page: 1,
        size: 20,
        is_audit:0,
      },
      mealOptions: [],
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],
      blOptions: [
        { name: "是", key: true },
        { name: "否", key: false },
      ],
      statusOptions: statusOptions,
      showReviewer: false,
      temp: {
        audit_approved: "",
        community_ids: [],
        set_admin: 0,
        nickname: "",
        password: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑用户",
        create: "新增套餐",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [
          { required: true, message: "套餐分类是必填", trigger: "change" },
        ],
        picture: [
          {
            required: true,
            message: "图片是必填",
            trigger: "change",
          },
        ],
        name: [{ required: true, message: "套餐名称是必填", trigger: "blur" }],
      },
      downloadLoading: false,
    };
  },
  computed: {
    ...mapGetters(["communitys"]),
    community_id() {
      return this.$store.getters.community_id;
    },
  },
  watch: {
    community_id: {
      handler(val) {
        if (!val) return;
        this.listQuery.page = 1;
        this.getAuditList();
      },
      immediate: true,
    },
  },
  created() {

  },
  methods: {
    getAuditList() {
      this.listLoading = true;
      // community_id
      let ps = {
        // is_audit: this.listQuery.is_audit,
        ...this.listQuery
      };
      getAuditList(ps)
        .then((res) => {
          this.list = (get(res, "data.list", null) || []).map((v) => ({
            ...v,
          }));
          this.total = get(res, "data.total", 0);
          this.listLoading = false;
        })
        .catch((err) => {
          this.listLoading = false;
        });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getAuditList();
    },
    handleModifyStatus(row, status) {
      let ps = {
        set_admin: false,
        email: row.login_email,
        audit_approved: status ? true : false,
      };
      updateAudit(ps).then((res) => {
        this.$message({
          message: "操作成功",
          type: "success",
        });
        row.is_audit = status;
      });
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        date: "",
        community_ids: [],
        price: "",
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let ps = {
            date: dayjs(this.temp.date).format(format),
            price: Number(this.temp.price),
            community_id: this.community_id,
            community_ids: this.temp.community_ids,
          };
          addList(ps).then(() => {
            // this.list.unshift(this.temp);
            this.handleFilter();
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "创建成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row,{audit_approved:row.status,set_admin:row.is_admin}); // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      const is_audit=this.temp.is_audit;
      const fn=is_audit?updateUser:updateAudit;
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let ps = {
            community_ids: this.temp.community_ids,
            email: this.temp.login_email,
            audit_approved: this.temp.audit_approved,
            set_admin: this.temp.set_admin,
          };
          if(is_audit){
            ps= {
              uid: this.temp.uid+'',
              community_ids: this.temp.community_ids,
              status: this.temp.audit_approved,
            }
            if(this.temp.nickname){
            ps.nickname = this.temp.nickname;
          }
          if(this.temp.password){
            ps.password = this.temp.password;
          }
          }

          fn(ps).then(() => {
            // const index = this.list.findIndex((v) => v.id === this.temp.id);
            // this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.getAuditList();
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      deleteList({ meal_package_id: row.id }).then((res) => {
        this.$notify({
          title: "成功",
          message: "删除成功",
          type: "success",
          duration: 2000,
        });
        this.list.splice(index, 1);
      });
    },
    handleFetchPv(pv) {
      fetchPv(pv).then((response) => {
        this.pvData = response.data.pvData;
        this.dialogPvVisible = true;
      });
    },
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["timestamp", "title", "type", "importance", "status"];
        const filterVal = [
          "timestamp",
          "title",
          "type",
          "importance",
          "status",
        ];
        const data = this.formatJson(filterVal);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "table-list",
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending";
    },
  },
};
</script>
