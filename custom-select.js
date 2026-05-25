(function () {
  // 1. СТИЛІ ДЛЯ СЕЛЕКТІВ ТА ГЛОБАЛЬНИЙ ФІКС АВТОЗАПОВНЕННЯ ІНПУТІВ
  const style = document.createElement('style');
  style.textContent = `
    /* КРИТИЧНИЙ ФІКС ДЛЯ ЗВИЧАЙНИХ ІНПУТІВ (Full Name, Email, Phone) */
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus,
    textarea:-webkit-autofill,
    textarea:-webkit-autofill:hover,
    textarea:-webkit-autofill:focus {
      -webkit-text-fill-color: #fafafa !important; /* Білі букви */
      box-shadow: 0 0 0px 1000px #05060a inset !important; /* Глибокий темний фон #05060a */
      transition: background-color 5000s ease-in-out 0s;
    }

    /* Коли користувач сам вводить текст в інпути */
    .form-control {
      background-color: #0d0f14 !important;
      color: rgba(255, 255, 255, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .form-control:focus, 
    .form-control:not(:placeholder-shown) {
      background-color: #05060a !important; /* Фон #05060a при заповненні */
      color: #fafafa !important;            /* Букви #fafafa */
      border-color: #363d4f;
    }

    /* Приховуємо нативний select */
    .form-select-wrapper select.form-select {
      display: none !important;
    }

    /* Кастомний select */
    .cs-wrapper {
      position: relative;
      width: 100%;
      user-select: none;
    }

    /* Шапка селекту (тригер) — порожній стан */
    .cs-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background-color: #0d0f14 !important;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.4);
      font-family: 'Open Sans', sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: border-color 0.25s ease, background-color 0.25s ease, color 0.25s ease;
      min-height: 46px;
    }

    /* Коли СЕЛЕКТ ЗАПОВНЕНЙ */
    .cs-trigger.has-value {
      background-color: #05060a !important; /* Фон #05060a */
      color: #fafafa !important;            /* Букви #fafafa */
      border-color: #363d4f;
    }

    .cs-trigger:hover {
      border-color: #363d4f;
    }

    /* Стан, коли список ВІДКРИТИЙ */
    .cs-trigger.open {
      background-color: #05060a !important;
      border-color: #363d4f;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    /* Стрілочка */
    .cs-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: rgba(255, 255, 255, 0.6);
      transition: transform 0.3s ease, color 0.25s ease;
    }

    .cs-trigger.open .cs-arrow {
      transform: rotate(180deg);
      color: #fff;
    }

    /* Випадаюча плашка дропдауну */
    .cs-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: #05060a !important;
      border: 1px solid #363d4f;
      border-top: none;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      overflow: hidden;
      display: none;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8);
    }

    .cs-dropdown.open {
      display: block;
    }

    /* Елементи списку всередині плашки */
    .cs-option {
      padding: 11px 14px;
      font-family: 'Open Sans', sans-serif;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      background-color: #05060a !important;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    /* Колір #23262e при наведенні мишки на пункт */
    .cs-option:hover {
      background-color: #363d4f !important;
      color: #fafafa;
    }

    /* Вибраний елемент списку */
    .cs-option.selected {
      background-color: #363d4f !important; /* Гармонійний акцент для вибраного елемента */
      color: #fafafa;
      font-weight: 500;
    }

    .cs-option.placeholder {
      color: rgba(255, 255, 255, 0.35);
    }

    /* Коли відкриється вгору */
    .cs-wrapper.open-up .cs-trigger {
      border-radius: 0;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    .cs-wrapper.open-up .cs-dropdown {
      top: auto;
      bottom: 100%;
      border-top: 1px solid #363d4f;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
    }
  `;
  document.head.appendChild(style);

  // 2. ФУНКЦІЯ ЗБОРКИ КАСТОМНОГО СЕЛЕКТУ
  function buildCustomSelect(nativeSelect) {
    const wrapper = nativeSelect.closest('.form-select-wrapper');
    if (!wrapper) return;

    if (wrapper.querySelector('.cs-wrapper')) return;

    const options = Array.from(nativeSelect.options);

    const csWrapper = document.createElement('div');
    csWrapper.className = 'cs-wrapper';

    const trigger = document.createElement('div');
    trigger.className = 'cs-trigger';

    const label = document.createElement('span');
    label.className = 'cs-label';
    label.textContent = options[0] ? options[0].text : 'Select...';

    const arrow = document.createElement('span');
    arrow.className = 'cs-arrow';
    arrow.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    trigger.appendChild(label);
    trigger.appendChild(arrow);

    const dropdown = document.createElement('div');
    dropdown.className = 'cs-dropdown';

    options.forEach((opt, i) => {
      const item = document.createElement('div');
      item.className = 'cs-option' + (i === 0 ? ' placeholder' : '');
      item.textContent = opt.text;
      item.dataset.value = opt.value;

      item.addEventListener('click', function () {
        nativeSelect.value = opt.value;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

        label.textContent = opt.text;
        trigger.classList.toggle('has-value', !!opt.value);

        dropdown.querySelectorAll('.cs-option').forEach(o => o.classList.remove('selected'));
        if (opt.value) {
          item.classList.add('selected');
          item.classList.remove('placeholder');
        }

        closeDropdown();
      });

      dropdown.appendChild(item);
    });

    csWrapper.appendChild(trigger);
    csWrapper.appendChild(dropdown);

    wrapper.insertBefore(csWrapper, nativeSelect);

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      closeAll();
      if (!isOpen) openDropdown();
    });

    function openDropdown() {
      trigger.classList.add('open');
      dropdown.classList.add('open');

      csWrapper.style.zIndex = '100000';
      if (wrapper) {
        wrapper.style.zIndex = '100000';
      }

      const rect = csWrapper.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropH = Math.min(options.length * 43, 220);

      if (spaceBelow < dropH && rect.top > dropH) {
        csWrapper.classList.add('open-up');
      } else {
        csWrapper.classList.remove('open-up');
      }
    }

    function closeDropdown() {
      trigger.classList.remove('open');
      dropdown.classList.remove('open');
      csWrapper.classList.remove('open-up');

      csWrapper.style.zIndex = '';
      if (wrapper) {
        wrapper.style.zIndex = '';
      }
    }

    csWrapper._close = closeDropdown;
  }

  function closeAll() {
    document.querySelectorAll('.cs-wrapper').forEach(w => {
      if (w._close) w._close();
    });
  }

  document.addEventListener('click', closeAll);

  function init() {
    document.querySelectorAll('.form-select-wrapper select.form-select').forEach(buildCustomSelect);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
