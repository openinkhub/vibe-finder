import React from "react";
import { Link } from "react-router-dom";
import { Clock, GraduationCap, Check, ArrowUpRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { courses } from "../mock/mock";

const Courses = () => {
  return (
    <>
      <PageHeader
        eyebrow="Courses & Academy"
        title="Learn the art of"
        accent="makeup"
        subtitle="From self-grooming masterclasses to professional artistry programs — hands-on training designed to build real confidence and career-ready skills."
      />

      <section className="bg-[#F4F1EA] pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-8">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-[28px] overflow-hidden border border-[#E4DBCB] hover:shadow-2xl transition-all duration-300">
              <div className="relative h-60">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B20]/60 to-transparent" />
                <div className="absolute bottom-4 left-5 flex gap-2">
                  <span className="inline-flex items-center gap-1 bg-white/95 text-[#2B1B20] text-xs font-medium px-3 py-1.5 rounded-full"><Clock size={12} /> {c.duration}</span>
                  <span className="inline-flex items-center gap-1 bg-[#E62E6B] text-white text-xs font-medium px-3 py-1.5 rounded-full">{c.level}</span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-2xl font-bold text-[#2B1B20]">{c.title}</h2>
                  <span className="font-display text-2xl font-bold text-[#E62E6B] whitespace-nowrap">{c.price}</span>
                </div>
                <p className="mt-3 text-[#5C4E52] leading-relaxed">{c.desc}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {c.modules.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-sm text-[#4A3B3F]"><Check size={15} className="text-[#E62E6B]" /> {m}</div>
                  ))}
                </div>
                <Link to="/contact" className="group inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-full bg-[#2B1B20] text-white font-medium hover:bg-[#4A2530] transition-colors">
                  <GraduationCap size={18} /> Enroll now
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Courses;
