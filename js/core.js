const GameRegistry = {
    'MEGA 6/45': {
        numCount: 6,
        maxVal: 45,
        type: 'vietlott',
        desc: "Copy thẳng từ Web bất kỳ. Thuật toán tự trích xuất các hàng chứa 6 số.",
        placeholder: "Ví dụ: Kỳ quay #1024 - Kết quả: 14 - 18 - 21 - 38 - 48 - 52"
    },
    'POWER 6/55': {
        numCount: 6,
        maxVal: 55,
        type: 'vietlott',
        desc: "Copy thẳng từ Web bất kỳ. Thuật toán tự trích xuất các hàng chứa 6 số.",
        placeholder: "Ví dụ: Kỳ quay #1024 - Kết quả: 14 - 18 - 21 - 38 - 48 - 52"
    },
    'MAX 3D PRO': {
        numCount: 6,
        maxVal: 99,
        type: 'vietlott',
        desc: "Nhập tay kết quả Max 3D Pro, mỗi dòng 6 số cách nhau bằng khoảng trắng.",
        placeholder: "0 5 4 5 9 6\n4 4 8 9 5 9"
    },
    'KENO': {
        numCount: 6,
        maxVal: 80,
        type: 'vietlott',
        desc: "Dán kết quả Keno vào đây. Tự trích xuất 6 số đầu tiên.",
        placeholder: "Ví dụ: 01 12 34 45 67 78..."
    },
    'LOTTO 5/35': {
        numCount: 5,
        maxVal: 35,
        type: 'vietlott',
        desc: "Nhập kết quả Lotto 5/35 mỗi dòng 5 số cách nhau bằng khoảng trắng.",
        placeholder: "05 12 21 28 35\n02 11 19 24 33"
    },
    'XSKT (GĐB)': {
        numCount: 6,
        maxVal: 9,
        type: 'xskt',
        desc: "Nhập/Copy Giải Đặc Biệt XSKT (mỗi dòng 6 chữ số cách nhau bằng khoảng trắng hoặc dấu gạch).",
        placeholder: "Ví dụ:\n5 8 2 9 1 4\n0 4 9 1 8 2"
    }
};

let savedData = {};
let currentGame = "";
let currentView = "home"; 
let currentPos = 1;
let appData = [];
let currentChartMode = 'tail';

async function loadServerData() {
    try {
        const response = await fetch('data.json?t=' + new Date().getTime());
        if (response.ok) {
            savedData = await response.json();
        } else {
            savedData = JSON.parse(localStorage.getItem('vietlott_saved_data')) || {};
        }
    } catch (e) {
        savedData = JSON.parse(localStorage.getItem('vietlott_saved_data')) || {};
    }
    updateHomeCounts();
}

window.addEventListener('DOMContentLoaded', () => {
    loadServerData();
});

function updateHomeCounts() {
    Object.keys(GameRegistry).forEach(gameId => {
        const key = gameId.toLowerCase().replace(/[\/\s\(\)]/g, '-');
        const count = savedData[gameId] ? savedData[gameId].length : 0;
        const el = document.getElementById(`count-${key.split('-')[0]}`);
        if(el) el.innerText = count + ' kỳ';
    });
}

function openGameMenu(gameId) {
    if (!GameRegistry[gameId]) return;
    currentGame = gameId;
    appData = savedData[gameId] || [];
    currentView = "menu";

    const homeView = document.getElementById('homeView');
    const gameMenuView = document.getElementById('gameMenuView');
    if (homeView) homeView.style.display = 'none';
    if (gameMenuView) gameMenuView.style.display = 'block';
    
    ['chartView', 'tailAnalysisView', 'oddEvenAnalysisView', 'dausoAnalysisView', 'amduongAnalysisView'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
    
    const btnBack = document.getElementById('btnBack');
    if (btnBack) btnBack.style.display = 'flex';
    
    const menuGameTitle = document.getElementById('menuGameTitle');
    if (menuGameTitle) menuGameTitle.innerText = `🎮 TÍNH NĂNG THỐNG KÊ: ${currentGame}`;
    
    const modalDesc = document.getElementById('modalDesc');
    if (modalDesc) modalDesc.innerText = GameRegistry[currentGame].desc;
    
    const dataInput = document.getElementById('dataInput');
    if (dataInput) dataInput.placeholder = GameRegistry[currentGame].placeholder;

    const btnTail = document.getElementById('btnChartTail');
    const btnFull = document.getElementById('btnChartFull');
    if (GameRegistry[currentGame].type === 'xskt') {
        if(btnTail) btnTail.innerText = "📊 Biểu đồ";
        if(btnFull) btnFull.innerText = "📈 Biểu đồ lên xuống";
    } else {
        if(btnTail) btnTail.innerText = "📊 Biểu Đồ Số Đuôi";
        if(btnFull) btnFull.innerText = "📈 Biểu Đồ Số Đầy Đủ";
    }
}

function showFeature(featureName) {
    const gameMenuView = document.getElementById('gameMenuView');
    if (gameMenuView) gameMenuView.style.display = 'none';
    
    if (featureName === 'chart') {
        currentView = "chart";
        document.getElementById('chartView').style.display = 'block';
        document.getElementById('currentGameTitle').innerText = `📊 ĐANG PHÂN TÍCH BIỂU ĐỒ: ${currentGame}`;
        checkDataState();
    } else if (featureName === 'tail') {
        currentView = "tail";
        document.getElementById('tailAnalysisView').style.display = 'block';
        renderTailAnalysis();
    } else if (featureName === 'oddeven') {
        currentView = "oddeven";
        document.getElementById('oddEvenAnalysisView').style.display = 'block';
        renderOddEvenAnalysis();
    } else if (featureName === 'dauso') {
        currentView = "dauso";
        document.getElementById('dausoAnalysisView').style.display = 'block';
        renderDauSoAnalysis();
    } else if (featureName === 'amduong') {
        currentView = "amduong";
        document.getElementById('amduongAnalysisView').style.display = 'block';
        renderAmDuongAnalysis();
    }
}

function handleBack() {
    if (['chart', 'tail', 'oddeven', 'dauso', 'amduong'].includes(currentView)) {
        openGameMenu(currentGame);
    } else if (currentView === 'menu') {
        goHome();
    }
}

function goHome() {
    currentView = "home";
    ['chartView', 'tailAnalysisView', 'oddEvenAnalysisView', 'dausoAnalysisView', 'amduongAnalysisView', 'gameMenuView'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
    const btnBack = document.getElementById('btnBack');
    if (btnBack) btnBack.style.display = 'none';
    const homeView = document.getElementById('homeView');
    if (homeView) homeView.style.display = 'block';
    updateHomeCounts();
}

function checkDataState() {
    if(appData.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('analysisContent').style.display = 'none';
    } else {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('analysisContent').style.display = 'block';
        currentPos = 1; renderTabs(); drawChart();
    }
}

function openModal() { document.getElementById('modal').style.display = 'flex'; }
function closeModal() { document.getElementById('modal').style.display = 'none'; }

function processData() {
    const rawText = document.getElementById('dataInput').value;
    if(!rawText.trim()) return;

    const gameConfig = GameRegistry[currentGame] || { numCount: 6, type: 'vietlott' };
    const numCount = gameConfig.numCount;
    let parsed = [];
    const lines = rawText.split('\n');

    lines.forEach(line => {
        if (!line.trim()) return;
        let cleanLine = line.trim();

        if (gameConfig.type === 'xskt') {
            let digitsOnly = cleanLine.replace(/\D/g, '');
            if (digitsOnly.length >= numCount) {
                let targetDigits = digitsOnly.slice(-numCount).split('');
                parsed.push(targetDigits);
            }
        } else {
            cleanLine = cleanLine.replace(/T\d,?\s*\d{1,2}\/\d{1,2}\/\d{4}/gi, '');
            cleanLine = cleanLine.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '');
            cleanLine = cleanLine.replace(/\d{1,3}(\.\d{3})+/g, '');
            let foundPairs = cleanLine.match(/\b\d{2}\b/g) || cleanLine.match(/\b\d{1,2}\b/g);
            if (foundPairs && foundPairs.length >= numCount) {
                let targetBalls = foundPairs.slice(0, numCount).map(n => n.padStart(2, '0'));
                parsed.push(targetBalls);
            }
        }
    });

    if(parsed.length === 0) { 
        alert(`Không tìm thấy kết quả hợp lệ cho ${currentGame}! Vui lòng kiểm tra lại định dạng.`); 
        return; 
    }
    
    parsed.reverse();
    appData = parsed; 
    savedData[currentGame] = appData; 
    localStorage.setItem('vietlott_saved_data', JSON.stringify(savedData));

    closeModal(); 
    document.getElementById('dataInput').value = ''; 
    
    if(currentView === 'chart') checkDataState();
    else if(currentView === 'tail') renderTailAnalysis();
    else if(currentView === 'oddeven') renderOddEvenAnalysis();
    else if(currentView === 'dauso') renderDauSoAnalysis();
    else if(currentView === 'amduong') renderAmDuongAnalysis();
}

function clearCurrentGameData() {
    if(confirm(`Xóa toàn bộ dữ liệu kỳ quay của [${currentGame}]?`)) {
        appData = [];
        savedData[currentGame] = [];
        localStorage.setItem('vietlott_saved_data', JSON.stringify(savedData));
        closeModal();
        
        if(currentView === 'chart') checkDataState();
        else if(currentView === 'tail') renderTailAnalysis();
        else if(currentView === 'oddeven') renderOddEvenAnalysis();
        else if(currentView === 'dauso') renderDauSoAnalysis();
        else if(currentView === 'amduong') renderAmDuongAnalysis();
    }
}

function switchChartType(mode) {
    currentChartMode = mode;
    const btnFull = document.getElementById('btnChartFull');
    const btnTail = document.getElementById('btnChartTail');
    const boxFull = document.getElementById('containerChartFull');
    const boxTail = document.getElementById('containerChartTail');

    if (mode === 'tail') {
        if(btnTail) btnTail.className = "btn btn-primary";
        if(btnFull) btnFull.className = "btn";
        if(boxTail) boxTail.style.display = "block";
        if(boxFull) boxFull.style.display = "none";
    } else {
        if(btnTail) btnTail.className = "btn";
        if(btnFull) btnFull.className = "btn btn-primary";
        if(boxTail) boxTail.style.display = "none";
        if(boxFull) boxFull.style.display = "block";
    }
    drawChart();
}

function renderTabs() {
    const tabsDiv = document.getElementById('posTabs'); tabsDiv.innerHTML = '';
    const numCount = (GameRegistry[currentGame] && GameRegistry[currentGame].numCount) ? GameRegistry[currentGame].numCount : 6;
    tabsDiv.style.gridTemplateColumns = `repeat(${numCount}, 1fr)`;
    for(let i=1; i<=numCount; i++) {
        const div = document.createElement('div');
        div.className = `tab ${currentPos === i ? 'active' : ''}`;
        div.onclick = () => { currentPos = i; renderTabs(); drawChart(); };
        div.innerHTML = `<h4>VỊ TRÍ ${i}</h4><p>(Số ${i})</p>`; 
        tabsDiv.appendChild(div);
    }
}

function drawChart() {
    if(appData.length === 0) return;
    const gameConfig = GameRegistry[currentGame] || {};
    if (gameConfig.type === 'xskt' && currentChartMode === 'full') {
        drawChartUpDownXS();
    } else if (currentChartMode === 'full') {
        drawChartFull();
    } else {
        drawChartTail();
    }
}

function drawChartUpDownXS() {
    document.getElementById('chartTitleFull').innerText = `BIỂU ĐỒ LÊN XUỐNG CHỮ SỐ GĐB - ${currentGame}`;
    const svg = document.getElementById('svgChartFull'); svg.innerHTML = '';
    const yAxis = document.getElementById('yAxisFull'); yAxis.innerHTML = '';

    const height = 200;
    const nodeSpacing = 35;
    let totalNodes = 0;
    appData.forEach(draw => totalNodes += draw.length);
    const width = Math.max(850, totalNodes * nodeSpacing);
    svg.style.width = width + 'px';

    for(let i=0; i<=9; i++) {
        const yPos = height - (i * (height / 9));
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 0); line.setAttribute("y1", yPos); line.setAttribute("x2", width); line.setAttribute("y2", yPos);
        line.setAttribute("class", "grid-line"); svg.appendChild(line);

        const lbl = document.createElement('span');
        lbl.className = 'y-label'; lbl.innerText = i;
        yAxis.appendChild(lbl);
    }

    let points = [], nodeIdx = 0, htmlTaiXiu = '', htmlChanLe = '', htmlKhoangCach = '', prevVal = null;

    appData.forEach((draw) => {
        draw.forEach((digitStr) => {
            const val = parseInt(digitStr, 10);
            const isTai = val >= 5;
            const isChan = val % 2 === 0;

            htmlTaiXiu += `<div class="mini-ball ${isTai ? 'ball-tai' : 'ball-xiu'}">${isTai ? 'T' : 'X'}</div>`;
            htmlChanLe += `<div class="mini-ball ${isChan ? 'ball-chan-do' : 'ball-le-trang'}">${isChan ? 'C' : 'L'}</div>`;

            if (prevVal !== null) {
                const diff = val - prevVal;
                let stepClass = 'step-flat', sign = '';
                if (diff > 0) { stepClass = 'step-up'; sign = '+'; }
                else if (diff < 0) { stepClass = 'step-down'; }
                htmlKhoangCach += `<div class="mini-step ${stepClass}">${sign}${diff}</div>`;
            } else {
                htmlKhoangCach += `<div class="mini-step step-flat">-</div>`;
            }
            prevVal = val;

            const yPos = height - (val * (height / 9));
            points.push({ x: 20 + (nodeIdx * nodeSpacing), y: yPos, val });
            nodeIdx++;
        });
    });

    document.getElementById('boxTaiXiuFull').innerHTML = htmlTaiXiu;
    document.getElementById('boxChanLeFull').innerHTML = htmlChanLe;
    document.getElementById('boxKhoangCachFull').innerHTML = htmlKhoangCach;

    if(points.length > 1) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let d = `M ${points[0].x} ${points[0].y}`;
        for(let i=1; i<points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
        path.setAttribute("d", d); path.setAttribute("fill", "none"); path.setAttribute("stroke", "#fbbf24"); path.setAttribute("stroke-width", "2.5");
        svg.appendChild(path);
    }

    points.forEach(pt => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x); circle.setAttribute("cy", pt.y); circle.setAttribute("r", 10);
        circle.setAttribute("fill", "#fbbf24"); circle.setAttribute("stroke", "#fff"); circle.setAttribute("stroke-width", "1.5");

        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", pt.x); txt.setAttribute("y", pt.y + 3.5); txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("fill", "#000"); txt.setAttribute("font-size", "10px"); txt.setAttribute("font-weight", "bold");
        txt.textContent = pt.val;

        g.appendChild(circle); g.appendChild(txt); svg.appendChild(g);
    });

    const scrollFull = document.getElementById('scrollFull');
    if (scrollFull) scrollFull.scrollLeft = scrollFull.scrollWidth;
}

function drawChartFull() {
    document.getElementById('chartTitleFull').innerText = `BIỂU ĐỒ SỐ ĐẦY ĐỦ - VỊ TRÍ ${currentPos}`;
    const svg = document.getElementById('svgChartFull'); svg.innerHTML = '';
    const yAxis = document.getElementById('yAxisFull'); yAxis.innerHTML = '';

    let maxVal = (GameRegistry[currentGame] && GameRegistry[currentGame].maxVal) ? GameRegistry[currentGame].maxVal : 45;
    const nodeSpacing = 45; 
    const width = Math.max(850, appData.length * nodeSpacing);
    svg.style.width = width + 'px'; 
    const height = 220;

    const steps = 5;
    for(let i=0; i<=steps; i++) {
        const val = Math.round((maxVal / steps) * i);
        const yPos = height - (i * (height / steps));
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 0); line.setAttribute("y1", yPos); line.setAttribute("x2", width); line.setAttribute("y2", yPos);
        line.setAttribute("class", "grid-line"); svg.appendChild(line);

        const lbl = document.createElement('span');
        lbl.className = 'y-label';
        lbl.innerText = val;
        yAxis.appendChild(lbl);
    }

    let points = [], htmlTaiXiu = '', htmlChanLe = '', htmlKhoangCach = '', prevNum = null;

    appData.forEach((draw, index) => {
        const rawVal = draw[currentPos - 1];
        const fullNum = (rawVal !== undefined && rawVal !== null) ? parseInt(rawVal, 10) : 1;
        const unitNum = fullNum % 10;
        const isTai = unitNum >= 5;
        const isChan = fullNum % 2 === 0;

        htmlTaiXiu += `<div class="mini-ball ${isTai ? 'ball-tai' : 'ball-xiu'}">${isTai ? 'T' : 'X'}</div>`;
        htmlChanLe += `<div class="mini-ball ${isChan ? 'ball-chan-do' : 'ball-le-trang'}">${isChan ? 'C' : 'L'}</div>`;

        if (prevNum !== null) {
            const diff = fullNum - prevNum;
            let stepClass = 'step-flat', sign = '';
            if (diff > 0) { stepClass = 'step-up'; sign = '+'; }
            else if (diff < 0) { stepClass = 'step-down'; }
            htmlKhoangCach += `<div class="mini-step ${stepClass}">${sign}${diff}</div>`;
        } else {
            htmlKhoangCach += `<div class="mini-step step-flat">-</div>`;
        }
        prevNum = fullNum;

        const yPos = height - ((fullNum / maxVal) * height);
        points.push({ x: 30 + (index * nodeSpacing), y: Math.max(12, Math.min(height - 12, yPos)), fullNum, index: index+1 });
    });

    document.getElementById('boxTaiXiuFull').innerHTML = htmlTaiXiu;
    document.getElementById('boxChanLeFull').innerHTML = htmlChanLe;
    document.getElementById('boxKhoangCachFull').innerHTML = htmlKhoangCach;

    if(points.length > 1) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let d = `M ${points[0].x} ${points[0].y}`;
        for(let i=1; i<points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
        path.setAttribute("d", d); path.setAttribute("fill", "none"); path.setAttribute("stroke", "#fbbf24"); path.setAttribute("stroke-width", "2.5");
        svg.appendChild(path);
    }

    points.forEach(pt => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x); circle.setAttribute("cy", pt.y); circle.setAttribute("r", 15);
        circle.setAttribute("fill", "#151e32");
        circle.setAttribute("stroke", "#fbbf24"); circle.setAttribute("stroke-width", "2");

        const txtNum = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtNum.setAttribute("x", pt.x); txtNum.setAttribute("y", pt.y + 4.5); txtNum.setAttribute("text-anchor", "middle");
        txtNum.setAttribute("fill", "#fff"); txtNum.setAttribute("font-size", "10px"); txtNum.setAttribute("font-weight", "bold");
        txtNum.textContent = pt.fullNum < 10 ? '0' + pt.fullNum : pt.fullNum;

        const txtIndex = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtIndex.setAttribute("x", pt.x); txtIndex.setAttribute("y", pt.y - 18); txtIndex.setAttribute("text-anchor", "middle");
        txtIndex.setAttribute("fill", "#94a3b8"); txtIndex.setAttribute("font-size", "9px");
        txtIndex.textContent = `K #${pt.index}`;

        g.appendChild(circle); g.appendChild(txtNum); g.appendChild(txtIndex); svg.appendChild(g);
    });

    const scrollFull = document.getElementById('scrollFull');
    if (scrollFull) scrollFull.scrollLeft = scrollFull.scrollWidth;
}

function drawChartTail() {
    document.getElementById('chartTitleTail').innerText = `BIỂU ĐỒ SỐ ĐUÔI - VỊ TRÍ ${currentPos}`;
    const svg = document.getElementById('svgChartTail'); svg.innerHTML = '';
    const nodeSpacing = 38; const width = Math.max(850, appData.length * nodeSpacing);
    svg.style.width = width + 'px'; const height = 200;

    for(let i=0; i<=9; i++) {
        const yPos = height - (i * (height/9));
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 0); line.setAttribute("y1", yPos); line.setAttribute("x2", width); line.setAttribute("y2", yPos);
        line.setAttribute("class", "grid-line"); svg.appendChild(line);
    }

    const yMid = height - (4.5 * (height/9));
    const divider = document.createElementNS("http://www.w3.org/2000/svg", "line");
    divider.setAttribute("x1", 0); divider.setAttribute("y1", yMid); divider.setAttribute("x2", width); divider.setAttribute("y2", yMid);
    divider.setAttribute("class", "divider-line"); svg.appendChild(divider);

    let points = [], htmlTaiXiu = '', htmlChanLe = '', htmlKhoangCach = '', prevUnit = null;

    appData.forEach((draw, index) => {
        const rawVal = draw[currentPos - 1];
        const fullNum = (rawVal !== undefined && rawVal !== null) ? parseInt(rawVal, 10) : 0;
        const unitNum = Math.abs(fullNum) % 10;
        const isTai = unitNum >= 5;
        const isChan = unitNum % 2 === 0;

        htmlTaiXiu += `<div class="mini-ball ${isTai ? 'ball-tai' : 'ball-xiu'}">${isTai ? 'T' : 'X'}</div>`;
        htmlChanLe += `<div class="mini-ball ${isChan ? 'ball-chan-do' : 'ball-le-trang'}">${isChan ? 'C' : 'L'}</div>`;

        if (prevUnit !== null) {
            const diff = unitNum - prevUnit;
            let stepClass = 'step-flat', sign = '';
            if (diff > 0) { stepClass = 'step-up'; sign = '+'; }
            else if (diff < 0) { stepClass = 'step-down'; }
            htmlKhoangCach += `<div class="mini-step ${stepClass}">${sign}${diff}</div>`;
        } else {
            htmlKhoangCach += `<div class="mini-step step-flat">-</div>`;
        }
        prevUnit = unitNum;

        points.push({ x: 20 + (index * nodeSpacing), y: height - (unitNum * (height/9)), unitNum, fullNum, isTai, index: index+1 });
    });

    document.getElementById('boxTaiXiuTail').innerHTML = htmlTaiXiu;
    document.getElementById('boxChanLeTail').innerHTML = htmlChanLe;
    document.getElementById('boxKhoangCachTail').innerHTML = htmlKhoangCach;

    if(points.length > 1) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let d = `M ${points[0].x} ${points[0].y}`;
        for(let i=1; i<points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
        path.setAttribute("d", d); path.setAttribute("fill", "none"); path.setAttribute("stroke", "#fbbf24"); path.setAttribute("stroke-width", "2");
        svg.appendChild(path);
    }

    points.forEach(pt => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x); circle.setAttribute("cy", pt.y); circle.setAttribute("r", 10);
        circle.setAttribute("fill", pt.isTai ? "#ef4444" : "#3b82f6");
        circle.setAttribute("stroke", "#fff"); circle.setAttribute("stroke-width", "1.5");

        const txtUnit = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtUnit.setAttribute("x", pt.x); txtUnit.setAttribute("y", pt.y + 3.5); txtUnit.setAttribute("text-anchor", "middle");
        txtUnit.setAttribute("fill", "#fff"); txtUnit.setAttribute("font-size", "10px"); txtUnit.setAttribute("font-weight", "bold");
        txtUnit.textContent = pt.unitNum;

        const txtFull = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtFull.setAttribute("x", pt.x); txtFull.setAttribute("y", pt.y - 14); txtFull.setAttribute("text-anchor", "middle");
        txtFull.setAttribute("fill", "#94a3b8"); txtFull.setAttribute("font-size", "9px");
        txtFull.textContent = `[${pt.fullNum < 10 ? '0'+pt.fullNum : pt.fullNum}]`;

        g.appendChild(circle); g.appendChild(txtUnit); g.appendChild(txtFull); svg.appendChild(g);
    });

    const scrollTail = document.getElementById('scrollTail');
    if (scrollTail) scrollTail.scrollLeft = scrollTail.scrollWidth;
}

function renderTailAnalysis() {
    const searchVal = document.getElementById('tailSearchInput').value.trim();
    const searchTokens = searchVal ? searchVal.split(/[\s\,]+/) : [];
    const resultsContainer = document.getElementById('tailSearchResults');

    if(resultsContainer) resultsContainer.innerHTML = ''; 
    
    if (appData.length === 0) {
        if(resultsContainer) resultsContainer.innerHTML = '<div style="color:#94a3b8; font-size:11px;">Chưa có dữ liệu kỳ quay nào được nạp.</div>';
        return;
    }

    const totalCount = appData.length;
    [...appData].reverse().forEach((draw, rIdx) => {
        const origIdx = totalCount - 1 - rIdx;
        const tails = draw.map(num => parseInt(num, 10) % 10);
        let isMatch = true;

        if (searchTokens.length > 0) {
            isMatch = searchTokens.some(token => {
                const cleanToken = token.padStart(2, '0');
                const lastDigit = parseInt(token, 10) % 10;
                return draw.includes(cleanToken) || tails.includes(lastDigit);
            });
        }

        const row = document.createElement('div');
        row.className = `draw-row ${!isMatch ? 'dimmed' : ''}`;
        let ballsHTML = draw.map((num, i) => {
            const tail = tails[i];
            const isTarget = searchTokens.some(t => t.padStart(2, '0') === num || parseInt(t, 10) % 10 === tail);
            return `<div class="num-ball ${isTarget ? 'matched' : ''}">${num}</div>`;
        }).join('');

        row.innerHTML = `<span>Kỳ #${origIdx + 1} [Đuôi: ${tails.join(' ')}]</span><div class="draw-balls">${ballsHTML}</div>`;
        if(resultsContainer) resultsContainer.appendChild(row);
    });
}

function renderOddEvenAnalysis() {
    const historyEl = document.getElementById('oddEvenHistoryList');
    const evenListEl = document.getElementById('matrixEvenList');
    const oddListEl = document.getElementById('matrixOddList');

    if (evenListEl) evenListEl.innerHTML = '<div style="color:#ef4444; font-weight:bold; font-size:11px;">TẬP HỢP CHẴN: 0 - 2 - 4 - 6 - 8</div>';
    if (oddListEl) oddListEl.innerHTML = '<div style="color:#38bdf8; font-weight:bold; font-size:11px;">TẬP HỢP LẺ: 1 - 3 - 5 - 7 - 9</div>';
    if(historyEl) historyEl.innerHTML = '';

    if (appData.length === 0) {
        if(historyEl) historyEl.innerHTML = '<div style="color:#94a3b8; font-size:11px;">Chưa có dữ liệu kỳ quay.</div>';
        return;
    }

    const totalCount = appData.length;
    [...appData].reverse().forEach((draw, rIdx) => {
        const origIdx = totalCount - 1 - rIdx;
        const evens = draw.filter(n => parseInt(n, 10) % 2 === 0);
        const odds = draw.filter(n => parseInt(n, 10) % 2 !== 0);

        const row = document.createElement('div');
        row.className = 'draw-row';
        row.innerHTML = `
            <span>Kỳ #${origIdx + 1} [Dãy: ${draw.join(' ')}]</span>
            <div>
                <span style="color:#38bdf8; font-weight:bold;">Lẻ (${odds.length}): ${odds.join(', ') || 'Không'}</span> | 
                <span style="color:#ef4444; font-weight:bold;">Chẵn (${evens.length}): ${evens.join(', ') || 'Không'}</span>
            </div>
        `;
        if(historyEl) historyEl.appendChild(row);
    });
}

function renderDauSoAnalysis() {
    const limitVal = document.getElementById('dauKyLimitSelect').value;
    const suggEl = document.getElementById('dausoSuggestions');
    const historyEl = document.getElementById('dausoHistoryList');

    if(suggEl) suggEl.innerHTML = ''; 
    if(historyEl) historyEl.innerHTML = '';
    
    if (appData.length === 0) {
        if(historyEl) historyEl.innerHTML = '<div style="color:#94a3b8; font-size:11px;">Chưa có dữ liệu kỳ quay.</div>';
        return;
    }

    const numCount = (GameRegistry[currentGame] && GameRegistry[currentGame].numCount) ? GameRegistry[currentGame].numCount : 6;
    let targetData = appData;
    if (limitVal !== 'all') {
        const limit = parseInt(limitVal, 10);
        targetData = appData.slice(Math.max(0, appData.length - limit));
    }

    const posAppearedTails = Array.from({length: numCount}, () => new Set());
    targetData.forEach(draw => {
        draw.forEach((numStr, pIdx) => {
            if(pIdx < numCount) {
                const val = parseInt(numStr, 10);
                const tail = val % 10;
                posAppearedTails[pIdx].add(tail);
            }
        });
    });

    for(let p=0; p<numCount; p++) {
        let missingTails = [];
        for(let d=0; d<=9; d++) {
            if(!posAppearedTails[p].has(d)) {
                missingTails.push(`Đuôi ${d}`);
            }
        }
        const item = document.createElement('div');
        item.className = 'dauso-sugg-item';
        item.innerHTML = `
            <b style="color:#fbbf24">Vị trí số ${p+1}:</b><br>
            <span style="color:${missingTails.length > 0 ? '#ef4444' : '#10b981'}">
                ${missingTails.join(', ') || '🎉 Đã đủ đuôi 0-9!'}
            </span>
        `;
        if(suggEl) suggEl.appendChild(item);
    }

    const totalCount = appData.length;
    [...appData].reverse().forEach((draw, rIdx) => {
        const origIdx = totalCount - 1 - rIdx;
        const tails = draw.map(n => parseInt(n, 10) % 10);
        const row = document.createElement('div');
        row.className = 'draw-row';
        row.innerHTML = `<span>Kỳ #${origIdx + 1}</span><span style="color:#94a3b8; font-size:11px; font-family:monospace;">Đuôi từng vị trí: ${tails.join(' - ')} (Dãy: ${draw.join(' ')})</span>`;
        if(historyEl) historyEl.appendChild(row);
    });
}

function renderAmDuongAnalysis() {
    const historyEl = document.getElementById('amduongHistoryList');
    if(historyEl) historyEl.innerHTML = '';

    if (appData.length < 2) {
        if(historyEl) historyEl.innerHTML = '<div style="color:#94a3b8; font-size:11px;">Cần ít nhất 2 kỳ quay để tính khoảng cách chênh lệch.</div>';
        return;
    }

    let rows = [];
    for (let i = 1; i < appData.length; i++) {
        const prev = appData[i-1];
        const curr = appData[i];
        
        const diffs = curr.map((digit, idx) => {
            const currentVal = parseInt(digit, 10);
            const prevVal = prev[idx] !== undefined ? parseInt(prev[idx], 10) : currentVal;
            const diff = currentVal - prevVal;
            return (diff > 0 ? `+${diff}` : `${diff}`);
        });

        rows.push(`
            <div class="draw-row">
                <span>Kỳ #${i} ➔ #${i+1}</span>
                <span style="font-family:monospace; color:#34d399; font-weight:bold; font-size:12px;">${diffs.join('    ')}</span>
                <span style="color:#94a3b8; font-size:10px;">(${prev.join(' ')} ➔ ${curr.join(' ')})</span>
            </div>
        `);
    }

    if(historyEl) historyEl.innerHTML = rows.reverse().join('');
}