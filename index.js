// index.js - attach events & small UI helpers
document.addEventListener('DOMContentLoaded', () => {
  const displayEl = document.getElementById('display');
  const memoryEl = document.getElementById('memory');

  // tombol klik
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      btn.classList.add('pressed');
      setTimeout(()=> btn.classList.remove('pressed'), 120);

      const val = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');

      if(action){
        handleAction(action);
      } else if(val !== null){
        handleInput(val);
      }
    });
  });

  // keyboard support (angka, ops, Enter, Backspace)
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if(/[0-9]/.test(key)) return handleInput(key);
    if(key === 'Enter') return handleAction('equals');
    if(key === 'Backspace') return handleAction('back');
    if(key === '.') return handleInput(',');
    if(key === ',') return handleInput(',');
    if(key === '+') return handleInput('+');
    if(key === '-') return handleInput('-');
    if(key === '*') return handleInput('×');
    if(key === '/') return handleInput('÷');
    if(key === '%') return handleAction('percent');
    if(key.toLowerCase() === 'c') return handleAction('clear');
  });

  // Helper proxies to script.js
  window.kalk = {
    setDisplay: (txt) => { displayEl.textContent = txt; },
    getDisplay: () => displayEl.textContent,
    setMemory: (txt) => { memoryEl.textContent = txt; }
  };

  // functions implemented in script.js
  // but we call the global helpers handleInput/handleAction from script.js
});
