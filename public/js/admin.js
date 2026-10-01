const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
async function api(url, options={}) { const res=await fetch(url,{credentials:'same-origin',...options}); const data=await res.json().catch(()=>({})); if(!res.ok) throw new Error(data.message||'Request failed'); return data; }
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
let editingProduct=null, editingBlog=null;

function showTab(name){ $$('.admin-section').forEach(x=>x.classList.toggle('active',x.dataset.section===name)); $$('.side-link').forEach(x=>x.classList.toggle('active',x.dataset.tab===name)); }
function productRow(p){return `<tr><td>${esc(p.title)}</td><td>${esc(p.category||'—')}</td><td>${p.published?'Published':'Draft'}</td><td>${new Date(p.createdAt).toLocaleDateString()}</td><td><button class="table-btn edit-product" data-id="${p._id}">Edit</button><button class="table-btn danger delete-product" data-id="${p._id}">Delete</button></td></tr>`;}
function blogRow(p){return `<tr><td>${esc(p.title)}</td><td>${esc(p.author)}</td><td>${p.published?'Published':'Draft'}</td><td>${new Date(p.publicationDate).toLocaleDateString()}</td><td><button class="table-btn edit-blog" data-id="${p._id}">Edit</button><button class="table-btn danger delete-blog" data-id="${p._id}">Delete</button></td></tr>`;}
async function loadAll(){
  const [e,p,b]=await Promise.all([api('/api/admin/enquiries'),api('/api/admin/products'),api('/api/admin/blogs')]);
  $('#enquiryCount').textContent=e.enquiries.length; $('#productCount').textContent=p.products.length; $('#blogCount').textContent=b.posts.length;
  $('#enquiriesTable').innerHTML=e.enquiries.map(x=>`<tr><td>${new Date(x.createdAt).toLocaleString()}</td><td>${esc(x.name)}</td><td>${esc(x.email)}</td><td>${esc(x.phone||'—')}</td><td>${esc(x.subject)}</td><td class="message-cell">${esc(x.message)}</td><td><button class="table-btn danger delete-enquiry" data-id="${x._id}">Delete</button></td></tr>`).join('')||'<tr><td colspan="7">No enquiries yet.</td></tr>';
  $('#productsTable').innerHTML=p.products.map(productRow).join('')||'<tr><td colspan="5">No products yet.</td></tr>'; $('#blogsTable').innerHTML=b.posts.map(blogRow).join('')||'<tr><td colspan="5">No blog posts yet.</td></tr>';
  window.__products=p.products; window.__blogs=b.posts;
}
function openModal(id){$(id).classList.add('open');}
function closeModal(id){$(id).classList.remove('open');}
function fillProduct(p){editingProduct=p; $('#productModalTitle').textContent='Edit Product'; const f=$('#productForm'); for(const key of ['title','description','demoUrl','imageUrl','videoUrl','category','price']) if(f.elements[key]) f.elements[key].value=p[key]||''; f.elements.published.checked=!!p.published; openModal('#productModal');}
function fillBlog(p){editingBlog=p; $('#blogModalTitle').textContent='Edit Article'; const f=$('#blogForm'); for(const key of ['title','slug','content','author']) if(f.elements[key]) f.elements[key].value=p[key]||''; f.elements.publicationDate.value=new Date(p.publicationDate).toISOString().slice(0,10); f.elements.published.checked=!!p.published; openModal('#blogModal');}
function resetProduct(){editingProduct=null; $('#productModalTitle').textContent='New Product'; $('#productForm').reset();}
function resetBlog(){editingBlog=null; $('#blogModalTitle').textContent='New Article'; $('#blogForm').reset(); $('#blogForm').elements.publicationDate.value=new Date().toISOString().slice(0,10);}

document.addEventListener('DOMContentLoaded',async()=>{
  try { await api('/api/admin/me'); } catch { location.href='/admin/login'; return; }
  $$('.side-link').forEach(x=>x.onclick=()=>showTab(x.dataset.tab)); $$('[data-tab-action]').forEach(x=>x.onclick=()=>showTab(x.dataset.tabAction));
  $('#newProduct').onclick=()=>{resetProduct();openModal('#productModal')}; $('#newBlog').onclick=()=>{resetBlog();openModal('#blogModal')};
  $$('.modal-close').forEach(x=>x.onclick=()=>closeModal(x.dataset.close));
  $('#logout').onclick=async()=>{await api('/api/admin/logout',{method:'POST'});location.href='/admin/login';};
  await loadAll();
  $('#enquiriesTable').onclick=async e=>{if(e.target.matches('.delete-enquiry')&&confirm('Delete this enquiry?')){await api('/api/admin/enquiries/'+e.target.dataset.id,{method:'DELETE'});await loadAll();}};
  $('#productsTable').onclick=async e=>{const p=window.__products.find(x=>x._id===e.target.dataset.id); if(e.target.matches('.edit-product'))fillProduct(p); if(e.target.matches('.delete-product')&&confirm('Delete this product?')){await api('/api/admin/products/'+p._id,{method:'DELETE'});await loadAll();}};
  $('#blogsTable').onclick=async e=>{const p=window.__blogs.find(x=>x._id===e.target.dataset.id); if(e.target.matches('.edit-blog'))fillBlog(p); if(e.target.matches('.delete-blog')&&confirm('Delete this article?')){await api('/api/admin/blogs/'+p._id,{method:'DELETE'});await loadAll();}};
  $('#productForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);fd.set('published',e.target.published.checked);const url=editingProduct?'/api/admin/products/'+editingProduct._id:'/api/admin/products';await api(url,{method:editingProduct?'PUT':'POST',body:fd});closeModal('#productModal');await loadAll();};
  $('#blogForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);fd.set('published',e.target.published.checked);const url=editingBlog?'/api/admin/blogs/'+editingBlog._id:'/api/admin/blogs';await api(url,{method:editingBlog?'PUT':'POST',body:fd});closeModal('#blogModal');await loadAll();};
});
