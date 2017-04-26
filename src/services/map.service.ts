import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Location} from '../core/location.class';
import {Map} from 'leaflet';
import { Subject, Observer, Observable } from 'rxjs/Rx';

@Injectable()
export class MapService {
  public map: Map;
  public baseMaps: any;
  private vtLayer: any;
  private countyLayer: any;
  private buildingsLayer: any;

  constructor(private http: Http) {
    this.baseMaps = {
      OpenStreetMap: L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
      }),
      Esri: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      }),
      CartoDB: L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
      })
    };

    this.countyLayer = L.tileLayer.wms('http://localhost:8080/geoserver/hack/wms', {
      layers: 'hack:oberbergischer_kreis',
      format: 'image/png',
      transparent: true,
      opacity: 0.5
    });

    // let options = {'transparent': true};
    // debugger;
    // let source = L.WMS.source('http://localhost:8080/geoserver/hack/wms', options);
    // source.addSubLayer('hack:oberbergischer_kreis');
    // source.addTo(this.map);

    this.buildingsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/hack/wms', {
      layers: 'hack:gebaeude_clip',
      format: 'image/png',
      transparent: true,
      opacity: 0.5
    });

    // this.http.get('assets/example-websocket-output.json')
    //   .map(res => res.json())
    //   .subscribe(result => {
    //
    //   })

    let socket = new WebSocket('ws://localhost:8090/ws');

    let observable = Observable.create(
      (observer: Observer<MessageEvent>) => {
        socket.onmessage = observer.next.bind(observer);
        socket.onerror = observer.error.bind(observer);
        socket.onclose = observer.complete.bind(observer);
        return socket.close.bind(socket);
      }
    );
    let observer = {
      next: (data: Object) => {
        if (socket.readyState === WebSocket.OPEN) {
          debugger;
          socket.send(JSON.stringify(data));
        }
      }
    };
    Subject.create(observer, observable)
    .map(res => {
      return JSON.parse(res.data);
    })
    .subscribe(result => {
      if (this.map.hasLayer(this.vtLayer)) {
        this.map.removeLayer(this.vtLayer);
        console.log('remove Layer');
      }
      this.vtLayer = L.geoJSON(result, {
        onEachFeature: this.onEachFeature,
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: '#ff0000',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        }
      });
      console.log('add Layer');
      this.vtLayer.addTo(this.map);
    });
  }

  disableMouseEvent(elementId: string) {
    let element = <HTMLElement>document.getElementById(elementId);

    L.DomEvent.disableClickPropagation(element);
    L.DomEvent.disableScrollPropagation(element);
  }

  onEachFeature(feature, layer) {
    if (feature.properties) {
      layer.bindPopup(feature.properties.description);
    }
  }

  private toggleLayer(layer) {
    if (this.map.hasLayer(layer)) {
      this.map.removeLayer(layer);
    } else {
      this.map.addLayer(layer);
    }
  }

  toggleCountyLayer() {
    this.toggleLayer(this.countyLayer);
  }

  toggleBuildingsLayer() {
    this.toggleLayer(this.buildingsLayer);
  }

  toggleWarningLayer() {
    this.toggleLayer(this.vtLayer);
  }
}
