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
          <el-select v-model="searchForm.appName" placeholder="请选择" clearable filterable="true">
            <el-option
              v-for="item in apps"
              :key="item.value"
              :label="item.value"
              :value="item.code">
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
            <el-table :data="props.row.subTaskList" style="width: 100%"
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
                <el-tooltip class="item" effect="dark" content="编辑" placement="bottom">
                  <el-button @click="editTask(scope.row)" type="warning" icon="el-icon-setting" circle
                             size="small"/>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="GLUE" placement="bottom">
                  <el-button @click="editGlue(scope.row)" type="warning" icon="el-icon-edit-outline" circle
                             size="small"/>
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
                :key="item.value"
                :label="item.value"
                :value="item.code">
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
                v-for="item in apps"
                :key="item.value"
                :label="item.value"
                :value="item.code">
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
          <el-button style="float: right; margin-left: 40px; color: white;" size="medium" :loading="checkLoading" icon="el-icon-thumb"
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
      apps: [{
        code: 1,
        value: 'mall'
      }],
      searchForm: {
        taskCode: '',
        taskName: '',
        appName: ''
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

      tableData: [
        {
          taskCode: 'aa_1',
          taskName: '每日对账',
          appName: 1,
          appName: 'mall',
          runType: 1,
          cron: '0 0 10 1 1/1 ?',
          taskStatus: 0,
          owner: '杰瑞',
          version: '1.0.0',
          source: 'package com.yangt.detail.biz.item.module.template;\n' +
            '\n' +
            'import com.google.common.collect.Lists;\n' +
            'import com.google.common.collect.Maps;\n' +
            'import com.yangt.detail.biz.convertor.SupplierStoreModuleViewConvert;\n' +
            'import com.yangt.detail.common.constant.Constants;\n' +
            'import com.yangt.detail.common.dto.item.RedPillDTO;\n' +
            'import com.yangt.detail.common.dto.item.detail.module.SupplierStoreModuleDTO;\n' +
            'import com.yangt.detail.common.enums.RedPillSceneEnum;\n' +
            'import lombok.AllArgsConstructor;\n' +
            'import lombok.Data;\n' +
            'import lombok.EqualsAndHashCode;\n' +
            'import lombok.NoArgsConstructor;\n' +
            'import org.apache.commons.lang3.StringUtils;\n' +
            'import org.springframework.stereotype.Component;\n' +
            '\n' +
            'import java.util.List;\n' +
            'import java.util.Map;\n' +
            'import java.util.Objects;\n' +
            '\n' +
            '/**\n' +
            ' * <功能介绍><br>\n' +
            ' * <p>\n' +
            ' * <店铺信息模板渲染处理>\n' +
            ' *\n' +
            ' * @author xy on 2020/9/24.\n' +
            ' * @see [相关类/方法]（可选）\n' +
            ' * @since [产品 /模块版本] （可选）\n' +
            ' */\n' +
            '@Component\n' +
            'public class SupplierStoreTemplate extends AbstractDetailLocalTemplate<SupplierStoreModuleDTO> {\n' +
            '\n' +
            '    private static final String VIEW_MODULE_ID = "store_info";\n' +
            '\n' +
            '    private static final String CLOSED_STORE_NAME = "供货商家综合评分";\n' +
            '\n' +
            '    @Override\n' +
            '    public ViewWrapper renderToView(SupplierStoreModuleDTO module) {\n' +
            '        if (Objects.isNull(module)) {\n' +
            '            return null;\n' +
            '        }\n' +
            '\n' +
            '        SupplierStoreModuleView supplierStoreView = SupplierStoreModuleViewConvert.INSTANCE.map(module);\n' +
            '        supplierStoreView.setShowTotalScoreStr("综合评分:" + module.getShowTotalScore());\n' +
            '        if (SupplierStoreModuleDTO.isClose(supplierStoreView.getIsClosed())) {\n' +
            '            supplierStoreView.setStorePic(Constants.STORE_PIC);\n' +
            '            supplierStoreView.setStoreName(CLOSED_STORE_NAME);\n' +
            '        }\n' +
            '\n' +
            '        //设置埋点数据\n' +
            '        supplierStoreView.setRedPill(buildRedPill(module));\n' +
            '\n' +
            '        //构建店铺评分信息\n' +
            '        supplierStoreView.setScoreList(buildStoreScoreList(module));\n' +
            '\n' +
            '        return ViewIdentifiableWrapper.of(supplierStoreView).gapFloorBefore();\n' +
            '    }\n' +
            '\n' +
            '    @Override\n' +
            '    public String getViewModuleId(SupplierStoreModuleDTO module) {\n' +
            '        return VIEW_MODULE_ID;\n' +
            '    }\n' +
            '\n' +
            '    /**\n' +
            '     * 构建店铺评分信息\n' +
            '     *\n' +
            '     * @param supplierStoreModuleDto 供应商店铺信息\n' +
            '     * @return 店铺评分信息\n' +
            '     */\n' +
            '    private List<StoreScoreView> buildStoreScoreList(SupplierStoreModuleDTO supplierStoreModuleDto) {\n' +
            '\n' +
            '        List<StoreScoreView> scoreList = Lists.newArrayList();\n' +
            '        if (StringUtils.isNotBlank(supplierStoreModuleDto.getShowMatchScore())) {\n' +
            '            scoreList.add(new StoreScoreView(supplierStoreModuleDto.getMatchScoreRate().compareTo(0D),\n' +
            '                                             scoreChange(supplierStoreModuleDto.getShowMatchScore()), "货品描述"));\n' +
            '        }\n' +
            '        if (StringUtils.isNotBlank(supplierStoreModuleDto.getShowResponseScore())) {\n' +
            '            scoreList.add(new StoreScoreView(supplierStoreModuleDto.getResponseScoreRate().compareTo(0D),\n' +
            '                                             scoreChange(supplierStoreModuleDto.getShowResponseScore()), "服务态度"));\n' +
            '        }\n' +
            '        if (StringUtils.isNotBlank(supplierStoreModuleDto.getShowDeliveryScore())) {\n' +
            '            scoreList.add(new StoreScoreView(supplierStoreModuleDto.getDeliveryScoreRate().compareTo(0D),\n' +
            '                                             scoreChange(supplierStoreModuleDto.getShowDeliveryScore()), "物流服务"));\n' +
            '        }\n' +
            '        return scoreList;\n' +
            '\n' +
            '    }\n' +
            '\n' +
            '    /**\n' +
            '     * 评分转换\n' +
            '     *\n' +
            '     * @param score 分值\n' +
            '     * @return 转换后分值\n' +
            '     */\n' +
            '    private String scoreChange(String score) {\n' +
            '        return StringUtils.isBlank(score) || Double.valueOf(score).equals(0D) ? "-" : score;\n' +
            '    }\n' +
            '\n' +
            '    /**\n' +
            '     * 构建埋点信息\n' +
            '     *\n' +
            '     * @param module 模块数据\n' +
            '     * @return 埋点信息\n' +
            '     */\n' +
            '    private RedPillDTO buildRedPill(SupplierStoreModuleDTO module) {\n' +
            '        Map<String, Object> redPillMap = Maps.newHashMap();\n' +
            '        redPillMap.put("supplier_id", module.getSupplierId());\n' +
            '        redPillMap.put("supplier_store_id", module.getStoreId());\n' +
            '        redPillMap.put("item_id", module.getItemId());\n' +
            '        redPillMap.put("have_batch", module.getIsHasBatch());\n' +
            '        redPillMap.put("source", module.getSource());\n' +
            '        return buildRedPillInfo(RedPillSceneEnum.STORE, module.getClientType(), redPillMap);\n' +
            '    }\n' +
            '\n' +
            '    @EqualsAndHashCode(callSuper = true)\n' +
            '    @Data\n' +
            '    public static class SupplierStoreModuleView extends AbstractLocalView {\n' +
            '\n' +
            '        /**\n' +
            '         * 回头率\n' +
            '         */\n' +
            '        private String returnRate;\n' +
            '\n' +
            '        /**\n' +
            '         * 供应商id\n' +
            '         */\n' +
            '        private String supplierId;\n' +
            '\n' +
            '        /**\n' +
            '         * 是否显示查看更多的选项\n' +
            '         */\n' +
            '        private Boolean hasMore;\n' +
            '\n' +
            '        /**\n' +
            '         * 店铺首页评分文案, 综合评分:5.0，只用于文字说明\n' +
            '         */\n' +
            '        private String showTotalScoreStr;\n' +
            '\n' +
            '        /**\n' +
            '         * 店铺ID\n' +
            '         */\n' +
            '        private Long storeId;\n' +
            '\n' +
            '        /**\n' +
            '         * 店铺首页评分文案, 综合评分:5.0, 用于客户端显示星级图案\n' +
            '         */\n' +
            '        private String showTotalScore;\n' +
            '\n' +
            '        /**\n' +
            '         * 埋点信息\n' +
            '         */\n' +
            '        private RedPillDTO redPill;\n' +
            '\n' +
            '        /**\n' +
            '         * 门店图\n' +
            '         */\n' +
            '        private String storePic;\n' +
            '\n' +
            '        /**\n' +
            '         * 店铺评分\n' +
            '         */\n' +
            '        private List<StoreScoreView> scoreList;\n' +
            '\n' +
            '        /**\n' +
            '         * 店铺状态，1为关闭，0为开通\n' +
            '         */\n' +
            '        private Integer isClosed;\n' +
            '\n' +
            '        /**\n' +
            '         * 店铺名称\n' +
            '         */\n' +
            '        private String storeName;\n' +
            '\n' +
            '        /**\n' +
            '         * 店铺背景图\n' +
            '         */\n' +
            '        private String backgroundPic;\n' +
            '    }\n' +
            '\n' +
            '    @Data\n' +
            '    @AllArgsConstructor\n' +
            '    @NoArgsConstructor\n' +
            '    public static class StoreScoreView {\n' +
            '\n' +
            '        /**\n' +
            '         * 1 表示上升的箭头，0 表示持平（目前没有），-1 表示下降的箭头\n' +
            '         */\n' +
            '        private Integer trendType;\n' +
            '\n' +
            '        /**\n' +
            '         * 匹配的分数\n' +
            '         */\n' +
            '        private String matchScore;\n' +
            '\n' +
            '        /**\n' +
            '         * 分数说明\n' +
            '         */\n' +
            '        private String scoreDesc;\n' +
            '    }\n' +
            '}\n',
          subTaskList: [
            {
              taskCode: 'aa_1',
              taskName: '每日对账',
              appName: 1,
              appName: 'mall',
              runType: 2,
              cron: '0 0 10 1 1/1 ?',
              taskStatus: 0,
              owner: '杰瑞'
            }, {
              taskCode: 'aa_2',
              taskName: '每日核销',
              appName: 1,
              appName: 'mall',
              runType: 1,
              cron: '0 0 10 1 1/2 ?',
              taskStatus: 1,
              owner: '星翼'
            }
          ]
        }, {
          taskCode: 'aa_2',
          taskName: '每日核销',
          appName: 1,
          appName: 'mall',
          runType: 1,
          cron: '0 0 10 1 1/2 ?',
          taskStatus: 1,
          owner: '星翼'
        }, {
          taskCode: 'aa_3',
          taskName: '每日退回',
          appName: 1,
          appName: 'mall',
          runType: 1,
          cron: '10 10 10 11 11/12 ?',
          taskStatus: 1,
          owner: '千均'
        }
      ]
    }
  },
  created() {
    this.getAllApps();
    this.searchRule();
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
    searchTaskList() {
      const ruleCode = this.searchForm.taskCode;
      const ruleName = this.searchForm.taskName;
      const appName = this.searchForm.appName;
      const pageNo = this.pageParams.pageNo;
      const pageSize = this.pageParams.pageSize;
      this.loading = true;
      this.$axios.get('/glue/list', {
        params: {ruleCode, ruleName, ruleType, appName, appName, pageNo, pageSize}
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

<style >

.item {
  margin-bottom: 18px;
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
  background-color: floralwhite;
}
</style>
