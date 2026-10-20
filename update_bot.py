import json
import os
import re
import time
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
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

GAME_CONFIGS = {
    "MEGA 6/45": 6,
    "POWER 6/55": 6,  # Lấy đúng 6 số chính, cắt bỏ hoàn toàn số phụ phía sau
    "MAX 3D PRO": 6,
    "KENO": 5,        # Keno chuẩn 5 vị trí
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
        if not data[game_name] or data[game_name][0] != standardized_result:
            data[game_name].insert(0, standardized_result)
            save_data(data)
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ Cập nhật thành công {game_name}: {standardized_result}")
            return True
    return False

def fetch_result_from_web(game_name):
    try:
        url = "https://www.minhngoc.net.vn/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # (Thay thế đoạn cào HTML thực tế của bạn trả về chuỗi thô)
        raw_text_from_web = "" 
        
        return parse_raw_result_string(game_name, raw_text_from_web)
    except Exception as e:
        print(f"Lỗi cào web {game_name}: {e}")
        return None

def smart_update_task(game_name, max_retries=4, delay_minutes=2):
    print(f"\n[BẮT ĐẦU QUÉT] Đang tìm kết quả mới cho: {game_name} lúc {datetime.now().strftime('%H:%M:%S')}")
    
    for attempt in range(1, max_retries + 1):
        print(f"  -> Lần thử {attempt}/{max_retries}...")
        result = fetch_result_from_web(game_name)
        
        if result:
            if add_new_draw_safely(game_name, result):
                print(f"🎉 Đã lấy và cập nhật thành công kết quả mới cho {game_name}!")
                return True
        else:
            print(f"  ⏳ Chưa có kết quả từ nhà đài.")
        
        if attempt < max_retries:
            print(f"  ⏳ Đang chờ {delay_minutes} phút để quét lại...")
            time.sleep(delay_minutes * 60)
            
    print(f"❌ Đã thử {max_retries} lần nhưng nhà đài chưa cập nhật xong kỳ mới cho {game_name}.")
    return False

if __name__ == "__main__":
    print("🤖 Bot tự động quét lặp lại liên tục đã khởi động an toàn!")
    
    last_keno_minute = -1
    
    while True:
        now = datetime.now()
        current_time_str = now.strftime("%H:%M")
        current_minute = now.minute
        current_weekday = now.weekday() # 0: Thứ 2 -> 6: Chủ Nhật
        
        # 1. KENO: Quay liên tục cả ngày (Quét mỗi 10 phút)
        if current_minute % 10 == 0 and current_minute != last_keno_minute:
            smart_update_task("KENO", max_retries=2, delay_minutes=1)
            last_keno_minute = current_minute

        # 2. LOTTO 5/35: Quay 2 lần/ngày (Trưa và Tối)
        elif current_time_str in ["13:30", "13:35"]:
            smart_update_task("LOTTO 5/35", max_retries=3, delay_minutes=2)
            time.sleep(60)
        elif current_time_str in ["21:30", "21:35"]:
            smart_update_task("LOTTO 5/35", max_retries=3, delay_minutes=2)
            time.sleep(60)

        # 3. XSKT: Quét dồn các mốc sau 18:30 (18:35, 18:38, 18:41)
        elif current_time_str in ["18:35", "18:38", "18:41"]:
            smart_update_task("XSKT (GĐB)", max_retries=3, delay_minutes=2)
            time.sleep(60)

        # 4. KHUNG GIỜ VÀNG CÁC GAME VIETLOTT (Quay lúc 18:30 -> Bot quét từ 18:35 lặp liên tục)
        # Max 3D Pro: Thứ 2, 4, 6
        elif current_weekday in [0, 2, 4] and current_time_str in ["18:35", "18:38", "18:41"]:
            smart_update_task("MAX 3D PRO", max_retries=3, delay_minutes=2)
            time.sleep(60)

        # Power 6/55: Thứ 3, 5, 7
        elif current_weekday in [1, 3, 5] and current_time_str in ["18:35", "18:38", "18:41"]:
            smart_update_task("POWER 6/55", max_retries=3, delay_minutes=2)
            time.sleep(60)

        # Mega 6/45: Thứ 4, 6, Chủ Nhật
        elif current_weekday in [2, 4, 6] and current_time_str in ["18:35", "18:38", "18:41"]:
            smart_update_task("MEGA 6/45", max_retries=3, delay_minutes=2)
            time.sleep(60)

        time.sleep(20)