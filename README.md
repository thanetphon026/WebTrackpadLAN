
# Web Trackpad & Keyboard — FINAL (Thanetphon026) | TH/EN

ควบคุมเมาส์และแป้นพิมพ์ของคอมพิวเตอร์ผ่านหน้าเว็บในเครือข่ายเดียวกัน (ไม่แชร์หน้าจอ) ทำงานลื่นขึ้นด้วยการ **รวมเหตุการณ์ผ่าน requestAnimationFrame** เพื่อลดแพ็กเก็ตและเรนเดอร์เนียน

Control your PC’s mouse & keyboard over LAN via a web page (no screen streaming). **rAF-based event coalescing** makes input smoother with fewer packets.

---

## 🇹🇭 วิธีใช้งาน
```bash
pip install -r requirements.txt
python app.py
# มือถือ/โน้ตบุ๊กเปิด: http://<IP_คอมปลายทาง>:5000
```
- Windows/macOS/Linux ใช้ได้ (Linux แนะนำ Xorg หาก Wayland ไม่รับอินพุต)
- ครั้งแรก: Windows อนุญาต Firewall / macOS ให้สิทธิ์ Accessibility
- ปรับความไวได้ผ่าน ENV: `MOVE_SPEED`, `SCROLL_SPEED`

## 🇬🇧 How to run
```bash
pip install -r requirements.txt
python app.py
# from phone/laptop: http://<PC_IP>:5000
```
- Works on Windows/macOS/Linux (prefer Xorg on Linux if Wayland blocks input)
- First run: allow Firewall on Windows / grant Accessibility on macOS
- Tunables via env: `MOVE_SPEED`, `SCROLL_SPEED`

---

## Features
- Trackpad (move/scroll only) + **L/R click** buttons
- 10-key grid: Esc / Tab / Enter / Backspace / Keyboard, Arrows, Context
- **Quick Actions** (⋮): Copy, Paste, Cut, Select All, Undo/Redo, Screenshot/Snip, Hold Ctrl/Shift (platform-aware)
- **Theme toggle** (formal SVG, Dark/Light), responsive UI with `clamp()`
- Sticky bottom bar: “© 2025 พัฒนาโดย Thanetphon026”

**License:** Code MIT, Docs CC BY 4.0
© 2025 Thanetphon026
