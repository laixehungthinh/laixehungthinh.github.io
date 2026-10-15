(() => {
  'use strict';

  const SUPABASE_URL = 'https://yicbwzyjldybwgchkzsm.supabase.co';
  const SUPABASE_KEY = 'sb_publishable-t-6KXoWq43KnaNsnB4OZBw_s3jLQSWF';

  const box = (() => {
    let el = document.getElementById('siteStatsWidget');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'siteStatsWidget';
    el.className = 'site-stats-widget';
    el.innerHTML = `
      <div class="site-stat-view">
        <span class="site-stat-icon">👁</span>
        <span>
          <b id="visitorCount">...</b>
          <small>lượt truy cập</small>
        </span>
      </div>
      <div class="site-stat-rate">
        <span id="ratingAverage">Đánh giá bằng Google</span>
        <small id="ratingCount">
          Đăng nhập Google để gửi đánh giá
        </small>
      </div>`;
    document.body.appendChild(el);
    return el;
  })();

  const countEl = box.querySelector('#visitorCount');
  const avgEl = box.querySelector('#ratingAverage');
  const ratingCountEl = box.querySelector('#ratingCount');

  async function rpc(name, params = {}) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      }
    );

    if (!response.ok) {
      throw new Error(`${name}: ${await response.text()}`);
    }

    return response.json();
  }

  async function init() {
    try {
      const visits = await rpc('record_site_visit');
      countEl.textContent = Number(visits).toLocaleString('vi-VN');
    } catch (error) {
      console.error('Lỗi bộ đếm lượt truy cập:', error);
      countEl.textContent = '—';
    }

    // Không gửi đánh giá từ hệ thống 5 sao cũ nữa.
    // Đánh giá mới sẽ dùng giao diện đăng nhập Google trong reviews.js.
    avgEl.textContent = 'Đánh giá bằng Google';
    ratingCountEl.textContent = 'Đăng nhập Google để gửi đánh giá';
  }

  init();
})();
