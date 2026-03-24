document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const appContent = document.getElementById('app-content');

    window.switchView = (targetId) => {
        navItems.forEach(item => item.classList.remove('active'));
        views.forEach(view => view.classList.remove('active-view'));

        const activeNavItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');

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
        if (currentUser === 'admin') {
            if (mypageName) mypageName.innerHTML = '관리자 님';
            if (mypageRole) {
                mypageRole.textContent = '최고 관리자';
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

    // --- Data Rendering Logic ---
    window.appData = { incheon_routes: [], incheon_coupons: [], incheon_gallery: [] };
    const getStorage = (key) => window.appData[key] || [];

    window.mascotCache = {};
    const floodFillWhiteBg = (src) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const w = canvas.width = img.width;
            const h = canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;
            
            const getIdx = (x, y) => (y * w + x) * 4;
            const match = (x, y) => {
                if(x<0 || x>=w || y<0 || y>=h) return false;
                const i = getIdx(x, y);
                return data[i]>240 && data[i+1]>240 && data[i+2]>240 && data[i+3]>0;
            };
            
            const stack = [[0,0]];
            while(stack.length > 0) {
                const [x, y] = stack.pop();
                const i = getIdx(x, y);
                if(data[i+3] === 0) continue; 
                if(match(x, y)) {
                    data[i+3] = 0;
                    if(x>0) stack.push([x-1, y]);
                    if(x<w-1) stack.push([x+1, y]);
                    if(y>0) stack.push([x, y-1]);
                    if(y<h-1) stack.push([x, y+1]);
                }
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(src);
        img.src = src;
    });

    const preloadMascots = async () => {
        const mascots = [
            'incheon_seal_mascot.png', 'mascot_seagull.png', 
            'mascot_dolphin.png', 'mascot_turtle.png', 'mascot_crab.png'
        ];
        for (const m of mascots) {
            if (!window.mascotCache[m]) window.mascotCache[m] = await floodFillWhiteBg(m);
        }
    };

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
            
            const mascotData = [
                { char: 'incheon_seal_mascot.png', bg: 'bg_seal_complex.png' },
                { char: 'mascot_seagull.png', bg: 'bg_seagull_complex.png' },
                { char: 'mascot_dolphin.png', bg: 'bg_dolphin_complex.png' },
                { char: 'mascot_turtle.png', bg: 'bg_turtle_complex.png' },
                { char: 'mascot_crab.png', bg: 'bg_crab_complex.png' }
            ];
            const activeData = mascotData[r.id % mascotData.length];
            const rawMascot = activeData.char;
            const mascot = window.mascotCache[rawMascot] || rawMascot;
            const bgImage = activeData.bg;
            
            let extraStyle = '';
            // Flip the bird (seagull) to face right
            if (mascot === 'mascot_seagull.png') {
                extraStyle += '--mascot-dir: -1; ';
            }
            // Enlarge the crab
            if (mascot === 'mascot_crab.png') {
                extraStyle += 'width: 120px; height: 120px; top: -110px; ';
            }
            
            const stepperHtml = steps.map((s, idx) => `
                <div class="step-item">
                    <div class="step-indicator">
                        ${idx === 0 ? `<img src="${mascot}" class="walking-character" alt="동물 캐릭터" style="${extraStyle}">` : ''}
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
                
                <article class="card route-card" style="padding: 24px; overflow: visible; margin-bottom: 16px; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 8px 16px rgba(0,0,0,0.06); position: relative;">
                    <!-- Background Layer bounded directly to border limits -->
                    <div style="position: absolute; inset: 0; border-radius: var(--radius-md); overflow: hidden; z-index: 0;">
                        <div style="position: absolute; inset: 0; background-image: url('${bgImage}'); background-size: cover; background-position: center 20%;"></div>
                        <!-- Subtle Gradient Overlay to keep text legible at bottom without masking sky -->
                        <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.95) 75%, rgba(255,255,255,1) 100%);"></div>
                    </div>
                    
                    <div class="card-content" style="padding: 0; position: relative; z-index: 1;">
                        <div class="route-stepper">
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

        let isOutline = false;
        container.innerHTML = coupons.map((c, i) => {
            isOutline = !isOutline; // alternate styles
            return `
            <div class="coupon-card">
                <div class="coupon-left ${isOutline ? 'outline' : ''}">
                    <div class="discount">${c.discount}</div>
                    <div class="type">${c.type}</div>
                </div>
                <div class="coupon-right">
                    <h4>${c.title}</h4>
                    <p>${c.cond}</p>
                    <span class="expiry">~ ${c.date.replace(/-/g, '.')} 까지</span>
                    <button class="btn-download" onclick="window.goCouponUse(${c.id})">사용하기</button>
                </div>
            </div>
        `}).join('');
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

    const initializeApp = async () => {
        try { await preloadMascots(); } catch(e) { console.error('Mascot preload error', e); }
        try {
            const res = await fetch('/api/data');
            const data = await res.json();
            if(data) {
                window.appData = data;
                localStorage.setItem('offline_app_data', JSON.stringify(data));
            }
        } catch(e) {
            console.error('Server connect failed, offline fallback', e);
            const offlineBackup = JSON.parse(localStorage.getItem('offline_app_data'));
            if(offlineBackup) window.appData = offlineBackup;
        }
        renderRoutes();
        renderCoupons();
        renderGallery();
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
                        colorClass: 'bg-blue-' + (Math.floor(Math.random() * 3) + 1) + '00'
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
