import React, { useRef, useEffect, useState, useCallback } from "react";
import "./index.css"; // Tambahkan import CSS

const API_URL = "http://localhost:5000/predict";

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment"); // Default kamera belakang
  const [detections, setDetections] = useState([]);
  const [counts, setCounts] = useState({ fresh: 0, notFresh: 0 });

  const startCamera = async (mode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");

      // Start measuring response time
      console.time("API Response Time");

      fetch(API_URL, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          // Stop measuring response time and log it
          console.timeEnd("API Response Time");

          if (data.detections) {
            setDetections(data.detections);
            setCounts({
              fresh: data.count_fresh,
              notFresh: data.count_not_fresh,
            });
            drawBoundingBoxes(data.detections);
          } else {
            setDetections([]);
          }
        })
        .catch((err) => {
          // Stop measuring in case of an error
          console.timeEnd("API Response Time");
          console.error("Detection error:", err);
        });
    }, "image/jpeg");
  }, []);

  useEffect(() => {
    const interval = setInterval(captureFrame, 500); //delay 2s
    return () => clearInterval(interval);
  }, [captureFrame]);

  const drawBoundingBoxes = (detections) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); // Gambar frame video

    detections.forEach((detection) => {
      const { box, label, confidence, color } = detection; // Ambil confidence juga
      const [x1, y1, x2, y2] = box;

      context.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      context.lineWidth = 2;
      context.strokeRect(x1, y1, x2 - x1, y2 - y1);

      context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      context.font = "16px Arial";

      // Tambahkan confidence ke label bounding box
      const labelText = `${label} (${(confidence * 100).toFixed(1)}%)`; // Confidence dalam %
      context.fillText(labelText, x1, y1 - 5); // Tampilkan label dan confidence
    });
  };

  return (
    <div>
      <h1>Fruit Freshness Detection 🍏🍌</h1>
      <button onClick={switchCamera}>
        {facingMode === "user"
          ? "Gunakan Kamera Belakang"
          : "Gunakan Kamera Depan"}
      </button>
      <div style={{ position: "relative", width: "100%" }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
        />
      </div>
      <h3>Ringkasan Deteksi:</h3>
      <ul>
        <li>Buah Segar: {counts.fresh}</li>
        <li>Buah Tidak Segar: {counts.notFresh}</li>
      </ul>
    </div>
  );
};

export default CameraComponent;
