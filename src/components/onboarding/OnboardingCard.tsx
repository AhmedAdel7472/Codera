import React from 'react';
import { OnboardingCardProps } from './types';
import { ArrowRight } from 'lucide-react';

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  subtitle,
  badgeText,
  accentColor,
  icon,
  illustrationSvg,
  onClick,
  layout = 'vertical',
}) => {
  const isPurple = accentColor === 'purple';

  const accentTextClass = isPurple ? 'text-purple-600 dark:text-purple-400' : 'text-teal-600 dark:text-teal-400';
  const accentBgClass = isPurple ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700';
  const accentLightBgClass = isPurple ? 'bg-purple-50 text-purple-600' : 'bg-teal-50 text-teal-600';
  const borderHoverClass = isPurple
    ? 'hover:border-purple-300 hover:shadow-purple-500/15'
    : 'hover:border-teal-300 hover:shadow-teal-500/15';

  if (layout === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`group relative flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${borderHoverClass}`}
      >
        <div className="flex items-center gap-6">
          {illustrationSvg && (
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800 p-2">
              {illustrationSvg}
            </div>
          )}
          {icon && !illustrationSvg && (
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${accentLightBgClass}`}>
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-xl font-bold tracking-wide ${accentTextClass}`}>
                {title}
              </h3>
              {badgeText && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${accentLightBgClass}`}>
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={`Select ${title}`}
          className={`w-12 h-12 rounded-full text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-md ${accentBgClass}`}
        >
          <ArrowRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center ${borderHoverClass}`}
    >
      {badgeText && (
        <span className={`absolute top-4 left-4 text-xs font-bold px-2.5 py-1 rounded-full ${accentLightBgClass}`}>
          {badgeText}
        </span>
      )}

      {/* Card Header Media / Illustration */}
      <div className="mb-6 flex items-center justify-center min-h-[140px]">
        {illustrationSvg ? (
          <div className="w-full max-w-[220px] h-36 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50 p-3">
            {illustrationSvg}
          </div>
        ) : icon ? (
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold transition-transform duration-300 group-hover:scale-105 shadow-sm ${accentLightBgClass}`}>
            {icon}
          </div>
        ) : null}
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col justify-between items-center">
        <div className="mb-6">
          <h3 className={`text-lg font-extrabold uppercase tracking-wider mb-2 ${accentTextClass}`}>
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-[240px] mx-auto font-medium">
            {subtitle}
          </p>
        </div>

        {/* Circular Action Button */}
        <button
          type="button"
          aria-label={`Select ${title}`}
          className={`w-11 h-11 rounded-full text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md ${accentBgClass}`}
        >
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
