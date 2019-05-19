import Vue from 'vue';

import '<utils>/importBaseComponents';
import '<utils>/notice';

import i18n from '<utils>/i18n';

import store from '<website-admin>/store';
import router from '<website-admin>/routes';


new Vue({
  store,
  router,
  i18n,
  el: '#app',
});
