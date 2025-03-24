import moment from 'moment-timezone';
import stringSimilarity from 'string-similarity';

export const getClientIdWithTimestamp = (baseId) => {
  const timestamp = moment().tz('America/Denver').format();
  return `${baseId}-${timestamp}`;
};

export const normalizePhoneNumber = (phoneNumber) => {
  if (typeof phoneNumber !== 'string') return '';
  return phoneNumber.replace(/[\s\-()\.]|Ext\.?/gi, "");
};


export const prepareDataForBackend = (data) => {
  return data.map(row => {
    const processedRow = { ...row };
    
    // Handle contact_history
    try {
      if (!processedRow.contact_history) {
        // If empty, use empty array
        processedRow.contact_history = '[]';
      } else if (typeof processedRow.contact_history === 'string') {
        // If it's a simple note string, convert it to a contact history entry
        if (!processedRow.contact_history.startsWith('[')) {
          const note = processedRow.contact_history;
          processedRow.contact_history = JSON.stringify([{
            date: new Date().toISOString().split('T')[0], // Today's date
            note: note
          }]);
        } else {
          // Validate if it's already JSON format
          JSON.parse(processedRow.contact_history);
        }
      } else {
        // If it's not a string, convert to JSON
        processedRow.contact_history = JSON.stringify([{
          date: new Date().toISOString().split('T')[0],
          note: String(processedRow.contact_history)
        }]);
      }
    } catch (e) {
      console.warn('Invalid contact history format, defaulting to empty array');
      processedRow.contact_history = '[]';
    }

    return processedRow;
  });
};




export const isSimilar = (string1, string2) => {
  const similarity = stringSimilarity.compareTwoStrings(string1.toLowerCase(), string2.toLowerCase());
  const threshold = 0.8;
  return similarity > threshold;
};

export const normalizeValue = (value) => value === "N/A" || value === "" ? "" : value;

export const excludeKeysFromObject = (obj, keysToExclude) => {
  return Object.keys(obj).reduce((result, key) => {
    if (!keysToExclude.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

export const STATUSES = [
  "Key Target Demographics",
  "Knows Cyberbacker",
  "Lead",
  "Invalid Lead",
  "Declined",
  "Appointment Set",
  "Appointment Kept",
  "Prime Simulations",
  "Agreement Signed",
  "Hiring Fee Paid",
  "On Pause",
  "Active",
  "Awaiting Replacement",
  "Canceled",
  "MAPS Credit",
  "Trade",
  "Active (Winback)",
  "Winback",
  "Active (NR - 6months)",
];

export const FRANCHISE_OPTIONS = {
  "Rich Rector": "F001",
  "Rich Rector, Mike Galbally and Bonni Galbally": "F002",
  "Allison Gambone and Rich Rector": "F004",
  "Jessica Wimmer, Mark Wimmer, and Rich Rector": "F006",
  "Pam Butera": "F007",
  "Derek Blain, Amina Basic, Patrick Page, and Ron Cathell": "F008",
  "Jeff Kuhn, Jose Rivas, and Maria Santillano": "F009",
  "Ryan McLean and Rich Rector": "F013",
  "Rob Warfield, Zane Meadors, and Sarrin Warfield": "F014",
  "Bryan Fair, Marci Fair, Jason Bonds, John Durham, Trey Bell, and Kim Estes": "F015",
  "Rich Rector LA": "F016",
  "Rich Rector, Richard Kim, and Samuel Rymer": "F019",
  "Amy Pittard and Jeremy Pittard": "F023",
  "Ron Mast, Catherine Mast, Rene Gonzalez, and Elisa Gonzalez": "F024",
  "Michael Hyde": "F025",
  "Brooks Warner and John Douglas": "F026",
  "Timothy Minnix and Rich Rector": "F027",
  "Kelly Wiley and Michael Davis": "F033",
  "Jane Maslowski": "F034",
  "Craig Zuber and Sajag Patel": "F040",
  "Jordan Freed, Dave Johns, Steve Johns and Lucas Sherraden": "F041",
  "Chris Guldi, Craig Zuber, Nicole Zuber, Liz Landry": "F042",
  "Richard Rector, Jennifer Avellan and Shelly Saroyan": "F043",
  "Christer Holmquist, Peter Vaillancourt": "F045",
  "Craig Zuber and Sajag Patel": "F046",
  "John Zercher, Courtney Newton": "F047"
};

export const FRANCHISE_DESCRIPTIONS = {
  "F001": "F001 - Rich Rector",
  "F004": "F004 - Allison Gambone and Rich Rector",
  "F006": "F006 - Jessica Wimmer, Mark Wimmer, and Rich Rector",
  "F007": "F007 - Pam Butera",
  "F008": "F008 - Derek Blain, Amina Basic, Patrick Page, and Ron Cathell",
  "F009": "F009 - Jeff Kuhn, Jose Rivas, and Maria Santillano",
  "F014": "F014 - Rob Warfield, Zane Meadors, and Sarrin Warfield",
  "F015": "F015 - Bryan Fair, Marci Fair, Jason Bonds, John Durham, Trey Bell, and Kim Estes",
  "F016": "F016 - Rich Rector LA",
  "F040": "F040 - Craig Zuber and Sajag Patel",
  "F043": "F043 - Richard Rector, Jennifer Avellan and Shelly Saroyan",
  "F046": "F046 - Craig Zuber and Sajag Patel",
  "F047": "F047 - John Zercher, Courtney Newton",
  "Non:": "Non-Franchise"
};

export const GROWTHBACKERS = [
  'Andrea Yao',
  'Andrei Rene Jayag',
  'Andrey Olpot',
  'Angela Luiza Villa-Abrille',
  'Anne Jeanine Frac',
  'Arianne Denise Balaoing',
  'Armie Yehlen Ramos',
  'Assigned to Annie',
  'Bernard Jason Cruz',
  'Bryan Ebuseo',
  'Camille Ann Vistan',
  'cara',
  'Carla Marie Castro',
  'Darryl Sandil',
  'Diana Rose Ominga',
  'Efraim Causing',
  'Einstein Angelo Makasiar',
  'Eunice Perolina',
  'Florianne Marie Limon',
  'Haidee Alde',
  'Hanna Eunice Salaver',
  'Irene Cara Daza',
  'Irish Esteban',
  'Iyana Marjo Manansala',
  'Iyana Marjo Salazar',
  'Iyana Marjo S Manansala',
  'Jacqeuline Joyce Calilit',
  'Jed Joshua Lim',
  'Jeffrey Lulu',
  'Jerard Al Caudal',
  'Jessieca Waya-an',
  'Jezzrah Arellano',
  'Jezzrah Morrie Arellano',
  'Jhariz Amanda Garcia',
  'Jhemylunne Jireh Dalma',
  'Jiro Nicolo Pastor',
  'Johannes Gillera',
  'John Emmanuel Aragon',
  'Jonalyn Rica Capili',
  'Julliene Gomos',
  'Kimberly Novesteras',
  'Krista Mari Lomigo',
  'Leah Joy Orais',
  'Ma. Gabrielle Salazar',
  'Ma Kristina Alberto',
  'Ma. Kristina Alberto',
  'Ma. Lejanni Cruz',
  'Mary Ann Dueñas',
  'Mary Paulene Caguimbal',
  'Mary Rose Alfante',
  'Mitch Tanael',
  'Patricia Joy Antonio',
  'Paul Alfafara',
  'Paul Gerard Alfafara',
  'Raisham Hampac',
  'Ralf Aron Wong',
  'Raphael Julius Lenon',
  'Renan Garcia',
  'Romil Rosal',
  'Ruth Danielle Gascon',
  'Ruvie May Pacana',
  'Ryan Clayton Santos',
  'Ryla Mae Montelibano',
  'Salmer Joseph Falame',
  'Shara Ferma',
  'Sheilah Mae Padalla',
  'Stephanie Notarte',
  'Test Growthbacker',
  'Test Growthbacker 1',
  'Test Growthbacker 2',
  'Test Growthbacker 3'
];

