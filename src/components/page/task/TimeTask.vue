<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
      <el-breadcrumb-item>
        <el-icon class="el-icon-paperclip"/>
        任务管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <el-icon class="el-icon-time"/>
        定点任务
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="heard-nation">
      <div class="search-title">
        <el-icon class="el-icon-search"/>
        <span>任务查询</span>
      </div>
      <el-form inline="true" :model="searchForm" class="search-form" :rules="rules" ref="searchForm">
        <el-form-item label="业务编号：" prop="bizCode">
          <el-input v-model="searchForm.bizCode" clearable></el-input>
        </el-form-item>
        <el-form-item label="任务编码：" prop="taskCode">
          <el-input v-model="searchForm.taskCode" clearable></el-input>
        </el-form-item>
        <el-form-item label="任务名称：" prop="taskName">
          <el-input v-model="searchForm.taskName" clearable></el-input>
        </el-form-item>
        <el-form-item label="所属应用：" prop="appCode">
          <el-select v-model="searchForm.appCode" placeholder="请选择" clearable filterable="true">
            <el-option
              v-for="item in apps"
              :key="item.value"
              :label="item.value"
              :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTaskList('searchForm')" icon="el-icon-search">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <div class="data-title">
        <el-icon class="el-icon-s-data"/>
        <span>数据列表</span>
        <el-tooltip class="item" effect="dark" content="添加" placement="bottom">
          <el-button style="float: right;margin-top: -3px;" @click="addDialog = true"
                     type="primary" icon="el-icon-plus" circle/>
        </el-tooltip>
      </div>
      <el-table :data="tableData" stripe style="width: 100%" v-loading="loading" element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading" max-height="400">
        <el-table-column prop="taskCode" label="任务编码" width="180"/>
        <el-table-column prop="taskName" label="任务名称" width="280"/>
        <el-table-column prop="appName" label="所属应用" width="140"/>
        <el-table-column :formatter="getRunType" prop="runType" label="运行模式" width="160"/>
        <el-table-column :formatter="executeTimeFormat" prop="executeTime" label="执行时间" width="200"/>
        <el-table-column label="任务状态" width="160">
          <template slot-scope="scope">
            <el-tag :type="getTypeClass(scope.row.taskStatus)"
                    disable-transitions="true">{{ scope.row.taskStatus | taskStatusFormat }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="160"/>
        <el-table-column :formatter="modifyTimeFormat" prop="modifyTime" label="更新时间" width="160"/>
        <el-table-column fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-row>
              <el-col>
                <el-tooltip class="item" effect="dark" content="执行" placement="bottom">
                  <el-button @click="runTask(scope.row)" type="primary" icon="el-icon-s-promotion" circle size="small"/>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="getTaskStatusDesc(scope.row.taskStatus)"
                            placement="bottom">
                  <el-button @click="changeTaskStatus(scope.row)" type="primary" :icon="getIcon(scope.row.taskStatus)"
                             circle size="small"/>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="日志" placement="bottom">
                  <el-button @click="auditClick(scope.row)" type="primary" icon="el-icon-document" circle size="small"/>
                </el-tooltip>
              </el-col>
              <el-col>
                <el-tooltip class="item" effect="dark" content="编辑" placement="bottom">
                  <el-button @click="auditClick(scope.row)" type="primary" icon="el-icon-edit-outline" circle
                             size="small"/>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="GLUE" placement="bottom">
                  <el-button @click="auditClick(scope.row)" type="primary" icon="el-icon-setting" circle size="small"/>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除" placement="bottom">
                  <el-button @click.native.prevent="deleteRow(scope.$index, tableData)" type="danger"
                             icon="el-icon-delete" circle size="small"/>
                </el-tooltip>
              </el-col>
            </el-row>
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

    <!--新增规则-->
    <el-drawer title="新增规则" :before-close="handleClose" :visible.sync="addDialog" direction="rtl"
               custom-class="add-glue-drawer" ref="drawer" size="40%">
      <el-card class="box-card" style="margin-top: -15px;">
        <div slot="header" class="clearfix">
          <span>规则详情</span>
          <el-tooltip class="item" effect="dark" content="保存" placement="bottom">
            <el-button style="float: right" size="small" :loading="updateLoading" icon="el-icon-edit-outline"
                       type="primary" circle @click="updateGlue"/>
          </el-tooltip>
        </div>
        <el-row>
          <el-col :span="4">
            <div class="text">
              规则编码：
            </div>
          </el-col>
          <el-col :span="7">
            <el-input class="col-margin"
                      v-model="saveForm.glueCode"
                      clearable>
            </el-input>
          </el-col>
          <el-col :span="4" :offset="2">
            <div class="text">
              规则名称：
            </div>
          </el-col>
          <el-col :span="7">
            <el-input class="col-margin"
                      v-model="saveForm.glueName"
                      clearable>
            </el-input>
          </el-col>
        </el-row>
        <el-row style="margin-top: 30px;">
          <el-col :span="4">
            <div class="text">
              规则类型：
            </div>
          </el-col>
          <el-col :span="7">
            <el-select v-model="saveForm.glueType" filterable placeholder="请选择" class="col-margin">
              <el-option
                v-for="item in taskRunTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4" :offset="2">
            <div class="text">
              应用编号：
            </div>
          </el-col>
          <el-col :span="7">
            <el-select v-model="saveForm.appCode" filterable placeholder="请选择" clearable class="col-margin">
              <el-option
                v-for="item in apps"
                :key="item.value"
                :label="item.value"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
        </el-row>
      </el-card>
      <el-card class="box-card" style="margin-top: 10px">
        <div slot="header" class="clearfix">
          <span>规则代码</span>
          <el-tooltip class="item" effect="dark" content="校验" placement="bottom">
            <el-button style="float: right" size="small" :loading="checkLoading" icon="el-icon-check" type="primary"
                       circle @click="checkCode"/>
          </el-tooltip>
        </div>
        <codemirror :options="cmOptions" v-model="saveForm.source"></codemirror>
      </el-card>
    </el-drawer>

    <!--编辑规则-->
    <el-drawer title="规则编辑" :before-close="handleClose" :visible.sync="auditDialog" direction="rtl"
               custom-class="audit-glue-drawer" ref="drawer" size="40%">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>规则详情</span>
          <el-tooltip class="item" effect="dark" content="保存" placement="bottom">
            <el-button style="float: right" size="small" :loading="updateLoading" icon="el-icon-edit-outline"
                       type="primary" circle @click="updateGlue"/>
          </el-tooltip>
        </div>
        <el-row>
          <el-col :span="11">
            <div class="text">
              规则编码：{{ auditRule.ruleCode }}
            </div>
          </el-col>
          <el-col :span="11" :offset="2">
            <div class="text">
              规则名称：{{ auditRule.ruleName }}
            </div>
          </el-col>
        </el-row>
        <el-row style="margin-top: 30px;">
          <el-col :span="11">
            <div class="text">
              规则版本：{{ auditRule.version }}
            </div>
          </el-col>
          <el-col :span="11" :offset="2">
            <div class="text">
              规则类型：{{ auditRule.ruleType | taskRunTypeFormat }}
            </div>
          </el-col>
        </el-row>
      </el-card>
      <el-card class="box-card" style="margin-top: 10px">
        <div slot="header" class="clearfix">
          <span>规则代码</span>
          <el-tooltip class="item" effect="dark" content="校验" placement="bottom">
            <el-button style="float: right" size="small" :loading="checkLoading" icon="el-icon-check" type="primary"
                       circle @click="checkCode"/>
          </el-tooltip>
        </div>
        <codemirror :options="cmOptions" v-model="auditRule.source"></codemirror>
      </el-card>
    </el-drawer>
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
  name: "Glue",

  data() {
    return {
      pageParams: {
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
      },
      addDialog: false,
      auditDialog: false,
      loading: false,
      addCode: '',
      auditCode: '',
      checkLoading: false,
      updateLoading: false,
      saveForm: {
        glueCode: '',
        glueName: '',
        glueType: '',
        appCode: '',
        source: ''
      },
      cmOptions: {
        tabSize: 4,
        mode: 'text/x-java',
        theme: 'idea',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        extraKeys: {"Ctrl": "autocomplete"}
      },
      apps: [{
        code: 1,
        value: 'mall'
      }],
      searchForm: {
        bizCode: '',
        taskCode: '',
        taskName: '',
        appCode: ''
      },

      auditRule: {},

      taskRunTypes: [{
        value: '1',
        label: 'GLUE模式'
      }, {
        value: '2',
        label: 'BEAN模式'
      }],

      tableData: [
        {
          taskCode: 'aa_1',
          taskName: '每日对账',
          appName: 'mall',
          runType: 2,
          executeTime: 1598580001000,
          taskStatus: 0,
          owner: '杰瑞'
        }, {
          taskCode: 'aa_2',
          taskName: '每日核销',
          appName: 'mall',
          runType: 1,
          executeTime: 1598581001200,
          taskStatus: 1,
          owner: '星翼'
        }
      ],

      rules: {
        bizCode: [
          {required: true, message: '请输入活动名称', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getAllApps();
  },
  filters: {
    taskRunTypeFormat(indexType) {
      const runTypeObj = {
        1: 'GLUE模式',
        2: 'BEAN模式',
      };
      return runTypeObj[indexType];
    },
    taskStatusFormat(code) {
      const runTypeObj = {
        1: '启用',
        0: '暂停',
      };
      return runTypeObj[code];
    }
  },
  methods: {
    getRunType(row) {
      const runTypeObj = {
        1: 'GLUE模式',
        2: 'BEAN模式',
      };
      return runTypeObj[row.runType];
    },
    getTaskStatus(row) {
      const runTypeObj = {
        1: '启用',
        0: '暂停',
      };
      return runTypeObj[row.taskStatus];
    },
    getTaskStatusDesc(code) {
      if (code === 1) {
        return '暂停';
      } else if (code === 0) {
        return '启用';
      } else {
        return '未知';
      }
    },
    getIcon(code) {
      if (code === 1) {
        return 'el-icon-video-pause';
      } else {
        return 'el-icon-video-play';
      }
    },
    getTypeClass(code) {
      if (code === 1) {
        return 'success';
      } else if (code === 0) {
        return 'danger';
      } else {
        return '';
      }
    },
    modifyTimeFormat(row) {
      return moment(row.modifyTime).format('YYYY-MM-DD HH:mm:ss');
    },
    executeTimeFormat(row) {
      return moment(row.executeTime).format('YYYY-MM-DD HH:mm:ss');
    },
    dateFormat(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss');
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
    searchTaskList(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const bizCode = this.searchForm.bizCode;
          const taskCode = this.searchForm.taskCode;
          const taskName = this.searchForm.taskName;
          const appCode = this.searchForm.appCode;
          const pageNo = this.pageParams.pageNo;
          const pageSize = this.pageParams.pageSize;
          this.loading = true;
          this.$axios.get('/glue/list', {
            params: {bizCode, taskCode, taskName, appCode, pageNo, pageSize}
          }).then(response => {
            if (response.data.code === 1) {
              this.tableData = [];
              this.tableData = response.data.resultObject ? response.data.resultObject : [];
              this.pageParams = response.data.pagingQuery;
            } else {
              this.$notify.error({
                title: '错误',
                message: response.data.message ? response.data.message : "系统异常，请联系管理员..."
              });
            }
            this.loading = false;
          }).catch(error => {
            this.$notify.error({
              title: '错误',
              message: "系统异常，请稍后重试..."
            });
            this.loading = false;
          })
        } else {
          return false;
        }
      });
    },
    auditClick(row) {
      this.auditRule = row;
      this.auditDialog = true;
    },

    checkCode() {
      let params = qs.stringify({
        source: this.saveForm.source
      });
      this.checkLoading = true;
      this.$axios.post("/glue/test", params).then(response => {
        if (response.data.code === 1) {
          this.$notify({
            title: '成功',
            message: '代码检测成功',
            type: 'success'
          });
        } else {
          this.$notify.error({
            title: '错误',
            message: response.data.message ? response.data.message : "系统异常，请联系管理员..."
          });
        }
        this.checkLoading = false;
      }).catch(error => {
        this.$notify.error({
          title: '错误',
          message: "系统异常，请稍后重试..."
        });
        this.checkLoading = false;
      })
    },

    updateGlue() {
      this.updateLoading = true;
      setTimeout(() => {
        this.updateLoading = false;
      }, 2000);
    },

    handleSizeChange(val) {
      this.pageParams.pageSize = val;
      this.pageParams.pageNo = 1;
      this.searchRule();
    },
    handleCurrentChange(val) {
      this.pageParams.pageNo = val ? val : 1;
      this.searchRule();
    },

    handleClose(done) {
      this.$confirm('还未保存，是否退出编辑?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done();
      }).catch(() => {
      });
    }
  }
}
</script>

<style scoped>

.text {
  font-size: 14px;
  color: gray;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  margin: 0 2px;
}

.col-margin {
  margin-top: -4px;
}

.breadcrumb {
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  background-color: #f2f2f2;
}

</style>
