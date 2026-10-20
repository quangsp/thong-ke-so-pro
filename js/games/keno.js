registerGame('KENO', {
    numCount: 6, // Hiển thị 6 số ưu tiên hoặc chỉnh thành 20 tùy ý
    desc: "Dán kết quả Keno vào đây. Tự trích xuất 6 số đầu tiên.",
    placeholder: "Ví dụ: 01 12 34 45 67 78...",
    regex: /\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b/g,
    parseMatch: function(match) {
        return [match[1], match[2], match[3], match[4], match[5], match[6]].map(n => n.padStart(2, '0'));
    }
});