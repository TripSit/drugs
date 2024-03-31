export interface Combos {
  "2c-t-x":        Interactions;
  "2c-x":          Interactions;
  "5-meo-xxt":     Interactions;
  alcohol:         Interactions;
  amphetamines:    Interactions;
  amt:             Interactions;
  benzodiazepines: Interactions;
  caffeine:        Interactions;
  cannabis:        Interactions;
  cocaine:         Interactions;
  diphenhydramine: Interactions;
  dmt:             Interactions;
  dox:             Interactions;
  dxm:             Interactions;
  "ghb/gbl":       Interactions;
  ketamine:        Interactions;
  lithium:         Interactions;
  lsd:             Interactions;
  maois:           Interactions;
  mdma:            Interactions;
  mescaline:       Interactions;
  mushrooms:       Interactions;
  mxe:             Interactions;
  nbomes:          Interactions;
  nitrous:         Interactions;
  opioids:         Interactions;
  pcp:             Interactions;
  ssris:           Interactions;
  tramadol:        Interactions;
}

export interface Interactions {
  "2c-t-x"?:        ComboData;
  "2c-x"?:          ComboData;
  "5-meo-xxt"?:     ComboData;
  alcohol?:         ComboData;
  amphetamines?:    ComboData;
  amt?:             ComboData;
  benzodiazepines?: ComboData;
  caffeine?:        ComboData;
  cannabis?:        ComboData;
  cocaine?:         ComboData;
  diphenhydramine?: ComboData;
  dmt?:             ComboData;
  dox?:             ComboData;
  dxm?:             ComboData;
  "ghb/gbl"?:       ComboData;
  lithium?:         ComboData;
  ketamine?:        ComboData;
  lsd?:             ComboData;
  maois?:           ComboData;
  mdma?:            ComboData;
  mescaline?:       ComboData;
  mushrooms?:       ComboData;
  mxe?:             ComboData;
  nbomes?:          ComboData;
  nitrous?:         ComboData;
  opioids?:         ComboData;
  pcp?:             ComboData;
  ssris?:           ComboData;
  tramadol?:        ComboData;
}

export interface ComboData {
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
  Self = "Self",
  Unsafe = "Unsafe",
}