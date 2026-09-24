import React from "react";
import { PageShell } from "../components/PageShell";
import LookLab from "../components/lab/LookLab";
import FaceStudio from "../components/studio/FaceStudio";

export const LookLabPage = () => (
  <PageShell title="Look Lab">
    <div className="-mt-8 sm:-mt-10" data-testid="looklab-page"><LookLab /></div>
  </PageShell>
);

export const TryOnPage = () => (
  <PageShell title="Try-On Studio">
    <div className="-mt-8 sm:-mt-10" data-testid="tryon-page"><FaceStudio /></div>
  </PageShell>
);
