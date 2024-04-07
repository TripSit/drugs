/*
Inside of both combos.json and drugs.json there are a few drugs that use slang names instead of the full name.
EG: dmt, lsd, (mdma), mushrooms, mxe, pcp

We should update the drugs.json file to use the full name instead of the slang name, and include the slang name in the alias field.
*/

import fs from 'fs/promises';
import path from 'path';
import { Drug } from '../types/drugs';
import { Combos, Interactions } from '../types/combos';
import drugsData from '../drugs.json';
import combosData from '../combos.json';
import { log } from 'console';

// Define the .json files we're working with
const drugData = drugsData as {[key: string]: Drug};
const comboData = combosData as {[key in keyof Combos]: Interactions};


const slangDrugs: (keyof Combos)[]  = [
  'mxe',
  'amt',
  'dmt',
  'lsd',
  'mushrooms',
  'mdma',
  'pcp',
]


export default async function compareData() {
  console.log(`Drugs ${Object.keys(drugData).length}`);
  console.log(`Combo ${Object.keys(combosData).length}`);

  let drugList:string[] = []; 
  let modifiedList:[string,string][] = []; 

  Object.entries(comboData).forEach(async ([comboKey, comboEntry]) => {
    const drugAName = comboKey as keyof Combos;


    /* If you're not familiar, a switch statement is like a series of if/else statements that checks a single value 
    against a list of possible values. It's a bit more readable than a series of if/else statements. 
        
    In this case, we're going through each drug in the Combos.json file and doing logic based on the drug name.
    Different drugs need different logic to find the correct drug in the drugs.json file: some include wildcard
    characters like "2c-x" and some are categories like "amphetamines". We need to handle each case differently.
    
    Note, if you don't include a break statement, the code will continue to execute the next case. This is useful if you
    have multiple cases that should do the same thing, such as the "wildcard" drugs at the top of the switch statement.
    */

    switch (drugAName) {
      // Slang drugs
      case 'alcohol':
      case 'amt':
      case 'dmt':
      case 'lsd':
      case 'mdma':
      case 'mushrooms': 
      case 'mxe':
      case 'pcp': {
        const slangMap:{
          [key in 'alcohol' | 'amt' | 'dmt' | 'lsd' | 'mdma' | 'mushrooms' | 'mxe' | 'pcp']: {
            name: keyof Combos;
            prettyName: string;
          }
        } = {
          alcohol: {
            name: 'ethanol',
            prettyName: 'Ethanol',
          },
          amt: {
            name: 'alpha-methyltryptamine',
            prettyName: 'Alpha-Methyltryptamine',
          },
          dmt: {
            name: 'dimethyltryptamine',
            prettyName: 'Dimethyltryptamine',
          },
          lsd: {
            name: 'lysergic acid diethylamide',
            prettyName: 'Lysergic Acid Diethylamide',
          },
          mdma: {
            name: '3,4-methylenedioxymethamphetamine',
            prettyName: '3,4-Methylenedioxymethamphetamine',
          },
          mushrooms: {
            name: 'psilocybin mushrooms',
            prettyName: 'Psilocybin Mushrooms',
          },
          mxe: {
            name: 'methoxetamine',
            prettyName: 'Methoxetamine',
          },
          pcp: {
            name: 'phencyclidine',
            prettyName: 'Phencyclidine',
          },
        }

        // Update combos.json entry
        const combo = comboData[drugAName];
        if (!combo) {
          log(`! ${drugAName} not found`);
          break;
        }

        // Replace the key-value pair with a new k-v with the full name
        comboData[slangMap[drugAName].name] = combo;
        delete comboData[drugAName];

        // Go through each combo, and check if the slang name is one of the interactions, and if so, rename it
        Object.entries(comboData).forEach(([interactionName, interaction]) => {
          log(`scanning ${interactionName}`)
          if (interaction[drugAName]) {
            interaction[slangMap[drugAName].name] = interaction[drugAName];
            delete interaction[drugAName];
          }
        });

        // Update drugs.json entry
        const drug = drugData[drugAName];
        if (!drug) {
          log(`! ${drugAName} not found`);
          break;
        }

        // Add the slang name to the aliases
        drug.aliases?.push(drug.name);

        // Update the drug name and pretty name
        drug.name = slangMap[drugAName].name;
        drug.pretty_name = slangMap[drugAName].prettyName;

        // Update the combos
        Object.entries(drugData).forEach(([drugName, drugData]) => {
          log(`scanning drugs.json ${drugName}`)
          if (drugData.combos?.[drugAName]) {
            drugData.combos[slangMap[drugAName].name] = drugData.combos[drugAName];
            delete drugData.combos[drugAName];
          }
        });
        
        modifiedList.push([drugAName, slangMap[drugAName].name]);
        break;
      }
      case 'ghb/gbl': {
        // This is basically the same as above, but we need to make two changes for each GHB and GBL separately
        const slangMap:{
          [key in 'gbl' | 'ghb']: {
            name: keyof Combos;
            prettyName: string;
          }
        } = {
          gbl: {
            name: 'gamma-butyrolactone',
            prettyName: 'Gamma-butyrolactone',
          },
          ghb: {
            name: 'gamma hydroxybutyrate',
            prettyName: 'Gamma Hydroxybutyrate',
          },
        }

        // Update combos.json entry
        const combo = comboData[drugAName];
        if (!combo) {
          log(`! ${drugAName} not found`);
          break;
        }

        // Replace the key-value pair with a new k-v with the full name
        comboData[slangMap['ghb'].name] = combo;
        comboData[slangMap['gbl'].name] = combo;
        delete comboData[drugAName];

        // Go through each combo, and check if the slang name is one of the interactions, and if so, rename it
        Object.entries(comboData).forEach(([interactionName, interaction]) => {
          log(`scanning ${interactionName}`)
          if (interaction[drugAName]) {
            interaction[slangMap['ghb'].name] = interaction[drugAName];
            interaction[slangMap['gbl'].name] = interaction[drugAName];
            delete interaction[drugAName];
          }
        });

        // Update drugs.json entry
        const drugGhb = drugData['ghb'];
        if (!drugGhb) {
          log(`! ${drugAName} not found`);
          break;
        }
        drugGhb.aliases?.push('ghb');
        drugGhb.name = slangMap['ghb'].name;
        drugGhb.pretty_name = slangMap['ghb'].prettyName;

        const drugGbl = drugData['gbl'];
        if (!drugGbl) {
          log(`! ${drugAName} not found`);
          break;
        }
        drugGbl.aliases?.push('gbl');
        drugGbl.name = slangMap['gbl'].name;
        drugGbl.pretty_name = slangMap['gbl'].prettyName;

        // Update the combos
        Object.entries(drugData).forEach(([drugName, drugData]) => {
          log(`scanning drugs.json ${drugName}`)
          if (drugData.combos?.[drugAName]) {
            drugData.combos[slangMap['ghb'].name] = drugData.combos[drugAName];
            drugData.combos[slangMap['gbl'].name] = drugData.combos[drugAName];
            delete drugData.combos[drugAName];
          }
        });
        
        modifiedList.push([drugAName, slangMap['ghb'].name]);
        modifiedList.push([drugAName, slangMap['gbl'].name]);
        break;
      }
      default:
        // 'alcohol', 'caffeine', 'cannabis', 'cocaine', 'diphenhydramine', 'dextromethorphan', 'ketamine', 'lithium', 'mephedrone', 'mescaline', 'nitrous', 'tramadol'
        // log(`? ${drugAName}`)
        drugList.push(drugAName);
        break;
    }
  });

  log(`Ignored List: ${drugList.join(', ')}`)

  // Create a string for each drug that was modified, with equal columns for the drug name and the combo name
  const longestDrugName = modifiedList.reduce((longest, [drugName]) => drugName.length > longest ? drugName.length : longest, 0);
  const modifiedString = modifiedList.map(([drugName, comboName]) => `~ ${drugName.padEnd(longestDrugName)} = ${comboName}`).join('\n');
  log(modifiedString);

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