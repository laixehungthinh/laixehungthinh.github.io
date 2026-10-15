
(() => {
  'use strict';

  const SUPABASE_URL = 'https://yicbwzyjldybwgchkzsm.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_t-6KXoWq43KnaNsnB4OZBw_s3jLQSWF';

  const TABLE = 'site_reviews_google';
  const BUCKET = 'review-photos';

  // Tránh tạo giao diện hai lần
  if (document.getElementById('htGoogleReviews')) return;

  const style = document.createElement('style');
  style.textContent = `
    #htGoogleReviews { padding: 48px 0; background: #f5f7fb; }
    #htGoogleReviews .ht-review-wrap { max-width: 1100px; margin: auto; padding: 0 18px; }
    #htGoogleReviews .ht-review-title { text-align: center; margin-bottom: 25px; }
    #htGoogleReviews .ht-review-title h2 { color: #17365d; margin: 8px 0; }
    #htGoogleReviews .ht-review-summary { text-align: center; background: white; padding: 20px; border-radius: 12px; margin-bottom: 22px; }
    #htGoogleReviews .ht-big-stars { color: #f5a623; font-size: 25px; letter-spacing: 2px; }
    #htGoogleReviews .ht-review-panel { background: white; border-radius: 12px; padding: 22px; margin-bottom: 22px; box-shadow: 0 3px 14px #0000000c; }
    #htGoogleReviews .ht-review-btn { border: 0; border-radius: 7px; padding: 11px 17px; background: #17365d; color: white; font-weight: bold; cursor: pointer; }
    #htGoogleReviews .ht-review-btn:disabled { opacity: .55; cursor: wait; }
    #htGoogleReviews .ht-review-btn.secondary { background: #64748b; }
    #htGoogleReviews .ht-review-form label { display: block; font-weight: 600; margin: 13px 0 6px; }
    #htGoogleReviews .ht-review-form textarea, #htGoogleReviews .ht-review-form input[type="file"] { width: 100%; box-sizing: border-box; }
    #htGoogleReviews .ht-review-form textarea { min-height: 100px; padding: 11px; border: 1px solid #ccd3df; border-radius: 7px; font: inherit; }
    #htGoogleReviews .ht-star-picker { display: flex; gap: 6px; margin: 7px 0; }
    #htGoogleReviews .ht-star-picker button { background: none; border: 0; padding: 0; font-size: 35px; color: #cbd5e1; cursor: pointer; }
    #htGoogleReviews .ht-star-picker button.selected { color: #f5a623; }
    #htGoogleReviews .ht-review-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
    #htGoogleReviews .ht-review-card { background: white; padding: 18px; border-radius: 12px; box-shadow: 0 3px 14px #0000000c; overflow-wrap: anywhere; }
    #htGoogleReviews .ht-review-person { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    #htGoogleReviews .ht-review-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; background: #e2e8f0; }
    #htGoogleReviews .ht-review-name { font-weight: bold; color: #17365d; }
    #htGoogleReviews .ht-review-date { font-size: 12px; color: #64748b; margin-top: 3px; }
    #htGoogleReviews .ht-review-card-stars { color: #f5a623; margin: 7px 0; }
    #htGoogleReviews .ht-review-photo { display: block; max-width: 100%; max-height: 300px; object-fit: contain; margin-top: 12px; border-radius: 8px; }
    #htGoogleReviews .ht-review-message { white-space: pre-wrap; line-height: 1.6; }
    #htGoogleReviews .ht-review-status { margin-top: 12px; color: #334155; overflow-wrap: anywhere; }
    #htGoogleReviews .ht-review-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    @media(max-width:600px) {
      #htGoogleReviews { padding: 32px 0; }
      #htGoogleReviews .ht-review-panel { padding: 16px; }
    }
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'htGoogleReviews';
  section.innerHTML = `
    <div class="ht-review-wrap">
      <div class="ht-review-title">
        <span class="section-kicker">Ý KIẾN HỌC VIÊN</span>
        <h2>ĐÁNH GIÁ HƯNG THỊNH</h2>
        <p>Chia sẻ trải nghiệm học tập của bạn với trung tâm.</p>
      </div>

      <div class="ht-review-summary">
        <div class="ht-big-stars" id="htReviewAverageStars">☆☆☆☆☆</div>
        <div><strong id="htReviewAverage">Chưa có đánh giá</strong></div>
        <div id="htReviewCount">Đang tải đánh giá...</div>
      </div>

      <div class="ht-review-panel">
        <div id="htReviewLoggedOut">
          <h3>Đánh giá bằng tài khoản Google</h3>
          <p>Bạn cần đăng nhập Google để gửi hoặc sửa đánh giá của mình.</p>
          <button type="button" class="ht-review-btn" id="htGoogleLogin">
            Đăng nhập bằng Google
          </button>
        </div>

        <div id="htReviewLoggedIn" hidden>
          <p>Đang đăng nhập: <strong id="htReviewUserName"></strong></p>
          <div class="ht-review-actions">
            <button type="button" class="ht-review-btn secondary" id="htGoogleLogout">
              Đăng xuất
            </button>
          </div>

          <form class="ht-review-form" id="htReviewForm">
            <h3 id="htReviewFormTitle">Viết đánh giá của bạn</h3>

            <label>Chọn số sao</label>
            <div class="ht-star-picker" id="htReviewStarPicker" aria-label="Chọn số sao">
              <button type="button" data-star="1" aria-label="1 sao">★</button>
              <button type="button" data-star="2" aria-label="2 sao">★</button>
              <button type="button" data-star="3" aria-label="3 sao">★</button>
              <button type="button" data-star="4" aria-label="4 sao">★</button>
              <button type="button" data-star="5" aria-label="5 sao">★</button>
            </div>

            <label for="htReviewText">Nhận xét</label>
            <textarea id="htReviewText" maxlength="2000"
              placeholder="Chia sẻ cảm nhận của bạn về trung tâm..." required></textarea>

            <label for="htReviewPhoto">Ảnh đính kèm (không bắt buộc)</label>
            <input id="htReviewPhoto" type="file" accept="image/jpeg,image/png,image/webp">
            <small>Chỉ nhận JPG, PNG hoặc WebP, tối đa 5 MB.</small>

            <div id="htReviewExistingPhoto"></div>

            <div class="ht-review-actions" style="margin-top:16px">
              <button class="ht-review-btn" id="htReviewSubmit" type="submit">
                Gửi đánh giá
              </button>
            </div>
            <div class="ht-review-status" id="htReviewFormStatus" role="status"></div>
          </form>
        </div>
      </div>

      <h3>Nhận xét từ học viên</h3>
      <div class="ht-review-list" id="htReviewList">
        <p>Đang tải đánh giá...</p>
      </div>
    </div>
  `;

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    statsSection.insertAdjacentElement('afterend', section);
  } else {
    document.querySelector('main')?.appendChild(section);
  }

  let db = null;
  let currentUser = null;
  let currentReview = null;
  let selectedStars = 5;

  const $ = id => document.getElementById(id);

  function setStatus(message) {
    $('htReviewFormStatus').textContent = message;
  }

  function safeText(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value ?? '';
    return element;
  }

  function selectStars(value) {
    selectedStars = value;
    $('htReviewStarPicker').querySelectorAll('button').forEach(button => {
      const selected = Number(button.dataset.star) <= value;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('vi-VN');
  }

  async function loadReviews() {
    const { data, error } = await db
      .from(TABLE)
      .select('user_id,display_name,avatar_url,rating,review_text,image_url,created_at,updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const reviews = data || [];
    const total = reviews.length;
    const average = total
      ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / total
      : 0;

    $('htReviewAverage').textContent = total
      ? `${average.toFixed(1)} / 5`
      : 'Chưa có đánh giá';

    $('htReviewAverageStars').textContent = total
      ? '★'.repeat(Math.round(average)) + '☆'.repeat(5 - Math.round(average))
      : '☆☆☆☆☆';

    $('htReviewCount').textContent = `${total.toLocaleString('vi-VN')} lượt đánh giá`;

    const list = $('htReviewList');
    list.replaceChildren();

    if (!total) {
      list.appendChild(safeText('p', '', 'Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!'));
      return;
    }

    reviews.forEach(review => {
      const card = document.createElement('article');
      card.className = 'ht-review-card';

      const person = document.createElement('div');
      person.className = 'ht-review-person';

      const avatar = document.createElement('img');
      avatar.className = 'ht-review-avatar';
      avatar.alt = '';
      avatar.src = review.avatar_url || '';
      avatar.referrerPolicy = 'no-referrer';
      avatar.onerror = () => {
        avatar.removeAttribute('src');
        avatar.style.display = 'none';
      };
      person.appendChild(avatar);

      const identity = document.createElement('div');
      identity.appendChild(safeText('div', 'ht-review-name', review.display_name || 'Học viên'));
      identity.appendChild(safeText('div', 'ht-review-date', formatDate(review.created_at)));
      person.appendChild(identity);
      card.appendChild(person);

      card.appendChild(safeText(
        'div',
        'ht-review-card-stars',
        '★'.repeat(Math.max(0, Math.min(5, Number(review.rating)))) +
          '☆'.repeat(5 - Math.max(0, Math.min(5, Number(review.rating))))
      ));

      if (review.review_text) {
        card.appendChild(safeText('p', 'ht-review-message', review.review_text));
      }

      if (review.image_url) {
        const photo = document.createElement('a');
        photo.href = review.image_url;
        photo.target = '_blank';
        photo.rel = 'noopener noreferrer';

        const img = document.createElement('img');
        img.className = 'ht-review-photo';
        img.src = review.image_url;
        img.alt = 'Ảnh đính kèm đánh giá';
        img.loading = 'lazy';
        photo.appendChild(img);
        card.appendChild(photo);
      }

      if (currentUser && review.user_id === currentUser.id) {
        card.appendChild(safeText('small', '', 'Đây là đánh giá của bạn.'));
      }

      list.appendChild(card);
    });
  }

  async function loadOwnReview() {
    currentReview = null;
    $('htReviewText').value = '';
    $('htReviewPhoto').value = '';
    $('htReviewExistingPhoto').replaceChildren();
    $('htReviewFormTitle').textContent = 'Viết đánh giá của bạn';
    $('htReviewSubmit').textContent = 'Gửi đánh giá';
    selectStars(5);

    const { data, error } = await db
      .from(TABLE)
      .select('user_id,display_name,avatar_url,rating,review_text,image_url,created_at,updated_at')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) return;

    currentReview = data;
    $('htReviewText').value = data.review_text || '';
    $('htReviewFormTitle').textContent = 'Sửa đánh giá của bạn';
    $('htReviewSubmit').textContent = 'Lưu thay đổi';
    selectStars(Number(data.rating) || 5);

    if (data.image_url) {
      const note = safeText('p', '', 'Bạn đã có ảnh đính kèm. Chọn ảnh mới nếu muốn thay ảnh.');
      const link = document.createElement('a');
      link.href = data.image_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Xem ảnh hiện tại';
      $('htReviewExistingPhoto').append(note, link);
    }
  }

  async function updateAuthUI(session) {
    currentUser = session?.user || null;
    $('htReviewLoggedOut').hidden = !!currentUser;
    $('htReviewLoggedIn').hidden = !currentUser;

    if (!currentUser) {
      currentReview = null;
      return;
    }

    const metadata = currentUser.user_metadata || {};
    $('htReviewUserName').textContent =
      metadata.full_name || metadata.name || currentUser.email || 'Tài khoản Google';

    await loadOwnReview();
  }

  async function uploadPhoto(file) {
    if (!file) return currentReview?.image_url || null;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Ảnh phải có định dạng JPG, PNG hoặc WebP.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.');
    }

    const ext = ({
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    })[file.type];

    const path = `${currentUser.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    const { data } = db.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function saveReview(event) {
    event.preventDefault();
    if (!currentUser) {
      setStatus('Vui lòng đăng nhập Google trước.');
      return;
    }

    const reviewText = $('htReviewText').value.trim();
    if (!reviewText) {
      setStatus('Vui lòng nhập nội dung nhận xét.');
      return;
    }

    const submit = $('htReviewSubmit');
    submit.disabled = true;
    setStatus('Đang lưu đánh giá...');

    try {
      const metadata = currentUser.user_metadata || {};
      const file = $('htReviewPhoto').files[0] || null;
      const imageUrl = await uploadPhoto(file);

      const review = {
        user_id: currentUser.id,
        display_name: metadata.full_name || metadata.name ||
          currentUser.email || 'Học viên',
        avatar_url: metadata.avatar_url || metadata.picture || null,
        rating: selectedStars,
        review_text: reviewText,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await db
        .from(TABLE)
        .upsert(review, { onConflict: 'user_id' });

      if (error) throw error;

      setStatus('Đã lưu đánh giá thành công!');
      await loadReviews();
      await loadOwnReview();
      $('htReviewPhoto').value = '';
    } catch (error) {
      console.error('Lỗi lưu đánh giá:', error);
      setStatus('Chưa lưu được đánh giá: ' + (error.message || 'Vui lòng thử lại.'));
    } finally {
      submit.disabled = false;
    }
  }

  async function init() {
    try {
      // Nạp thư viện Supabase chính thức
      if (!window.supabase?.createClient) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Không tải được thư viện Supabase.'));
          document.head.appendChild(script);
        });
      }

      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

      $('htGoogleLogin').addEventListener('click', async () => {
        const { error } = await db.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.href.split('#')[0]
          }
        });

        if (error) {
          alert('Không thể đăng nhập Google: ' + error.message);
        }
      });

      $('htGoogleLogout').addEventListener('click', async () => {
        const { error } = await db.auth.signOut();
        if (error) {
          alert('Đăng xuất chưa thành công: ' + error.message);
        }
      });

      $('htReviewStarPicker').querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          selectStars(Number(button.dataset.star));
        });
      });

      $('htReviewForm').addEventListener('submit', saveReview);

      const { data, error } = await db.auth.getSession();
      if (error) throw error;

      await updateAuthUI(data.session);
      await loadReviews();

      db.auth.onAuthStateChange((_event, session) => {
        // Tránh chờ tác vụ mạng bên trong callback xác thực
        setTimeout(async () => {
          try {
            await updateAuthUI(session);
            await loadReviews();
          } catch (error) {
            console.error('Lỗi tải hồ sơ đánh giá:', error);
            setStatus('Không tải được hồ sơ đánh giá. Vui lòng tải lại trang.');
          }
        }, 0);
      });
    } catch (error) {
      console.error('Lỗi khởi tạo đánh giá:', error);
      $('htReviewList').textContent =
        'Chưa kết nối được hệ thống đánh giá. Vui lòng thử tải lại trang sau.';
      $('htReviewCount').textContent = 'Lỗi kết nối';
    }
  }

  init();
})();
