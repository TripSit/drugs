// This function will import the drugs.json file and the combos.json file
// It will compare the entirety of the combos.json file with each matching drug in the drugs.json file
// If there is missing data, it will prompt the user if they want to add it
// If there is extra data, it will prompt the user if they want to remove it
// If there is data that is different, it will prompt the user if they want to change it
// There is a flag to automatically add, remove, or change data if desired

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

function isWildcardCombo(comboName: keyof Combos): comboName is keyof typeof WildcardDrugs {
  return wildcardDrugs.includes(comboName as any);
}

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

export default async function compareData() {
  console.log(`Drugs ${Object.keys(drugData).length}`);
  console.log(`Combo ${Object.keys(combosData).length}`);

  Object.entries(comboData).forEach(async ([comboKey, comboEntry]) => {
    const comboName = comboKey as keyof Combos;

    // We don't want to check wildcard drugs, yet
    if (isWildcardCombo(comboName)) {
      return;
    }

    // We don't want to check category drugs, yet
    if (isCategoryCombo(comboName)) {
      return;
    }

    if (!drugData[comboName]) {
      log(`Missing ${comboName} from drugs.json`);
      return;
    }

    // For debugging
    // if (comboName !== 'caffeine') {
    //   return;
    // }

    log(`${comboName} started`);

    Object.entries(comboEntry).forEach(async ([interactionKey, interactionEntry]) => {
      const interactionName = interactionKey as keyof Interactions;
      const interaction = interactionEntry as ComboData;

      // Find the drug in the drugs.json file
      const drugCombos = drugData[comboName].combos;

      if (!drugCombos) {
        log(`Missing combos for ${comboName} in drugs.json`);
        return;
      }

      const drugEntry = drugCombos[interactionName];

      if (!drugEntry) {
        log(`Missing ${interactionName} from ${comboName} in drugs.json`);
        return;
      }

      // Check if the combos are the same
      if (JSON.stringify(drugEntry) !== JSON.stringify(interaction)) {
        log(`${comboName} + ${interactionName} in combos.json does not match drugs.json`);
        log(`combo.json: ${JSON.stringify(interaction)}`);
        log(`drugs.json: ${JSON.stringify(drugEntry)}`);
        log('Would you like to update the data? - Too bad, updating it anyway')
        
        // Update the drugEntry with the new data from interaction
        drugCombos[interactionName] = interaction as Combo;

        // Save the updated data
      }

      // log(`${comboName} + ${interactionName} in combos.json matches drugs.json`);
    });
  });

  await fs.writeFile(path.resolve(__dirname, '../drugs.json'), JSON.stringify(drugData, null, 2));
}


compareData()
  .then(() => {
    console.log('Done!');
  })
  .catch((err) => {
    console.error(err);
  });