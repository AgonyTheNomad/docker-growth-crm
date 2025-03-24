const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Logan", "Sophia", "Ethan", "Isabella", "Lucas", "Mia", "Mason", "Charlotte", "Benjamin", "Amelia", "James", "Harper", "Alexander", "Evelyn", "Michael"];
const lastNames = ["Brown", "Wilson", "Davis", "Miller", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker"];
const companyNames = ["Estate Elite", "Home Pioneers", "Realty Masters", "Property Pros", "Housing Heroes"];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const mockCustomers = new Array(25).fill(null).map((_, index) => ({
  id: index + 1,
  name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
  company: getRandomElement(companyNames),
  value: Math.floor(Math.random() * 500000) + 100000, 
  column: index % 7
}));