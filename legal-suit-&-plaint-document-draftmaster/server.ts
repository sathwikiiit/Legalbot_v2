import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  SuitDto,
  DocumentTemplateDto,
  RenderContextDto,
  InitializeDocumentRequest,
  InitializeDocumentResponse,
  SectionUpdateRequest,
  SectionPreviewRequest,
  SectionPreviewResponse,
  AiStepRequest,
  TaskResultDto,
  BuildDocumentRequest,
  GenerateRequest
} from './src/types';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Google GenAI client lazily or when available
const getGeminiAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// In-Memory Database for Suits & Drafts
const mockSuits: SuitDto[] = [
  {
    id: 101,
    court: 'IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION), CITY CIVIL COURT',
    city: 'Bengaluru, Karnataka',
    lawyer: 'Adv. Rajesh Sharma, High Court Advocate',
    plaintiffs: [
      {
        id: 1,
        name: 'M/s Apex Horizon Solutions Pvt. Ltd.',
        relation: 'rep. by Managing Director Shri Ramesh Kumar',
        gender: 'Corporate',
        age: 45,
        occupation: 'Software & Technology Services',
        address: 'No. 12/B, MG Road, Ward 88, Indiranagar, Bengaluru - 560038',
        partyType: 'PLAINTIFF'
      }
    ],
    defendants: [
      {
        id: 2,
        name: 'Shri Vikramaditya Verma',
        relation: 'S/o Late Somnath Verma',
        gender: 'Male',
        age: 52,
        occupation: 'Proprietor of M/s Verma Enterprises',
        address: 'Plot No. 44, Electronic City Phase 1, Hosur Road, Bengaluru - 560100',
        partyType: 'DEFENDANT'
      }
    ],
    property: [
      {
        id: 1,
        type: 'Commercial Office Space',
        mkvalue: '75,00,000',
        extent: '1800 sq. ft.',
        syn: 'Sy. No. 104/2',
        hn: 'Door No. 302',
        plotNo: 'Plot No. 44, Tech Zone'
      }
    ],
    date: '2026-08-08T10:00:00Z',
    suitType: 'PLAINT_RECOVERY',
    relief: 'Recovery of principal amount Rs. 24,50,000/- along with interest @ 18% p.a. from date of default till realization, costs of suit and permanent injunction.',
    affiantIndex: '1'
  },
  {
    id: 102,
    court: 'IN THE COURT OF THE PRINCIPAL DISTRICT AND SESSIONS JUDGE',
    city: 'New Delhi',
    lawyer: 'Adv. Meenakshi Sundaram',
    plaintiffs: [
      {
        id: 3,
        name: 'Smt. Gayatri Devi',
        relation: 'W/o Late Capt. Anand Swaroop',
        gender: 'Female',
        age: 68,
        occupation: 'Retired Senior Citizen',
        address: 'House No. C-14, Vasant Vihar, New Delhi - 110057',
        partyType: 'PLAINTIFF'
      }
    ],
    defendants: [
      {
        id: 4,
        name: 'Shri Sanjeev Kumar Kapoor',
        relation: 'S/o Shri O.P. Kapoor',
        gender: 'Male',
        age: 49,
        occupation: 'Real Estate Developer',
        address: 'Villa No. 8, Sainik Farms, Mehrauli, New Delhi - 110030',
        partyType: 'DEFENDANT'
      }
    ],
    property: [
      {
        id: 2,
        type: 'Residential Plot & House',
        mkvalue: '2,20,000,00',
        extent: '3000 sq. yds',
        syn: 'Khasra No. 341/2',
        hn: 'No. C-14',
        plotNo: 'Block C'
      }
    ],
    date: '2026-08-05T14:30:00Z',
    suitType: 'PLAINT_INJUNCTION',
    relief: 'Declaration of absolute title and decree of Permanent Prohibitory Injunction restraining defendant from encroaching or creating third party charge.',
    affiantIndex: '1'
  }
];

// Document Templates
const documentTemplates: DocumentTemplateDto[] = [
  {
    templateKey: 'PLAINT_RECOVERY',
    displayName: 'Plaint for Recovery of Money & Debt (Order XXXVII CPC)',
    sections: [
      { sectionKey: 'jurisdiction_title', title: '1. Cause Title & Court Jurisdiction', sourceType: 'RULE_BASED', editable: true, taskKey: 'title_setup', sequence: 1, interactive: false },
      { sectionKey: 'parties_memo', title: '2. Memo of Parties (Plaintiffs & Defendants)', sourceType: 'RULE_BASED', editable: true, taskKey: 'parties_setup', sequence: 2, interactive: false },
      { sectionKey: 'facts_transaction', title: '3. Facts of Commercial Transaction & Debt Execution', sourceType: 'AI_GENERATED', editable: true, taskKey: 'ai_facts_transaction', sequence: 3, interactive: true },
      { sectionKey: 'default_breach', title: '4. Default in Payment & Statutory Legal Notice', sourceType: 'AI_GENERATED', editable: true, taskKey: 'ai_default_notice', sequence: 4, interactive: true },
      { sectionKey: 'cause_of_action', title: '5. Cause of Action & Limitation Period', sourceType: 'HYBRID', editable: true, taskKey: 'ai_cause_action', sequence: 5, interactive: true },
      { sectionKey: 'valuation_court_fee', title: '6. Valuation, Pecuniary Jurisdiction & Court Fee', sourceType: 'RULE_BASED', editable: true, taskKey: 'valuation_setup', sequence: 6, interactive: false },
      { sectionKey: 'prayer_relief', title: '7. Prayer Clause & Relief Claimed', sourceType: 'RULE_BASED', editable: true, taskKey: 'prayer_setup', sequence: 7, interactive: false },
      { sectionKey: 'verification_affidavit', title: '8. Verification Clause & Supporting Affidavit', sourceType: 'RULE_BASED', editable: true, taskKey: 'verification_setup', sequence: 8, interactive: false }
    ]
  },
  {
    templateKey: 'PLAINT_INJUNCTION',
    displayName: 'Plaint for Declaration of Title & Permanent Injunction',
    sections: [
      { sectionKey: 'jurisdiction_title', title: '1. Cause Title & Court Jurisdiction', sourceType: 'RULE_BASED', editable: true, taskKey: 'title_setup', sequence: 1, interactive: false },
      { sectionKey: 'parties_memo', title: '2. Memo of Parties', sourceType: 'RULE_BASED', editable: true, taskKey: 'parties_setup', sequence: 2, interactive: false },
      { sectionKey: 'property_schedule', title: '3. Schedule Property & Ownership Right Title', sourceType: 'HYBRID', editable: true, taskKey: 'property_setup', sequence: 3, interactive: false },
      { sectionKey: 'facts_interference', title: '4. Illegal Interference & Threat to Possession', sourceType: 'AI_GENERATED', editable: true, taskKey: 'ai_interference', sequence: 4, interactive: true },
      { sectionKey: 'cause_of_action', title: '5. Cause of Action & Limitation', sourceType: 'HYBRID', editable: true, taskKey: 'ai_cause_action', sequence: 5, interactive: true },
      { sectionKey: 'valuation_court_fee', title: '6. Court Fee & Suit Valuation', sourceType: 'RULE_BASED', editable: true, taskKey: 'valuation_setup', sequence: 6, interactive: false },
      { sectionKey: 'prayer_relief', title: '7. Prayer Clause (Declaration & Injunction)', sourceType: 'RULE_BASED', editable: true, taskKey: 'prayer_setup', sequence: 7, interactive: false },
      { sectionKey: 'verification_affidavit', title: '8. Verification Clause & Affidavit', sourceType: 'RULE_BASED', editable: true, taskKey: 'verification_setup', sequence: 8, interactive: false }
    ]
  },
  {
    templateKey: 'PLAINT_SPECIFIC_PERFORMANCE',
    displayName: 'Plaint for Specific Performance of Agreement to Sell',
    sections: [
      { sectionKey: 'jurisdiction_title', title: '1. Cause Title & Court Jurisdiction', sourceType: 'RULE_BASED', editable: true, taskKey: 'title_setup', sequence: 1, interactive: false },
      { sectionKey: 'parties_memo', title: '2. Memo of Parties', sourceType: 'RULE_BASED', editable: true, taskKey: 'parties_setup', sequence: 2, interactive: false },
      { sectionKey: 'agreement_facts', title: '3. Execution of Sale Agreement & Advance Consideration', sourceType: 'AI_GENERATED', editable: true, taskKey: 'ai_agreement_facts', sequence: 3, interactive: true },
      { sectionKey: 'readiness_willingness', title: '4. Plaintiff Readiness & Willingness (Sec 16(c) SRA)', sourceType: 'AI_GENERATED', editable: true, taskKey: 'ai_readiness', sequence: 4, interactive: true },
      { sectionKey: 'cause_of_action', title: '5. Cause of Action & Limitation', sourceType: 'HYBRID', editable: true, taskKey: 'ai_cause_action', sequence: 5, interactive: true },
      { sectionKey: 'valuation_court_fee', title: '6. Court Fee & Valuation', sourceType: 'RULE_BASED', editable: true, taskKey: 'valuation_setup', sequence: 6, interactive: false },
      { sectionKey: 'prayer_relief', title: '7. Prayer for Specific Performance & Alternate Refund', sourceType: 'RULE_BASED', editable: true, taskKey: 'prayer_setup', sequence: 7, interactive: false },
      { sectionKey: 'verification_affidavit', title: '8. Verification & Affidavit', sourceType: 'RULE_BASED', editable: true, taskKey: 'verification_setup', sequence: 8, interactive: false }
    ]
  },
  {
    templateKey: 'EVICTION_PETITION',
    displayName: 'Petition for Eviction of Tenant & Recovery of Rent Arrears',
    sections: [
      { sectionKey: 'jurisdiction_title', title: '1. Cause Title & Court Jurisdiction', sourceType: 'RULE_BASED', editable: true, taskKey: 'title_setup', sequence: 1, interactive: false },
      { sectionKey: 'parties_memo', title: '2. Memo of Landlord & Tenant', sourceType: 'RULE_BASED', editable: true, taskKey: 'parties_setup', sequence: 2, interactive: false },
      { sectionKey: 'tenancy_terms', title: '3. Tenancy Lease Terms & Demised Premises', sourceType: 'HYBRID', editable: true, taskKey: 'property_setup', sequence: 3, interactive: false },
      { sectionKey: 'default_termination', title: '4. Default in Rent & Termination Notice under Sec 106 TPA', sourceType: 'AI_GENERATED', editable: true, taskKey: 'ai_eviction_notice', sequence: 4, interactive: true },
      { sectionKey: 'cause_of_action', title: '5. Cause of Action & Limitation', sourceType: 'HYBRID', editable: true, taskKey: 'ai_cause_action', sequence: 5, interactive: true },
      { sectionKey: 'valuation_court_fee', title: '6. Court Fee & Valuation', sourceType: 'RULE_BASED', editable: true, taskKey: 'valuation_setup', sequence: 6, interactive: false },
      { sectionKey: 'prayer_relief', title: '7. Prayer for Vacant Possession & Mesne Profits', sourceType: 'RULE_BASED', editable: true, taskKey: 'prayer_setup', sequence: 7, interactive: false },
      { sectionKey: 'verification_affidavit', title: '8. Verification & Affidavit', sourceType: 'RULE_BASED', editable: true, taskKey: 'verification_setup', sequence: 8, interactive: false }
    ]
  }
];

// In-Memory Draft Storage
const draftStore: Record<string, Record<string, RenderContextDto[]>> = {};

// Helper to format parties text
function formatPartyBlock(parties: SuitDto['plaintiffs'], headerTitle: string) {
  return parties.map((p, idx) => {
    return `${idx + 1}. ${p.name.toUpperCase()}\n   ${p.relation}, Age: ${p.age} years, Occupation: ${p.occupation}\n   Residing at: ${p.address}`;
  }).join('\n\n');
}

// Generate Rule-Based Sections
function generateRuleBasedSection(sectionKey: string, suit: SuitDto): RenderContextDto[] {
  const p1 = suit.plaintiffs[0]?.name || 'PLAINTIFF';
  const d1 = suit.defendants[0]?.name || 'DEFENDANT';
  const prop = suit.property[0] || { type: 'Property', mkvalue: '50,00,000', syn: 'N/A', hn: 'N/A', extent: 'N/A', plotNo: 'N/A' };

  switch (sectionKey) {
    case 'jurisdiction_title':
      return [
        {
          sectionKey,
          definitionKey: 'court_header',
          context: 'Court Title & Forum',
          value: `IN THE COURT OF ${suit.court.toUpperCase()}\nAT ${suit.city.toUpperCase()}\n\nCIVIL SUIT NO. _____ OF 2026`,
          order: 1,
          sourceType: 'RULE_BASED',
          editable: true
        },
        {
          sectionKey,
          definitionKey: 'cause_title_short',
          context: 'Cause Title Heading',
          value: `${p1.toUpperCase()}\n... PLAINTIFF(S)\n\nVERSUS\n\n${d1.toUpperCase()}\n... DEFENDANT(S)`,
          order: 2,
          sourceType: 'RULE_BASED',
          editable: true
        }
      ];

    case 'parties_memo':
      return [
        {
          sectionKey,
          definitionKey: 'memo_plaintiffs',
          context: 'Details of Plaintiff(s)',
          value: `MEMORANDUM OF PLAINTIFF(S):\n${formatPartyBlock(suit.plaintiffs, 'PLAINTIFF')}`,
          order: 1,
          sourceType: 'RULE_BASED',
          editable: true
        },
        {
          sectionKey,
          definitionKey: 'memo_defendants',
          context: 'Details of Defendant(s)',
          value: `MEMORANDUM OF DEFENDANT(S):\n${formatPartyBlock(suit.defendants, 'DEFENDANT')}`,
          order: 2,
          sourceType: 'RULE_BASED',
          editable: true
        }
      ];

    case 'property_schedule':
      return [
        {
          sectionKey,
          definitionKey: 'schedule_a',
          context: 'Schedule "A" Property Description',
          value: `SCHEDULE OF SUIT PROPERTY:\nAll that piece and parcel of ${prop.type} measuring ${prop.extent}, bearing House/Door No. ${prop.hn}, Plot No. ${prop.plotNo}, Survey/Khata No. ${prop.syn}, situated at ${suit.city}, bounded as under:\n\nEast by: Private Property\nWest by: 30 Feet Public Road\nNorth by: Plot No. 43\nSouth by: Plot No. 45\nMarket Value estimated at Rs. ${prop.mkvalue}/-`,
          order: 1,
          sourceType: 'RULE_BASED',
          editable: true
        }
      ];

    case 'valuation_court_fee':
      return [
        {
          sectionKey,
          definitionKey: 'valuation_clause',
          context: 'Valuation & Court Fee Clause',
          value: `1. The value of the suit for the purpose of Court Fee and Jurisdiction is fixed at Rs. ${prop.mkvalue}/- in accordance with the Karnataka / State Court Fees and Suits Valuation Act.\n2. Ad-valorem court fee of Rs. 48,500/- has been calculated and affixed herewith on the Plaint.\n3. This Hon'ble Court has full territorial and pecuniary jurisdiction to entertain and try the present suit as the suit property is situated and cause of action arose within local limits.`,
          order: 1,
          sourceType: 'RULE_BASED',
          editable: true
        }
      ];

    case 'prayer_relief':
      return [
        {
          sectionKey,
          definitionKey: 'prayer_text',
          context: 'Prayer & Relief Clause',
          value: `WHEREFORE, THE PLAINTIFF MOST RESPECTFULLY PRAYS THAT THIS HON'BLE COURT MAY BE PLEASED TO PASS A DECREE IN FAVOR OF THE PLAINTIFF AND AGAINST THE DEFENDANT(S):\n\n(a) ${suit.relief}\n(b) Direct the Defendant to pay interest at 18% per annum from the date of suit till full realization;\n(c) Award costs of the suit in favor of the Plaintiff;\n(d) Pass such other order or orders as this Hon'ble Court deems fit in the interest of justice and equity.`,
          order: 1,
          sourceType: 'RULE_BASED',
          editable: true
        }
      ];

    case 'verification_affidavit':
      return [
        {
          sectionKey,
          definitionKey: 'verification_clause',
          context: 'Verification Clause',
          value: `VERIFICATION\n\nI, ${p1}, the Plaintiff above named, do hereby verify and state on solemn affirmation that the contents of Paragraphs 1 to 6 of the Plaint are true to my knowledge, and Paragraphs 7 to 10 are based on information received and legal advice believed by me to be true.\n\nVerified at ${suit.city} on this ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.\n\n\n_______________________\nDEPONENT / PLAINTIFF\n\nAdvocate for Plaintiff:\n${suit.lawyer}`,
          order: 1,
          sourceType: 'RULE_BASED',
          editable: true
        }
      ];

    default:
      return [
        {
          sectionKey,
          definitionKey: `${sectionKey}_draft`,
          context: `Section Draft (${sectionKey})`,
          value: `Draft content initialized for section: ${sectionKey}. Complete AI step or manual editing to finalize legal clauses.`,
          order: 1,
          sourceType: 'RULE_BASED',
          editable: true
        }
      ];
  }
}

// REST Endpoints Implementation

// 1. GET /auth
app.get('/auth', (req, res) => {
  res.json(true);
});

// 2. GET /suits
app.get('/suits', (req, res) => {
  res.json(mockSuits);
});

// 3. GET /user
app.get('/user', (req, res) => {
  const lawyer = req.query.lawyer as string;
  if (!lawyer) {
    return res.json(mockSuits);
  }
  const filtered = mockSuits.filter(s => s.lawyer.toLowerCase().includes(lawyer.toLowerCase()));
  res.json(filtered);
});

// 4. GET /suitById
app.get('/suitById', (req, res) => {
  const idStr = req.query.id as string;
  const suit = mockSuits.find(s => s.id === parseInt(idStr));
  if (suit) {
    res.json(suit);
  } else {
    res.status(404).json({ error: 'Suit not found' });
  }
});

// 5. GET /suitByPlaintiff
app.get('/suitByPlaintiff', (req, res) => {
  const plaintiffQuery = req.query.plaintiff as string;
  const suit = mockSuits.find(s =>
    s.plaintiffs.some(p => p.name.toLowerCase().includes((plaintiffQuery || '').toLowerCase()))
  ) || mockSuits[0];
  res.json(suit);
});

// 6. POST /save
app.post('/save', (req, res) => {
  const suitDto: SuitDto = req.body;
  if (!suitDto.id) {
    suitDto.id = Date.now();
  }
  const existingIdx = mockSuits.findIndex(s => s.id === suitDto.id);
  if (existingIdx >= 0) {
    mockSuits[existingIdx] = suitDto;
  } else {
    mockSuits.push(suitDto);
  }
  res.json(true);
});

// 7. POST /insert
app.post('/insert', (req, res) => {
  const suitDto: SuitDto = req.body;
  const existingIdx = mockSuits.findIndex(s => s.id === suitDto.id);
  if (existingIdx >= 0) {
    mockSuits[existingIdx] = suitDto;
  } else {
    if (!suitDto.id) suitDto.id = Date.now();
    mockSuits.push(suitDto);
  }
  res.json(true);
});

// 8. POST /delete
app.post('/delete', (req, res) => {
  const suitDto: SuitDto = req.body;
  const idx = mockSuits.findIndex(s => s.id === suitDto.id);
  if (idx >= 0) {
    mockSuits.splice(idx, 1);
  }
  res.json(true);
});

// 9. GET /api/documents/templates
app.get('/api/documents/templates', (req, res) => {
  res.json(documentTemplates);
});

// 10. GET /api/documents/templates/:templateKey
app.get('/api/documents/templates/:templateKey', (req, res) => {
  const templateKey = req.params.templateKey;
  const tmpl = documentTemplates.find(t => t.templateKey === templateKey) || documentTemplates[0];
  res.json(tmpl);
});

// 11. POST /api/documents/initialize
app.post('/api/documents/initialize', (req, res) => {
  const body: InitializeDocumentRequest = req.body;
  const draftId = body.draftId || `DRAFT_${Date.now()}`;
  const template = documentTemplates.find(t => t.templateKey === body.documentType) || documentTemplates[0];
  const suit = body.suitDto;

  const initialSectionContexts: Record<string, RenderContextDto[]> = {};

  template.sections.forEach(sec => {
    initialSectionContexts[sec.sectionKey] = generateRuleBasedSection(sec.sectionKey, suit);
  });

  draftStore[draftId] = initialSectionContexts;

  const response: InitializeDocumentResponse = {
    draftId,
    template,
    initialSectionContexts
  };

  res.json(response);
});

// 12. GET /api/documents/drafts/:draftId
app.get('/api/documents/drafts/:draftId', (req, res) => {
  const draftId = req.params.draftId;
  const draft = draftStore[draftId] || {};
  res.json(draft);
});

// 13. PUT /api/documents/sections/update
app.put('/api/documents/sections/update', (req, res) => {
  const body: SectionUpdateRequest = req.body;
  if (!draftStore[body.draftId]) {
    draftStore[body.draftId] = {};
  }
  draftStore[body.draftId][body.sectionKey] = body.renderContexts;
  res.json(body.renderContexts);
});

// 14. POST /api/documents/sections/preview
app.post('/api/documents/sections/preview', async (req, res) => {
  const body: SectionPreviewRequest = req.body;
  const draft = draftStore[body.draftId] || {};
  const currentRenderContexts = draft[body.sectionKey] || generateRuleBasedSection(body.sectionKey, body.suitDto);

  res.json({
    taskResult: {
      status: 'COMPLETE',
      renderContexts: currentRenderContexts
    },
    renderContexts: currentRenderContexts
  } as SectionPreviewResponse);
});

// 15. POST /api/documents/ai/step - Interactive Section Drafting with AI
app.post('/api/documents/ai/step', async (req, res) => {
  const body: AiStepRequest = req.body;
  const { draftId, documentType, sectionKey, taskKey, conversationHistory, suitDto } = body;

  const p1 = suitDto.plaintiffs[0]?.name || 'Plaintiff';
  const d1 = suitDto.defendants[0]?.name || 'Defendant';
  const suitType = suitDto.suitType || 'Civil Plaint';

  // Check if we need follow up question or if conversation history has enough facts
  const needsFollowup = !conversationHistory || conversationHistory.trim().length < 15;

  if (needsFollowup && taskKey.includes('ai_facts')) {
    return res.json({
      status: 'NEEDS_INFO',
      question: `Counsel, please provide key factual details regarding the transactions between ${p1} and ${d1} (e.g. Agreement dates, invoices/check numbers, agreed interest rate, or delivery dates).`,
      renderContexts: draftStore[draftId]?.[sectionKey] || generateRuleBasedSection(sectionKey, suitDto)
    } as TaskResultDto);
  }

  if (needsFollowup && taskKey.includes('ai_default')) {
    return res.json({
      status: 'NEEDS_INFO',
      question: `Please specify the date when default occurred, total arrears accumulated, and date/reference of Legal Demand Notice served upon ${d1}.`,
      renderContexts: draftStore[draftId]?.[sectionKey] || generateRuleBasedSection(sectionKey, suitDto)
    } as TaskResultDto);
  }

  if (needsFollowup && taskKey.includes('ai_interference')) {
    return res.json({
      status: 'NEEDS_INFO',
      question: `Please describe the specific acts of illegal interference, trespass, or threat caused by ${d1} over the suit property.`,
      renderContexts: draftStore[draftId]?.[sectionKey] || generateRuleBasedSection(sectionKey, suitDto)
    } as TaskResultDto);
  }

  // Generate legal narrative using Gemini API or Fallback legal synthesis
  let generatedLegalText = '';
  const ai = getGeminiAi();

  if (ai) {
    try {
      const prompt = `You are a Senior High Court Legal Draftsman expert in Civil Procedure Code (CPC) India and Common Law. 
Draft a formal legal plaint section for:
- Document Type: ${documentType}
- Section Key: ${sectionKey} (${taskKey})
- Plaintiff: ${p1}
- Defendant: ${d1}
- Relief Claimed: ${suitDto.relief}
- Additional Factual Brief provided by Advocate: ${conversationHistory || 'Standard commercial default transaction'}

Instructions:
1. Write in formal court plaint style using numbered legal paragraphs (e.g., 1., 2., 3.).
2. Maintain high legal precision, technical precision under Indian Contract Act, Civil Procedure Code, Transfer of Property Act, and Specific Relief Act.
3. Keep tone authoritative, formal, and court-ready.
4. Output ONLY the drafted legal text without markdown meta notes or chatter.`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
      });

      generatedLegalText = aiRes.text?.trim() || '';
    } catch (err) {
      console.error('Gemini API call failed, using fallback generator:', err);
    }
  }

  // Fallback legal paragraph synthesizer if AI key is missing or failed
  if (!generatedLegalText) {
    if (taskKey.includes('ai_facts') || sectionKey === 'facts_transaction') {
      generatedLegalText = `1. That the Plaintiff ${p1} is a reputed entity/person and the Defendant ${d1} approached the Plaintiff for commercial business/financial accommodation.\n\n2. That pursuant to mutual negotiations, the parties entered into an Agreement, wherein Defendant acknowledged liability and received value/services.\n\n3. Details of Advocate inputs provided: "${conversationHistory || 'Transaction duly executed with mutual agreement and acknowledged ledger entries.'}"\n\n4. That in terms of the transaction, Defendant was legally bound to discharge the liability within agreed timeline, which Defendant failed to perform.`;
    } else if (taskKey.includes('ai_default') || sectionKey === 'default_breach') {
      generatedLegalText = `1. That despite repeated demands and verbal reminders, Defendant failed and neglected to remit the outstanding dues.\n\n2. That Plaintiff served a formal Legal Demand Notice dated 15th January 2026 calling upon Defendant to clear the sum with interest within 15 days of receipt.\n\n3. Additional facts: "${conversationHistory || 'Defendant received notice via Registered AD but failed to comply or raise valid defence.'}"\n\n4. That Defendant issued evasive reply/defaulted completely, compelling the Plaintiff to institute the present suit.`;
    } else if (sectionKey === 'cause_of_action') {
      generatedLegalText = `1. The Cause of Action for the present suit firstly arose on the date of execution of transaction, and subsequently on 15th January 2026 when the Legal Notice was served upon Defendant, and continues to accrue daily as Defendant remains in default.\n\n2. That the suit is well within the prescribed period of limitation under Article 55/113 of the Limitation Act, 1963.`;
    } else {
      generatedLegalText = `1. That the Plaintiff states that all facts asserted herein are supported by documentary evidence filed in the List of Documents.\n\n2. User Inputs: "${conversationHistory || 'Facts verified as true and correct.'}"`;
    }
  }

  const updatedRenderContexts: RenderContextDto[] = [
    {
      sectionKey,
      definitionKey: `${sectionKey}_ai_content`,
      context: `AI Formatted Legal Clause (${sectionKey})`,
      value: generatedLegalText,
      order: 1,
      sourceType: 'AI_ASSISTED',
      editable: true
    }
  ];

  if (!draftStore[draftId]) {
    draftStore[draftId] = {};
  }
  draftStore[draftId][sectionKey] = updatedRenderContexts;

  res.json({
    status: 'COMPLETE',
    question: undefined,
    renderContexts: updatedRenderContexts
  } as TaskResultDto);
});

// 16. POST /api/documents/build - Generates downloadable complete document content
app.post('/api/documents/build', (req, res) => {
  const body: BuildDocumentRequest = req.body;
  const draftId = body.draftId;
  const draft = draftStore[draftId] || {};

  let fullDocumentContent = `========================================================================\n`;
  fullDocumentContent += `                  COURT DRAFT - LEGAL PLAINT DOCUMENT\n`;
  fullDocumentContent += `========================================================================\n\n`;

  Object.keys(draft).forEach(secKey => {
    const contexts = draft[secKey];
    contexts.forEach(ctx => {
      fullDocumentContent += `--- ${ctx.context.toUpperCase()} ---\n`;
      fullDocumentContent += `${ctx.value}\n\n`;
    });
  });

  fullDocumentContent += `\n========================================================================\n`;
  fullDocumentContent += `DRAFT GENERATED VIA LEGAL SUIT & PLAINT DOCUMENT DRAFTMASTER\n`;
  fullDocumentContent += `========================================================================\n`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${draftId}_legal_suit.txt"`);
  res.send(fullDocumentContent);
});

// 17. POST /generate
app.post('/generate', (req, res) => {
  const body: GenerateRequest = req.body;
  const suit = body.suitDto;
  const docType = body.documents?.[0] || 'PLAINT_RECOVERY';

  let fullText = `IN THE COURT OF ${suit.court}\nAT ${suit.city}\n\nCIVIL SUIT NO. _____ OF 2026\n\n`;
  fullText += `IN THE MATTER OF:\n${suit.plaintiffs[0]?.name}\t... PLAINTIFF\n\nVERSUS\n\n${suit.defendants[0]?.name}\t... DEFENDANT\n\n`;
  fullText += `PLAINT UNDER ORDER VII RULE 1 CPC FOR ${suit.suitType.replace(/_/g, ' ')}\n\n`;
  fullText += `MOST RESPECTFULLY SHOWETH:\n1. That the Plaintiff is residing/carrying on business at ${suit.plaintiffs[0]?.address}.\n`;
  fullText += `2. That Defendant resides at ${suit.defendants[0]?.address}.\n`;
  fullText += `3. RELIEF CLAIMED: ${suit.relief}\n\n`;
  fullText += `VERIFICATION:\nVerified at ${suit.city} on ${new Date().toLocaleDateString('en-IN')}.\n\nAdvocate: ${suit.lawyer}`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="Suit_${suit.id || 'draft'}.txt"`);
  res.send(fullText);
});

// 18. POST /api/ai/chat - General Assistant for Advocate
app.post('/api/ai/chat', async (req, res) => {
  const { prompt } = req.body;
  const ai = getGeminiAi();

  if (ai && prompt) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are an expert High Court Senior Counsel Legal Assistant. Answer the advocate's query clearly with references to relevant sections of Indian Law (CPC, Evidence Act, Contract Act, Specific Relief Act, Limitation Act) or Civil Practice Rules:\n\nQuery: ${prompt}`
      });
      return res.json(response.text || 'No response generated.');
    } catch (err) {
      console.error('Gemini Chat Error:', err);
    }
  }

  res.json(`Regarding your query: "${prompt}". In civil proceedings, CPC Order VII governs Plaint requirements. Ensure jurisdiction, cause of action, and court fee valuation are explicitly set out in separate numbered paragraphs before prayer.`);
});

// Start Express Server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Legal Suit Draftmaster Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
