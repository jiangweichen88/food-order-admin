<template>
  <div class="app-container">
    <div class="tx-r">
      <el-button
        @click="handleFilter"
        v-waves
        class="filter-item marl10"
        type="primary"
        icon="el-icon-search"
      >
        筛选
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px; width: 120px; margin-bottom: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        {{ $t("table.add") }}套餐
      </el-button>
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
        <el-table-column label="套餐ID" prop="id" align="center" width="80">
          <template slot-scope="{ row }">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="套餐日期" width="150px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类别" width="110px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.meal_package_tag }}</span>
          </template>
        </el-table-column>
        <el-table-column label="餐品" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.meals | mealsFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" align="center">
          <template slot-scope="{ row }">
            <span>￥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.actions')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row, $index }">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              修改
            </el-button>

            <el-button
              v-if="!row.state"
              size="mini"
              type="success"
              @click="handleModifyStatus(row, 1)"
            >
              上架
            </el-button>

            <el-button
              v-if="row.state"
              size="mini"
              @click="handleModifyStatus(row, 0)"
            >
              下架
            </el-button>

            <el-button
              v-if="row.status != 'deleted'"
              size="mini"
              type="danger"
              @click="handleDelete(row, $index)"
            >
              {{ $t("table.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
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
        <el-form-item label="选择日期" prop="date">
          <!-- <el-date-picker
            v-model="temp.date"
            type="datetime"
            placeholder="请选择"
          /> -->
          <el-date-picker
            v-model="temp.date"
            type="date"
            placeholder="选择日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="选择餐品" prop="meal_ids">
          <el-select
            clearable
            multiple
            v-model="temp.meal_ids"
            class="filter-item"
            placeholder="请选择"
          >
            <el-option
              v-for="item in mealOptions"
              :multiple-limit="3"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="套餐价格" prop="price">
          <el-input type="number" clearable v-model="temp.price" />
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
import {
  getList,
  addList,
  updateList,
  deleteList,
} from "@/api/package-management";
import { getCommunityList } from "@/api/food-management";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import Upload from "@/components/common/upload";
import tableMixins from "@/mixins/table";
import { get } from "lodash-es";
import { typeOptions, statusOptions } from "@/dict";
import dayjs from "dayjs";

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
  name: "package-management",
  components: { Pagination, Upload },
  directives: { waves },
  mixins: [tableMixins],
  filters: {
    mealsFilter(meals) {
      return meals && meals.length
        ? meals.map((v) => get(v, "meal_info.name")).join(" + ")
        : "";
    },
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      typeOptions: typeOptions,
      listQuery: {
        page: 1,
        limit: 20,
        name: "",
        type: "",
        status: "",
      },
      mealOptions: [],
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],
      statusOptions: statusOptions,
      showReviewer: false,
      temp: {
        date: "",
        meal_ids: [],
        price: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑套餐",
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
    community_id() {
      return this.$store.getters.community_id;
    },
  },
  watch: {
    community_id: {
      handler(val) {
        if (!val) return;
        this.listQuery.page = 1;
        this.getList();
        this.getCommunityList();
      },
      immediate: true,
    },
  },
  created() {},
  methods: {
    getCommunityList() {
      getCommunityList({ community_id: this.community_id }).then((res) => {
        console.log(res);
        this.mealOptions = (res.data || []).map((v) => ({
          key: v.id,
          name: get(v, "meal_info.name"),
        }));
      });
    },
    getList() {
      this.listLoading = true;
      // community_id
      let ps = {
        community_id: this.community_id,
        // date: dayjs(new Date()).format(format),
      };
      getList(ps)
        .then((res) => {
          console.log(res);
          this.list = (res.data || []).map((v) => ({
            ...v,
            meal_ids: v.meals ? v.meals.map((v) => v.id) : [],
          }));
          console.log(this.list);
          this.total = get(res, "data.total", 0);
          this.listLoading = false;
        })
        .catch((err) => {
          this.listLoading = false;
        });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      let ps = {
        id: row.id,
        available: status ? true : false,
      };
      updateList(ps).then((res) => {
        console.log(res);
        this.$message({
          message: "操作成功",
          type: "success",
        });
        row.state = status;
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
        meal_ids: [],
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
      console.log(this.temp);
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let ps = {
            date: dayjs(this.temp.date).format(format),
            price: Number(this.temp.price),
            community_id: this.community_id,
            meal_ids: this.temp.meal_ids,
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
      this.temp = Object.assign({}, row); // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let ps = {
            id: String(BigInt(this.temp.id)),
            available: this.temp.available || false,
            meal_package_info: {
              date: dayjs(new Date()).format(format),
              price: Number(this.temp.price),
              community_id: String(this.community_id),
              meal_ids: this.temp.meal_ids,
            },
          };
          updateList(ps).then(() => {
            // const index = this.list.findIndex((v) => v.id === this.temp.id);
            // this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.getList();
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
