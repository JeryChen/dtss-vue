import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/page/Login'
import Index from "../components/common/Index";
import CronTask from "../components/page/task/CronTask";
import App from "../components/page/app/App";
import Log from "../components/page/log/Log";
import TimeTask from "../components/page/task/TimeTask";
import DataMarket from "../components/page/market/DataMarket";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    }, {
      path: '/login',
      component: Login,
      meta: {
        requireLogin: false
      }
    }, {
      path: '/index',
      component: Index,
      meta: {
        requireLogin: true
      },
      children: [{
        path: '/data-market',
        component: DataMarket,
        meta: {
          requireLogin: true
        }
      }, {
        path: '/cron-task',
        component: CronTask,
        meta: {
          requireLogin: true
        }
      }, {
        path: '/time-task',
        component: TimeTask,
        meta: {
          requireLogin: true
        }
      }, {
        path: '/log',
        component: Log,
        meta: {
          requireLogin: true
        }
      }, {
        path: '/app',
        component: App,
        meta: {
          requireLogin: true
        }
      }]
    }
  ]
})
