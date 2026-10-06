(()=>{
  const root=document.getElementById('app');
  const state={screen:'home',exam:null,mode:'A1',idx:0,answers:[],time:0,timer:null,submitted:false,reviewDetails:null,reviewBank:[],reviewIdx:0,reviewAnswers:{},candidate:{name:'',dob:'',idno:'',address:'',sbd:''}};
  const A=n=>String(n);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function home(){
    clearInterval(state.timer); state.screen='home';
    root.innerHTML=`<div class="top"><div><div class="brand">TRUNG TÂM ĐÀO TẠO LÁI XE HƯNG THỊNH</div><div class="sub">Hệ thống học và thi thử lý thuyết A1 / A</div></div></div>
    <div class="wrap"><div class="home"><h1>ÔN THI GIẤY PHÉP LÁI XE A1 / A</h1><p>Ngân hàng câu hỏi Hưng Thịnh • 10 bộ đề</p>
      <div class="cards">
        <div class="card"><h2>📚 Ôn tập</h2><p>Chọn đáp án và hệ thống báo <b>ĐÚNG / SAI ngay lập tức</b>, đồng thời chỉ ra đáp án đúng.</p><button class="btn primary" onclick="reviewBank()">Bắt đầu ôn tập</button></div>
        <div class="card"><h2>📝 Thi thử</h2><p>Mô phỏng bài thi: 19 phút, chuyển câu bằng bảng số câu, nút trước/sau và phím ← →.</p><button class="btn orange" onclick="chooseExam()">Chọn bộ đề thi</button></div>
      </div>
    </div></div>`;
  }

  function chooseExam(){
    clearInterval(state.timer);
    const saved=JSON.parse(localStorage.getItem('hungthinh_candidate')||'{}');
    state.candidate={name:saved.name||'',dob:saved.dob||'',idno:saved.idno||'',address:saved.address||'',sbd:saved.sbd||''};
    root.innerHTML=`
    <div class="candidate-page">
      <div class="candidate-window">
        <div class="candidate-window-title">THI SÁT HẠCH LÝ THUYẾT 250 CÂU</div>
        <div class="candidate-window-body">
          <div class="candidate-left">
            <div class="field-row"><div class="field-label">Đơn vị:</div><select id="cUnit" class="field-control"><option>CƠ SỞ ĐÀO TẠO SÁT HẠCH LÁI XE</option><option>TRUNG TÂM ĐÀO TẠO LÁI XE HƯNG THỊNH</option></select></div>
            <div class="field-row"><div class="field-label">Khóa:</div><select id="cCourse" class="field-control"><option>TỰ LUYỆN LÝ THUYẾT</option><option>TỰ LUYỆN SÁT HẠCH LÝ THUYẾT</option></select></div>
            <div class="field-row"><div class="field-label">Số báo danh:</div><input id="cSbd" class="field-control short" maxlength="10" value="${esc(state.candidate.sbd)}" placeholder="9"></div>
            <div class="field-row"><div class="field-label">Hạng GPLX:</div><select id="cMode" class="field-control short"><option value="A1">Hạng A1</option><option value="A">Hạng A</option></select><span class="field-hint">Lựa chọn Hạng GPLX</span></div>
            <div class="field-row"><div class="field-label">Bộ đề:</div><select id="cExam" class="field-control short">${EXAM_DATA.exams.map(e=>`<option value="${e.id}">Đề ${e.id}</option>`).join('')}</select><span class="field-hint">Chọn 1 trong 10 bộ đề</span></div>
            <div class="candidate-check"><button class="check-btn" onclick="updateCandidatePreview()">Kiểm tra<br>thông tin thí sinh</button></div>
          </div>
          <div class="candidate-right">
            <div class="candidate-photo"><div class="photo-silhouette">👤</div></div>
            <div class="candidate-info">
              <div><span>Loại GPLX:</span><b id="previewMode">HẠNG A1</b></div>
              <div><span>Họ tên:</span><input id="cName" value="${esc(state.candidate.name)}" placeholder="THÍ SINH SỐ 9"></div>
              <div><span>Ngày sinh:</span><input id="cDob" value="${esc(state.candidate.dob)}" placeholder="08/08/1999"></div>
              <div><span>Số CMT:</span><input id="cId" value="${esc(state.candidate.idno)}" placeholder="Nhập số CCCD"></div>
              <div><span>Địa chỉ:</span><input id="cAddress" value="${esc(state.candidate.address||'VIỆT NAM')}" placeholder="VIỆT NAM"></div>
            </div>
          </div>
        </div>
        <div class="candidate-footer">
          <div class="candidate-brand-note"><b>THI SÁT HẠCH LÝ THUYẾT 250 CÂU</b><br><span>10 bộ đề • 25 câu/bộ • 19 phút</span></div>
          <div class="candidate-buttons">
            <button class="sample-btn enter" onclick="enterSelectedExam()">Vào tập luyện</button>
            <button class="sample-btn review-btn" onclick="showLastExamReview()">Xem lại bài thi</button>
            <button class="sample-btn cancel" onclick="home()">Hủy bỏ</button>
          </div>
        </div>
      </div>
    </div>`;
    const modeEl=document.getElementById('cMode'); if(modeEl) modeEl.value=state.mode||'A1';
    const examEl=document.getElementById('cExam'); if(examEl) examEl.value=String(window._selectedExamId||1);
    updateCandidatePreview();
    ['cName','cDob','cId','cAddress','cSbd','cMode','cExam'].forEach(id=>document.getElementById(id)?.addEventListener('input',updateCandidatePreview));
    ['cDob','cMode','cExam'].forEach(id=>document.getElementById(id)?.addEventListener('change',updateCandidatePreview));
  }

  function updateCandidatePreview(){
    const name=document.getElementById('cName')?.value.trim()||state.candidate.name||'THÍ SINH';
    const sbd=document.getElementById('cSbd')?.value.trim()||'—';
    const mode=document.getElementById('cMode')?.value||'A1';
    const dob=document.getElementById('cDob')?.value||state.candidate.dob||'';
    const idno=document.getElementById('cId')?.value.trim()||state.candidate.idno||'';
    const address=document.getElementById('cAddress')?.value.trim()||state.candidate.address||'VIỆT NAM';
    const n=document.getElementById('previewName'),s=document.getElementById('previewSbd'),m=document.getElementById('previewMode'),d=document.getElementById('previewDob'),i=document.getElementById('previewId'),a=document.getElementById('previewAddress');
    if(n)n.textContent=name;if(s)s.textContent=sbd;if(m)m.textContent='HẠNG '+mode;if(d)d.textContent=dob;if(i)i.textContent=idno;if(a)a.textContent=address;
  }

  function selectExam(id){
    window._selectedExamId=id;
    document.querySelectorAll('.exam-choice').forEach(el=>el.classList.remove('selected'));
    document.getElementById('examChoice'+id)?.classList.add('selected');
  }

  function enterSelectedExam(){
    let name=document.getElementById('cName')?.value.trim()||state.candidate.name||'';
    if(!name){name=prompt('Nhập Họ và tên thí sinh:','')?.trim()||'';}
    if(!name){alert('Vui lòng nhập Họ và tên thí sinh.');return;}
    const dob=document.getElementById('cDob')?.value||state.candidate.dob||prompt('Nhập ngày sinh (DD/MM/YYYY):','')||'';
    const idno=document.getElementById('cId')?.value.trim()||state.candidate.idno||prompt('Nhập số CCCD:','')||'';
    const address=document.getElementById('cAddress')?.value.trim()||state.candidate.address||'VIỆT NAM';
    const sbd=document.getElementById('cSbd')?.value.trim()||'';
    state.candidate={name,dob,idno,address,sbd};
    state.mode=document.getElementById('cMode')?.value||'A1';
    window._selectedExamId=Number(document.getElementById('cExam')?.value||window._selectedExamId||1);
    localStorage.setItem('hungthinh_candidate',JSON.stringify(state.candidate));
    startExam(window._selectedExamId,state.mode);
  }

  function showLastExamReview(){
    if(state.reviewDetails){renderReview();return;}
    const saved=localStorage.getItem('hungthinh_last_exam_review');
    if(saved){try{state.reviewDetails=JSON.parse(saved);renderReview();return;}catch(e){}}
    alert('Chưa có bài thi nào để xem lại. Sau khi hoàn thành một bài thi, bạn có thể quay lại đây để xem lại.');
  }

  function startExam(id,mode='A1'){
    const e=EXAM_DATA.exams.find(x=>x.id===id); if(!e)return;
    clearInterval(state.timer);
    state.screen='exam'; state.exam=e; state.mode=mode; state.idx=0; state.answers=Array(e.questions.length).fill(null); state.time=19*60; state.submitted=false; state.reviewDetails=null;
    renderExam();
    state.timer=setInterval(()=>{state.time--;updateTimer();if(state.time<=0){clearInterval(state.timer);submitExam(true)}},1000);
  }

  function updateTimer(){const el=document.getElementById('timer');if(!el)return;const m=Math.floor(state.time/60),s=state.time%60;el.textContent=`${m}:${String(s).padStart(2,'0')}`;}

  function renderExam(){
    const e=state.exam,q=e.questions[state.idx];
    root.innerHTML=`<div class="top"><div><div class="brand">${esc(e.name)} • THI SÁT HẠCH ${state.mode}</div><div class="sub">${esc(state.candidate.name||'THÍ SINH')} • SBD: ${esc(state.candidate.sbd||'—')} • ${state.idx+1}/${e.questions.length} câu</div></div><div class="timer" id="timer">19:00</div></div>
    <div class="wrap"><div class="exam"><div class="panel"><div class="qhead">Câu ${q.n}${q.critical?' • CÂU ĐIỂM LIỆT':''}</div><div class="qbody"><div class="qtext ${q.critical?'critical':''}">${esc(q.q)}</div>${q.image?`<img class="qimage" src="${q.image}" alt="Hình minh họa câu ${q.n}">`:''}
    <div>${q.options.map((o,i)=>`<label class="option ${state.answers[state.idx]===i+1?'selected':''}"><input type="radio" name="answer" ${state.answers[state.idx]===i+1?'checked':''} onchange="choose(${i+1})"><span><b>${A(i+1)}.</b> ${esc(o)}</span></label>`).join('')}</div></div>
    <div class="nav"><div><div class="actions"><button class="btn ghost" onclick="prevQ()">← Câu trước</button><button class="btn primary" onclick="nextQ()">Câu tiếp →</button></div><div class="keyhint">Bàn phím: <b>1 2 3 4</b> để chọn đáp án • <b>← →</b> để chuyển câu</div></div><button class="btn danger" onclick="confirmSubmit()">KẾT THÚC</button></div></div>
    <div class="panel"><div class="gridhead">DANH SÁCH CÂU HỎI</div><div class="grid">${e.questions.map((qq,i)=>`<button class="num ${i===state.idx?'current':''} ${state.answers[i]?'answered':''}" onclick="goQ(${i})">${qq.n}</button>`).join('')}</div><div class="legend">Ô màu xanh: đã trả lời • Viền xanh: câu đang làm</div><div style="padding:12px;border-top:1px solid #d5e0e6"><b>Đã trả lời:</b> ${state.answers.filter(Boolean).length}/${e.questions.length}</div></div></div></div>`;
    updateTimer();
  }

  function choose(v){state.answers[state.idx]=v;renderExam();}
  function goQ(i){state.idx=i;renderExam();}
  function prevQ(){if(state.idx>0){state.idx--;renderExam();}}
  function nextQ(){if(state.idx<state.exam.questions.length-1){state.idx++;renderExam();}}
  function confirmSubmit(){if(confirm('Bạn có chắc chắn muốn kết thúc bài thi?'))submitExam(false);}

  function submitExam(auto){
    clearInterval(state.timer); state.submitted=true;
    let total=0,criticalWrong=false;
    const details=state.exam.questions.map((q,i)=>{const ok=state.answers[i]===q.answer;if(ok)total++;if(q.critical&&!ok)criticalWrong=true;return {...q,user:state.answers[i],ok};});
    state.reviewDetails=details;
    localStorage.setItem('hungthinh_last_exam_review',JSON.stringify(details));
    const pass=total>=(state.mode==='A'?23:21)&&!criticalWrong;
    root.innerHTML=`<div class="top"><div class="brand">HƯNG THỊNH • KẾT QUẢ</div></div><div class="wrap"><div class="result"><h1>${esc(state.exam.name)} • Hạng ${state.mode}</h1><div class="score">${total}/${details.length}</div><div class="pass ${pass?'':'fail'}">${pass?'ĐẠT':'KHÔNG ĐẠT'}</div><p>${criticalWrong?'Bạn trả lời sai câu điểm liệt. ':''}${auto?'Bài thi đã tự động nộp khi hết thời gian.':''}</p>
      <div class="result-actions"><button class="btn orange" onclick="startExam(${state.exam.id},'${state.mode}')">Thi lại</button><button class="btn primary" onclick="showReview()">Xem lại bài đã làm</button><button class="btn ghost" onclick="chooseExam()">Chọn đề khác</button></div>
    </div></div>`;
  }

  function showReview(){
    const details=state.reviewDetails||[];
    root.innerHTML=`<div class="top"><div class="brand">HƯNG THỊNH • XEM LẠI BÀI ĐÃ LÀM</div><button class="btn ghost" onclick="chooseExam()">Chọn đề khác</button></div>
    <div class="wrap"><div class="result review-page"><h1>${esc(state.exam?.name||'Bài thi')} • Hạng ${state.mode}</h1><div class="review-summary">Đúng <b>${details.filter(x=>x.ok).length}</b> / ${details.length} câu • Kiểm tra lại toàn bộ câu đã làm bên dưới</div>
    <div class="review">${details.map((q,i)=>`<div class="review-item ${q.ok?'review-correct':'review-wrong'}"><div class="review-title"><b>Câu ${q.n}</b> <span class="${q.ok?'correct':'wrongtxt'}">${q.ok?'✓ ĐÚNG':'✗ SAI'}</span>${q.critical?' <span class="critical-tag">ĐIỂM LIỆT</span>':''}</div><div class="review-question">${esc(q.q)}</div>${q.image?`<img class="qimage review-image" src="${q.image}" alt="Hình minh họa câu ${q.n}">`:''}<div class="review-answers">Bạn chọn: <b>${q.user?A(q.user):'Chưa chọn'}</b> &nbsp;•&nbsp; Đáp án đúng: <b>${A(q.answer)}</b></div><div class="review-options">${q.options.map((o,j)=>`<div class="review-option ${j+1===q.answer?'answer-correct':''} ${j+1===q.user&&!q.ok?'answer-wrong':''}"><b>${A(j+1)}.</b> ${esc(o)} ${j+1===q.answer?' ✓ Đáp án đúng':''} ${j+1===q.user&&!q.ok?' ✗ Bạn chọn':''}</div>`).join('')}</div></div>`).join('')}</div>
    <div class="result-actions"><button class="btn orange" onclick="startExam(${state.exam.id},'${state.mode}')">Thi lại</button><button class="btn ghost" onclick="chooseExam()">Chọn đề khác</button></div></div></div>`;
  }

  function reviewBank(){
    state.screen='review';
    state.reviewBank=EXAM_DATA.exams.flatMap(e=>e.questions.map(q=>({...q,exam:e.id})));
    state.reviewIdx=0; state.reviewAnswers={};
    renderReviewBank();
  }

  function answerReview(v){
    state.reviewAnswers[state.reviewIdx]=v;
    renderReviewBank();
  }

  function renderReviewBank(){
    const qs=state.reviewBank,q=qs[state.reviewIdx],chosen=state.reviewAnswers[state.reviewIdx];
    const answered=chosen!=null,correct=chosen===q.answer;
    root.innerHTML=`<div class="top"><div><div class="brand">HƯNG THỊNH • ÔN TẬP</div><div class="sub">Đề ${q.exam} • Câu ${q.n} • ${state.reviewIdx+1}/${qs.length}</div></div><button class="btn ghost" onclick="home()">Trang chủ</button></div>
    <div class="wrap"><div class="panel"><div class="qhead">Đề ${q.exam} • Câu ${q.n}${q.critical?' • CÂU ĐIỂM LIỆT':''}</div><div class="qbody"><div class="qtext ${q.critical?'critical':''}">${esc(q.q)}</div>${q.image?`<img class="qimage" src="${q.image}" alt="Hình minh họa câu ${q.n}">`:''}
    <div class="review-quiz-options">${q.options.map((o,i)=>`<button class="review-quiz-option ${answered&&i+1===chosen?(correct?'picked-correct':'picked-wrong'):''} ${answered&&i+1===q.answer?'answer-correct':''}" onclick="answerReview(${i+1})"><b>${A(i+1)}.</b> ${esc(o)}</button>`).join('')}</div>
    ${answered?`<div class="feedback ${correct?'feedback-correct':'feedback-wrong'}"><b>${correct?'✓ CHÍNH XÁC':'✗ CHƯA ĐÚNG'}</b><br>${correct?'Bạn đã chọn đúng đáp án.':`Bạn chọn ${A(chosen)}. Đáp án đúng là ${A(q.answer)}.`}</div>`:''}
    </div><div class="nav"><button class="btn ghost" onclick="reviewPrev()">← Câu trước</button><button class="btn primary" onclick="reviewNext()">${state.reviewIdx<qs.length-1?'Câu tiếp →':'Hoàn thành ôn tập'}</button></div></div></div>`;
  }
  function reviewPrev(){if(state.reviewIdx>0){state.reviewIdx--;renderReviewBank();}}
  function reviewNext(){if(state.reviewIdx<state.reviewBank.length-1){state.reviewIdx++;renderReviewBank();}else home();}

  window.home=home;window.chooseExam=chooseExam;window.selectExam=selectExam;window.enterSelectedExam=enterSelectedExam;window.startExam=startExam;window.choose=choose;window.goQ=goQ;window.prevQ=prevQ;window.nextQ=nextQ;window.confirmSubmit=confirmSubmit;window.submitExam=submitExam;window.showReview=showReview;window.reviewBank=reviewBank;window.answerReview=answerReview;window.reviewPrev=reviewPrev;window.reviewNext=reviewNext;
  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft' || e.key==='ArrowRight'){
      if(state.screen==='exam'&&!state.submitted){e.preventDefault();e.key==='ArrowLeft'?prevQ():nextQ();}
      else if(state.screen==='review'){e.preventDefault();e.key==='ArrowLeft'?reviewPrev():reviewNext();}
      return;
    }
    const keyMap={'1':1,'2':2,'3':3,'4':4,'Numpad1':1,'Numpad2':2,'Numpad3':3,'Numpad4':4};
    const v=keyMap[e.key]||keyMap[e.code];
    if(!v)return;
    if(state.screen==='exam'&&!state.submitted){
      if(v<=state.exam.questions[state.idx].options.length){e.preventDefault();choose(v);}
    }else if(state.screen==='review'){
      const q=state.reviewBank[state.reviewIdx];
      if(q && v<=q.options.length){e.preventDefault();answerReview(v);}
    }
  });
  async function boot(){
    try{
      if(window.SUPABASE_URL&&window.SUPABASE_ANON_KEY){
        const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
        const {data:rows,error}=await sb.from('exam_sets').select('id,name,duration_minutes,questions').order('id');
        if(!error&&rows&&rows.length){window.EXAM_DATA={version:'supabase',examCount:rows.length,exams:rows.map(r=>({id:r.id,name:r.name,durationMinutes:r.duration_minutes,questions:r.questions||[]}))};}
      }
    }catch(e){console.warn('Không tải được dữ liệu online, dùng dữ liệu cục bộ.',e);}
    home();
  }
  boot();
})();
