import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckIcon, ChevronRight } from "lucide-react";
import StatusBar from "../components/StatusBar";
import BuildingExistenceSelector from "../components/BuildingExistenceSelector";
import ArcGISPolygonEditor from "../components/ArcGISPolygonEditor";

const ComparePage = () => {
  const { kadasterId } = useParams();
  const navigate = useNavigate();

  // Состояния
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [buildingExists, setBuildingExists] = useState(null);
  const [verdict, setVerdict] = useState(""); // "option1" или "option2" при выборе Yo'q
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  // Данные от ArcGISPolygonEditor
  const [editedPolygonData, setEditedPolygonData] = useState(null);

  // 1. Загрузка координат из API (поле "geojson": "string")
  useEffect(() => {
    fetch(`/api/cadastres/${kadasterId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Полученные данные кадастра:", data);
        // Предпочтительно использовать fixedGeojson, если он есть, иначе geojson
        const geojsonStr = data.fixedGeojson || data.geojson;
        if (!geojsonStr) {
          console.error("В ответе отсутствует поле geojson");
          return;
        }
        let geoData;
        try {
          geoData = JSON.parse(geojsonStr);
        } catch (err) {
          console.error("Ошибка парсинга geojson:", err);
          return;
        }
        // Если GeoJSON имеет тип FeatureCollection
        if (geoData.type === "FeatureCollection" && geoData.features?.length > 0) {
          const firstFeature = geoData.features[0];
          if (
            firstFeature?.geometry?.type === "Polygon" &&
            firstFeature.geometry.coordinates?.length > 0
          ) {
            const coords = firstFeature.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
            setPolygonCoords(coords);
          } else {
            console.error("Ошибка в структуре первого Feature.");
          }
        }
        // Если GeoJSON имеет тип Feature
        else if (geoData.type === "Feature" && geoData.geometry?.type === "Polygon") {
          const coords = geoData.geometry.coordinates[0].map(
            ([lon, lat]) => [lat, lon]
          );
          setPolygonCoords(coords);
        } else {
          console.error("GeoJSON не содержит объектов или имеет неверный формат");
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки данных кадастра:", err);
      });
  }, [kadasterId]);

  // 2. Функция, вызываемая ArcGISPolygonEditor при "Tasdiqlash"
  const handleConfirmChanges = (data) => {
    setEditedPolygonData(data);
    console.log("Сохраненные данные полигона:", data);
  };

  // 3. Запрос к /api/cadastres/{id}/geometry_fix (при успешной верификации)
  const sendGeometryFixData = async () => {
    if (!editedPolygonData || buildingExists === null) {
      console.error("Отсутствуют необходимые данные для отправки geometry_fix");
      return false;
    }

    // Если здание отсутствует (false), verdict = "option1"/"option2", иначе – пустая строка
    const finalVerdict = buildingExists === false ? verdict : "";

    // Собираем минимальный GeoJSON-объект
    const geoJsonObject = {
      type: "Polygon",
      coordinates: editedPolygonData.geometry,
    };

    const payload = {
      geometry: JSON.stringify(geoJsonObject),
      buildingPresence: buildingExists,
      verdict: finalVerdict,
      geometryRotation: editedPolygonData.rotation,
      moveDistance: editedPolygonData.moveDistance || 0,
    };

    console.log("Отправка данных на сервер (geometry_fix):", payload);

    try {
      const response = await fetch(`/api/cadastres/${kadasterId}/geometry_fix`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Данные geometry_fix успешно отправлены");
        return true;
      } else {
        console.error("Ошибка при отправке данных geometry_fix на сервер");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при отправке данных geometry_fix:", error);
      return false;
    }
  };

  // 4. Запрос к /api/cadastres/{id}/cadastre_error (при ошибке)
  const sendCadastreErrorData = async () => {
    const payload = {
      cadastreError: true,
      comment: verdict, // Передаём содержимое verdict
    };

    console.log("Отправка данных на сервер (cadastre_error):", payload);

    try {
      const response = await fetch(`/api/cadastres/${kadasterId}/cadastre_error`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Данные cadastre_error успешно отправлены");
        return true;
      } else {
        console.error("Ошибка при отправке данных cadastre_error на сервер");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при отправке данных cadastre_error:", error);
      return false;
    }
  };

  // 5. Обработчик для кнопки "Davom etish" – отправляем geometry_fix
  const handleProceed = async () => {
    console.log("Нажата кнопка Davom etish. Данные для отправки:", {
      editedPolygonData,
      buildingExists,
      verdict,
    });
    setSending(true);
    const geometryFixResult = await sendGeometryFixData();
    setSending(false);
    if (geometryFixResult) {
      navigate("/");
    }
  };

  // 6. Обработчик для модального окна "Xatolik bor" – отправляем cadastre_error
  const handleErrorConfirm = async () => {
    console.log("Нажата кнопка Ha (Xatolik bor). Данные для отправки:", {
      editedPolygonData,
      buildingExists,
      verdict,
    });
    setSending(true);
    const cadastreErrorResult = await sendCadastreErrorData();
    setSending(false);
    setShowModal(false);
    if (cadastreErrorResult) {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen w-screen">
      <ArcGISPolygonEditor 
        backendPolygonCoords={polygonCoords}
        editable={true} 
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
          setVerdict={setVerdict}
        />
      </div>

      {/* Кнопка Davom etish */}
      <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4 z-50 pointer-events-auto">
        <button 
          className="px-6 py-3 cursor-pointer bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700"
          onClick={handleProceed}
          disabled={!editedPolygonData || buildingExists === null}
        >
          Davom etish{" "}
          <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
        </button>
      </div>

      {/* Кнопка Xatolik bor */}
      <div className="absolute bottom-6 left-8 bg-white p-3 rounded-xl flex space-x-4 z-50 pointer-events-auto">
        <button
          className="px-6 py-3 cursor-pointer bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
          onClick={() => setShowModal(true)}
        >
          Xatolik bor
        </button>
      </div>

      {/* Модальное окно подтверждения "Xatolik bor" */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
            <h2 className="text-lg cursor-default font-semibold mb-4">
              Xatolik borligini tasdiqlaysizmi?
            </h2>
            <div className="flex justify-center w-full space-x-4">
              <button
                className="px-6 py-3 w-full cursor-pointer bg-[#e63946] text-white rounded-xl transition-all hover:bg-red-600"
                onClick={handleErrorConfirm}
                disabled={sending || !editedPolygonData || buildingExists === null}
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
