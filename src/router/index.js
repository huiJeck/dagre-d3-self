import Vue from 'vue'
import VueRouter from 'vue-router'
import flow from '../views/Flowchart/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'flowchart',
    component: flow
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
