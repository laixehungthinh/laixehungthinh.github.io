(function(){
  const endpoint = location.pathname.includes('/thi-a1/') ? '../stats.php' : 'stats.php';
  const ensureWidget = () => {
    let box = document.getElementById('siteStatsWidget');
    if(!box){
      box = document.createElement('div');
      box.id = 'siteStatsWidget';
      box.className = 'site-stats-widget';
      box.innerHTML = `
        <div class="site-stat-view"><span class="site-stat-icon">👁</span><span><b id="visitorCount">0</b><small>lượt truy cập</small></span></div>
        <div class="site-stat-rate"><span id="ratingAverage">Chưa có</span><div id="ratingStars" class="rating-stars" aria-label="Đánh giá 5 sao"><button data-star="1" type="button">★</button><button data-star="2" type="button">★</button><button data-star="3" type="button">★</button><button data-star="4" type="button">★</button><button data-star="5" type="button">★</button></div><small id="ratingCount">Chưa có đánh giá</small></div>`;
      document.body.appendChild(box);
    }
    return box;
  };
  const box=ensureWidget();
  const countEl=box.querySelector('#visitorCount'),avgEl=box.querySelector('#ratingAverage'),starsEl=box.querySelector('#ratingStars'),ratingCountEl=box.querySelector('#ratingCount');
  const render=(views,ratings)=>{
    countEl.textContent=Number(views||0).toLocaleString('vi-VN');
    if(Array.isArray(ratings)&&ratings.length){
      const avg=ratings.reduce((a,b)=>a+Number(b),0)/ratings.length;
      avgEl.textContent=avg.toFixed(1)+' / 5';
      ratingCountEl.textContent=ratings.length+' lượt đánh giá';
    }else{
      avgEl.textContent='Chưa có';
      ratingCountEl.textContent='Hãy là người đầu tiên đánh giá';
    }
    starsEl.querySelectorAll('[data-star]').forEach(s=>{s.onclick=()=>rate(Number(s.dataset.star));});
  };
  async function rate(v){
    try{
      const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rating',rating:v})});
      const d=await r.json();
      render(d.views,d.ratings);
      alert('Cảm ơn bạn đã đánh giá Hưng Thịnh '+v+' sao!');
    }catch(e){ alert('Không thể gửi đánh giá lúc này. Vui lòng thử lại sau.'); }
  }
  fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'view'})})
    .then(r=>r.ok?r.json():Promise.reject())
    .then(d=>render(d.views,d.ratings))
    .catch(()=>{
      countEl.textContent='—';
      avgEl.textContent='—';
      ratingCountEl.textContent='Máy chủ chưa sẵn sàng';
    });
})();
