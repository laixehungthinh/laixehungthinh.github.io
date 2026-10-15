```javascript
(() => {
  'use strict';

  const SUPABASE_URL = 'https://yicbwzyjldybwgchkzsm.supabase.co';
  const SUPABASE_KEY = 'sb_publishable-t-6KXoWq43KnaNsnB4OZBw_s3jLQSWF';

  function createWidget() {
    let el = document.getElementById('siteStatsWidget');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'siteStatsWidget';
    el.className = 'site-stats-widget';

    el.innerHTML = `
      <div class="site-stat-view">
        <span class="site-stat-icon">👁</span>
        <span>
          <b id="visitorCount">Đang tải...</b>
          <small>lượt truy cập</small>
        </span>
      </div>
      <div class="site-stat-rate">
        <span id="ratingAverage">Đánh giá bằng Google</span>
        <small id="ratingCount">
          Đăng nhập Google để gửi đánh giá
        </small>
      </div>
    `;

    document.body.appendChild(el);
    return el;
  }

  async function request(path, options = {}) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${path}`,
      {
        ...options,
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          ...(options.headers || {})
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async function init() {
    const box = createWidget();
    const countEl = box.querySelector('#visitorCount');

    // Thu tang bo dem
    try {
      const visits = await request('rpc/record_site_visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{}'
      });

      const count = Number(visits);

      if (!Number.isFinite(count)) {
        throw new Error('Gia tri bo dem khong hop le');
      }

      countEl.textContent = count.toLocaleString('vi-VN');
      return;
    } catch (error) {
      console.error('Loi tang bo dem:', error);
    }

    // Neu ham tang loi, thu doc so luot da luu
    try {
      const rows = await request(
        'site_stats?select=views&id=eq.1'
      );

      if (rows.length > 0) {
        countEl.textContent =
          Number(rows[0].views).toLocaleString('vi-VN');
      } else {
        countEl.textContent = 'Chưa có dữ liệu';
      }
    } catch (error) {
      console.error('Loi doc bo dem:', error);
      countEl.textContent = '—';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
      once: true
    });
  } else {
    init();
  }
})();
```
