import React, { useRef, useState, useEffect } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { Plus, Minus, CheckIcon, Move } from "lucide-react";
import Circle from "@arcgis/core/geometry/Circle";

// Вычисляем центр полигона по его экстенту (bounding box)
function computeCenter(ring) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  ring.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

// Вычисляем угол (в градусах) между горизонталью и вектором от указанного центра к первой вершине
function computeAngle(ring, center) {
  if (!ring || ring.length === 0) return 0;
  const [x0, y0] = ring[0];
  const angleRad = Math.atan2(y0 - center[1], x0 - center[0]);
  const angleDeg = angleRad * (180 / Math.PI);
  return angleDeg;
}

const ArcGISPolygonEditor = ({
  backendPolygonCoords,
  onConfirmChanges,
  editable = false, // режим редактирования (true) или только просмотр (false)
  isHalfWidth = false, // если true, то ширина карты будет 50vw, иначе 100vw
}) => {
  const mapRef = useRef(null);
  const initialAngleRef = useRef(0);
  const initialCenterRef = useRef(null);
  const [view, setView] = useState(null);
  const [polygonGraphic, setPolygonGraphic] = useState(null);
  const [sketchVM, setSketchVM] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const minZoomLevel = 10;

  // Преобразуем координаты из [lat, lng] в [lng, lat]
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

      const center = computeCenter(ring);
      initialCenterRef.current = center;
      const computedInitialAngle = computeAngle(ring, center);
      initialAngleRef.current = computedInitialAngle;
      console.log(
        "Начальный угол (будем считать 0°):",
        computedInitialAngle,
        "°"
      );

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
        Math.sqrt(Math.pow(x - center[0], 2) + Math.pow(y - center[1], 2))
      );
      const maxDistance = Math.max(...distances) * 1.1;
      const circleGeometry = new Circle({
        center: center,
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
            console.log(
              "Блокируем попытку изменить форму или масштабировать полигон."
            );
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

      const currentRing = polygonGraphic.geometry.rings[0];
      const currentCenter = computeCenter(currentRing);
      const currentAngle = computeAngle(currentRing, currentCenter);
      let finalRotation = currentAngle - initialAngleRef.current;
      const normalizedRotation = ((finalRotation % 360) + 360) % 360;

      console.log("Отправка geometry:", finalGeometry);
      console.log("Начальный угол (0°):", initialAngleRef.current, "°");
      console.log("Текущий угол:", currentAngle, "°");
      console.log("Итоговый угол поворота (0-360):", normalizedRotation, "°");

      onConfirmChanges({
        geometry: finalGeometry,
        rotation: normalizedRotation,
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
      <div
        ref={mapRef}
        style={{ width: isHalfWidth ? "50vw" : "100vw", height: "100vh" }}
      ></div>

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
              className={`px-6 py-3 absolute top-36 right-8 flex cursor-pointer items-center justify-center rounded-xl transition-all ${
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
