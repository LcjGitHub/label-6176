import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const zhCN = {
  startsWith: '开头为',
  contains: '包含',
  notContains: '不包含',
  endsWith: '结尾为',
  equals: '等于',
  notEquals: '不等于',
  noFilter: '无过滤器',
  filter: '筛选',
  lt: '小于',
  lte: '小于或等于',
  gt: '大于',
  gte: '大于或等于',
  dateIs: '日期等于',
  dateIsNot: '日期不等于',
  dateBefore: '日期在之前',
  dateAfter: '日期在之后',
  clear: '清除',
  apply: '应用',
  matchAll: '匹配全部',
  matchAny: '匹配任一',
  addRule: '添加规则',
  removeRule: '移除规则',
  accept: '确认',
  reject: '取消',
  choose: '选择',
  upload: '上传',
  cancel: '取消',
  close: '关闭',
  edit: '编辑',
  prev: '上一页',
  next: '下一页',
  previous: '上一页',
  pageLabel: '{page} / {pages}',
  rowsPerPageLabel: '每页行数',
  jumpToPageDropdownLabel: '跳转到页下拉框',
  jumpToPageInputLabel: '跳转到页输入框',
  first: '第一页',
  last: '最后一页',
  years: '年',
  months: '月',
  days: '日',
  am: '上午',
  pm: '下午',
  today: '今天',
  now: '现在',
  weekHeader: '周',
  firstDayOfWeek: 0,
  dateFormat: 'yy-mm-dd',
  weak: '弱',
  medium: '中',
  strong: '强',
  passwordPrompt: '输入密码',
  emptyFilterMessage: '未找到结果',
  emptyMessage: '无可用选项',
  emptySearchMessage: '未找到结果',
  aria: {
    trueLabel: '真',
    falseLabel: '假',
    nullLabel: '未选择',
    star: '星',
    stars: '星数',
    selectAll: '全选',
    unselectAll: '全部取消',
    close: '关闭',
    previous: '上一页',
    next: '下一页',
    navigation: '导航',
    scrollTop: '滚动到顶部',
    moveTop: '移动到顶部',
    moveUp: '向上移动',
    moveDown: '向下移动',
    moveBottom: '移动到底部',
    moveToTarget: '移动到目标',
    moveToSource: '移动到源',
    moveAllToTarget: '全部移动到目标',
    moveAllToSource: '全部移动到源',
    pageLabel: '{page} / {pages}',
    firstPageLabel: '第一页',
    lastPageLabel: '最后一页',
    nextPageLabel: '下一页',
    prevPageLabel: '上一页',
    defaultLabel: '默认标签',
    menu: '菜单',
    rotateRight: '向右旋转',
    rotateLeft: '向左旋转',
    zoomImage: '放大图像',
    zoomIn: '放大',
    zoomOut: '缩小',
  },
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthNamesShort: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
  chooseYear: '选择年份',
  chooseMonth: '选择月份',
  chooseDate: '选择日期',
  prevDecade: '前十年',
  nextDecade: '后十年',
  prevYear: '上一年',
  nextYear: '下一年',
  prevMonth: '上一月',
  nextMonth: '下一月',
  prevHour: '上一小时',
  nextHour: '下一小时',
  prevMinute: '上一分钟',
  nextMinute: '下一分钟',
  prevSecond: '上一秒',
  nextSecond: '下一秒',
  ampm: '上午/下午',
}

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
  locale: zhCN,
})
app.use(ConfirmationService)
app.use(ToastService)

app.mount('#app')
