import requests
import time
import csv

API_URL = "http://localhost:5000/predict"

IMAGE_PATH = "buah.jpg"  # Ganti dengan path gambar di komputermu

ITERATIONS = 100


results = []

print(f"Mulai pengujian API dengan {ITERATIONS} request...")

for i in range(ITERATIONS):
    with open(IMAGE_PATH, "rb") as img:
        files = {"image": img}
        
        start_time = time.time()  # Catat waktu sebelum request
        response = requests.post(API_URL, files=files)
        end_time = time.time()  # Catat waktu setelah request
        
        # Hitung waktu respons dalam milidetik
        response_time = (end_time - start_time)
        
        # Simpan hasil
        results.append([i+1, response.status_code, response_time, len(response.content)])
        print(f"Request {i+1}: Status {response.status_code} - {response_time:.2f} ms")
    
    # Delay antar request

# Simpan hasil ke CSV
csv_filename = "api_performance_test.csv"
with open(csv_filename, mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Request No", "Status Code", "Response Time (ms)", "Response Size (bytes)"])
    writer.writerows(results)

print(f"Pengujian selesai! Hasil disimpan di {csv_filename}")
