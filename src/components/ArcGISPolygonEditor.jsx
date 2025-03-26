import React, { useRef, useState, useEffect } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { Plus, Minus, CheckIcon, Move } from "lucide-react";
import Circle from "@arcgis/core/geometry/Circle";

// Вычисление центроида полигона по формуле многоугольника (при условии, что координаты в географической проекции)
function computeCentroid(ring) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  const len = ring.length;
  for (let i = 0; i < len; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % len];
    const a = x0 * y1 - x1 * y0;
    area += a;
    cx += (x0 + x1) * a;
    cy += (y0 + y1) * a;
  }
  area /= 2;
  cx /= (6 * area);
  cy /= (6 * area);
  return [cx, cy];
}

// Вычисляем угол (в градусах) между горизонталью и вектором от указанного центра к первой вершине
function computeAngle(ring, center) {
  if (!ring || ring.length === 0) return 0;
  const [x0, y0] = ring[0];
  const angleRad = Math.atan2(y0 - center[1], x0 - center[0]);
  return angleRad * (180 / Math.PI);
}

// Преобразование координат [lon, lat] в проекцию Web Mercator [x, y] в метрах
function geographicToWebMercator([lon, lat]) {
  const R = 6378137; // радиус Земли в метрах для Web Mercator
  const x = R * (lon * Math.PI / 180);
  const y = R * Math.log(Math.tan((Math.PI / 4) + (lat * Math.PI / 360)));
  return [x, y];
}

// Преобразование координат из Web Mercator [x, y] обратно в географические [lon, lat]
function webMercatorToGeographic([x, y]) {
  const R = 6378137;
  const lon = (x / R) * (180 / Math.PI);
  const lat = (Math.PI / 2 - 2 * Math.atan(Math.exp(-y / R))) * (180 / Math.PI);
  return [lon, lat];
}

// Преобразование массива координат (ring) из Web Mercator в географические координаты
function reprojectRingToGeographic(ring) {
  return ring.map(coord => webMercatorToGeographic(coord));
}

const ArcGISPolygonEditor = ({
  backendPolygonCoords,
  onConfirmChanges,
  editable = false, // режим редактирования (true) или только просмотр (false)
  isHalfWidth = false, // если true, то ширина карты будет 50vw, иначе 100vw
}) => {
  const mapRef = useRef(null);
  const initialAngleRef = useRef(0);
  const initialCenterRef = useRef(null); // хранится в географических координатах
  const [view, setView] = useState(null);
  const [polygonGraphic, setPolygonGraphic] = useState(null);
  const [sketchVM, setSketchVM] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const minZoomLevel = 10;

  // Преобразуем координаты из [lat, lng] в [lng, lat] – они приходят в географическом формате
  const ring = backendPolygonCoords.map((coord) => [coord[1], coord[0]]);

  useEffect(() => {
    const graphicsLayer = new GraphicsLayer();
    const map = new Map({
      basemap: "satellite",
      layers: [graphicsLayer],
    });
    const viewInstance = new MapView({
      container: mapRef.current,
      map: map,
      center: ring[0] || [69.25, 41.32],
      zoom: 18,
      constraints: { minZoom: minZoomLevel },
    });
    setView(viewInstance);

    viewInstance.when(() => {
      viewInstance.ui.remove("attribution");
      viewInstance.ui.remove("zoom");

      if (!ring || ring.length === 0) {
        console.error("Нет координат для полигона");
        return;
      }

      // Вычисляем центроид (в географических координатах) и сохраняем его как начальный
      const centroid = computeCentroid(ring);
      initialCenterRef.current = centroid;
      const computedInitialAngle = computeAngle(ring, centroid);
      initialAngleRef.current = computedInitialAngle;
      console.log("Начальный центроид:", centroid);
      console.log("Начальный угол (будем считать 0°):", computedInitialAngle, "°");

      const polygon = {
        type: "polygon",
        rings: [ring],
        spatialReference: { wkid: 4326 },
      };

      const graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill",
          color: [2, 166, 255, 0.5],
          outline: { color: [2, 31, 254], width: 2 },
        },
      });
      graphicsLayer.add(graphic);
      setPolygonGraphic(graphic);

      // Рисуем круг для визуальной ориентации
      const distances = ring.map(([x, y]) =>
        Math.sqrt(Math.pow(x - centroid[0], 2) + Math.pow(y - centroid[1], 2))
      );
      const maxDistance = Math.max(...distances) * 1.1;
      const circleGeometry = new Circle({
        center: centroid,
        radius: maxDistance,
        spatialReference: { wkid: 4326 },
      });
      const circleGraphic = new Graphic({
        geometry: circleGeometry,
        symbol: {
          type: "simple-line",
          color: [255, 0, 0],
          width: 2,
        },
      });
      graphicsLayer.add(circleGraphic);

      if (editable) {
        const sketch = new SketchViewModel({
          view: viewInstance,
          layer: graphicsLayer,
          updateOnGraphicClick: false,
          vertexSymbol: {
            type: "simple-marker",
            style: "circle",
            size: 0,
            color: [0, 0, 0, 0],
            outline: null,
          },
          defaultSymbols: {
            transform: {
              boundary: {
                type: "simple-line",
                color: [0, 0, 0, 0],
                width: 0,
              },
              scaleHandle: {
                type: "simple-marker",
                size: 0,
                color: [0, 0, 0, 0],
                outline: null,
              },
              rotationHandle: {
                type: "simple-marker",
                style: "circle",
                size: 10,
                color: [255, 0, 0, 0.8],
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              },
            },
          },
        });
        setSketchVM(sketch);

        sketch.on("update", (event) => {
          const blockedActions = ["reshape", "vertex-move", "scale"];
          if (blockedActions.includes(event.toolEventInfo?.type)) {
            console.log("Блокируем попытку изменить форму или масштабировать полигон.");
            sketch.cancel();
          }
          console.log("Update event:", event.state, event.toolEventInfo);
        });
      }
    });

    return () => {
      if (viewInstance) viewInstance.destroy();
    };
  }, [backendPolygonCoords, editable]);

  const handleTransform = () => {
    if (sketchVM && polygonGraphic) {
      setActiveButton("transform");
      setShowConfirmButton(true);
      sketchVM.update(polygonGraphic, {
        tool: "transform",
        enableRotation: true,
        enableScaling: false,
        enableMove: true,
        toggleToolOnClick: false,
        updateVertices: false,
      });
    }
  };

  const handleZoomIn = () => {
    if (view) {
      setActiveButton("scaleUp");
      view.zoom = view.zoom + 1;
      setTimeout(() => setActiveButton(null), 500);
    }
  };

  const handleZoomOut = () => {
    if (view && view.zoom > minZoomLevel) {
      setActiveButton("scaleDown");
      view.zoom = view.zoom - 1;
      setTimeout(() => setActiveButton(null), 500);
    }
  };

  const handleConfirm = () => {
    if (
      polygonGraphic &&
      polygonGraphic.geometry &&
      polygonGraphic.geometry.rings
    ) {
      const finalGeometry = {
        type: "polygon",
        rings: polygonGraphic.geometry.rings,
        spatialReference: polygonGraphic.geometry.spatialReference,
      };

      // Получаем текущий ring. Если SketchViewModel изменил проекцию, то ring может быть в Web Mercator.
      const currentRing = polygonGraphic.geometry.rings[0];
      // Преобразуем текущий ring из Web Mercator обратно в географические координаты
      const currentRingGeographic = reprojectRingToGeographic(currentRing);
      // Вычисляем центроид текущего полигона (в географических координатах)
      const currentCentroid = computeCentroid(currentRingGeographic);
      const currentAngle = computeAngle(currentRingGeographic, currentCentroid);
      let finalRotation = currentAngle - initialAngleRef.current;
      const normalizedRotation = ((finalRotation % 360) + 360) % 360;

      // Для вычисления смещения преобразуем оба центроида (начальный и текущий) в Web Mercator и вычисляем евклидово расстояние
      const initialWM = geographicToWebMercator(initialCenterRef.current);
      const currentWM = geographicToWebMercator(currentCentroid);
      const dx = currentWM[0] - initialWM[0];
      const dy = currentWM[1] - initialWM[1];
      const moveDistance = Math.sqrt(dx * dx + dy * dy);

      console.log("Отправка geometry:", finalGeometry);
      console.log("Начальный центроид:", initialCenterRef.current);
      console.log("Начальный угол (0°):", initialAngleRef.current, "°");
      console.log("Текущий угол:", currentAngle, "°");
      console.log("Итоговый угол поворота (0-360):", normalizedRotation, "°");
      console.log("Окончательный центроид (географические координаты):", currentCentroid);
      console.log("Перемещение (метры):", moveDistance);

      onConfirmChanges({
        geometry: finalGeometry,
        rotation: normalizedRotation,
        moveDistance, // передаём смещение в метрах
      });

      setActiveButton(null);
      setShowConfirmButton(true);
      setConfirmed(true);
      if (sketchVM) sketchVM.cancel();
    } else {
      console.error("Геометрия полигона не определена");
    }
  };

  return (
    <div className="relative cursor-grab active:cursor-grabbing">
      <div ref={mapRef} style={{ width: isHalfWidth ? "50vw" : "100vw", height: "100vh" }}></div>

      {editable && (
        <>
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2 space-y-3 z-50 pointer-events-auto">
            <div className="grid grid-cols-1 gap-6">
              <button
                className={`p-2 w-10 cursor-pointer shadow-lg rounded-xl hover:text-blue-500 text-gray-700 transition-all ${
                  activeButton === "transform"
                    ? "bg-blue-500 text-white hover:text-white"
                    : "bg-white"
                }`}
                onClick={handleTransform}
              >
                <Move size={24} />
              </button>
              <button
                className="p-2 w-10 bg-white shadow-lg cursor-pointer rounded-xl hover:text-blue-500 text-gray-700"
                onClick={handleZoomIn}
              >
                <Plus size={24} />
              </button>
              <button
                className="p-2 w-10 bg-white shadow-lg cursor-pointer rounded-xl hover:text-blue-500 text-gray-700"
                onClick={handleZoomOut}
                disabled={view?.zoom <= minZoomLevel}
              >
                <Minus size={24} />
              </button>
            </div>
          </div>

          {showConfirmButton && (
            <button
              className={`px-6 py-3 absolute top-42 right-8 flex cursor-pointer items-center justify-center rounded-xl transition-all ${
                confirmed
                  ? "bg-green-500 text-white"
                  : "bg-white border border-[#e9e9eb] hover:border-green-500 text-black hover:text-green-500"
              }`}
              onClick={handleConfirm}
            >
              {confirmed ? "Tasdiqlandi" : "Tasdiqlash"}
              <CheckIcon size={18} className="ml-2" />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ArcGISPolygonEditor;
