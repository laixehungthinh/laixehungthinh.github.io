
(() => {
  'use strict';

  const SUPABASE_URL = 'https://yicbwzyjldybwgchkzsm.supabase.co';
  const SUPABASE_KEY = 'sb_publishable-t-6KXoWq43KnaNsnB4OZBw_s3jLQSWF';

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY
  };

  async function getJson(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  function showCount(value) {
    const el = document.getElementById('visitorCount');
    if (!el) return;

    const count = Number(value);
    el.textContent = Number.isFinite(count)
      ? count.toLocaleString('vi-VN')
      : '—';
  }

  async function updateVisitorCount() {
    try {
      // Tang bo dem va nhan so luot moi
      const count = await getJson(
        SUPABASE_URL + '/rest/v1/rpc/record_site_visit',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}'
        }
      );

      if (!Number.isFinite(Number(count))) {
        throw new Error('So luot truy cap khong hop le');
      }

      showCount(count);
    } catch (error) {
      console.error('Loi tang bo dem:', error);

      // Neu khong tang duoc, doc so luot dang luu
      try {
        const rows = await getJson(
          SUPABASE_URL +
          '/rest/v1/site_stats?select=views&id=eq.1'
        );

        if (rows.length) {
          showCount(rows[0].views);
        } else {
          showCount('—');
        }
      } catch (readError) {
        console.error('Loi doc bo dem:', readError);
        showCount('—');
      }
    }
  }

  async function updateRatingSummary() {
    const averageEl = document.getElementById('ratingAverage');
    const starsEl = document.getElementById('ratingStars');
    const countEl = document.getElementById('ratingCount');

    if (!averageEl || !countEl) return;

    try {
      const reviews = await getJson(
        SUPABASE_URL +
        '/rest/v1/site_reviews_google?select=rating'
      );

      const total = reviews.length;
      const average = total
        ? reviews.reduce(
            (sum, item) => sum + Number(item.rating || 0),
            0
          ) / total
        : 0;

      averageEl.textContent = total
        ? average.toFixed(1) + ' / 5'
        : 'Chưa có';

      countEl.textContent = total
        ? total.toLocaleString('vi-VN') + ' lượt đánh giá'
        : 'Chưa có đánh giá';

      if (starsEl) {
        const rounded = Math.round(average);
        starsEl.textContent = '★'.repeat(rounded) +
          '☆'.repeat(5 - rounded);
        starsEl.style.color = '#f5a623';
      }
    } catch (error) {
      console.error('Loi tai thong ke danh gia:', error);
      averageEl.textContent = 'Đánh giá Google';
      countEl.textContent = 'Xem phần đánh giá bên dưới';
    }
  }

  function init() {
    updateVisitorCount();
    updateRatingSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
      once: true
    });
  } else {
    init();
  }
})();
