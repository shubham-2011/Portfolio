'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface SkillItem {
  name: string;
  icon: string;
  level?: string;
}

export interface SkillCategory {
  category: string;
  description: string;
  skills: SkillItem[];
}

interface SkillsProps {
  categories?: SkillCategory[];
}

export default function Skills({ categories: passedCategories }: SkillsProps) {
  const [activeTab, setActiveTab] = useState<string>('All');

  const defaultCategories: SkillCategory[] = [
    {
      category: 'Frontend',
      description: 'Building modern, fast, and accessible user interfaces',
      skills: [
        { name: 'Angular', icon: '/Skills/Angular.svg' },
        { name: 'React JS', icon: '/Skills/React.png' },
        { name: 'JavaScript', icon: '/Skills/js.svg' },
        { name: 'HTML5', icon: '/Skills/HTML.webp' },
        { name: 'CSS3', icon: '/Skills/css.svg' },
      ],
    },
    {
      category: 'Backend',
      description: 'Designing resilient microservices and secure server architectures',
      skills: [
        { name: 'Java', icon: '/Skills/java.webp' },
        { name: 'Spring Boot', icon: '/Skills/springboot.png' },
        { name: 'C / C++', icon: '/Skills/C.png' },
        { name: 'Python', icon: '/Skills/python.svg' },
        { name: 'ASP.NET', icon: '/Skills/asp-net.svg' },
        { name: 'PHP', icon: '/Skills/php.svg' },
      ],
    },
    {
      category: 'Database',
      description: 'Managing structured databases, schema design, and caching',
      skills: [
        { name: 'PostgreSQL DB', icon: '/Skills/pgadmin.png' },
        { name: 'MySQL DB', icon: '/Skills/mysql.png' },
        { name: 'MongoDB', icon: '/Skills/mongodb.png' },
        { name: 'Oracle DB', icon: '/Skills/oracle.png' },
      ],
    },
    {
      category: 'Cloud & Tools',
      description: 'DevOps, infrastructure, operating systems and build tools',
      skills: [
        { name: 'Linux', icon: '/Skills/linux.svg' },
        { name: 'AWS Cloud', icon: '/Skills/aws.svg' },
        { name: 'Android Studio', icon: '/Skills/android-studio.svg' },
      ],
    },
  ];

  const categories =
    passedCategories && passedCategories.length > 0 ? passedCategories : defaultCategories;

  const tabOptions = ['All', ...categories.map((c) => c.category)];

  const displayedCategories =
    activeTab === 'All'
      ? categories
      : categories.filter((c) => c.category === activeTab);

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-2">My Arsenal</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Technical Skills</h2>
          <div className="w-16 h-1 bg-white mx-auto mt-3 rounded-full" />
          <p className="text-zinc-400 text-sm sm:text-base mt-4">
            Hands-on expertise across full stack application development, server architectures, and relational databases.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-white text-black shadow-lg shadow-white/15 scale-105'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="space-y-12">
          {displayedCategories.map((group) => (
            <div key={group.category} className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    {group.category}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{group.description}</p>
                </div>
                <span className="text-xs text-zinc-500 font-mono">{group.skills?.length || 0} skills</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.skills?.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-white/40 hover:bg-zinc-900 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
                  >
                    <div className="w-14 h-14 relative mb-3 flex items-center justify-center">
                      <Image
                        src={skill.icon || '/Skills/js.svg'}
                        alt={`${skill.name} icon`}
                        width={48}
                        height={48}
                        className="object-contain max-h-12 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
