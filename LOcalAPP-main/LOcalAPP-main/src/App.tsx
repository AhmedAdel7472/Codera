import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Code2,
  User,
  Building2,
  Heart,
  GraduationCap,
  Rocket,
  Puzzle,
  Trophy,
  Users,
  CheckCircle2,
} from 'lucide-react';

type Screen =
  | 'main'
  | 'builder'
  | 'mentor'
  | 'individual'
  | 'organization';

const IMAGES = {
  builderRole: '/img/bilder.jpeg',
  mentorRole: '/img/monter.jpeg',
  coider: '/img/coder.jpeg',
  coder: '/img/coder.jpeg',
  codeGuide: '/img/guide.jpeg',
  guide: '/img/guide.jpeg',
  programmer: '/img/coder.jpeg',
  teacher: '/img/guide.jpeg',
  school: '/img/school.jpeg',
  center: '/img/specialist Center.jpeg',
};

const FALLBACK_IMAGES = {
  builderRole: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  mentorRole: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80',
  coider: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  codeGuide: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80',
  programmer: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  specialEd: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
  school: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
  center: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
};

type FallbackKey = keyof typeof FALLBACK_IMAGES;

interface ImageWithFallbackProps {
  src: string;
  fallbackKey: FallbackKey;
  alt: string;
  className?: string;
}

const ImageWithFallback = ({
  src,
  fallbackKey,
  alt,
  className = '',
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? FALLBACK_IMAGES[fallbackKey] : imgSrc}
      alt={alt}
      className={className}
      onError={(event) => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(FALLBACK_IMAGES[fallbackKey]);
        } else {
          event.currentTarget.style.display = 'none';
        }
      }}
    />
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [history, setHistory] = useState<Screen[]>([]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  const navigate = (screen: Screen) => {
    setHistory((previous) => [...previous, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const previous = newHistory.pop();
    setHistory(newHistory);
    if (previous) setCurrentScreen(previous);
  };

  return (
    <div className="min-h-screen w-full selection:bg-teal-500/30">
      <div
        className={`btn-mentor fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${
          toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <CheckCircle2 size={20} />
        {toastMsg}
      </div>

      {currentScreen === 'main' && <MainPage onNavigate={navigate} />}
      {currentScreen === 'builder' && <BuilderPopup onBack={goBack} onShowToast={showToast} />}
      {currentScreen === 'mentor' && <MentorPopup onBack={goBack} onNavigate={navigate} />}
      {currentScreen === 'individual' && <IndividualPopup onBack={goBack} onShowToast={showToast} />}
      {currentScreen === 'organization' && <OrganizationPopup onBack={goBack} onShowToast={showToast} />}
    </div>
  );
}

function MainPage({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="min-h-screen bg-[#F6F3EE] flex flex-col font-sans">
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col animate-in fade-in duration-1000">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-[#172238] font-bold text-[22px] tracking-tight mb-1">
            <img
              src="/logo.png"
              alt="CodeRa Logo"
              className="h-10 w-auto object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                const fallback = document.getElementById('logo-fallback-1');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div id="logo-fallback-1" className="hidden items-center gap-2">
              <Code2 size={28} className="text-builder" />
              <span>CodeRa</span>
            </div>
          </div>
          <p className="text-[#737D8F] text-[13px] font-medium tracking-wide">
            Code Today. Create Tomorrow.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center flex-1">
          <div className="flex-1 w-full text-center lg:text-left">
            <h1 className="text-5xl lg:text-[76px] text-[#172238] font-serif font-bold leading-[1.1] mb-6">
              What's your
              <br />
              <span className="text-builder">coding role?</span>
            </h1>
            <p className="text-[#687286] text-lg lg:text-[22px] max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
              Choose your path and let's build a better future together.
            </p>

            <div className="mt-16 hidden lg:flex bg-white rounded-3xl p-6 border border-[#E8E1D8] max-w-[420px] items-center gap-5 shadow-[0_18px_45px_rgba(31,41,55,0.08)]">
              <div 
                style={{ backgroundColor: '#EEF2FF' }} 
                className="text-builder w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              >
                <Heart size={24} fill="currentColor" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#7C8493] text-sm mb-0.5">Different roles. One mission.</p>
                <p className="text-[#172238] text-[17px] font-medium">
                  Building <span className="text-builder">brighter futures</span> through code.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col gap-6 max-w-[560px]">
            {/* BUILDER CARD */}
            <button
              type="button"
              onClick={() => onNavigate('builder')}
              className="group text-left bg-white rounded-[30px] p-3 pr-8 flex items-center gap-6 border border-[#E4DDD3] shadow-[0_14px_35px_rgba(31,41,55,0.08)] hover:shadow-[0_25px_55px_rgba(99,102,241,0.25)] hover:border-[#C7D2FE] transition-all duration-500 transform hover:-translate-y-2 w-full"
            >
              <div className="w-36 h-36 rounded-[22px] overflow-hidden shrink-0 bg-[#F3F0EA] shadow-inner">
                <ImageWithFallback
                  src={IMAGES.builderRole}
                  fallbackKey="builderRole"
                  alt="Builder"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex-1 py-2">
                <h3 className="text-builder text-[26px] font-bold mb-1 tracking-tight">BUILDER</h3>
                <p className="text-[#5D6B82] text-lg leading-tight font-medium">
                  I'm here to learn, create &<br />build.
                </p>
              </div>
              <div className="btn-builder w-14 h-14 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-500">
                <ArrowRight size={26} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* MENTOR CARD */}
            <button
              type="button"
              onClick={() => onNavigate('mentor')}
              className="group text-left bg-white rounded-[30px] p-3 pr-8 flex items-center gap-6 border border-[#E4DDD3] shadow-[0_14px_35px_rgba(31,41,55,0.08)] hover:shadow-[0_25px_55px_rgba(13,148,136,0.25)] hover:border-[#99F6E4] transition-all duration-500 transform hover:-translate-y-2 w-full"
            >
              <div className="w-36 h-36 rounded-[22px] overflow-hidden shrink-0 bg-[#F3F0EA] shadow-inner">
                <ImageWithFallback
                  src={IMAGES.mentorRole}
                  fallbackKey="mentorRole"
                  alt="Mentor"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex-1 py-2">
                <h3 className="text-mentor text-[26px] font-bold mb-1 tracking-tight">MENTOR</h3>
                <p className="text-[#5D6B82] text-lg leading-tight font-medium">
                  I'm here to support, track &<br />empower.
                </p>
              </div>
              <div className="btn-mentor w-14 h-14 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-500">
                <ArrowRight size={26} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#EEE9E1] border-t border-[#DED7CC] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-6 md:gap-4 justify-between items-start md:items-center">
          <Feature
            icon={<Rocket size={28} strokeWidth={1.5} />}
            title="Personalized Experience"
            description="We tailor everything to your goals."
          />
          <Feature
            icon={<Puzzle size={28} strokeWidth={1.5} />}
            title="Inclusive by Design"
            description="Empowering every ability."
          />
          <Feature
            icon={<Trophy size={28} strokeWidth={1.5} />}
            title="Real Skills, Real Impact"
            description="From learning to meaningful opportunities."
          />
          <Feature
            icon={<Users size={28} strokeWidth={1.5} />}
            title="Stronger Together"
            description="A community that supports you."
          />
        </div>
      </div>

      <footer className="bg-[#E7E1D8] py-8 border-t border-[#D8D0C5]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CodeRa Logo"
              className="h-8 w-auto object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-[#697386] text-sm font-medium">
              © 2026 CodeRa. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-[#697386] text-sm font-medium">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-[#6B7280]">{icon}</div>
      <div>
        <p className="font-bold text-[#293348] text-[15px] mb-0.5">{title}</p>
        <p className="text-[#7A8494] text-[13px]">{description}</p>
      </div>
    </div>
  );
}

function PopupLayout({
  children,
  onBack,
  footerText,
  isBuilderTheme = true,
  dotsColor = '#E0E0E0',
  activeStep = 1,
  totalSteps = 2,
}: {
  children: React.ReactNode;
  onBack: () => void;
  footerText: string;
  isBuilderTheme?: boolean;
  dotsColor?: string;
  activeStep?: number;
  totalSteps?: number;
}) {
  return (
    <div className="min-h-screen bg-[#EAE6DF] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-white w-full max-w-[800px] rounded-[40px] shadow-[0_30px_80px_rgba(31,41,55,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-[#E7E1D8]">
        <div className="flex items-center justify-between p-8 pb-4 shrink-0 relative">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#1C2840] hover:bg-[#F4F1EC] transition-colors z-10"
            aria-label="Go back"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#0B152A]">
              <img
                src="/logo.png"
                alt="CodeRa Logo"
                className="h-8 w-auto object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('logo-fallback-2');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div id="logo-fallback-2" className="hidden items-center gap-2">
                <Code2 size={24} className="text-builder" />
                <span>CodeRa</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: index + 1 === activeStep ? (isBuilderTheme ? '#6366F1' : '#0D9488') : dotsColor,
                  width: index + 1 === activeStep ? '28px' : '8px',
                }}
                className="h-2 rounded-full transition-all duration-300"
              />
            ))}
          </div>
        </div>

        <div className="p-8 pt-4 flex-1">{children}</div>

        <div className="border-t border-[#F0F2F5] p-6 text-center shrink-0">
          <p className="text-mentor text-[13px] font-bold tracking-wide uppercase">
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
}

function BuilderPopup({
  onBack,
  onShowToast,
}: {
  onBack: () => void;
  onShowToast: (message: string) => void;
}) {
  return (
    <PopupLayout onBack={onBack} footerText="Builder Journey (Step 1)" isBuilderTheme={true}>
      <div className="text-center mb-10">
        <h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-3">
          Who's building with us?
        </h2>
        <p className="text-[#5D6B82] text-[17px] font-serif italic">
          Tell us who you are so we can personalize your experience.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center px-4">
        <SelectionCard
          image={IMAGES.coider}
          fallbackKey="coider"
          title="CODER"
          description="I'm here to learn, create & build."
          colorTheme="purple"
          bgTint="bg-[#FAFAFF]"
          delayClass="delay-150"
          onClick={() => onShowToast('Builder selected! Registration coming soon.')}
        />
        <SelectionCard
          image={IMAGES.codeGuide}
          fallbackKey="codeGuide"
          title="CODE GUIDE"
          description="I'm here to support, track & empower."
          colorTheme="teal"
          bgTint="bg-[#F6FEFD]"
          delayClass="delay-300"
          onClick={() => onShowToast('Code Guide selected! Registration coming soon.')}
        />
      </div>
    </PopupLayout>
  );
}

function MentorPopup({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  return (
    <PopupLayout
      onBack={onBack}
      footerText="Mentor Journey (Step 1)"
      isBuilderTheme={false}
    >
      <div className="text-center mb-12">
        <h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-3 leading-tight">
          How are you joining
          <br />
          <span className="text-mentor">CodeRa</span>?
        </h2>
        <p className="text-[#5D6B82] text-[17px] font-serif italic mt-2">
          Choose your journey so we can serve you better.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center max-w-[700px] mx-auto px-4">
        <IconSelectionCard
          icon={<User size={52} strokeWidth={2} />}
          title="INDIVIDUAL"
          description="My personal journey"
          colorTheme="teal"
          onClick={() => onNavigate('individual')}
          delayClass="delay-150"
        />
        <IconSelectionCard
          icon={<Building2 size={46} strokeWidth={2} />}
          title="ORGANIZATION"
          description="Our organization's journey"
          colorTheme="purple"
          onClick={() => onNavigate('organization')}
          delayClass="delay-300"
        />
      </div>
    </PopupLayout>
  );
}

function IndividualPopup({
  onBack,
  onShowToast,
}: {
  onBack: () => void;
  onShowToast: (message: string) => void;
}) {
  return (
    <PopupLayout
      onBack={onBack}
      footerText="Individual Journey (Step 2)"
      isBuilderTheme={false}
      activeStep={2}
    >
      <div className="text-center mb-10">
        <h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-3">
          What brings you to <span className="text-builder">CodeRa</span>?
        </h2>
        <p className="text-[#5D6B82] text-[17px] font-serif italic">
          Tell us more about you.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center px-4">
        <SelectionCard
          image={IMAGES.programmer}
          fallbackKey="programmer"
          title="PROGRAMMER"
          description="I'm a programmer and I want to learn how to code for inclusion."
          colorTheme="purple"
          delayClass="delay-150"
          onClick={() => onShowToast('Programmer selected! Registration coming soon.')}
        />
        <SelectionCard
          image={IMAGES.teacher}
          fallbackKey="specialEd"
          title="SPECIAL EDUCATION TEACHER"
          description="I work with learners with special needs and want to learn coding."
          colorTheme="teal"
          delayClass="delay-300"
          onClick={() => onShowToast('Special Education Teacher selected! Registration coming soon.')}
        />
      </div>
    </PopupLayout>
  );
}

function OrganizationPopup({
  onBack,
  onShowToast,
}: {
  onBack: () => void;
  onShowToast: (message: string) => void;
}) {
  return (
    <PopupLayout
      onBack={onBack}
      footerText="Organization Journey (Step 2)"
      isBuilderTheme={true}
      activeStep={2}
    >
      <div className="text-center mb-10">
        <h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-3 leading-tight">
          What does your
          <br />
          <span className="text-mentor">organization</span> do?
        </h2>
        <p className="text-[#5D6B82] text-[17px] font-serif italic">
          Tell us more about your organization.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center px-4">
        <SelectionCard
          image={IMAGES.school}
          fallbackKey="school"
          title="SCHOOL"
          description="We want to bring inclusive coding to our students."
          colorTheme="teal"
          iconTopLeft={<GraduationCap size={16} strokeWidth={2.5} />}
          delayClass="delay-150"
          onClick={() => onShowToast('School selected! Registration coming soon.')}
        />
        <SelectionCard
          image={IMAGES.center}
          fallbackKey="center"
          title="SPECIALIZED CENTER"
          description="We support learners with special educational needs."
          colorTheme="purple"
          iconTopLeft={<Heart size={16} strokeWidth={2.5} fill="currentColor" />}
          delayClass="delay-300"
          onClick={() => onShowToast('Specialized Center selected! Registration coming soon.')}
        />
      </div>
    </PopupLayout>
  );
}

interface SelectionCardProps {
  image: string;
  fallbackKey: FallbackKey;
  title: string;
  description: string;
  colorTheme: 'purple' | 'teal';
  bgTint?: string;
  iconTopLeft?: React.ReactNode;
  onClick: () => void;
  delayClass?: string;
}

function SelectionCard({
  image,
  fallbackKey,
  title,
  description,
  colorTheme,
  bgTint = 'bg-white',
  iconTopLeft,
  onClick,
  delayClass = '',
}: SelectionCardProps) {
  const isPurple = colorTheme === 'purple';
  const textClass = isPurple ? 'text-builder' : 'text-mentor';
  const btnClass = isPurple ? 'btn-builder' : 'btn-mentor';
  const iconBgColor = isPurple ? '#EEF2FF' : '#CCFBF1';

  return (
    <div
      onClick={onClick}
      className={`flex-1 w-full max-w-sm ${bgTint} rounded-[28px] border border-[#E4DDD3] p-3 pb-6 text-center flex flex-col items-center group cursor-pointer transition-all duration-500 shadow-[0_12px_30px_rgba(31,41,55,0.06)] hover:shadow-[0_22px_45px_rgba(31,41,55,0.12)] hover:-translate-y-2 ${delayClass}`}
    >
      <div className="w-full h-[180px] rounded-2xl overflow-hidden mb-6 relative bg-slate-100 shadow-inner shrink-0 flex items-center justify-center">
        <ImageWithFallback
          src={image}
          fallbackKey={fallbackKey}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {iconTopLeft && (
          <div 
            style={{ backgroundColor: iconBgColor }} 
            className={`${textClass} absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center shadow-sm`}
          >
            {iconTopLeft}
          </div>
        )}
      </div>

      <h3 className={`${textClass} text-[17px] font-bold mb-2 tracking-widest uppercase`}>
        {title}
      </h3>
      <p className="text-[#5D6B82] text-[15px] px-6 mb-6 flex-1 leading-relaxed min-h-[48px] flex items-center justify-center">
        {description}
      </p>

      <div className={`${btnClass} w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shrink-0`}>
        <ArrowRight size={20} strokeWidth={2.5} />
      </div>
    </div>
  );
}

interface IconSelectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorTheme: 'purple' | 'teal';
  onClick: () => void;
  delayClass?: string;
}

function IconSelectionCard({
  icon,
  title,
  description,
  colorTheme,
  onClick,
  delayClass = '',
}: IconSelectionCardProps) {
  const isPurple = colorTheme === 'purple';
  const textClass = isPurple ? 'text-builder' : 'text-mentor';
  const btnClass = isPurple ? 'btn-builder' : 'btn-mentor';

  return (
    <div
      onClick={onClick}
      className={`flex-1 bg-white rounded-[32px] border border-[#E4DDD3] p-10 text-center flex flex-col items-center justify-between group cursor-pointer transition-all duration-500 hover:shadow-[0_22px_50px_rgba(31,41,55,0.12)] hover:-translate-y-2 min-h-[340px] shadow-[0_12px_30px_rgba(31,41,55,0.06)] ${delayClass}`}
    >
      <div className={`${btnClass} w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-inner`}>
        {icon}
      </div>
      <div>
        <h3 className={`${textClass} text-[15px] font-bold mb-4 tracking-[0.2em] uppercase`}>
          {title}
        </h3>
        <p className="text-[#5D6B82] font-serif text-[19px] italic mb-10">
          {description}
        </p>
      </div>
      <div className={`${btnClass} w-11 h-11 rounded-full flex items-center justify-center group-hover:scale-110 transition-all`}>
        <ArrowRight size={20} strokeWidth={2.5} />
      </div>
    </div>
  );
}