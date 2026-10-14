(() => {
  const SUPABASE_URL = 'https://yicbwzyjldybwgchkzsm.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_t-6KXoWq43KnaNsnB4OZBw_s3jLQSWF';

  const box = (() => {
    let el = document.getElementById('siteStatsWidget');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'siteStatsWidget';
    el.className = 'site-stats-widget';
    el.innerHTML = `
      <div class="site-stat-view">
        <span class="site-stat-icon">👁</span>
        <span><b id="visitorCount">...</b><small>lượt truy cập</small></span>
      </div>
      <div class="site-stat-rate">
        <span id="ratingAverage">...</span>
        <div id="ratingStars" class="rating-stars">
          <button data-star="1" type="button">★</button>
          <button data-star="2" type="button">★</button>
          <button data-star="3" type="button">★</button>
          <button data-star="4" type="button">★</button>
          <button data-star="5" type="button">★</button>
        </div>
        <small id="ratingCount">Đang tải...</small>
      </div>`;
    document.body.appendChild(el);
    return el;
  })();

  const countEl = box.querySelector('#visitorCount');
  const avgEl = box.querySelector('#ratingAverage');
  const starsEl = box.querySelector('#ratingStars');
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

  function showRating(data) {
    const average = Number(data?.average || 0);
    const total = Number(data?.count || 0);

    avgEl.textContent = total ? `${average.toFixed(1)} / 5` : 'Chưa có';
    ratingCountEl.textContent = total
      ? `${total.toLocaleString('vi-VN')} lượt đánh giá`
      : 'Hãy là người đầu tiên đánh giá';

    starsEl.querySelectorAll('button').forEach(button => {
      button.style.color =
        total && Number(button.dataset.star) <= Math.round(average)
          ? '#f5a623' : '#999';
    });
  }

  async function refreshRating() {
    showRating(await rpc('get_site_rating'));
  }

  async function rate(value) {
    starsEl.querySelectorAll('button').forEach(button => {
      button.disabled = true;
    });

    try {
      await rpc('submit_site_rating', { stars: value });
      await refreshRating();
      alert(`Cảm ơn bạn đã đánh giá Hưng Thịnh ${value} sao!`);
    } catch (error) {
      console.error(error);
      alert('Gửi đánh giá chưa thành công. Vui lòng thử lại.');
    } finally {
      starsEl.querySelectorAll('button').forEach(button => {
        button.disabled = false;
      });
    }
  }

  starsEl.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      rate(Number(button.dataset.star));
    });
  });

  async function init() {
    try {
      const visits = await rpc('record_site_visit');
      countEl.textContent = Number(visits).toLocaleString('vi-VN');
      await refreshRating();
    } catch (error) {
      console.error('Lỗi bộ đếm/đánh giá Supabase:', error);
      countEl.textContent = '—';
      avgEl.textContent = '—';
      ratingCountEl.textContent = 'Chưa kết nối được máy chủ';
    }
  }

  init();
})();
