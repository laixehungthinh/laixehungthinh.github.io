
(() => {
  'use strict';

  const SUPABASE_URL =
    'https://yicbwzyjldybwgchkzsm.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable-t-6KXoWq43KnaNsnB4OZBw_s3jLQSWF';

  const TABLE = 'site_reviews_google';
  const BUCKET = 'review-photos';

  let db = null;
  let currentUser = null;
  let ownReview = null;
  let selectedPhoto = null;
  let authReady = false;

  // Tải thư viện Supabase.
  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

      script.onload = () => {
        if (window.supabase?.createClient) {
          resolve();
        } else {
          reject(new Error('Thư viện Supabase không hợp lệ.'));
        }
      };

      script.onerror = () =>
        reject(new Error('Không tải được thư viện Supabase.'));

      document.head.appendChild(script);
    });
  }

  function createReviewSection() {
    if (document.getElementById('htGoogleReviews')) return;

    const section = document.createElement('section');
    section.id = 'htGoogleReviews';
    section.className = 'section';

    section.innerHTML = `
      <div class="container">
        <span class="section-kicker">Ý KIẾN HỌC VIÊN</span>
        <h2 id="danh-gia-hung-thinh">ĐÁNH GIÁ HƯNG THỊNH</h2>

        <p class="ht-review-intro">
          Đăng nhập Google để chia sẻ trải nghiệm học tập của bạn.
          Mỗi tài khoản có thể gửi một đánh giá và cập nhật đánh giá của mình.
        </p>

        <div class="ht-review-summary">
          <div class="ht-review-average" id="htReviewAverage">—</div>
          <div>
            <div class="ht-review-stars" id="htReviewAverageStars">☆☆☆☆☆</div>
            <div id="htReviewTotal">Đang tải đánh giá...</div>
          </div>
        </div>

        <div class="ht-review-login" id="htReviewLogin">
          <p>Vui lòng đăng nhập Google trước khi gửi đánh giá.</p>
          <button type="button" class="ht-review-button" id="htGoogleLogin">
            <span aria-hidden="true">G</span> Đăng nhập bằng Google
          </button>
        </div>

        <div class="ht-review-user" id="htReviewUser" hidden>
          <div class="ht-review-user-line">
            <span id="htReviewSignedInAs"></span>
            <button type="button"
              class="ht-review-button ht-review-secondary"
              id="htGoogleLogout">Đăng xuất</button>
          </div>

          <form id="htReviewForm">
            <h3 id="htReviewFormTitle">Gửi đánh giá của bạn</h3>

            <label for="htReviewRating">Bạn đánh giá trung tâm mấy sao?</label>
            <select id="htReviewRating" required>
              <option value="5">5 sao — Rất hài lòng</option>
              <option value="4">4 sao — Hài lòng</option>
              <option value="3">3 sao — Bình thường</option>
              <option value="2">2 sao — Chưa hài lòng</option>
              <option value="1">1 sao — Không hài lòng</option>
            </select>

            <label for="htReviewText">Nội dung nhận xét</label>
            <textarea id="htReviewText" rows="4" maxlength="2000"
              placeholder="Chia sẻ trải nghiệm học tập của bạn..."
              required></textarea>

            <label for="htReviewPhoto">Ảnh đính kèm (không bắt buộc)</label>
            <input id="htReviewPhoto" type="file"
              accept="image/jpeg,image/png,image/webp">
            <small class="ht-review-help">
              Chấp nhận JPG, PNG hoặc WEBP; tối đa 5 MB.
            </small>

            <div id="htReviewFormStatus"
              class="ht-review-status" role="status"></div>

            <button type="submit" class="ht-review-button"
              id="htReviewSubmit">Gửi đánh giá</button>
          </form>
        </div>

        <div class="ht-review-list-heading">
          <h3>Đánh giá từ học viên</h3>
        </div>

        <div id="htReviewList" class="ht-review-list">
          <p>Đang tải đánh giá...</p>
        </div>
      </div>
    `;

    const stats = document.querySelector('.stats-section');
    const register = document.querySelector('#dang-ky');

    if (stats) {
      stats.insertAdjacentElement('afterend', section);
    } else if (register) {
      register.insertAdjacentElement('beforebegin', section);
    } else {
      document.querySelector('main')?.appendChild(section);
    }

    addReviewStyles();
    bindUiEvents();
  }

  function addReviewStyles() {
    if (document.getElementById('htReviewStyles')) return;

    const style = document.createElement('style');
    style.id = 'htReviewStyles';

    style.textContent = `
      #htGoogleReviews { scroll-margin-top: 24px; }
      #htGoogleReviews .ht-review-intro {
        max-width: 760px; color: #555; line-height: 1.7;
      }
      #htGoogleReviews .ht-review-summary {
        display: flex; align-items: center; gap: 18px;
        flex-wrap: wrap; margin: 24px 0; padding: 20px;
        border: 1px solid #e4e7ec; border-radius: 14px;
        background: #fff;
      }
      #htGoogleReviews .ht-review-average {
        font-size: 34px; font-weight: 800; color: #182230;
      }
      #htGoogleReviews .ht-review-stars {
        color: #f5a623; font-size: 23px; letter-spacing: 2px;
      }
      #htGoogleReviews .ht-review-login,
      #htGoogleReviews .ht-review-user {
        margin: 20px 0; padding: 22px;
        border: 1px solid #e4e7ec; border-radius: 14px;
        background: #fff;
      }
      #htGoogleReviews .ht-review-button {
        display: inline-flex; align-items: center;
        justify-content: center; gap: 9px;
        border: 0; border-radius: 8px; padding: 12px 18px;
        background: #b42318; color: #fff; font-weight: 700;
        cursor: pointer;
      }
      #htGoogleReviews .ht-review-button:hover { opacity: .9; }
      #htGoogleReviews .ht-review-button:disabled {
        opacity: .6; cursor: wait;
      }
      #htGoogleReviews .ht-review-secondary {
        background: #475467; padding: 8px 12px;
      }
      #htGoogleReviews .ht-review-user-line {
        display: flex; justify-content: space-between;
        align-items: center; gap: 12px; flex-wrap: wrap;
        margin-bottom: 18px;
      }
      #htGoogleReviews form {
        display: grid; gap: 10px; max-width: 760px;
      }
      #htGoogleReviews form label {
        font-weight: 700; margin-top: 8px;
      }
      #htGoogleReviews form select,
      #htGoogleReviews form textarea,
      #htGoogleReviews form input[type="file"] {
        width: 100%; box-sizing: border-box; padding: 11px;
        border: 1px solid #d0d5dd; border-radius: 8px;
        background: #fff; color: #101828; font: inherit;
      }
      #htGoogleReviews .ht-review-help {
        color: #667085; font-size: 13px;
      }
      #htGoogleReviews .ht-review-status {
        min-height: 20px; color: #344054;
        overflow-wrap: anywhere;
      }
      #htGoogleReviews .ht-review-list-heading { margin-top: 32px; }
      #htGoogleReviews .ht-review-list {
        display: grid; gap: 16px; margin-top: 16px;
      }
      #htGoogleReviews .ht-review-card {
        padding: 20px; border: 1px solid #e4e7ec;
        border-radius: 14px; background: #fff;
        overflow-wrap: anywhere;
      }
      #htGoogleReviews .ht-review-card-head {
        display: flex; align-items: center; gap: 12px;
      }
      #htGoogleReviews .ht-review-avatar {
        width: 44px; height: 44px; flex: 0 0 44px;
        border-radius: 50%; object-fit: cover;
        background: #eaecf0;
      }
      #htGoogleReviews .ht-review-name { font-weight: 800; }
      #htGoogleReviews .ht-review-date {
        color: #667085; font-size: 13px; margin-top: 3px;
      }
      #htGoogleReviews .ht-review-card-stars {
        margin: 12px 0 8px; color: #f5a623; font-size: 20px;
      }
      #htGoogleReviews .ht-review-card-text {
        white-space: pre-wrap; line-height: 1.7;
      }
      #htGoogleReviews .ht-review-photo {
        display: block; max-width: 100%; max-height: 420px;
        margin-top: 14px; border-radius: 10px; object-fit: contain;
      }
      #htGoogleReviews [hidden] { display: none !important; }
    `;

    document.head.appendChild(style);
  }

  function bindUiEvents() {
    document.getElementById('htGoogleLogin')
      .addEventListener('click', loginWithGoogle);

    document.getElementById('htGoogleLogout')
      .addEventListener('click', logout);

    document.getElementById('htReviewPhoto')
      .addEventListener('change', handlePhotoSelection);

    document.getElementById('htReviewForm')
      .addEventListener('submit', saveReview);
  }

  function setStatus(message, isError = false) {
    const el = document.getElementById('htReviewFormStatus');
    if (!el) return;

    el.textContent = message;
    el.style.color = isError ? '#b42318' : '#067647';
  }

  function showLoginError(message) {
    const button = document.getElementById('htGoogleLogin');

    if (button) {
      button.disabled = false;
      button.innerHTML =
        '<span aria-hidden="true">G</span> Đăng nhập bằng Google';
    }

    if (message) {
      console.error('Lỗi xác thực Google:', message);
      alert('Đăng nhập chưa hoàn tất: ' + message);
    }
  }

  async function loginWithGoogle() {
    if (!db) return;

    const button = document.getElementById('htGoogleLogin');
    button.disabled = true;
    button.textContent = 'Đang chuyển đến Google...';

    try {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.hash = 'danh-gia-hung-thinh';

      const { error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString()
        }
      });

      if (error) throw error;
    } catch (error) {
      showLoginError(error.message || 'Vui lòng thử lại.');
    }
  }

  async function logout() {
    if (!db) return;

    const { error } = await db.auth.signOut();

    if (error) {
      console.error('Lỗi đăng xuất:', error);
      alert('Chưa đăng xuất được. Vui lòng thử lại.');
      return;
    }

    currentUser = null;
    ownReview = null;
    selectedPhoto = null;

    updateAuthUi();
    await loadReviews();
  }

  function updateAuthUi() {
    const loginBox = document.getElementById('htReviewLogin');
    const userBox = document.getElementById('htReviewUser');
    const signedInAs = document.getElementById('htReviewSignedInAs');
    const formTitle = document.getElementById('htReviewFormTitle');
    const submitButton = document.getElementById('htReviewSubmit');

    if (!loginBox || !userBox) return;

    loginBox.hidden = Boolean(currentUser);
    userBox.hidden = !currentUser;

    if (!currentUser) {
      signedInAs.textContent = '';
      return;
    }

    const metadata = currentUser.user_metadata || {};
    const name =
      metadata.full_name ||
      metadata.name ||
      currentUser.email ||
      'Học viên';

    signedInAs.textContent = `Đã đăng nhập: ${name}`;
    formTitle.textContent = ownReview
      ? 'Chỉnh sửa đánh giá của bạn'
      : 'Gửi đánh giá của bạn';

    submitButton.textContent = ownReview
      ? 'Cập nhật đánh giá'
      : 'Gửi đánh giá';

    if (ownReview) {
      document.getElementById('htReviewRating').value =
        String(ownReview.rating);

      document.getElementById('htReviewText').value =
        ownReview.review_text || '';
    } else {
      document.getElementById('htReviewRating').value = '5';
      document.getElementById('htReviewText').value = '';
    }

    document.getElementById('htReviewPhoto').value = '';
    selectedPhoto = null;

    setStatus(
      ownReview
        ? 'Bạn đã có đánh giá. Bạn có thể cập nhật nội dung bên dưới.'
        : 'Bạn có thể gửi đánh giá sau khi điền thông tin.'
    );
  }

  function handlePhotoSelection(event) {
    const file = event.target.files?.[0] || null;
    selectedPhoto = file;

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      selectedPhoto = null;
      event.target.value = '';
      setStatus('Ảnh phải là JPG, PNG hoặc WEBP.', true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      selectedPhoto = null;
      event.target.value = '';
      setStatus('Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.', true);
      return;
    }

    setStatus(`Đã chọn ảnh: ${file.name}`);
  }

  async function loadOwnReview() {
    ownReview = null;
    if (!currentUser) return;

    const { data, error } = await db
      .from(TABLE)
      .select(
        'id,user_id,display_name,avatar_url,rating,review_text,image_url,created_at,updated_at'
      )
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.error('Lỗi tải đánh giá cá nhân:', error);
      setStatus(
        'Chưa tải được đánh giá của bạn. Hãy kiểm tra quyền truy cập bảng.',
        true
      );
      return;
    }

    ownReview = data || null;
  }

  async function uploadPhoto(file) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext)
      ? ext
      : 'jpg';

    const path =
      `${currentUser.id}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;

    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function saveReview(event) {
    event.preventDefault();

    if (!currentUser) {
      setStatus('Bạn cần đăng nhập Google trước khi gửi đánh giá.', true);
      return;
    }

    const rating = Number(
      document.getElementById('htReviewRating').value
    );

    const reviewText =
      document.getElementById('htReviewText').value.trim();

    const submitButton = document.getElementById('htReviewSubmit');

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setStatus('Vui lòng chọn số sao từ 1 đến 5.', true);
      return;
    }

    if (!reviewText || reviewText.length > 2000) {
      setStatus('Nhận xét phải có nội dung và không quá 2.000 ký tự.', true);
      return;
    }

    submitButton.disabled = true;
    setStatus('Đang lưu đánh giá, vui lòng chờ...');

    try {
      const metadata = currentUser.user_metadata || {};

      const displayName =
        metadata.full_name ||
        metadata.name ||
        currentUser.email ||
        'Học viên';

      const avatarUrl =
        metadata.avatar_url || metadata.picture || null;

      let imageUrl = ownReview?.image_url || null;

      if (selectedPhoto) {
        imageUrl = await uploadPhoto(selectedPhoto);
      }

      const record = {
        user_id: currentUser.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        rating,
        review_text: reviewText,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await db
        .from(TABLE)
        .upsert(record, { onConflict: 'user_id' });

      if (error) throw error;

      setStatus('Đã lưu đánh giá thành công.');

      await loadOwnReview();
      updateAuthUi();
      await loadReviews();
    } catch (error) {
      console.error('Lỗi lưu đánh giá:', error);
      setStatus(
        'Chưa lưu được đánh giá. Hãy kiểm tra quyền của bảng và kho ảnh Supabase.',
        true
      );
    } finally {
      submitButton.disabled = false;
    }
  }

  function addText(parent, tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = value || '';
    parent.appendChild(el);
    return el;
  }

  function renderReviewCard(review) {
    const card = document.createElement('article');
    card.className = 'ht-review-card';

    const head = document.createElement('div');
    head.className = 'ht-review-card-head';

    if (review.avatar_url) {
      const avatar = document.createElement('img');
      avatar.className = 'ht-review-avatar';
      avatar.src = review.avatar_url;
      avatar.alt = '';
      avatar.referrerPolicy = 'no-referrer';
      avatar.onerror = () => avatar.remove();
      head.appendChild(avatar);
    } else {
      const avatar = document.createElement('div');
      avatar.className = 'ht-review-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.style.display = 'grid';
      avatar.style.placeItems = 'center';
      avatar.textContent = '👤';
      head.appendChild(avatar);
    }

    const identity = document.createElement('div');

    addText(
      identity,
      'div',
      'ht-review-name',
      review.display_name || 'Học viên'
    );

    const dateValue = review.updated_at || review.created_at;
    let dateText = '';

    if (dateValue) {
      const date = new Date(dateValue);
      if (!Number.isNaN(date.getTime())) {
        dateText = date.toLocaleDateString('vi-VN');
      }
    }

    addText(identity, 'div', 'ht-review-date', dateText);
    head.appendChild(identity);
    card.appendChild(head);

    const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));

    addText(
      card,
      'div',
      'ht-review-card-stars',
      '★'.repeat(rating) + '☆'.repeat(5 - rating)
    );

    addText(
      card,
      'div',
      'ht-review-card-text',
      review.review_text || ''
    );

    if (review.image_url) {
      const image = document.createElement('img');
      image.className = 'ht-review-photo';
      image.src = review.image_url;
      image.alt = 'Ảnh đính kèm trong đánh giá';
      image.loading = 'lazy';
      image.onerror = () => image.remove();
      card.appendChild(image);
    }

    return card;
  }

  async function loadReviews() {
    const list = document.getElementById('htReviewList');
    if (!list || !db) return;

    const averageEl = document.getElementById('htReviewAverage');
    const starsEl = document.getElementById('htReviewAverageStars');
    const totalEl = document.getElementById('htReviewTotal');

    list.replaceChildren();
    addText(list, 'p', '', 'Đang tải đánh giá...');

    const { data, error } = await db
      .from(TABLE)
      .select(
        'user_id,display_name,avatar_url,rating,review_text,image_url,created_at,updated_at'
      )
      .order('updated_at', { ascending: false });

    list.replaceChildren();

    if (error) {
      console.error('Lỗi tải đánh giá công khai:', error);
      averageEl.textContent = '—';
      starsEl.textContent = '☆☆☆☆☆';
      totalEl.textContent = 'Chưa tải được đánh giá.';
      addText(list, 'p', '', 'Không thể tải đánh giá. Vui lòng thử lại sau.');
      return;
    }

    const reviews = data || [];

    if (!reviews.length) {
      averageEl.textContent = 'Chưa có';
      starsEl.textContent = '☆☆☆☆☆';
      totalEl.textContent = 'Chưa có đánh giá nào';
      addText(list, 'p', '', 'Hãy đăng nhập Google để gửi đánh giá đầu tiên.');
      return;
    }

    const average = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    ) / reviews.length;

    averageEl.textContent = `${average.toFixed(1)} / 5`;

    const rounded = Math.max(0, Math.min(5, Math.round(average)));

    starsEl.textContent =
      '★'.repeat(rounded) + '☆'.repeat(5 - rounded);

    totalEl.textContent =
      `${reviews.length.toLocaleString('vi-VN')} đánh giá công khai`;

    reviews.forEach(review => list.appendChild(renderReviewCard(review)));
  }

  async function handleAuthChange(session) {
    currentUser = session?.user || null;

    if (currentUser) {
      await loadOwnReview();
    } else {
      ownReview = null;
    }

    updateAuthUi();
  }

  // Xóa tham số OAuth khỏi thanh địa chỉ sau khi xử lý.
  function cleanOAuthUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('error');
    url.searchParams.delete('error_code');
    url.searchParams.delete('error_description');

    if (url.hash.startsWith('#access_token=') ||
        url.hash.startsWith('#error=')) {
      url.hash = '';
    }

    window.history.replaceState(
      window.history.state,
      document.title,
      url.pathname + url.search + url.hash
    );
  }

  async function init() {
    try {
      await loadSupabase();

      // Tự xử lý OAuth code để tránh phụ thuộc vào tự động phát hiện URL.
      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: false,
          persistSession: true,
          autoRefreshToken: true
        }
      });

      createReviewSection();

      const params = new URLSearchParams(window.location.search);
      const oauthError =
        params.get('error_description') || params.get('error');

      if (oauthError) {
        cleanOAuthUrl();
        throw new Error(
          'Google trả về lỗi: ' + decodeURIComponent(oauthError)
        );
      }

      const code = params.get('code');

      if (code) {
        const { error } = await db.auth.exchangeCodeForSession(code);

        cleanOAuthUrl();

        if (error) {
          throw new Error(
            'Không đổi được mã Google thành phiên đăng nhập: ' +
            error.message
          );
        }
      }

      const { data, error } = await db.auth.getSession();

      if (error) throw error;

      await handleAuthChange(data.session);
      authReady = true;

      await loadReviews();

      db.auth.onAuthStateChange((event, session) => {
        // Không chạy truy vấn Supabase trực tiếp trong callback xác thực.
        setTimeout(async () => {
          try {
            await handleAuthChange(session);
            await loadReviews();
          } catch (error) {
            console.error('Lỗi cập nhật trạng thái đăng nhập:', error);
          }
        }, 0);
      });

      console.info(
        'Hệ thống đánh giá đã khởi tạo.',
        'Đã đăng nhập:',
        Boolean(data.session?.user)
      );
    } catch (error) {
      console.error('Không khởi tạo được hệ thống đánh giá:', error);

      const section = document.getElementById('htGoogleReviews');

      if (section) {
        const message = document.createElement('p');
        message.style.color = '#b42318';
        message.textContent =
          'Hệ thống đánh giá gặp lỗi: ' +
          (error.message || 'Vui lòng tải lại trang.');

        section.querySelector('.container')?.appendChild(message);
      }

      // Nếu khởi tạo lỗi, vẫn cho phép người dùng thử đăng nhập lại.
      const button = document.getElementById('htGoogleLogin');

      if (button) {
        button.disabled = false;
        button.innerHTML =
          '<span aria-hidden="true">G</span> Đăng nhập bằng Google';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
