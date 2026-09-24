import { FeedbackItem } from '../types';

export function generateMonthlyFeedbackItems(): FeedbackItem[] {
  const items: FeedbackItem[] = [];

  // Helper to format date
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // 1. JANUARY 2026 (44 cases: 0 complaints, 14 compliments, 30 thank yous)
  const janComplimentTexts = [
    'The newly launched Dragon Roasted coffee at the cafe entrance was fantastic! Great recommendation by the barista.',
    'Spotless cleanliness in the dining hall and very fast service at the Butterbeer Bar on a chilly morning.',
    'Barista was very knowledgeable about allergen options and prepared a delicious oat milk latte with a smile.',
    'Lovely hot soup at Food Hall, kept us warm and energized for the remainder of the tour.',
    'Staff in Backlot Cafe were so friendly and proactively asked if we wanted to try the butterbeer ice cream.',
    'Delicious pastries at Chocolate Frog Cafe. The supervisor was so polite and attentive.',
    'Dragon Roasted barista trainer gave us great tips on which specialty roast to try. Excellent addition.',
    'Clean tables and swift tray collection in the Food Hall during our midday lunch.',
    'Friendly greetings from every staff member we encountered in the catering areas today.',
    'Super fast service at the Butterbeer Bar despite a large queue forming after the Backlot set.',
    'Chocolate Frog Cafe muffins were fresh and warm. Team member was extremely cheerful.',
    'Great vegetarian options clearly marked in the Food Hall. Commendable staff attentiveness.',
    'Staff took the time to check our gluten-free requirements with the kitchen supervisor. 10/10 service.',
    'Baristas at Dragon Roasted counter were fast, smiling, and professional. Great start to 2026!',
  ];

  for (let i = 0; i < 14; i++) {
    const day = 2 + (i % 26);
    items.push({
      id: `WB-30110${pad(i + 1)}`,
      caseNumber: `WB-30110${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-01-${pad(day)}`,
      monthYear: 'January 2026',
      type: 'Compliment',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Staff',
      department: i % 2 === 0 ? 'F&B - Aramark' : 'Dragon Roasted',
      area: i % 3 === 0 ? 'F&B- Food Hall' : i % 3 === 1 ? 'Dragon RC' : 'Chocolate Frog Café',
      venue: i % 3 === 0 ? 'Food Hall' : i % 3 === 1 ? 'Dragon RC' : 'Chocolate Frog',
      feedbackDetail: janComplimentTexts[i],
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 30; i++) {
    const day = 1 + (i % 28);
    items.push({
      id: `WB-30120${pad(i + 1)}`,
      caseNumber: `WB-30120${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-01-${pad(day)}`,
      monthYear: 'January 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Thank you for a wonderful winter tour and hot drinks during our visit! (Jan Ref #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  // 2. FEBRUARY 2026 (54 cases: 1 complaint, 10 compliments, 43 thank yous)
  items.push({
    id: 'WB-3020001',
    caseNumber: 'WB-3020001',
    caseStatus: 'Open',
    date: '2026-02-14',
    monthYear: 'February 2026',
    type: 'Complaint',
    tableName: 'Tour Experience',
    category: 'Tour Experience',
    subCategory: 'Service Levels',
    department: 'F&B - Aramark',
    area: 'F&B- Backlot Café',
    venue: 'Backlot Cafe',
    feedbackDetail:
      'Service levels in Backlot Cafe felt slow during our lunch visit. Staff members were observed chatting to each other near the pickup counter while trays were waiting.',
    actionTaken:
      'Held mini coaching session with team members on floor awareness and empowered supervisors to balance break rotations during peak traffic.',
    actionOwner: 'Duty Manager',
    actionDueDate: '2026-02-28',
    status: 'InProgress',
    actionLogs: [
      {
        id: 'log-feb-1',
        timestamp: '2026-02-15 10:00',
        author: 'Duty Manager',
        note: 'Coaching session conducted with Backlot front-of-house team regarding customer-facing focus.',
      },
    ],
  });

  const febComplimentTexts = [
    'Super friendly staff greeting at the entrance cafe, made our Valentine visit feel truly special.',
    'Delicious hot chocolate and prompt service in the Hub Cafe.',
    'Staff member at Butterbeer Bar was delightfully enthusiastic about Harry Potter trivia.',
    'Warm pasties in Food Hall were fresh, hot, and tasty.',
    'The barista at Hub Cafe showed great product knowledge and recommended the signature roast.',
    'Backlot Cafe team was attentive and quickly cleared our table with a smile.',
    'Chocolate Frog Cafe desserts were beautifully presented.',
    'Team member helped us find allergen-free options with total confidence and patience.',
    'Great customer service at the Food Hall till counter.',
    'Quick service and delightful Butterbeer souvenir mugs.',
  ];

  for (let i = 0; i < 10; i++) {
    const day = 2 + (i % 25);
    items.push({
      id: `WB-30210${pad(i + 1)}`,
      caseNumber: `WB-30210${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-02-${pad(day)}`,
      monthYear: 'February 2026',
      type: 'Compliment',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Staff',
      department: 'F&B - Aramark',
      area: i % 2 === 0 ? 'Hub Cafe' : 'F&B- Butterbeer Bar',
      venue: i % 2 === 0 ? 'Hub Cafe' : 'Butterbeer Bar',
      feedbackDetail: febComplimentTexts[i],
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 43; i++) {
    const day = 1 + (i % 27);
    items.push({
      id: `WB-30220${pad(i + 1)}`,
      caseNumber: `WB-30220${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-02-${pad(day)}`,
      monthYear: 'February 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Thank you for the warm hospitality and great catering service on our tour! (Feb Ref #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  // 3. MARCH 2026 (72 cases: 0 complaints, 23 compliments, 49 thank yous)
  const marComplimentTexts = [
    'Cleanliness of the dining areas and tables was remarkable today.',
    'Staff proactively asked about allergies before we even ordered. Very reassuring!',
    'Happee Birthdae cake was moist, delicious, and stayed fresh thanks to proper cold storage.',
    'Warm and friendly welcome from the Food Hall greeting host.',
    'The barista at Hub Cafe made the best flat white I have had in months.',
    'Chocolate Frog Cafe team was courteous, cheerful, and speedy.',
    'Butterbeer Bar queue moved very quickly despite hundreds of tour guests arriving.',
    'Lovely staff farewell as we exited the cafe towards the tour expansion.',
    'Tables were cleaned and sanitized immediately after guests departed.',
    'Team member offered excellent advice on the children meal combinations.',
    'Great enthusiasm from the Backlot Cafe till team.',
    'Fresh salads and sandwiches in Food Hall with crisp ingredients.',
    'Super helpful staff when asking for extra napkins and cutlery.',
    'The new drinks policy allowing lidded cups into the experience corridor was fantastic!',
    'Dragon Roasted coffee cups with wizarding world trivia were fun and engaging.',
    'Afternoon tea table was impeccably set up.',
    'Wonderful hot pasty served with a big smile.',
    'Catering team handled lunchtime rush with impressive poise.',
    'Staff member remembered our dietary preferences on our return order.',
    'Friendly greetings and cheerful farewells made our day special.',
    'Spotless facilities in all cafe areas.',
    'Delicious chocolate frog brownies and hot beverages.',
    'Staff attentiveness across all F&B points was 5 stars.',
  ];

  for (let i = 0; i < 23; i++) {
    const day = 1 + (i % 30);
    items.push({
      id: `WB-30310${pad(i + 1)}`,
      caseNumber: `WB-30310${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-03-${pad(day)}`,
      monthYear: 'March 2026',
      type: 'Compliment',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Staff',
      department: 'F&B - Aramark',
      area: i % 3 === 0 ? 'F&B- Food Hall' : i % 3 === 1 ? 'Hub Cafe' : 'F&B- Backlot Café',
      venue: i % 3 === 0 ? 'Food Hall' : i % 3 === 1 ? 'Hub Cafe' : 'Backlot Cafe',
      feedbackDetail: marComplimentTexts[i],
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 49; i++) {
    const day = 1 + (i % 30);
    items.push({
      id: `WB-30320${pad(i + 1)}`,
      caseNumber: `WB-30320${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-03-${pad(day)}`,
      monthYear: 'March 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Thank you for such a clean, hospitable, and enjoyable catering experience! (Mar Ref #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  // 4. APRIL 2026 (62 cases: 0 complaints, 13 compliments, 49 thank yous)
  const aprComplimentTexts = [
    'The Hogwarts Table area feels so premium and exclusive! The new table lamps create a gorgeous ambience.',
    'Staff took the time to personalise our dining experience for our anniversary.',
    'Friendly greetings and smiling faces at the Dragon Roasted coffee bar.',
    'Afternoon Tea stands were beautifully refreshed and the teaware was spotless.',
    'Barista was brilliant, cheerful, and made fantastic latte art.',
    'Backlot Cafe queue moved smoothly thanks to streamlined food lines.',
    'Butterbeer Bar was efficiently run with negligible waiting time.',
    'Food Hall staff was so helpful with high chair arrangements for our toddler.',
    'Chocolate Frog Cafe cakes were fresh, rich, and delicious.',
    'Magical Mischief theming in the dining area was a delightful touch.',
    'Knowledgeable recommendations on gluten-free afternoon tea options.',
    'Warm greeting at the till and prompt delivery of hot food items.',
    'Superb customer service from start to finish at The Hogwarts Table.',
  ];

  for (let i = 0; i < 13; i++) {
    const day = 2 + (i % 28);
    items.push({
      id: `WB-30410${pad(i + 1)}`,
      caseNumber: `WB-30410${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-04-${pad(day)}`,
      monthYear: 'April 2026',
      type: 'Compliment',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Staff',
      department: i % 2 === 0 ? 'Hogwarts Table' : 'F&B - Aramark',
      area: i % 2 === 0 ? 'F&B- Food Hall' : 'Dragon RC',
      venue: i % 2 === 0 ? 'The Hogwarts Table' : 'Dragon RC',
      feedbackDetail: aprComplimentTexts[i],
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 49; i++) {
    const day = 1 + (i % 29);
    items.push({
      id: `WB-30420${pad(i + 1)}`,
      caseNumber: `WB-30420${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-04-${pad(day)}`,
      monthYear: 'April 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Thank you for an incredible visit and wonderful catering service! (Apr Ref #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  // 5. MAY 2026 (85 cases: 1 complaint, 23 compliments, 61 thank yous)
  items.push({
    id: 'WB-3050001',
    caseNumber: 'WB-3050001',
    caseStatus: 'Open',
    date: '2026-05-18',
    monthYear: 'May 2026',
    type: 'Complaint',
    tableName: 'Tour Experience',
    category: 'Tour Experience',
    subCategory: 'Food Quality',
    department: 'F&B - Aramark',
    area: 'F&B- Backlot Café',
    venue: 'Backlot Cafe',
    feedbackDetail:
      'Burger patty at Backlot Cafe was dry and lukewarm, and the queue during the lunch period stretched outside the barrier.',
    actionTaken:
      'Reviewing burger patty cooking specifications with chef leads on 16/06. Second host deployed to redirect queues during peak lunch.',
    actionOwner: 'Aramark Quality Manager',
    actionDueDate: '2026-06-16',
    status: 'InProgress',
    actionLogs: [
      {
        id: 'log-may-1',
        timestamp: '2026-05-19 14:00',
        author: 'Aramark Quality Manager',
        note: 'Audit scheduled for Backlot burger preparation and hold times.',
      },
    ],
  });

  const mayComplimentTexts = [
    'Staff engagement was wonderful: warm verbal greeting and genuine enthusiasm from every server.',
    'Server asked thoughtful questions regarding our daughter dairy allergy and recommended safe alternatives.',
    'Food was piping hot, delicious, and served with great energy.',
    'Proactive recommendations for additional side items and drinks at Backlot Cafe.',
    'Chocolate Frog Cafe barista demonstrated extraordinary customer care.',
    'Butterbeer served with huge smiles and fun conversation with our kids.',
    'Great handling of queue by the host during a busy weekend rush.',
    'Dragon Roasted iced drinks were refreshing and made quickly.',
    'Spotless dining tables and clean highchairs provided swiftly.',
    'Lovely greeting when entering the Food Hall for morning breakfast.',
    'Afternoon Tea experience was faultless and our teacups were regularly replenished.',
    'Very high standard of customer service throughout the catering outlets.',
    'Friendly conversation from the team at the Dragon RC counter.',
    'Butterbeer ice cream was the highlight of our afternoon.',
    'Staff member fixed a wobbly table immediately upon notification.',
    'Super fast till turnaround in the Food Hall.',
    'Enthusiastic team member gave great tips on the best desserts to share.',
    'Warm, welcoming atmosphere across the catering areas.',
    'Delightful presentation of pastries at the Chocolate Frog Cafe.',
    'Professional and courteous service at The Hogwarts Table dinner.',
    'Barista crafted exceptional flat whites and was extremely courteous.',
    'Fast collection counter service in Backlot Cafe.',
    'Excellent attention to hygiene and safety standards throughout.',
  ];

  for (let i = 0; i < 23; i++) {
    const day = 1 + (i % 30);
    items.push({
      id: `WB-30510${pad(i + 1)}`,
      caseNumber: `WB-30510${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-05-${pad(day)}`,
      monthYear: 'May 2026',
      type: 'Compliment',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Staff',
      department: 'F&B - Aramark',
      area: i % 3 === 0 ? 'Chocolate Frog Café' : i % 3 === 1 ? 'Dragon RC' : 'F&B- Butterbeer Bar',
      venue: i % 3 === 0 ? 'Chocolate Frog' : i % 3 === 1 ? 'Dragon RC' : 'Butterbeer Bar',
      feedbackDetail: mayComplimentTexts[i],
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 61; i++) {
    const day = 1 + (i % 30);
    items.push({
      id: `WB-30520${pad(i + 1)}`,
      caseNumber: `WB-30520${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-05-${pad(day)}`,
      monthYear: 'May 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Big thank you to the catering staff who made our May visit memorable! (May Ref #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  // 6. JUNE 2026 (90 cases: 1 complaint, 21 compliments, 46 thank yous, 22 general)
  items.push({
    id: 'WB-3060001',
    caseNumber: 'WB-3060001',
    caseStatus: 'Open',
    date: '2026-06-12',
    monthYear: 'June 2026',
    type: 'Complaint',
    tableName: 'Tour Experience',
    category: 'Tour Experience',
    subCategory: 'Queue Management',
    department: 'F&B - Aramark',
    area: 'F&B- Backlot Café',
    venue: 'Backlot Cafe',
    feedbackDetail:
      'Long queue in Backlot Cafe with only 2 tills open during peak midday rush. Optics looked congested from the dining area.',
    actionTaken:
      'Ensured all tills are manned during peak 12:00-14:30 window and senior management presence on floor.',
    actionOwner: 'Senior Operations Lead',
    actionDueDate: '2026-06-25',
    status: 'InProgress',
    actionLogs: [
      {
        id: 'log-jun-1',
        timestamp: '2026-06-13 09:30',
        author: 'Senior Operations Lead',
        note: 'Scheduled extra till-trained staff during peak window.',
      },
    ],
  });

  const junComplimentTexts = [
    'Ambiance and setting of The Hogwarts Table was truly magical! Premium dining experience.',
    'Staff offered a warm welcome, additional information about the menu, and a cheerful goodbye before leaving.',
    'Great service and positive attitudes from the servers at The Hogwarts Table.',
    'Special feature water bottle and Dragon Roasted cups with facts were delightful!',
    'Chocolate Frog Cafe pastries were fresh and delicious.',
    'Butterbeer Bar queue was handled efficiently with fantastic staff smiles.',
    'Food Hall breakfast was hot, quick, and satisfying.',
    'Staff member at Dragon Roasted was so attentive to our order.',
    'Spotless tables in Backlot Cafe despite peak summer crowd.',
    'Server guided us through the allergen checklist with absolute confidence.',
    'Wonderful hospitality at Afternoon Tea service.',
    'Attentive servers made our family feel like VIP wizards.',
    'Fast service and smiling cashiers at the Food Hall.',
    'The dragon roasted coffee aroma and taste were top tier.',
    'Prompt clearance of tables and polite team members.',
    'Warm greeting at the entrance cafe set a magical tone for our day.',
    'Delicious vegan lunch options in Food Hall.',
    'Staff member gave our son a magical birthday badge with his treat.',
    'Great coordination at the food collection point in Backlot.',
    'Cheerful goodbye from the exit team as we left.',
    'High standard of courtesy and friendliness from all catering staff.',
  ];

  for (let i = 0; i < 21; i++) {
    const day = 1 + (i % 29);
    items.push({
      id: `WB-30610${pad(i + 1)}`,
      caseNumber: `WB-30610${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-06-${pad(day)}`,
      monthYear: 'June 2026',
      type: 'Compliment',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Staff',
      department: i % 2 === 0 ? 'Hogwarts Table' : 'F&B - Aramark',
      area: i % 2 === 0 ? 'F&B- Food Hall' : 'Dragon RC',
      venue: i % 2 === 0 ? 'The Hogwarts Table' : 'Dragon RC',
      feedbackDetail: junComplimentTexts[i],
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 46; i++) {
    const day = 1 + (i % 29);
    items.push({
      id: `WB-30620${pad(i + 1)}`,
      caseNumber: `WB-30620${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-06-${pad(day)}`,
      monthYear: 'June 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Heartfelt thank you to all the hard working teams in catering for an amazing June visit! (Jun Ref #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 22; i++) {
    const day = 2 + (i % 28);
    items.push({
      id: `WB-30630${pad(i + 1)}`,
      caseNumber: `WB-30630${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-06-${pad(day)}`,
      monthYear: 'June 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Thank you for providing great facilities, seating, and clean cafe areas. (Jun Feedback #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  // 7. JULY 2026 (78 cases: 2 complaints, 14 compliments, 41 thank yous, 21 other)
  items.push(
    {
      id: 'WB-3070001',
      caseNumber: 'WB-3070001',
      caseStatus: 'Open',
      date: '2026-07-08',
      monthYear: 'July 2026',
      type: 'Complaint',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Food Quality',
      department: 'F&B - Aramark',
      area: 'F&B- Food Hall',
      venue: 'Food Hall',
      feedbackDetail:
        'Food quality at Food Hall hot counter was below standard: chips were lukewarm and burger was overcooked.',
      actionTaken: 'Recalibrated hot-holding temperatures and retrained batch cooking rotation.',
      actionOwner: 'Head Chef',
      actionDueDate: '2026-07-20',
      status: 'InProgress',
      actionLogs: [],
    },
    {
      id: 'WB-3070002',
      caseNumber: 'WB-3070002',
      caseStatus: 'Open',
      date: '2026-07-19',
      monthYear: 'July 2026',
      type: 'Complaint',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Service Delay',
      department: 'Afternoon Tea',
      area: 'F&B- Food Hall',
      venue: 'Afternoon Tea',
      feedbackDetail:
        'Had to wait 25 minutes for afternoon tea hot drink replenishment during afternoon peak.',
      actionTaken: 'Added an extra dedicated floor server for Afternoon Tea beverage refills.',
      actionOwner: 'Afternoon Tea Lead',
      actionDueDate: '2026-07-25',
      status: 'InProgress',
      actionLogs: [],
    }
  );

  const julComplimentTexts = [
    'Wonderful tea refills and warm scones at Afternoon Tea. Outstanding hospitality.',
    'Butterbeer Bar was speedy and server was full of positive energy.',
    'Delicious pastries at Chocolate Frog Cafe.',
    'Clean tables and quick tray clearance in Backlot Cafe.',
    'Food Hall lunch was hot, fresh, and served in minutes.',
    'The Hogwarts Table setting was breathtaking and service was top notch.',
    'Barista made an exquisite iced coffee on a hot summer day.',
    'Server went above and beyond to ensure our peanut allergy was protected.',
    'Friendly greetings and cheerful farewells made our day.',
    'Dragon Roasted cups with trivia were great fun for the kids.',
    'Attentive catering staff across all locations.',
    'Delicious vegan pasty served warm and crisp.',
    'Cheerful cashiers and seamless payment processing.',
    'Overall catering experience was magical and well organised.',
  ];

  for (let i = 0; i < 14; i++) {
    const day = 1 + (i % 30);
    items.push({
      id: `WB-30710${pad(i + 1)}`,
      caseNumber: `WB-30710${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-07-${pad(day)}`,
      monthYear: 'July 2026',
      type: 'Compliment',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Staff',
      department: 'F&B - Aramark',
      area: i % 2 === 0 ? 'F&B- Food Hall' : 'F&B- Butterbeer Bar',
      venue: i % 2 === 0 ? 'Food Hall' : 'Butterbeer Bar',
      feedbackDetail: julComplimentTexts[i],
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 41; i++) {
    const day = 1 + (i % 30);
    items.push({
      id: `WB-30720${pad(i + 1)}`,
      caseNumber: `WB-30720${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-07-${pad(day)}`,
      monthYear: 'July 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Thank you for a wonderful summer visit to the Studio Tour! (Jul Ref #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  for (let i = 0; i < 21; i++) {
    const day = 2 + (i % 28);
    items.push({
      id: `WB-30730${pad(i + 1)}`,
      caseNumber: `WB-30730${pad(i + 1)}`,
      caseStatus: 'Closed',
      date: `2026-07-${pad(day)}`,
      monthYear: 'July 2026',
      type: 'Thank You',
      tableName: 'Tour Experience',
      category: 'Tour Experience',
      subCategory: 'Visitor Feedback',
      department: 'F&B - Aramark',
      area: 'Studio Tour LND',
      venue: 'Studio Tour LND',
      feedbackDetail: `Thank you for providing clean facilities and prompt dining service. (Jul Feedback #${i + 1})`,
      actionTaken: '',
      actionOwner: '',
      actionDueDate: '',
      status: 'Resolved',
      actionLogs: [],
    });
  }

  return items;
}
