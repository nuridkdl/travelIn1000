document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const appContent = document.getElementById('app-content');

    window.switchView = (targetId) => {
        navItems.forEach(item => item.classList.remove('active'));
        views.forEach(view => view.classList.remove('active-view'));

        const activeNavItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
            // Update sliding indicator CSS variable
            const index = Array.from(navItems).indexOf(activeNavItem);
            document.querySelector('.nav-container').style.setProperty('--active-index', index);
        }

        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add('active-view');
        
        appContent.scrollTo({ top: 0, behavior: 'smooth' });
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            window.switchView(targetId);
        });
    });

    // --- Auth View Logic ---
    const updateAuthView = () => {
        const currentUser = localStorage.getItem('currentUser');
        const snsProvider = localStorage.getItem('snsProvider');
        
        const mypageName = document.getElementById('user-display-name');
        const mypageRole = document.getElementById('user-role-badge');
        const adminMenuCard = document.getElementById('admin-menu-card');

        // Update Text & Role Badge
        if (currentUser && currentUser.startsWith('admin')) {
            const roleNames = {
                'admin_master': '최고 관리자',
                'admin_manager': '일반 관리자',
                'admin_biz': '사장님'
            };
            if (mypageName) mypageName.innerHTML = '관리자 님';
            if (mypageRole) {
                mypageRole.textContent = roleNames[currentUser] || '관리자';
                mypageRole.style.backgroundColor = '#FEE2E2';
                mypageRole.style.color = '#DC2626';
            }
            if (adminMenuCard) adminMenuCard.style.display = 'block';
        } else if (currentUser === 'general') {
            if (snsProvider) {
                if (mypageName) mypageName.innerHTML = `SNS 회원 님`;
                if (mypageRole) mypageRole.textContent = `${snsProvider.toUpperCase()} 연동`;
            } else {
                if (mypageName) mypageName.innerHTML = '여행자 님';
                if (mypageRole) mypageRole.textContent = '일반 회원';
            }
            if (adminMenuCard) adminMenuCard.style.display = 'none';
        } else {
            if (mypageName) mypageName.innerHTML = '게스트 님';
            if (mypageRole) mypageRole.textContent = '비회원 (로그인 필요)';
            if (adminMenuCard) adminMenuCard.style.display = 'none';
        }

        // Add Logout/Login Button to MyPage Menu
        const mypageContent = document.querySelector('.mypage-content');
        if (mypageContent) {
            // Remove old auth button card if exists
            const oldAuthCard = document.getElementById('auth-action-card');
            if (oldAuthCard) oldAuthCard.remove();

            const authCard = document.createElement('div');
            authCard.className = 'menu-card';
            authCard.id = 'auth-action-card';

            if (currentUser) {
                authCard.innerHTML = `
                    <button id="btn-logout" class="menu-btn-new">
                        <div class="menu-icon-bg" style="background: #FEE2E2; color: #DC2626;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
                        <span style="color: #DC2626;">로그아웃</span>
                    </button>
                `;
            } else {
                authCard.innerHTML = `
                    <button onclick="window.location.href='login.html'" class="menu-btn-new">
                        <div class="menu-icon-bg"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg></div>
                        <span>로그인 하러가기</span>
                        <svg class="chevron" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                `;
            }
            mypageContent.appendChild(authCard);

            if (currentUser) {
                document.getElementById('btn-logout').addEventListener('click', () => {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('snsProvider');
                    alert('로그아웃 되었습니다.');
                    window.location.href = 'login.html';
                });
            }
        }
        const fab = document.getElementById('fab-add-gallery');
        if (fab) {
            fab.style.display = currentUser ? 'flex' : 'none';
        }
    };
    updateAuthView();

    window.showPopup = (msg, callback) => {
        let overlay = document.getElementById('app-popup-overlay');
        if(!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'app-popup-overlay';
            overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9998; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.2s;';
            const box = document.createElement('div');
            box.style.cssText = 'background:#fff; padding:24px; border-radius:12px; max-width:80%; width:300px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.1); transform:scale(0.9); transition:transform 0.2s; display:flex; flex-direction:column; align-items:center; gap:16px;';
            box.innerHTML = `
                <div style="width:48px;height:48px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;color:#16a34a;">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 id="app-popup-msg" style="margin:0; font-size:1.1rem; color:var(--color-text-main); line-height:1.4;"></h3>
            `;
            overlay.appendChild(box);
            document.body.appendChild(overlay);
        }
        document.getElementById('app-popup-msg').innerHTML = msg.replace(/\n/g, '<br>');
        overlay.style.display = 'flex';
        setTimeout(() => { overlay.style.opacity = '1'; overlay.firstElementChild.style.transform = 'scale(1)'; }, 10);
        setTimeout(() => {
            overlay.style.opacity = '0'; overlay.firstElementChild.style.transform = 'scale(0.9)';
            setTimeout(() => { overlay.style.display = 'none'; if(callback) callback(); }, 200);
        }, 1500);
    };

    // --- Dummy Data Initialization ---
    const initializeDummyData = () => {
        // 1. Unified Accounts
        if (!localStorage.getItem('appAccounts')) {
            localStorage.setItem('appAccounts', JSON.stringify([
                { id: 'admin_master', name: '최고 관리자', role: 'admin_master' },
                { id: 'admin_manager', name: '일반운영팀장', role: 'admin_manager' },
                { id: 'admin_biz_2', name: '송도 센트럴카페', role: 'admin_biz' },
                { id: 'admin_biz_3', name: '차이나타운 만다복', role: 'admin_biz' },
                { id: 'admin_biz_4', name: '월미도 전망횟집', role: 'admin_biz' }
            ]));
        }

        // 2. Unified Shops
        if (!localStorage.getItem('bizShops')) {
            localStorage.setItem('bizShops', JSON.stringify([
                { bizId: 'admin_biz_2', name: '송도 센트럴카페', time: '매일 09:00 - 22:00', desc: '센트럴파크 눈부신 뷰가 보이는 스페셜티 커피 전문점입니다.' },
                { bizId: 'admin_biz_3', name: '차이나타운 만다복', time: '매일 11:00 - 21:30', desc: '백년짜장으로 유명한 차이나타운 최고 인증 맛집.' },
                { bizId: 'admin_biz_4', name: '월미도 전망횟집', time: '매일 11:00 - 24:00', desc: '월미도 앞바다가 훤히 보이는 신선한 활어회 한상.' }
            ]));
        }

        // 3. Unified Routes (Force Override once for the user)
        const currentAppData = JSON.parse(localStorage.getItem('offline_app_data') || '{"incheon_routes":[], "incheon_coupons":[], "incheon_gallery":[]}');
        if (!localStorage.getItem('dummyRoutesForcedV2')) {
            localStorage.setItem('dummyRoutesForcedV2', 'true');
            currentAppData.incheon_routes = [
                {
                    id: 101, title: '멋들어진 송도 하루 여행', tag: ['가족여행', '분위기', '사장님추천'], colorClass: 'bg-blue-600', author: 'admin_biz_2',
                    steps: [{ title: '센트럴파크 산책', desc: '보트를 타며 힐링하는 시간' }, { title: '송도 센트럴카페', desc: '경치를 보며 커피 한 잔의 여유' }, { title: '트라이보울 야경', desc: '미래지향적인 건축물 야경 감상' }]
                },
                {
                    id: 102, title: '차이나타운 미식 투어', tag: ['맛집', '데이트', '사장님추천'], colorClass: 'bg-red-700', author: 'admin_biz_3',
                    steps: [{ title: '만다복 백년짜장', desc: '전통 방식 그대로 만든 담백한 짜장면' }, { title: '동화마을 산책', desc: '사진 찍기 좋은 동화 테마 마을' }, { title: '자유공원 노을', desc: '짜장면 먹고 산책 코스로 추천' }]
                },
                {
                    id: 103, title: '월미도 액티비티 바다 여행', tag: ['액티비티', '바다', '사장님추천'], colorClass: 'bg-blue-400', author: 'admin_biz_4',
                    steps: [{ title: '월미 테마파크', desc: '바이킹과 디스코팡팡 타기' }, { title: '월미도 전망횟집', desc: '바다를 보며 즐기는 푸짐한 회' }, { title: '월미 바다열차', desc: '모노레일에서 보는 서해 낙조' }]
                }
            ];
            localStorage.setItem('offline_app_data', JSON.stringify(currentAppData));
        }
    };
    initializeDummyData();

    // --- Data Rendering Logic ---
    window.appData = { incheon_routes: [], incheon_coupons: [], incheon_gallery: [] };
    const getStorage = (key) => window.appData[key] || [];

    const saveToServer = async () => {
        try {
            localStorage.setItem('offline_app_data', JSON.stringify(window.appData));
        } catch(e) { console.error('LocalStorage Save Error - Possibly Quota Exceeded', e); }
        try {
            await fetch('/api/data', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(window.appData) 
            });
        } catch(e) { console.error('Save to Server Error (Offline Mode)', e); }
    };

    const renderRoutes = () => {
        const container = document.getElementById('routes-container');
        if (!container) return;
        const routes = getStorage('incheon_routes');
        if(routes.length === 0) return; // Keep placeholders if empty

        container.innerHTML = routes.map(r => {
            const steps = r.steps && r.steps.length > 0 ? r.steps : [
                { title: '출발', desc: r.desc || '' },
                { title: '경유', desc: '' },
                { title: '도착', desc: '' }
            ];
            
            const stepperHtml = steps.map((s, idx) => `
                <div class="step-item">
                    <div class="step-indicator">
                        <div class="step-circle">${idx + 1}</div>
                        <div class="step-line"></div>
                    </div>
                    <div class="step-content">
                        <h4>${s.title}</h4>
                        <p>${s.desc}</p>
                    </div>
                </div>
            `).join('');

            return `
            <div style="margin-bottom: 40px;">
                <h3 style="margin: 0 0 16px 4px; font-size: 1.4rem; font-weight: 800; color: var(--color-text-main); line-height: 1.3;">
                    ${r.title}
                </h3>
                
                <article class="card route-card" style="padding: 24px; margin-bottom: 16px; position: relative;">
                    <div class="card-content" style="padding: 0; position: relative; z-index: 1;">
                        <div class="route-stepper" style="padding-top: 10px;">
                            ${stepperHtml}
                        </div>
                    </div>
                </article>
                
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-left: 4px;">
                    ${(Array.isArray(r.tag) ? r.tag : [r.tag || '여행']).map(t => `<span class="tag" style="margin-bottom:0;">#${t}</span>`).join('')}
                </div>
            </div>
        `}).join('');
    };

    const renderCoupons = () => {
        const container = document.getElementById('coupons-container');
        if (!container) return;
        const coupons = getStorage('incheon_coupons');
        if(coupons.length === 0) return;

        container.innerHTML = coupons.map((c, i) => {
            return `
            <div class="coupon-card-mini" data-id="${c.id}" onclick="window.showCouponDetail(${c.id}, false)">
                <div class="mini-discount">${c.discount}</div>
                <div class="mini-title">${c.title}</div>
            </div>
        `}).join('');
    };

    window.showCouponDetail = (couponId, isShop = false) => {
        const coupons = getStorage('incheon_coupons') || [];
        const coupon = coupons.find(c => c.id === couponId);
        if (!coupon) return;

        const panelId = isShop ? 'shop-coupon-detail-panel' : 'coupon-detail-panel';
        const panel = document.getElementById(panelId);
        if (!panel) return;

        const shops = JSON.parse(localStorage.getItem('bizShops') || '[]');
        const shop = shops.find(s => s.bizId === coupon.author);
        const shopName = shop ? shop.name : '여행 가게';

        const containerId = isShop ? 'shop-detail-coupons' : 'coupons-container';
        const container = document.getElementById(containerId);
        if (container) {
            container.querySelectorAll('.coupon-card-mini').forEach(el => el.classList.remove('selected'));
            const activeEl = container.querySelector(`[data-id="${couponId}"]`);
            if (activeEl) activeEl.classList.add('selected');
        }

        panel.innerHTML = `
            <div style="border-top: 1px solid var(--color-border); padding-top: 16px; margin-top: 8px; animation: slideDown 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 4px;">${shopName}</div>
                        <div style="font-size: 1rem; font-weight: 700; color: var(--color-text-main); line-height: 1.3;">${coupon.title}</div>
                    </div>
                    <div style="font-size: 1.4rem; font-family: var(--font-title); font-weight: 800; color: var(--color-text-main);">${coupon.discount}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">
                        ~${coupon.date.replace(/-/g, '.')} 까지
                    </div>
                    <button onclick="window.goCouponUse(${coupon.id})" style="background: var(--color-text-main); color: var(--color-surface); border: none; padding: 8px 16px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">쿠폰 사용</button>
                </div>
            </div>
        `;
        
        panel.style.display = 'block';
    };

    const renderGallery = () => {
        const container = document.getElementById('gallery-container');
        if (!container) return;
        const gallery = getStorage('incheon_gallery');
        if(gallery.length === 0) return;

        container.innerHTML = gallery.map(g => `
            <div class="gallery-item ${g.large ? 'h-large' : ''} ${g.img ? '' : g.colorClass}" style="${g.img ? `background-image: url('${g.img}'); background-size: cover; background-position: center;` : ''}" onclick="window.goGalleryDetail(${g.id})">
                <div style="position:absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); z-index:1;"></div>
                <div class="gallery-caption-preview">${g.caption}</div>
            </div>
        `).join('');
    };

    window.goShopDetail = (bizId) => {
        const shops = JSON.parse(localStorage.getItem('bizShops') || '[]');
        const shop = shops.find(s => s.bizId === bizId);
        if (!shop) return;
        
        document.getElementById('shop-detail-title').textContent = shop.name;
        document.getElementById('shop-detail-time').textContent = '영업시간: ' + shop.time;
        document.getElementById('shop-detail-desc').textContent = shop.desc;

        const imgEl = document.getElementById('shop-detail-img');
        if (imgEl) {
            const LOCAL_IMAGES = [
                'images/incheon_chinatown.png',
                'images/songdo_central_park.png',
                'images/wolmido_sunset.png'
            ];
            const imgIndex = [...shop.bizId].reduce((acc, char) => acc + char.charCodeAt(0), 0) % LOCAL_IMAGES.length;
            
            imgEl.innerHTML = '<div style="position:absolute; inset:0; background: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 100%); z-index:1;"></div>';
            imgEl.style.position = 'relative';
            imgEl.style.backgroundImage = `url('${LOCAL_IMAGES[imgIndex]}')`;
            imgEl.style.backgroundSize = 'cover';
            imgEl.style.backgroundPosition = 'center';
            imgEl.style.borderRadius = '8px';
            imgEl.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.1)';
            imgEl.style.overflow = 'hidden';
        }

        
        const couponsContainer = document.getElementById('shop-detail-coupons');
        const allCoupons = getStorage('incheon_coupons') || [];
        const shopCoupons = allCoupons.filter(c => c.author === bizId);
        
        if (shopCoupons.length === 0) {
            couponsContainer.innerHTML = '<div style="padding:24px; text-align:center; background:var(--color-bg); border-radius:8px; color:var(--color-text-muted); font-size:0.9rem;">현재 발급 중인 쿠폰이 없습니다.</div>';
        } else {
            couponsContainer.innerHTML = shopCoupons.map((c, i) => {
                return `
                <div class="coupon-card-mini" data-id="${c.id}" onclick="window.showCouponDetail(${c.id}, true)">
                    <div class="mini-discount">${c.discount}</div>
                    <div class="mini-title">${c.title}</div>
                </div>
                `;
            }).join('');
        }
        
        // Hide panel when swapping shop
        const panel = document.getElementById('shop-coupon-detail-panel');
        if (panel) {
            panel.style.display = 'none';
            panel.innerHTML = '';
        }
        
        window.switchView('shop-detail');
        const appContent = document.getElementById('app-content');
        if (appContent) appContent.scrollTo({ top: 0, behavior: 'auto' });
    };

    const renderHomeShops = () => {
        const container = document.getElementById('home-biz-shops');
        if (!container) return;
        const shops = JSON.parse(localStorage.getItem('bizShops') || '[]');
        if (shops.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:var(--color-text-muted); padding:20px;">등록된 가게가 없습니다.</p>';
            return;
        }
        container.innerHTML = shops.map(s => `
            <div class="card route-card" style="padding:0; margin-bottom:0; cursor:pointer;" onclick="window.goShopDetail('${s.bizId}')">
                <div style="display:flex; align-items:stretch; min-height: 100px;">
                    <div style="width:100px; background:var(--color-bg); flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--color-border); border-right:1px solid var(--color-border);">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    </div>
                    <div style="padding:16px; flex:1;">
                        <h4 style="margin:0 0 6px 0; font-size:1.15rem; color:var(--color-text-main); font-weight:800;">${s.name}</h4>
                        <p style="margin:0 0 8px 0; font-size:0.85rem; color:var(--color-text-muted); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${s.desc}</p>
                        <span style="font-size:0.75rem; background:var(--color-light); color:var(--color-primary); padding:4px 8px; border-radius:4px; font-weight:700; white-space:nowrap; display:inline-block;">운영시간: ${s.time}</span>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const initializeApp = async () => {
        try {
            const res = await fetch('/api/data');
            const data = await res.json();
            if(data) {
                window.appData = data;
                localStorage.setItem('offline_app_data', JSON.stringify(data));
                renderRoutes();
                renderCoupons();
                renderGallery();
                renderHomeShops();
            }
        } catch(e) {
            console.error('API fetch failed, offline fallback', e);
            const offlineBackup = JSON.parse(localStorage.getItem('offline_app_data'));
            if(offlineBackup) window.appData = offlineBackup;
            renderRoutes();
            renderCoupons();
            renderGallery();
            renderHomeShops();
        }
    };
    initializeApp();
});

// --- View Navigation Logic ---
window.goGalleryDetail = (id) => {
    const gallery = window.appData['incheon_gallery'] || [];
    const item = gallery.find(g => g.id === id);
    if(!item) return;
    
    document.getElementById('gallery-detail-img').style.backgroundImage = item.img ? `url('${item.img}')` : '';
    document.getElementById('gallery-detail-img').className = item.img ? '' : item.colorClass;
    document.getElementById('gallery-detail-text').innerText = item.caption;
    
    currentDetailGalleryId = id;
    const actions = document.getElementById('gallery-detail-actions');
    const currentUser = localStorage.getItem('currentUser');
    if (actions) {
        if (currentUser && currentUser === item.author) {
            actions.style.display = 'flex';
        } else {
            actions.style.display = 'none';
        }
    }
    
    window.switchView('gallery-detail');
};

window.goCouponUse = (id) => {
    const coupons = window.appData['incheon_coupons'] || [];
    const coupon = coupons.find(c => c.id === id);
    if(!coupon) return;

    const title = document.getElementById('coupon-use-title');
    const desc = document.getElementById('coupon-use-desc');
    const action = document.getElementById('coupon-use-action');

    title.innerText = coupon.title;
    
    if (coupon.cond === '당일 사용') {
        desc.innerText = "이 쿠폰은 당일 사용만 가능합니다. 지금 바로 사용하시겠습니까?";
        action.innerHTML = `<button class="btn-full" onclick="window.showPopup('쿠폰이 성공적으로 사용되었습니다!', () => window.switchView('coupons'));">사용 확인</button>`;
    } else if (coupon.cond === '장소 방문 인증') {
        desc.innerText = "이 쿠폰은 해당 장소에 방문하여 GPS 위치 인증이 필요합니다.";
        action.innerHTML = `
            <div style="background:var(--color-bg); padding:40px 20px; border-radius:var(--radius-md); margin-bottom:24px; color:var(--color-text-muted);">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:16px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <br>현 위치를 확인합니다.
            </div>
            <button class="btn-full" onclick="window.showPopup('인증 성공!\n쿠폰이 사용되었습니다.', () => window.switchView('coupons'));">현재 위치 인증하기</button>
        `;
    } else if (coupon.cond === '사진 인증') {
        desc.innerText = "이 쿠폰은 현장에서 찍은 사진으로 인증이 필요합니다.";
        action.innerHTML = `
            <div style="background:var(--color-bg); padding:40px 20px; border-radius:var(--radius-md); margin-bottom:24px; color:var(--color-text-muted);">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <br>현장 사진을 업로드해주세요.
            </div>
            <label class="btn-upload" style="padding:16px; font-size:1.1rem;">
                <input type="file" accept="image/*" style="display:none;" onchange="window.showPopup('사진이 업로드되었습니다!\n인증 완료.', () => window.switchView('coupons'));">
                📄 사진 업로드 및 인증
            </label>
        `;
    } else {
        desc.innerText = `${coupon.cond} 조건이 필요합니다.`;
        action.innerHTML = `<button class="btn-full" onclick="window.showPopup('사용되었습니다.', () => window.switchView('coupons'));">확인</button>`;
    }
    
    window.switchView('coupon-use');
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // compress image to avoid payload limits
            const scaleSize = MAX_WIDTH / img.width;
            let w = img.width;
            let h = img.height;
            if (scaleSize < 1) {
                w = w * scaleSize;
                h = h * scaleSize;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = reject;
        img.src = e.target.result;
    };
    reader.onerror = error => reject(error);
});

let editingAppGalleryId = null;
let currentDetailGalleryId = null;

window.openGalleryForm = () => {
    const currentUser = localStorage.getItem('currentUser');
    if(!currentUser) { alert('로그인이 필요한 기능입니다.'); return; }
    editingAppGalleryId = null;
    document.getElementById('app-gallery-form').reset();
    document.getElementById('app-gallery-file-name').textContent = '클릭 또는 터치하여 사진 등록';
    document.getElementById('btn-submit-gallery').textContent = '공유하기';
    document.getElementById('app-gallery-file').removeAttribute('required');
    window.switchView('gallery-form-view');
};

window.cancelGalleryEdit = () => {
    editingAppGalleryId = null;
    window.switchView('gallery');
};

window.editCurrentGallery = () => {
    const gallery = window.appData['incheon_gallery'] || [];
    const item = gallery.find(g => g.id === currentDetailGalleryId);
    if(!item) return;
    editingAppGalleryId = item.id;
    document.getElementById('app-gallery-caption').value = item.caption;
    document.getElementById('app-gallery-file-name').textContent = '사진 변경 (선택)';
    document.getElementById('btn-submit-gallery').textContent = '수정완료';
    document.getElementById('app-gallery-file').removeAttribute('required');
    window.switchView('gallery-form-view');
};

window.deleteCurrentGallery = () => {
    if(confirm('이 기록을 정말 삭제하시겠습니까?')) {
        let gallery = window.appData['incheon_gallery'] || [];
        gallery = gallery.filter(g => g.id !== currentDetailGalleryId);
        window.appData['incheon_gallery'] = gallery;
        saveToServer().then(() => {
            const container = document.getElementById('gallery-container');
            if (container) {
                container.innerHTML = window.appData['incheon_gallery'].map(g => `
                    <div class="gallery-item ${g.large ? 'h-large' : ''} ${g.img ? '' : g.colorClass}" style="${g.img ? `background-image: url('${g.img}'); background-size: cover; background-position: center;` : ''}" onclick="window.goGalleryDetail(${g.id})">
                        <div style="position:absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); z-index:1;"></div>
                        <div class="gallery-caption-preview">${g.caption}</div>
                    </div>
                `).join('');
            }
            window.showPopup('삭제되었습니다.', () => {
                window.switchView('gallery');
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const appGalleryFile = document.getElementById('app-gallery-file');
    if(appGalleryFile) {
        appGalleryFile.addEventListener('change', (e) => {
            const span = document.getElementById('app-gallery-file-name');
            if(e.target.files.length > 0) span.textContent = e.target.files[0].name;
            else span.textContent = '클릭 또는 터치하여 사진 등록';
        });
    }

    const appGalleryForm = document.getElementById('app-gallery-form');
    if(appGalleryForm) {
        appGalleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const fileInput = document.getElementById('app-gallery-file').files[0];
                const isEdit = !!editingAppGalleryId;
                
                if (!isEdit && !fileInput) {
                    window.showPopup('사진을 반드시 첨부해주세요.');
                    return;
                }

                let base64Img = null;
                if(fileInput) {
                    try {
                        base64Img = await fileToBase64(fileInput);
                    } catch(err) {
                        console.error("Canvas resize failed, falling back to raw base64", err);
                        base64Img = await new Promise((res, rej) => {
                            const r = new FileReader(); r.readAsDataURL(fileInput);
                            r.onload = () => res(r.result); r.onerror = rej;
                        });
                    }
                }
                
                let gallery = window.appData['incheon_gallery'] || [];
                if (isEdit) {
                    gallery = gallery.map(g => g.id === editingAppGalleryId ? {
                        ...g,
                        caption: document.getElementById('app-gallery-caption').value,
                        img: base64Img || g.img
                    } : g);
                } else {
                    gallery.unshift({
                        id: Date.now(),
                        caption: document.getElementById('app-gallery-caption').value,
                        img: base64Img,
                        large: false,
                        author: localStorage.getItem('currentUser'),
                        colorClass: ['bg-red', 'bg-green', 'bg-black'][Math.floor(Math.random() * 3)]
                    });
                }
                window.appData['incheon_gallery'] = gallery;
                await saveToServer();
                
                const container = document.getElementById('gallery-container');
                if (container) {
                    container.innerHTML = window.appData['incheon_gallery'].map(g => `
                        <div class="gallery-item ${g.large ? 'h-large' : ''} ${g.img ? '' : g.colorClass}" style="${g.img ? `background-image: url('${g.img}'); background-size: cover; background-position: center;` : ''}" onclick="window.goGalleryDetail(${g.id})">
                            <div style="position:absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); z-index:1;"></div>
                            <div class="gallery-caption-preview">${g.caption}</div>
                        </div>
                    `).join('');
                }

                window.showPopup(isEdit ? '수정되었습니다.' : '공유되었습니다!', () => {
                    window.switchView('gallery');
                });
            } catch (overallError) {
                console.error(overallError);
                window.showPopup('진행 과정에서 알 수 없는 문제가 있었습니다.\n저장은 완료되었을 수 있으니 화면을 새로고침해 주세요.', () => {
                    window.switchView('gallery');
                });
            }
        });
    }
});
