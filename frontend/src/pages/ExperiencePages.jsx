import React from "react";
import { useLocation } from "react-router-dom";
import { PageShell, PageHero } from "../components/PageShell";
import { SeoIntro } from "../components/SeoIntro";
import LookLab from "../components/lab/LookLab";
import FaceStudio from "../components/studio/FaceStudio";
import { getPage } from "../lib/pages";

const Experience = ({ children, testid }) => {
  const page = getPage(useLocation().pathname);
  return (
    <PageShell page={page} title={page?.name}>
      <div data-testid={testid}>
        <PageHero eyebrow={page.eyebrow} title={page.heroHeadline} subtitle={page.heroSub} image={page.image} />
        <SeoIntro page={page} />
        {children}
      </div>
    </PageShell>
  );
};

export const LookLabPage = () => <Experience testid="looklab-page"><LookLab /></Experience>;
export const TryOnPage = () => <Experience testid="tryon-page"><FaceStudio /></Experience>;
