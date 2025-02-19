import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { CheckIcon, ChevronRight } from "lucide-react";
import StatusBar from "../components/StatusBar";
import BuildingExistenceSelector from "../components/BuildingExistenceSelector";
import ArcGISPolygonEditor from "../components/ArcGISPolygonEditor";

const ComparePage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();

  // Состояния
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [objectId, setObjectId] = useState(1);
  const [buildingExists, setBuildingExists] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!location.state) {
      console.log("Нет API для карты, используются локальные данные");
    }
  }, [kadasterId, location.state]);

  useEffect(() => {
    // Загрузка данных из локального файла polygonData.geojson
    fetch("/data/polygonData.geojson")
    .then((res) => res.json())
    .then((data) => {
      console.log("Загруженный GeoJSON:", data);
  
      if (data?.type === "FeatureCollection" && data.features?.length > 0) {
        const firstFeature = data.features[0]; // Берем первый объект
        
        if (
          firstFeature?.geometry?.type === "Polygon" &&
          firstFeature.geometry.coordinates?.length > 0
        ) {
          const coords = firstFeature.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);
          setPolygonCoords(coords);
          setObjectId(firstFeature.properties?.FID || 1);
        } else {
          console.error("Ошибка в структуре первого Feature.");
        }
      } else {
        console.error("GeoJSON не содержит объектов.");
      }
    })
    .catch((err) => {
      console.error("Ошибка загрузки локального GeoJSON:", err);
    });
  

    // Загрузка данных с бэкенда, если они доступны
    fetch("/api/polygons/1")
      .then((res) => res.json())
      .then((data) => {
        if (
          data?.geometry?.type === "Polygon" &&
          data.geometry.coordinates?.length > 0
        ) {
          const coords = data.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);
          setPolygonCoords(coords);
          setObjectId(data.properties?.objectId || 1);
        } else {
          console.error("Ошибка в формате GeoJSON, используются локальные данные");
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки GeoJSON с API, используются локальные данные:", err);
      });
  }, []);

  const handleConfirmChanges = (newCoords) => {
    if (!objectId) return;
    const newCoordsForBackend = newCoords.map(([lat, lng]) => [lng, lat]);
    const payload = {
      objectId,
      geometry: {
        type: "Polygon",
        coordinates: [newCoordsForBackend],
      },
    };
    console.log("Отправка новых координат:", payload);
  };

  return (
    <div className="relative min-h-screen w-screen">
      <ArcGISPolygonEditor 
        backendPolygonCoords={polygonCoords}
        onConfirmChanges={handleConfirmChanges}
      />

      <div className="absolute top-0 left-0 p-6 w-full z-50 pointer-events-auto">
        <StatusBar currentStep={1} kadasterId={kadasterId} />
      </div>

      <div className="absolute top-0 left-0 z-50 pointer-events-auto">
        <BuildingExistenceSelector
          buildingExists={buildingExists}
          setBuildingExists={setBuildingExists}
        />
      </div>

      <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4 z-50 pointer-events-auto">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700">
          Davom etish{" "}
          <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
        </button>
      </div>

      <div className="absolute bottom-6 left-8 bg-white p-3 rounded-xl flex space-x-4 z-50 pointer-events-auto">
        <button
          className="px-6 py-3 bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
          onClick={() => setShowModal(true)}
        >
          Xatolik bor
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
            <h2 className="text-lg font-semibold mb-4">
              Xatolik borligini tasdiqlaysizmi?
            </h2>
            <div className="flex justify-center w-full space-x-4">
              <button
                className="px-6 py-2 w-full bg-blue-600 text-white rounded-xl transition-all hover:bg-blue-700"
                onClick={() => {
                  setSending(true);
                  setTimeout(() => {
                    setShowModal(false);
                    setSending(false);
                  }, 1000);
                }}
                disabled={sending}
              >
                {sending ? "Yuborilmoqda..." : "Ha"}
              </button>
              <button
                className="px-6 py-2 w-full bg-gray-200 text-gray-700 rounded-xl transition-all hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Yo'q
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
