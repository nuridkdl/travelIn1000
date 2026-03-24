document.addEventListener('DOMContentLoaded', () => {
    // --- Auth Guard ---
    if (localStorage.getItem('currentUser') !== 'admin') {
        alert('관리자 권한이 필요합니다. 먼저 관리자 계정(admin)으로 로그인해주세요.');
        window.location.href = 'login.html';
        return;
    }

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
        });

    const renderAdminRoutes = () => {
        const routes = getStorage('incheon_routes');
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
                    <button class="btn-text" style="color:var(--color-primary); margin-right:8px;" onclick="editRoute(${route.id})">수정</button>
                    <button class="btn-text" onclick="deleteRoute(${route.id})">삭제</button>
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
        const coupons = getStorage('incheon_coupons');
        const tbody = document.getElementById('tbody-coupons');
        if(!tbody) return;
        tbody.innerHTML = '';
        coupons.forEach(coupon => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${coupon.id}</td>
                <td><span style="display:inline-block; padding:2px 8px; background:var(--color-light); color:var(--color-primary); border-radius:4px; font-size:0.8rem; margin-right:6px;">${coupon.type}</span><strong>${coupon.discount}</strong></td>
                <td>${coupon.title}</td>
                <td>
                    <button class="btn-text" style="color:var(--color-primary); margin-right:8px;" onclick="editCoupon(${coupon.id})">수정</button>
                    <button class="btn-text" onclick="deleteCoupon(${coupon.id})">삭제</button>
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
        document.getElementById('coupon-type').value = coupon.type;
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
            routes.push({
                id: Date.now(),
                title: document.getElementById('route-title').value,
                tag: [...currentRouteTags],
                steps: stepsData,
                colorClass: 'bg-blue-' + (Math.floor(Math.random() * 3) + 1) + '00'
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
                type: document.getElementById('coupon-type').value,
                title: document.getElementById('coupon-title').value,
                cond: document.getElementById('coupon-cond').value,
                date: document.getElementById('coupon-date').value
            } : c);
            alert('쿠폰이 수정되었습니다.');
        } else {
            coupons.push({
                id: Date.now(),
                discount: document.getElementById('coupon-discount').value,
                type: document.getElementById('coupon-type').value,
                title: document.getElementById('coupon-title').value,
                cond: document.getElementById('coupon-cond').value,
                date: document.getElementById('coupon-date').value
            });
            alert('쿠폰이 등록되었습니다.');
        }
        setStorage('incheon_coupons', coupons);
        cancelCouponEdit();
        renderAdminCoupons();
    });
});
