import json
import os
import re
from datetime import datetime
import requests
from bs4 import BeautifulSoup

DATA_FILE = "data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "MEGA 6/45": [],
        "POWER 6/55": [],
        "MAX 3D PRO": [],
        "KENO": [],
        "LOTTO 5/35": [],
        "XSKT (GĐB)": []
    }

def save_data(data):
    # Ép từng dãy số nằm gọn trên một dòng ngang phẳng lỳ, giữ nguyên form đẹp mắt
    formatted_lines = []
    for game_name, draws in data.items():
        if not draws:
            formatted_lines.append(f'    "{game_name}": []')
        else:
            draws_str = ",\n        ".join([json.dumps(draw, ensure_ascii=False) for draw in draws])
            formatted_lines.append(f'    "{game_name}": [\n        {draws_str}\n    ]')
    
    final_json = "{\n" + ",\n".join(formatted_lines) + "\n}"
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(final_json)

GAME_CONFIGS = {
    "MEGA 6/45": 6,
    "POWER 6/55": 6,  # Lấy đúng 6 số chính, cắt bỏ hoàn toàn số phụ phía sau
    "MAX 3D PRO": 6,
    "LOTTO 5/35": 6,  # 5 số chính + 1 số đặc biệt ở cuối
    "XSKT (GĐB)": 6
}

def parse_raw_result_string(game_name, raw_string):
    if not raw_string:
        return None
        
    line = str(raw_string)
    
    # Xóa bỏ ngày tháng năm ở đầu dòng
    clean_line = re.sub(r'T\d,?\s*\d{1,2}/\d{1,2}/\d{4}', '', line, flags=re.IGNORECASE)
    clean_line = re.sub(r'\d{1,2}/\d{1,2}/\d{4}', '', clean_line)
    
    # Xóa bỏ chuỗi tiền thưởng lớn có dấu chấm
    clean_line = re.sub(r'\d{1,3}(\.\d{3})+', '', clean_line)
    
    # Quét các số có 2 chữ số từ trái sang phải
    found_numbers = re.findall(r'\b\d{2}\b', clean_line)
    expected_count = GAME_CONFIGS.get(game_name, 6)

    if found_numbers and len(found_numbers) >= expected_count:
        target_balls = found_numbers[:expected_count]
        return [num.zfill(2) for num in target_balls]
        
    return None

def add_new_draw_safely(game_name, raw_string):
    standardized_result = parse_raw_result_string(game_name, raw_string)
    if not standardized_result:
        return False
        
    data = load_data()
    if game_name in data:
        # Kiểm tra nếu mảng trống hoặc phần tử CUỐI CÙNG khác với kết quả mới (tránh trùng lặp với dữ liệu thủ công dưới đáy)
        if not data[game_name] or data[game_name][-1] != standardized_result:
            data[game_name].append(standardized_result)  # Dùng append để đẩy kỳ mới xuống cuối mảng
            save_data(data)
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ Cập nhật thành công {game_name} (xuống cuối): {standardized_result}")
            return True
        else:
            print(f"ℹ️ {game_name} đã ở trạng thái mới nhất, không có kỳ quay mới.")
    return False

def fetch_result_from_web(game_name):
    try:
        # Ánh xạ tên game với đường dẫn tương ứng trên ketquadientoan.com
        game_slugs = {
            "MEGA 6/45": "tat-ca-ky-xo-so-mega-6-45.html",
            "POWER 6/55": "tat-ca-ky-xo-so-power-6-55.html",
            "MAX 3D PRO": "tat-ca-ky-xo-so-max-3d-pro.html",
            "LOTTO 5/35": "tat-ca-ky-xo-so-lotto-5-35.html",
            "XSKT (GĐB)": "ket-qua-xo-so-mien-bac.html"
        }
        
        slug = game_slugs.get(game_name)
        if not slug:
            return None
            
        url = f"https://www.ketquadientoan.com/{slug}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Lọc ra các dòng dữ liệu thực tế (có chứa thẻ <td>), bỏ qua dòng tiêu đề của bảng
        data_rows = soup.find_all('tr')
        valid_rows = [row for row in data_rows if row.find('td')]
        
        if valid_rows:
            # Lấy dòng dữ liệu đầu tiên trên web (kỳ mới nhất)
            raw_text_from_web = valid_rows[0].get_text(separator=" ")
        else:
            raw_text_from_web = soup.get_text(separator=" ")
        
        return parse_raw_result_string(game_name, raw_text_from_web)
    except Exception as e:
        print(f"Lỗi cào web {game_name}: {e}")
        return None

def run_scheduled_tasks():
    now = datetime.now()
    current_weekday = now.weekday() # 0: Thứ 2 -> 6: Chủ Nhật
    print(f"\n🤖 [GITHUB ACTION] Bot bắt đầu quét dữ liệu lúc: {now.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Quét XSKT & LOTTO 5/35 (Diễn ra hằng ngày)
    print("-> Đang kiểm tra XSKT và Lotto 5/35...")
    add_new_draw_safely("XSKT (GĐB)", fetch_result_from_web("XSKT (GĐB)"))
    add_new_draw_safely("LOTTO 5/35", fetch_result_from_web("LOTTO 5/35"))
    
    # 2. Max 3D Pro: Thứ 2, 4, 6
    if current_weekday in [0, 2, 4]:
        print("-> Đang kiểm tra lịch quay Max 3D Pro...")
        add_new_draw_safely("MAX 3D PRO", fetch_result_from_web("MAX 3D PRO"))

---- # 3. Power 6/55: Thứ 3, 5, 7
    if current_weekday in [1, 3, 5]:
        print("-> Đang kiểm tra lịch quay Power 6/55...")
        add_new_draw_safely("POWER 6/55", fetch_result_from_web("POWER 6/55"))

    # 4. Mega 6/45: Thứ 4, 6, Chủ Nhật
    if current_weekday in [2, 4, 6]:
        print("-> Đang kiểm tra lịch quay Mega 6/45...")
        add_new_draw_safely("MEGA 6/45", fetch_result_from_web("MEGA 6/45"))

if __name__ == "__main__":
    run_scheduled_tasks()
