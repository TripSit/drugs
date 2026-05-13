import fs from 'fs/promises';
import path from 'path';

const drugsIndividualJSONDir = './drug_files/';
const drugsJSONFile = './drugs.json';

/**
 * Combines individual drug JSON files into a single drugs.json object.
 */
async function rebuildDrugsJSON() {
    console.log("Starting to combine drug JSON files into drugs.json...");

    try {
        // 1. Remove the existing drugs.json if it exists
        await fs.rm(drugsJSONFile, { force: true });
        console.log('Cleaned up existing drugs.json');

        // 2. Read the directory for individual JSON files
        const files = await fs.readdir(drugsIndividualJSONDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        if (jsonFiles.length === 0) {
            console.warn('No JSON files found in the directory.');
            return;
        }

        const combinedData: Record<string, any> = {};

        // 3. Process files iteratively
        for (const json of jsonFiles) {
            const filePath = path.join(drugsIndividualJSONDir, json);
            const fileContent = await fs.readFile(filePath, 'utf-8');

            try {
                const drugData = JSON.parse(fileContent);
                // Merge individual drug objects into the master record
                Object.assign(combinedData, drugData);
                console.log(`Successfully processed ${json}`);
            } catch (parseErr) {
                console.error(`Error parsing JSON from file ${json}:`, parseErr);
            }
        }

        // 4. Write the final combined object to disk
        await fs.writeFile(drugsJSONFile, JSON.stringify(combinedData, null, 2));
        console.log(`Finished! Combined ${Object.keys(combinedData).length} drugs into drugs.json.`);

    } catch (err) {
        console.error('An error occurred during the rebuild process:', err);
        process.exit(1);
    }
}

// Invoke the function to actually run the logic
rebuildDrugsJSON();