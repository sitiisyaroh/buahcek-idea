import cv2
import numpy as np
import torch
from ultralytics import YOLO
from PIL import Image

# Load YOLO model
def load_model():
    return YOLO("model/best.pt")

# Proses gambar dengan YOLO
def process_image(image, model):
    results = model.predict(image, verbose=False)
    return results

# Klasifikasi buah segar dan tidak segar
def classify_fruit(results, model):
    detections = []
    count_fresh = 0
    count_not_fresh = 0

    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])  # Bounding box koordinat
            cls_name = model.names[int(box.cls[0])]  # Nama kelas dari model
            confidence = float(box.conf[0])  # Confidence score

            # Tentukan warna bounding box berdasarkan kelas
            if cls_name == "buah_segar":
                color = (0, 255, 0)  # Hijau untuk buah segar
                count_fresh += 1
            elif cls_name == "buah_tidaksegar":
                color = (255, 0, 0)  # Merah untuk buah tidak segar
                count_not_fresh += 1
            else:
                continue  # Jika kelas tidak dikenali, skip

            # Simpan hasil deteksi dengan label asli & confidence
            detections.append({
                "label": cls_name,
                "confidence": confidence,
                "box": [x1, y1, x2, y2],
                "color": color
            })

    return count_fresh, count_not_fresh, detections
