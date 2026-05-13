import fs from 'fs/promises';
import path from 'path';

const drugsIndividualJSONDir = './drug_files/';
const drugsJSONFile = './drugs.json';

/**
 * Recursively sorts object keys to match the validation criteria:
 * localeCompare with { numeric: true, sensitivity: 'base' }
 */
function sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }

    const sortedObj: Record<string, any> = {};
    // Get keys and sort them using the exact logic from combosToDrugs.ts
    const keys = Object.keys(obj).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

    for (const key of keys) {
        // Recursively sort nested objects (like 'properties' or 'formatted_dose')
        sortedObj[key] = sortObjectKeys(obj[key]);
    }

    return sortedObj;
}

async function rebuildDrugsJSON() {
    console.log("Starting to combine drug JSON files into drugs.json...");

    try {
        // 1. Clean up existing file
        await fs.rm(drugsJSONFile, { force: true });

        // 2. Read the directory
        const files = await fs.readdir(drugsIndividualJSONDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        if (jsonFiles.length === 0) {
            console.warn('No JSON files found in the directory.');
            return;
        }

        const combinedData: Record<string, any> = {};

        // 3. Merge all files into one object
        for (const json of jsonFiles) {
            const filePath = path.join(drugsIndividualJSONDir, json);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            try {
                const drugData = JSON.parse(fileContent);
                Object.assign(combinedData, drugData);
                console.log(`Successfully processed ${json}`);
            } catch (parseErr) {
                console.error(`Error parsing JSON from file ${json}:`, parseErr);
            }
        }

        // 4. Alphabetize the final object recursively to satisfy the CI check
        const sortedData = sortObjectKeys(combinedData);

        // 5. Write the sorted file to disk
        await fs.writeFile(drugsJSONFile, JSON.stringify(sortedData, null, 2));
        console.log(`Finished! Combined and alphabetized ${Object.keys(sortedData).length} drugs into drugs.json.`);

    } catch (err) {
        console.error('An error occurred during the rebuild process:', err);
        process.exit(1);
    }
}

// Execute the function
rebuildDrugsJSON();