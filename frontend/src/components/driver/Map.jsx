import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ⚙️ Fix lỗi icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ⭐ Tọa độ trung tâm mặc định (HCM)
const DEFAULT_CENTER = [10.762622, 106.660172];

const Map = ({ stops = [], center = DEFAULT_CENTER, zoom = 13 }) => {
  // 🔥 Tối ưu: không re-render khi stops không đổi
  const markers = useMemo(
    () =>
      stops.map((stop) => (
        <Marker key={stop.id} position={[stop.lat, stop.lng]}>
          <Popup>
            <strong>{stop.name}</strong>
            <br />
            {stop.route ? `Tuyến ${stop.route}` : ""}
          </Popup>
        </Marker>
      )),
    [stops]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="Dữ liệu bản đồ © OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
      </MapContainer>
    </div>
  );
};

export default Map;
