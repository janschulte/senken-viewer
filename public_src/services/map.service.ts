import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Location} from "../core/location.class";
import {Map} from "leaflet";

@Injectable()
export class MapService {
    public map: Map;
    public baseMaps: any;
    private vtLayer: any;
    private countyLayer: any;
    private buildingsLayer: any;

    constructor(private http: Http) {
        this.baseMaps = {
            OpenStreetMap: L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            }),
            Esri: L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            }),
            CartoDB: L.tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            })
        };

        this.countyLayer = L.tileLayer.wms("http://localhost:8080/geoserver/hack/wms", {
          layers: "hack:oberbergischer_kreis",
          format: "image/png",
          transparent: true,
          opacity: 0.5
        });

        this.buildingsLayer = L.tileLayer.wms("http://localhost:8080/geoserver/hack/wms", {
          layers: "hack:gebaeude_clip",
          format: "image/png",
          transparent: true,
          opacity: 0.5
        });
    }

    disableMouseEvent(elementId: string) {
        let element = <HTMLElement>document.getElementById(elementId);

        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);
    }

    toggleAirPortLayer() {
      if (this.vtLayer) {
          this.map.removeLayer(this.vtLayer);
          delete this.vtLayer;
      } else {
          this.http.get("http://rawgit.com/haoliangyu/angular2-leaflet-starter/master/public/data/airports.geojson")
              .map(res => res.json())
              .subscribe(result => {
                  this.vtLayer = L.vectorGrid.slicer(result);
                  this.vtLayer.addTo(this.map);
              });
      }
    }

    private toggleLayer(layer) {
      if(this.map.hasLayer(layer)) {
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
}
