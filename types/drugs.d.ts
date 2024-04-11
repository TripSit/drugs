export type Drug = {
  aliases?: string[];
  categories?: Category[];
  formatted_aftereffects?: Duration;
  formatted_dose?: Dose;
  formatted_duration?: Duration;
  formatted_effects?: string[];
  formatted_onset?: Duration;
  links?: Links;
  name: string;
  pretty_name: string;
  properties: Properties;
  pweffects?: { [key: string]: string };
  dose_note?: string;
  sources?: Sources;
  combos?: Interactions;
};

export enum Category {
  Barbiturate = "barbiturate",
  Benzodiazepine = "benzodiazepine",
  Common = "common",
  Deliriant = "deliriant",
  Depressant = "depressant",
  Dissociative = "dissociative",
  Empathogen = "empathogen",
  HabitForming = "habit-forming",
  Inactive = "inactive",
  Nootropic = "nootropic",
  Opioid = "opioid",
  Psychedelic = "psychedelic",
  ResearchChemical = "research-chemical",
  Ssri = "ssri",
  Stimulant = "stimulant",
  Supplement = "supplement",
  Tentative = "tentative",
}

export type Dosage = {
  common?: string;
  light?: string;
  strong?: string;
  threshold?: string;
  heavy?: string;
  dangerous?: string;
  fatal?: string;
  note?: string;
};

export type Dose = {
  oral?: Dosage;
  insufflated?: Dosage;
  rectal?: Dosage;
  vapourized?: Dosage;
  intravenous?: Dosage;
  smoked?: Dosage;
  sublingual?: Dosage;
  buccal?: Dosage;
  intramuscular?: Dosage;
  transdermal?: Dosage;
  hbwr?: Dosage;
  Morning_Glory?: Dosage;
  dried?: Dosage;
  fresh?: Dosage;
  "Insufflated(Pure)"?: Dosage;
  "Oral(Benzedrex)"?: Dosage;
  "Oral(Pure)"?: Dosage;
  dry?: Dosage;
  wet?: Dosage;
};

export type Duration = {
  _unit: Unit;
  value?: string;
  insufflated?: string;
  oral?: string;
  rectal?: string;
  vapourized?: string;
  smoked?: string;
  Oral_ER?: string;
  Oral_IR?: string;
  Oral_MAOI?: string;
  intramuscular?: string;
  intravenous?: string;
  metabolites?: string;
  parent?: string;
  oralMAOI?: string;
  buccal?: string;
  transdermal?: string;
  sublingual?: string;
  Insufflated_IR?: string;
  Insufflated_XR?: string;
};

export type Links = {
  experiences: string;
  pihkal?: string;
  tihkal?: string;
};

export type Properties = {
  "after-effects"?: string;
  aliases?: string[];
  avoid?: string;
  categories?: Category[];
  dose?: string;
  duration?: string;
  "half-life"?: string;
  onset?: string;
  summary?: string;
  "test-kits"?: string;
  experiences?: string;
  warning?: string;
  marquis?: string;
  effects?: string;
  risks?: string;
  comeup?: string;
  note?: string;
  detection?: string;
  wiki?: string;
  mdma?: string;
  tolerance?: string;
  bioavailability?: string;
  dose_to_diazepam?: string;
  "adverse-effects"?: string;
  chemistry?: string;
  contraindications?: string;
  legal?: string;
  "overdose-symptoms"?: string;
  pharmacokinetics?: string;
  pharmacology?: string;
  obtain?: string;
  pharmacodynamics?: string;
  "side-effects"?: string;
  molecule?: string;
  vaporization?: string;
  calculator?: string;
  chart?: string;
  oral?: string;
  "general-advice"?: string;
  potentiators?: string;
};

export interface Interactions {
  "2c-t-x"?:                            ComboData;
  "2c-x"?:                              ComboData;
  "5-meo-xxt"?:                         ComboData;
  alcohol?:                             ComboData; // Will delete this
  ethanol?:                             ComboData;
  amphetamines?:                        ComboData;
  amt?:                                 ComboData; // Will delete this
  'alpha-methyltryptamine'?:            ComboData;
  benzodiazepines?:                     ComboData;
  caffeine?:                            ComboData;
  cannabis?:                            ComboData;
  cocaine?:                             ComboData;
  diphenhydramine?:                     ComboData;
  dextromethorphan?:                    ComboData;
  dmt?:                                 ComboData; // Will delete this
  dimethyltryptamine?:                  ComboData;
  dox?:                                 ComboData;
  "ghb/gbl"?:                            ComboData; // Will delete this
  "gamma-butyrolactone"?:                 ComboData;
  "gamma hydroxybutyrate"?:               ComboData;
  lithium?:                             ComboData;
  ketamine?:                            ComboData;
  lsd?:                                 ComboData; // Will delete this
  'lysergic acid diethylamide'?:        ComboData;
  maois?:                               ComboData;
  mdma?:                                ComboData; // Will delete this
  '3,4-methylenedioxymethamphetamine'?: ComboData;
  mephedrone?:                          ComboData;
  mescaline?:                           ComboData;
  mushrooms?:                           ComboData; // Will delete this
  'psilocybin mushrooms'?:              ComboData;
  mxe?:                                 ComboData; // Will delete this
  methoxetamine?:                       ComboData;
  nbomes?:                              ComboData;
  nitrous?:                             ComboData;
  opioids?:                             ComboData;
  pcp?:                                 ComboData; // Will delete this
  phencyclidine?:                       ComboData;
  ssris?:                               ComboData;
  tramadol?:                            ComboData;
}

// export type ComboData = {
//   note?: string;
//   sources?: {
//     author: string;
//     title: string;
//     url: string;
//   }[];
//   status: Status;
// };

export interface Combo {
  note?: string;
  sources?: {
    author: string;
    title: string;
    url: string;
  }[];
  status: Status;
}

export enum Status {
  Caution = "Caution",
  Dangerous = "Dangerous",
  LowRiskDecrease = "Low Risk & Decrease",
  LowRiskNoSynergy = "Low Risk & No Synergy",
  LowRiskSynergy = "Low Risk & Synergy",
  Unsafe = "Unsafe",
}

export enum Unit {
  Hours = "hours",
  Minutes = "minutes",
}

export type Sources = {
  general?: string[];
  dose?: string[];
  duration?: string[];
  bioavailability?: string[];
  legality?: string[];
  onset?: string[];
};
