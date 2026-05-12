import fs from 'fs';

const drugsIndividualJSONDir = './drug_files/';

fs.rm('./drugs.json', { force: true }, (err) => {
}
)
const drugsJSONFile = './drugs.json'

fs.readdir(drugsIndividualJSONDir, (err, jsons) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    if (jsons.length === 0) {
        console.warn('No JSON files found in the directory.');
        return;
    }
    for (const json of jsons) {
        if (!json.endsWith('.json')) {
            console.warn(`Skipping non-JSON file: ${json}`);
            continue;
        }
        else {
            const filePath = `${drugsIndividualJSONDir}${json}`;
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            try {
                const drugData = JSON.parse(fileContent);
                let combinedData: any[] = [];
                if (fs.existsSync(drugsJSONFile)) {
                    const existingContent = fs.readFileSync(drugsJSONFile, 'utf-8');
                    combinedData = JSON.parse(existingContent);
                }
                combinedData.push(...drugData);
                fs.writeFileSync(drugsJSONFile, JSON.stringify(combinedData, null, 2));
                console.log(`Successfully combined ${json} into drugs.json`);
            } catch (parseErr) {
                console.error(`Error parsing JSON from file ${json}:`, parseErr);
            }
        }
    }
}
)