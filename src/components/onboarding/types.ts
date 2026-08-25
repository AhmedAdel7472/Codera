export type RoleType = 'BUILDER' | 'MENTOR';
export type JourneyType = 'CODER' | 'CODE_GUIDE' | 'INDIVIDUAL' | 'ORGANIZATION';
export type SpecificRoleType = 'PROGRAMMER' | 'SPECIAL_EDUCATION_TEACHER' | 'SCHOOL' | 'SPECIALIZED_CENTER';

export type ScreenId = 
  | 'SCREEN_1_MAIN_ROLE'
  | 'SCREEN_2A_BUILDER'
  | 'SCREEN_2B_MENTOR_STEP1'
  | 'SCREEN_3A_INDIVIDUAL_STEP2'
  | 'SCREEN_3B_ORGANIZATION_STEP2'
  | 'COMPLETED';

export interface OnboardingSelection {
  role: RoleType | null;
  journeyType: JourneyType | null;
  specificRole: SpecificRoleType | null;
}

export interface OnboardingCardProps {
  id: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  accentColor: 'purple' | 'teal';
  icon?: string | React.ReactNode;
  illustrationSvg?: React.ReactNode;
  onClick: () => void;
  layout?: 'horizontal' | 'vertical';
}
