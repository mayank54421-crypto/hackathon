(() => {
  const seedReports = [
    {id:'seed-1',category:'Pothole',location:'14 Lakeview Road, Green Park',ward:'Ward 12',leader:'Arjun Mehta',description:'A deep pothole near the bus stop is forcing cyclists into traffic.',status:'In progress',date:'Today',icon:'◉',tone:'road'},
    {id:'seed-2',category:'Streetlight',location:'Corner of Maple St & 3rd Ave',ward:'Ward 8',leader:'Neha Kapoor',description:'The streetlight has been out for over a week. This stretch gets very dark.',status:'Reported',date:'Yesterday',icon:'☼',tone:'light'},
    {id:'seed-3',category:'Waste',location:'Riverside Walk, North entrance',ward:'Ward 5',leader:'Vikram Rao',description:'Overflowing bins are attracting stray animals near the walking path.',status:'Resolved',date:'2 days ago',icon:'♻',tone:'waste'},
    {id:'seed-4',category:'Sidewalk',location:'22 Market Street, Old Town',ward:'Ward 12',leader:'Arjun Mehta',description:'Several cracked paving slabs are a trip hazard outside the shops.',status:'In progress',date:'3 days ago',icon:'▤',tone:'walk'}
  ];
  const grid = document.querySelector('#report-grid');
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let reports = loadReports();
  function loadReports() {
    try { const saved = JSON.parse(localStorage.getItem('fixora-reports') || localStorage.getItem('civicly-reports')); return Array.isArray(saved) ? [...saved, ...seedReports] : seedReports; }
    catch { return seedReports; }
  }
  function render() {
    const query = document.querySelector('#search').value.trim().toLowerCase();
    const category = document.querySelector('#category-filter').value;
    const status = document.querySelector('#status-filter').value;
    const filtered = reports.filter(r => (category === 'all' || r.category === category) && (status === 'all' || r.status === status) && [r.category,r.location,r.ward,r.description,r.leader].join(' ').toLowerCase().includes(query));
    document.querySelector('#results-count').textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'report' : 'reports'}`;
    document.querySelector('#empty-state').classList.toggle('hidden', filtered.length > 0);
    grid.innerHTML = filtered.map(r => `<article class="report-card"><div class="report-image">${r.photo ? `<img src="${r.photo}" alt="Community report: ${escapeHtml(r.category)}">` : `<div class="fallback tone-${escapeHtml(r.tone || 'other')}"><span>${escapeHtml(r.icon || '⌂')}</span></div>`}<span class="status-pill ${r.status === 'Resolved' ? 'resolved' : r.status === 'In progress' ? 'in-progress' : ''}">${escapeHtml(r.status)}</span></div><div class="report-content"><span class="report-category">${escapeHtml(r.category)}</span><h3>${escapeHtml(r.category === 'Pothole' ? 'Road needs attention' : r.category === 'Streetlight' ? 'Streetlight out' : r.category === 'Waste' ? 'Waste collection needed' : r.category === 'Park & trees' ? 'Park needs care' : r.category === 'Sidewalk' ? 'Uneven sidewalk' : 'Public space issue')}</h3><div class="report-location">⌖ &nbsp;${escapeHtml(r.location)}</div><p class="report-description">${escapeHtml(r.description)}</p><div class="report-meta"><span class="ward">${escapeHtml(r.ward)}</span><span>${escapeHtml(r.date)}</span></div></div></article>`).join('');
  }
  document.querySelectorAll('.report-open').forEach(button => button.addEventListener('click', () => document.querySelector('#report-dialog').showModal()));
  document.querySelector('.close-modal').addEventListener('click', () => document.querySelector('#report-dialog').close());
  document.querySelector('#report-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
  ['#search','#category-filter','#status-filter'].forEach(selector => document.querySelector(selector).addEventListener('input', render));
  document.querySelector('#reset-filters').addEventListener('click', () => { document.querySelector('#search').value=''; document.querySelector('#category-filter').value='all'; document.querySelector('#status-filter').value='all'; render(); });
  document.querySelector('#report-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('photo');
    const error = document.querySelector('#form-error'); error.textContent = '';
    if (file && file.size > 2 * 1024 * 1024) { error.textContent = 'Please choose a photo smaller than 2 MB.'; return; }
    let photo = '';
    if (file && file.size) { try { photo = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(file); }); } catch { error.textContent = 'We could not read that photo. Try another one.'; return; } }
    const report = {id:`local-${Date.now()}`,category:data.get('category'),location:data.get('location').trim(),ward:data.get('ward'),leader:data.get('leader').trim() || 'Municipal ward team',description:data.get('description').trim(),status:'Reported',date:'Just now',photo,icon:({Pothole:'◉',Streetlight:'☼',Waste:'♻','Park & trees':'♧',Sidewalk:'▤',Other:'⌂'})[data.get('category')] || '⌂'};
    reports.unshift(report);
    try { localStorage.setItem('fixora-reports', JSON.stringify(reports.filter(r => !String(r.id).startsWith('seed-')))); }
    catch { reports = reports.filter(r => r.id !== report.id); error.textContent = 'Your browser storage is full. Try removing the photo and posting again.'; return; }
    render(); form.reset(); document.querySelector('#report-dialog').close(); document.querySelector('#reports').scrollIntoView({behavior:'smooth'}); showToast('Your anonymous report is now on the community board.');
  });
  let toastTimer;
  function showToast(message) { const toast=document.querySelector('#toast'); toast.textContent=message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),3600); }
  render();
})();
