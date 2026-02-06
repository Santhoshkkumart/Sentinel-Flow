from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
from ultralytics import YOLO
import torch
import threading

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

device = 0 if torch.cuda.is_available() else "cpu"
model = YOLO("yolov8s.pt")

cap = None
lock = threading.Lock()
latest = {"count": 0, "alert": False}

PERSON_CLASS_ID = 0
GREEN_ZONE = (50, 50, 400, 400)
RED_ZONE = (500, 100, 850, 450)

class VideoPath(BaseModel):
    path: str

@app.post("/load-video")
def load_video(data: VideoPath):
    global cap
    with lock:
        if cap:
            cap.release()
        cap = cv2.VideoCapture(data.path)
    return {"loaded": True}

def inside(cx, cy, zone):
    x1, y1, x2, y2 = zone
    return x1 <= cx <= x2 and y1 <= cy <= y2

def frames():
    global cap
    while True:
        if cap is None:
            continue

        ok, frame = cap.read()
        if not ok:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        count = 0
        alert = False

        results = model(frame, classes=[PERSON_CLASS_ID], device=device)

        if results[0].boxes:
            for box in results[0].boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                if (x2 - x1) * (y2 - y1) < 500:
                    continue

                count += 1
                cx, cy = (x1 + x2)//2, (y1 + y2)//2
                color = (0,255,0)

                if inside(cx, cy, RED_ZONE):
                    alert = True
                    color = (0,0,255)

                cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)

        with lock:
            latest["count"] = count
            latest["alert"] = alert

        _, buf = cv2.imencode(".jpg", frame)
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n"

@app.get("/stream")
def stream():
    return StreamingResponse(frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/stats")
def stats():
    with lock:
        return JSONResponse(latest)
