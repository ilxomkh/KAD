import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { ChevronRight } from "lucide-react";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Импорт стилей и компонентов для PDF просмотра
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const AgencyReviewPage = () => {
  // Инициализируем API-ключи для E‑IMZO при монтировании компонента
  useEffect(() => {
    const API_KEYS = [
      "localhost",
      "96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B",
      "127.0.0.1",
      "A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F",
      // Если для домена etirof.uz ключ не требуется или недействителен – его можно исключить
      // "etirof.uz",
      // "DE783306B4717AFE4AE1B185E1D967C265AA397A35D8955C7D7E38A36F02798AA62FBABE2ABA15C888FE2F057474F35A5FC783D23005E4347A3E34D6C1DDBAE5",
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

  // Состояния для PDF, карты, загрузки и ошибок
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для модальных окон и комментариев
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");
  const [showMapViewer, setShowMapViewer] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [sending, setSending] = useState(false);

  // Состояния для ЭЦП
  const [signing, setSigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);

  // Запрос данных кадастра и PDF-отчёта
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Отсутствует токен авторизации");
      setLoading(false);
      return;
    }

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
              setPdfBlob(blob);
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

  // Функция для получения списка ключей (автоматически ищет все сертификаты из DSKEYS)
  const loadKeys = () => {
    return new Promise((resolve, reject) => {
      if (window.CAPIWS && typeof window.CAPIWS.callFunction === "function") {
        window.CAPIWS.callFunction(
          {
            plugin: "pfx",
            name: "list_all_certificates",
          },
          (event, data) => {
            if (data.success && data.certificates?.length > 0) {
              resolve(data.certificates);
            } else {
              reject(
                "Нет доступных ключей в DSKEYS или ошибка: " + data.reason
              );
            }
          },
          (error) => {
            reject("Ошибка загрузки ключей из DSKEYS: " + error);
          }
        );
      } else {
        reject("CAPIWS.callFunction не доступна");
      }
    });
  };

  const loadKey = (itemObject, verifyPassword = true) => {
    return new Promise((resolve, reject) => {
      if (!itemObject) {
        return reject("Ключ не выбран");
      }

      if (!window.CAPIWS || typeof window.CAPIWS.callFunction !== "function") {
        return reject("⛔ CAPIWS не инициализирован");
      }

      // 1. Загружаем ключ
      window.CAPIWS.callFunction(
        {
          plugin: "pfx",
          name: "load_key",
          arguments: [
            itemObject.disk,
            itemObject.path,
            itemObject.name,
            itemObject.alias,
          ],
        },
        (event, data) => {
          if (data.success && data.keyId) {
            const keyId = data.keyId;
            console.log("🔐 Ключ загружен. Временный keyId:", keyId);

            // 2. Проверка пароля (откроется модалка)
            if (verifyPassword) {
              window.CAPIWS.callFunction(
                {
                  plugin: "pfx",
                  name: "verify_password",
                  arguments: [keyId],
                },
                (event, verifyData) => {
                  if (verifyData.success) {
                    console.log("✅ Пароль успешно подтвержден");
                    resolve(keyId);
                  } else {
                    reject("❌ Неверный пароль: " + (verifyData.reason || ""));
                  }
                },
                (err) =>
                  reject("❌ WebSocket ошибка при verify_password: " + err)
              );
            } else {
              resolve(keyId);
            }
          } else {
            reject(
              "❌ Ошибка загрузки ключа: " +
                (data.reason || "Неизвестная ошибка")
            );
          }
        },
        (err) => reject("❌ WebSocket ошибка при load_key: " + err)
      );
    });
  };

  // const getChallengeFromEimzo = async () => {
  //   try {
  //     const response = await fetch(`/api/eimzo/frontend/challenge`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Cache-Control": "no-store",
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Не удалось получить challenge. Статус: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log("📡 Ответ от сервера E-IMZO:", data);

  //     if (data.status !== 1) {
  //       throw new Error(`Ошибка от сервера E-IMZO: ${data.message || "Неизвестная ошибка"}`);
  //     }

  //     return data.challenge;
  //   } catch (error) {
  //     throw new Error("Ошибка при запросе challenge: " + error.message);
  //   }
  // };

  // Подписание challenge выбранным ключом (с запросом пароля) – возвращает PKCS7 документ

  const signDocument = async (keyId, binaryContent) => {
    const base64Document = btoa(binaryContent);

    return new Promise((resolve, reject) => {
      if (!keyId || !base64Document) {
        return reject("Не указан keyId или данные документа");
      }

      if (!window.CAPIWS || !window.CAPIWS.callFunction) {
        return reject("CAPIWS не инициализирован");
      }

      console.log("📛 Вызов create_pkcs7 с документом:", {
        keyId,
        detached: "yes",
      });

      window.CAPIWS.callFunction(
        {
          plugin: "pkcs7",
          name: "create_pkcs7",
          arguments: [base64Document, keyId, "yes"],
        },
        (event, data) => {
          if (data.success && data.pkcs7_64) {
            resolve(data.pkcs7_64);
          } else {
            reject("Ошибка PKCS7: " + (data.reason || "Неизвестная ошибка"));
          }
        },
        (error) => {
          reject("WebSocket ошибка: " + error);
        }
      );
    });
  };
  // const authenticate = async (PKCS7) => {
  //   const response = await fetch(`${BASE_URL}/backend/auth`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: PKCS7 ,
  //   });

  //   if (!response.ok) {
  //     throw new Error("Аутентификация не прошла (HTTP ошибка)");
  //   }

  //   const data = await response.json();
  //   console.log("Ответ от /backend/auth:", data);

  //   if (data.status !== 1) {
  //     throw new Error(data.message || "Ошибка аутентификации");
  //   }

  //   return data;
  // };

  // Получение Timestamp для PKCS7 (POST /frontend/timestamp/pkcs7)
  // const getTimestamp = async (pkcs7) => {
  //   const response = await fetch(`${BASE_URL}/frontend/timestamp/pkcs7`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ pkcs7 }),
  //   });
  //   if (!response.ok) throw new Error("Ошибка получения Timestamp");
  //   const data = await response.json();
  //   return data.timestamp;
  // };

  // Верификация подписи с Timestamp (POST /backend/pkcs7/verify/attached)
  // const verifyTimestamp = async (pkcs7Timestamp) => {
  //   const response = await fetch(`${BASE_URL}/backend/pkcs7/verify/attached`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ pkcs7: pkcs7Timestamp }),
  //   });
  //   if (!response.ok) throw new Error("Ошибка проверки подписи с Timestamp");
  //   const data = await response.json();
  //   return data;
  // };

  // Общая функция, объединяющая этапы аутентификации и подписания PDF-документа:

  const handleSignWithKey = async () => {
    console.log("🚀 Подпись документа запущена");

    if (!selectedKey) {
      alert("Пожалуйста, выберите ключ");
      return;
    }

    if (!pdfBlob) {
      alert("PDF документ не загружен");
      return;
    }

    setSigning(true);
    setSuccessMessage(false);

    // Повторный fetch с логом
    const retryFetch = async (url, options, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options);
          if (!response.ok) throw new Error(`Статус: ${response.status}`);
          return response;
        } catch (err) {
          console.warn(`🔁 Попытка ${i + 1} не удалась:`, err.message);
          if (i < retries - 1)
            await new Promise((res) => setTimeout(res, delay));
          else throw new Error("❌ Ошибка получения Timestamp после 3 попыток");
        }
      }
    };

    try {
      // === 1. Загрузка ключа ===
      const keyId = await loadKey(selectedKey);
      console.log("✅ Загружен временный keyId:", keyId);

      // === 2. Чтение PDF ===
      const pdfContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsBinaryString(pdfBlob);
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });

      // === 3. Подпись ===
      const pkcs7 = await signDocument(keyId, pdfContent);
      console.log("🖋️ Документ подписан (PKCS7):", pkcs7);

      // === 4. Timestamp через повторный fetch ===
      const timestampResponse = await retryFetch(
        "/api/eimzo/frontend/timestamp/pkcs7",
        {
          method: "POST",
          headers: {},
          body: pkcs7,
        }
      );

      const { pkcs7b64: pkcs7WithTimestamp } = await timestampResponse.json();
      console.log("🕒 Получен PKCS7 + Timestamp:", pkcs7WithTimestamp);

      // === 5. Верификация ===
      const verifyResponse = await fetch(
        BASE_URL + "/api/eimzo/pkcs7/verify/attached",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: pkcs7WithTimestamp,
        }
      );

      if (!verifyResponse.ok) {
        throw new Error("❌ Ошибка верификации PKCS7 на сервере");
      }

      const verifyResult = await verifyResponse.json();
      console.log("✅ Верификация успешна:", verifyResult);

      // === 6. Отправка agency_verification ===
      if (recordId === null) {
        console.error(
          "❌ recordId отсутствует, невозможно отправить verification"
        );
      } else {
        const payload = { verified: true, comment: "Документ подписан ЭЦП" };

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
          console.log("✅ Данные agency_verification успешно отправлены");
        } else {
          console.error("❌ Ошибка при отправке agency_verification");
        }
      }

      // === 7. Успех ===
      setSuccessMessage(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      console.error("❌ Ошибка:", err);
      alert(err.message || "Ошибка при подписании");
    } finally {
      setSigning(false);
      setKeys([]);
      setSelectedKey(null);
    }
  };

  // Обработка нажатия кнопки для получения списка ключей
  const handleProceed = async () => {
    // setSigning(true);
    try {
      const foundKeys = await loadKeys();
      setKeys(foundKeys);
      setShowProceedModal(false);
    } catch (err) {
      alert(err);
      setSigning(false);
    }
  };

  // Обработка отправки формы с комментарием (если имеется другая логика)
  const handleSend = async () => {
    const errorType =
      activeTab === "obyekt" ? "Obyekt joyiga mos emas" : "Toifasi mos emas";
    const finalComment = comment ? `${errorType}: ${comment}` : errorType;
    console.log("Отправка agency_verification:", {
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
            <Worker workerUrl="/pdf.worker.min.js">
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
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              E-IMZO kalitni tanlang
            </h2>
            <ul className="mb-4 space-y-3 h-auto overflow-y-auto">
              {keys.map((key, index) => (
                <li
                  key={index}
                  className={`cursor-pointer px-3 py-3 rounded-xl border-[#e9e9e9] ${
                    selectedKey?.name === key.name
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-900 hover:text-blue-600 transition-colors duration-300 border border-gray-200"
                  }`}
                  onClick={() => {
                    console.log("Выбран ключ:", key);
                    setSelectedKey(key);
                  }}
                >
                  {/* {selectedKey.id} */}
                  {key.name}
                </li>
              ))}
            </ul>
            <div className="flex justify-between space-x-4">
              <button
                className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                onClick={() => {
                  handleSignWithKey();
                }}
                disabled={signing}
              >
                {signing ? "Imzolanmoqda..." : "Imzolash"}
              </button>

              <button
                className="w-full py-2 bg-gray-50 rounded-xl text-gray-900 border border-gray-200 hover:bg-gray-100"
                onClick={() => {
                  console.log("Отмена выбора ключа");
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

      {signing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-xl shadow-lg text-center animate-fadeIn">
            <div className="flex flex-col items-center space-y-4">
              {/* Spinner */}
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-dashed border-black"></div>

              <p className="text-lg font-medium">Hujjat imzolanmoqda...</p>
              <p className="text-gray-500 text-sm">
                Iltimos, sahifani yopmang.
              </p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-green-100 border border-green-300 p-6 rounded-xl shadow-lg text-center animate-scaleIn">
          {/* Checkmark icon (inline SVG) */}
          <div className="flex justify-center">
          <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="122.88px"
            height="122.88px"
            viewBox="0 0 122.88 122.88"
            className="w-10 h-10 mb-4"
          >
            <g>
              <path
                fill="#6BBE66"
                d="M34.388,67.984c-0.286-0.308-0.542-0.638-0.762-0.981c-0.221-0.345-0.414-0.714-0.573-1.097 c-0.531-1.265-0.675-2.631-0.451-3.934c0.224-1.294,0.812-2.531,1.744-3.548l0.34-0.35c2.293-2.185,5.771-2.592,8.499-0.951 c0.39,0.233,0.762,0.51,1.109,0.827l0.034,0.031c1.931,1.852,5.198,4.881,7.343,6.79l1.841,1.651l22.532-23.635 c0.317-0.327,0.666-0.62,1.035-0.876c0.378-0.261,0.775-0.482,1.185-0.661c0.414-0.181,0.852-0.323,1.3-0.421 c0.447-0.099,0.903-0.155,1.356-0.165h0.026c0.451-0.005,0.893,0.027,1.341,0.103c0.437,0.074,0.876,0.193,1.333,0.369 c0.421,0.161,0.825,0.363,1.207,0.604c0.365,0.231,0.721,0.506,1.056,0.822l0.162,0.147c0.316,0.313,0.601,0.653,0.85,1.014 c0.256,0.369,0.475,0.766,0.652,1.178c0.183,0.414,0.325,0.852,0.424,1.299c0.1,0.439,0.154,0.895,0.165,1.36v0.23 c-0.004,0.399-0.042,0.804-0.114,1.204c-0.079,0.435-0.198,0.863-0.356,1.271c-0.16,0.418-0.365,0.825-0.607,1.21 c-0.238,0.377-0.518,0.739-0.832,1.07l-27.219,28.56c-0.32,0.342-0.663,0.642-1.022,0.898c-0.369,0.264-0.767,0.491-1.183,0.681 c-0.417,0.188-0.851,0.337-1.288,0.44c-0.435,0.104-0.889,0.166-1.35,0.187l-0.125,0.003c-0.423,0.009-0.84-0.016-1.241-0.078 l-0.102-0.02c-0.415-0.07-0.819-0.174-1.205-0.31c-0.421-0.15-0.833-0.343-1.226-0.575l-0.063-0.04 c-0.371-0.224-0.717-0.477-1.032-0.754l-0.063-0.06c-1.58-1.466-3.297-2.958-5.033-4.466c-3.007-2.613-7.178-6.382-9.678-9.02 L34.388,67.984L34.388,67.984z M61.44,0c16.96,0,32.328,6.883,43.453,17.987c11.104,11.125,17.986,26.493,17.986,43.453 c0,16.961-6.883,32.329-17.986,43.454C93.769,115.998,78.4,122.88,61.44,122.88c-16.961,0-32.329-6.882-43.454-17.986 C6.882,93.769,0,78.4,0,61.439C0,44.48,6.882,29.112,17.986,17.987C29.112,6.883,44.479,0,61.44,0L61.44,0z M96.899,25.981 C87.826,16.907,75.29,11.296,61.44,11.296c-13.851,0-26.387,5.611-35.46,14.685c-9.073,9.073-14.684,21.609-14.684,35.458 c0,13.851,5.611,26.387,14.684,35.46s21.609,14.685,35.46,14.685c13.85,0,26.386-5.611,35.459-14.685s14.684-21.609,14.684-35.46 C111.583,47.59,105.973,35.054,96.899,25.981L96.899,25.981z"
              />
            </g>
          </svg>
          </div>

          <p className="text-lg font-semibold text-green-700 mb-2">
            Hujjat muvaffaqiyatli imzolandi!
          </p>
        </div>
      </div>
      )}
    </div>
  );
};

export default AgencyReviewPage;
