import Vue from 'vue';
import App from './App.vue';
import './style.css'
import tooltip from './tooltip';
Vue.directive('tooltip', tooltip);

new Vue({
	el: '#app',
	render: h => h(App),
});
