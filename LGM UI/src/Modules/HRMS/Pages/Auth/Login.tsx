// import React, { useEffect, useState } from "react";
// import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, Trophy, Loader2 } from "lucide-react";
// import LGMLogo from "../../../../assets/LGMBorderLogo.png";
// import { Link, useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { useAuth } from "../../../../hooks/useAuth";
// import LoginBg from "../../../../assets/Loginbg.jpeg";

// const Login: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const { login, isAuthenticated } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/");
//       toast.success("Logged in successfully!");
//     }
//   }, [isAuthenticated, navigate]);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     if (!email.trim()) {
//       toast.error("Please enter your email.");
//       return;
//     }
//     if (!password.trim()) {
//       toast.error("Please enter your password.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await login(email, password);
//     } catch (err: unknown) {
//       toast.error(err instanceof Error ? err.message : "Login failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-[#080d12] p-4 sm:p-8 flex items-center justify-center text-white">
//       <div className="grid w-full max-w-6xl min-h-[680px] overflow-hidden rounded-[28px] border border-white/10 bg-[#101820] shadow-[0_32px_100px_rgba(0,0,0,.55)] lg:grid-cols-[1.08fr_.92fr]">
//         <section className="relative hidden min-h-[680px] overflow-hidden lg:block" aria-label="Sports platform welcome">
// <img
//   src={LoginBg}
//   alt="LGM Sports background"
//   className="absolute inset-0 h-full w-full object-cover object-center"
// />          <div className="absolute inset-0 bg-gradient-to-t from-[#080d12] via-[#080d12]/45 to-[#080d12]/15" />
//           <div className="absolute inset-0 bg-gradient-to-r from-[#080d12]/30 to-transparent" />

//           <div className="absolute left-10 top-9 flex items-center gap-3">
//             <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[bg-[#F07837]] text-[#101820] shadow-lg shadow-black/20">
//               <Trophy size={22} strokeWidth={2.5} />
//             </div>
//             <div>
//               <p className="text-sm font-black uppercase tracking-[.2em]">LGM Sports</p>
//               <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-white/55">Sports intelligence</p>
//             </div>
//           </div>

//           <div className="absolute bottom-11 left-10 right-10">
//             <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#F07837] backdrop-blur-sm">
//               <span className="h-1.5 w-1.5 rounded-full bg-[bg-[#F07837]] shadow-[0_0_10px_bg-[#F07837]]" /> Built for the next play
//             </div>
//             <h1 className="max-w-xl text-5xl font-black uppercase leading-[.98] tracking-[-.055em] xl:text-6xl">
//               Turn every<br />moment into <span className="text-[bg-[#F07837]]">momentum.</span>
//             </h1>
//             <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
//               Your team, performance data, and matchday operations—all moving in sync.
//             </p>
//             <div className="mt-8 flex items-center gap-3 text-xs font-semibold text-white/65">
//               <div className="flex -space-x-2">
//                 {[
//                   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
//                   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces",
//                   "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces",
//                 ].map((src) => <img key={src} src={src} alt="" className="h-8 w-8 rounded-full border-2 border-[#101820] object-cover" />)}
//               </div>
//               <span>Trusted by teams that play to win</span>
//             </div>
//           </div>
//           <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[.35em] text-white/35 [writing-mode:vertical-rl]">Train · Track · Triumph</span>
//         </section>

//         <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14" aria-labelledby="login-title">
//           <div className="w-full max-w-[390px]">
//             <div className="mb-10 flex items-center gap-3 lg:hidden">
//               <div className="grid h-10 w-10 place-items-center rounded-xl bg-[bg-[#F07837]] text-[#101820]"><Trophy size={20} /></div>
//             <div><p className="text-sm font-black uppercase tracking-[.18em]">LGM Sports</p><p className="text-[10px] uppercase tracking-[.2em] text-white/45">Sports intelligence</p></div>
//             </div>

//             <div className="mb-9">
//               <img src={LGMLogo} alt="LGM Sports" className="mb-8 h-24 max-w-[280px] object-contain object-left  " />
//               <p className="mb-3 text-[11px] font-bold uppercase tracking-[.24em] text-[bg-[#F07837]]">Your season starts here</p>
//               <h2 id="login-title" className="text-4xl font-extrabold tracking-[-.045em]">Welcome back.</h2>
//               <p className="mt-3 text-sm text-[#9ba7ae]">Sign in to get back in the game.</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div>
//                 <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#d2d9dc]">Email address</label>
//                 <div className="group relative">
//                   <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77858c] transition-colors group-focus-within:text-[bg-[#F07837]]" />
//                   <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourclub.com" className="h-[54px] w-full rounded-xl border border-white/10 bg-[#0b1218] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5f6c73] focus:border-[bg-[#F07837]]/70 focus:ring-4 focus:ring-[bg-[#F07837]]/10" />
//                 </div>
//               </div>

//               <div>
//                 <div className="mb-2 flex items-center justify-between">
//                   <label htmlFor="password" className="text-xs font-semibold text-[#d2d9dc]">Password</label>
//                   <Link to="/forgot-password" className="text-xs font-semibold text-[bg-[#F07837]] transition hover:text-white">Forgot password?</Link>
//                 </div>
//                 <div className="group relative">
//                   <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77858c] transition-colors group-focus-within:text-[bg-[#F07837]]" />
//                   <input id="password" name="password" type={isPasswordVisible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-[54px] w-full rounded-xl border border-white/10 bg-[#0b1218] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-[#5f6c73] focus:border-[bg-[#F07837]]/70 focus:ring-4 focus:ring-[bg-[#F07837]]/10" />
//                   <button type="button" onClick={() => setIsPasswordVisible((visible) => !visible)} aria-label={isPasswordVisible ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77858c] transition hover:text-white">
//                     {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               <button type="submit" disabled={isLoading} className="group mt-2 flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-[#F07837] text-sm font-extrabold text-[#111a18] transition hover:bg-[#F2BA7F] focus:outline-none focus:ring-4 focus:ring-[bg-[#F07837]]/25 disabled:cursor-not-allowed disabled:opacity-70">
//                 {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</> : <>Sign in to your team <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>}
//               </button>
//             </form>

//             <div className="my-8 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.18em] text-[#627078]"><span className="h-px flex-1 bg-white/10" /> Secure team access <span className="h-px flex-1 bg-white/10" /></div>
//             <p className="text-center text-xs leading-5 text-[#77858c]">Need access to your club workspace?<br /><span className="text-[#a9b3b8]">Contact your team administrator.</span></p>
//             <p className="mt-10 text-center text-[10px] font-medium uppercase tracking-[.16em] text-[#56636a]">© {new Date().getFullYear()} LGM Sports · Built for the game</p>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// };

// export default Login;


import React, { useEffect, useState } from "react";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, Trophy, Loader2 } from "lucide-react";
import LGMLogo from "../../../../assets/LGMBorderLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../../hooks/useAuth";
import LoginBg from "../../../../assets/Loginbg.jpeg";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
      toast.success("Logged in successfully!");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-dvh overflow-hidden bg-[#080d12] p-2 sm:p-4 flex items-center justify-center text-white">
      <div className="grid h-full w-full max-w-6xl min-h-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#101820] shadow-[0_32px_100px_rgba(0,0,0,.55)] lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden min-h-0 overflow-hidden lg:block" aria-label="Sports platform welcome">
<img
  src={LoginBg}
  alt="LGM Sports background"
  className="absolute inset-0 h-full w-full object-cover object-center"
/>          <div className="absolute inset-0 bg-gradient-to-t from-[#080d12] via-[#080d12]/45 to-[#080d12]/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080d12]/30 to-transparent" />

          <div className="absolute left-10 top-9 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F07837] text-[#101820] shadow-lg shadow-black/20">
              <Trophy size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[.2em]">LGM Sports</p>
              <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-white/55">Sports intelligence</p>
            </div>
          </div>

          <div className="absolute bottom-11 left-10 right-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#F07837] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F07837] shadow-[0_0_10px_#F07837]" /> Built for the next play
            </div>
            <h1 className="max-w-xl text-5xl font-black uppercase leading-[.98] tracking-[-.055em] xl:text-6xl">
              Turn every<br />moment into <span className="text-[#F07837]">momentum.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
              Your team, performance data, and matchday operations—all moving in sync.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-white/65">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces",
                ].map((src) => <img key={src} src={src} alt="" className="h-8 w-8 rounded-full border-2 border-[#101820] object-cover" />)}
              </div>
              <span>Trusted by teams that play to win</span>
            </div>
          </div>
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[.35em] text-white/35 [writing-mode:vertical-rl]">Train · Track · Triumph</span>
        </section>

        <section className="flex min-h-0 items-center justify-center overflow-hidden px-5 py-[clamp(0.75rem,3vh,2rem)] sm:px-8 lg:px-10" aria-labelledby="login-title">
          <div className="w-full max-w-[390px]">
            <div className="mb-[clamp(0.75rem,2vh,1.5rem)] flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F07837] text-[#101820]"><Trophy size={20} /></div>
            <div><p className="text-sm font-black uppercase tracking-[.18em]">LGM Sports</p><p className="text-[10px] uppercase tracking-[.2em] text-white/45">Sports intelligence</p></div>
            </div>

            <div className="mb-[clamp(0.75rem,2vh,1.5rem)]">
              <img src={LGMLogo} alt="LGM Sports" className="mb-[clamp(0.75rem,2vh,1.5rem)] h-[clamp(3.5rem,10vh,6rem)] max-w-[240px] object-contain object-left  " />
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.24em] text-[#F07837]">Your season starts here</p>
              <h2 id="login-title" className="text-[clamp(1.75rem,4vh,2.25rem)] font-extrabold tracking-[-.045em]">Welcome back.</h2>
              <p className="mt-3 text-sm text-[#9ba7ae]">Sign in to get back in the game.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-[clamp(0.75rem,2vh,1.25rem)]">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#d2d9dc]">Email address</label>
                <div className="group relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77858c] transition-colors group-focus-within:text-[#F07837]" />
                  <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourclub.com" className="h-[clamp(44px,6vh,54px)] w-full rounded-xl border border-white/10 bg-[#0b1218] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5f6c73] focus:border-[#F07837]/70 focus:ring-4 focus:ring-[#F07837]/10" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-[#d2d9dc]">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-[#F07837] transition hover:text-white">Forgot password?</Link>
                </div>
                <div className="group relative">
                  <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77858c] transition-colors group-focus-within:text-[#F07837]" />
                  <input id="password" name="password" type={isPasswordVisible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-[clamp(44px,6vh,54px)] w-full rounded-xl border border-white/10 bg-[#0b1218] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-[#5f6c73] focus:border-[#F07837]/70 focus:ring-4 focus:ring-[#F07837]/10" />
                  <button type="button" onClick={() => setIsPasswordVisible((visible) => !visible)} aria-label={isPasswordVisible ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77858c] transition hover:text-white">
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="group mt-2 flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-[#F07837] text-sm font-extrabold text-[#111a18] transition hover:bg-[#F2BA7F] focus:outline-none focus:ring-4 focus:ring-[#F07837]/25 disabled:cursor-not-allowed disabled:opacity-70">
                {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</> : <>Sign in to your team <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>}
              </button>
            </form>

            <div className="my-[clamp(0.75rem,2vh,1.5rem)] flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.18em] text-[#627078]"><span className="h-px flex-1 bg-white/10" /> Secure team access <span className="h-px flex-1 bg-white/10" /></div>
            <p className="text-center text-xs leading-5 text-[#77858c]">Need access to your club workspace?<br /><span className="text-[#a9b3b8]">Contact your team administrator.</span></p>
            <p className="mt-[clamp(0.75rem,2vh,1.5rem)] text-center text-[10px] font-medium uppercase tracking-[.16em] text-[#56636a]">© {new Date().getFullYear()} LGM Sports · Built for the game</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
