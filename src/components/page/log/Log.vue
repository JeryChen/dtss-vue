<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
      <el-breadcrumb-item>
        <el-icon class="el-icon-document"></el-icon>
        <span> 日志管理</span></el-breadcrumb-item>
    </el-breadcrumb>
    <div class="heard-nation">
      <div class="search-title">
        <el-icon class="el-icon-search"/>
        <span>任务查询</span>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务编码：">
          <el-input v-model="searchForm.taskCode" clearable></el-input>
        </el-form-item>
        <el-form-item label="应用：">
          <el-select v-model="searchForm.appCode" filterable placeholder="请选择" clearable filterable=true>
            <el-option
              v-for="item in apps"
              :key="item.value"
              :label="item.value"
              :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态：">
          <el-select v-model="searchForm.taskRunStatus" filterable placeholder="请选择" clearable>
            <el-option
              v-for="item in taskRunStatusTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="调度时间：">
          <el-date-picker v-model="searchForm.executeTimeInterval" type="datetimerange" :picker-options="pickerOptions"
                          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchLog" icon="el-icon-search">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <div class="data-title">
        <el-icon class="el-icon-s-data"/>
        <span>数据列表</span>
        <el-tooltip class="item" effect="dark" content="日志清理" placement="bottom">
          <el-button style="float: right;margin-top: -3px;" @click="addDialog = true"
                     type="primary" icon="el-icon-delete" circle/>
        </el-tooltip>
      </div>
      <el-table :data="tableData" stripe style="width: 100%" v-loading="loading" element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading" max-height="580">
        <el-table-column prop="taskCode" label="任务编码" width="100"/>
        <el-table-column prop="taskName" label="任务名称" width="240"/>
        <el-table-column :formatter="dateFormat" prop="schedulerTime" label="调度时间" width="150"/>
        <el-table-column prop="taskRunStatus" label="调度结果" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTypeClass(scope.row.taskRunStatus)"
                    disable-transitions="true">{{ scope.row.taskRunStatus | statusFormat }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="schedulerRemark" label="调度备注" width="180"/>
        <el-table-column prop="schedulerAppIp" label="调度应用地址" width="160"/>
        <el-table-column prop="schedulerParams" label="任务参数" width="200"/>
        <el-table-column :formatter="dateFormat" prop="executeTime" label="执行时间" width="150"/>
        <el-table-column prop="taskExecuteStatus" label="执行结果" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTypeClass(scope.row.taskExecuteStatus)"
                    disable-transitions="true">{{ scope.row.taskExecuteStatus | statusFormat }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executeRemark" label="执行备注" width="180"/>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="执行日志" placement="bottom">
              <el-button @click="handleClick(scope.row)" type="primary" icon="el-icon-document" circle size="small"/>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="中止任务" placement="bottom">
              <el-button @click="breakTask(scope.row)" type="danger" icon="el-icon-warning-outline" circle
                         size="small"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="pageParams.pageNo"
                       :page-sizes="[10, 20, 30]"
                       :page-size="pageParams.pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="pageParams.totalNum">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>

// language js
import 'codemirror/mode/clike/clike.js'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/fold/indent-fold.js'
// theme css
import 'codemirror/theme/idea.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/anyword-hint.js'

import moment from 'moment';
import qs from 'qs';

export default {
  name: "Log",

  data() {
    return {
      pageParams: {
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
      },
      loading: false,
      cmOptions: {
        tabSize: 4,
        mode: 'text/x-java',
        theme: 'idea',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        extraKeys: {"Ctrl": "autocomplete"}
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      apps: [{
        code: 1,
        value: 'mall'
      }],
      searchForm: {
        taskCode: '',
        appCode: '',
        taskRunStatus: '',
        executeTimeInterval: ''
      },
      taskRunStatusTypeList: [{
        label: '成功',
        value: 1
      }, {
        label: '失败',
        value: 0
      }, {
        label: '进行中',
        value: 2
      }],
      tableData: [{
        taskCode: 'a_1',
        taskName: '每日对账',
        schedulerTime: '2020-08-28 10:20:41',
        taskRunStatus: 1,
        schedulerRemark: 'schedulerRemark',
        schedulerAppIp: '192.168.233.233:9999',
        schedulerParams: 'params',
        executeTime: '2020-08-28 10:20:41',
        taskExecuteStatus: 2,
        executeRemark: 'executeRemark'
      }]
    }
  },
  created() {
    this.getAllApps();
    this.searchLog();
  },
  filters: {
    statusFormat(code) {
      const statusObj = {
        1: '成功',
        0: '失败',
        2: '进行中'
      };
      return statusObj[code];
    }
  },
  methods: {
    dateFormat(row, column) {
      return moment(row.modifyTime).format('YYYY-MM-DD HH:mm:ss');
    },
    getStatusTypeClass(code) {
      if (code === 1) {
        return 'success';
      } else if (code === 0) {
        return 'danger';
      } else if (code === 2) {
        return 'warning';
      } else {
        return '';
      }
    },
    getAllApps() {
      this.$axios.get('app/apps')
        .then(response => {
          if (response.data.code === 1) {
            this.apps = [];
            if (response.data.resultObject) {
              for (let item in response.data.resultObject) {
                this.apps.push({'value': response.data.resultObject[item]})
              }
            }
          } else {
            this.$notify.error({
              title: '错误',
              message: response.data.message ? response.data.message : "系统异常，请联系管理员..."
            });
          }
        }).catch(error => {
        this.$notify.error({
          title: '错误',
          message: '查询错误'
        });
      })
    },
    searchLog() {
    },

    handleSizeChange(val) {
      this.pageParams.pageSize = val;
      this.pageParams.pageNo = 1;
      this.searchLog();
    },
    handleCurrentChange(val) {
      this.pageParams.pageNo = val ? val : 1;
      this.searchLog();
    },

    breakTask(done) {
      this.$confirm('任务还未执行完，是否中止?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.isShow = false;
        done();
      }).catch(() => {
      });
    }
  }
}
</script>

<style scoped>

.breadcrumb {
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  background-color: #f2f2f2;
}

</style>
