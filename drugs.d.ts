export type Drug = {
  name:                   string;
  prettyName:             string;
  aliases?:               string[];
  categories?:            Category[];
  formattedDose?:         FormattedDose;
  formattedOnset?:        FormattedDuration;
  formattedDuration?:     FormattedDuration;
  formattedEffects?:      string[];
  formattedAftereffects?: FormattedAftereffects;
  properties:             Properties;
  pweffects?:             { [key: string]: string };
  doseNote?:              string;
  combos?:                { [key: string]: Combo };
  sources?:               Sources;
  links?:                 Links;
}

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
  common?:    string;
  light?:     string;
  strong?:    string;
  threshold?: string;
  heavy?:     string;
  dangerous?: string;
  fatal?:     string;
  note?:      string;
}

export type FormattedDose = {
  oral?:            Dosage;
  insufflated?:     Dosage;
  rectal?:          Dosage;
  vapourized?:      Dosage;
  intravenous?:     Dosage;
  smoked?:          Dosage;
  sublingual?:      Dosage;
  buccal?:          Dosage;
  intramuscular?:   Dosage;
  transdermal?:     Dosage;
  hbwr?:            Dosage;
  morningGlory?:    Dosage;
  dried?:           Dosage;
  fresh?:           Dosage;
  insufflatedPure?: Dosage;
  oralBenzedrex?:   Dosage;
  oralPure?:        Dosage;
  dry?:             Dosage;
  wet?:             Dosage;
}

export type FormattedDuration = {
  unit?:          Unit;
  value?:         string;
  insufflated?:   string;
  oral?:          string;
  rectal?:        string;
  vapourized?:    string;
  smoked?:        string;
  oralIR?:        string;
  oralEr?:        string;
  intramuscular?: string;
  intravenous?:   string;
  metabolites?:   string;
  parent?:        string;
  oralMAOI?:      string;
  buccal?:        string;
  transdermal?:   string;
  sublingual?:    string;
  oralER?:        string;
  insufflatedIR?: string;
  insufflatedXR?: string;
}

export type FormattedAftereffects = {
  unit?:          Unit;
  value?:         string;
  insufflated?:   string;
  oral?:          string;
  smoked?:        string;
  vapourized?:    string;
  intramuscular?: string;
  sublingual?:    string;
  intravenous?:   string;
}

export type Links = {
  experiences: string;
  pihkal?:     string;
  tihkal?:     string;
}

export type Properties = {
  afterEffects?:     string;
  aliases?:          string[];
  avoid?:            string;
  categories?:       Category[];
  dose?:             string;
  duration?:         string;
  halfLife?:         string;
  onset?:            string;
  summary?:          string;
  testKits?:         string;
  experiences?:      string;
  warning?:          string;
  marquis?:          string;
  effects?:          string;
  risks?:            string;
  comeup?:           string;
  note?:             string;
  detection?:        string;
  wiki?:             string;
  mdma?:             string;
  tolerance?:        string;
  bioavailability?:  string;
  doseToDiazepam?:   string;
  adverseEffects?:   string;
  chemistry?:        string;
  contraindictions?: string;
  legal?:            string;
  overdoseSymptoms?: string;
  pharmacokinetics?: string;
  pharmacology?:     string;
  obtain?:           string;
  pharmacodynamics?: string;
  sideEffects?:      string;
  molecule?:         string;
  vaporization?:     string;
  calculator?:       string;
  chart?:            string;
  oral?:             string;
  generalAdvice?:    string;
  potentiators?:     string;
}

export type Combo = {
  note?:  string;
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
  general?:         string[];
  dose?:            string[];
  duration?:        string[];
  bioavailability?: string[];
  legality?:        string[];
  onset?:           string[];
}
