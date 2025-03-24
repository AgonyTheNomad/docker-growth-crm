// Allowed emails with roles and subRoles
export const allowedEmails = [
  // Admin roles - Group 1
  { 
      role: 'admin', 
      emails: [
          "koltonjones@cyberbacker.com",
          "craig@cyberbacker.com",
          "jezel@cyberbacker.com",
          "ryankaizer@cyberbacker.com",
          "jstowe@cyberbacker.com",
          "jonelbuenaventura@cyberbacker.com",
          "claudiogalsim@cyberbacker.com",
          "kdpelonia@cyberbacker.com"
      ]
  },

  // Admin roles - Named members
  {
      role: 'admin',
      members: [
          { name: 'Teejay Salazar', email: 'salazarteejay@cyberbacker.com' },
          { name: 'Ma. Gabrielle Salazar', email: 'gabrielle@cyberbacker.com' },
          { name: 'Andrea Yao', email: 'andreayao@cyberbacker.com' },
          { name: 'John Emmanuel Aragon', email: 'johnaragon@cyberbacker.com' },
          { name: 'Czarfil Bulatao', email: 'czarfil@cyberbacker.com' },
          { name: 'Marvin Rafanan', email: 'marvinrafanan@cyberbacker.com' },
          { name: 'Angelo Ignacio Salva', email: 'angelosalva@cyberbacker.com' },
          { name: 'Jomer Santos', email: 'jomersantos@cyberbacker.com' },
          { name: 'Arthur Villasanta', email: 'arthurvillasanta@cyberbacker.com' },
          { name: 'Omar James Sievert', email: 'ojsievert@cyberbacker.com' },
          { name: 'Rolando Jr. De Las Herras', email: 'rolandodelasherras@cyberbacker.com' },
          { name: 'Girard-Allen Atienza', email: 'girardallenatienza@cyberbacker.com' },
          { name: 'Raymund Steven Samarista', email: 'raymundsamarista@cyberbacker.com' },
          { name: 'Ma. Shaira Kathleen Cajilig', email: 'mskcajilig@cyberbacker.com' },
          { name: 'Hazel Bonawas', email: 'hazelbonawas@cyberbacker.com' },
          { name: 'Raylen Sibanico', email: 'raylensibanico@cyberbacker.com' },
          { name: 'Daphne Jayma-Regis', email: 'daphneregis@cyberbacker.com' },
          { name: 'Cyril Morales', email: 'cyrilmorales@cyberbacker.com' },
          { name: 'Michelle Petina', email: 'michellepetina@cyberbacker.com' },
          { name: 'Mailyn Bantilan', email: 'mailyn@cyberbacker.com' }
      ]
  },

  // Referrer role
  { role: 'referrer', emails: ["harmony.nordgren@cyberbacker.com"] },

  // Single franchise members
  {
      role: 'franchise',
      subRole: 'F001',
      members: [
          { name: 'Ruvie May Pacana', email: 'ruviepacana@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F002',
      members: [
          { name: 'Mike', email: 'mike@stlfinesthomes.com' },
          { name: 'Bonni', email: 'bonni@stlfinesthomes.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F004',
      members: [
          { name: 'Allison', email: 'allison.g@kw.com' },
          { name: 'Jwayaan', email: 'jwayaan@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F006',
      members: [
          { name: 'Mwimmer', email: 'mwimmer@kw.com' },
          { name: 'Jessica', email: 'jessicafox@kw.com' },
          { name: 'Carla Marie Castro', email: 'cmcastro@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F007',
      members: [
          { name: 'Pam', email: 'pam@thebuteragroup.com' },
          { name: 'Ryan Clayton Santos', email: 'ryansantos@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F008',
      members: [
          { name: 'Derek', email: 'derek@blainrealestategroup.com' },
          { name: 'Aminabebe', email: 'aminabebe@gmail.com' },
          { name: 'Ron', email: 'roncathell@gmail.com' },
          { name: 'Pat', email: 'patpage@kw.com' },
          { name: 'Diana Rose Ominga', email: 'dianaominga@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F009',
      members: [
          { name: 'Jeff', email: 'jeff@cyberbackermaryland.com' },
          { name: 'Maria', email: 'maria@cyberbackermaryland.com' },
          { name: 'Jose', email: 'jose@cyberbackermaryland.com' },
          { name: 'Shara Ferma', email: 'sharaferma@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F014',
      members: [
          { name: 'Rob', email: 'robwarfield@kw.com' },
          { name: 'Zane', email: 'zane@stonebridgehomeadvisors.com' },
          { name: 'Kent', email: 'kenttemple@kw.com' },
          { name: 'Pamela', email: 'pamelatemple@kw.com' },
          { name: 'Kt', email: 'kt@templecoachingco.com' },
          { name: 'Sarrin', email: 'sarrinwarfield@kw.com' },
          { name: 'Jonalyn Rica Capili', email: 'jcapili@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F015',
      members: [
          { name: 'Bryan', email: 'bryanfair@kw.com' },
          { name: 'Kim', email: 'kimesteskw@gmail.com' },
          { name: 'Marci', email: 'marcifair@kw.com' },
          { name: 'Jason', email: 'jasonbonds@kw.com' },
          { name: 'John', email: 'johndurham@kw.com' },
          { name: 'Trey', email: 'trey@ringthebellteam.com' },
          { name: 'Jeffrey Lulu', email: 'jeffreylulu@cyberbacker.com' },
          { name: 'Jacqueline Joyce Calilit', email: 'jacquelinecalilit@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F023',
      members: [
          { name: 'Amy', email: 'amy@cyberbackernorcal.com' },
          { name: 'Norcal', email: 'norcal@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F024',
      members: [
          { name: 'Ron', email: 'ron@primehouseteam.com' },
          { name: 'Rene', email: 'rene.gonzales@kw.com' },
          { name: 'Elisa', email: 'elisa.gonzalez@kw.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F025',
      members: [
          { name: 'Mike', email: 'mikehyde@kw.com' },
          { name: 'Camille Ann Vistan', email: 'cvistan@cyberbacker.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F026',
      members: [
          { name: 'Jdmirealestate', email: 'jdmirealestate@gmail.com' },
          { name: 'Brooks', email: 'brooks@mittenhometeam.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F033',
      members: [
          { name: 'Kelley', email: 'kelleywiley@kw.com' },
          { name: 'Mike', email: 'mike.davis@kw.com' }
      ]
  },
  {
      role: 'franchise',
      subRole: 'F034',
      members: [
          { name: 'Jane', email: 'jane@janemaslowski.com' },
          { name: 'Lorianne', email: 'lorianne@janemaslowski.com' },
          { name: 'Greaterpa', email: 'greaterpa@cyberbacker.com' }
      ]
  },
    { role: 'franchise', 
        subRole: 'F047', 
        members: [ 
            {name: 'John', email: 'coachzercher@gmail.com' },
            {name: 'Courtney', email: 'courtney@courtneynewton.com' },
            {name: 'Bernard', email: 'bernard@cyberbacker.com' },
         ]
    },

  // Multi-franchise and multi-role members
  {
      members: [
          {
              name: 'Rich Rector',
              email: 'rich@rectorrecruiting.com',
              roles: [
                  { role: 'franchise', subRole: 'F001' },
                  { role: 'franchise', subRole: 'F002' },
                  { role: 'franchise', subRole: 'F004' },
                  { role: 'franchise', subRole: 'F006' },
                  { role: 'franchise', subRole: 'F013' },
                  { role: 'franchise', subRole: 'F016' },
                  { role: 'franchise', subRole: 'F019' },
                  { role: 'franchise', subRole: 'F027' },
                  { role: 'franchise', subRole: 'F043' }
              ]
          },
          {
              name: 'Coach Zuber Group',
              email: 'coach@zubergroup.com',
              roles: [
                  { role: 'franchise', subRole: 'F040' },
                  { role: 'franchise', subRole: 'F042' },
                  { role: 'franchise', subRole: 'F046' }
              ]
          },
          {
              name: 'Nicole Zuber',
              email: 'nicolezuber@me.com',
              roles: [
                  { role: 'franchise', subRole: 'F040' },
                  { role: 'franchise', subRole: 'F042' },
                  { role: 'franchise', subRole: 'F046' }
              ]
          },
          {
              name: 'Sajag',
              email: 'sajag@kw.com',
              roles: [
                  { role: 'franchise', subRole: 'F040' },
                  { role: 'franchise', subRole: 'F046' }
              ]
          },
          {
              name: 'Mrs Coach',
              email: 'mrscoach@zubergroup.com',
              roles: [
                  { role: 'franchise', subRole: 'F040' },
                  { role: 'franchise', subRole: 'F046' }
              ]
          },
          {
              name: 'Haidee Alde',
              email: 'haidee@cyberbacker.com',
              roles: [
                  { role: 'franchise', subRole: 'F004' },
                  { role: 'franchise', subRole: 'F013' }
              ]
          },
          {
              name: 'Salmer Joseph Falame',
              email: 'sfalame@cyberbacker.com',
              roles: [
                  { role: 'franchise', subRole: 'F027' },
                  { role: 'franchise', subRole: 'F016' },
                  { role: 'franchise', subRole: 'F043' }
              ]
          },
          {
              name: 'Johannes Gillera',
              email: 'johannesgillera@cyberbacker.com',
              roles: [
                  { role: 'franchise', subRole: 'F026' },
                  { role: 'franchise', subRole: 'No' }
              ]
          },
          {
              name: 'Eunice Perolina',
              email: 'euniceperolina@cyberbacker.com',
              roles: [
                  { role: 'franchise', subRole: 'F016' },
                  { role: 'franchise', subRole: 'No' }
              ]
          },
          {
              name: 'Irene Cara Daza',
              email: 'irenedaza@cyberbacker.com',
              roles: [
                  { role: 'franchise', subRole: 'F023' },
                  { role: 'franchise', subRole: 'No' }
              ]
          },
          {
              name: 'Ryla Mae Montelibano',
              email: 'rylamontelibano@cyberbacker.com',
              roles: [
                  { role: 'franchise', subRole: 'F045' },
                  { role: 'franchise', subRole: 'No' }
              ]
          },
          {
              name: 'Ruth Danielle Gascon',
              email: 'ruthgascon@cyberbacker.com',
              roles: [
                  { role: 'franchise', subRole: 'F024' },
                  { role: 'franchise', subRole: 'No' }
              ]
          },
          {
              name: 'Einstein Angelo Makasiar',
              email: 'eamakasiar@cyberbacker.com',
              roles: [
                  { role: 'franchise', subRole: 'F033' },
                  { role: 'franchise', subRole: 'No' }
              ]
          },
          {
            name: 'Mary Paulene Caguimbal',
            email: 'maryingua@cyberbacker.com',
            roles: [
                { role: 'franchise', subRole: 'F042' },
                { role: 'franchise', subRole: 'No' }
            ]
        },
        {
            name: 'Ma Kristina Alberto',
            email: 'mkalberto@cyberbacker.com',
            roles: [
                { role: 'franchise', subRole: 'F034' },
                { role: 'franchise', subRole: 'No' }
            ]
        }
    ]
},

// Users with only 'No' subRole
{
    role: 'franchise',
    subRole: 'No',
    members: [
        { name: 'Renan Garcia', email: 'renan@cyberbacker.com' },
        { name: 'Paul Alfafara', email: 'palfafara@cyberbacker.com' },
        { name: 'Romil Rosal', email: 'romilrosal@cyberbacker.com' },
        { name: 'Iyana Marjo Manansala', email: 'iyanasalazar@cyberbacker.com' },
        { name: 'Ma. Lejanni Cruz', email: 'lejannicruz@cyberbacker.com' },
        { name: 'Jed Joshua Lim', email: 'jedjoshua@cyberbacker.com' },
        { name: 'Jezzrah Morrie Arellano', email: 'jezzraharellano@cyberbacker.com' },
        { name: 'Aurora Jo Neri', email: 'aurorajoneri@cyberbacker.com' },
        { name: 'Micheal Molina', email: 'michaelmolina@cyberbacker.com' }

    ]
}
];
