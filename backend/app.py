from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import load_model, process_image, classify_fruit
import cv2
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Load YOLO model saat aplikasi dimulai
model = load_model()

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    image = Image.open(io.BytesIO(file.read()))  # Buka gambar dengan PIL
    image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)  # Convert ke OpenCV format

    # Proses gambar dengan YOLO
    results = process_image(image, model)

    # Klasifikasi buah segar dan tidak segar
    count_fresh, count_not_fresh, detections = classify_fruit(results, model)

    return jsonify({
        "count_fresh": count_fresh,
        "count_not_fresh": count_not_fresh,
        "detections": detections  # Data deteksi termasuk label asli, confidence, bounding box & warna
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Default ke 5000 untuk local run
    app.run(debug=True, host='0.0.0.0', port=port)
