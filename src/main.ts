import "./assets/base.scss";
import 'vuetify/styles';

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import { aliases, fa } from 'vuetify/iconsets/fa-svg'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

library.add(fas);
library.add(far);

async function loadVue() {
    const app = createApp(App)
    const vuetify = createVuetify({
        theme: {
            defaultTheme: "dark",
        },
        icons: {
            defaultSet: "fa",
            aliases,
            sets: {
                fa,
            },
        },
        components,
        directives,
    });
    app.component('font-awesome-icon', FontAwesomeIcon);
    app.use(router);
    app.use(vuetify);
    app.mount('#app')
}

loadVue().then(() => console.info("Vue loaded."));
