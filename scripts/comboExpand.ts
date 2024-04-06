/*
The Combos.json file contains both wildcard drugs (2c-t-x, 2c-x) and category drugs (amphetamines, benzodiazepines, etc).
These drugs are not present in the drugs.json file, so we need to expand and add info for these drugs.
*/

import fs from 'fs/promises';
import path from 'path';
import { Category, Drug } from '../types/drugs';
import { Combos, Interactions } from '../types/combos';
import drugsData from '../drugs.json';
import combosData from '../combos.json';
import { log } from 'console';

// Define the .json files we're working with
const drugData = drugsData as {[key: string]: Drug};
const comboData = combosData as {[key in keyof Combos]: Interactions};

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
      // Wildcard drugs first
      case '2c-t-x':
      case '2c-x':
      case '5-meo-xxt':
      case 'dox': {
        // For these I have previously done a regex search and found the following results
        // Regex is too frustrating to fiddle with to make a perfectly matching string, so we can use the list below
        // Some im not sure of, but thankfully we can just comment/uncomment and re-run the script
        const wildcardMap = {
          '2c-t-x': [
            '2c-t-2',
            '2c-t-4',
            '2c-t-7',
            '2c-t-21',
          ],
          '2c-x': [
            '2c-b',
            // '2c-b-an', // IDT these count?
            // '2c-b-fly',
            // '2c-b-fly-nbome',
            '2c-c',
            '2c-d',
            '2c-e',
            '2c-g',
            '2c-i',
            '2c-ip',
            '2c-n',
            '2c-p',
            '2c-t', // Or is this a 2c-t-x?
          ],
          '5-meo-xxt': [
            '5-meo-amt',
            '5-meo-dalt', // This is included even though it's XXXT right?
            '5-meo-dipt', // This is included even though it's XXXT right?
            '5-meo-dmt',
            '5-meo-dpt',
            '5-meo-eipt', // This is included even though it's XXXT right?
            '5-meo-malt', // This is included even though it's XXXT right?
            '5-meo-met',
            '5-meo-mipt', // This is included even though it's XXXT right?
            '5-meo-nipt' // This is included even though it's XXXT right?
          ],
          'dox': [
            'dob',
            'doc',
            // 'doet', // This doesn't count right?
            'doi',
            // 'doip', // This doesn't count right?
            'dom',
            'don',
            // 'dopr',  // This doesn't count right?
            // 'doxylamine' // This doesn't count right?
          ]
        }
        wildcardMap[drugAName].forEach((drugName) => {
          if (drugData[drugName]) {
            drugData[drugName].combos = comboEntry
            // log(`~ ${drugName} = ${drugAName}`)
            modifiedList.push([drugName, drugAName]);
          } else {
            console.log(`Drug ${drugName} not found`);
          }
        });
        break;
      }
      // Category drugs
      case 'benzodiazepines':
      case 'opioids':
      case 'ssris': {
        // The Categories in drugs.json are different from the categories in Combos.json, so we need to map them
        const categoryMap = {
          'benzodiazepines': 'benzodiazepine',
          'opioids': 'opioid',
          'ssris': 'ssri',
        } as {[key: string]: Category};

        Object.entries(drugData).forEach(([drugName, drugEntry]) => {
          if (drugEntry.categories?.includes(categoryMap[drugAName])) {
            drugData[drugName].combos = comboEntry;
            // log(`~ ${drugName} = ${categoryMap[drugAName]}`)
            modifiedList.push([drugName, categoryMap[drugAName]]);
          }
        });
        break;
      }
      // Other conversions
      case 'amphetamines': 
        /* For amphetamines we do two things:
        1) Check the Categories for Stimulant
            This is NOT accurate, as there are many stimulants that are not amphetamines
        2) Check the name for 'amphetamine', eg, 'methamphetamine', 'dextroamphetamine', etc
            This is also not accurate, as there are many amphetamines that do not have 'amphetamine' in the name
            However, it's a good start
        If either of these are true, we add the combo data
        */

        Object.entries(drugData).forEach(([drugName, drugEntry]) => {
          // This does not seem accurate at all and it is not suggested to uncommment this
          // if (drugEntry.categories?.includes('stimulant' as Category)) {
          //   drugData[drugName].combos = comboEntry;
          //   log(`${drugEntry.name} has stimulant as a category and I updated its combo data`)
          // }
          if (drugName.toLowerCase().includes('amphetamine')) {
            drugData[drugName].combos = comboEntry;
            // log(`~ ${drugName} = ${drugAName}`)
            modifiedList.push([drugName, drugAName]);
          }
        });
        break;
      case 'nbomes':
        // NBomes do not have a category, but each nbome does include "nbome" in the name.
        // If the drug name includes "nbome", we add the combo data
        Object.entries(drugData).forEach(([drugName, drugEntry]) => {
          if (drugName.toLowerCase().includes('nbome')) {
            drugData[drugName].combos = comboEntry;
            // log(`~ ${drugName} = ${drugAName}`)
            modifiedList.push([drugName, drugAName]);
          }
        });
        break;
      case 'ghb/gbl':
        // These are two different drugs that are treated the same in the combo file
        // We can just check if the name includes "ghb" or "gbl"
        Object.entries(drugData).forEach(([drugName, drugEntry]) => {
          if (drugName.toLowerCase().includes('ghb') || drugName.toLowerCase().includes('gbl')) {
            drugData[drugName].combos = comboEntry;
            // log(`~ ${drugName} = ${drugAName}`)
            modifiedList.push([drugName, drugAName]);
          }
        });
        break;
      case 'maois':
        // I don't know if we have MAOI's in the drugs.json but if we do we likely need to explicitly setup logic for them like ghb/gbl
        break;
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
}


compareData()
  .then(() => {
    console.log('Done!');
  })
  .catch((err) => {
    console.error(err);
  });