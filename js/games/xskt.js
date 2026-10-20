registerGame('XSKT (GĐB)', {
    numCount: 6,
    maxNum: 99,
    desc: "Nhập/Copy Giải Đặc Biệt XSKT (mỗi dòng 6 chữ số cách nhau bằng khoảng trắng hoặc dấu gạch).",
    placeholder: "Ví dụ:\n5 8 2 9 1 4\n0 4 9 1 8 2",
    regex: /\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b/g,
    parseMatch: function(match) {
        return [match[1], match[2], match[3], match[4], match[5], match[6]].map(n => n.padStart(2, '0'));
    }
});