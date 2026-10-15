
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

    const view = document.createElement('div');
    view.className = 'site-stat-view';

    const icon = document.createElement('span');
    icon.className = 'site-stat-icon';
    icon.textContent = '👁';

    const viewText = document.createElement('span');
    const count = document.createElement('b');
    count.id = 'visitorCount';
    count.textContent = 'Đang tải...';

    const viewLabel = document.createElement('small');
    viewLabel.textContent = 'lượt truy cập';

    viewText.append(count, viewLabel);
    view.append(icon, viewText);

    const rate = document.createElement('div');
    rate.className = 'site-stat-rate';

    const avg = document.createElement('span');
    avg.id = 'ratingAverage';
    avg.textContent = 'Đánh giá bằng Google';

    const rateLabel = document.createElement('small');
    rateLabel.id = 'ratingCount';
    rateLabel.textContent = 'Đăng nhập Google để gửi đánh giá';

    rate.append(avg, rateLabel);
    el.append(view, rate);
    document.body.appendChild(el);

    return el;
  }

  async function rpc(name) {
    const response = await fetch(
      SUPABASE_URL + '/rest/v1/rpc/' + name,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: '{}',
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(name + ': ' + await response.text());
    }

    return response.json();
  }

  async function readSavedCount() {
    const response = await fetch(
      SUPABASE_URL + '/rest/v1/site_stats?select=views&id=eq.1',
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + SUPABASE_KEY
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const rows = await response.json();
    if (!rows.length) throw new Error('Không tìm thấy dữ liệu bộ đếm');

    return Number(rows[0].views);
  }

  async function init() {
    const box = createWidget();
    const countEl = box.querySelector('#visitorCount');

    try {
      const count = Number(await rpc('record_site_visit'));
      if (!Number.isFinite(count)) {
        throw new Error('Số lượt truy cập không hợp lệ');
      }
      countEl.textContent = count.toLocaleString('vi-VN');
    } catch (error) {
      console.error('Không tăng được bộ đếm:', error);

      try {
        const count = await readSavedCount();
        countEl.textContent = count.toLocaleString('vi-VN');
      } catch (readError) {
        console.error('Không đọc được bộ đếm:', readError);
        countEl.textContent = '—';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
