import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { ChevronRight } from "lucide-react";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";

// Пример mock-данных
const mockData = {
  originalPolygonCoords: [
    [41.321, 69.251],
    [41.321, 69.261],
    [41.331, 69.261],
    [41.331, 69.251],
    [41.321, 69.251],
  ],
  modifiedPolygonCoords: [
    [41.32, 69.25],
    [41.32, 69.26],
    [41.33, 69.26],
    [41.33, 69.25],
    [41.32, 69.25],
  ],
  verdict: "",
  buildingPresence: false,
};

const CheckPage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Состояния для данных карты
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Статус здания
  const [buildingStatus, setBuildingStatus] = useState(false);

  // Состояния для модального окна
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Запрашиваем данные кадастра с бэкенда
    fetch(`/api/cadastres/${kadasterId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки данных кадастра");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Полученные данные кадастра:", data);
        // Парсим geojson для оригинальных координат
        let originalCoords = [];
        try {
          const geojson = JSON.parse(data.geojson);
          if (geojson.type === "FeatureCollection" && geojson.features.length > 0) {
            const firstFeature = geojson.features[0];
            if (firstFeature?.geometry?.coordinates) {
              originalCoords = firstFeature.geometry.coordinates[0].map(
                ([lon, lat]) => [lat, lon]
              );
            }
          } else if (geojson.type === "Feature" && geojson.geometry?.coordinates) {
            originalCoords = geojson.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга geojson:", e);
        }
        // Парсим fixedGeojson для изменённых координат
        let modifiedCoords = [];
        try {
          const fixedGeojson = JSON.parse(data.fixedGeojson);
          if (fixedGeojson.type === "FeatureCollection" && fixedGeojson.features.length > 0) {
            const firstFeature = fixedGeojson.features[0];
            if (firstFeature?.geometry?.coordinates) {
              modifiedCoords = firstFeature.geometry.coordinates[0].map(
                ([lon, lat]) => [lat, lon]
              );
            }
          } else if (fixedGeojson.type === "Feature" && fixedGeojson.geometry?.coordinates) {
            modifiedCoords = fixedGeojson.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга fixedGeojson:", e);
        }
        setMapData({
          originalPolygonCoords: originalCoords,
          modifiedPolygonCoords: modifiedCoords,
          verdict: data.verdict || "",
        });
        setBuildingStatus(data.buildingPresence);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка запроса данных:", err);
        // Если произошла ошибка, используем mockData
        setMapData(mockData);
        setLoading(false);
      });

    // Запрашиваем скриншот
    fetch(`/api/cadastres/${kadasterId}/screenshot`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки скриншота");
        }
        return res.blob();
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setMapData((prev) =>
          prev ? { ...prev, photo: imageUrl } : { photo: imageUrl }
        );
      })
      .catch((err) => {
        console.error("Ошибка загрузки скриншота:", err);
      });
  }, [kadasterId, location.state]);

  // Функция для отправки PATCH запроса к /api/cadastres/{id}/verification
  const sendVerification = async (verified, commentStr) => {
    const payload = { verified, comment: commentStr };
    console.log("Отправка данных на сервер (verification):", payload);
    try {
      const response = await fetch(`/api/cadastres/${kadasterId}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Данные verification успешно отправлены");
        return true;
      } else {
        console.error("Ошибка при отправке данных verification");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при отправке данных verification:", error);
      return false;
    }
  };

  // Обработчик для кнопки "Davom etish" – verified: true, comment: ""
  const handleProceed = async () => {
    console.log("Нажата кнопка Davom etish. Отправка verification: { verified: true, comment: '' }");
    const result = await sendVerification(true, "");
    if (result) {
      navigate("/");
    }
  };

  // Обработчик для модального окна "Xatolik bor" – verified: false, comment формируется из выбранного таба и введённого текста
  const handleSend = async () => {
    const errorType = activeTab === "obyekt" ? "Obyekt joyiga mos emas" : "Toifasi mos emas";
    const finalComment = comment ? `${errorType}: ${comment}` : errorType;
    console.log("Нажата кнопка Yuklash. Отправка verification:", {
      verified: false,
      comment: finalComment,
    });
    const result = await sendVerification(false, finalComment);
    if (result) {
      setComment("");
      setActiveTab("obyekt");
      setShowModal(false);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#e4ebf3] flex">
      {loading && (
        <p className="text-gray-500 text-center mt-6">Загрузка данных карты...</p>
      )}
      {error && <p className="text-red-500 text-center mt-6">{error}</p>}
      {!loading && !error && mapData && (
        <div className="relative w-full h-[100vh] flex">
          {/* Левая часть: Фото (если есть) */}
          {mapData.photo && (
            <div className="w-1/2 h-full">
              <img
                src={mapData.photo}
                alt="Фото объекта"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
          {/* Правая часть: Карта */}
          <div className={`${mapData.photo ? "w-1/2" : "w-full"} h-full`}>
            <ArcGISTwoPolygonViewer
              backendPolygonCoords={
                mapData.originalPolygonCoords && mapData.originalPolygonCoords.length > 0
                  ? mapData.originalPolygonCoords
                  : [[41.32, 69.25]]
              }
              modifiedPolygonCoords={
                mapData.modifiedPolygonCoords && mapData.modifiedPolygonCoords.length > 0
                  ? mapData.modifiedPolygonCoords
                  : [[41.32, 69.25]]
              }
            />
          </div>
          {/* Шапка с информацией */}
          <div className="absolute top-0 left-0 p-6 w-full z-50">
            <StatusBar currentStep={2} kadasterId={kadasterId} />
          </div>
          {/* Блок о статусе здания */}
          <div className="absolute top-40 left-8 bg-white px-4 py-3 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold">
              Qurilma:{" "}
              <span className={buildingStatus ? "text-green-600" : "text-red-600"}>
                {buildingStatus ? "Mavjud" : "Mavjud emas"}
              </span>
            </h2>
          </div>
          {/* Блок для отображения verdict, если он есть */}
          {mapData.verdict && (
            <div className="absolute top-56 left-8 bg-white px-4 py-2 rounded-xl shadow-md">
              <p className="text-lg font-semibold">
                Verdit: <span className="text-blue-600">{mapData.verdict}</span>
              </p>
            </div>
          )}
          {/* Кнопка "Davom etish" */}
          <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center transition-all hover:bg-blue-700"
              onClick={handleProceed}
            >
              Davom etish <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          </div>
          {/* Кнопка "Xatolik bor" */}
          <div className="absolute bottom-6 left-8 bg-white p-3 rounded-xl">
            <button
              className="px-6 py-3 bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
              onClick={() => setShowModal(true)}
            >
              Xatolik bor
            </button>
          </div>
          {/* Модальное окно */}
          {showModal && (
            <CommentModal
              comment={comment}
              setComment={setComment}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleSend={handleSend}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CheckPage;


// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import StatusBar from "../components/StatusBar";
// import { ChevronRight } from "lucide-react";
// import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
// import CommentModal from "../components/CommentModal";

// const CheckPage = () => {
//   const { kadasterId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Состояния для данных карты
//   const [mapData, setMapData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Статус здания: buildingPresence (true => "Mavjud", false => "Mavjud emas")
//   const [buildingStatus, setBuildingStatus] = useState(false);

//   // Состояния для модального окна
//   const [showModal, setShowModal] = useState(false);
//   const [activeTab, setActiveTab] = useState("obyekt");
//   const [comment, setComment] = useState("");

//   useEffect(() => {
//     setLoading(true);
//     setError(null);

//     // Запрашиваем данные кадастра с бэкенда
//     fetch(`/api/cadastres/${kadasterId}`)
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error("Ошибка загрузки данных кадастра");
//         }
//         return res.json();
//       })
//       .then((data) => {
//         console.log("Полученные данные кадастра:", data);
//         // Парсим geojson для оригинальных координат
//         let originalCoords = [];
//         try {
//           const geojson = JSON.parse(data.geojson);
//           if (geojson.type === "FeatureCollection" && geojson.features.length > 0) {
//             const firstFeature = geojson.features[0];
//             if (firstFeature?.geometry?.coordinates) {
//               originalCoords = firstFeature.geometry.coordinates[0].map(
//                 ([lon, lat]) => [lat, lon]
//               );
//             }
//           } else if (geojson.type === "Feature" && geojson.geometry?.coordinates) {
//             originalCoords = geojson.geometry.coordinates[0].map(
//               ([lon, lat]) => [lat, lon]
//             );
//           }
//         } catch (e) {
//           console.error("Ошибка парсинга geojson:", e);
//         }
//         // Парсим fixedGeojson для изменённых координат
//         let modifiedCoords = [];
//         try {
//           const fixedGeojson = JSON.parse(data.fixedGeojson);
//           if (fixedGeojson.type === "FeatureCollection" && fixedGeojson.features.length > 0) {
//             const firstFeature = fixedGeojson.features[0];
//             if (firstFeature?.geometry?.coordinates) {
//               modifiedCoords = firstFeature.geometry.coordinates[0].map(
//                 ([lon, lat]) => [lat, lon]
//               );
//             }
//           } else if (fixedGeojson.type === "Feature" && fixedGeojson.geometry?.coordinates) {
//             modifiedCoords = fixedGeojson.geometry.coordinates[0].map(
//               ([lon, lat]) => [lat, lon]
//             );
//           }
//         } catch (e) {
//           console.error("Ошибка парсинга fixedGeojson:", e);
//         }
//         // Формируем объект карты с данными из API
//         setMapData({
//           originalPolygonCoords: originalCoords,
//           modifiedPolygonCoords: modifiedCoords,
//           verdict: data.verdict || "",
//         });
//         setBuildingStatus(data.buildingPresence);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         setError(err.message);
//         setLoading(false);
//       });

//     // Запрашиваем скриншот
//     fetch(`/api/cadastres/${kadasterId}/screenshot`)
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error("Ошибка загрузки скриншота");
//         }
//         return res.blob();
//       })
//       .then((blob) => {
//         const imageUrl = URL.createObjectURL(blob);
//         setMapData((prev) => prev ? { ...prev, photo: imageUrl } : { photo: imageUrl });
//       })
//       .catch((err) => {
//         console.error("Ошибка загрузки скриншота:", err);
//       });
//   }, [kadasterId, location.state]);

//   // Функция для отправки PATCH запроса к /api/cadastres/{id}/verification
//   const sendVerification = async (verified, commentStr) => {
//     const payload = { verified, comment: commentStr };
//     console.log("Отправка данных на сервер (verification):", payload);
//     try {
//       const response = await fetch(`/api/cadastres/${kadasterId}/verification`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (response.ok) {
//         console.log("Данные verification успешно отправлены");
//         return true;
//       } else {
//         console.error("Ошибка при отправке данных verification");
//         return false;
//       }
//     } catch (error) {
//       console.error("Ошибка при отправке данных verification:", error);
//       return false;
//     }
//   };

//   // Обработчик для кнопки "Davom etish" – verified: true, comment: ""
//   const handleProceed = async () => {
//     console.log("Нажата кнопка Davom etish. Отправка verification: { verified: true, comment: '' }");
//     const result = await sendVerification(true, "");
//     if (result) {
//       navigate("/");
//     }
//   };

//   // Обработчик для модального окна "Xatolik bor" – verified: false, comment формируется из выбранного таба и введённого текста
//   const handleSend = async () => {
//     const errorType = activeTab === "obyekt" ? "Obyekt joyiga mos emas" : "Toifasi mos emas";
//     const finalComment = comment ? `${errorType}: ${comment}` : errorType;
//     console.log("Нажата кнопка Yuklash. Отправка verification:", {
//       verified: false,
//       comment: finalComment,
//     });
//     const result = await sendVerification(false, finalComment);
//     if (result) {
//       setComment("");
//       setActiveTab("obyekt");
//       setShowModal(false);
//       navigate("/");
//     }
//   };

//   return (
//     <div className="min-h-screen w-screen bg-[#e4ebf3] flex">
//       {loading && (
//         <p className="text-gray-500 text-center mt-6">Загрузка данных карты...</p>
//       )}
//       {error && <p className="text-red-500 text-center mt-6">{error}</p>}
//       {!loading && !error && mapData && (
//         <div className="relative w-full h-[100vh] flex">
//           {/* Левая часть: Фото (если есть) */}
//           {mapData.photo && (
//             <div className="w-1/2 h-full">
//               <img
//                 src={mapData.photo}
//                 alt="Фото объекта"
//                 className="w-full h-full object-cover rounded-lg shadow-lg"
//               />
//             </div>
//           )}
//           {/* Правая часть: Карта */}
//           <div className={`${mapData.photo ? "w-1/2" : "w-full"} h-full`}>
//             <ArcGISTwoPolygonViewer
//               backendPolygonCoords={
//                 mapData.originalPolygonCoords && mapData.originalPolygonCoords.length > 0
//                   ? mapData.originalPolygonCoords
//                   : [[41.32, 69.25]]
//               }
//               modifiedPolygonCoords={
//                 mapData.modifiedPolygonCoords && mapData.modifiedPolygonCoords.length > 0
//                   ? mapData.modifiedPolygonCoords
//                   : [[41.32, 69.25]]
//               }
//             />
//           </div>
//           {/* Шапка с информацией */}
//           <div className="absolute top-0 left-0 p-6 w-full z-50">
//             <StatusBar currentStep={2} kadasterId={kadasterId} />
//           </div>
//           {/* Блок о статусе здания */}
//           <div className="absolute top-40 left-8 bg-white px-4 py-3 rounded-xl shadow-md">
//             <h2 className="text-lg font-semibold">
//               Qurilma:{" "}
//               <span className={buildingStatus ? "text-green-600" : "text-red-600"}>
//                 {buildingStatus ? "Mavjud" : "Mavjud emas"}
//               </span>
//             </h2>
//           </div>
//           {/* Блок для отображения verdict, если он есть */}
//           {mapData.verdict && (
//             <div className="absolute top-56 left-8 bg-white px-4 py-2 rounded-xl shadow-md">
//               <p className="text-lg font-semibold">
//                 Verdit: <span className="text-blue-600">{mapData.verdict}</span>
//               </p>
//             </div>
//           )}
//           {/* Кнопка "Davom etish" */}
//           <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4">
//             <button
//               className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center transition-all hover:bg-blue-700"
//               onClick={handleProceed}
//             >
//               Davom etish <ChevronRight className="ml-2 w-6 h-6" />
//             </button>
//           </div>
//           {/* Кнопка "Xatolik bor" */}
//           <div className="absolute bottom-6 left-8 bg-white p-3 rounded-xl">
//             <button
//               className="px-6 py-3 bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
//               onClick={() => setShowModal(true)}
//             >
//               Xatolik bor
//             </button>
//           </div>
//           {/* Модальное окно */}
//           {showModal && (
//             <CommentModal
//               comment={comment}
//               setComment={setComment}
//               activeTab={activeTab}
//               setActiveTab={setActiveTab}
//               handleSend={handleSend}
//               onClose={() => setShowModal(false)}
//             />
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CheckPage;
