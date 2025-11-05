
# Web Trackpad & Keyboard — FINAL (Thanetphon026) | TH/EN

ควบคุมเมาส์และแป้นพิมพ์ของคอมพิวเตอร์ผ่านหน้าเว็บในเครือข่ายเดียวกัน (ไม่แชร์หน้าจอ) ทำงานลื่นขึ้นด้วยการ **รวมเหตุการณ์ผ่าน requestAnimationFrame** เพื่อลดแพ็กเก็ตและเรนเดอร์เนียน

Control your PC’s mouse & keyboard over LAN via a web page (no screen streaming). **rAF-based event coalescing** makes input smoother with fewer packets.

---

## 🇹🇭 วิธีใช้งาน
```bash
pip install -r requirements.txt
python app.py
# มือถือ/โน้ตบุ๊คเปิด: http://<IP_คอมปลายทาง>:5000
```
- Windows/macOS/Linux ใช้ได้ (Linux แนะนำ Xorg หาก Wayland ไม่รับอินพุต)
- ครั้งแรก: Windows อนุญาต Firewall / macOS ให้สิทธิ์ Accessibility

### ตั้งค่าความไวเมาส์/สกอลล์ (ENV)
ค่าเริ่มต้น: `MOVE_SPEED=1.0`, `SCROLL_SPEED=1.0`  
ปรับโดยตั้ง **Environment Variables** ก่อนรัน `app.py`

**Windows (Command Prompt):**
```cmd
set MOVE_SPEED=1.3
set SCROLL_SPEED=1.2
python app.py
```

**Windows (PowerShell):**
```powershell
$env:MOVE_SPEED="1.3"
$env:SCROLL_SPEED="1.2"
python app.py
```

**macOS / Linux (bash/zsh):**
```bash
export MOVE_SPEED=1.3
export SCROLL_SPEED=1.2
python app.py
```

> คำแนะนำ: เริ่มจาก 1.0 แล้วไล่เพิ่มทีละ 0.1 จนได้ความลื่นตามต้องการ

### ตั้งค่าพอร์ตเซิร์ฟเวอร์ (ENV)
ค่าเริ่มต้น: `PORT=5000`  
ถ้าพอร์ตชน หรืออยากเปลี่ยน ให้ตั้ง `PORT` ก่อนรัน

**Windows (Command Prompt):**
```cmd
set PORT=8080
python app.py
# เข้าใช้งาน: http://<IP_คอมปลายทาง>:8080
```

**Windows (PowerShell):**
```powershell
$env:PORT="8080"
python app.py
# เข้าใช้งาน: http://<IP_คอมปลายทาง>:8080
```

**macOS / Linux:**
```bash
export PORT=8080
python app.py
# เข้าใช้งาน: http://<IP_PC>:8080
```

---

## 🇬🇧 How to run
```bash
pip install -r requirements.txt
python app.py
# from phone/laptop: http://<PC_IP>:5000
```
- Works on Windows/macOS/Linux (prefer Xorg on Linux if Wayland blocks input)

### Mouse/Scroll Sensitivity (ENV)
Defaults: `MOVE_SPEED=1.0`, `SCROLL_SPEED=1.0`

**Windows (CMD):**
```cmd
set MOVE_SPEED=1.3
set SCROLL_SPEED=1.2
python app.py
```

**Windows (PowerShell):**
```powershell
$env:MOVE_SPEED="1.3"
$env:SCROLL_SPEED="1.2"
python app.py
```

**macOS / Linux:**
```bash
export MOVE_SPEED=1.3
export SCROLL_SPEED=1.2
python app.py
```

> Tip: start at 1.0 and adjust by 0.1 until it feels right.

### Server Port (ENV)
Default: `PORT=5000` — set a new port if needed:

**Windows (CMD):**
```cmd
set PORT=8080
python app.py
# open: http://<PC_IP>:8080
```

**Windows (PowerShell):**
```powershell
$env:PORT="8080"
python app.py
# open: http://<PC_IP>:8080
```

**macOS / Linux:**
```bash
export PORT=8080
python app.py
# open: http://<PC_IP>:8080
```

---

## Features
- Trackpad (move/scroll only) + **L/R click** buttons
- 10-key grid: Esc / Tab / Enter / Backspace / Keyboard, Arrows, Context
- **Quick Actions** (⋮): Copy, Paste, Cut, Select All, Undo/Redo, Screenshot/Snip, Hold Ctrl/Shift



**License:** 
“© 2025 พัฒนาโดย Thanetphon026”
© 2025 Thanetphon026
