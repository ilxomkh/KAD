import React, { useRef, useState, useEffect } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { Plus, Minus } from "lucide-react"; // Импорт иконок

// Вычисляем центр по экстенту (bounding box)
function computeCenter(ring) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  ring.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

const ArcGISTwoPolygonViewer = ({ backendPolygonCoords, modifiedPolygonCoords }) => {
  const mapRef = useRef(null);
  const [view, setView] = useState(null);
  const minZoomLevel = 10;

  // Преобразуем координаты из [lat, lng] в [lng, lat]
  const originalRing = backendPolygonCoords.map(coord => [coord[1], coord[0]]);
  const modifiedRing = modifiedPolygonCoords.map(coord => [coord[1], coord[0]]);

  useEffect(() => {
    const graphicsLayer = new GraphicsLayer();
    const map = new Map({
      basemap: "satellite",
      layers: [graphicsLayer]
    });

    // Для центрирования карты вычисляем комбинированный центр обоих полигонов
    const combinedRing = originalRing.concat(modifiedRing);
    const center = computeCenter(combinedRing);

    const viewInstance = new MapView({
      container: mapRef.current,
      map: map,
      center: center || [69.25, 41.32],
      zoom: 18,
      constraints: { minZoom: minZoomLevel }
    });
    setView(viewInstance);

    viewInstance.when(() => {
      viewInstance.ui.remove("attribution");
      viewInstance.ui.remove("zoom");

      // Рисуем оригинальный полигон
      if (originalRing && originalRing.length > 0) {
        const originalPolygon = {
          type: "polygon",
          rings: [originalRing],
          spatialReference: { wkid: 4326 }
        };
        const originalGraphic = new Graphic({
          geometry: originalPolygon,
          symbol: {
            type: "simple-fill",
            color: [255, 0, 0, 0], // Прозрачная заливка оригинального полигона
            outline: { color: [0, 255, 0], width: 3 }
          }
        });
        graphicsLayer.add(originalGraphic);
      }

      // Рисуем изменённый полигон
      if (modifiedRing && modifiedRing.length > 0) {
        const modifiedPolygon = {
          type: "polygon",
          rings: [modifiedRing],
          spatialReference: { wkid: 4326 }
        };
        const modifiedGraphic = new Graphic({
          geometry: modifiedPolygon,
          symbol: {
            type: "simple-fill",
            color: [0, 0, 255, 0], // Прозрачная заливка изменённого полигона
            outline: { color: [255, 0, 0], width: 2 }
          }
        });
        graphicsLayer.add(modifiedGraphic);
      }
    });

    return () => {
      if (viewInstance) viewInstance.destroy();
    };
  }, [backendPolygonCoords, modifiedPolygonCoords]);

  // Функция увеличения зума
  const handleZoomIn = () => {
    if (view) {
      view.zoom = view.zoom + 1;
    }
  };

  // Функция уменьшения зума
  const handleZoomOut = () => {
    if (view && view.zoom > minZoomLevel) {
      view.zoom = view.zoom - 1;
    }
  };

  return (
    <div className="relative">
      <div ref={mapRef} style={{ width: "100vw", height: "100vh" }}></div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 space-y-3 z-50 pointer-events-auto">
        <div className="grid grid-cols-1 gap-6">
          <button
            className="p-2 w-10 bg-white cursor-pointer shadow-lg rounded-xl hover:text-blue-500 text-gray-700"
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
    </div>
  );
};

export default ArcGISTwoPolygonViewer;
