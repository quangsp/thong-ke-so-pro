registerGame('MAX 3D PRO', {
    numCount: 6,
    desc: "Nhập tay kết quả Max 3D Pro, mỗi dòng 6 số cách nhau bằng khoảng trắng.",
    placeholder: "0 5 4 5 9 6\n4 4 8 9 5 9",
    regex: /\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b/g,
    parseMatch: function(match) {
        return [match[1], match[2], match[3], match[4], match[5], match[6]].map(n => n.padStart(2, '0'));
    }
});