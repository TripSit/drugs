/* 
This task involves normalizing the interaction status between different drug combinations within a JSON structure. 
Both combos.json and drugs.json are composed of primary keys representing individual drugs or drug classes (e.g., "2c-t-x"). 

In the case of drugs.json these keys map to various properties, such as Name and Combos.

For combos.json the primary keys map to secondary keys indicating another drug or drug class with which the primary has an interaction. 
Each secondary key maps to an object detailing the nature of their interaction, primarily indicated by a "status" field, and optionally, a "note" field providing further context.

Drugs.json contains information from combos.json and needs to be updated when combos.json is updated

The goal of this script is to ensure:
1) The interaction status in combos.json is consistent between any two drugs, irrespective of which one is considered the primary or secondary in any given pair. 
    For instance, if Drug A's interaction with Drug B is marked as "Dangerous", then Drug B's interaction with Drug A must also reflect the "Dangerous" status, even if initially labeled differently.
2) The drugs.json file is updated to reflect any changes made to combos.json, ensuring that the two files remain in sync.

The steps to achieve this are:
1) Iterate through each primary drug key in combos.json to access its interactions.
2) For each interaction, check the corresponding reverse interaction (i.e., when the secondary becomes the primary and vice versa).
3) If the reverse interaction does not match the interaction, update it to ensure both directions of the interaction reflect the same status level.
4) Look up the primary drug in drugs.json and ensure it has a "combos" property, update it as necessary.
*/

import fs from 'fs/promises';
import path from 'path';
import { Combo, Drug } from '../types/drugs';
import { ComboData, Combos, Interactions } from '../types/combos';
import drugsData from '../drugs.json';
import combosData from '../combos.json';
import { log } from 'console';

const drugData = drugsData as {
  [key: string]: Drug
};

const comboData = combosData as {
  [key in keyof Combos]: Interactions
};

enum WildcardDrugs {
  "2c-t-x" = "2c-t-x",
  "2c-x" = "2c-x",
  "5-meo-xxt" = "5-meo-xxt",
  dox = "dox",
}

const wildcardDrugs: (keyof Combos)[]  = [
  '2c-t-x',
  '2c-x',
  '5-meo-xxt',
  'dox',
]

enum CategoryDrugs {
  amphetamines = "amphetamines",
  benzodiazepines = "benzodiazepines",
  maois = "maois",
  nbomes = "nbomes",
  opioids = "opioids",
  ssris = "ssris",
  "ghb/gbl" = "ghb/gbl",
}

const categoryDrugs: (keyof Combos)[] = [
  'amphetamines',
  'benzodiazepines',
  'maois',
  'nbomes',
  'opioids',
  'ssris',
  'ghb/gbl',
]

function isCategoryCombo(comboName: keyof Combos): comboName is keyof typeof CategoryDrugs {
  return categoryDrugs.includes(comboName as any);
}

function isWildcardCombo(comboName: keyof Combos): comboName is keyof typeof WildcardDrugs {
  return wildcardDrugs.includes(comboName as any);
}

export default async function compareData() {
  console.log(`Drugs  ${Object.keys(drugData).length}`);
  console.log(`Combos ${Object.keys(combosData).length}`);

  // for (const [comboKey, comboEntry] of Object.entries(comboData)) {
  Object.entries(comboData).forEach(async ([comboKey, comboEntry]) => {
    const drugAName = comboKey as keyof Combos;

    // We don't want to check wildcard drugs, yet
    if (isWildcardCombo(drugAName)) {
      return;
    }

    // We don't want to check category drugs, yet
    if (isCategoryCombo(drugAName)) {
      return;
    }

    console.log(`@ ${drugAName}`);
    // for (const [interactionKey, interactionEntry] of Object.entries(comboEntry)) {
    Object.entries(comboEntry).forEach(async ([interactionKey, interactionEntry]) => {
      const drugBName = interactionKey as keyof Interactions;
      const interaction = interactionEntry as ComboData;

      // Combos.json stuff

      // Double check the reverse interaction
      if (!comboData[drugBName][drugAName]) {
        // If the reverse interaction does not exist, create it
        comboData[drugBName][drugAName] = {
          status: interaction.status,
          note: interaction.note,
          sources: interaction.sources,
        };
        log(`+ ${drugBName} + ${drugAName}`);
      }
      
      if (JSON.stringify(comboData[drugBName][drugAName]) != JSON.stringify(interaction)) {
        // If the status does not match, update it
        log(`~ ${drugAName} + ${drugBName}`);
        log(`drugACombo: ${JSON.stringify(interaction)}`);
        log(`drugBCombo: ${JSON.stringify(comboData[drugBName][drugAName])}`);
        comboData[drugBName][drugAName] = interaction;
      }

      // Drugs.json stuff
      
      // If drugA doesn't exist in the drugs.json file, create it
      // The pretty_name may not always be correct
      if (!drugData[drugAName]) {
        drugData[drugAName] = {
          name: drugAName,
          pretty_name: drugAName.slice(0, 1).toUpperCase() + drugAName.slice(1),
          properties: {},
          combos: {
            [drugBName]: interaction as Combo
          }
        };
        log(`+ ${drugAName} entry in drugs.json`);
        log(`${JSON.stringify(drugData[drugAName])}`);
      }
      // If drugA exists, but doesn't have a combos section, create it
      if (!drugData[drugAName].combos) {
        drugData[drugAName].combos = {};
        console.log(`+ ${drugAName}.combos`);
      }

      // Need to declare the type for drugACombos
      const drugACombos = drugData[drugAName].combos as {
        [key: string]: Combo;
      };

      // If the combo interaction does not exist, create it
      if (!drugACombos[drugBName]) {
        drugACombos[drugBName] = interaction as Combo;
        log(`+ ${drugBName} + ${drugAName}`);
      }
      
      // If the entry exists, but the data is different, update it
      if (JSON.stringify(drugACombos[drugBName]) !== JSON.stringify(interaction)) {
        log(`~ ${drugAName} + ${drugBName}`);
        log(`combo.json: ${JSON.stringify(interaction)}`);
        log(`drugs.json: ${JSON.stringify(drugACombos[drugBName])}`);
        // Update the drugBInfo with the new data from interaction
        drugACombos[drugBName] = interaction as Combo;
      }
    });
  });

  await fs.writeFile(path.resolve(__dirname, '../drugs.json'), JSON.stringify(drugData, null, 2));
  await fs.writeFile(path.resolve(__dirname, '../combos.json'), JSON.stringify(comboData, null, 2));
}


compareData()
  .then(() => {
    console.log('Done!');
  })
  .catch((err) => {
    console.error(err);
  });