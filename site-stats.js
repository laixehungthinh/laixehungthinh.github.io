(() => {
  'use strict';

  const SUPABASE_URL = 'https://yicbwzyjldybwgchkzsm.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_t-6KXoWq43KnaNsnB4OZBw_s3jLQSWF';

  // Tạo bộ đếm lượt truy cập, không tạo nút đánh giá sao.
  function createVisitorWidget() {
    let box = document.getElementById('siteStatsWidget');

    if (box) {
      box.innerHTML = '';
    } else {
      box = document.createElement('div');
      box.id = 'siteStatsWidget';
      box.className = 'site-stats-widget';
      document.body.appendChild(box);
    }

    box.innerHTML = `
      <div class="site-stat-view">
        <span class="site-stat-icon" aria-hidden="true">👁</span>
        <span>
          <b id="htVisitorCount">...</b>
          <small>lượt truy cập website</small>
        </span>
      </div>
    `;

    return box.querySelector('#htVisitorCount');
  }

  async function recordVisit() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/record_site_visit`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: '{}'
      }
    );

    if (!response.ok) {
      throw new Error(
        `Không thể ghi nhận lượt truy cập: ${await response.text()}`
      );
    }

    return response.json();
  }

  async function init() {
    const countElement = createVisitorWidget();

    try {
      const result = await recordVisit();

      // Hàm RPC có thể trả về số trực tiếp hoặc dữ liệu dạng đối tượng.
      let count = result;

      if (result && typeof result === 'object') {
        count =
          result.views ??
          result.count ??
          result.total ??
          result.record_site_visit;
      }

      const numericCount = Number(count);

      countElement.textContent = Number.isFinite(numericCount)
        ? numericCount.toLocaleString('vi-VN')
        : '—';
    } catch (error) {
      console.error('Lỗi bộ đếm lượt truy cập:', error);
      countElement.textContent = '—';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
