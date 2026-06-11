// ========== CONTACT FORM вЂ” FORMSPREE ==========


document.addEventListener('DOMContentLoaded', function () {
    const socialLinksTemplate = document.getElementById('socialLinksTemplate');
    if (socialLinksTemplate) {
        document.querySelectorAll('[data-social-links]').forEach((target) => {
            target.appendChild(socialLinksTemplate.content.cloneNode(true));
        });
    }

    // ---------- FORM SUBMIT via Formspree fetch ----------
    const FORMSPREE_URL = 'https://formspree.io/f/mgernokl';
    const contactForm   = document.getElementById('contactForm');
    const formMessage   = document.getElementById('formMessage');
    const submitBtn     = contactForm ? contactForm.querySelector('.form-submit-btn') : null;
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            console.log('[DEBUG:Form] Submit triggered');
            
            const service = (document.getElementById('request-service') || {}).value || '';
            const name    = (document.getElementById('name')    || {}).value || '';
            const email   = (document.getElementById('email')   || {}).value || '';
            const phone   = (document.getElementById('phone')   || {}).value || '';
            const genre   = (document.getElementById('genre')   || {}).value || '';
            const proClass = (document.getElementById('professional-class') || {}).value || '';
            const proTime = (document.getElementById('professional-time') || {}).value || '';
            const message = (document.getElementById('message') || {}).value || '';
            
            console.log('[DEBUG:Form] Data collected:', { service, name, email, phone, genre, proClass, proTime, message });
            
            // --- Validation ---
            if (!name.trim() || !email.trim()) {
                console.log('[DEBUG:Form] Validation failed - missing name or email');
                showMessage('Please fill in all required fields.', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            if (!message.trim()) {
                showMessage('Please enter your message.', 'error');
                return;
            }
            
            // --- UI: loading state ---
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'SendingвЂ¦';
            }
            showMessage('', '');
            
            // --- Send via Formspree ---
            try {
                console.log('[DEBUG:Form] Sending to Formspree:', FORMSPREE_URL);
                const response = await fetch(FORMSPREE_URL, {
                    method:  'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        service, 
                        name, 
                        email, 
                        phone, 
                        genre, 
                        proClass, 
                        proTime,
                        message 
                    })
                });
                
                const data = await response.json();
                console.log('[DEBUG:Form] Response status:', response.status, 'Data:', data);
                
                if (response.ok) {
                    console.log('[DEBUG:Form] Success! Message sent');
                    showMessage('вњ“ Message sent successfully!', 'success');
                    contactForm.reset();
                    updatePhoneFlag('');
                } else {
                    console.log('[DEBUG:Form] Error response from Formspree');
                    const errText = data.errors
                        ? data.errors.map(err => err.message).join(', ')
                        : 'Failed to send message. Please try again.';
                    showMessage(errText, 'error');
                }
            } catch (err) {
                console.error('[DEBUG:Form] Network/Fetch error:', err);
                showMessage('Network error. Please check your connection and try again.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }
            }
        });
    }
    
    // ---------- Animated success toast ----------
    function createToast() {
        const existing = document.getElementById('formSuccessToast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.id = 'formSuccessToast';
        toast.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="toast-checkmark">
                <circle cx="11" cy="11" r="10" stroke="#4ade80" stroke-width="2"/>
                <polyline points="6,11 9.5,14.5 16,8" stroke="#4ade80" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Message sent successfully!</span>
        `;
        
        Object.assign(toast.style, {
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '10px',
            marginTop:      '18px',
            padding:        '12px 22px',
            borderRadius:   '10px',
            background:     'rgba(74, 222, 128, 0.10)',
            border:         '1px solid rgba(74, 222, 128, 0.35)',
            color:          '#4ade80',
            fontFamily:     "'Open Sans', sans-serif",
            fontSize:       '15px',
            fontWeight:     '500',
            letterSpacing:  '0.02em',
            opacity:        '0',
            transform:      'translateY(10px)',
            transition:     'opacity 0.4s ease, transform 0.4s ease',
            pointerEvents:  'none',
        });
        
        if (formMessage) {
            formMessage.textContent = '';
            formMessage.after(toast);
        } else {
            contactForm.after(toast);
        }
        
        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.opacity   = '1';
                toast.style.transform = 'translateY(0)';
            });
        });
        
        // Animate out after 4s
        setTimeout(() => {
            toast.style.opacity   = '0';
            toast.style.transform = 'translateY(-8px)';
            setTimeout(() => toast.remove(), 450);
        }, 4000);
    }
    
    function showMessage(text, type) {
        if (type === 'success') {
            createToast();
            return;
        }
        
        if (!formMessage) return;
        formMessage.textContent = text;
        formMessage.style.color = type === 'error' ? '#ff5555' : '';
        
        if (type === 'error') {
            formMessage.style.opacity   = '1';
            formMessage.style.transform = 'none';
        }
    }
    
    // ---------- Phone flag detection ----------
    const phoneInput = document.getElementById('phone');
    const phoneFlag  = document.getElementById('phoneFlag');
    
    const dialCodeMap = [
        { code: '380', iso: 'ua', name: 'Ukraine' },
        { code: '358', iso: 'fi', name: 'Finland' },
        { code: '420', iso: 'cz', name: 'Czech Republic' },
        { code: '421', iso: 'sk', name: 'Slovakia' },
        { code: '373', iso: 'md', name: 'Moldova' },
        { code: '351', iso: 'pt', name: 'Portugal' },
        { code: '353', iso: 'ie', name: 'Ireland' },
        { code: '971', iso: 'ae', name: 'United Arab Emirates' },
        { code: '972', iso: 'il', name: 'Israel' },
        { code: '966', iso: 'sa', name: 'Saudi Arabia' },
        { code: '1',  iso: 'us', name: 'United States / Canada' },
        { code: '7',  iso: 'kz', name: 'Kazakhstan' },
        { code: '20', iso: 'eg', name: 'Egypt' },
        { code: '27', iso: 'za', name: 'South Africa' },
        { code: '30', iso: 'gr', name: 'Greece' },
        { code: '31', iso: 'nl', name: 'Netherlands' },
        { code: '32', iso: 'be', name: 'Belgium' },
        { code: '33', iso: 'fr', name: 'France' },
        { code: '34', iso: 'es', name: 'Spain' },
        { code: '36', iso: 'hu', name: 'Hungary' },
        { code: '39', iso: 'it', name: 'Italy' },
        { code: '40', iso: 'ro', name: 'Romania' },
        { code: '41', iso: 'ch', name: 'Switzerland' },
        { code: '43', iso: 'at', name: 'Austria' },
        { code: '44', iso: 'gb', name: 'United Kingdom' },
        { code: '45', iso: 'dk', name: 'Denmark' },
        { code: '46', iso: 'se', name: 'Sweden' },
        { code: '47', iso: 'no', name: 'Norway' },
        { code: '48', iso: 'pl', name: 'Poland' },
        { code: '49', iso: 'de', name: 'Germany' },
        { code: '52', iso: 'mx', name: 'Mexico' },
        { code: '54', iso: 'ar', name: 'Argentina' },
        { code: '55', iso: 'br', name: 'Brazil' },
        { code: '56', iso: 'cl', name: 'Chile' },
        { code: '57', iso: 'co', name: 'Colombia' },
        { code: '61', iso: 'au', name: 'Australia' },
        { code: '64', iso: 'nz', name: 'New Zealand' },
        { code: '65', iso: 'sg', name: 'Singapore' },
        { code: '66', iso: 'th', name: 'Thailand' },
        { code: '81', iso: 'jp', name: 'Japan' },
        { code: '82', iso: 'kr', name: 'South Korea' },
        { code: '84', iso: 'vn', name: 'Vietnam' },
        { code: '86', iso: 'cn', name: 'China' },
        { code: '90', iso: 'tr', name: 'Turkey' },
        { code: '91', iso: 'in', name: 'India' },
    ].sort((a, b) => b.code.length - a.code.length);
    
    function detectCountry(val) {
        const digits = val.replace(/\D/g, '');
        if (!digits) return { code: '380', iso: 'ua', name: 'Ukraine' };
        return dialCodeMap.find(e => digits.startsWith(e.code)) || { code: '380', iso: 'ua', name: 'Ukraine' };
    }
    
    function updatePhoneFlag(val) {
        if (!phoneFlag) return;
        const c = detectCountry(val);
        phoneFlag.src   = `https://flagcdn.com/w40/${c.iso}.png`;
        phoneFlag.alt   = `${c.name} flag`;
        phoneFlag.title = c.name;
    }
    
    if (phoneInput) {
        updatePhoneFlag(phoneInput.value || '+380');
        
        phoneInput.addEventListener('input', function (e) {
            const startsPlus = e.target.value.trim().startsWith('+') || e.target.value.trim().startsWith('00');
            let digits = e.target.value.replace(/\D/g, '');
            
            if (e.target.value.trim().startsWith('00')) digits = digits.slice(2);
            
            if (!digits) { e.target.value = ''; updatePhoneFlag(''); return; }
            
            e.target.value = '+' + digits.slice(0, 15);
            updatePhoneFlag(e.target.value);
        });
    }
    
    // ---------- Focus animations ----------
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur',  () => input.parentElement.classList.remove('focused'));
    });
    
    // ---------- Dropdown icon management ----------
    document.querySelectorAll('.form-select').forEach((select, index) => {
        const wrapper = select.closest('.form-select-wrapper');
        const icon = wrapper ? wrapper.querySelector('.dropdown-icon') : null;
        
        if (!icon) {
            console.warn('[DEBUG:Dropdown] No icon found for select #' + index);
            return;
        }
        
        console.log('[DEBUG:Dropdown] Setting up select #' + index + ' with icon');
        
        // Ensure icon always visible
        icon.style.visibility = 'visible';
        icon.style.opacity = '1';
        
        select.addEventListener('mousedown', function() {
            console.log('[DEBUG:Dropdown] Select #' + index + ' mousedown');
            icon.style.visibility = 'visible';
            icon.style.opacity = '1';
        });
        
        select.addEventListener('change', function() {
            console.log('[DEBUG:Dropdown] Select #' + index + ' changed to:', this.value);
            icon.style.transform = 'translateY(-50%) rotate(0deg)';
            icon.style.visibility = 'visible';
            icon.style.opacity = '1';
        });
        
        select.addEventListener('blur', function() {
            console.log('[DEBUG:Dropdown] Select #' + index + ' blur');
            icon.style.transform = 'translateY(-50%) rotate(0deg)';
            icon.style.visibility = 'visible';
            icon.style.opacity = '1';
        });
        
        select.addEventListener('focus', function() {
            console.log('[DEBUG:Dropdown] Select #' + index + ' focus');
            icon.style.visibility = 'visible';
            icon.style.opacity = '1';
        });
    });

    // ---------- SPOTIFY RELEASES ----------
    const musicList = document.querySelector('[data-spotify-releases]');
    const musicTabs = Array.from(document.querySelectorAll('.music-tab'));
    const musicCategories = {
        popular: [
            {
                embedUrl: 'https://open.spotify.com/embed/track/6caTJxoCaQq5ARnTUhglwC?utm_source=generator',
                image: 'img/arctic.webp',
                title: 'A.L.Y.S. - Arctic Stream (Original Mix)',
                platformUrls: {
                    'Apple Music': 'https://music.apple.com/us/album/arctic-stream-single/1481019044?l=ru',
                    SoundCloud: 'https://soundcloud.com/yeiskomp/alys-arctic-stream',
                    YouTube: 'https://www.youtube.com/watch?v=iRz3KfNWXj0',
                },
            },
            {
                embedUrl: 'https://open.spotify.com/embed/track/7zG4Wr7ZkrBrdxPmbofOM2?utm_source=generator',
                image: 'img/love.webp',
                title: 'A.L.Y.S. - Love Deep Like Ocean (NyTiGen Radio Edit)',
                platformUrls: {
                    'Apple Music': 'https://music.apple.com/ru/album/love-deep-like-ocean-nytigen-remix-single/1514631475',
                    SoundCloud: 'https://soundcloud.com/fyhofficial/find-your-harmony-radio-211',
                    YouTube: 'https://www.youtube.com/watch?v=L-B18QUCQyc',
                },
            },
            {
                embedUrl: 'https://open.spotify.com/embed/track/5sgnrjGCxJn3Uw55IMtH2J?utm_source=generator',
                image: 'img/deep.webp',
                title: 'Van Yarge - Deep Emotions (A.L.Y.S. Extended Remix)',
                platformUrls: {
                    'Apple Music': 'https://music.apple.com/us/album/deep-emotions-ep/1833354769',
                    SoundCloud: 'https://soundcloud.com/rene-ablaze/deep-emotions-a-l-y-s-remix',
                    YouTube: 'https://www.youtube.com/watch?v=_43Zz0u22hM',
                },
            },
        ],
        new: [
            {
                embedUrl: 'https://open.spotify.com/embed/album/6Sat3HdtSZntOSc1GsUbNP?utm_source=generator',
                image: 'img/beam of light.webp',
                title: 'A.L.Y.S. - Beam of Light (Original Mix)',
                platformUrls: {
                    'Apple Music': 'https://music.apple.com/us/album/beam-of-light-single/1895130064',
                    YouTube: 'https://www.youtube.com/watch?v=Pw_CHeIRHUo&list=OLAK5uy_k8DWPmDzS8TPKDzcctXemfcIclLq65vG0',
                },
            },
            {
                embedUrl: 'https://open.spotify.com/embed/album/5cahPFrYcyGB6GGdxzRihT?utm_source=generator',
                image: 'img/violet.webp',
                title: 'A.L.Y.S., Hidden Tigress - Violet Sky',
                platformUrls: {
                    'Apple Music': 'https://music.apple.com/us/album/violet-sky-ep/1882165626',
                    SoundCloud: 'https://soundcloud.com/hidden_tigress_official21/a-l-y-s-hidden-tigress-violet',
                    YouTube: 'https://www.youtube.com/watch?v=u9D_NwqatQk',
                },
            },
        ],
    };
    let activeMusicCategory = 'new';
    const defaultMusicPlatforms = [
        {
            icon: 'icon-apple-music',
            label: 'Apple Music',
            url: 'https://music.apple.com/ua/artist/a-l-y-s/307999757',
        },
        {
            icon: 'icon-soundcloud',
            label: 'SoundCloud',
            url: 'https://soundcloud.com/djbaset',
        },
        {
            icon: 'icon-youtube',
            label: 'YouTube',
            url: 'https://www.youtube.com/channel/UCfuHjSNZ_MP4-v3PHO7y9HQ',
        },
    ];

    const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char]));

    const getSpotifyUrl = (embedUrl) => embedUrl
        .replace('https://open.spotify.com/embed/', 'https://open.spotify.com/')
        .split('?')[0];

    const renderPlatformLinks = (release) => {
        const platformUrls = release.platformUrls || {};
        const platforms = [
            {
                icon: 'icon-spotify',
                label: 'Spotify',
                url: getSpotifyUrl(release.embedUrl),
            },
            ...defaultMusicPlatforms.map((platform) => ({
                ...platform,
                url: platformUrls[platform.label] || platform.url,
            })),
        ];

        return platforms.map((platform) => `
            <a class="music-platform-link" href="${escapeHtml(platform.url)}" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${escapeHtml(platform.icon)}"></use></svg>
                <span>${escapeHtml(platform.label)}</span>
            </a>
        `).join('');
    };

    const renderMusicCategory = () => {
        if (!musicList) return;

        const releases = musicCategories[activeMusicCategory] || [];

        musicList.innerHTML = releases.map((release, index) => {
            const iframeTitle = release.title ? `${release.title} on Spotify` : 'Spotify player';

            return `
            <div class="music-row" data-category="${escapeHtml(activeMusicCategory)}">
                <div class="music-cover ${index % 2 === 0 ? 'music-cover--blue' : 'music-cover--purple'}">
                    <img src="${escapeHtml(release.image)}" alt="${escapeHtml(release.title || 'Music')} cover" loading="lazy" onerror="this.style.display='none'">
                </div>
                <div class="music-player">
                    <div class="music-listen">
                        <button class="music-player__bar" type="button" aria-expanded="false">
                            <span class="music-player__bar-label">Listen Here</span>
                            <svg class="music-player__bar-chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6l4 4 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <div class="music-platform-menu">
                            ${renderPlatformLinks(release)}
                        </div>
                    </div>
                    ${release.title ? `<p class="music-player__title">${escapeHtml(release.title)}</p>` : ''}
                    <div class="music-player__embed">
                        <iframe
                            src="${escapeHtml(release.embedUrl)}"
                            width="100%"
                            height="296"
                            frameborder="0"
                            allowfullscreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            title="${escapeHtml(iframeTitle)}">
                        </iframe>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    };

    const closeMusicDropdowns = (exceptToggle = null) => {
        if (!musicList) return;

        musicList.querySelectorAll('.music-player__bar[aria-expanded="true"]').forEach((openToggle) => {
            if (openToggle === exceptToggle) return;

            const openPlayer = openToggle.closest('.music-player');
            const openMenu = openPlayer ? openPlayer.querySelector('.music-platform-menu') : null;
            openToggle.setAttribute('aria-expanded', 'false');
            if (openMenu) openMenu.classList.remove('is-open');
        });
    };

    if (musicList) {
        musicList.addEventListener('click', (event) => {
            const toggle = event.target.closest('.music-player__bar');
            if (!toggle) return;

            const player = toggle.closest('.music-player');
            const menu = player ? player.querySelector('.music-platform-menu') : null;
            if (!menu) return;

            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            closeMusicDropdowns(toggle);

            toggle.setAttribute('aria-expanded', String(!isOpen));
            menu.classList.toggle('is-open', !isOpen);
        });

        document.addEventListener('click', (event) => {
            if (event.target.closest('.music-listen')) return;

            closeMusicDropdowns();
        });
    }

    musicTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            closeMusicDropdowns();
            activeMusicCategory = tab.dataset.category || 'new';
            musicTabs.forEach((item) => {
                const isActive = item === tab;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-selected', String(isActive));
            });
            renderMusicCategory();
        });
    });

    renderMusicCategory();
        // ---------- SMOOTH SCROLL ----------
    const header = document.querySelector('.header');
    const updateHeaderState = () => {
        if (!header) return;
        header.classList.toggle('is-scrolled', window.scrollY > 2);
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    const headerNavLinks = Array.from(document.querySelectorAll('.header .nav-links a'));
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const defaultActiveHref = currentPage === 'about.html' ? 'about.html' : 'index.html';
    const setActiveNavLink = (activeHref) => {
        if (!headerNavLinks.some(link => link.getAttribute('href') === activeHref)) return;

        headerNavLinks.forEach((link) => {
            const href = link.getAttribute('href') || '';
            link.classList.toggle('active', href === activeHref);
        });
    };
    setActiveNavLink(defaultActiveHref);

    const navSections = [
        { href: 'index.html', element: document.querySelector('.hero') },
        { href: '#music', element: document.getElementById('music') },
        { href: '#video', element: document.getElementById('video') },
        { href: 'about.html', element: document.getElementById('about') },
        { href: '#service', element: document.getElementById('service') },
        { href: '#contact', element: document.getElementById('contact') },
    ].filter(item => item.element && headerNavLinks.some(link => link.getAttribute('href') === item.href));

    const updateActiveNavOnScroll = () => {
        if (!navSections.length) {
            setActiveNavLink(defaultActiveHref);
            return;
        }

        const headerHeight = header ? header.offsetHeight : 0;
        const marker = window.scrollY + headerHeight + Math.min(window.innerHeight * 0.28, 220);
        let current = navSections[0];

        navSections.forEach((item) => {
            if (item.element.offsetTop <= marker) {
                current = item;
            }
        });

        setActiveNavLink(current.href);
    };

    updateActiveNavOnScroll();
    window.addEventListener('scroll', updateActiveNavOnScroll, { passive: true });
    window.addEventListener('resize', updateActiveNavOnScroll);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#more') { e.preventDefault(); return; }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navbarHeight = header ? header.offsetHeight : 0;
                window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navbarHeight, behavior: 'smooth' });
                setActiveNavLink(href);
            }
        });
    });
    
    // ---------- BURGER MENU ----------
    const navLinks = document.getElementById('navLinks');
    const burger = document.querySelector('.burger');
    if (burger && navLinks) {
        burger.addEventListener('click', function() {
            navLinks.classList.toggle('open');
            burger.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('open');
                burger.classList.remove('active');
            });
        });
    }
});
// ========== END CONTACT FORM ==========
