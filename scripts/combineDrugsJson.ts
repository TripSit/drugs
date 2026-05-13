console.log("Starting to combine drug JSON files into drugs.json...");
import fs from 'fs';

const drugsIndividualJSONDir = './drug_files/';
const drugsJSONFile = './drugs.json';

function rebuildDrugsJSON() {
    fs.rm(drugsJSONFile, { force: true }, (err) => {
        if (err) {
            console.error('Error deleting drugs.json:', err);
            return;
        }
        console.log('Deleted existing drugs.json');

        fs.readdir(drugsIndividualJSONDir, (err, jsons) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }

            const jsonFiles = jsons.filter(file => file.endsWith('.json'));
            if (jsonFiles.length === 0) {
                console.warn('No JSON files found in the directory.');
                return;
            }

            // Initialize as an object, not an array
            let combinedData: Record<string, any> = {};

            for (const json of jsonFiles) {
                const filePath = `${drugsIndividualJSONDir}${json}`;
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                try {
                    const drugData = JSON.parse(fileContent);
                    // Merge the objects together
                    Object.assign(combinedData, drugData);
                    console.log(`Successfully processed ${json}`);
                } catch (parseErr) {
                    console.error(`Error parsing JSON from file ${json}:`, parseErr);
                }
            }

            // Write to disk once after the loop finishes
            fs.writeFileSync(drugsJSONFile, JSON.stringify(combinedData, null, 2));
            console.log("Finished combining drug JSON files into drugs.json.");
        });
    });
}