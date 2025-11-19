import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ⚙️ Fix lỗi icon bị lỗi khi dùng react-leaflet + vite/react-scripts
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// 📍Dữ liệu ví dụ (toạ độ các điểm dừng)
const stops = [
  { id: 1, name: "Điểm dừng 1", lat: 10.762622, lng: 106.660172 },
  { id: 2, name: "Điểm dừng 2", lat: 10.769642, lng: 106.673025 },
  { id: 3, name: "Điểm dừng 3", lat: 10.77535, lng: 106.700874 },
];

const Map = () => {
  return (
    <div style={{ width: "100%", height: "600px", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={[10.762622, 106.660172]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Layer nền bản đồ */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hiển thị các điểm dừng */}
        {stops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]}>
            <Popup>
              <strong>{stop.name}</strong>
              <br />
              Tuyến 120
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
