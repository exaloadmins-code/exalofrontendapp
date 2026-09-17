/**
 * EXALO asset registry.
 * Filenames preserved from the source pack at:
 * C:\Users\exalo\OneDrive\Pictures\exaloassets
 *
 * See docs/exalo-asset-inventory.md for classification, screen mapping,
 * variants, and missing artwork.
 */

export const BrandingAssets = {
  logo: require('../../assets/branding/exalo logo.png'),
} as const;

export const BackgroundAssets = {
  planets: require('../../assets/backgrounds/background planets.png'),
} as const;

/** TP-003 — product-owner approved Home artboard (843×1264). */
export const HomeAssets = {
  artboardV2: require('../../assets/home/exalo-home-v2.png'),
} as const;

/**
 * TP-070 — Journey artboard source (843×1264), USE APPROVED / LICENSE REVIEW REQUIRED.
 * Runtime uses TP-071 clean derivative (baked header removed). Original kept for provenance.
 */
export const JourneyAssets = {
  /** @deprecated Prefer `artboardClean` for Journey runtime. Kept for provenance comparison. */
  artboardSource: require('../../assets/journey/journey-bg.png'),
  /** TP-071 — derived from TP-070; baked “Maths” / “Choose your path” removed. */
  artboardClean: require('../../assets/journey/journey-bg-clean.png'),
  /** Active Journey artboard (subject-neutral). */
  artboard: require('../../assets/journey/journey-bg-clean.png'),
} as const;

export const PlanetAssets = {
  blue: require('../../assets/planets/planet blue.png'),
  purple: require('../../assets/planets/planet purple.png'),
} as const;

/**
 * Rocket candidates. Exact red Test / orange Focus / silver Train path rockets
 * are not present as distinct files — see inventory for mapping confidence.
 */
export const RocketAssets = {
  /** Angled white/orange launch rocket with exhaust (transparent). Strong Home / Focus candidate. */
  homeLaunch: require('../../assets/rockets/rocket.png'),
  /** Larger white/orange launch rocket (opaque RGB canvas). Alternate of homeLaunch. */
  launchAlternate: require('../../assets/rockets/rocket-only.png'),
  /** Vertical white/orange rocket without exhaust plume. Small heading / Focus candidate. */
  verticalOrange: require('../../assets/rockets/rocket_main.png'),
  /** Grey/orange character rocket on circular pad. Unmatched to a specific screen element. */
  launchpad: require('../../assets/rockets/launchpad.png'),
} as const;

export const AstronautAssets = {
  /** Child astronaut holding red GOAL banner (baked starfield, no alpha). Onboarding 4. */
  goal: require('../../assets/astronauts/onb-astronaut-goal.png'),
} as const;

export const AvatarAssets = {
  avatar1: require('../../assets/avatars/avatar-1.png'),
  avatar2: require('../../assets/avatars/avatar-2.png'),
  avatar3: require('../../assets/avatars/avatar-3.png'),
  avatar4: require('../../assets/avatars/avatar-4.png'),
  avatar5: require('../../assets/avatars/avatar-5.png'),
  avatar6: require('../../assets/avatars/avatar-6.png'),
} as const;

export const OnboardingAssets = {
  /** TP-058 — Lovable Email + Year hero. Product-owner approved for onboarding. */
  rocket: require('../../assets/onboarding/onb-rocket.png'),
  /** TP-059 — Lovable Name hero. Product-owner approved for onboarding. */
  astronautWave: require('../../assets/onboarding/onb-astronaut-wave.png'),
  /** TP-060 — Lovable School hero. Product-owner approved for School step. */
  goalAstronaut: require('../../assets/onboarding/onb-astronaut-goal.png'),
} as const;

export const SubjectAssets = {
  /** Operator icon sheet (composite). Home Maths artwork candidate / Number Skills adjacent. */
  mathsOperators: require('../../assets/subjects/maths.png'),
  /** Blue MATHS subject card with dark image placeholder. */
  mathsCard: require('../../assets/subjects/maths_card.png'),
  /** Green ENGLISH subject card with blue book illustration baked in. */
  englishCard: require('../../assets/subjects/english_card.png'),
  /** Standalone open book (red cover). English / Focus-mode icon candidate. */
  book: require('../../assets/subjects/book.png'),
} as const;

/**
 * Maths topic artwork is not present in the source pack.
 * Keys reserved for future assets — do not invent filenames.
 */
export const MathsTopicAssets = {
  // numberSkills: missing
  // fractions: missing
  // decimals: missing
  // percentages: missing
  // ratioProportion: missing
  // algebra: missing
  // geometry: missing
  // angles: missing
  // measurement: missing
  // wordProblems: missing
} as const;

export const GamificationAssets = {
  badge: require('../../assets/gamification/badge.png'),
  badgeCard: require('../../assets/gamification/badge_card.png'),
  flame: require('../../assets/gamification/flame.png'),
  streakCard: require('../../assets/gamification/streak_card.png'),
} as const;

export const NavigationAssets = {
  home: require('../../assets/navigation/home_icon.png'),
  parents: require('../../assets/navigation/parents_icon.png'),
} as const;

export const DecorativeAssets = {
  /** Conical orange beam / spotlight (filename suggests flame; visual is a beam). */
  rocketBeam: require('../../assets/decorative/rocket_flame.png'),
} as const;

export const MiscellaneousAssets = {
  /** Boy face portrait only — not used as a selectable helmeted avatar in screenshots. */
  boyFace: require('../../assets/miscellaneous/avatar.png'),
} as const;

/** Aggregated registry for convenience. Prefer the named category exports above. */
export const assets = {
  branding: BrandingAssets,
  backgrounds: BackgroundAssets,
  home: HomeAssets,
  journey: JourneyAssets,
  planets: PlanetAssets,
  rockets: RocketAssets,
  astronauts: AstronautAssets,
  avatars: AvatarAssets,
  onboarding: OnboardingAssets,
  subjects: SubjectAssets,
  topics: MathsTopicAssets,
  gamification: GamificationAssets,
  navigation: NavigationAssets,
  decorative: DecorativeAssets,
  miscellaneous: MiscellaneousAssets,
} as const;
