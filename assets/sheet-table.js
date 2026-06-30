(async function loadSheetTable(){
  const root = document.querySelector('[data-sheet-widget]');
  if (!root) return;

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const spreadsheet = root.dataset.spreadsheet;
  const sheet = root.dataset.sheet;
  const searchPlaceholder = root.dataset.searchPlaceholder || '검색어를 입력하세요';
  const categoryColumn = root.dataset.categoryColumn || '';

  root.innerHTML = '<div class="sheet-state">자료를 불러오는 중입니다.</div>';

  function parseGviz(text){
    const json = text.match(/setResponse\(([\s\S]+)\);?$/);
    if (!json) throw new Error('시트 응답을 읽을 수 없습니다.');
    return JSON.parse(json[1]);
  }

  function rowValues(row){
    return (row.c || []).map(cell => cell ? (cell.f || cell.v || '') : '');
  }

  function normalize(table){
    const labels = (table.cols || []).map(col => col.label || '');
    let rows = (table.rows || []).map(rowValues).filter(row => row.some(Boolean));
    const hasLabels = labels.some(Boolean);
    let headers = labels;

    if (!hasLabels) {
      const headerIndex = rows.findIndex(row => row.filter(Boolean).length >= 2);
      headers = rows[headerIndex] || [];
      rows = rows.slice(headerIndex + 1);
    }

    const width = Math.max(headers.length, ...rows.map(row => row.length));
    headers = Array.from({ length: width }, (_, index) => headers[index] || `항목 ${index + 1}`);
    rows = rows.map(row => Array.from({ length: width }, (_, index) => row[index] || ''));
    return { headers, rows };
  }

  function renderCell(value, header){
    const text = String(value || '').trim();
    if (/^https?:\/\//.test(text)) {
      const label = header && header.includes('링크') ? '바로가기' : text;
      return `<a href="${esc(text)}" target="_blank" rel="noopener">${esc(label)}</a>`;
    }
    return esc(text).replace(/\n/g, '<br>');
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheet)}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('시트에 접근할 수 없습니다.');
    const payload = parseGviz(await res.text());
    const { headers, rows } = normalize(payload.table || {});
    const categoryIndex = categoryColumn ? headers.findIndex(header => header === categoryColumn) : -1;
    const categories = categoryIndex >= 0 ? [...new Set(rows.map(row => row[categoryIndex]).filter(Boolean))].slice(0, 24) : [];

    root.innerHTML = `
      <div class="sheet-controls">
        <input class="search-input" type="search" id="sheetSearch" placeholder="${esc(searchPlaceholder)}" autocomplete="off">
        <span class="count-pill" id="sheetCount">0개 표시</span>
      </div>
      ${categories.length ? `<div class="filter-row" id="filterRow">
        <button class="filter-chip active" type="button" data-filter="">전체</button>
        ${categories.map(category => `<button class="filter-chip" type="button" data-filter="${esc(category)}">${esc(category)}</button>`).join('')}
      </div>` : ''}
      <div class="table-wrap">
        <table>
          <thead><tr>${headers.map(header => `<th>${esc(header)}</th>`).join('')}</tr></thead>
          <tbody id="sheetBody"></tbody>
        </table>
      </div>
    `;

    const search = root.querySelector('#sheetSearch');
    const count = root.querySelector('#sheetCount');
    const body = root.querySelector('#sheetBody');
    const filterRow = root.querySelector('#filterRow');
    let activeFilter = '';

    function draw(){
      const keyword = search.value.trim().toLowerCase();
      const visible = rows.filter(row => {
        const textMatch = !keyword || row.join(' ').toLowerCase().includes(keyword);
        const filterMatch = !activeFilter || row[categoryIndex] === activeFilter;
        return textMatch && filterMatch;
      });

      body.innerHTML = visible.map(row => `
        <tr>${row.map((value, index) => `<td>${renderCell(value, headers[index])}</td>`).join('')}</tr>
      `).join('') || `<tr><td colspan="${headers.length}" class="sheet-state">검색 결과가 없습니다.</td></tr>`;
      count.textContent = `${visible.length.toLocaleString('ko-KR')}개 표시`;
    }

    search.addEventListener('input', draw);
    if (filterRow) {
      filterRow.addEventListener('click', event => {
        const button = event.target.closest('.filter-chip');
        if (!button) return;
        activeFilter = button.dataset.filter || '';
        filterRow.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('active', chip === button));
        draw();
      });
    }
    draw();
  } catch(e) {
    root.innerHTML = '<div class="sheet-state">자료를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</div>';
  }
})();
