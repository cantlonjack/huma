"use client";

import type { CanvasData } from "@/engine/canvas-types";
import EssenceCore from "./EssenceCore";
import RingLabel from "./RingLabel";
import QoLRing from "./QoLRing";
import ProductionRing from "./ProductionRing";
import ResourceRing from "./ResourceRing";
import CapitalConstellation from "./CapitalConstellation";
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
    <div className="canvas-container max-w-[840px] mx-auto px-6 py-8">
      {/* Essence Core */}
      <EssenceCore
        name={data.essence.name}
        land={data.essence.land}
        phrase={data.essence.phrase}
      />

      {/* Ring 1: Quality of Life */}
      <RingLabel label="Quality of Life" />
      <QoLRing nodes={data.qolNodes} />

      {/* Ring 2: Forms of Production */}
      <RingLabel label="Forms of Production" />
      <ProductionRing nodes={data.productionNodes} />

      {/* Ring 3: Future Resource Base */}
      <RingLabel label="Future Resource Base" />
      <ResourceRing nodes={data.resourceNodes} />

      {/* Capital Constellation */}
      <RingLabel label="Capital Profile" />
      <CapitalConstellation profile={data.capitalProfile} />

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
  );
}
