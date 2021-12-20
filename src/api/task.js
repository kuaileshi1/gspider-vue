import request from '@/utils/request'

// 数据列表
export function fetchTaskList(params) {
  return request({
    url: '/webapi/tasks',
    method: 'get',
    params
  })
}

// 根据id查询数据
export function getTask(id) {
  return request({
    url: '/webapi/tasks/' + id,
    method: 'get'
  })
}

// 查询所有rules
export function getRules() {
  return request({
    url: '/webapi/tasks/rules',
    method: 'get'
  })
}

// 根据id停止任务
export function stopTask(id) {
  return request({
    url: '/webapi/tasks/' + id + '/stop',
    method: 'get'
  })
}
// 根据id启定时任务
export function startTask(id) {
  return request({
    url: '/webapi/tasks/' + id + '/start',
    method: 'get'
  })
}

// 保存数据
export function saveTask(data) {
  return request({
    url: '/webapi/tasks',
    method: 'post',
    data
  })
}

// 删除任务
export function deleteTask(id) {
  return request({
    url: '/webapi/tasks/' + id + '/delete',
    method: 'get'
  })
}

