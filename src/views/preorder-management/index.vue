<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-select v-model="listQuery.importance" :placeholder="$t('table.importance')" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select> -->
      <div class="tx-r">
        <el-button
          v-waves
          :loading="downloadLoading"
          class="filter-item"
          type="primary"
          icon="el-icon-download"
          @click="handleDownload"
        >
          {{ $t("table.export") }}
        </el-button>
      </div>

      <el-form
        size="small"
        :inline="true"
        :model="listQuery"
        class="demo-form-inline"
      >
        <el-form-item label="预订日期">
          <el-date-picker
            v-model="listQuery.date"
            type="datetime"
            placeholder="选择日期时间"
            align="right"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预订人手机号">
          <el-input
            clearable
            v-model="listQuery.phone"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="预订单号">
          <el-input
            clearable
            v-model="listQuery.order_id"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            style="width: 100px"
            clearable
            v-model="listQuery.status"
            placeholder="请选择"
          >
            <el-option
              v-for="item in orderStatusOptions._data_"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="handleFilter"
            v-waves
            class="filter-item marl10"
            type="primary"
            icon="el-icon-search"
          >
            <!-- {{ $t('table.search') }} -->
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="flex1" ref="tableParentBox" style="height: 0">
      <!-- @sort-change="sortChange" -->
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
        <!-- sortable="custom" -->
        <el-table-column label="预定单号" prop="id" align="center" width="180">
          <template slot-scope="{ row }">
            <span>{{ row.order_id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="套餐日期" min-width="160" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.provide_time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类别" min-width="140px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.tag }}</span>

            <!-- <span>{{ typeOptions.getName(row.type)  }}</span> -->
          </template>
        </el-table-column>
        <el-table-column label="餐品" min-width="170" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="份数" prop="id" align="center" width="80">
          <template slot-scope="{ row }">
            <span>{{ row.count }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="预订人手机号"
          prop="id"
          align="center"
          width="150"
        >
          <template slot-scope="{ row }">
            <span>{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" class-name="status-col" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="row.status | statusFilter">
              {{ orderStatusOptions.getName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('table.actions')"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row, $index }">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.current_page"
        :limit.sync="listQuery.pageSize"
        @pagination="getList"
      />
    </div>
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
    <el-drawer
      :size="500"
      title="订单详情"
      :visible.sync="drawer"
      direction="rtl"
    >
      <div style="padding: 0 16px">
        <template v-for="(value, name) in detailFields">
          <el-divider v-if="name === 'name'"></el-divider>
          <div class="dis-f el-descriptions-item__container">
            <span class="txt el-descriptions-item__label">
              {{ detailFields[name] }}
            </span>
            <span class="flex1">
              <template v-if="name === 'status'">
                {{ orderStatusOptions.getName(detail[name] || 0) }}
              </template>
              <template v-else>
                {{ detail[name] | detailFilter(name) }}
              </template>
            </span>
          </div>
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  getList,
  getDetail,
  addMeal,
  updateMeal,
  deleteMeal,
} from "@/api/preorder-management";

import waves from "@/directive/waves"; // waves directive
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import tableMixins from "@/mixins/table";
import { get } from "lodash-es";
import { typeOptions, orderStatusOptions } from "@/dict";
import dayjs from "dayjs";
// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = typeOptions._data_.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});
const format = "YYYY-MM-DD";

export default {
  name: "preorder-management",
  components: { Pagination },
  directives: { waves },
  mixins: [tableMixins],
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: "success",
        0: "info",
        true: "success",
        false: "info",
        deleted: "danger",
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    },
    detailFilter(value, name) {
      let txt = value === 0 ? 0 : value || "";
      if (name.indexOf("cost") > -1) {
        txt = "￥" + txt;
      }
      return txt;
    },
  },
  data() {
    return {
      tableKey: 0,
      drawer: false,
      pickerOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      detail: {},
      detailFields: {
        order_id: "预定单号",
        order_time: "下单时间",
        status: "订单状态",
        provide_time: "预定日期",
        meal_package_title: "预定餐品",
        count: "餐品份数",
        origin_cost: "餐品价格",
        discounted_cost: "优惠金额",
        total_cost: "应付金额",
        name: "姓名",
        id_card: "身份证号",
        addr: "门牌号",
        phone: "手机号",
      },
      list: [],
      total: 0,
      listLoading: true,
      typeOptions: typeOptions,
      listQuery: {
        current_page: 1,
        pageSize: 20,
        name: "",
        type: "",
        status: "",
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],
      orderStatusOptions: orderStatusOptions,
      showReviewer: false,
      temp: {
        name: "",
        type: "",
        picture: "",
        pic: "",
        available: false,
        // status: "published",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑餐品",
        create: "新增餐品",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [
          { required: true, message: "餐品分类是必填", trigger: "change" },
        ],
        picture: [
          {
            required: true,
            message: "图片是必填",
            trigger: "change",
          },
        ],
        name: [{ required: true, message: "餐品名称是必填", trigger: "blur" }],
      },
      downloadLoading: false,
    };
  },
  computed: {
    community_id() {
      return this.$store.getters.community_id;
      // return 1;
    },
  },
  watch: {
    community_id: {
      handler(val) {
        if (!val) return;
        this.listQuery.current_page = 1;
        this.getList();
      },
      immediate: true,
    },
  },
  created() {},
  methods: {
    getList() {
      this.listLoading = true;
      // community_id
      let ps = {
        community_id: this.community_id,
        ...this.listQuery,
      };
      if (this.listQuery.date) {
        ps.date = dayjs(this.listQuery.date).format(format);
      }
      getList(ps)
        .then((res) => {
          this.list = (get(res, "data.orders") || []).map((v) => ({
            ...v,
            type: String(v.type),
          }));
          this.total = get(res, "data.total_records", 0);
          this.listLoading = false;
        })
        .catch((err) => {});
      // fetchList(this.listQuery).then((response) => {
      //   this.list = response.data.items;
      //   this.total = response.data.total;

      //   // Just to simulate the time of the request
      //   setTimeout(() => {
      //     this.listLoading = false;
      //   }, 1.5 * 1000);
      // });
    },
    handleFilter() {
      this.listQuery.current_page = 1;
      this.getList();
    },
    handleUpdate(row) {
      this.detail = Object.keys(this.detailFields).map((v) => ({
        [v]: "",
      }));
      this.drawer = true;
      getDetail({ order_id: row.order_id }).then((res) => {
        const discounted_cost =
          get(res, "data.discount_info[0].origin_cost", 0) -
          get(res, "data.discount_info[0].total_cost", 0);
        this.detail = {
          ...res.data,
          ...get(res, "data.discount_info[0]"),
          discounted_cost: discounted_cost,
        };
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
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = [
          "预定单号",
          "套餐日期",
          "类别",
          "餐品",
          "份数",
          "预订人手机号",
          "订单状态",
        ];

        const filterVal = [
          "order_id",
          "provide_time",
          "tag",
          "title",
          "count",
          "phone",
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
          if (j === "status") {
            return orderStatusOptions.getName(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
  },
};
</script>
<style scoped>
.filter-container {
  padding-bottom: 0;
}
.el-descriptions-item__container {
  font-size: 14px;
  margin-bottom: 10px;
}
.el-descriptions-item__label:after {
  content: ":";
  position: relative;
  top: -0.5px;
}
</style>
