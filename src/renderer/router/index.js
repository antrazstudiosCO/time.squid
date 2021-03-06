import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/register-index',
      name: 'register-index',
      component: require('@/components/Register/index').default
    },
    {
      path: '/sql/connections',
      name: 'connections-assistant',
      component: require('@/components/sql/ConnectionsAssistant').default
    }
  ]
})
