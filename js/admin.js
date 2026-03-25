document.addEventListener('DOMContentLoaded', () => {
    // --- Auth Guard & RBAC ---
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser || !currentUser.startsWith('admin')) {
        alert('관리자 권한이 필요합니다. 먼저 관리자 계정으로 로그인해주세요.');
        window.location.href = 'login.html';
        return;
    }

    const isMaster = currentUser === 'admin_master';
    const isManager = currentUser === 'admin_manager' || isMaster;
    const isBiz = currentUser && currentUser.startsWith('admin_biz');

    // Apply visual restrictions based on role
    if (isBiz) {
        document.head.insertAdjacentHTML('beforeend', '<style>#tab-members, #tab-auth, #tab-manage-biz { display: none !important; } .btn-delete { display: none !important; }</style>');
        
        // Custom text for Biz Admins
        setTimeout(() => {
            const routeSubTab = document.querySelector('.board-tab[data-sub="sub-route"]');
            if(routeSubTab) routeSubTab.textContent = '내 추천 투어';

            const routeSectionTitle = document.querySelector('#sub-route h3');
            if(routeSectionTitle) {
                routeSectionTitle.innerHTML = '내 가게 추천 투어 관리 <span style="font-size:0.85rem; font-weight:normal; color:var(--color-text-muted);">(추가/수정 전용)</span>';
            }
            const routeSectionDesc = document.querySelector('#sub-route p');
            if(routeSectionDesc) {
                routeSectionDesc.textContent = '가게를 방문하는 손님들을 위한 주변 추천 단기 투어를 직접 기획하고 등록해보세요.';
            }
            
            // Change "관리" to "수정" in the table header since delete is hidden
            const thList = document.querySelectorAll('#sub-route thead th');
            if (thList.length >= 4) thList[3].textContent = '수정';
        }, 50);
    } else if (isManager && !isMaster) {
        document.head.insertAdjacentHTML('beforeend', '<style>#tab-auth, #tab-manage-biz { display: none !important; }</style>');
    }

    // Completely remove 'My Shop' (Biz) tab for non-Biz accounts
    if (!isBiz) {
        const tabBiz = document.getElementById('tab-biz');
        if (tabBiz) tabBiz.remove();
        const subBiz = document.getElementById('sub-biz');
        if (subBiz) subBiz.remove();
    }

    // Role display update
    setTimeout(() => {
        const profileEl = document.getElementById('admin-welcome-msg');
        if(profileEl) {
            const roleNames = { 'admin_master': '최고 관리자', 'admin_manager': '일반 관리자' };
            let displayName = roleNames[currentUser] || '관리자';
            if (isBiz) {
                const shops = JSON.parse(localStorage.getItem('bizShops') || '[]');
                const myShop = shops.find(s => s.bizId === currentUser);
                if (myShop && myShop.name) {
                    profileEl.innerHTML = `<span style="color: var(--color-primary); font-weight: 700;">${myShop.name} 사장님</span>, 환영합니다!`;
                } else {
                    profileEl.innerHTML = `<span style="color: var(--color-primary); font-weight: 700;">사장님</span>, 환영합니다!`;
                }
            } else {
                profileEl.innerHTML = `<span style="color: var(--color-primary); font-weight: 700;">${displayName}</span>님 환영합니다`;
            }
        }
    }, 50);

    // --- Radial Toggle Logic ---
    const radialNav = document.getElementById('radial-nav');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            radialNav.classList.toggle('active');
        });
    }

    if (radialNav) {
        radialNav.addEventListener('click', (e) => {
            if (e.target === radialNav) {
                radialNav.classList.remove('active');
            }
        });
    }

    // --- File Input Name Display Logic ---
    const fileInputs = document.querySelectorAll('.file-input');
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const fileNameSpan = document.getElementById(input.id + '-name');
            if (fileNameSpan && e.target.files.length > 0) {
                fileNameSpan.textContent = e.target.files[0].name;
                fileNameSpan.style.color = 'var(--color-primary)';
            }
        });
    });

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('radial-btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('snsProvider');
            alert('관리자 로그아웃 되었습니다.');
            window.location.href = 'login.html';
        });
    }

    // --- DatePicker Initialization ---
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#coupon-date", {
            locale: "ko",
            dateFormat: "Y-m-d"
        });
    }

    // --- Navigation Logic ---
    const tabs = document.querySelectorAll('.radial-item[data-target]');
    const sections = document.querySelectorAll('.admin-section');
    
    const confirmNavAway = () => {
        if (typeof editingRouteId !== 'undefined' && editingRouteId !== null) {
            return confirm('수정 중인 내용이 저장되지 않습니다. 정말 이동하시겠습니까?');
        }
        if (typeof editingCouponId !== 'undefined' && editingCouponId !== null) {
            return confirm('수정 중인 내용이 저장되지 않습니다. 정말 이동하시겠습니까?');
        }
        return true;
    };

    const appLink = document.getElementById('radial-btn-app');
    if (appLink) {
        appLink.addEventListener('click', (e) => {
            if (!confirmNavAway()) e.preventDefault();
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            if (!confirmNavAway()) return;
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active-section'));
            tab.classList.add('active');
            
            // Auto close radial menu on selection
            const radialNav = document.getElementById('radial-nav');
            if(radialNav) radialNav.classList.remove('active');
            
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-section');
        });
    });
    // --- Sub-Tab (Board) Navigation Logic ---
    const boardTabs = document.querySelectorAll('.board-tab');
    const boardSubs = document.querySelectorAll('.board-sub');

    if (boardTabs.length > 0) {
        boardTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.currentTarget.classList.contains('active')) return;
                if (!confirmNavAway()) return;
                boardTabs.forEach(t => t.classList.remove('active'));
                boardSubs.forEach(s => s.classList.remove('active-sub'));
                
                e.currentTarget.classList.add('active');
                const targetSub = e.currentTarget.getAttribute('data-sub');
                document.getElementById(targetSub).classList.add('active-sub');
            });
        });
    }


    // --- Data Management Logic ---
    let editingRouteId = null;
    let editingCouponId = null;
    let currentRouteTags = [];
    window.appData = { incheon_routes: [], incheon_coupons: [], incheon_gallery: [] };
    
    const getStorage = (key) => window.appData[key] || [];
    const setStorage = async (key, data) => {
        window.appData[key] = data;
        localStorage.setItem('offline_app_data', JSON.stringify(window.appData));
        try {
            await fetch('/api/data', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(window.appData) 
            });
        } catch(e) { console.error('Save to Server Error (Offline Mode)', e); }
    };

    const renderRouteTags = () => {
        const display = document.getElementById('route-tags-display');
        if(!display) return;
        display.innerHTML = currentRouteTags.map((tag, idx) => `
            <span class="route-tag-item">
                ${tag}
                <button type="button" onclick="removeRouteTag(${idx})">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </span>
        `).join('');
    };

    window.removeRouteTag = (idx) => {
        currentRouteTags.splice(idx, 1);
        renderRouteTags();
    };

    // Helper to read image file into Base64
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const btnAddTag = document.getElementById('btn-add-tag');
    const tagInput = document.getElementById('route-tag-input');
    const addNewTag = () => {
        if(!tagInput) return;
        const val = tagInput.value.trim();
        if(val && !currentRouteTags.includes(val)) {
            currentRouteTags.push(val);
            renderRouteTags();
        }
        tagInput.value = '';
    };
    if (btnAddTag) {
        btnAddTag.addEventListener('click', addNewTag);
    }
    if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                addNewTag();
            }
        });
    }

    fetch('/api/data').then(res => res.json())
        .then(data => {
            if(data) {
                window.appData = data;
                localStorage.setItem('offline_app_data', JSON.stringify(data));
            }
            renderAdminRoutes();
            renderAdminCoupons();
        })
        .catch(e => {
            console.error('Server connect failed, offline fallback', e);
            const offlineBackup = JSON.parse(localStorage.getItem('offline_app_data'));
            if(offlineBackup) window.appData = offlineBackup;
            renderAdminRoutes();
            renderAdminCoupons();
            if(isMaster) renderPendingBiz();
        });

    const renderPendingBiz = () => {
        const tbody = document.getElementById('tbody-biz-pending');
        if (!tbody) return;
        const pendingList = JSON.parse(localStorage.getItem('pendingBizList') || '[]');
        if (pendingList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">대기 중인 사장님이 없습니다.</td></tr>';
            return;
        }
        tbody.innerHTML = pendingList.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.date}</td>
                <td>
                    <button class="btn-text" style="color:var(--color-primary); margin-right:8px;" onclick="approveBiz(${item.id})">승인</button>
                    <button class="btn-text btn-delete" onclick="rejectBiz(${item.id})">반려</button>
                </td>
            </tr>
        `).join('');
    };

    window.approveBiz = (id) => {
        if(confirm('이 사장님의 가입을 승인하시겠습니까?')) {
            let pendingList = JSON.parse(localStorage.getItem('pendingBizList') || '[]');
            const biz = pendingList.find(b => b.id === id);
            if (biz) alert(`[${biz.name}] 승인 완료되었습니다.`);
            localStorage.setItem('pendingBizList', JSON.stringify(pendingList.filter(b => b.id !== id)));
            renderPendingBiz();
        }
    };

    window.rejectBiz = (id) => {
        if(confirm('가입을 반려하시겠습니까?')) {
            let pendingList = JSON.parse(localStorage.getItem('pendingBizList') || '[]');
            localStorage.setItem('pendingBizList', JSON.stringify(pendingList.filter(b => b.id !== id)));
            renderPendingBiz();
        }
    };

    // --- Render Admin List (Master) ---
    const renderAdminList = () => {
        const tbody = document.getElementById('tbody-admin-list');
        if (!tbody) return;
        const accounts = JSON.parse(localStorage.getItem('appAccounts') || '[]');
        tbody.innerHTML = accounts.map(acc => {
            const roleLabels = { 'admin_master': '최고', 'admin_manager': '일반', 'admin_biz': '사장님', 'general': '앱유저' };
            const actionBtn = acc.role === 'admin_master' ? '-' : 
                `<button class="btn-text btn-delete" onclick="deleteAccount('${acc.id}')">계정 삭제</button>`;
            return `
                <tr>
                    <td>${acc.id}<br><small style="color:#888;">${acc.name}</small></td>
                    <td>${roleLabels[acc.role] || '알수없음'}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join('');
    };

    window.deleteAccount = (targetId) => {
        if(confirm('해당 계정을 삭제하시겠습니까?')) {
            let accounts = JSON.parse(localStorage.getItem('appAccounts') || '[]');
            accounts = accounts.filter(acc => acc.id !== targetId);
            localStorage.setItem('appAccounts', JSON.stringify(accounts));
            renderAdminList();
            alert('계정이 삭제되었습니다.');
        }
    };

    const renderManageBiz = () => {
        const tbody = document.getElementById('tbody-manage-biz');
        if (!tbody) return;
        const shops = JSON.parse(localStorage.getItem('bizShops') || '[]');
        tbody.innerHTML = shops.map(s => `
            <tr>
                <td><strong>${s.name}</strong><br><small style="color:#888;">${s.bizId}</small></td>
                <td>${s.time}</td>
                <td><small style="color:#888;">${s.desc}</small></td>
                <td><button class="btn-text btn-delete" onclick="deleteBizShop('${s.bizId}')">목록삭제</button></td>
            </tr>
        `).join('');
    };
    
    window.deleteBizShop = (id) => {
        if(confirm('이 가게를 앱 노출 목록에서 삭제하시겠습니까?')) {
            let shops = JSON.parse(localStorage.getItem('bizShops') || '[]');
            localStorage.setItem('bizShops', JSON.stringify(shops.filter(s => s.bizId !== id)));
            renderManageBiz();
        }
    };

    const renderAdminRoutes = () => {
        let routes = getStorage('incheon_routes');
        if (isBiz) {
            routes = routes.filter(r => r.author === currentUser);
        }
        const tbody = document.getElementById('tbody-routes');
        if(!tbody) return;
        tbody.innerHTML = '';
        routes.forEach(route => {
            const tagArray = Array.isArray(route.tag) ? route.tag : (route.tag ? [route.tag] : []);
            const tagsHtml = tagArray.map(t => `<span style="background:var(--color-light); color:var(--color-primary); padding:2px 8px; border-radius:12px; font-size:0.8rem; margin-right:4px; display:inline-block; margin-bottom:4px;">${t}</span>`).join('');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${route.id}</td>
                <td>${tagsHtml}</td>
                <td>${route.title}</td>
                <td>
                    <button class="btn-text btn-edit" style="color:var(--color-primary); margin-right:8px;" onclick="editRoute(${route.id})">수정</button>
                    <button class="btn-text btn-delete" onclick="deleteRoute(${route.id})">삭제</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    const renderRouteStepsInput = (count, stepsData = []) => {
        const container = document.getElementById('route-steps-container');
        if (!container) return;
        let html = '';
        for(let i=1; i<=count; i++) {
            const s = stepsData[i-1] || { title: '', desc: '' };
            const safeTitle = (s.title || '').replace(/"/g, '&quot;');
            html += `
            <div class="step-input-group" style="padding-bottom:12px; border-bottom:1px dashed var(--color-border); ${i === count ? 'border-bottom:none;' : ''}">
                <strong style="display:block; margin-bottom:8px; font-size:0.95rem;">${i}단계</strong>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <input type="text" id="route-step-title-${i}" placeholder="장소명 (예: 센트럴파크역)" value="${safeTitle}" required>
                    <textarea id="route-step-desc-${i}" rows="2" placeholder="해당 장소 설명" required>${s.desc}</textarea>
                </div>
            </div>`;
        }
        container.innerHTML = html;
    };

    const stepCountSelect = document.getElementById('route-step-count');
    if (stepCountSelect) {
        stepCountSelect.addEventListener('change', (e) => {
            const currentCount = document.getElementById('route-steps-container').children.length;
            const stepsData = [];
            for(let i=1; i<=currentCount; i++) {
                stepsData.push({
                    title: document.getElementById(`route-step-title-${i}`)?.value || '',
                    desc: document.getElementById(`route-step-desc-${i}`)?.value || ''
                });
            }
            renderRouteStepsInput(parseInt(e.target.value), stepsData);
        });
    }

    // Global delete for routes (simple implementation)
    window.deleteRoute = (id) => {
        if(confirm('삭제하시겠습니까?')) {
            let routes = getStorage('incheon_routes');
            setStorage('incheon_routes', routes.filter(r => r.id !== id));
            renderAdminRoutes();
        }
    };

    const renderAdminCoupons = () => {
        let coupons = getStorage('incheon_coupons');
        if (isBiz) {
            coupons = coupons.filter(c => c.author === currentUser);
        }
        const tbody = document.getElementById('tbody-coupons');
        if(!tbody) return;
        tbody.innerHTML = '';
        coupons.forEach(coupon => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${coupon.id}</td>
                <td><strong>${coupon.discount}</strong></td>
                <td>${coupon.title}</td>
                <td>
                    <button class="btn-text btn-edit" style="color:var(--color-primary); margin-right:8px;" onclick="editCoupon(${coupon.id})">수정</button>
                    <button class="btn-text btn-delete" onclick="deleteCoupon(${coupon.id})">삭제</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.deleteCoupon = (id) => {
        if(confirm('삭제하시겠습니까?')) {
            let coupons = getStorage('incheon_coupons');
            setStorage('incheon_coupons', coupons.filter(c => c.id !== id));
            renderAdminCoupons();
        }
    };

    window.editRoute = (id) => {
        if (editingRouteId && editingRouteId !== id) {
            if (!confirm('수정 중인 내용이 저장되지 않습니다. 정말 이동하시겠습니까?')) return;
        }
        const routes = getStorage('incheon_routes');
        const route = routes.find(r => r.id === id);
        if(!route) return;
        editingRouteId = id;
        currentRouteTags = Array.isArray(route.tag) ? [...route.tag] : (route.tag ? [route.tag] : []);
        renderRouteTags();
        document.getElementById('route-title').value = route.title;
        let steps = route.steps;
        if (!steps || steps.length === 0) {
            steps = [{ title: '출발', desc: route.desc || '' }, { title: '경유', desc: '' }, { title: '도착', desc: '' }];
        }
        const countSelect = document.getElementById('route-step-count');
        countSelect.value = Math.min(Math.max(steps.length, 3), 5);
        renderRouteStepsInput(parseInt(countSelect.value), steps);

        document.getElementById('form-route-title').textContent = '여행경로 수정';
        document.getElementById('btn-submit-route').textContent = '수정 완료';
    };
    window.cancelRouteEdit = () => {
        editingRouteId = null;
        currentRouteTags = [];
        renderRouteTags();
        document.getElementById('form-route').reset();
        document.getElementById('route-step-count').value = '3';
        renderRouteStepsInput(3);
        document.getElementById('form-route-title').textContent = '신규 여행경로 등록';
        document.getElementById('btn-submit-route').textContent = '등록하기';
    };
    window.editCoupon = (id) => {
        if (editingCouponId && editingCouponId !== id) {
            if (!confirm('수정 중인 내용이 저장되지 않습니다. 정말 이동하시겠습니까?')) return;
        }
        const coupons = getStorage('incheon_coupons');
        const coupon = coupons.find(c => c.id === id);
        if(!coupon) return;
        editingCouponId = id;
        document.getElementById('coupon-discount').value = coupon.discount;
        document.getElementById('coupon-title').value = coupon.title;
        document.getElementById('coupon-cond').value = coupon.cond;
        document.getElementById('coupon-date').value = coupon.date;
        document.getElementById('form-coupon-title').textContent = '쿠폰 수정';
        document.getElementById('btn-submit-coupon').textContent = '수정 완료';
        
        const dateInput = document.getElementById('coupon-date');
        if (dateInput && dateInput._flatpickr) {
            dateInput._flatpickr.setDate(coupon.date);
        }
    };
    window.cancelCouponEdit = () => {
        editingCouponId = null;
        document.getElementById('form-coupon').reset();
        
        const dateInput = document.getElementById('coupon-date');
        if (dateInput && dateInput._flatpickr) {
            dateInput._flatpickr.clear();
        }

        document.getElementById('form-coupon-title').textContent = '신규 쿠폰 등록';
        document.getElementById('btn-submit-coupon').textContent = '등록하기';
    };

    // init step fields on load
    renderRouteStepsInput(3);

    // Handle Forms
    document.getElementById('form-route').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const countSelect = document.getElementById('route-step-count');
        const count = countSelect ? parseInt(countSelect.value) : 3;
        const stepsData = [];
        for(let i=1; i<=count; i++) {
            stepsData.push({
                title: document.getElementById(`route-step-title-${i}`).value,
                desc: document.getElementById(`route-step-desc-${i}`).value
            });
        }

        let routes = getStorage('incheon_routes');
        if (editingRouteId) {
            routes = routes.map(r => r.id === editingRouteId ? {
                ...r,
                title: document.getElementById('route-title').value,
                tag: [...currentRouteTags],
                steps: stepsData
            } : r);
            alert('경로가 수정되었습니다.');
        } else {
            const newTagList = [...currentRouteTags];
            if (isBiz && !newTagList.includes('사장님추천')) newTagList.push('사장님추천');
            routes.push({
                id: Date.now(),
                title: document.getElementById('route-title').value,
                tag: newTagList,
                steps: stepsData,
                colorClass: isBiz ? 'bg-green-700' : 'bg-blue-' + (Math.floor(Math.random() * 3) + 1) + '00',
                author: currentUser
            });
            alert('경로가 등록되었습니다.');
        }
        setStorage('incheon_routes', routes);
        cancelRouteEdit();
        renderAdminRoutes();
    });

    document.getElementById('form-coupon').addEventListener('submit', (e) => {
        e.preventDefault();
        let coupons = getStorage('incheon_coupons');
        if (editingCouponId) {
            coupons = coupons.map(c => c.id === editingCouponId ? {
                ...c,
                discount: document.getElementById('coupon-discount').value,
                title: document.getElementById('coupon-title').value,
                cond: document.getElementById('coupon-cond').value,
                date: document.getElementById('coupon-date').value
            } : c);
            alert('쿠폰이 수정되었습니다.');
        } else {
            coupons.push({
                id: Date.now(),
                discount: document.getElementById('coupon-discount').value,
                title: document.getElementById('coupon-title').value,
                cond: document.getElementById('coupon-cond').value,
                date: document.getElementById('coupon-date').value,
                author: currentUser
            });
            alert('쿠폰이 등록되었습니다.');
        }
        setStorage('incheon_coupons', coupons);
        cancelCouponEdit();
        renderAdminCoupons();
    });

    // --- Dummy Data Initialization & Shop Manage ---
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
            if (window.appData) window.appData.incheon_routes = currentAppData.incheon_routes;
        }

        if (!localStorage.getItem('dummyCouponsForcedV1')) {
            localStorage.setItem('dummyCouponsForcedV1', 'true');
            
            let accounts = JSON.parse(localStorage.getItem('appAccounts') || '[]');
            if (!accounts.find(a => a.id === 'admin_biz')) {
                accounts.unshift({ id: 'admin_biz', name: '명동칼국수', role: 'admin_biz' });
                localStorage.setItem('appAccounts', JSON.stringify(accounts));
            }
            
            let shops = JSON.parse(localStorage.getItem('bizShops') || '[]');
            if (!shops.find(s => s.bizId === 'admin_biz')) {
                shops.unshift({ bizId: 'admin_biz', name: '명동칼국수', time: '매일 10:00 - 21:00', desc: '40년 전통의 깊은 맛을 자랑하는 명동칼국수입니다.' });
                localStorage.setItem('bizShops', JSON.stringify(shops));
            }

            currentAppData.incheon_coupons = [
                { id: 201, title: '식사 주문 시 왕만두 2알 서비스', discount: '만두', type: '증정', cond: '당일 사용', date: '2026-12-31', author: 'admin_biz' },
                { id: 202, title: '전체 결제 금액 10% 현장 할인 (2인 이상)', discount: '10%', type: '할인', cond: '장소 방문 인증', date: '2026-12-31', author: 'admin_biz' },
                { id: 203, title: '시원한 캔음료 1병 무료 제공', discount: '음료', type: '증정', cond: '사진 인증', date: '2026-12-31', author: 'admin_biz' }
            ];
            
            localStorage.setItem('offline_app_data', JSON.stringify(currentAppData));
            if (window.appData) window.appData.incheon_coupons = currentAppData.incheon_coupons;
        }
    };
    initializeDummyData();

    if (isMaster) {
        renderAdminList();
        renderManageBiz();
        
        const formCreateAdmin = document.getElementById('form-create-admin');
        if (formCreateAdmin) {
            formCreateAdmin.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('new-admin-id').value;
                const name = document.getElementById('new-admin-name').value;
                const role = document.getElementById('new-admin-role').value;
                
                let accounts = JSON.parse(localStorage.getItem('appAccounts') || '[]');
                if (accounts.find(a => a.id === id)) {
                    alert('이미 존재하는 계정 ID 입니다.');
                    return;
                }
                accounts.push({ id, name, role });
                localStorage.setItem('appAccounts', JSON.stringify(accounts));
                alert('새로운 기획/운영 관리자 계정이 생성되었습니다.');
                formCreateAdmin.reset();
                renderAdminList();
            });
        }
    }

    if (isBiz) {
        const formBizInfo = document.getElementById('form-biz-info');
        if (formBizInfo) {
            const shops = JSON.parse(localStorage.getItem('bizShops') || '[]');
            const myShop = shops.find(s => s.bizId === currentUser);
            if (myShop) {
                document.getElementById('my-biz-name-input').value = myShop.name;
                document.getElementById('my-biz-time-input').value = myShop.time;
                document.getElementById('my-biz-desc-input').value = myShop.desc;
            }

            formBizInfo.addEventListener('submit', (e) => {
                e.preventDefault();
                let bizShops = JSON.parse(localStorage.getItem('bizShops') || '[]');
                const newShopData = {
                    bizId: currentUser,
                    name: document.getElementById('my-biz-name-input').value,
                    time: document.getElementById('my-biz-time-input').value,
                    desc: document.getElementById('my-biz-desc-input').value
                };
                bizShops = bizShops.filter(s => s.bizId !== currentUser);
                bizShops.push(newShopData);
                localStorage.setItem('bizShops', JSON.stringify(bizShops));
                alert('내 가게 정보가 성공적으로 반영되었습니다.');
            });
        }
    }
});
