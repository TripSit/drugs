export interface Combos {
  "2c-t-x":                             Interactions;
  "2c-x":                               Interactions;
  "5-meo-xxt":                          Interactions;
  alcohol?:                              Interactions; // Will delete this
  ethanol?:                              Interactions;
  amphetamines:                         Interactions;
  amt?:                                  Interactions; // Will delete this
  'alpha-methyltryptamine'?:             Interactions;
  benzodiazepines:                      Interactions;
  caffeine:                             Interactions;
  cannabis:                             Interactions;
  cocaine:                              Interactions;
  diphenhydramine:                      Interactions;
  dextromethorphan:                     Interactions;
  dmt?:                                  Interactions; // Will delete this
  dimethyltryptamine?:                   Interactions;
  dox:                                  Interactions;
  "ghb/gbl"?:                            Interactions; // Will delete this
  "gamma-butyrolactone"?:                 Interactions;
  "gamma hydroxybutyrate"?:               Interactions;
  ketamine:                             Interactions;
  lithium:                              Interactions;
  lsd?:                                  Interactions; // Will delete this
  'lysergic acid diethylamide'?:         Interactions;
  maois:                                Interactions;
  mdma?:                                 Interactions; // Will delete this
  '3,4-methylenedioxymethamphetamine'?:  Interactions;
  mephedrone:                           Interactions;
  mescaline:                            Interactions;
  mushrooms?:                            Interactions; // Will delete this
  'psilocybin mushrooms'?:               Interactions;
  mxe?:                                  Interactions; // Will delete this
  methoxetamine?:                        Interactions;
  nbomes:                               Interactions;
  nitrous:                              Interactions;
  opioids:                              Interactions;
  pcp?:                                  Interactions; // Will delete this
  phencyclidine?:                        Interactions;
  ssris:                                Interactions;
  tramadol:                             Interactions;
}

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
  Unsafe = "Unsafe",
}