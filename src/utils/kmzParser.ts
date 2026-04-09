import JSZip from "jszip";

// ─── GeoJSON Types ────────────────────────────────────────────────────────────

export interface GeoJSONPosition {
  longitude: number;
  latitude: number;
  altitude?: number;
}

export type Coordinate = [number, number] | [number, number, number];

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: Coordinate[][];
}

export interface GeoJSONMultiPolygon {
  type: "MultiPolygon";
  coordinates: Coordinate[][][];
}

export interface GeoJSONFeature<
  G = GeoJSONPolygon | GeoJSONMultiPolygon,
  P = Record<string, unknown>
> {
  type: "Feature";
  geometry: G;
  properties: P;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: Array<GeoJSONFeature>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a KML coordinate string into an array of [lon, lat, alt?] tuples.
 * The KML spec uses "lon,lat,alt" space-separated tuples.
 */
function parseCoordinates(coordText: string): Coordinate[] {
  return coordText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((point) => {
      const parts = point.split(",").map(Number);
      if (parts.length >= 3) {
        return [parts[0], parts[1], parts[2]] as Coordinate;
      }
      return [parts[0], parts[1]] as Coordinate;
    });
}

/**
 * Extract a single GeoJSON Polygon ring from a <LinearRing> element.
 * Returns the outer ring (outerBoundaryIs) and any inner rings (innerBoundaryIs).
 */
function extractPolygonRings(polygonEl: Element): Coordinate[][] {
  const rings: Coordinate[][] = [];

  // Outer boundary
  const outer = polygonEl.querySelector(
    "outerBoundaryIs > LinearRing > coordinates"
  );
  if (outer?.textContent) {
    rings.push(parseCoordinates(outer.textContent));
  }

  // Inner boundaries (holes)
  const innerBoundaries = polygonEl.querySelectorAll(
    "innerBoundaryIs > LinearRing > coordinates"
  );
  innerBoundaries.forEach((inner) => {
    if (inner.textContent) {
      rings.push(parseCoordinates(inner.textContent));
    }
  });

  return rings;
}

/**
 * Get the text content of the first <name> child element, falling back to
 * the provided default.
 */
function getPlacemarkName(placemark: Element, fallback: string): string {
  const nameEl = placemark.querySelector(":scope > name");
  return nameEl?.textContent?.trim() || fallback;
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

/**
 * Parse a KMZ `File` object and return a GeoJSON FeatureCollection.
 *
 * - Unpacks the ZIP archive with JSZip.
 * - Finds the first `.kml` file inside.
 * - Extracts every `<Placemark>` that contains at least one `<Polygon>`.
 * - Placemarks with a single <Polygon> become `Polygon` features.
 * - Placemarks with multiple <Polygon>s become `MultiPolygon` features.
 * - Each feature's `properties.name` comes from the KML `<name>` tag.
 *
 * @throws If the file cannot be unzipped or no KML is found inside.
 */
export async function parseKmz(
  file: File
): Promise<GeoJSONFeatureCollection> {
  // 1. Unzip the KMZ
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);

  // 2. Find the .kml file
  const kmlFile = Object.values(contents.files).find(
    (f) => !f.dir && f.name.toLowerCase().endsWith(".kml")
  );

  if (!kmlFile) {
    throw new Error("No .kml file found inside the KMZ archive.");
  }

  // 3. Parse KML XML
  const kmlText = await kmlFile.async("string");
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlText, "application/xml");

  // Surface any parser errors
  const parseError = kmlDoc.querySelector("parsererror");
  if (parseError) {
    throw new Error(
      `Failed to parse KML: ${parseError.textContent?.slice(0, 200)}`
    );
  }

  // 4. Extract every Placemark that contains Polygon geometry
  const placemarks = Array.from(kmlDoc.querySelectorAll("Placemark"));
  const features: Array<GeoJSONFeature> = [];

  placemarks.forEach((placemark, index) => {
    const polygonEls = Array.from(placemark.querySelectorAll("Polygon"));
    if (polygonEls.length === 0) return; // skip non‑polygon placemarks

    const name = getPlacemarkName(placemark, `Area ${index + 1}`);
    // Collect any additional simple-data properties
    const extendedData: Record<string, unknown> = {};
    placemark.querySelectorAll("SimpleData").forEach((sd) => {
      const key = sd.getAttribute("name");
      if (key) extendedData[key] = sd.textContent?.trim() ?? null;
    });

    if (polygonEls.length === 1) {
      // Single Polygon feature
      const rings = extractPolygonRings(polygonEls[0]);
      if (rings.length === 0) return;

      features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: rings,
        },
        properties: { name, ...extendedData },
      });
    } else {
      // Multi-polygon feature
      const allRings = polygonEls
        .map((el) => extractPolygonRings(el))
        .filter((rings) => rings.length > 0);

      if (allRings.length === 0) return;

      features.push({
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: allRings,
        },
        properties: { name, ...extendedData },
      });
    }
  });

  // 5. Return FeatureCollection
  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Parse a raw `.kml` `File` object (not zipped) and return a GeoJSON FeatureCollection.
 * Uses the same Placemark extraction logic as parseKmz.
 *
 * @throws If the file text cannot be parsed as valid XML.
 */
export async function parseKml(
  file: File
): Promise<GeoJSONFeatureCollection> {
  const kmlText = await file.text();
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlText, "application/xml");

  const parseError = kmlDoc.querySelector("parsererror");
  if (parseError) {
    throw new Error(
      `Failed to parse KML: ${parseError.textContent?.slice(0, 200)}`
    );
  }

  const placemarks = Array.from(kmlDoc.querySelectorAll("Placemark"));
  const features: Array<GeoJSONFeature> = [];

  placemarks.forEach((placemark, index) => {
    const polygonEls = Array.from(placemark.querySelectorAll("Polygon"));
    if (polygonEls.length === 0) return;

    const name = getPlacemarkName(placemark, `Area ${index + 1}`);
    const extendedData: Record<string, unknown> = {};
    placemark.querySelectorAll("SimpleData").forEach((sd) => {
      const key = sd.getAttribute("name");
      if (key) extendedData[key] = sd.textContent?.trim() ?? null;
    });

    if (polygonEls.length === 1) {
      const rings = extractPolygonRings(polygonEls[0]);
      if (rings.length === 0) return;
      features.push({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: rings },
        properties: { name, ...extendedData },
      });
    } else {
      const allRings = polygonEls
        .map((el) => extractPolygonRings(el))
        .filter((rings) => rings.length > 0);
      if (allRings.length === 0) return;
      features.push({
        type: "Feature",
        geometry: { type: "MultiPolygon", coordinates: allRings },
        properties: { name, ...extendedData },
      });
    }
  });

  return { type: "FeatureCollection", features };
}
