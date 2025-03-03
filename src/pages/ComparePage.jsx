import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { CheckIcon, ChevronRight } from "lucide-react";
import StatusBar from "../components/StatusBar";
import BuildingExistenceSelector from "../components/BuildingExistenceSelector";
import ArcGISPolygonEditor from "../components/ArcGISPolygonEditor";

const ComparePage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Состояния
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [objectId, setObjectId] = useState(1);
  const [buildingExists, setBuildingExists] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  // Состояние для хранения данных от ArcGISPolygonEditor (geometry и rotation)
  const [editedPolygonData, setEditedPolygonData] = useState(null);

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
            // Преобразуем из [lon, lat] в [lat, lon] для ArcGISPolygonEditor
            const coords = firstFeature.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
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
          const coords = data.geometry.coordinates[0].map(
            ([lon, lat]) => [lat, lon]
          );
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

  // Функция, вызываемая ArcGISPolygonEditor при нажатии на "Tasdiqlash"
  // Сохраняем объект с данными: { geometry, rotation }
  const handleConfirmChanges = (data) => {
    setEditedPolygonData(data);
    console.log("Сохраненные данные полигона:", data);
  };

  // При нажатии на кнопку "Davom etish" отправляем данные на бекенд
  // Если отправка успешна, выполняем перенаправление на Role1TablePage.jsx
  const handleProceed = async () => {
    if (!editedPolygonData) {
      console.error("Нет отредактированных данных полигона");
      return;
    }
    const payload = {
      proceed: true,
      geometry: editedPolygonData.geometry,
      rotation: editedPolygonData.rotation, // итоговый угол вращения (0–360°)
      building_presence: buildingExists
    };
    console.log("Отправка данных на бекенд:", payload);
    
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        // Если данные успешно отправлены, перенаправляем на Role1TablePage.jsx
        navigate("/role1tablepage");
      } else {
        console.error("Ошибка при отправке данных на сервер");
      }
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    }
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
          kadasterId={kadasterId}
        />
      </div>

      <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4 z-50 pointer-events-auto">
        <button 
          className="px-6 py-3 cursor-pointer bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700"
          onClick={handleProceed}
          disabled={editedPolygonData === null || buildingExists === null}
        >
          Davom etish{" "}
          <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
        </button>
      </div>

      <div className="absolute bottom-6 left-8 bg-white p-3 rounded-xl flex space-x-4 z-50 pointer-events-auto">
        <button
          className="px-6 py-3 cursor-pointer bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
          onClick={() => setShowModal(true)}
        >
          Xatolik bor
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
            <h2 className="text-lg cursor-default font-semibold mb-4">
              Xatolik borligini tasdiqlaysizmi?
            </h2>
            <div className="flex justify-center w-full space-x-4">
              <button
                className="px-6 py-3 w-full cursor-pointer bg-[#e63946] text-white rounded-xl transition-all hover:bg-red-600"
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
                className="px-6 py-3 w-full cursor-pointer bg-[#f7f9fb] border border-[#e9e9eb] text-gray-700 rounded-xl transition-all hover:bg-gray-100"
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
