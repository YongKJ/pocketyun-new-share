import Vue from 'vue'
import App from './App.vue'

import router from './router'
router.beforeEach((to, from, next) => {
  if(to.path == '/') {
    next();
  }else if(to.path == '/share') {
    document.title = to.meta.title;
    next();
  }else {
    next({path: '/'});
  }
});

import 'default-passive-events'

import axios from 'axios'
Vue.prototype.$axios = axios;

import qs from 'qs'
Vue.prototype.$qs = qs;

import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import VueDPlayer from 'vue-dplayer'
import 'vue-dplayer/dist/vue-dplayer.css'
Vue.use(VueDPlayer);

import APlayer from '@moefe/vue-aplayer';
Vue.use(APlayer, {
  defaultCover: 'https://github.com/u3u.png',
  productionTip: false,
});

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
Vue.use(mavonEditor);

import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
Vue.use(Viewer);
Viewer.setDefaults({
  Options: {
    "inline": true,
    "button": true,
    "navbar": true,
    "title": true,
    "toolbar": true,
    "tooltip": true,
    "movable": true,
    "zoomable": true,
    "rotatable": true,
    "scalable": true,
    "transition": true,
    "fullscreen": true,
    "keyboard": true,
    "url": "data-source"
  }
});

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
