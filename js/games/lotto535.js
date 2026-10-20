registerGame('LOTTO 5/35', {
    numCount: 5, // LOTTO CHỈ CÓ 5 BÓNG
    desc: "Nhập kết quả Lotto 5/35 mỗi dòng 5 số cách nhau bằng khoảng trắng.",
    placeholder: "05 12 21 28 35\n02 11 19 24 33",
    regex: /\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b[\s\-\,\|_]+?\b(\d{1,2})\b/g,
    parseMatch: function(match) {
        return [match[1], match[2], match[3], match[4], match[5]].map(n => n.padStart(2, '0'));
    }
});