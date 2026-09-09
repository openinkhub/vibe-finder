import React from "react";
import { Link } from "react-router-dom";
import { Check, Heart, Sparkles, Camera, Clock } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { aboutStats } from "../mock/mock";

const values = [
  { icon: Heart, title: "Skin-first always", desc: "Every look starts with prep and skincare so makeup sits beautifully and lasts all day." },
  { icon: Camera, title: "Camera-ready finish", desc: "HD & airbrush techniques engineered to read flawless in photos, video and in person." },
  { icon: Sparkles, title: "Tailored to you", desc: "Looks designed around your features, outfit and the light of your special day." },
  { icon: Clock, title: "Effortless wear", desc: "Weightless, long-wear products so you stay radiant from first look to last dance." },
];

const About = () => {
  return (
    <>
      <PageHeader
        eyebrow="About Rekha"
        title="Nine years of making brides feel"
        accent="unforgettable"
        subtitle="Rekha Krishnamurthy is a Bangalore-based bridal & editorial makeup artist known for a skin-first, camera-ready approach that lets your natural beauty lead."
      />

      <section className="bg-[#F4F1EA] pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9" alt="Rekha at work" className="rounded-3xl object-cover w-full h-[520px] shadow-xl" />
              <div className="absolute -bottom-6 -right-4 md:right-8 bg-white rounded-2xl shadow-xl px-7 py-5 border border-[#EFEAE0]">
                <div className="font-display text-3xl font-bold text-[#E62E6B]">500+</div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-[#8B7F82] mt-1">Brides styled</div>
              </div>
            </div>
            <div>
              <h2 className="font-display text-[#4A2530] text-3xl md:text-4xl leading-tight">The philosophy behind every look</h2>
              <p className="mt-6 text-[#5C4E52] leading-relaxed">
                What began as a passion for helping friends feel confident has grown into nine years of artistry and 500+ brides across Bangalore. Rekha believes makeup should never mask &mdash; it should reveal the most radiant version of you.
              </p>
              <p className="mt-4 text-[#5C4E52] leading-relaxed">
                From intimate engagements to grand receptions, every appointment is unhurried, personal and centred on how you want to feel on your day. Beyond bridal, Rekha teaches self-grooming so everyday confidence lives on long after the wedding.
              </p>
              <div className="mt-8 space-y-3">
                {["Trained in HD, airbrush & traditional techniques", "Trusted by 500+ brides & 50+ students", "Premium, skin-friendly products only"].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-[#4A3B3F]"><Check size={18} className="text-[#E62E6B]" /> {t}</div>
                ))}
              </div>
              <Link to="/contact" className="inline-block mt-9 px-8 py-4 rounded-full bg-[#2B1B20] text-white font-medium hover:bg-[#4A2530] transition-colors">Book a free consultation</Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#DDD4C6] pt-12">
            {aboutStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-[#2B1B20]">{s.value}</div>
                <div className="text-[11px] tracking-[0.18em] uppercase text-[#8B7F82] mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EBE6DB] py-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#E62E6B]"><span className="w-6 h-px bg-[#E62E6B]" /> What guides me <span className="w-6 h-px bg-[#E62E6B]" /></span>
            <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl mt-5">A promise to every bride</h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-3xl p-8 border border-[#E4DBCB] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B]">
                  <v.icon size={24} />
                </div>
                <h3 className="font-display text-xl font-bold text-[#2B1B20] mt-5">{v.title}</h3>
                <p className="mt-3 text-sm text-[#6B5C60] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
