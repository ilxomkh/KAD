import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StatusBar from "../components/StatusBar";
import BuildingExistenceSelector from "../components/BuildingExistenceSelector";
import ArcGISPolygonEditor from "../components/ArcGISPolygonEditor";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import CadastreInfo from "../components/infoButton";
import SupportButton from "../components/supportButton";

const ComparePage = () => {
  const { id } = useParams();
  if (!id) {
    console.error("Параметр id отсутствует");
  }
  const encodedId = encodeURIComponent(id);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [polygonCoords, setPolygonCoords] = useState([]);
  const [buildingExists, setBuildingExists] = useState(null);
  const [verdict, setVerdict] = useState("");
  const [sending, setSending] = useState(false);
  const [editedPolygonData, setEditedPolygonData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  
  // Новый стейт для модального окна при нажатии "Davom etish"
  const [showProceedModal, setShowProceedModal] = useState(false);
  
  // Существующий стейт для модального окна "Xatolik bor"
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!token) {
      console.error("Отсутствует токен авторизации");
      return;
    }

    fetch(`${BASE_URL}/api/cadastre/cad/${encodedId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Полученные данные кадастра:", data);
        setRecordId(data.ID);
        const geojsonStr = data.geojson;
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
        if (
          geoData.type === "FeatureCollection" &&
          geoData.features?.length > 0
        ) {
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
        } else if (
          geoData.type === "Feature" &&
          geoData.geometry?.type === "Polygon"
        ) {
          const coords = geoData.geometry.coordinates[0].map(([lon, lat]) => [
            lat,
            lon,
          ]);
          setPolygonCoords(coords);
        } else {
          console.error(
            "GeoJSON не содержит объектов или имеет неверный формат"
          );
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки данных кадастра:", err);
      });
  }, [encodedId, token]);

  const handleConfirmChanges = (data) => {
    setEditedPolygonData(data);
    console.log("Сохраненные данные полигона:", data);
  };

  // Отправка данных для geometry_fix
// Функция для преобразования координаты из Web Mercator в WGS84 (градусы)
const webMercatorToWGS84 = (x, y) => {
  const R = 6378137;
  const lon = (x / R) * (180 / Math.PI);
  const lat = Math.atan(Math.sinh(y / R)) * (180 / Math.PI);
  return [parseFloat(lon.toFixed(5)), parseFloat(lat.toFixed(5))];
};

const sendGeometryFixData = async () => {
  let finalCoordinates = [];

  if (editedPolygonData && editedPolygonData.geometry) {
    if (Array.isArray(editedPolygonData.geometry)) {
      finalCoordinates = editedPolygonData.geometry;
    } else if (
      editedPolygonData.geometry.rings &&
      Array.isArray(editedPolygonData.geometry.rings)
    ) {
      finalCoordinates = editedPolygonData.geometry.rings[0] || [];
    } else if (
      editedPolygonData.geometry.coordinates &&
      Array.isArray(editedPolygonData.geometry.coordinates)
    ) {
      finalCoordinates = editedPolygonData.geometry.coordinates[0] || [];
    } else {
      console.error(
        "Неверный формат данных полигона:",
        editedPolygonData.geometry
      );
      return false;
    }
  } else if (polygonCoords.length > 0) {
    finalCoordinates = polygonCoords.map((coord) => [coord[1], coord[0]]);
  } else {
    console.error("Нет данных для формирования fixedGeojson");
    return false;
  }

  // Преобразуем каждую координату из Web Mercator в WGS84
  const convertedCoordinates = finalCoordinates.map(([x, y]) =>
    webMercatorToWGS84(x, y)
  );

  const fixedGeojson = {
    type: "Polygon",
    coordinates: [convertedCoordinates],
  };

  const payload = {
    fixedGeojson: JSON.stringify(fixedGeojson),
    geometryRotation:
      editedPolygonData && editedPolygonData.rotation
        ? editedPolygonData.rotation
        : 0,
    moveDistance:
      editedPolygonData && editedPolygonData.moveDistance
        ? editedPolygonData.moveDistance
        : 0,
  };

  console.log("Отправка данных на сервер (geometry_fix):", payload);

  try {
    const idToUse = recordId !== null ? recordId : encodedId;
    const response = await fetch(
      `${BASE_URL}/api/cadastre/${idToUse}/geometry_fix`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );
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


  // Отправка данных для buildingPresence
  const sendBuildingPresenceData = async () => {
    const payload = {
      buildingPresence: buildingExists.toString() // Приводим к строке или используем нужный формат
    };

    console.log("Отправка данных на сервер (buildingPresence):", payload);

    try {
      const idToUse = recordId !== null ? recordId : encodedId;
      const response = await fetch(
        `${BASE_URL}/api/cadastre/${idToUse}/building_presence`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        console.log("Данные buildingPresence успешно отправлены");
        return true;
      } else {
        console.error("Ошибка при отправке данных buildingPresence на сервер");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при отправке данных buildingPresence:", error);
      return false;
    }
  };

  // Отправка данных для cadastre_error (при наличии ошибки)
  const sendCadastreErrorData = async () => {
    const payload = {
      cadastreError: true,
      comment: verdict,
    };

    console.log("Отправка данных на сервер (cadastre_error):", payload);

    try {
      const idToUse = recordId !== null ? recordId : encodedId;
      const response = await fetch(
        `${BASE_URL}/api/cadastre/${idToUse}/cadastre_error`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
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

  // Обработчик для кнопки "Davom etish" – вызывается из модального окна
  const handleProceed = async () => {
    console.log("Нажата кнопка ДА в модальном окне. Данные для отправки:", {
      editedPolygonData,
      buildingExists,
      verdict,
    });
    setSending(true);
    // Сначала отправляем данные geometry_fix
    const geometryFixResult = await sendGeometryFixData();
    // Затем отправляем данные buildingPresence
    const buildingPresenceResult = await sendBuildingPresenceData();
    setSending(false);
    setShowProceedModal(false);
    if (geometryFixResult && buildingPresenceResult) {
      console.log("Оба запроса успешно отправлены, переходим на главную страницу");
      navigate("/");
    } else {
      console.error("Ошибка отправки данных на сервер (geometry_fix или buildingPresence)");
    }
  };

  // Обработчик для кнопки "Xatolik bor"
  const handleErrorConfirm = async () => {
    console.log("Нажата кнопка Ha (Xatolik bor). Данные для отправки:", {
      editedPolygonData,
      buildingExists,
      verdict,
    });
    setSending(true);
    const cadastreErrorResult = await sendCadastreErrorData();
    setSending(false);
    setShowErrorModal(false);
    if (cadastreErrorResult) {
      console.log("Данные cadastre_error успешно отправлены, переходим на главную страницу");
      navigate("/");
    } else {
      console.error("Ошибка отправки данных cadastre_error на сервер");
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
        <StatusBar currentStep={1} kadasterId={recordId || id} />
      </div>

      <div className="absolute top-36 left-6 z-50 pointer-events-auto">
        <BuildingExistenceSelector
          selectedStatus={buildingExists}
          setSelectedStatus={setBuildingExists}
          id={recordId || id}
        />
      </div>

      <div className="absolute top-52 right-8">
        <CadastreInfo cadastreId={recordId || id} />
      </div>

      <div className="absolute top-52 right-22">
        <SupportButton cadastreId={recordId || id} />
      </div>

      {/* Кнопка "Davom etish" */}
      <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4 z-50 pointer-events-auto">
        <button
          className="px-6 py-3 cursor-pointer bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700"
          onClick={() => setShowProceedModal(true)}
          disabled={
            (!editedPolygonData && polygonCoords.length === 0) ||
            buildingExists === null
          }
        >
          Davom etish <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
        </button>
      </div>

      {/* Кнопка "Xatolik bor" */}
      <div className="absolute bottom-6 left-8 bg-white p-3 rounded-xl flex space-x-4 z-50 pointer-events-auto">
        <button
          className="px-6 py-3 cursor-pointer bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
          onClick={() => setShowErrorModal(true)}
        >
          Xatolik bor
        </button>
      </div>

      {/* Модальное окно для "Davom etish" */}
      {showProceedModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
            <h2 className="text-lg cursor-default font-semibold mb-4">
              Davom etishni tasdiqlaysizmi?
            </h2>
            <div className="flex justify-center w-full space-x-4">
              <button
                className="px-6 py-3 w-full cursor-pointer bg-blue-500 text-white rounded-xl transition-all hover:bg-blue-600"
                onClick={handleProceed}
                disabled={sending}
              >
                {sending ? "Yuborilmoqda..." : "Ha"}
              </button>
              <button
                className="px-6 py-3 w-full cursor-pointer bg-[#f7f9fb] border border-[#e9e9eb] text-gray-700 rounded-xl transition-all hover:bg-gray-100"
                onClick={() => setShowProceedModal(false)}
              >
                Yo'q
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для "Xatolik bor" */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
            <h2 className="text-lg cursor-default font-semibold mb-4">
              Xatolik borligini tasdiqlaysizmi?
            </h2>
            <div className="flex justify-center w-full space-x-4">
              <button
                className="px-6 py-3 w-full cursor-pointer bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
                onClick={handleErrorConfirm}
                disabled={
                  sending ||
                  (!editedPolygonData && polygonCoords.length === 0) ||
                  buildingExists === null
                }
              >
                {sending ? "Yuborilmoqda..." : "Ha"}
              </button>
              <button
                className="px-6 py-3 w-full cursor-pointer bg-gray-300 text-black rounded-xl transition-all hover:bg-gray-400"
                onClick={() => setShowErrorModal(false)}
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
