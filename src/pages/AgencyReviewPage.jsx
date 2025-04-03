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

  // Отправка PATCH запроса для agency_verification
  const sendAgencyVerification = async (verified, commentStr) => {
    if (recordId === null) {
      console.error("recordId отсутствует, невозможно отправить запрос");
      return false;
    }
    const payload = { verified, comment: commentStr };
    console.log("Отправка данных agency_verification:", payload);
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

  // ========== Функции для работы с ЭЦП (E‑IMZO) ==========

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

  // Получение challenge с сервера E‑IMZO (POST /frontend/challenge)
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

  // Аутентификация на бекенде: отправка подписанного challenge (PKCS7) на POST /backend/auth
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

  // Подписание документа (PDF): запрашивается пароль, происходит загрузка ключа и создаётся PKCS7
  // const signDocument = async (keyId, documentContent) => {
  //   const password = prompt("Введите пароль для ЭЦП (подпись документа):");
  //   if (!password) throw new Error("Пароль не введен");

  //   const loadedKeyId = await loadKey(keyId);
  //   console.log("🔐 Загруженный ключ (после loadKey):", loadedKeyId);
  //   if (!loadedKeyId) {
  //     throw new Error("❌ Не удалось загрузить ключ, keyId пустой");
  //   }
  //   const base64Document = btoa(documentContent); // подписываем в base64

  //   return new Promise((resolve, reject) => {
  //     window.CAPIWS.callFunction(
  //       {
  //         plugin: "pkcs7",
  //         name: "create_pkcs7",
  //         arguments: {
  //           key: loadedKeyId,
  //           data: base64Document,
  //           detached: true,
  //           password,
  //         },
  //       },
  //       (event, data) => {
  //         if (data.success) {
  //           resolve(data.pkcs7);
  //         } else {
  //           reject("Ошибка создания PKCS7 для документа: " + data.reason);
  //         }
  //       },
  //       (error) => {
  //         reject("Ошибка создания PKCS7 для документа: " + error);
  //       }
  //     );
  //   });
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

    try {
      // === 1. Загрузка ключа (временный идентификатор) ===
      const keyId = await loadKey(selectedKey);
      console.log("✅ Загружен временный keyId:", keyId);

      // === 2. Чтение содержимого PDF ===
      const pdfContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsBinaryString(pdfBlob);
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });

      // === 3. Подпись документа через create_pkcs7 ===
      const pkcs7 = await signDocument(keyId, pdfContent);
      console.log("🖋️ Документ подписан (PKCS7):", pkcs7);

      // === 4. Отправка на сервер для добавления Timestamp ===
      const timestampResponse = await fetch(
        "/api/eimzo/frontend/timestamp/pkcs7",
        {
          method: "POST",
          headers: {},
          body: pkcs7,
        }
      );

      if (!timestampResponse.ok) {
        throw new Error("❌ Ошибка получения Timestamp");
      }

      const { pkcs7b64: pkcs7WithTimestamp } = await timestampResponse.json();
      console.log("🕒 Получен PKCS7 + Timestamp:", pkcs7WithTimestamp);

      // === 5. Верификация на бекенде ===
      const verifyResponse = await fetch(
        BASE_URL + "/api/eimzo/pkcs7/verify/attached",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // <--- здесь добавляем токен
          },
          body: pkcs7WithTimestamp,
        }
      );

      if (!verifyResponse.ok) {
        throw new Error("❌ Ошибка верификации PKCS7 на сервере");
      }

      const verifyResult = await verifyResponse.json();
      console.log("✅ Верификация успешна:", verifyResult);

      // === 6. Успешно завершили ===
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
                    selectedKey?.id === key.name
                      ? ""
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  onClick={() => {
                    console.log("Выбран ключ:", key);
                    setSelectedKey(key);
                  }}
                >
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

      {/* {signing && (
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
      )} */}

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
