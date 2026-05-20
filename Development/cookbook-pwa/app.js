/* ═══════════════════════════════════════════
   My Cookbook PWA — app.js
   ═══════════════════════════════════════════ */

const RKEY = 'cookbook_recipes_v3';
const PKEY = 'cookbook_plan_v3';
const GKEY = 'cookbook_grocery_v3';
const AKEY = 'cookbook_apikey_v1';
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MEALS = ['Breakfast','Lunch','Dinner','Snack'];

let recipes  = [];
let plan     = {};
let grocery  = [];
let apiKey   = '';
let checkedIng = {};

/* ── Boot ── */
function boot() {
  try { recipes = JSON.parse(localStorage.getItem(RKEY) || '[]'); } catch(e) { recipes = []; }
  try { plan    = JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch(e) { plan = {}; }
  try { grocery = JSON.parse(localStorage.getItem(GKEY) || '[]'); } catch(e) { grocery = []; }
  apiKey = localStorage.getItem(AKEY) || '';
  if (apiKey) {
    document.getElementById('api-key-input').value = '••••••••••••••••';
  }
  updateCounts();
  renderGrid();
  renderPlanner();
  renderGrocery();
}

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) { showToast('Storage full — try removing old recipes.'); }
}

/* ── API Key ── */
function saveApiKey() {
  const val = document.getElementById('api-key-input').value.trim();
  if (!val || val.startsWith('•')) { showToast('Enter a valid API key'); return; }
  apiKey = val;
  localStorage.setItem(AKEY, apiKey);
  document.getElementById('api-key-input').value = '••••••••••••••••';
  showToast('API key saved ✓');
}

/* ── Navigation ── */
function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  document.querySelector(`.nav-item[data-view="${v}"]`).classList.add('active');
  if (v === 'cookbook') renderGrid();
  if (v === 'planner')  renderPlanner();
  if (v === 'grocery')  renderGrocery();
}

/* ── Counts & Header ── */
function updateCounts() {
  const cntCookbook = document.getElementById('cnt-cookbook');
  cntCookbook.textContent = recipes.length;
  cntCookbook.style.display = recipes.length > 0 ? 'flex' : 'none';

  const unchecked = grocery.filter(g => !g.checked).length;
  const cntGrocery = document.getElementById('cnt-grocery');
  cntGrocery.textContent = unchecked;
  cntGrocery.style.display = unchecked > 0 ? 'flex' : 'none';

  document.getElementById('header-sub').textContent =
    recipes.length === 0 ? 'Your personal cookbook'
    : recipes.length === 1 ? '1 recipe saved'
    : `${recipes.length} recipes saved`;
}

/* ══════════════════════════════════════
   COOKBOOK
══════════════════════════════════════ */
function renderGrid() {
  const q = (document.getElementById('search-input').value || '').toLowerCase();
  const grid = document.getElementById('recipe-grid');
  const filtered = q ? recipes.filter(r =>
    r.title.toLowerCase().includes(q) ||
    (r.tags || []).some(t => t.toLowerCase().includes(q)) ||
    (r.ingredients || []).some(i => i.toLowerCase().includes(q))
  ) : recipes;

  document.getElementById('empty-cookbook').style.display = (!q && recipes.length === 0) ? 'block' : 'none';
  document.getElementById('empty-search').style.display = (q && filtered.length === 0) ? 'block' : 'none';

  grid.innerHTML = filtered.map(r => {
    const idx = recipes.indexOf(r);
    return `
    <div class="recipe-card" onclick="openRecipe(${idx})">
      <div class="recipe-card-thumb">
        ${r.imageData ? `<img src="${r.imageData}" alt="${esc(r.title)}" loading="lazy" />` : '🍽️'}
      </div>
      <div class="recipe-card-body">
        <div class="recipe-card-title">${esc(r.title)}</div>
        <div class="recipe-card-meta">
          ${r.time ? `<span>⏱ ${esc(r.time)}</span>` : ''}
          ${r.servings ? `<span>👤 ${esc(r.servings)}</span>` : ''}
        </div>
        ${(r.tags || []).slice(0,3).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function openRecipe(idx) {
  const r = recipes[idx];
  if (!checkedIng[idx]) checkedIng[idx] = {};
  closeModal();

  const bd = document.createElement('div');
  bd.className = 'modal-backdrop';
  bd.id = 'modal-backdrop';
  bd.onclick = e => { if (e.target === bd) closeModal(); };

  bd.innerHTML = `
  <div class="modal">
    <div class="modal-handle"></div>
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2>${esc(r.title)}</h2>
    <div class="modal-meta">
      ${r.time      ? `<span>⏱ ${esc(r.time)}</span>`       : ''}
      ${r.servings  ? `<span>👤 ${esc(r.servings)}</span>`   : ''}
      ${r.difficulty? `<span>📊 ${esc(r.difficulty)}</span>` : ''}
    </div>
    ${r.imageData ? `<img src="${r.imageData}" class="thumb-img" alt="${esc(r.title)}" />` : ''}

    <div class="section-label">Ingredients</div>
    <ul class="ingredients-list" id="ing-${idx}">
      ${(r.ingredients || []).map((ing, j) => `
      <li>
        <div class="check-circle ${checkedIng[idx][j] ? 'checked' : ''}"
             onclick="toggleIng(${idx},${j})"
             id="chk-${idx}-${j}">${checkedIng[idx][j] ? '✓' : ''}</div>
        <span id="it-${idx}-${j}" style="${checkedIng[idx][j] ? 'text-decoration:line-through;color:var(--ink3)' : ''}">
          ${esc(ing)}
        </span>
      </li>`).join('')}
    </ul>

    <div class="section-label">Instructions</div>
    <ol class="steps-list">
      ${(r.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}
    </ol>

    ${r.notes ? `<div class="section-label">Notes &amp; tips</div><div class="notes-box">${esc(r.notes)}</div>` : ''}

    <div class="btn-row">
      <button class="pill-btn green" onclick="addRecipeToGrocery(${idx})">🛒 Add to grocery list</button>
      <button class="pill-btn ghost" onclick="closeModal();showAddMealModal(${idx},null)">📅 Add to meal plan</button>
      <button class="pill-btn danger" onclick="deleteRecipe(${idx})">Remove</button>
    </div>
  </div>`;

  document.getElementById('modal-root').appendChild(bd);
}

function toggleIng(idx, j) {
  checkedIng[idx][j] = !checkedIng[idx][j];
  const c = document.getElementById(`chk-${idx}-${j}`);
  const t = document.getElementById(`it-${idx}-${j}`);
  if (checkedIng[idx][j]) {
    c.classList.add('checked'); c.textContent = '✓';
    t.style.textDecoration = 'line-through'; t.style.color = 'var(--ink3)';
  } else {
    c.classList.remove('checked'); c.textContent = '';
    t.style.textDecoration = ''; t.style.color = '';
  }
}

function closeModal() {
  const b = document.getElementById('modal-backdrop');
  if (b) b.remove();
}

function deleteRecipe(idx) {
  if (!confirm(`Remove "${recipes[idx].title}"?`)) return;
  recipes.splice(idx, 1);
  save(RKEY, recipes);
  closeModal();
  updateCounts();
  renderGrid();
  showToast('Recipe removed');
}

/* ══════════════════════════════════════
   GROCERY
══════════════════════════════════════ */
function categorize(ingredient) {
  const i = ingredient.toLowerCase();
  if (/chicken|beef|pork|salmon|shrimp|turkey|lamb|tuna|bacon|sausage|steak|ground meat|ground beef|ground turkey/.test(i)) return '🥩 Meat & seafood';
  if (/milk|cheese|butter|cream|yogurt|egg|parmesan|mozzarella|cheddar|ricotta|brie|gouda/.test(i)) return '🥚 Dairy & eggs';
  if (/tomato|onion|garlic|pepper|carrot|celery|spinach|lettuce|broccoli|mushroom|zucchini|potato|cucumber|lemon|lime|ginger|avocado|corn|kale|cabbage|eggplant|scallion|jalapeño|cilantro|parsley|basil leaves|fresh/.test(i)) return '🥦 Produce';
  if (/bread|tortilla|pasta|rice|noodle|flour|oat|quinoa|cracker|roll|baguette|sourdough|pita/.test(i)) return '🍞 Bread & grains';
  if (/olive oil|vegetable oil|soy sauce|vinegar|mustard|ketchup|honey|sriracha|sesame oil|fish sauce|hot sauce|mayo|mayonnaise|worcestershire|tahini/.test(i)) return '🫙 Condiments & oils';
  if (/salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|chili powder|turmeric|spice|seasoning|cayenne|garlic powder|onion powder|bay leaf/.test(i)) return '🧂 Spices & herbs';
  if (/can|canned|broth|stock|diced tomatoes|tomato paste|beans|chickpea|lentil|coconut milk|tomato sauce/.test(i)) return '🥫 Canned & pantry';
  if (/sugar|brown sugar|honey|maple syrup|agave|powdered sugar/.test(i)) return '🍬 Sweeteners';
  if (/wine|beer|juice|water|soda|broth|stock|drink|beverage/.test(i)) return '🧃 Beverages';
  return '🛍️ Other';
}

function addRecipeToGrocery(idx) {
  const r = recipes[idx];
  let added = 0;
  (r.ingredients || []).forEach(ing => {
    const exists = grocery.find(g => g.name.toLowerCase() === ing.toLowerCase());
    if (!exists) { grocery.push({ name: ing, category: categorize(ing), checked: false, source: r.title }); added++; }
  });
  save(GKEY, grocery);
  updateCounts();
  closeModal();
  showView('grocery');
  showToast(added > 0 ? `${added} items added to grocery list` : 'All items already in list');
}

function buildGroceryFromPlan() {
  let added = 0;
  Object.values(plan).forEach(meals => {
    meals.forEach(m => {
      const r = recipes[m.recipeIdx];
      if (!r) return;
      (r.ingredients || []).forEach(ing => {
        const exists = grocery.find(g => g.name.toLowerCase() === ing.toLowerCase());
        if (!exists) { grocery.push({ name: ing, category: categorize(ing), checked: false, source: r.title }); added++; }
      });
    });
  });
  save(GKEY, grocery);
  updateCounts();
  showView('grocery');
  showToast(added > 0 ? `${added} items added from your meal plan` : 'All ingredients already in list');
}

function renderGrocery() {
  const area  = document.getElementById('grocery-list-area');
  const empty = document.getElementById('empty-grocery');
  if (grocery.length === 0) { area.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  const byCategory = {};
  grocery.forEach((g, i) => {
    if (!byCategory[g.category]) byCategory[g.category] = [];
    byCategory[g.category].push({ ...g, origIdx: i });
  });

  const unchecked = grocery.filter(g => !g.checked).length;
  document.getElementById('grocery-summary').textContent =
    `${unchecked} item${unchecked !== 1 ? 's' : ''} remaining · ${grocery.length} total`;

  area.innerHTML = Object.entries(byCategory).map(([cat, items]) => `
  <div class="grocery-section">
    <div class="grocery-cat-header">
      ${cat}
      <span class="grocery-count-badge">${items.filter(i => !i.checked).length}/${items.length}</span>
    </div>
    ${items.map(item => `
    <div class="grocery-item ${item.checked ? 'done' : ''}" id="gi-${item.origIdx}">
      <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleGrocery(${item.origIdx},this.checked)" />
      <span>${esc(item.name)}</span>
      <span class="grocery-source">${esc(item.source || '')}</span>
    </div>`).join('')}
  </div>`).join('');
}

function toggleGrocery(idx, checked) {
  grocery[idx].checked = checked;
  save(GKEY, grocery);
  updateCounts();
  const row = document.getElementById('gi-' + idx);
  if (row) checked ? row.classList.add('done') : row.classList.remove('done');
  const unchecked = grocery.filter(g => !g.checked).length;
  document.getElementById('grocery-summary').textContent =
    `${unchecked} item${unchecked !== 1 ? 's' : ''} remaining · ${grocery.length} total`;
  document.getElementById('cnt-grocery').textContent = unchecked;
  document.getElementById('cnt-grocery').style.display = unchecked > 0 ? 'flex' : 'none';
}

function clearCheckedGrocery() {
  const before = grocery.length;
  grocery = grocery.filter(g => !g.checked);
  save(GKEY, grocery);
  updateCounts();
  renderGrocery();
  const removed = before - grocery.length;
  if (removed > 0) showToast(`Removed ${removed} checked item${removed !== 1 ? 's' : ''}`);
}

function clearAllGrocery() {
  if (!confirm('Clear the entire grocery list?')) return;
  grocery = [];
  save(GKEY, grocery);
  updateCounts();
  renderGrocery();
}

/* ══════════════════════════════════════
   MEAL PLANNER
══════════════════════════════════════ */
function renderPlanner() {
  const grid = document.getElementById('week-grid');
  grid.innerHTML = DAYS.map(day => {
    const meals = plan[day] || [];
    return `
    <div class="day-row">
      <div class="day-header">
        <span class="day-name">${day}</span>
        <button class="add-meal-btn" onclick="showAddMealModal(null,'${day}')">+ Add meal</button>
      </div>
      <div class="day-meals">
        ${meals.map((m, mi) => {
          const r = recipes[m.recipeIdx];
          if (!r) return '';
          return `
          <div class="meal-chip">
            <span class="meal-chip-type">${m.mealType}</span>
            <span class="meal-chip-title">${esc(r.title)}</span>
            <button class="meal-chip-remove" onclick="removeMeal('${day}',${mi})">✕</button>
          </div>`;
        }).join('')}
        ${meals.length === 0 ? `<span style="font-size:12px;color:var(--ink3)">Nothing planned yet</span>` : ''}
      </div>
    </div>`;
  }).join('');
}

function removeMeal(day, mi) {
  plan[day].splice(mi, 1);
  save(PKEY, plan);
  renderPlanner();
}

function clearPlan() {
  if (!confirm('Clear this week\'s meal plan?')) return;
  plan = {};
  save(PKEY, plan);
  renderPlanner();
  showToast('Meal plan cleared');
}

function showAddMealModal(recipeIdx, day) {
  closeModal();
  if (recipes.length === 0) { showToast('Add some recipes first!'); return; }

  let selDay   = day  || DAYS[0];
  let selMeal  = 'Dinner';
  let selRIdx  = recipeIdx !== null && recipeIdx !== undefined ? recipeIdx : 0;

  const bd = document.createElement('div');
  bd.className = 'modal-backdrop';
  bd.id = 'modal-backdrop';
  bd.onclick = e => { if (e.target === bd) closeModal(); };

  bd.innerHTML = `
  <div class="modal" style="max-width:440px">
    <div class="modal-handle"></div>
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h2 style="font-size:18px">Add to meal plan</h2>

    <div class="picker-label">Day</div>
    <div class="chip-row" id="day-chips">
      ${DAYS.map(d => `<button class="chip-option ${d === selDay ? 'sel' : ''}" onclick="selectChip('day-chips',this,'${d}',()=>selDay='${d}')">${d}</button>`).join('')}
    </div>

    <div class="picker-label">Meal</div>
    <div class="chip-row" id="meal-chips">
      ${MEALS.map(m => `<button class="chip-option ${m === selMeal ? 'sel' : ''}" onclick="selectChip('meal-chips',this,'${m}',()=>selMeal='${m}')">${m}</button>`).join('')}
    </div>

    <div class="picker-label">Recipe</div>
    <select class="recipe-select" id="plan-recipe-sel" onchange="selRIdx=parseInt(this.value)">
      ${recipes.map((r, i) => `<option value="${i}" ${i === selRIdx ? 'selected' : ''}>${esc(r.title)}</option>`).join('')}
    </select>

    <div class="btn-row">
      <button class="pill-btn accent" onclick="confirmAddMeal()">Add to plan</button>
      <button class="pill-btn ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>`;

  document.getElementById('modal-root').appendChild(bd);

  window.confirmAddMeal = function() {
    const d    = selDay;
    const m    = selMeal;
    const rIdx = parseInt(document.getElementById('plan-recipe-sel').value);
    if (isNaN(rIdx)) return;
    if (!plan[d]) plan[d] = [];
    plan[d].push({ mealType: m, recipeIdx: rIdx });
    save(PKEY, plan);
    closeModal();
    renderPlanner();
    showToast(`Added to ${d} ${m}`);
  };
}

function selectChip(groupId, btn, val, setter) {
  document.querySelectorAll(`#${groupId} .chip-option`).forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  setter();
}

/* ══════════════════════════════════════
   IMAGE PROCESSING
══════════════════════════════════════ */
async function processImage(file) {
  if (!apiKey) {
    showToast('Please save your API key first');
    showView('add');
    document.getElementById('api-key-input').focus();
    return;
  }

  setLoading(true, 'Reading your screenshot…');

  const b64 = await fileToBase64(file);
  const thumbData = 'data:' + file.type + ';base64,' + b64;

  setLoading(true, 'Extracting recipe with AI…');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: `You are a recipe extraction assistant. Extract all recipe info from the screenshot and return ONLY valid JSON with no markdown, no backticks, no extra text:
{"title":"Recipe name","time":"e.g. 30 min or null","servings":"e.g. 4 servings or null","difficulty":"Easy/Medium/Hard or null","source":"creator or platform if visible else null","ingredients":["amount + ingredient name"],"steps":["step 1 description","step 2 description"],"tags":["up to 4 short tags like cuisine type, meal type, dietary info"],"notes":"visible tips or substitutions or null"}
If no recipe is visible, return: {"error":"No recipe found"}`,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: file.type, data: b64 } },
            { type: 'text', text: 'Extract the recipe from this screenshot.' }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.content.map(i => i.text || '').join('').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    if (parsed.error) {
      setLoading(false);
      showToast('No recipe found — try a clearer screenshot');
      return;
    }

    parsed.imageData = thumbData;
    parsed.addedAt   = new Date().toISOString();
    recipes.unshift(parsed);
    save(RKEY, recipes);
    updateCounts();
    setLoading(false);
    showView('cookbook');
    renderGrid();
    setTimeout(() => openRecipe(0), 200);
    showToast(`"${parsed.title}" saved!`);

  } catch (err) {
    setLoading(false);
    showToast('Error: ' + (err.message || 'Something went wrong'));
    console.error(err);
  }
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result.split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

function setLoading(show, msg) {
  document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
  if (msg) document.getElementById('loading-msg').textContent = msg;
}

/* ── File input & drag/drop ── */
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

fileInput.addEventListener('change', async e => {
  for (const f of e.target.files) await processImage(f);
  fileInput.value = '';
});

dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', async e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  for (const f of e.dataTransfer.files) if (f.type.startsWith('image/')) await processImage(f);
});

/* ── Utilities ── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2800);
}

/* ── Service Worker Registration ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.log('SW failed:', err));
  });
}

/* ── Boot ── */
boot();
