import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import App from './App.vue';
import { createApp } from 'vue';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

const app = createApp(App);
app.use(vuetify);

app.mount('#app');
