



// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowUpRight, BriefcaseBusiness, Database, UsersRound, Trophy, ChevronRight } from "lucide-react";
// import LGMLogo from "../assets/LGMLogo.png";

// const HomeHub: React.FC = () => {
//   const navigate = useNavigate();

//   const modules = [
//     {
//       id: "crm",
//       label: "CRM System",
//       description: "Manage customer relationships and sales activity.",
//       icon: BriefcaseBusiness,
//       image: "https://www.lgmsports.in/banner/banner1.webp",
//       eyebrow: "CUSTOMER & SALES",
//     },
//     {
//       id: "erp",
//       label: "ERP System",
//       description: "Keep orders, inventory, and operations in sync.",
//       icon: Database,
//       image: "https://www.lgmsports.in/banner/banner2.webp",
//       eyebrow: "OPERATIONS",
//     },
//     {
//       id: "hrms",
//       label: "HRMS & Payroll",
//       description: "Support the people behind every great performance.",
//       icon: UsersRound,
//       image: "https://www.lgmsports.in/banner/history.webp",
//       eyebrow: "PEOPLE & PAYROLL",
//     },
//   ];

//   const announcements = [
//     "Professional skating equipment",
//     "Made for movement",
//     "LGM Sports · Pune, India",
//     "Since 2016",
//   ];

//   return (
//     <main className="min-h-screen bg-[#f7f6f2] text-[#17191b]">
//       <style>{`@keyframes lgm-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } } .lgm-marquee-track { animation: lgm-marquee 28s linear infinite; } @media (prefers-reduced-motion: reduce) { .lgm-marquee-track { animation: none; } }`}</style>

//       <div className="flex h-9 items-center justify-center bg-[#f07837] px-4 text-center text-[10px] font-extrabold uppercase tracking-[.2em] text-white sm:text-xs">
//         Free delivery · Professional skating equipment in India
//       </div>

//       <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
//         <div className="flex items-center gap-3">
//           <img src={LGMLogo} alt="LGM Sports" className="h-12 max-w-[150px] object-contain object-left sm:h-14" />
//           <span className="hidden h-8 w-px bg-black/10 sm:block" />
//           <span className="hidden text-[9px] font-bold uppercase leading-4 tracking-[.18em] text-[#77766f] sm:block">Sports<br />Workspace</span>
//         </div>
//         <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#62635f] sm:px-4 sm:text-xs">
//           <span className="h-2 w-2 rounded-full bg-[#f07837]" /> Team portal
//         </div>
//       </header>

//       <section className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8 lg:px-12">
//         <div className="relative min-h-[380px] overflow-hidden rounded-[28px] bg-[#20252a] sm:min-h-[440px]">
//           <img src="https://www.lgmsports.in/banner/banner1.webp" alt="LGM Sports inline skating equipment" className="absolute inset-0 h-full w-full object-cover object-center" />
//           <div className="absolute inset-0 bg-gradient-to-r from-[#111820]/90 via-[#111820]/65 to-[#111820]/5" />
//           <div className="absolute inset-0 bg-gradient-to-t from-[#111820]/45 to-transparent" />
//           <div className="relative flex min-h-[380px] max-w-2xl flex-col justify-center px-7 py-10 text-white sm:min-h-[440px] sm:px-12 lg:px-16">
//             <div className="mb-5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.24em] text-[#ffb27f] sm:text-xs">
//               <Trophy size={15} /> LGM Sports · Since 2016
//             </div>
//             <h1 className="max-w-xl text-4xl font-black uppercase leading-[.98] tracking-[-.05em] sm:text-6xl">
//               Built for the<br /><span className="text-[#f78a4c]">love of the game.</span>
//             </h1>
//             <p className="mt-5 max-w-md text-sm leading-6 text-white/75 sm:text-base">
//               Choose your workspace and keep every part of your sports business moving.
//             </p>
//             <a href="#workspaces" className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#f07837] px-5 py-3 text-xs font-extrabold uppercase tracking-[.12em] text-white transition hover:bg-[#dd6328]">
//               Explore workspaces <ChevronRight size={16} />
//             </a>
//           </div>
//           <div className="absolute bottom-5 right-6 hidden rounded-full border border-white/25 bg-black/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/80 backdrop-blur-sm md:block">Professional skating equipment</div>
//         </div>
//       </section>

//       <div className="overflow-hidden border-y border-[#f07837]/15 bg-[#fff0e7] py-3.5" aria-label="LGM Sports highlights">
//         <div className="lgm-marquee-track flex w-max items-center">
//           {[0, 1].map((copy) => (
//             <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
//               {announcements.map((item) => (
//                 <span key={`${copy}-${item}`} className="flex items-center px-6 text-[10px] font-extrabold uppercase tracking-[.19em] text-[#a64a1d] sm:px-10 sm:text-xs">
//                   {item}<span className="ml-12 h-2 w-2 rotate-45 bg-[#f07837] sm:ml-20" />
//                 </span>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>

//       <section id="workspaces" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
//         <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
//           <div>
//             <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.22em] text-[#e66d32]">One team. Every operation.</p>
//             <h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">Select your workspace</h2>
//           </div>
//           <p className="max-w-sm text-sm leading-6 text-[#77766f]">Choose the tools you need to keep your team and business on track.</p>
//         </div>

//         <div className="grid gap-5 md:grid-cols-3">
//           {modules.map((module, index) => {
//             const Icon = module.icon;
//             return (
//               <button
//                 key={module.id}
//                 type="button"
//                 onClick={() => navigate(`/${module.id}`)}
//                 className="group overflow-hidden rounded-2xl border border-black/[.07] bg-white text-left shadow-[0_8px_28px_rgba(28,29,26,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(28,29,26,.12)] focus:outline-none focus:ring-4 focus:ring-[#f07837]/20"
//               >
//                 <div className="relative h-40 overflow-hidden bg-[#252a2e]">
//                   <img src={module.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
//                   <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/5" />
//                   <span className="absolute left-5 top-5 text-[9px] font-extrabold tracking-[.2em] text-white/80">0{index + 1} / {module.eyebrow}</span>
//                   <span className="absolute bottom-4 left-5 grid h-11 w-11 place-items-center rounded-xl bg-[#f07837] text-white shadow-lg"><Icon size={22} strokeWidth={2} /></span>
//                   <ArrowUpRight className="absolute bottom-5 right-5 text-white/80 transition group-hover:-translate-y-1 group-hover:translate-x-1" size={20} />
//                 </div>
//                 <div className="p-5 sm:p-6">
//                   <h3 className="text-lg font-extrabold tracking-tight">{module.label}</h3>
//                   <p className="mt-2 min-h-10 text-sm leading-5 text-[#77766f]">{module.description}</p>
//                   <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#e66d32]">Open workspace <ChevronRight size={14} /></span>
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </section>

//       <footer className="border-t border-black/[.07] bg-white/70 px-5 py-6 sm:px-8 lg:px-12">
//         <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
//           <p className="text-xs font-semibold text-[#77766f]">© {new Date().getFullYear()} <span className="font-extrabold text-[#252a2e]">LGM Sports</span>. Built for the love of the game.</p>
//           <a href="https://www.lgmsports.in/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#e66d32] hover:text-[#a64a1d]">Visit lgmsports.in <ArrowUpRight size={13} className="ml-1 inline" /></a>
//         </div>
//       </footer>
//     </main>
//   );
// };

// export default HomeHub;


import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BriefcaseBusiness, Database, UsersRound } from "lucide-react";
import LGMLogo from "../assets/LGMLogo.png";

const HomeHub: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: "crm",
      label: "CRM",
      description: "Manage customer relationships and sales activity.",
      eyebrow: "CUSTOMER & SALES",
      icon: BriefcaseBusiness,
      image: "https://www.lgmsports.in/banner/banner1.webp",
    },
    {
      id: "erp",
      label: "ERP",
      description: "Keep orders, inventory, and operations in sync.",
      eyebrow: "OPERATIONS",
      icon: Database,
      image: "https://www.lgmsports.in/banner/banner2.webp",
    },
    {
      id: "hrms",
      label: "HRMS",
      description: "Support your people, teams, and payroll.",
      eyebrow: "PEOPLE & PAYROLL",
      icon: UsersRound,
      image: "https://www.lgmsports.in/banner/history.webp",
    },
  ];

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#080d12] px-4 py-8 text-white sm:px-8">
      <img
        src="https://www.lgmsports.in/banner/banner1.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#080d12]/80" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#080d12]/60 via-transparent to-[#f07837]/20" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <header className="mb-10 flex items-center justify-between gap-4 sm:mb-14">
          <img src={LGMLogo} alt="LGM Sports" className="h-12 max-w-[170px] object-contain object-left sm:h-14" />
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/80 backdrop-blur-sm sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-[#f07837]" /> Team portal
          </span>
        </header>

        <section aria-labelledby="workspace-title">
          <div className="mb-7 max-w-2xl sm:mb-10">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.24em] text-[#ff9a62] sm:text-xs">LGM Sports · Workspace</p>
            <h1 id="workspace-title" className="text-3xl font-black tracking-[-.04em] sm:text-5xl">Select your workspace</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">Choose a workspace to manage your team and business.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => navigate(`/${module.id}`)}
                  className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-white/15 bg-[#101820] text-left shadow-[0_18px_55px_rgba(0,0,0,.3)] transition duration-300 hover:-translate-y-1 hover:border-[#f07837]/70 focus:outline-none focus:ring-4 focus:ring-[#f07837]/40 sm:min-h-[300px]"
                >
                  <img src={module.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d12] via-[#080d12]/70 to-[#080d12]/10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#080d12]/30 to-transparent" />
                  <div className="relative flex min-h-[260px] flex-col justify-end p-5 sm:min-h-[300px] sm:p-7">
                    <span className="absolute left-5 top-5 text-[9px] font-extrabold tracking-[.2em] text-white/75 sm:left-7 sm:top-7">0{index + 1} · {module.eyebrow}</span>
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#f07837] text-white shadow-lg shadow-black/25">
                      <Icon size={23} strokeWidth={2} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{module.label}</h2>
                        <p className="mt-2 max-w-xs text-sm leading-5 text-white/70">{module.description}</p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 bg-black/20 text-white transition group-hover:border-[#f07837] group-hover:bg-[#f07837]">
                        <ArrowUpRight size={19} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
        <footer className="mt-8 text-center text-[10px] font-medium uppercase tracking-[.16em] text-white/45 sm:mt-10">
          © {new Date().getFullYear()} LGM Sports · Built for the game
        </footer>
      </div>
    </main>
  );
};

export default HomeHub;
