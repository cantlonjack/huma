"use client";

import type { CanvasData } from "@/engine/canvas-types";
import SpatialCanvas from "./SpatialCanvas";
import RingLabel from "./RingLabel";
import FieldLayers from "./FieldLayers";
import EnterpriseCards from "./EnterpriseCards";
import NodalActions from "./NodalActions";
import WeeklyRhythm from "./WeeklyRhythm";
import ValidationProtocol from "./ValidationProtocol";
import CanvasClosing from "./CanvasClosing";

interface LivingCanvasProps {
  data: CanvasData;
}

export default function LivingCanvas({ data }: LivingCanvasProps) {
  return (
    <div className="canvas-container">
      {/* ── Spatial Zone (SVG, center-outward) ── */}
      <SpatialCanvas data={data} />

      {/* ── Detail Zone (HTML, scrolling) ── */}
      <div className="max-w-[840px] mx-auto px-6 py-8">
        {/* Landscape Layers */}
        <RingLabel label="Landscape Reading" />
        <FieldLayers layers={data.fieldLayers} />

        {/* Enterprise Cards */}
        <RingLabel label="Enterprise Stack" />
        <EnterpriseCards enterprises={data.enterprises} />

        {/* Nodal Interventions */}
        <RingLabel label="Nodal Interventions" />
        <NodalActions interventions={data.nodalInterventions} />

        {/* Weekly Rhythm (optional — from Phase 6) */}
        {data.weeklyRhythm && (
          <>
            <RingLabel label="Weekly Rhythm" />
            <WeeklyRhythm rhythm={data.weeklyRhythm} />
          </>
        )}

        {/* Validation Protocol (optional — from Phase 6) */}
        {data.validationChecks && data.validationChecks.length > 0 && (
          <>
            <RingLabel label="Validation Protocol" />
            <ValidationProtocol checks={data.validationChecks} />
          </>
        )}

        {/* Closing */}
        <CanvasClosing closing={data.closing} epigraph={data.epigraph} />
      </div>
    </div>
  );
}
