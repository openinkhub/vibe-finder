import React from "react";
import { useLocation } from "react-router-dom";
import { PageShell, PageHero } from "../components/PageShell";
import { SeoIntro } from "../components/SeoIntro";
import CorporateMakeup from "../components/CorporateMakeup";
import BridalPackages from "../components/BridalPackages";
import { getPage } from "../lib/pages";
import { usePageImage } from "../hooks/usePageImages";

const Experience = ({ children, testid }) => {
  const page = getPage(useLocation().pathname);
  const image = usePageImage(page);
  return (
    <PageShell page={page} title={page?.name}>
      <div data-testid={testid}>
        <PageHero eyebrow={page.eyebrow} title={page.heroHeadline} subtitle={page.heroSub} image={image} />
        <SeoIntro page={page} />
        {children}
      </div>
    </PageShell>
  );
};

export const LookLabPage = () => <Experience testid="looklab-page"><CorporateMakeup /></Experience>;
export const TryOnPage = () => <Experience testid="tryon-page"><BridalPackages /></Experience>;
