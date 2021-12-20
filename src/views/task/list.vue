<template>
  <div class="app-container">
    <div class="filter-container fr">
      <el-button class="filter-item" icon="el-icon-refresh" size="small" @click="onRefresh" />
      <router-link :to="{name: 'createTask'}" tag="span">
        <el-button class="filter-item" type="primary" icon="el-icon-edit" size="small">创建任务</el-button>
      </router-link>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="编号" width="60">
        <template slot-scope="{row}">
          {{ row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称" width="170">
        <template slot-scope="{row}">
          {{ row.task_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="status-col" label="状态" width="100">
        <template slot-scope="{row}">
          <el-tag>{{ row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="运行次数" width="100">
        <template slot-scope="{row}">
          {{ row.counts }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="定时任务" width="80">
        <template slot-scope="{row}">
          {{ row.isCron }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间" width="200">
        <template slot-scope="{row}">
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="{row}">
          <el-button v-if="row.optionbutton & 0b10000" type="info" size="small" @click="showDetail(row)">详情</el-button>
          <router-link :to="{name: 'editTask', params: {id: row.id}}" tag="span">
            <el-button v-if="row.optionbutton & 0b01000" type="warning" size="small" icon="edit">修改</el-button>
          </router-link>
          <el-button v-if="row.optionbutton & 0b00100" type="danger" size="small" @click="stop(row.id)">停止</el-button>
          <el-button v-if="row.optionbutton & 0b00010" type="success" size="small" @click="start(row.id)">启动</el-button>
          <el-button v-if="row.optionbutton & 0b00001" type="danger" size="small" @click="del(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container fr">
      <el-pagination background :current-page="currentPage" :page-sizes="[10,20,30, 50]" :page-size="size" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-dialog title="任务详情" :visible.sync="showDetails" width="60%" center>
      <el-row border fit highlight-current-row>
        <el-form label-position="right" label-width="150px" label-suffix=":" class="task-desc-form">
          <el-col :span="24">
            <el-form-item label="编号">
              <span>{{ details.id }}</span>
            </el-form-item>
            <el-form-item label="名称">
              <span>{{ details.task_name }}</span>
            </el-form-item>
            <el-form-item label="任务规则名">
              <span>{{ details.task_rule_name }}</span>
            </el-form-item>
            <el-form-item label="任务描述">
              <span>{{ details.task_desc }}</span>
            </el-form-item>
            <el-form-item label="定时任务">
              <span>{{ details.isCron }}</span>
            </el-form-item>
            <el-form-item label="定时执行">
              <span>{{ details.cron_spec }}</span>
            </el-form-item>
            <el-form-item label="代理列表">
              <span>{{ details.proxy_urls }}</span>
            </el-form-item>
            <el-form-item label="用户代理">
              <span>{{ details.opt_user_agent }}</span>
            </el-form-item>
            <el-form-item label="爬虫最大深度">
              <span>{{ details.opt_max_depth }}</span>
            </el-form-item>
            <el-form-item label="允许访问的域名">
              <span>{{ details.opt_allowed_domains }}</span>
            </el-form-item>
            <el-form-item label="URL过滤">
              <span>{{ details.opt_url_filters }}</span>
            </el-form-item>
            <el-form-item label="最大body值">
              <span>{{ details.opt_max_body_size }}</span>
            </el-form-item>
            <el-form-item label="请求超时时间">
              <span>{{ details.opt_request_timeout }}</span>
            </el-form-item>
            <el-form-item label="频率限制">
              <span>{{ details.limit_enable }}</span>
            </el-form-item>
            <el-form-item label="域名glob匹配">
              <span>{{ details.limit_domain_glob }}</span>
            </el-form-item>
            <el-form-item label="延迟">
              <span>{{ details.limit_delay }}</span>
            </el-form-item>
            <el-form-item label="随机延迟">
              <span>{{ details.limit_random_delay }}</span>
            </el-form-item>
            <el-form-item label="请求并发度">
              <span>{{ details.limit_parallelism }}</span>
            </el-form-item>
            <el-form-item label="状态">
              <span>{{ details.status | statusFilter }}</span>
            </el-form-item>
            <el-form-item label="运行次数">
              <span>{{ details.counts }}</span>
            </el-form-item>
            <el-form-item label="创建时间">
              <span>{{ details.created_at }}</span>
            </el-form-item>
          </el-col>

        </el-form>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showDetails = false">Close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchTaskList, stopTask, startTask, deleteTask } from '@/api/task'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '初始状态',
        1: '运行中',
        2: '停止',
        3: '完成',
        4: '异常终止'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      currentPage: 1,
      total: 0,
      size: 10,
      details: {},
      showDetails: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    onRefresh() {
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      fetchTaskList({ offset: (this.currentPage - 1) * this.size, size: this.size }).then(response => {
        this.list = response.data.list
        for (const v of this.list) {
          v.isCron = 'No'
          if (v.cron_spec) {
            v.isCron = 'Yes'
          }
          // 操作按钮，用5位2进制数表示，每位控制一个按钮是否显示
          // ----0----0----0----0----0----
          // ----|----|----|----|----|----
          // ---详情--修改-停止--启动--删除--
          switch (v.status) {
            case 0:
              v.optionbutton = 0b11011
              break
            case 1:
              v.optionbutton = 0b10100
              break
            case 2:
              v.optionbutton = 0b11001
              // 有cron表达式时允许启动
              if (v.cron_spec) { v.optionbutton = 0b11011 }
              break
            case 3:
              v.optionbutton = 0b10100
              break
            case 4:
              v.optionbutton = 0b10100
              break
            default:
              v.optionbutton = 0b11011
              break
          }
        }

        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    showDetail(row) {
      this.showDetails = true
      this.details = row
    },
    stop(id) {
      this.$confirm('该操作将会停止该任务，是否继续操作？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        stopTask(id).then(() => {
          this.fetchData()
          this.$message.success('操作成功')
        }).catch(() => {
          this.$message.error('操作失败')
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    start(id) {
      this.listLoading = true
      startTask(id).then(() => {
        this.fetchData()
        this.$message.success('操作成功')
      }).catch(() => {
        this.$message.error('操作失败')
      }).catch((err) => {
        console.log(err)
      })
    },
    del(id) {
      this.listLoading = true
      deleteTask(id).then(() => {
        this.fetchData()
        this.$message.success('操作成功')
      }).catch(() => {
        this.$message.error('操作失败')
      }).catch((err) => {
        console.log(err)
      })
    },
    handleSizeChange(val) {
      this.size = val
      this.fetchData()
    },
    // 页码选择
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    }
  }
}
</script>

<style scoped>
  .task-desc-form {
    margin-bottom: 0;
  }
</style>
