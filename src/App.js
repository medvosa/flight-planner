import logo from './logo.svg';
import './App.css';

import { MapContainer, Marker, Popup, TileLayer, Polyline } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet';
import { useState } from  'react'


function Clicker({onClick}){

  function handleClick(e) {
    const {lat, lng} = e.latlng
    onClick( [lat, lng] );
  }
  useMapEvents({
    click: handleClick
  })
  return <></>

}

function App() {
  const [path, setPath] = useState([
    [55.505, 37],
    [55.705, 37.09],
    [55.96, 39.04],
    [55.507, 39.3],
  ]);
  const addPoint = (point)=>{
    setPath(v=>[...v, point])
  }
    ;
  return (
    <div className="App">
      map:
      <div style={{}}>
        <MapContainer style={{ height: "100vh", width:"100vhw" }} center={[55.505, 37]} zoom={13} >
          <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          
          <Polyline pathOptions={{ color: 'red' }} positions={path} />
          
          <Clicker onClick={addPoint}/>
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
