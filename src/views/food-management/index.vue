<template>
  <div class="app-container">
    <div class="tx-r">
      <el-button
        class="filter-item"
        style="margin-left: 10px; width: 120px; margin-bottom: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        {{ $t("table.add") }}餐品
      </el-button>
    </div>

    <div class="filter-container">
      <!-- <el-select v-model="listQuery.importance" :placeholder="$t('table.importance')" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select> -->

      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('table.reviewer') }}
      </el-checkbox> -->
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="餐品名称">
          <el-input clearable v-model="listQuery.name" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="类别">
          <el-select clearable v-model="listQuery.type" placeholder="请选择">
            <el-option
              v-for="item in typeOptions._data_"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item  label="状态">
          <el-select clearable v-model="listQuery.status" placeholder="请选择">
            <el-option
              v-for="item in statusOptions._data_"
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
            筛选
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
        <el-table-column label="餐品ID" prop="id" align="center" width="80">
          <template slot-scope="{ row }">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="110px" align="center">
          <template slot-scope="{ row }">
            <img class="w100" style="    max-height: 100px;" :src="row.picture"></img>
          </template>
        </el-table-column>
        <el-table-column label="餐品名称" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类别" width="110px" align="center">
          <template slot-scope="{ row }">
            <span>{{ typeOptions.getName(row.type)  }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.status')"
          class-name="status-col"
          width="100"
        >
          <template slot-scope="{ row }">
            <el-tag :type="row.available | statusFilter">
              {{ statusOptions.getName(row.available)  }}
            </el-tag>
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
              v-if="!row.available"  
              size="mini"
              type="success"
              @click="handleModifyStatus(row, 1)"
            >
              上架
            </el-button>

            <el-button
              v-if="row.available"
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
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="90px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="餐品名称" prop="name">
          <el-input clearable v-model="temp.name" />
        </el-form-item>
        <el-form-item label="图片" prop="picture">
          <Upload :imageUrl.sync="temp.picture" :file.sync="temp.pic"  
          />
        </el-form-item>

        <el-form-item label="餐品分类" prop="type">
          <el-select
          clearable
            v-model="temp.type"
            class="filter-item"
            placeholder="请选择"
          >
            <el-option
              v-for="item in typeOptions._data_"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item :label="$t('table.date')" prop="timestamp">
          <el-date-picker
            v-model="temp.timestamp"
            type="datetime"
            placeholder="Please pick a date"
          />
        </el-form-item> -->

        <!-- <el-form-item :label="$t('table.status')">
          <el-select
            v-model="temp.status"
            class="filter-item"
            placeholder="请选择"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item> -->
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

<script>;
import { getCommunityList,addMeal,updateMeal,deleteMeal } from "@/api/food-management";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import Upload from "@/components/common/upload";
import tableMixins from "@/mixins/table";
import { get } from "lodash-es";
import { typeOptions ,statusOptions} from "@/dict";
// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = typeOptions._data_.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});
export default {
  name: "food-management",
  components: { Pagination, Upload },
  directives: { waves },
  mixins: [tableMixins],
  filters: {
    statusFilter(status) {
      const statusMap = {
        '1': "success",
        '0': "info",
        true: "success",
        false: "info",
        deleted: "danger",
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    },
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      typeOptions:typeOptions,
      listQuery: {
        page: 1,
        limit: 20,
        name: "",
        type: "",
        status: "",
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],
      statusOptions: statusOptions,
      showReviewer: false,
      temp: {
        name: "",
        type: "",
        picture:'',
        pic:'',
        available:false,
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
      return this.$store.getters.community_id
    },
  },
  watch: {
    community_id:{
      handler(val) {
        if (!val) return;
        this.listQuery.page = 1;
        this.getList();
      },
      immediate: true,
    }
  },
  created() {
  },
  methods: {
    getList() {
      this.listLoading = true;
      // community_id
      let ps={
      community_id:this.community_id,
      ...this.listQuery
      }
      getCommunityList(ps)
        .then((res) => {
          console.log(res);
          this.list = (res.data||[]).map(v=>({
            ...v,
            ...v.meal_info,
            type:String(get(v,'meal_info.type')) ,
          }));
          this.total = get(res, "data.total", 0);
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
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      let ps={
        id:row.id,
        available:status
      }
      updateMeal(ps).then(res=>{
        console.log(res)
        this.$message({
        message: "操作成功",
        type: "success",
      })
      row.available = status;
      })

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
        name: "",
        type: "",
        picture:'',
        pic:'',
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
      console.log(this.temp)
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let ps={
            name:this.temp.name,
            type:this.temp.type,
            pic:this.temp.pic,
            community_id:this.community_id,
            available:0
          }
          addMeal(ps).then(() => {
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
          let ps={
            id:this.temp.id,
            name:this.temp.name,
            type:this.temp.type,
            available:this.temp.available,
            community_id:this.community_id
          }
          if(this.temp.pic) ps.pic=this.temp.pic
          updateMeal(ps).then(() => {
            const index = this.list.findIndex((v) => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
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
      deleteMeal({meal_id: row.id}).then(res=>{
        this.$notify({
        title: "成功",
        message: "删除成功",
        type: "success",
        duration: 2000,
      });
      this.list.splice(index, 1);
      })

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
