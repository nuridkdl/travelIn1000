const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 image uploads
app.use(express.static(__dirname)); // Serve the static files (index.html, etc)

const defaultDB = {
    incheon_routes: [
        { id: 1, title: '송도 센트럴파크 산책', tag: '도심여행', desc: '이국적인 고층 빌딩 숲 사이로 흐르는 인공 해수로를 따라 걷는 여유로운 하루.', img: null, colorClass: 'bg-blue-100' },
        { id: 2, title: '월미도 테마파크 & 바다', tag: '레트로', desc: '스릴 넘치는 놀이기구와 서해 바다의 일몰이 어우러지는 레트로 감성 여행.', img: null, colorClass: 'bg-blue-200' },
        { id: 3, title: '인천 차이나타운', tag: '미식기행', desc: '한국 속 작은 중국, 붉은빛 거리에서 즐기는 정통 짜장면과 화덕만두.', img: null, colorClass: 'bg-blue-100' }
    ],
    incheon_coupons: [
        { id: 1, title: '차이나타운 카페 음료 할인', discount: '20%', type: '할인', cond: '결제 시 제시 (일부 매장 제외)', date: '2026-12-31' },
        { id: 2, title: '송도 해상보트 탑승권', discount: '10천원', type: '쿠폰', cond: '센트럴파크 보트하우스 전용', date: '2026-10-31' }
    ],
    incheon_gallery: [
        { id: 1, caption: '월미도 앞바다의 붉은 노을. 놀이공원의 불빛과 바다 내음이 섞이는 이 순간은 인천에서만 느낄 수 있는 특별한 감동을 선사합니다. 해 질 녘 관람차를 타며 바라보는 풍경은 그야말로 장관입니다. 연인, 가족 누구와 와도 좋을 완벽한 여행지입니다.', large: true, img: 'images/wolmido_sunset.png', colorClass: 'bg-blue-300', author: 'admin' },
        { id: 2, caption: '차이나타운의 활기찬 거리. 붉은 홍등이 반겨주는 이 거리는 한국 속의 작은 중국을 보여줍니다. 전통 건축물부터 짜장면 박물관, 동화마을에 이르기까지 구석구석 볼거리가 넘치고, 갓 구운 화덕만두의 고소한 냄새가 발걸음을 멈추게 하는 활기찬 공간입니다.', large: false, img: 'images/incheon_chinatown.png', colorClass: 'bg-blue-200', author: 'admin' },
        { id: 3, caption: '송도 센트럴파크의 찬란한 야경. 고속 성장하는 국제도시의 미래지향적인 스카이라인이 공원 호수 위로 반사되어 영화 속 한 장면을 방불케 합니다. 밤이 되면 하나둘 켜지는 불빛 속에서 문보트를 타며 보내는 시간은 아주 황홀하고 낭만적인 추억이 됩니다.', large: false, img: 'images/songdo_central_park.png', colorClass: 'bg-blue-100', author: 'admin' }
    ]
};

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

app.get('/api/data', (req, res) => {
    res.json(readDB());
});

app.post('/api/data', (req, res) => {
    const newData = req.body;
    writeDB(newData);
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[서버 실행 완료] http://localhost:${PORT} 로 접속하세요!`);
    console.log(`[공유 방법] 같은 와이파이(공유기) 내의 기기에서는 이 PC의 IP주소 (예: http://192.168.0.x:3000) 로 접속하여 함께 데이터를 볼 수 있습니다.`);
});
