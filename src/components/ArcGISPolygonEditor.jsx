import React, { useRef, useState, useEffect } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { Plus, Minus, CheckIcon, Move } from "lucide-react";

const ArcGISPolygonEditor = ({ backendPolygonCoords, onConfirmChanges }) => {
  const mapRef = useRef(null);
  const [view, setView] = useState(null);
  const [polygonGraphic, setPolygonGraphic] = useState(null);
  const [sketchVM, setSketchVM] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false); // Состояние для отображения кнопки "Tasdiqlash"

  // Преобразуем координаты из [lat, lng] в [lng, lat] для ArcGIS
  const rings = backendPolygonCoords.map(coord => [coord[1], coord[0]]);
  const minZoomLevel = 10; // Минимально допустимый зум

  useEffect(() => {
    const graphicsLayer = new GraphicsLayer();
    const map = new Map({
      basemap: "satellite",
      layers: [graphicsLayer]
    });

    const viewInstance = new MapView({
      container: mapRef.current,
      map: map,
      center: rings[0] || [69.25, 41.32],
      zoom: 18,
      constraints: {
        minZoom: minZoomLevel,
      }
    });
    setView(viewInstance);

    viewInstance.when(() => {
      viewInstance.ui.remove("attribution");
      viewInstance.ui.remove("zoom");

      if (!rings || rings.length === 0) {
        console.error("Нет доступных координат для полигона");
        return;
      }
      const polygon = {
        type: "polygon",
        rings: rings,
        spatialReference: { wkid: 4326 }
      };

      const graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill",
          color: [66, 133, 244, 0.5],
          outline: { color: [21, 101, 192], width: 3 }
        }
      });
      graphicsLayer.add(graphic);
      setPolygonGraphic(graphic);

      const sketch = new SketchViewModel({
        view: viewInstance,
        layer: graphicsLayer,
        updateOnGraphicClick: true
      });
      setSketchVM(sketch);

      sketch.on("update", (event) => {
        if (!event.graphic || !event.graphic.geometry) return;
        console.log("Редактирование: состояние =", event.state);
      });
    });

    return () => {
      if (viewInstance) {
        viewInstance.destroy();
      }
    };
  }, [backendPolygonCoords]);

  const handleMove = () => {
    if (sketchVM && polygonGraphic) {
      setActiveButton("move");
      setShowConfirmButton(true); // Показываем кнопку "Tasdiqlash"
      sketchVM.update(polygonGraphic, { enableRotation: false, tool: "reshape" });
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
    if (polygonGraphic && polygonGraphic.geometry && polygonGraphic.geometry.rings) {
      const finalRings = polygonGraphic.geometry.rings[0];
      const finalCoords = finalRings.map(pt => [pt[1], pt[0]]);
      console.log("Новые координаты для отправки:", finalCoords);
      onConfirmChanges(finalCoords);
      setActiveButton(null);
      setShowConfirmButton(false); // Скрываем кнопку "Tasdiqlash" после подтверждения
      if (sketchVM) {
        sketchVM.cancel();
      }
    } else {
      console.error("Геометрия полигона не определена");
    }
  };

  return (
    <div className="relative">
      <div ref={mapRef} style={{ width: "100vw", height: "100vh" }}></div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 space-y-3 z-50 pointer-events-auto">
        <div className="grid grid-cols-1 gap-6">
          <button
            className={`p-2 w-10 bg-white shadow-lg rounded-xl hover:text-blue-500 text-gray-700 transition-all ${
              activeButton === "move" ? "bg-blue-500 text-gray-700" : "bg-blue-500"
            }`}
            onClick={handleMove}
          >
            <Move size={24} />
          </button>
          <button
            className="p-2 w-10 bg-white shadow-lg rounded-xl hover:text-blue-500 text-gray-700"
            onClick={handleZoomIn}
          >
            <Plus size={24} />
          </button>
          <button
            className="p-2 w-10 bg-white shadow-lg rounded-xl hover:text-blue-500 text-gray-700"
            onClick={handleZoomOut}
            disabled={view?.zoom <= minZoomLevel}
          >
            <Minus size={24} />
          </button>
        </div>
      </div>

      {/* Кнопка "Tasdiqlash" показывается только если showConfirmButton === true */}
      {showConfirmButton && (
        <div className="absolute top-40 right-8 rounded-xl flex space-x-4 z-50 pointer-events-auto">
          <button
            className="px-6 py-3 flex bg-white items-center justify-center text-black rounded-xl transition-all hover:bg-gray-100"
            onClick={handleConfirm}
          >
            Tasdiqlash <CheckIcon size={18} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ArcGISPolygonEditor;
