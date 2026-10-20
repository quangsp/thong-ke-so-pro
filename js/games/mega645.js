registerGame('MEGA 6/45', {
    numCount: 6,
    desc: "Copy thẳng từ Web bất kỳ. Thuật toán tự trích xuất các hàng chứa 6 số.",
    placeholder: "Ví dụ: Kỳ quay #1024 - Kết quả: 14 - 18 - 21 - 38 - 48 - 52",
    regex: /\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b/g,
    parseMatch: function(match) {
        return [match[1], match[2], match[3], match[4], match[5], match[6]].map(n => n.padStart(2, '0'));
    }
});