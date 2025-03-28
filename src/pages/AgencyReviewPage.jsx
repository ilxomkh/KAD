import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { ChevronRight } from "lucide-react";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Импорт компонентов react-pdf-viewer
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const AgencyReviewPage = () => {
  useEffect(() => {
    const API_KEYS = [
      "localhost",
      "ВАШ_API_KEY_ЛОКАЛХОСТ",
      "127.0.0.1",
      "ВАШ_API_KEY_127.0.0.1",
      "yourdomain.uz",
      "ВАШ_API_KEY_ДОМЕН",
    ];

    if (window.CAPIWS) {
      window.CAPIWS.apikey(
        API_KEYS,
        (event, data) => {
          if (!data.success) {
            alert("Ошибка инициализации API-KEY: " + data.reason);
          }
        },
        (error) => {
          alert("Ошибка соединения с E-IMZO: " + error);
        }
      );
    }
  }, []);

  const { id } = useParams();
  if (!id) {
    console.error("Параметр id отсутствует");
  }
  const encodedId = encodeURIComponent(id);

  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Состояние для PDF URL
  const [pdfUrl, setPdfUrl] = useState(null);

  // Состояния для данных карты
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для модального окна комментария
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");

  // Состояние для показа карты
  const [showMapViewer, setShowMapViewer] = useState(false);
  // Состояние для идентификатора из ответа API
  const [recordId, setRecordId] = useState(null);

  // Состояние для модального окна подтверждения
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [sending, setSending] = useState(false);
  //ЭЦП
  const [signing, setSigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false); // новое
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Отсутствует токен авторизации");
      setLoading(false);
      return;
    }

    // Запрос данных кадастра
    fetch(`${BASE_URL}/api/cadastre/cad/${encodedId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки данных кадастра");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Полученные данные кадастра:", data);
        // Парсинг geojson для оригинальных координат
        let originalCoords = [];
        try {
          const geojson = JSON.parse(data.geojson);
          if (
            geojson.type === "FeatureCollection" &&
            geojson.features.length > 0
          ) {
            const firstFeature = geojson.features[0];
            if (firstFeature?.geometry?.coordinates) {
              originalCoords = firstFeature.geometry.coordinates[0].map(
                ([lon, lat]) => [lat, lon]
              );
            }
          } else if (
            geojson.type === "Feature" &&
            geojson.geometry?.coordinates
          ) {
            originalCoords = geojson.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга geojson:", e);
        }
        // Парсинг fixedGeojson для модифицированных координат
        let modifiedCoords = [];
        try {
          const fixedGeojson = JSON.parse(data.fixedGeojson);
          if (
            fixedGeojson.type === "FeatureCollection" &&
            fixedGeojson.features.length > 0
          ) {
            const firstFeature = fixedGeojson.features[0];
            if (firstFeature?.geometry?.coordinates) {
              modifiedCoords = firstFeature.geometry.coordinates[0].map(
                ([lon, lat]) => [lat, lon]
              );
            }
          } else if (
            fixedGeojson.type === "Feature" &&
            fixedGeojson.geometry?.coordinates
          ) {
            modifiedCoords = fixedGeojson.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          } else if (
            fixedGeojson.type === "Polygon" &&
            fixedGeojson.coordinates
          ) {
            modifiedCoords = fixedGeojson.coordinates[0].map(([lon, lat]) => [
              lat,
              lon,
            ]);
          }
        } catch (e) {
          console.error("Ошибка парсинга fixedGeojson:", e);
        }
        setMapData({
          originalPolygonCoords: originalCoords,
          modifiedPolygonCoords: modifiedCoords,
        });
        setRecordId(data.ID);
        setLoading(false);

        // Запрос PDF-отчёта
        if (data.ID !== undefined && data.ID !== null) {
          fetch(`${BASE_URL}/api/cadastre/${data.ID}/generated_report`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("Ошибка загрузки PDF отчёта");
              }
              return res.blob();
            })
            .then((blob) => {
              const url = URL.createObjectURL(blob);
              setPdfUrl(url);
            })
            .catch((err) => {
              console.error("Ошибка загрузки PDF отчёта:", err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [encodedId, location.state, token]);

  // Функция отправки PATCH запроса
  const sendAgencyVerification = async (verified, commentStr) => {
    if (recordId === null) {
      console.error("recordId отсутствует, невозможно отправить запрос");
      return false;
    }
    const payload = { verified, comment: commentStr };
    console.log("Отправка данных на сервер (agency_verification):", payload);
    try {
      const response = await fetch(
        `${BASE_URL}/api/cadastre/${recordId}/agency_verification`,
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
        console.log("Данные agency_verification успешно отправлены");
        return true;
      } else {
        console.error("Ошибка при отправке данных agency_verification");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при отправке данных agency_verification:", error);
      return false;
    }
  };

  //ЭЦП
  const loadKeys = () => {
    return new Promise((resolve, reject) => {
      fetch("http://127.0.0.1:8090/info")
        .then(() => {
          window.imzo.getKeyList((keyList) => {
            if (!keyList || keyList.length === 0) {
              reject("ЭЦП-ключи не найдены");
            } else {
              resolve(keyList);
            }
          });
        })
        .catch(() => reject("E-IMZO агент не запущен"));
    });
  };

  //ЭЦП
  const signPdfAndVerify = async (keyId) => {
    const dataToSign = "Kadastr hujjati tasdiqlandi";

    return new Promise((resolve, reject) => {
      window.imzo.createPkcs7(keyId, dataToSign, async (signedData) => {
        try {
          const response = await fetch(
            `${BASE_URL}/api/cadastre/${recordId}/verify_signature`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                signedData,
                originalData: dataToSign,
                recordId,
              }),
            }
          );

          if (!response.ok) {
            reject("Сервер не принял подпись");
          }

          const result = await response.json();
          if (result.success) {
            resolve(true);
          } else {
            reject("Подпись недействительна");
          }
        } catch (err) {
          reject("Ошибка верификации подписи: " + err.message);
        }
      });
    });
  };

  //эцп
  const loadKey = (keyId) => {
    return new Promise((resolve, reject) => {
      window.imzo.loadKey(keyId, (keyInfo) => {
        if (keyInfo) {
          resolve(keyInfo);
        } else {
          reject("Не удалось загрузить ключ");
        }
      });
    });
  };

  const getChallenge = async () => {
    const response = await fetch(
      `${BASE_URL}/api/cadastre/${recordId}/get_challenge`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Не удалось получить challenge");

    const data = await response.json();
    return data.challenge;
  };

  const signChallengeAndVerify = async (keyId) => {
    try {
      const challenge = await getChallenge();
      await loadKey(keyId);

      return new Promise((resolve, reject) => {
        window.imzo.createPkcs7(keyId, challenge, async (pkcs7) => {
          try {
            const response = await fetch(
              `${BASE_URL}/api/cadastre/${recordId}/verify_signature`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  signedData: pkcs7,
                  originalData: challenge,
                  recordId,
                }),
              }
            );

            const result = await response.json();

            if (result.success) {
              resolve(true);
            } else {
              reject("Подпись недействительна");
            }
          } catch (err) {
            reject("Ошибка проверки подписи: " + err.message);
          }
        });
      });
    } catch (err) {
      throw new Error("Ошибка подписи: " + err.message);
    }
  };

  //ЭЦП
  const handleSignWithKey = async () => {
    if (!selectedKey) {
      alert("Iltimos, kalitni tanlang");
      return;
    }

    setSigning(true);
    setSuccessMessage(false); // сбрасываем

    try {
      const isVerified = await signChallengeAndVerify(selectedKey.id);
      if (isVerified) {
        const result = await sendAgencyVerification(true, "");
        if (result) {
          setSuccessMessage(true); // показываем сообщение об успехе
          setTimeout(() => navigate("/"), 2500); // перекидываем через 2.5 сек
        }
      } else {
        alert("Подпись не прошла проверку");
      }
    } catch (err) {
      alert(err.message || "Ошибка при подписании");
    } finally {
      setSigning(false);
      setKeys([]);
      setSelectedKey(null);
    }
  };

  const handleProceed = async () => {
    setSigning(true);
    try {
      const foundKeys = await loadKeys();
      setKeys(foundKeys);
      setShowProceedModal(false);
    } catch (err) {
      alert(err);
      setSigning(false);
    }
  };

  const handleSend = async () => {
    const errorType =
      activeTab === "obyekt" ? "Obyekt joyiga mos emas" : "Toifasi mos emas";
    const finalComment = comment ? `${errorType}: ${comment}` : errorType;
    console.log("Нажата кнопка Yuklash. Отправка agency_verification:", {
      verified: false,
      comment: finalComment,
    });
    const result = await sendAgencyVerification(false, finalComment);
    if (result) {
      setComment("");
      setActiveTab("obyekt");
      setShowModal(false);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#e4ebf3] flex flex-col">
      <div className="px-8 pt-6">
        <StatusBar
          currentStep={3}
          id={recordId || id}
          onMapButtonClick={() => setShowMapViewer((prev) => !prev)}
          mapActive={showMapViewer}
        />
      </div>

      <div className="flex-grow flex justify-center items-center p-8">
        <div className="bg-white p-1 rounded-2xl max-w-4xl w-full flex flex-col items-center">
          {pdfUrl ? (
            // Используем react-pdf-viewer для отображения PDF
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div style={{ height: "100%", width: "100%" }}>
                <Viewer fileUrl={pdfUrl} />
              </div>
            </Worker>
          ) : (
            <p className="text-gray-500">Загрузка документа...</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 z-40 right-8 bg-white p-3 rounded-xl flex space-x-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center transition-all hover:bg-blue-700"
          onClick={() => setShowProceedModal(true)}
        >
          Davom etish <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
        </button>
      </div>

      <div className="fixed z-40 bottom-6 bg-white p-3 rounded-xl left-8 flex space-x-4">
        <button
          className="px-6 py-3 bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
          onClick={() => setShowModal(true)}
        >
          Xatolik bor
        </button>
      </div>

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

      {showMapViewer && (
        <div className="fixed inset-0 z-30">
          <ArcGISTwoPolygonViewer
            backendPolygonCoords={mapData?.originalPolygonCoords || []}
            modifiedPolygonCoords={mapData?.modifiedPolygonCoords || []}
            onClose={() => setShowMapViewer(false)}
          />
        </div>
      )}

      {showProceedModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
            <h2 className="text-lg dark:text-gray-900 cursor-default font-semibold mb-4">
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

      {keys.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white px-6 py-4 rounded-2xl max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              E-IMZO kalitni tanlang
            </h2>
            <ul className="mb-4 space-y-2 max-h-48 overflow-y-auto">
              {keys.map((key, index) => (
                <li
                  key={index}
                  className={`cursor-pointer px-3 py-2 rounded-lg border ${
                    selectedKey?.id === key.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedKey(key)}
                >
                  {key.name} — {key.serialNumber}
                </li>
              ))}
            </ul>
            <div className="flex justify-between space-x-4">
              <button
                className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                onClick={handleSignWithKey}
                disabled={signing}
              >
                {signing ? "Imzolanmoqda..." : "Imzolash"}
              </button>
              <button
                className="w-full py-2 bg-gray-200 rounded-xl"
                onClick={() => {
                  setKeys([]);
                  setSelectedKey(null);
                }}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Загрузка во время подписания */}
      {signing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <p className="text-lg font-medium mb-2">
              Идет подписание документа...
            </p>
            <p className="text-gray-500 text-sm">
              Пожалуйста, не закрывайте окно
            </p>
          </div>
        </div>
      )}

      {/* Успешно подписано */}
      {successMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-green-100 border border-green-300 p-6 rounded-xl shadow-lg text-center">
            <p className="text-lg font-semibold text-green-700 mb-2">
              Документ успешно подписан!
            </p>
            <p className="text-gray-600 text-sm">
              Сейчас произойдет перенаправление...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyReviewPage;
