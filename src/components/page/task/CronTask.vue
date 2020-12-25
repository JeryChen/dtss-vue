<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
      <el-breadcrumb-item>
        <el-icon class="el-icon-paperclip"/>
        任务管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <el-icon class="el-icon-date"/>
        周期任务
      </el-breadcrumb-item>
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
        <el-form-item label="任务名称：">
          <el-input v-model="searchForm.taskName" clearable></el-input>
        </el-form-item>
        <el-form-item label="所属应用：">
          <el-select v-model="searchForm.appId" placeholder="请选择" clearable filterable="true">
            <el-option
              v-for="item in apps"
              :key="item.appName"
              :label="item.appName"
              :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTaskList" icon="el-icon-search">查询</el-button>
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
      <el-table :data="tableData" style="width: 100%" v-loading="loading" element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading" max-height="580">
        <el-table-column type="expand" class="expanded-column-out">
          <template slot-scope="props">
            <el-table :data="props.row.subCronTaskList" style="width: 100%"
                      element-loading-spinner="el-icon-loading" max-height="200" highlight-current-row="true">
              <el-table-column prop="taskCode" label="子任务编码" width="120"/>
              <el-table-column prop="taskName" label="子任务名称" width="260"/>
              <el-table-column prop="appName" label="所属应用" width="120"/>
              <el-table-column :formatter="getRunType" prop="runType" label="运行模式" width="140"/>
              <el-table-column prop="cron" label="执行周期" width="160"/>
              <el-table-column label="任务状态" width="120">
                <template slot-scope="scope">
                  <el-tag :type="getTypeClass(scope.row.taskStatus)"
                          disable-transitions="true">{{ scope.row.taskStatus | taskStatusFormat }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="owner" label="负责人" width="120"/>
              <el-table-column :formatter="dateFormat" prop="modifyTime" label="更新时间" width="150"/>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="taskCode" label="任务编码" width="120"/>
        <el-table-column prop="taskName" label="任务名称" width="260"/>
        <el-table-column prop="appName" label="所属应用" width="120"/>
        <el-table-column :formatter="getRunType" prop="runType" label="运行模式" width="140"/>
        <el-table-column prop="cron" label="执行周期" width="160"/>
        <el-table-column label="任务状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTypeClass(scope.row.taskStatus)"
                    disable-transitions="true">{{ scope.row.taskStatus | taskStatusFormat }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="120"/>
        <el-table-column :formatter="dateFormat" prop="modifyTime" label="更新时间" width="150"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-row>
              <el-col>
                <el-tooltip class="item" effect="dark" content="执行" placement="bottom">
                  <el-button @click="runTask(scope.row)" type="success" icon="el-icon-s-promotion" circle size="small"/>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="getTaskStatusDesc(scope.row.taskStatus)"
                            placement="bottom">
                  <el-button @click="changeTaskStatus(scope.row)" type="primary" :icon="getIcon(scope.row.taskStatus)"
                             circle size="small"/>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="日志" placement="bottom">
                  <el-button @click="auditClick(scope.row)" type="info" icon="el-icon-document" circle size="small"/>
                </el-tooltip>
              </el-col>
              <el-col>
                <el-tooltip effect="dark" content="编辑" placement="bottom">
                  <el-button @click="editTask(scope.row)" type="warning" icon="el-icon-setting" circle
                             size="small"/>
                </el-tooltip>
                <el-tooltip effect="dark" content="GLUE" placement="bottom">
                  <el-button @click="editGlue(scope.row)" type="warning" icon="el-icon-edit-outline" circle
                             size="small"/>
                </el-tooltip>
                <el-tooltip effect="dark" content="删除" placement="bottom">
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
                       :page-sizes="[10, 20]"
                       :page-size="pageParams.pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="pageParams.totalNum">
        </el-pagination>
      </div>
    </div>

    <!--新增任务-->
    <el-drawer title="新增任务" :before-close="handleClose" :visible.sync="addDialog" direction="rtl"
               custom-class="add-task-drawer" ref="drawer" size="40%" :with-header="false">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>任务详情</span>
          <el-button style="float: right" size="medium" icon="el-icon-edit-outline" type="text" @click="updateGlue">保存
          </el-button>
        </div>
        <el-form :inline="true" :model="taskCreateForm" :rules="createRules" ref="taskCreateForm" label-width="100px"
                 class="search-form">
          <el-form-item label="任务名称：" prop="taskName" size="medium">
            <el-input v-model="taskCreateForm.taskName" clearable placeholder="任务名称"/>
          </el-form-item>
          <el-form-item label="所属应用：" prop="appName" size="medium">
            <el-select v-model="taskCreateForm.appName" placeholder="请选择" clearable filterable="true">
              <el-option
                v-for="item in apps"
                :key="item.appName"
                :label="item.appName"
                :value="item.appName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="路由策略：" prop="routeStrategy" size="medium">
            <el-select v-model="taskCreateForm.routeStrategy" placeholder="请选择" clearable>
              <el-option
                v-for="item in routeStrategyTypes"
                :key="item.label"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="执行周期：" prop="cron" size="medium">
            <el-input v-model="taskCreateForm.cron" clearable placeholder="cron表达式"/>
          </el-form-item>
          <el-form-item label="运行模式：" prop="runType" size="medium">
            <el-select v-model="taskCreateForm.runType" @change="isShowCode" placeholder="请选择" clearable>
              <el-option
                v-for="item in taskRunTypes"
                :key="item.label"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理器类：" prop="jobHandler" size="medium">
            <el-input v-model="taskCreateForm.jobHandler" clearable placeholder="任务实现的beanName"/>
          </el-form-item>
          <el-form-item label="阻塞策略：" prop="blockStrategy" size="medium">
            <el-select v-model="taskCreateForm.blockStrategy" placeholder="请选择">
              <el-option
                v-for="item in blockStrategyTypes"
                :key="item.label"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="子任务Ids：" prop="subTaskIds" size="medium">
            <el-input v-model="taskCreateForm.subTaskIds" clearable placeholder="子任务id(多个逗号隔开)"/>
          </el-form-item>
          <el-form-item label="任务超时：" prop="taskTimeOut" size="medium">
            <el-input-number style="width: 194px;" v-model="taskCreateForm.taskTimeOut" clearable/>
          </el-form-item>
          <el-form-item label="重试次数：" prop="retryTimes" size="medium">
            <el-input-number style="width: 194px;" v-model="taskCreateForm.retryTimes" clearable/>
          </el-form-item>
          <el-form-item label="负责人：" prop="owner" size="medium">
            <el-input v-model="taskCreateForm.owner" clearable placeholder="任务负责人"/>
          </el-form-item>
          <el-form-item label="报警邮箱：" prop="mail" size="medium">
            <el-input v-model="taskCreateForm.mail" clearable placeholder="mail地址(多个逗号隔开)"/>
          </el-form-item>
          <el-form-item label="任务参数：" prop="taskParam" size="medium">
            <el-input style="width: 500px;" rows="3" type="textarea" resize="none" v-model="taskCreateForm.taskParam"
                      clearable size="medium" placeholder="任务参数，执行任务时获取到参数配置信息"/>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card" style="margin-top: 10px" v-show="isShow">
        <div slot="header" class="clearfix">
          <span>任务代码</span>
          <el-button style="float: right" size="medium" :loading="checkLoading" icon="el-icon-thumb" type="text"
                     @click="checkCode">校验
          </el-button>
        </div>
        <codemirror :options="cmOptions" v-model="taskCreateForm.source"></codemirror>
      </el-card>
    </el-drawer>

    <!--编辑任务-->
    <el-drawer title="更新任务" :before-close="handleClose" :visible.sync="editDialog" direction="rtl"
               custom-class="audit-task-drawer" ref="drawer" size="40%" :with-header="false">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>任务详情</span>
          <el-button style="float: right" size="medium" icon="el-icon-edit-outline" type="text" @click="updateGlue">保存
          </el-button>
        </div>
        <el-form :inline="true" :model="taskUpdateForm" :rules="createRules" ref="taskUpdateForm" label-width="100px"
                 class="search-form">
          <el-form-item label="任务名称：" prop="taskName" size="medium">
            <el-input v-model="taskUpdateForm.taskName" clearable placeholder="任务名称"/>
          </el-form-item>
          <el-form-item label="所属应用：" prop="appName" size="medium">
            <el-select v-model="taskUpdateForm.appName" placeholder="请选择" clearable filterable="true">
              <el-option
                v-for="item in appName"
                :key="item.appName"
                :label="item.appName"
                :value="item.appName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="路由策略：" prop="routeStrategy" size="medium">
            <el-select v-model="taskUpdateForm.routeStrategy" placeholder="请选择" clearable>
              <el-option
                v-for="item in routeStrategyTypes"
                :key="item.label"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="执行周期：" prop="cron" size="medium">
            <el-input v-model="taskUpdateForm.cron" clearable placeholder="cron表达式"/>
          </el-form-item>
          <el-form-item label="运行模式：" prop="runType" size="medium">
            <el-select v-model="taskUpdateForm.runType" @change="isShowCode" placeholder="请选择" clearable>
              <el-option
                v-for="item in taskRunTypes"
                :key="item.label"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理器类：" prop="jobHandler" size="medium">
            <el-input v-model="taskUpdateForm.jobHandler" clearable placeholder="任务实现的beanName"/>
          </el-form-item>
          <el-form-item label="阻塞策略：" prop="blockStrategy" size="medium">
            <el-select v-model="taskUpdateForm.blockStrategy" placeholder="请选择">
              <el-option
                v-for="item in blockStrategyTypes"
                :key="item.label"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="子任务Ids：" prop="subTaskIds" size="medium">
            <el-input v-model="taskUpdateForm.subTaskIds" clearable placeholder="子任务id(多个逗号隔开)"/>
          </el-form-item>
          <el-form-item label="任务超时：" prop="taskTimeOut" size="medium">
            <el-input-number style="width: 194px;" v-model="taskUpdateForm.taskTimeOut" clearable/>
          </el-form-item>
          <el-form-item label="重试次数：" prop="retryTimes" size="medium">
            <el-input-number style="width: 194px;" v-model="taskUpdateForm.retryTimes" clearable/>
          </el-form-item>
          <el-form-item label="负责人：" prop="owner" size="medium">
            <el-input v-model="taskUpdateForm.owner" clearable placeholder="任务负责人"/>
          </el-form-item>
          <el-form-item label="报警邮箱：" prop="mail" size="medium">
            <el-input v-model="taskUpdateForm.mail" clearable placeholder="mail地址(多个逗号隔开)"/>
          </el-form-item>
          <el-form-item label="任务参数：" prop="taskParam" size="medium">
            <el-input style="width: 500px;" rows="3" type="textarea" resize="none" v-model="taskUpdateForm.taskParam"
                      clearable size="medium" placeholder="任务参数，执行任务时获取到参数配置信息"/>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card" style="margin-top: 8px" v-show="isShow">
        <div slot="header" class="clearfix">
          <span>任务代码</span>
          <el-button style="float: right" size="medium" :loading="checkLoading" icon="el-icon-thumb" type="text"
                     @click="checkCode">校验
          </el-button>
        </div>
        <codemirror :options="cmOptions" v-model="taskUpdateForm.source"></codemirror>
      </el-card>
    </el-drawer>

    <!--编辑任务代码-->
    <el-drawer title="编辑任务代码" :before-close="handleClose" :visible.sync="editCodeDialog" direction="ttb"
               custom-class="edit-glue-drawer" ref="drawer" size="85%" :with-header="false">
      <el-card class="box-card edit-code">
        <div slot="header" class="clearfix">
          <span style="font-size: 26px;font-weight: bolder;color: white;">WebIDE | </span>
          <span style="color: white;">GLUE模式任务：{{ editCode.taskName }} | 版本号：{{ editCode.version }}</span>
          <el-button style="float: right; margin-left: 20px; color: white;" size="medium" :loading="checkLoading"
                     icon="el-icon-edit-outline" type="text" @click="checkCode">保存
          </el-button>
          <el-button style="float: right; margin-left: 40px; color: white;" size="medium" :loading="checkLoading"
                     icon="el-icon-thumb"
                     type="text" @click="checkCode">校验
          </el-button>
          <el-dropdown style="float: right; margin-top: 8px;" size="medium" @command="selectVersion">
            <span class="el-dropdown-link">
              版本回溯<i class="el-icon-caret-bottom el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="item in historyVersionList" :command="item.id" :key="index">{{ item.version }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <codemirror :options="cmOptions" v-model="editCode.source"/>
      </el-card>
    </el-drawer>
  </div>
</template>

<script>

// language js
import 'codemirror/mode/clike/clike.js'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/hint/anyword-hint.js'
import 'codemirror/addon/hint/css-hint.js'
import 'codemirror/lib/codemirror.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
// theme css
import 'codemirror/theme/idea.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/theme/ambiance.css'
import 'codemirror/lib/codemirror.css'

import moment from 'moment';
import qs from 'qs';

export default {
  name: "CronTask",

  data() {
    return {
      pageParams: {
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
      },
      isShow: false,
      editCodeDialog: false,
      addDialog: false,
      editDialog: false,
      loading: false,
      editCode: {},
      checkLoading: false,
      updateLoading: false,
      cmOptions: {
        tabSize: 4,
        mode: 'text/x-java',
        theme: 'idea',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        extraKeys: {"Ctrl": "autocomplete"}
      },
      apps: [],
      searchForm: {
        taskCode: '',
        taskName: '',
        appId: ''
      },

      taskCreateForm: {},

      taskUpdateForm: {},

      blockStrategyTypes: [
        {
          value: 1,
          label: '单机串行'
        },
        {
          value: 2,
          label: '丢弃后续调度'
        },
        {
          value: 3,
          label: '覆盖之前调度'
        }
      ],

      createRules: {
        taskName: [
          {required: true, message: '请输入活动名称', trigger: 'blur'},
          {min: 3, max: 63, message: '长度在 3 到 63 个字符', trigger: 'blur'}
        ],
        appName: [
          {required: true, message: '请选择所属应用', trigger: 'change'}
        ],
        routeStrategy: [
          {required: true, message: '请选择路由策略', trigger: 'change'}
        ],
        cron: [
          {required: true, message: '请输入cron表达式', trigger: 'blur'},
          {min: 1, max: 31, message: '长度在 1 到 31 个字符', trigger: 'blur'}
        ],
        runType: [
          {required: true, message: '请选择运行模式', trigger: 'change'}
        ],
        jobHandler: [
          {required: true, message: '请输入处理器类', trigger: 'blur'}
        ],
        blockStrategy: [
          {required: true, message: '请选择阻塞策略', trigger: 'change'}
        ],
        retryTimes: [
          {required: true, message: '请输入重试次数', trigger: 'blur'}
        ],
        taskTimeOut: [
          {required: true, message: '请输入任务超时时长', trigger: 'blur'}
        ],
        owner: [
          {required: true, message: '请输入负责人', trigger: 'blur'},
          {min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur'}
        ]
      },

      routeStrategyTypes: [
        {
          value: 1,
          label: '第一个'
        }, {
          value: 2,
          label: '最后一个'
        }, {
          value: 3,
          label: '轮询'
        }, {
          value: 4,
          label: '随机'
        }, {
          value: 5,
          label: '一致性HASH'
        }, {
          value: 6,
          label: '最不经常使用'
        }, {
          value: 7,
          label: '最近最久未使用'
        }, {
          value: 8,
          label: '故障转移'
        }, {
          value: 9,
          label: '忙碌转移'
        }, {
          value: 10,
          label: '分片广播'
        }],

      taskRunTypes: [{
        value: 1,
        label: 'GLUE模式'
      }, {
        value: 2,
        label: 'BEAN模式'
      }],

      historyVersionList: [
        {
          id: 1,
          version: '1.0.0'
        }, {
          id: 2,
          version: '1.0.1'
        }
      ],

      tableData: []
    }
  },
  created() {
    this.getAllApps();
    this.searchTaskList();
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
    isShowCode(code) {
      this.isShow = code === 1;
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
    dateFormat(row) {
      return moment(row.modifyTime).format('YYYY-MM-DD HH:mm:ss');
    },
    getAllApps() {
      this.$axios.get('/admin/app/allAppNames')
        .then(response => {
          if (response.data.success) {
            this.apps = [];
            if (response.data.data) {
              for (let item in response.data.data) {
                this.apps.push({'appName': response.data.data[item].appName, 'appId': response.data.data[item].id})
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
    searchTaskList() {
      const taskCode = this.searchForm.taskCode ? this.searchForm.taskCode : null;
      const taskName = this.searchForm.taskName ? this.searchForm.taskName : null;
      const appId = this.searchForm.appId ? this.searchForm.appId : null;
      const pageNo = this.pageParams.pageNo ? this.pageParams.pageNo : null;
      const pageSize = this.pageParams.pageSize ? this.pageParams.pageSize : null;
      this.loading = true;
      this.$axios.get('/admin/cron-task/pageList', {
        params: {taskCode, taskName, appId, pageNo, pageSize}
      }).then(response => {
        if (response.data.success) {
          this.tableData = [];
          this.tableData = response.data.data ? response.data.data : [];
          this.pageParams = response.data.pagingParam;
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
    },
    editTask(row) {
      this.taskUpdateForm = row;
      this.editDialog = true;
      this.isShowCode(row.runType);
    },

    editGlue(row) {
      this.editCode = row;
      this.editCodeDialog = true;
    },

    selectVersion(row) {
      alert(row.id)
    },

    checkCode() {
      let params = qs.stringify({
        source: this.taskCreateForm.source
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
        this.isShow = false;
        done();
      }).catch(() => {
      });
    }
  }
}
</script>

<style>

.item {
  margin-bottom: 10px;
}

.box-card {
  margin: 0 2px;
}

.breadcrumb {
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  background-color: #f2f2f2;
}

.el-dropdown-link {
  cursor: pointer;
  color: white;
  font-weight: bolder;
}

.el-icon-caret-bottom {
  font-size: 12px;
}

.box-card {
  margin: 0 0 0 0;
}

.edit-code .el-card__header {
  background-color: #1876d2 !important;
}

.edit-code .el-card__body {
  height: 720px;
}

.edit-code .CodeMirror {
  height: 740px;
}

.el-table__expanded-cell {
  background-color: aliceblue;
}
</style>
