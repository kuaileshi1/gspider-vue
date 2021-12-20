<template>
  <div class="app-container">
    <el-row v-loading="loadData" border fit highlight-current-row>
      <el-col :span="12">
        <el-form ref="form" :model="form" :rules="rules" label-position="right" label-width="150px">
          <el-form-item label="任务名称" prop="task_name">
            <el-input v-model="form.task_name" placeholder="请输入任务名称" :disabled="isEdit" />
          </el-form-item>
          <el-form-item label="任务规则" prop="task_rule_name">
            <el-select v-model="form.task_rule_name" placeholder="请选择规则名称" :disabled="isEdit">
              <el-option
                v-for="item in ruleOpts"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="任务描述">
            <el-input v-model="form.task_desc" type="textarea" placeholder="请输入任务描述" :rows="2" />
          </el-form-item>
          <el-form-item label="定时执行">
            <el-input v-model="form.cron_spec" placeholder="* * * * * *" />
          </el-form-item>
          <el-form-item label="代理列表">
            <el-input v-model="form.proxy_urls" placeholder="支持 socks5,http,https; 多个以逗号分割" />
          </el-form-item>
          <el-form-item label="用户代理">
            <el-input v-model="form.opt_user_agent" placeholder="user agent" />
          </el-form-item>
          <el-form-item label="爬虫最大深度">
            <el-input-number v-model="form.opt_max_depth" :controls="false" />
          </el-form-item>
          <el-form-item label="允许访问的域名">
            <el-input v-model="form.opt_allowed_domains" placeholder="默认空为无限制" />
          </el-form-item>
          <el-form-item label="URL过滤">
            <el-input v-model="form.opt_url_filters" placeholder="默认空无限制，支持正则表达式" />
          </el-form-item>
          <el-form-item label="最大body值">
            <el-input-number v-model="form.opt_max_body_size" :controls="false" class="fl" />
          </el-form-item>
          <el-form-item label="请求超时时间">
            <el-input-number v-model="form.opt_request_timeout" :controls="false" class="fl" />
          </el-form-item>
          <el-form-item label="频率限制">
            <el-checkbox v-model="form.limit_enable" />
          </el-form-item>
          <el-form-item label="域名glob匹配">
            <el-input v-model="form.limit_domain_glob" placeholder="默认 *" />
          </el-form-item>
          <el-form-item label="延迟">
            <el-input-number v-model="form.limit_delay" :controls="false" />
          </el-form-item>
          <el-form-item label="随机延迟">
            <el-input-number v-model="form.limit_random_delay" :controls="false" />
          </el-form-item>
          <el-form-item label="请求并发度">
            <el-input-number v-model="form.limit_parallelism" :controls="false" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="on_submit_loading" :disabled="submit_disable" @click="on_submit_form">{{ routeID ? '更新' : '创建' }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getTask, getRules, saveTask } from '@/api/task'
import waves from '@/directive/waves'
export default {
  name: 'TaskCreate',
  directives: {
    waves
  },
  data() {
    return {
      form: {
        opt_user_agent: navigator.userAgent,
        limit_enable: true,
        limit_parallelism: 1,
        opt_request_timeout: 10,
        id: this.$route.params.id
      },
      ruleOpts: [],
      routeID: this.$route.params.id,
      loadData: false,
      isEdit: false,
      on_submit_loading: false,
      submit_disable: false,
      rules: {
        task_name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
        task_rule_name: [{ required: true, message: '请选择抓取规则名称', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getRules()
    this.routeID && this.getTaskRuleList()
    if (this.routeID) {
      this.isEdit = true
    }
  },
  methods: {
    // 获取数据
    getTaskRuleList() {
      this.loadData = true
      getTask(this.routeID).then(response => {
        const data = response.data
        this.form = data
        this.loadData = false
        setTimeout(() => {
          this.loadData = false
        }, 1.5 * 1000)
      })
    },

    // 获取所有rules
    getRules() {
      getRules().then(response => {
        this.ruleOpts = response.data
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    // 提交
    on_submit_form() {
      this.$refs.form.validate((valid) => {
        if (!valid) return false
        this.on_submit_loading = true
        saveTask(this.form).then((response) => {
          const data = response.data
          this.$message.success('操作成功!  task id:' + data.id + '  2s后跳转到列表页面')
          this.on_submit_loading = false
          this.submit_disable = true
          setTimeout(() => this.$router.push({ name: 'taskList' }), 2000)
        }).catch(() => {
          this.on_submit_loading = false
        })
      })
    }
  }
}
</script>
