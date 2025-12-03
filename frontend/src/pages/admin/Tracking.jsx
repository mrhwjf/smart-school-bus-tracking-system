import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  GeoJSON,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { AdminService, Realtime, SimulationService } from "../../api/services";
import socketService from "../../api/socket";
import { getDirections } from "../../api/ors";
import { Paper, Typography, Box, Chip, Button, Stack } from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { renderToStaticMarkup } from "react-dom/server";
import { useTranslation } from "react-i18next";
import { StatusChip } from "../../utils/status";
import VehicleList from "../../components/VehicleList";
import SimulationControl from "../../components/SimulationControl";
import { useSimulationSync } from "../../hooks/useSimulationSync";

const BusIcon = L.divIcon({
  html: renderToStaticMarkup(<DirectionsBusIcon sx={{ color: "#1976d2" }} />),
  className: "",
  iconSize: [24, 24],
});

const SelectedBusIcon = L.divIcon({
  html: renderToStaticMarkup(
    <DirectionsBusIcon sx={{ color: "#d32f2f", fontSize: 28 }} />
  ),
  className: "",
  iconSize: [30, 30],
});

function haversine(a, b) {
  if (!a || !b) return Infinity;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad((b.lat ?? b.latitude) - (a.lat ?? a.latitude));
  const dLon = toRad((b.lng ?? b.longitude) - (a.lng ?? a.longitude));
  const lat1 = toRad(a.lat ?? a.latitude);
  const lat2 = toRad(b.lat ?? b.latitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function minutesNow() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function minutesFromIso(iso) {
  if (!iso) return null;
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

export default function Tracking() {
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | onTime | delayed | stale
  const [routeGeojson, setRouteGeojson] = useState(null);
  const [orsCoordinates, setOrsCoordinates] = useState(new Map()); // tripId -> coordinates
  const [orsDataReady, setOrsDataReady] = useState(false); // Track if ORS data is loaded
  const [simLoading, setSimLoading] = useState(false);
  const { t } = useTranslation();
  const { isRunning, activeCount, startSimulation, stopSimulation } = useSimulationSync();
  const mapRef = useRef(null);
  const tripsRef = useRef([]); // Store trips for simulation
  
  useEffect(() => {
    let mounted = true;
    
    // Connect WebSocket
    socketService.connect();
    
    // Subscribe to bus location updates
    const unsubLocation = socketService.on('bus:location', (location) => {
      if (!mounted) return;
      
      setBuses((prev) => {
        const index = prev.findIndex((b) => b.bus_id === location.bus_id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = { ...next[index], ...location };
          return next;
        } else {
          return [...prev, location];
        }
      });
    });

    // Subscribe to all locations
    const unsubLocations = socketService.on('bus:locations', (locations) => {
      if (!mounted) return;
      setBuses((prev) => {
        const updated = [...prev];
        locations.forEach((loc) => {
          const index = updated.findIndex((b) => b.bus_id === loc.bus_id);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...loc };
          } else {
            updated.push(loc);
          }
        });
        return updated;
      });
    });
    
    // Load trips and routes concurrently
    Promise.all([
      AdminService.listTrips(),
      AdminService.listRoutes()
    ]).then(async ([tripData, routesData]) => {
      if (!mounted) return;
      
      // Parse trips
      const items = tripData?.items || tripData?.data?.items || (Array.isArray(tripData) ? tripData : []);
      console.log('Trips loaded:', items.length, items[0]); // Debug
      
      // Parse routes with stops
      const routes = Array.isArray(routesData) ? routesData : [];
      console.log('Routes loaded:', routes.length, routes[0]); // Debug
      
      // Enrich trips with stops from routes
      const enrichedTrips = items.map(trip => {
        const routeId = trip.route?.route_id || trip.route?.routeId || trip.routeId;
        const route = routes.find(r => (r.route_id || r.routeId) === routeId);
        
        // Normalize stops data
        let stops = trip.stops || [];
        if (stops.length === 0 && route?.stops) {
          stops = route.stops;
        }
        
        // Ensure stops have correct field names
        stops = stops.map(s => ({
          stop_id: s.stop_id || s.stopId,
          name: s.name,
          latitude: parseFloat(s.latitude),
          longitude: parseFloat(s.longitude),
          address: s.address,
          stop_order: s.stop_order || s.seq_index || 0
        })).sort((a, b) => a.stop_order - b.stop_order);
        
        return {
          ...trip,
          stops,
          route: trip.route || route
        };
      });
      
      console.log('Enriched trips with stops:', enrichedTrips[0]?.stops?.length, 'stops'); // Debug
      setTrips(enrichedTrips);
      tripsRef.current = enrichedTrips; // Store for later use
      
      // Extract buses from trips
      const busesFromTrips = enrichedTrips
        .filter(t => t.bus)
        .map(t => ({
          bus_id: t.bus.bus_id || t.bus.busId,
          plate_number: t.bus.plate_number || t.bus.plateNumber,
          status: t.bus.status,
          capacity: t.bus.capacity,
          // Initial mock location (sẽ được realtime update)
          latitude: 10.78 + (Math.random() - 0.5) * 0.05,
          longitude: 106.695 + (Math.random() - 0.5) * 0.05,
          recorded_at: new Date().toISOString()
        }));
      
      console.log('Buses extracted:', busesFromTrips.length); // Debug
      setBuses(busesFromTrips);
      
      // 🔥 Fetch ORS routes cho tất cả trips trước
      const orsPromises = enrichedTrips.map(async (trip) => {
        const stops = trip.stops?.filter(
          (s) => typeof s.latitude === "number" && typeof s.longitude === "number"
        ) || [];
        
        if (stops.length < 2) return null;
        
        try {
          const coords = stops.map((s) => [s.longitude, s.latitude]);
          const geo = await getDirections(coords, "driving-car", { instructions: false });
          
          // Extract coordinates từ GeoJSON
          if (geo?.features?.[0]?.geometry?.coordinates) {
            const orsCoords = geo.features[0].geometry.coordinates.map(([lng, lat]) => ({
              latitude: lat,
              longitude: lng
            }));
            return { tripId: trip.trip_id, coordinates: orsCoords };
          }
        } catch (err) {
          console.warn(`Failed to fetch ORS route for trip ${trip.trip_id}:`, err.message);
        }
        return null;
      });
      
      const orsResults = await Promise.all(orsPromises);
      const orsMap = new Map();
      orsResults.forEach(result => {
        if (result) orsMap.set(result.tripId, result.coordinates);
      });
      setOrsCoordinates(orsMap);
      
      console.log(`ORS fetched: ${orsMap.size} routes with coordinates`); // Debug
      setOrsDataReady(true); // Mark ORS data as ready
      
      // KHÔNG tự động start simulation - chờ user nhấn nút
      // Nếu có simulation đang chạy từ tab khác, start lại
      const storedRunning = localStorage.getItem('simulation_running');
      if (storedRunning === 'true') {
        console.log('⚡ Simulation running from another tab, restarting...');
        setTimeout(() => {
          handleStartSimulations(enrichedTrips, orsMap);
        }, 1000);
      }
      
      /*
      // Code cũ - auto start
      // 🛑 Dừng tất cả simulations cũ trước khi start mới
      try {
        await SimulationService.stopAllSimulations();
        console.log('✓ Stopped all old simulations');
        // Đợi 1 giây để backend cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.warn('Failed to stop old simulations:', err.message);
      }
      
      // 🚀 Tự động bắt đầu simulation cho tất cả trips với ORS coordinates
      enrichedTrips.forEach(trip => {
        if (!trip.trip_id) return;
        
        const busId = trip.bus?.bus_id || trip.bus?.busId;
        if (!busId) return;
        
        // Ưu tiên dùng ORS coordinates, fallback về stops
        const routeCoords = orsMap.get(trip.trip_id);
        
        if (!routeCoords) {
          console.warn(`Trip ${trip.trip_id}: No ORS route found, using stops fallback`);
          const stopCoords = trip.stops?.map(s => ({
            latitude: s.latitude,
            longitude: s.longitude,
            name: s.name
          })) || [];
          
          if (stopCoords.length >= 2) {
            SimulationService.startSimulationWithRoute(busId, stopCoords, 30)
              .then(() => {
                console.log(`✓ Started simulation for trip ${trip.trip_id} with ${stopCoords.length} stops (fallback)`);
              })
              .catch(err => {
                console.error(`✗ Failed to start simulation for trip ${trip.trip_id}:`, err.message);
              });
          }
          return;
        }
        
        console.log(`Starting simulation for trip ${trip.trip_id} with ${routeCoords.length} ORS waypoints`); // Debug
        
        // Gọi API với ORS route coordinates
        SimulationService.startSimulationWithRoute(busId, routeCoords, 30)
          .then(() => {
            console.log(`✓ Auto-started simulation for trip ${trip.trip_id} with ${routeCoords.length} ORS waypoints`);
          })
          .catch(err => {
            console.error(`✗ Failed to start simulation for trip ${trip.trip_id}:`, err.message);
          });
      });
      */
    }).catch(err => {
      console.error('Error loading tracking data:', err);
    });

    // Batch realtime updates every ~200ms to reduce re-renders
    const queueRef = { map: new Map() };
    const flush = () => {
      if (queueRef.map.size === 0) return;
      setBuses((prev) => {
        const next = [...prev];
        const indexById = new Map(next.map((b, i) => [b.bus_id, i]));
        queueRef.map.forEach((upd, id) => {
          const idx = indexById.get(id);
          if (idx != null) next[idx] = { ...next[idx], ...upd };
          else next.push(upd);
        });
        return next;
      });
      queueRef.map.clear();
    };
    const interval = setInterval(flush, 200);

    // Subscribe to realtime only when payload includes recorded_at (backend source). Ignore mock payloads.
    const unsub = Realtime.subscribe((payload) => {
      const ids = new Set(
        (trips || []).map((t) => t.bus?.bus_id).filter(Boolean)
      );
      payload.forEach((p) => {
        if (ids.has(p.bus_id) && p.recorded_at) queueRef.map.set(p.bus_id, p);
      });
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      unsub?.();
      unsubLocation();
      unsubLocations();
      // Don't disconnect socket - might be used by other components
    };
  }, []);
  
  // Handler để start simulations khi nhấn nút
  const handleStartSimulations = async (tripsData = null, orsMap = null) => {
    setSimLoading(true);
    
    try {
      const tripsToUse = tripsData || tripsRef.current;
      const orsToUse = orsMap || orsCoordinates;
      
      if (tripsToUse.length === 0) {
        console.warn('No trips available');
        return;
      }
      
      // Stop all old simulations first
      await SimulationService.stopAllSimulations();
      console.log('✓ Stopped all old simulations');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start simulations
      let successCount = 0;
      const promises = tripsToUse.map(async (trip) => {
        if (!trip.trip_id) return;
        
        const busId = trip.bus?.bus_id || trip.bus?.busId;
        if (!busId) return;
        
        // Ưu tiên dùng ORS coordinates, fallback về stops
        const routeCoords = orsToUse.get(trip.trip_id);
        
        try {
          if (!routeCoords) {
            // Fallback về stops
            const stopCoords = trip.stops?.map(s => ({
              latitude: s.latitude,
              longitude: s.longitude,
              name: s.name
            })) || [];
            
            if (stopCoords.length >= 2) {
              await SimulationService.startSimulationWithRoute(busId, stopCoords, 30);
              console.log(`✓ Started simulation for trip ${trip.trip_id} with ${stopCoords.length} stops (fallback)`);
              successCount++;
            }
          } else {
            await SimulationService.startSimulationWithRoute(busId, routeCoords, 30);
            console.log(`✓ Started simulation for trip ${trip.trip_id} with ${routeCoords.length} ORS waypoints`);
            successCount++;
          }
        } catch (err) {
          console.error(`✗ Failed to start simulation for trip ${trip.trip_id}:`, err.message);
        }
      });
      
      await Promise.all(promises);
      
      console.log(`🚀 Started ${successCount} simulations`);
      startSimulation(successCount); // Update sync state
    } catch (err) {
      console.error('Failed to start simulations:', err);
    } finally {
      setSimLoading(false);
    }
  };
  
  // Handler để stop simulations
  const handleStopSimulations = async () => {
    setSimLoading(true);
    
    try {
      await SimulationService.stopAllSimulations();
      console.log('🛑 Stopped all simulations');
      stopSimulation(); // Update sync state
    } catch (err) {
      console.error('Failed to stop simulations:', err);
    } finally {
      setSimLoading(false);
    }
  };
  
  const center = [10.78, 106.695];
  const selectedBus = buses.find((b) => b.bus_id === selectedId) || buses[0];
  const selectedTrip = trips.find((t) => (t.bus?.bus_id || t.bus?.busId) === selectedBus?.bus_id);
  const polyline = (selectedTrip?.stops || [])
    .filter(
      (s) => typeof s.latitude === "number" && typeof s.longitude === "number"
    )
    .map((s) => [s.latitude, s.longitude]);

  // Fetch ORS directions for the selected trip stops (if available)
  useEffect(() => {
    let mounted = true;
    setRouteGeojson(null);
    
    // Nếu đã có ORS coordinates từ lúc load, dùng luôn
    if (selectedTrip?.trip_id && orsCoordinates.has(selectedTrip.trip_id)) {
      const coords = orsCoordinates.get(selectedTrip.trip_id);
      if (coords && coords.length > 0) {
        // Convert sang GeoJSON format
        const geojson = {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coords.map(c => [c.longitude, c.latitude])
            },
            properties: {}
          }]
        };
        setRouteGeojson(geojson);
        return;
      }
    }
    
    const stops = (selectedTrip?.stops || []).filter(
      (s) => typeof s.latitude === "number" && typeof s.longitude === "number"
    );
    
    if (!stops || stops.length < 2) {
      console.log('ORS: Không đủ điểm dừng để vẽ đường', stops?.length || 0);
      return;
    }
    
    (async () => {
      try {
        // ORS expects [lng, lat]
        const coords = stops.map((s) => [s.longitude, s.latitude]);
        console.log('ORS: Fetching route for', coords.length, 'stops');
        
        const geo = await getDirections(coords, "driving-car", {
          instructions: false,
        });
        
        console.log('ORS: Route received', geo);
        if (mounted && geo) {
          setRouteGeojson(geo);
        }
      } catch (err) {
        console.error("ORS directions error:", err?.response?.data || err?.message || err);
        // Fallback: nếu ORS fail, vẫn hiển thị polyline thẳng
        console.log('ORS: Sử dụng polyline fallback');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedTrip, orsCoordinates]);

  // Prepare faint polylines for other trips to give context
  const otherTripPolylines = trips
    .filter((t) => t.trip_id !== selectedTrip?.trip_id)
    .map((t) => {
      const pts = (t.stops || [])
        .filter(
          (s) =>
            typeof s.latitude === "number" && typeof s.longitude === "number"
        )
        .map((s) => [s.latitude, s.longitude]);
      return { trip: t, positions: pts };
    });

  useEffect(() => {
    if (mapRef.current && selectedBus?.latitude && selectedBus?.longitude) {
      mapRef.current.setView(
        [selectedBus.latitude, selectedBus.longitude],
        14,
        { animate: true }
      );
    }
  }, [selectedId, selectedBus]);

  const nextStop = (() => {
    if (!selectedTrip || !selectedBus) return null;
    const coords = { lat: selectedBus.latitude, lng: selectedBus.longitude };
    let minIdx = -1;
    let minD = Infinity;
    (selectedTrip.stops || []).forEach((s, idx) => {
      const d = haversine(coords, { lat: s.latitude, lng: s.longitude });
      if (d < minD) {
        minD = d;
        minIdx = idx;
      }
    });
    const nextIdx = Math.min(
      (minIdx ?? 0) + 1,
      (selectedTrip.stops?.length || 1) - 1
    );
    return selectedTrip.stops?.[nextIdx] || null;
  })();

  const computePunctuality = (trip, bus) => {
    // Use startTime from trip (which comes from schedule)
    const startTimeStr = trip?.startTime || trip?.start_time;
    const startM = minutesFromIso(startTimeStr);
    if (startM == null || !bus?.latitude)
      return { label: "—", color: "default" };
    const nowM = minutesNow();
    const firstStop = trip?.stops?.[0];
    const farFromStart = firstStop
      ? haversine(
          { lat: bus.latitude, lng: bus.longitude },
          { lat: firstStop.latitude, lng: firstStop.longitude }
        ) > 800
      : false;
    const lateBy = nowM - startM;
    if (lateBy > 5 && farFromStart)
      return { label: `Trễ ${lateBy}p`, color: "warning" };
    return { label: "Đúng giờ", color: "success" };
  };

  const fleetRaw = trips
    .map((t) => {
      // Backend now returns bus data directly in trip
      const busId = t.bus?.bus_id || t.bus?.busId;
      const b = buses.find((x) => x.bus_id === busId) || {
        bus_id: busId,
        plate_number: t.bus?.plate_number || t.bus?.plateNumber,
        status: t.bus?.status,
        capacity: t.bus?.capacity,
        latitude: null,
        longitude: null
      };
      const pun = computePunctuality(t, b);
      // derive status meta based on staleness
      let statusMeta = null;
      if (b?.recorded_at) {
        const age = Date.now() - new Date(b.recorded_at).getTime();
        if (age > 30000)
          statusMeta = {
            label: "Mất tín hiệu",
            color: "default",
            key: "stale",
          };
      }
      if (!statusMeta) {
        statusMeta =
          pun.color === "warning"
            ? { label: "Trễ", color: "warning", key: "delayed" }
            : { label: "Đúng giờ", color: "success", key: "onTime" };
      }
      return { trip: t, bus: b, punctuality: pun, statusMeta };
    })
    .filter((x) => x.trip.bus);

  const fleetFiltered = fleetRaw.filter(({ trip, bus, statusMeta }) => {
    const q = (query || "").toLowerCase();
    const okQuery =
      !q ||
      (bus?.plate_number || "").toLowerCase().includes(q) ||
      (trip?.driver?.name || "").toLowerCase().includes(q) ||
      (trip?.route?.name || "").toLowerCase().includes(q);
    const okStatus = statusFilter === "all" || statusMeta?.key === statusFilter;
    return okQuery && okStatus;
  });
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t("tracking")}
        </Typography>
        <SimulationControl 
          isRunning={isRunning}
          activeCount={activeCount}
          onStart={() => handleStartSimulations()}
          onStop={handleStopSimulations}
          loading={simLoading}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Left: fleet list with search/filter */}
        <VehicleList
          items={fleetFiltered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />
        {/* Right: map */}
        <Paper sx={{ flex: 1, height: 520, overflow: "hidden" }}>
          <Box
            sx={{
              p: 1.5,
              pb: 0,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
              Bản đồ
            </Typography>
            {selectedTrip && <StatusChip code={selectedTrip.status} />}
            {nextStop && (
              <Chip size="small" label={`Điểm tiếp theo: ${nextStop.name}`} />
            )}
          </Box>
          <Box sx={{ position: "relative" }}>
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: 480 }}
              whenCreated={(map) => (mapRef.current = map)}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {/* render other trips faintly for context */}
              {otherTripPolylines.map((r) =>
                r.positions.length > 1 ? (
                  <Polyline
                    key={r.trip.trip_id}
                    positions={r.positions}
                    pathOptions={{ color: "#999", weight: 2, opacity: 0.35 }}
                  />
                ) : null
              )}

              {(polyline.length > 1 || routeGeojson) && (
                <>
                  {routeGeojson ? (
                    <GeoJSON
                      key={JSON.stringify(routeGeojson?.features?.[0]?.geometry?.coordinates?.slice(0, 2))}
                      data={routeGeojson}
                      style={{ color: "#1976d2", weight: 5, opacity: 0.9 }}
                    />
                  ) : polyline.length > 1 ? (
                    <Polyline
                      positions={polyline}
                      pathOptions={{
                        color: "#2e7d32",
                        weight: 4,
                        opacity: 0.7,
                        dashArray: "5, 10"
                      }}
                    />
                  ) : null}
                  {(selectedTrip?.stops || []).map((s, i) => (
                    <CircleMarker
                      key={s.stop_id}
                      center={[s.latitude, s.longitude]}
                      radius={6}
                      pathOptions={{
                        color: i === 0 ? "#0277bd" : "#2e7d32",
                        fillOpacity: 0.95,
                      }}
                    />
                  ))}
                  {/* start / end markers */}
                  {polyline.length > 0 && (
                    <>
                      <CircleMarker
                        center={polyline[0]}
                        radius={8}
                        pathOptions={{
                          color: "#0277bd",
                          fillColor: "#0277bd",
                          fillOpacity: 1,
                        }}
                      />
                      <CircleMarker
                        center={polyline[polyline.length - 1]}
                        radius={8}
                        pathOptions={{
                          color: "#d32f2f",
                          fillColor: "#d32f2f",
                          fillOpacity: 1,
                        }}
                      />
                    </>
                  )}
                </>
              )}
              {buses
                .filter((b) => b.latitude && b.longitude)
                .map((b) => (
                  <Marker
                    key={b.bus_id}
                    position={[b.latitude, b.longitude]}
                    icon={
                      b.bus_id === selectedBus?.bus_id
                        ? SelectedBusIcon
                        : BusIcon
                    }
                    eventHandlers={{ click: () => setSelectedId(b.bus_id) }}>
                    <Popup>
                      <div>
                        <strong>{b.plate_number}</strong>
                        <div>Trạng thái: {b.status}</div>
                        <div>
                          Thời gian:{" "}
                          {new Date(b.recorded_at).toLocaleTimeString()}
                        </div>
                        {trips.find((t) => t.bus?.bus_id === b.bus_id)?.driver
                          ?.name && (
                          <div>
                            Tài xế:{" "}
                            {
                              trips.find((t) => t.bus?.bus_id === b.bus_id)
                                ?.driver?.name
                            }
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
            
          </Box>
        </Paper>
      </Box>
    </>
  );
}
