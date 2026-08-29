'use client';

import React from 'react';
import { GraduationCap, Briefcase, Calendar, MapPin, Award } from 'lucide-react';

export interface EducationItem {
  year: string;
  title: string;
  place: string;
  extra?: string;
  university?: string;
  description: string;
}

export interface ExperienceItem {
  year: string;
  company: string;
  role: string;
  description: string;
}

interface EducationProps {
  education?: EducationItem[];
  experience?: ExperienceItem[];
}

export default function Education({
  education: passedEducation,
  experience: passedExperience,
}: EducationProps) {
  const defaultEducation: EducationItem[] = [
    {
      year: '2025 - Present',
      title: 'MSc Computer Science',
      university: 'Indira University',
      place: 'Pune, Maharashtra',
      description:
        'Advancing core skills in enterprise software engineering, distributed systems, algorithms, and cloud computing.',
    },
    {
      year: '2020 - 2023',
      title: "Bachelor's Degree in Computer Science",
      place: 'Pune, Maharashtra',
      extra: 'Score: 60%',
      description:
        'Solid foundation in computer science fundamentals, OOP, database design, operating systems, and web technologies.',
    },
    {
      year: '2017 - 2020',
      title: 'Senior Secondary (XII)',
      place: 'PC College, Bihar',
      extra: 'Score: 60%',
      description:
        'Focused on Mathematics and Science with foundational coursework in computational logic and analytical problem-solving.',
    },
    {
      year: '2016 - 2017',
      title: 'Higher Secondary (X)',
      place: 'Saraswati Vidya Mandir, Bihar',
      extra: 'CGPA: 7.0',
      description:
        'Completed foundational secondary education with consistent academic performance and discipline.',
    },
  ];

  const defaultExperience: ExperienceItem[] = [
    {
      year: 'Feb 2024 - Nov 2024',
      company: 'SetTribe',
      role: 'Full Stack Developer Intern',
      description:
        'Contributed to customer-facing features, developed and consumed REST APIs, engineered UI components, and collaborated actively in team agile sprints.',
    },
  ];

  const education =
    passedEducation && passedEducation.length > 0 ? passedEducation : defaultEducation;
  const experience =
    passedExperience && passedExperience.length > 0 ? passedExperience : defaultExperience;

  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-2">Qualifications & Journey</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight animate-text-shimmer">
            Education & Experience
          </h2>
          <div className="w-16 h-1 bg-white mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Education Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-white/10 text-white border border-white/15">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Academic Path</h3>
                <p className="text-xs text-zinc-400">Formal degrees and academic achievements</p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:top-2 before:bottom-2 before:left-[11px] sm:before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-white before:via-zinc-700 before:to-transparent">
              {education.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Glowing Node Dot */}
                  <span className="absolute -left-[30px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-black group-hover:bg-white group-hover:scale-125 transition-all shadow-md shadow-white/30" />

                  <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-white/30 hover:bg-zinc-900 transition-all duration-300 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.year}
                      </span>
                      {item.extra && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-300">
                          <Award className="w-3.5 h-3.5" />
                          {item.extra}
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                      {item.university && <span className="font-semibold text-zinc-300">{item.university}</span>}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {item.place}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-white/10 text-white border border-white/15">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Work Experience</h3>
                <p className="text-xs text-zinc-400">Industry exposure & practical delivery</p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:top-2 before:bottom-2 before:left-[11px] sm:before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-white before:to-transparent">
              {experience.map((item, idx) => (
                <div key={idx} className="relative group">
                  <span className="absolute -left-[30px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-black group-hover:bg-white group-hover:scale-125 transition-all shadow-md shadow-white/30" />

                  <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-white/30 hover:bg-zinc-900 transition-all duration-300 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.year}
                    </span>

                    <h4 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {item.role}
                    </h4>

                    <p className="text-sm font-semibold text-zinc-300">
                      {item.company}
                    </p>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-tr from-zinc-900 to-black border border-white/10 space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                Industry Ready Mindset
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Experienced in fast-paced software cycles, code reviews, writing maintainable modules, and resolving challenging technical requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
