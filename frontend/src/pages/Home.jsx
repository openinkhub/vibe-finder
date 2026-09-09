import React from "react";
import Hero from "../components/Hero";
import SectionAbout from "../components/SectionAbout";
import SectionServices from "../components/SectionServices";
import SectionPortfolio from "../components/SectionPortfolio";
import SectionTestimonials from "../components/SectionTestimonials";
import SectionCTA from "../components/SectionCTA";

const Home = () => {
  return (
    <>
      <Hero />
      <SectionAbout />
      <SectionServices />
      <SectionPortfolio />
      <SectionTestimonials />
      <SectionCTA />
    </>
  );
};

export default Home;
