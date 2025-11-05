
# app.py — FINAL (Thanetphon026)
# Flask-SocketIO (threading) + pynput, platform-aware macros, env tunables
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from pynput.mouse import Controller as MouseController, Button
from pynput.keyboard import Controller as KbdController, Key
import os, sys

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "dev-secret")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

mouse = MouseController()
kbd = KbdController()

MOVE_SPEED = float(os.environ.get("MOVE_SPEED", 1.0))
SCROLL_SPEED = float(os.environ.get("SCROLL_SPEED", 1.0))

# Platform profile (auto-detect; can override via OS_PROFILE env: windows|mac|linux)
PLAT = os.environ.get("OS_PROFILE", "").lower()
if not PLAT:
    if sys.platform.startswith('win'): PLAT = 'windows'
    elif sys.platform == 'darwin': PLAT = 'mac'
    else: PLAT = 'linux'

@app.route("/")
def index():
    return render_template("index.html", move_speed=MOVE_SPEED, scroll_speed=SCROLL_SPEED, plat=PLAT)

@socketio.on("move")
def on_move(data):
    try:
        dx = float(data.get("dx", 0)) * MOVE_SPEED
        dy = float(data.get("dy", 0)) * MOVE_SPEED
        if dx or dy:
            mouse.move(dx, dy)
    except Exception as e:
        emit("error", {"where":"move", "msg": str(e)})

@socketio.on("scroll")
def on_scroll(data):
    try:
        dx = float(data.get("dx", 0))
        dy = float(data.get("dy", 0))
        if dx or dy:
            mouse.scroll(dx * SCROLL_SPEED, dy * SCROLL_SPEED)
    except Exception as e:
        emit("error", {"where":"scroll", "msg": str(e)})

@socketio.on("click")
def on_click(data):
    try:
        button = data.get("button", "left")
        count = int(data.get("count", 1))
        btn = Button.left if button == "left" else Button.right if button == "right" else Button.middle
        for _ in range(max(1, count)):
            mouse.press(btn); mouse.release(btn)
    except Exception as e:
        emit("error", {"where":"click", "msg": str(e)})

def map_key(name: str):
    if not isinstance(name, str): return None
    specials = {
        "Backspace": Key.backspace, "Enter": Key.enter, "Tab": Key.tab, "Escape": Key.esc,
        "Shift": Key.shift, "Control": Key.ctrl, "Alt": Key.alt, "Meta": Key.cmd,
        "ArrowLeft": Key.left, "ArrowRight": Key.right, "ArrowUp": Key.up, "ArrowDown": Key.down,
        "Delete": Key.delete, "Home": Key.home, "End": Key.end, "PageUp": Key.page_up,
        "PageDown": Key.page_down, "CapsLock": Key.caps_lock, "Space": Key.space,
        "PrintScreen": Key.print_screen, "Insert": Key.insert, "Menu": Key.menu,
    }
    if name in specials: return specials[name]
    if len(name) == 1: return name
    if name.startswith("F"):
        try:
            idx = int(name[1:])
            if 1 <= idx <= 24: return getattr(Key, f"f{idx}")
        except Exception: pass
    return None

def press_combo(seq):
    pressed = []
    try:
        for k in seq:
            kbd.press(k); pressed.append(k)
        for k in reversed(pressed):
            kbd.release(k)
    except Exception:
        for k in reversed(pressed):
            try: kbd.release(k)
            except Exception: pass

MACROS = {
    'windows': {
        'copy': [Key.ctrl, 'c'], 'paste': [Key.ctrl, 'v'], 'cut': [Key.ctrl, 'x'],
        'select_all': [Key.ctrl, 'a'], 'undo': [Key.ctrl, 'z'], 'redo': [Key.ctrl, 'y'],
        'screenshot': [Key.print_screen], 'snip': [Key.cmd, Key.shift, 's'], 'context': [Key.menu],
    },
    'mac': {
        'copy': [Key.cmd, 'c'], 'paste': [Key.cmd, 'v'], 'cut': [Key.cmd, 'x'],
        'select_all': [Key.cmd, 'a'], 'undo': [Key.cmd, 'z'], 'redo': [Key.cmd, Key.shift, 'z'],
        'screenshot': [Key.cmd, Key.shift, '3'], 'snip': [Key.cmd, Key.shift, '4'], 'context': [Key.shift, 'f10'],
    },
    'linux': {
        'copy': [Key.ctrl, 'c'], 'paste': [Key.ctrl, 'v'], 'cut': [Key.ctrl, 'x'],
        'select_all': [Key.ctrl, 'a'], 'undo': [Key.ctrl, 'z'], 'redo': [Key.ctrl, 'y'],
        'screenshot': [Key.print_screen], 'snip': [Key.shift, Key.print_screen], 'context': [Key.shift, 'f10'],
    },
}

@socketio.on("macro")
def on_macro(data):
    try:
        name = (data or {}).get('name', '').lower()
        seq = MACROS.get(PLAT, {}).get(name)
        if not seq:
            emit("error", {"where":"macro", "msg": f"unknown macro '{name}' for platform {PLAT}"}); return
        press_combo(seq)
    except Exception as e:
        emit("error", {"where":"macro", "msg": str(e)})

@socketio.on("keydown")
def on_keydown(data):
    try:
        key = map_key(data.get("key"))
        if key is None: return
        kbd.press(key)
    except Exception as e:
        emit("error", {"where":"keydown", "msg": str(e)})

@socketio.on("keyup")
def on_keyup(data):
    try:
        key = map_key(data.get("key"))
        if key is None: return
        kbd.release(key)
    except Exception as e:
        emit("error", {"where":"keyup", "msg": str(e)})

@socketio.on("type_text")
def on_type_text(data):
    try:
        text = data.get("text", "")
        if not text: return
        kbd.type(text)
    except Exception as e:
        emit("error", {"where":"type_text", "msg": str(e)})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "5000")))
