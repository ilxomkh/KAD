import { MapContainer, TileLayer, useMap, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

const CadastreMap = ({ polygonCoords, setPolygonCoords, dragging }) => {
  return (
    <div className="absolute inset-0 h-full w-full -z-10">
      <MapContainer
        center={[41.3015, 69.24]}
        zoom={16}
        minZoom={3}
        maxZoom={22}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          attribution="&copy; <a href='https://www.google.com/maps'>Google Maps</a>"
        />
        <PolygonController polygonCoords={polygonCoords} setPolygonCoords={setPolygonCoords} dragging={dragging} />
      </MapContainer>
    </div>
  );
};

// 🔹 Контроллер полигона с поддержкой перемещения
const PolygonController = ({ polygonCoords, setPolygonCoords, dragging }) => {
  const map = useMap();
  window.mapInstance = map;
  const polygonRef = useRef(null);
  const [polygonColor, setPolygonColor] = useState("blue");
  let isDragging = false;
  let startLatLng = null;

  useEffect(() => {
    if (!polygonRef.current) {
      const polygon = L.polygon(polygonCoords, { color: polygonColor, weight: 3, className: "cursor-pointer" })
        .addTo(map)
        .on("mousedown", (e) => {
          if (!dragging) return;
          console.log("mousedown: Начало перемещения полигона", e.latlng);
          isDragging = true;
          startLatLng = e.latlng;
          map.dragging.disable();
        })
        .on("mouseup", () => {
          if (!isDragging) return;
          console.log("mouseup: Завершение перемещения полигона");
          isDragging = false;
          setPolygonCoords(polygonRef.current.getLatLngs()[0].map((latlng) => [latlng.lat, latlng.lng]));
          map.dragging.enable();
        })
        .on("click", () => {
          const center = polygon.getBounds().getCenter();
          alert(`Центр полигона: ${center.lat}, ${center.lng}`);
        });

      polygonRef.current = polygon;

      map.on("mousemove", (e) => {
        if (!isDragging || !dragging) return;
        const offsetLat = e.latlng.lat - startLatLng.lat;
        const offsetLng = e.latlng.lng - startLatLng.lng;
        const newCoords = polygonCoords.map(([lat, lng]) => [lat + offsetLat, lng + offsetLng]);
        polygon.setLatLngs([newCoords]);
      });
    }
  }, [map, polygonCoords, setPolygonCoords, dragging, polygonColor]);

  useEffect(() => {
    setPolygonColor(dragging ? "red" : "blue");
    if (polygonRef.current) {
      polygonRef.current.setStyle({ color: dragging ? "red" : "blue" });
    }
  }, [dragging]);

  return null;
};

export default CadastreMap;
