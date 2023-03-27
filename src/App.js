import logo from './logo.svg';
import './App.css';

import { MapContainer, Marker, Popup, TileLayer, Polyline, Tooltip, GeoJSON } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet';
import { useState, useRef, useEffect } from 'react'


import { Map as LeafletMap } from 'leaflet';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet-polylinedecorator';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12.5, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

class NoWheelZoomAnimationMap extends LeafletMap {
  get wheelPxPerZoomLevel() {
    return 1000;
  }
}

const useCustomZoom = (allowedZoomLevels) => {
  const mapRef = useRef();

  const map = useMapEvents({
    zoomstart: () => {
      mapRef.current = map.getZoom();
    },
    zoomend: () => {
      const currentZoom = map.getZoom();
      const prevZoom = mapRef.current;
      const zoomingIn = currentZoom > prevZoom;

      if (!allowedZoomLevels.includes(currentZoom)) {
        let targetZoom;
        console.log(`${currentZoom} not allowed`)

        if (zoomingIn) {
          console.log('azl',allowedZoomLevels)
          if(allowedZoomLevels.filter((z) => z > currentZoom).length==0){
            map.setZoom(Math.max(...allowedZoomLevels), {animate:false});
            return;
          }
          targetZoom = Math.min(...allowedZoomLevels.filter((z) => z > currentZoom));
          console.log('target', targetZoom)
          if (allowedZoomLevels.length==0) {//isNaN(targetZoom)) {
            console.log('inside')
            targetZoom = Math.max(...allowedZoomLevels);
          }
        } else {
          console.log('azl',allowedZoomLevels)
          if(allowedZoomLevels.filter((z) => z < currentZoom).length==0){
            map.setZoom(Math.min(...allowedZoomLevels), {animate:false});
            return;
          }
          targetZoom = Math.max(...allowedZoomLevels.filter((z) => z < currentZoom));
          console.log('target', targetZoom)
          if (allowedZoomLevels.length==0) {//isNaN(targetZoom)) {
            console.log('inside')
            targetZoom = Math.min(...allowedZoomLevels);
          }
          // targetZoom = Math.max(...allowedZoomLevels.filter((z) => z < currentZoom));
          // if (isNaN(targetZoom)) {
          //   targetZoom = Math.min(...allowedZoomLevels);
          // }
        }
        console.log('setTo', targetZoom)

        map.setZoom(targetZoom, { animate: false });
      }
    },
  });

  return null;
};

function Clicker({ onClick, onZoom, onMove }) {

  function handleClick(e) {
    if (e.originalEvent.target.classList.contains('leaflet-container')) {
      const { lat, lng } = e.latlng
      onClick([lat, lng]);
    }
  }

  useCustomZoom([13,16,17])

  const map = useMapEvents({
    click: handleClick,
    zoomlevelschange: () => console.log('aaa'),
    move: (v) => {
      onMove(map.getCenter())
      // console.log('move', map.getCenter())
    },
    zoomstart(){

    },
    zoomend: (v) => {
      // console.log('zoom', v.target._zoom)
      onZoom(v.target._zoom)
      // if(v.target._zoom==18)
      //   map.setZoom(17)
      // if(v.target._zoom==15)
      //   map.setZoom(16)
    },
    // zoomLevelChange:console.log,
    drag: console.log

  })
  return <></>

}


function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function flightRouteLength(points) {
  let totalLength = 0;

  for (let i = 1; i < points.length; i++) {
    const [lat1, lon1, height1] = points[i - 1];
    const [lat2, lon2, height2] = points[i];

    const horizontalDistance = haversineDistance(lat1, lon1, lat2, lon2);
    const verticalDistance = Math.abs(height1 - height2);
    const segmentLength = Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);

    totalLength += segmentLength;
  }

  return totalLength;
}

const PathMarker = ({ position, index, path, setPath }) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    function isFloat(str) {
      const regex = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
      return regex.test(str);
    }

    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;

    if (!isFloat(text) && text !== '') {
      e.target.value = e.target.value.slice(0, cursorPosition - 1) + e.target.value.slice(cursorPosition);
      e.target.selectionStart = cursorPosition - 1;
      e.target.selectionEnd = cursorPosition - 1;
    }
  };

  return (
    <Marker position={position} draggable eventHandlers={{
      popupopen(){
        setTimeout(()=>inputRef.current.value=position[2],0)
      },
      drag(v){
        console.log(/drag/,v.latlng.lng)
        // setPath(

          setPath(path => path.map((i, _num) => index == _num?  [
            v.latlng.lat, v.latlng.lng, i[2]
          ]: i))
        // )
      }
    }}>
      <Popup minWidth={90} >
        <div className="flex flex-col">
          <div className="tex-xs">Высота</div>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="p-2 border-neutral-300 border rounded"
              defaultValue={0}
              onInput={handleInputChange}
            />
            <div className="text-sm">м</div>
          </div>
          <div className="flex gap-2">
            <button
              className="mt-3 bg-red-500 hover:bg-red-400 text-white rounded p-2"
              onClick={() => setPath(path.filter((_, _num) => index !== _num))}
            >
              Удалить
            </button>
            <button
              className="mt-3 bg-green-500 hover:bg-green-600 text-white rounded p-2"
              onClick={() => setPath(path.map((i, _num) => index == _num?  [
                i[0], i[1],  parseFloat(inputRef.current.value)
              ]: i))}
            >
              Сохранить	
            </button>
          </div>
        </div>
      </Popup>
      
      <Tooltip direction="left" offset={[0, -10]} opacity={1} permanent>
        #{index+1}, {position[2]}м
      </Tooltip>
    </Marker>
  );
};



const Markers = ({ path, setPath }) => {
  return path.map((i,num) => (
    <PathMarker
      key={num}
      position={i}
      index={num}
      path={path}
      setPath={setPath}
    />
  ))

}


function downloadJSONFile(object, filename = "data.json") {
  const data = JSON.stringify(object, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}


const PolylineWithArrows = ({ positions }) => {
  const map = useMapEvents({});

  useEffect(() => {

    const polyline = L.polyline(positions).addTo(map);

      const arrowHead = L.Symbol.arrowHead({
        pixelSize: 10,
        polygon: false,
        pathOptions: { stroke: true, color: '#f00' },
      });

      const patterns = positions.map((_, index) => ({
        offset: `${((index + 1) / positions.length) * 100}%`,
        repeat: 0,
        symbol: arrowHead,
      }));

      const decorator = L.polylineDecorator(polyline, {
        patterns,
      }).addTo(map);

      return () => {
        map.removeLayer(polyline);
        map.removeLayer(decorator);
      };
    
  }, [map, positions]);

  return null;
};

function App() {
  const [mapMode, setMapMode] = useState(0)
  const [path, setPath] = useState([]);
  const addPoint = (point) => {
    setPath(v => [...v, [...point,100]])
  };
  
  const [geoJson, setGeoJson] = useState(null)

  useEffect(()=>{
    fetch('export.geojson').then(res=>res.json()).then(setGeoJson)
  },[])

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      console.log(feature)
      layer.bindTooltip(feature.properties.name, { permanent: true, direction: 'center' });
      console.log('layer:',layer)
      // layer.setText(feature.properties.name, {
      //   repeat: true,
      //   center: true,
      //   attributes: { dy: '5' },
      // });
    }

    
  };


  const dump = () => {
    downloadJSONFile(path)
  }
  const [zoom, setZoom] = useState(13)
  const [location, setLocation] = useState({
    lat: 59.93,
    lng: 30.31
  })
  function readJSONFileFromUser(callback) {
    const input = document.createElement("input");
    input.type = "file";

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) {
        alert("Файл не выбран");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          callback(json);
        } catch (error) {
          alert("Ошибка при парсинге JSON-файла");
        }
      };
      reader.onerror = () => {
        alert("Ошибка чтения файла");
      };
      reader.readAsText(file);
    });

    input.click();
  }
  function load() {
    readJSONFileFromUser(setPath)
  }


  const mapRef = useRef();

  useEffect(()=>{
    if(zoom == 18){
      setZoom(17)
    }
  },[zoom])

  return (
    <div className="App bg-neutral-200 flex flex-col min-h-screen">
      <div className='p-1'>
        <div className="ml-1 border border-neutral-300 bg-neutral-50 flex p-1 rounded">
          <div className='border-neutral-300 border bg-white p-1 text-sm w-fit min-w-[200px]'>
            <div className='flex'>
              <div>
                масштаб:
              </div>
              <div>
                {zoom}
              </div>
            </div>

            <div className='flex'>
              <div>
                Широта:
              </div>
              <div>
                {location?.lat.toFixed(4)}
              </div>
            </div>
            <div className='flex'>
              <div>
                Долгота:
              </div>
              <div>
                {location?.lng.toFixed(4)}
              </div>
            </div>
            <div className='flex'>
              <div>
                Длина маршрута: {flightRouteLength(path).toFixed(2)}м
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-1 ml-auto items-end'>
            <div className='flex'>
              <button onClick={() => setMapMode(0)} className={"flex items-center hover:bg-blue-700 text-white text-sm py-1 px-2 rounded-l flex gap-2 "+(!mapMode?'bg-blue-500':'bg-neutral-200 text-neutral-700 hover:text-white')} >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.65 4.97999L9.65 3.22999C9.23 3.07999 8.77 3.07999 8.35 3.21999L4.36 4.55999C3.55 4.83999 3 5.59999 3 6.45999V18.31C3 19.72 4.41 20.68 5.72 20.17L8.65 19.03C8.87 18.94 9.12 18.94 9.34 19.02L14.34 20.77C14.76 20.92 15.22 20.92 15.64 20.78L19.63 19.44C20.44 19.17 20.99 18.4 20.99 17.54V5.68999C20.99 4.27999 19.58 3.31999 18.27 3.82999L15.34 4.96999C15.12 5.04999 14.88 5.05999 14.65 4.97999ZM15 18.89L9 16.78V5.10999L15 7.21999V18.89Z" fill="white" fill-opacity="0.9" />
                </svg>
                <div>
                  Карта
                </div>
              </button>
              <button onClick={() => setMapMode(1)} className={"hover:bg-blue-700 text-white text-sm py-1 px-2 flex gap-2 items-center "+(mapMode==1?'bg-blue-500':'bg-neutral-200 text-neutral-700 hover:text-white')} >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.65 4.97999L9.65 3.22999C9.23 3.07999 8.77 3.07999 8.35 3.21999L4.36 4.55999C3.55 4.83999 3 5.59999 3 6.45999V18.31C3 19.72 4.41 20.68 5.72 20.17L8.65 19.03C8.87 18.94 9.12 18.94 9.34 19.02L14.34 20.77C14.76 20.92 15.22 20.92 15.64 20.78L19.63 19.44C20.44 19.17 20.99 18.4 20.99 17.54V5.68999C20.99 4.27999 19.58 3.31999 18.27 3.82999L15.34 4.96999C15.12 5.04999 14.88 5.05999 14.65 4.97999ZM15 18.89L9 16.78V5.10999L15 7.21999V18.89Z" fill="white" fill-opacity="0.9" />
                </svg>
                <div>
                  Спутник
                </div>
              </button>
              <button onClick={() => setMapMode(2)} className={"hover:bg-blue-700 text-white text-sm py-1 px-2 rounded-r flex gap-2 items-center "+(mapMode==2?'bg-blue-500':'bg-neutral-200 text-neutral-700 hover:text-white')} >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.65 4.97999L9.65 3.22999C9.23 3.07999 8.77 3.07999 8.35 3.21999L4.36 4.55999C3.55 4.83999 3 5.59999 3 6.45999V18.31C3 19.72 4.41 20.68 5.72 20.17L8.65 19.03C8.87 18.94 9.12 18.94 9.34 19.02L14.34 20.77C14.76 20.92 15.22 20.92 15.64 20.78L19.63 19.44C20.44 19.17 20.99 18.4 20.99 17.54V5.68999C20.99 4.27999 19.58 3.31999 18.27 3.82999L15.34 4.96999C15.12 5.04999 14.88 5.05999 14.65 4.97999ZM15 18.89L9 16.78V5.10999L15 7.21999V18.89Z" fill="white" fill-opacity="0.9" />
                </svg>
                <div>
                  Гибрид
                </div>
              </button>
            </div>
            <div className='flex'>
              <button onClick={dump} className="bg-white hover:bg-neutral-100 border border-neutral-500 text-neutral-500 py-1 px-2 rounded-l flex gap-1 border-r-neutral-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.79 13H13V4C13 3.45 12.55 3 12 3C11.45 3 11 3.45 11 4V13H9.21C8.76 13 8.54 13.54 8.86 13.85L11.65 16.64C11.85 16.84 12.16 16.84 12.36 16.64L15.15 13.85C15.46 13.54 15.24 13 14.79 13ZM4 20C4 20.55 4.45 21 5 21H19C19.55 21 20 20.55 20 20C20 19.45 19.55 19 19 19H5C4.45 19 4 19.45 4 20Z" fill="#304050" fill-opacity="0.9" />
                </svg>
                сохранить файл
              </button>
              <button onClick={load} className="bg-white hover:bg-neutral-100 border border-neutral-500 text-sm py-1 px-2 rounded-r flex items-center gap-1 border-l-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6H12L10.59 4.59C10.21 4.21 9.7 4 9.17 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM19 18H5C4.45 18 4 17.55 4 17V9C4 8.45 4.45 8 5 8H19C19.55 8 20 8.45 20 9V17C20 17.55 19.55 18 19 18Z" fill="#304050" fill-opacity="0.9" />
                </svg>
                открыть файл маршрута
              </button>
            </div>
          </div>

        </div>
      </div>
      <div className='flex flex-col flex-1'>
        <MapContainer 
          className='flex-1' 
          center={[location?.lat, location?.lng]} 
          zoom={zoom} 
          whenReady={(v) => console.log('zoomer', v)} 
          ref={mapRef}
          whenCreated={(map) => {
            map.__proto__ = NoWheelZoomAnimationMap.prototype;
          }} 
        >
          {/* working */}
          <TileLayer
            url={"./images/m_file_{z}_{x}_{y}" + (mapMode==1 ? "_sat" : "") + ".png"}
            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          
          {mapMode == 2 && <TileLayer
            url={"./images/m_file_{z}_{x}_{y}" + ("_sat.png")}
            style={{opacity:.13}}
            opacity={0.4}
            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />}


          
          {/* <TileLayer
            url={"./images/m_file_{z}_{x}_{y}" + (mapMode!=0 ? "_sat" : "") + ".png"}
            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          
          {mapMode == 2 && <TileLayer
            url={"./images/m_file_{z}_{x}_{y}" + (".png")}
            style={{opacity:.13}}
            opacity={0.4}
            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />} */}

          <Polyline pathOptions={{ color: 'red' }} positions={path} />
          {/* {geoJson && <GeoJSON data={geoJson} onEachFeature={onEachFeature} />} */}
          <Clicker onClick={addPoint} onZoom={setZoom} onMove={setLocation} />
          <Markers path={path} setPath={setPath} />
          <PolylineWithArrows positions={path} />
          {/* {markes} */}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
