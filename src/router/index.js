import Vue from 'vue'
import Router from 'vue-router'

// import Login from '@/components/Login.vue'
// import Register from '@/components/Register.vue'
import Share from '../views/Share.vue'

Vue.use(Router)

export default new Router({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes: [
        {
          path: '/',
          redirect: {
           name: 'share'
          }
        },
        {
          path: '/share',
          name: 'share',
          component: Share,
          meta: {
            title: '文件共享'
          }
        }
    ]
})