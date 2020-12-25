<template>
  <div style="margin-top: 10px;">
    <div style="font-size: larger;">
      <el-icon class="el-icon-s-data"/>
      运行数据大盘
      <span style="font-size: 14px;color: gray">任务调度中心</span>
    </div>
    <el-row :gutter="24" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card class="box-card" style="background-color: darkcyan;" :body-style="{ padding: '0px' }">
          <el-row :gutter="24">
            <el-col :span="6">
              <i class="el-icon-time" style="font-size: 100px;color: white;background-color: lightseagreen"/>
            </el-col>
            <el-col :span="18" style="font-size: 14px;color: white;padding-left: 21px;">
              <el-row style="margin-top: 10px;padding-left: 10px;">
                <span>待执行定点任务数量：</span>
              </el-row>
              <el-row style="padding-left: 10px;margin-bottom: -23px;margin-top: 3px;">
                <span style="font-weight: bolder;">40</span>
              </el-row>
              <el-row>
                <el-col style="height: 40px;">
                  <el-divider/>
                </el-col>
              </el-row>
              <el-row>
              </el-row>
              <el-row style="padding-left: 10px;padding-bottom: 10px;">
                <el-col>系统中待执行定点任务数量</el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card" style="background-color: dodgerblue;" :body-style="{ padding: '0px' }">
          <el-row :gutter="24">
            <el-col :span="6">
              <i class="el-icon-date" style="font-size: 100px;color: white;background-color: #1876d2;"/>
            </el-col>
            <el-col :span="18" style="font-size: 14px;color: white;padding-left: 21px;">
              <el-row style="margin-top: 10px;padding-left: 10px;">
                <span>周期任务数量：</span>
              </el-row>
              <el-row style="padding-left: 10px;margin-bottom: -23px;margin-top: 3px;">
                <span style="font-weight: bolder;">300</span>
              </el-row>
              <el-row>
                <el-col style="height: 40px;">
                  <el-divider/>
                </el-col>
              </el-row>
              <el-row>
              </el-row>
              <el-row style="padding-left: 10px;padding-bottom: 10px;">
                <el-col>系统中配置的任务数量</el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card" style="background-color: orange;" :body-style="{ padding: '0px' }">
          <el-row :gutter="24">
            <el-col :span="6">
              <i class="el-icon-s-data" style="font-size: 100px;color: white;background-color: chocolate;"/>
            </el-col>
            <el-col :span="18" style="font-size: 14px;color: white;padding-left: 21px;">
              <el-row style="margin-top: 10px;padding-left: 10px;">
                <span>调度次数：</span>
              </el-row>
              <el-row style="padding-left: 10px;margin-bottom: -23px;margin-top: 3px;">
                <span style="font-weight: bolder;">100000</span>
              </el-row>
              <el-row>
                <el-col style="height: 40px;">
                  <el-divider/>
                </el-col>
              </el-row>
              <el-row>
              </el-row>
              <el-row style="padding-left: 10px;padding-bottom: 10px;">
                <el-col>调度中心触发的调度次数</el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card" style="background-color: forestgreen;" :body-style="{ padding: '0px' }">
          <el-row :gutter="24">
            <el-col :span="6">
              <i class="el-icon-s-operation" style="font-size: 100px;color: white;background-color: darkgreen"/>
            </el-col>
            <el-col :span="18" style="font-size: 14px;color: white;padding-left: 21px;">
              <el-row style="margin-top: 10px;padding-left: 10px;">
                <span>应用数量：</span>
              </el-row>
              <el-row style="padding-left: 10px;margin-bottom: -23px;margin-top: 3px;">
                <span style="font-weight: bolder;">80</span>
              </el-row>
              <el-row>
                <el-col style="height: 40px;">
                  <el-divider/>
                </el-col>
              </el-row>
              <el-row>
              </el-row>
              <el-row style="padding-left: 10px;padding-bottom: 10px;">
                <el-col>心跳检测成功的应用机器数量</el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="24" style="margin-top: 100px;align-content: center;text-align: center;">
        <span style="font-weight: bolder;">调度报表（一个月内）</span>
        <el-divider/>
    </el-row>
    <el-row :gutter="24">
      <el-col :span="12">
        <div id="lineChart" class="chart-container"></div>
      </el-col>
      <el-col :span="9" :offset="3">
        <div id="pieChart" class="chart-container"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Echarts from 'echarts';

export default {
  name: "DataMarket",

  data() {
    return {
      pieCharts: null,
      lineCharts: null,
      pieOption: {
        title: {
          text: '任务执行结果比例图',
          subtext: '成功率占比',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        color:['#00A65A', '#c23632', '#F39C12'],
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: '50%',
            data: [
              {value: 1048, name: '成功调度次数'},
              {value: 735, name: '失败调度次数'},
              {value: 580, name: '调度执行中次数'}
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      },
      lineOption: {
        title: {
          text: '日期分布执行图'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        color:['#00A65A', '#c23632', '#F39C12'],
        legend: {
          data: ['成功调度次数', '失败调度次数', '调度执行中次数']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['20201212', '20201213', '20201214', '20201215', '20201216', '20201217', '20201218']
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '成功调度次数',
            type: 'line',
            stack: '总量',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: '失败调度次数',
            type: 'line',
            stack: '总量',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [220, 182, 191, 234, 290, 330, 1010]
          },
          {
            name: '调度执行中次数',
            type: 'line',
            stack: '总量',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [150, 232, 201, 154, 190, 330, 410]
          }
        ]
      }
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.pieCharts = Echarts.init(document.getElementById('pieChart'))
      this.pieCharts.setOption(this.pieOption)
      window.addEventListener('resize', this.handleResize)
      this.lineCharts = Echarts.init(document.getElementById('lineChart'))
      this.lineCharts.setOption(this.lineOption)
      window.addEventListener('resize', this.handleLineResize)
    })
  },
  methods: {
    handleResize() {
      this.pieCharts.resize()
    },
    handleLineResize() {
      this.lineCharts.resize()
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.pieCharts.dispose()
    window.removeEventListener('resize', this.handleLineResize)
    this.lineCharts.dispose()
  }
}
</script>

<style scoped>
.box-card {
  width: 340px;
  margin-left: 5px;
}

.el-divider {
  height: 2px;
}

.chart-container {
  border-radius: 4px;
  height: 400px;
  padding: 20px;
}

</style>
