let client=null, data=null, currentExam=1;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
async function init(){
 if(window.SUPABASE_URL&&window.SUPABASE_ANON_KEY) client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
 $('loginForm').onsubmit=login; $('logout').onclick=logout;
 document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.hidden=true);$(b.dataset.tab).hidden=false});
 $('exportBtn').onclick=exportData; $('importFile').onchange=readImport; $('saveJson').onclick=saveJson;
}
async function login(e){e.preventDefault();$('loginMsg').textContent='';
 if(!client){$('loginMsg').textContent='Chưa cấu hình Supabase. Bạn vẫn có thể xem demo quản trị nếu mở bằng nút demo bên dưới.';return demoLogin();}
 const {error}=await client.auth.signInWithPassword({email:$('email').value,password:$('password').value}); if(error){$('loginMsg').textContent=error.message;return} await enter();
}
function demoLogin(){data=JSON.parse(JSON.stringify(window.EXAM_DATA||{version:'1.0',exams:[]}));enterUI();}
async function enter(){const {data:s}=await client.auth.getSession();if(!s.session)return;await loadData();enterUI();}
async function loadData(){const {data:rows,error}=await client.from('exam_sets').select('id,name,duration_minutes,questions').order('id');if(error){$('loginMsg').textContent=error.message;return}data={version:'1.0',examCount:rows.length,exams:rows.map(r=>({id:r.id,name:r.name,durationMinutes:r.duration_minutes,questions:r.questions||[]}))};}
function enterUI(){$('login').hidden=true;$('app').hidden=false;populate();}
function populate(){const s=$('examSelect');s.innerHTML=data.exams.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('');s.value=currentExam;s.onchange=()=>{currentExam=+s.value;renderEditor()};renderEditor();}
function renderEditor(){const ex=data.exams.find(e=>e.id===currentExam);$('editor').innerHTML=`<div class="q"><label>Tên đề<input id="examName" value="${esc(ex.name)}"></label><label>Thời gian (phút)<input id="examTime" type="number" value="${ex.durationMinutes||19}"></label></div>`+ex.questions.map((q,i)=>renderQ(q,i)).join('')+`<div class="actions"><button onclick="addQ()">+ Thêm câu</button></div><div class="savebar"><span>${ex.questions.length} câu</span><button onclick="saveExam()">💾 Lưu đề này</button></div>`;}
function renderQ(q,i){return `<article class="q"><div class="qhead"><h3>Câu ${i+1}</h3><button class="danger" onclick="delQ(${i})">Xóa</button></div><label>Nội dung<textarea id="q_${i}">${esc(q.q)}</textarea></label><div class="opts">${(q.options||[]).map((o,j)=>`<div class="optrow"><b>${j+1}.</b><input id="o_${i}_${j}" value="${esc(o)}"><input title="Đáp án đúng" type="radio" name="ans_${i}" ${q.answer===j+1?'checked':''} value="${j+1}"></div>`).join('')}</div><label>Ảnh (đường dẫn tương đối hoặc URL)<input id="img_${i}" value="${esc(q.image||'')}"></label><label><input id="critical_${i}" type="checkbox" ${q.critical?'checked':''}> Câu điểm liệt</label></article>`;}
function collectExam(){const ex=data.exams.find(e=>e.id===currentExam);ex.name=$('examName').value;ex.durationMinutes=+$('examTime').value||19;ex.questions.forEach((q,i)=>{q.q=$(`q_${i}`).value;q.options=(q.options||[]).map((_,j)=>$(`o_${i}_${j}`)?.value??'');const r=document.querySelector(`input[name="ans_${i}"]:checked`);q.answer=r?+r.value:1;q.image=$(`img_${i}`).value.trim()||null;q.critical=$(`critical_${i}`).checked;q.n=i+1;});}
async function saveExam(){collectExam();const ex=data.exams.find(e=>e.id===currentExam);if(client){const {error}=await client.from('exam_sets').upsert({id:ex.id,name:ex.name,duration_minutes:ex.durationMinutes,questions:ex.questions},{onConflict:'id'});if(error){alert(error.message);return}}else localStorage.setItem('demo_exam_data',JSON.stringify(data));alert('Đã lưu đề '+ex.name);}
function addQ(){collectExam();const ex=data.exams.find(e=>e.id===currentExam);ex.questions.push({n:ex.questions.length+1,q:'',options:['',''],image:null,critical:false,answer:1});renderEditor();}
function delQ(i){if(!confirm('Xóa câu này?'))return;collectExam();data.exams.find(e=>e.id===currentExam).questions.splice(i,1);data.exams.find(e=>e.id===currentExam).questions.forEach((q,k)=>q.n=k+1);renderEditor();}
function exportData(){collectExam();$('jsonBox').value=JSON.stringify(data,null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([$('jsonBox').value],{type:'application/json'}));a.download='laixehungthich-question-bank.json';a.click();}
function readImport(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('jsonBox').value=r.result};r.readAsText(f);}
async function saveJson(){try{const d=JSON.parse($('jsonBox').value);if(!Array.isArray(d.exams))throw Error('Thiếu danh sách exams');data=d;for(const ex of data.exams){if(client)await client.from('exam_sets').upsert({id:ex.id,name:ex.name,duration_minutes:ex.durationMinutes||19,questions:ex.questions||[]},{onConflict:'id'});}currentExam=data.exams[0]?.id||1;populate();$('importMsg').textContent='Đã nạp dữ liệu.';}catch(e){$('importMsg').textContent='JSON không hợp lệ: '+e.message;}}
async function logout(){if(client)await client.auth.signOut();location.reload();}
window.addEventListener('DOMContentLoaded',init);
