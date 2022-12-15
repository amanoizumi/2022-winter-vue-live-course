import 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';

import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const app = createApp({
  data() {
    return {
      email: '',
      password: '',
      loginBtnDisabled: false,
    };
  },
  methods: {
    login() {
      this.loginBtnDisabled = true;

      const url = 'https://vue3-course-api.hexschool.io/v2/admin/signin';

      const user = {
        username: this.email,
        password: this.password,
      };

      axios
        .post(url, user)
        .then((res) => {
          const { token, expired } = res.data;

          // cookie 設定，參考範例程式碼

          // 寫入 cookie token
          // expires 設置有效時間
          document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`;
          window.location = 'products.html';
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          this.loginBtnDisabled = false;
        });
    },
  },
});

app.mount('#app');
