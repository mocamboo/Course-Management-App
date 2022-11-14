export default function generateData({amountOfRecords}) {
  const a = ['IT', 'Node.js', 'CSS', 'Java', 'JavaScript'];
  return [...Array (amountOfRecords)].map ((_, index) => {
    return {
      Id: Math.floor (Math.random () * 100000000000 + 1000000000),
      Name: `Course _${index}`,
      Category__c: a.at (Math.floor (Math.random () * 5)),
      Price__c: Math.floor (Math.random () * 5 + 5) * 100,
      Hours__c: Math.floor (Math.random () * 35 + 15),
    };
  });
}