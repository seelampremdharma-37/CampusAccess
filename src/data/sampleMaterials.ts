import { SupportedLanguage } from '../utils/accessibilityLogic';

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
}

export interface MindMapNode {
  id: string;
  title: string;
  role: 'root' | 'branch' | 'leaf';
  summary: string;
}

export interface FormulaVariable {
  symbol: string;
  name: string;
  meaning: string;
  unit: string;
}

export interface DocumentSection {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  sectionCode: string;
  title: string;
  pageNumber: number | null;
  sourceQuote: string;
  sourceConfidence: string;
  originalMessySnippet: string;
  accessibleParagraphs: string[];
  keyTakeaway: string;
  formula: {
    raw: string;
    spokenPlainLanguage: string;
    stepByStepDerivation: string[];
    variables: FormulaVariable[];
  };
  diagram: {
    type: 'physics-barrier' | 'electromagnetic-flux' | 'avl-tree' | 'bohr-oxygen';
    title: string;
    caption: string;
    naturalLanguageSteps: string[];
    spatialSummary: string;
  };
  explainSamples: {
    simplify: string;
    summarize: string[];
    practiceQuestions: {
      question: string;
      answer: string;
    }[];
  };
  multilingual: Record<
    SupportedLanguage,
    {
      languageLabel: string;
      nativeName: string;
      voiceLang: string;
      heading: string;
      explanation: string;
      analogy: string;
      keyTerms: { term: string; meaning: string }[];
    }
  >;
}

export interface LearningMaterialDocument {
  id: string;
  title: string;
  shortLabel: string;
  badgeCategory: string;
  fileName: string;
  pageCount: number;
  sourceFormat: 'Scanned PDF + Diagram' | 'Handwritten Notes PDF' | 'Classroom Audio + Transcript PDF' | 'Multi-Chapter Textbook PDF';
  uploadWarnings: string[];
  sections: DocumentSection[];
  flashcards: FlashcardItem[];
  checklist: ChecklistItem[];
  mindMap: MindMapNode[];
}

export const SAMPLE_MATERIALS: LearningMaterialDocument[] = [
  {
    id: 'sample-physics',
    title: 'Scanned Physics Note with Diagram & Formulas (Quantum & Electrodynamics)',
    shortLabel: 'Scanned Physics Note with Diagram & Formulas',
    badgeCategory: 'Sample A · Physics & Math Textbook',
    fileName: 'IC26_Physics_Ch1_to_Ch3_Scanned_Notes.pdf',
    pageCount: 48,
    sourceFormat: 'Scanned PDF + Diagram',
    uploadWarnings: [
      'Detected handwritten margin equations on pages 14 and 38 — converted to structured accessible math notation.',
    ],
    sections: [
      {
        id: 'sec-1-1',
        chapterNumber: 1,
        chapterTitle: 'Chapter 1: Foundations of Wave Mechanics',
        sectionCode: '1.1',
        title: 'Harmonic Oscillations & Restoring Force',
        pageNumber: 6,
        sourceQuote: ' PDF Page 6, Para 2: "In an ideal linear harmonic system, the restoring force F is directly proportional to the displacement x from equilibrium and acts in the opposite direction: F = -kx."',
        sourceConfidence: 'Verified PDF Text Layer · Page 6',
        originalMessySnippet: '[Scan Noise 14%] Fig 1.1: Spring-mass dampener... F_rest = -k * x(t) ... d2x/dt2 + (k/m)x = 0 [smudged ink on right margin]',
        accessibleParagraphs: [
          'Every oscillating physical system—from a laboratory pendulum to vibrating atoms inside a crystal lattice—relies on a restoring force that pulls the system back toward its balanced center point.',
          'When you stretch or compress an ideal spring by a distance x, the spring pushes or pulls back with a force proportional to that distance. The stiffness of the spring is measured by the spring constant k.',
          'Because the force always opposes the direction of displacement, the system continuously trades potential energy stored in the spring for kinetic energy of motion, creating a smooth sinusoidal wave over time.'
        ],
        keyTakeaway: 'A restoring force proportional to displacement (F = -kx) drives continuous energy exchange between potential and kinetic states.',
        formula: {
          raw: 'F = -k · x   and   ω = √(k / m)',
          spokenPlainLanguage: 'Force F equals negative spring constant k times displacement x; angular frequency omega equals the square root of stiffness k divided by mass m.',
          stepByStepDerivation: [
            'Start with Newton’s Second Law: Force equals mass times acceleration (F = m · a).',
            'Equate Newton’s law with Hooke’s restoring force: m · (d²x / dt²) = -k · x.',
            'Divide both sides by mass m to isolate the oscillation ratio k / m, yielding natural angular frequency ω = √(k / m).'
          ],
          variables: [
            { symbol: 'F', name: 'Restoring Force', meaning: 'Pull back toward equilibrium center', unit: 'Newtons (N)' },
            { symbol: 'k', name: 'Spring Constant', meaning: 'Stiffness of the elastic medium', unit: 'N/m' },
            { symbol: 'x', name: 'Displacement', meaning: 'Distance stretched from rest position', unit: 'Meters (m)' },
            { symbol: 'ω', name: 'Angular Frequency', meaning: 'Rate of oscillation in radians per second', unit: 'rad/s' }
          ]
        },
        diagram: {
          type: 'electromagnetic-flux',
          title: 'Damped Harmonic Oscillator & Phase Cycle',
          caption: 'Three-stage spatial diagram showing compression, equilibrium velocity peak, and maximum extension.',
          naturalLanguageSteps: [
            'Top Node (Compression State, x = -A): The coil spring is tightly compressed on the left wall. Velocity is zero; stored elastic potential energy is at 100%.',
            'Middle Node (Equilibrium Crossing, x = 0): The mass passes the center vertical marker moving right at maximum speed v_max. Force is zero; kinetic energy is at 100%.',
            'Bottom Node (Maximum Extension, x = +A): The mass reaches the far right boundary. A leftward arrow labeled F = -kx pulls the mass back toward the center.'
          ],
          spatialSummary: 'Horizontal 3-row sequence read top-to-bottom, comparing spring extension against energy state bars on the right.'
        },
        explainSamples: {
          simplify: 'Think of a child on a playground swing: the higher you pull the swing back (displacement x), the stronger gravity pulls it back toward the middle (restoring force F).',
          summarize: [
            'Restoring force always points opposite to displacement (F = -kx).',
            'Stiffer springs (higher k) vibrate faster; heavier masses (higher m) vibrate slower.',
            'Total mechanical energy stays constant when friction is absent.'
          ],
          practiceQuestions: [
            {
              question: 'If you quadruple the mass m attached to an ideal spring, how does the angular frequency ω change?',
              answer: 'Because ω = √(k/m), quadrupling m reduces the angular frequency ω by half (1/√4 = 1/2).'
            },
            {
              question: 'Why is there a negative sign in Hooke’s Law (F = -kx)?',
              answer: 'The negative sign indicates that the restoring force acts in the direction opposite to the displacement from equilibrium.'
            }
          ]
        },
        multilingual: {
          'academic-en': {
            languageLabel: 'Academic English',
            nativeName: 'Academic English',
            voiceLang: 'en-US',
            heading: 'Linear Restoring Force and Simple Harmonic Motion',
            explanation: 'Simple harmonic motion arises whenever a conservative system experiences a linear restoring force F = -kx opposing displacement from static equilibrium, resulting in periodic sinusoidal trajectories with angular frequency ω = √(k/m).',
            analogy: 'Analogous to an LC resonant circuit oscillating between capacitor electric field energy and inductor magnetic field energy.',
            keyTerms: [
              { term: 'Equilibrium', meaning: 'Position where net force on the mass is zero.' },
              { term: 'Angular Frequency (ω)', meaning: 'Phase rate of oscillation measured in radians per second.' }
            ]
          },
          'simple-en': {
            languageLabel: 'Simple English',
            nativeName: 'Plain Everyday English',
            voiceLang: 'en-US',
            heading: 'How Springs Push and Pull Back in a Steady Rhythm',
            explanation: 'When you pull a spring away from its resting spot, it pulls back with equal strength. The further you stretch it, the harder it pulls back toward the middle, creating a smooth back-and-forth bounce.',
            analogy: 'Just like plucking a guitar string—it snaps back past the center and vibrates smoothly to make a musical note.',
            keyTerms: [
              { term: 'Restoring Force', meaning: 'The push or pull that brings an object back to its starting spot.' },
              { term: 'Stiffness (k)', meaning: 'How hard or easy it is to stretch the spring.' }
            ]
          },
          te: {
            languageLabel: 'Telugu',
            nativeName: 'తెలుగు (Telugu)',
            voiceLang: 'te-IN',
            heading: 'సరళ హార్మోనిక్ చలనం మరియు పునరుద్ధరణ బలం (F = -kx)',
            explanation: 'ఒక స్ప్రింగ్‌ను దాని సమతాస్థితి నుండి లాగినప్పుడు లేదా నొక్కినప్పుడు, అది తిరిగి మధ్య స్థానానికి రావడానికి వ్యతిరేక దిశలో బలాన్ని ప్రయోగిస్తుంది. దీనినే హుక్ నియమం (F = -kx) అంటారు. ఈ ప్రక్రియలో స్థితిజ శక్తి మరియు గతిజ శక్తి నిరంతరం ఒకదానికొకటి మారుతూ ఉంటాయి.',
            analogy: 'ఉదాహరణకు ఊయల (Swing) ముందుకు వెనుకకు ఊగుతున్నప్పుడు గురుత్వాకర్షణ బలం దానిని ఎల్లప్పుడూ మధ్య స్థానానికి లాగుతుంది.',
            keyTerms: [
              { term: 'పునరుద్ధరణ బలం (Restoring Force)', meaning: 'వస్తువును తిరిగి సమతాస్థితికి తీసుకువచ్చే బలం.' },
              { term: 'స్థానభ్రంశం (Displacement x)', meaning: 'మధ్య స్థానం నుండి కదిలిన దూరం.' }
            ]
          },
          hi: {
            languageLabel: 'Hindi',
            nativeName: 'हिन्दी (Hindi)',
            voiceLang: 'hi-IN',
            heading: 'सरल आवर्त गति और प्रत्यानयन बल (F = -kx)',
            explanation: 'जब किसी स्प्रिंग को उसकी संतुलन स्थिति से खींचा या दबाया जाता है, तो स्प्रिंग विपरीत दिशा में एक प्रत्यानयन बल (Restoring Force) लगाती है। यह बल विस्थापन (x) के समानुपाती होता है (F = -kx), जिससे वस्तु एक निश्चित लय में दोलन करती है।',
            analogy: 'जैसे झूले को पीछे खींचकर छोड़ने पर वह बार-बार बीच के संतुलन बिंदु की ओर लौटता है।',
            keyTerms: [
              { term: 'प्रत्यानयन बल (Restoring Force)', meaning: 'वस्तु को मूल संतुलन बिंदु पर वापस लाने वाला बल।' },
              { term: 'कोणीय आवृत्ति (ω)', meaning: 'प्रति सेकंड दोलन करने की गति।' }
            ]
          }
        }
      },
      {
        id: 'sec-2-1',
        chapterNumber: 2,
        chapterTitle: 'Chapter 2: Electromagnetic Induction & Field Flux',
        sectionCode: '2.1',
        title: 'Faraday’s Law of Magnetic Flux & Lenz’s Polarity Rule',
        pageNumber: 19,
        sourceQuote: 'PDF Page 19, Equation 2.4: "The induced electromotive force ε in any closed conducting loop equals the negative time rate of change of the magnetic flux Φ_B enclosed by the loop: ε = -N (dΦ_B / dt)."',
        sourceConfidence: 'Verified PDF Text Layer · Page 19',
        originalMessySnippet: 'Ch 2.1 pg19: Faraday Law -> EMF (epsilon) = -N d(Phi_B)/dt where Phi_B = Integral B . dA = B*A*cos(theta). Note Lenz minus sign opposes flux change!',
        accessibleParagraphs: [
          'Faraday’s Law explains how moving magnets generate electricity inside power plant turbines and wireless charging pads. A stationary magnet near a wire loop produces zero current; voltage appears only when the magnetic field changes over time.',
          'Magnetic flux (Φ_B) measures the total number of magnetic field lines passing through the area of a wire loop. You can change this flux by moving the magnet closer, spinning the wire coil, or changing the magnetic field strength.',
          'Lenz’s Law is represented by the minus sign in the formula: the induced electric current always creates its own opposing magnetic field to resist the change that caused it, conserving energy.'
        ],
        keyTakeaway: 'Changing magnetic flux through a wire coil induces a voltage proportional to the number of turns N and the speed of flux change (ε = -N dΦ_B/dt).',
        formula: {
          raw: 'ε = -N · (dΦ_B / dt)   where   Φ_B = B · A · cos(θ)',
          spokenPlainLanguage: 'Induced electromotive force epsilon equals negative N turns times the derivative of magnetic flux Phi sub B with respect to time t, where Phi sub B equals magnetic field B times loop area A times cosine of angle theta.',
          stepByStepDerivation: [
            'Calculate the magnetic flux through one loop: multiply magnetic field B by loop area A and cosine of tilt angle θ.',
            'Measure how rapidly the flux changes over a time interval dt: dΦ_B / dt.',
            'Multiply by the number of wire turns N and apply the negative sign from Lenz’s conservation law: ε = -N · (dΦ_B / dt).'
          ],
          variables: [
            { symbol: 'ε', name: 'Induced EMF', meaning: 'Generated electrical voltage in the coil', unit: 'Volts (V)' },
            { symbol: 'N', name: 'Number of Turns', meaning: 'Count of wire loops in the solenoid', unit: 'Dimensionless' },
            { symbol: 'Φ_B', name: 'Magnetic Flux', meaning: 'Total magnetic field passing through area A', unit: 'Webers (Wb)' },
            { symbol: 'θ', name: 'Orientation Angle', meaning: 'Angle between magnetic field B and surface normal', unit: 'Degrees / Radians' }
          ]
        },
        diagram: {
          type: 'electromagnetic-flux',
          title: 'Magnetic Flux Induction Loop & Galvanometer Circuit',
          caption: 'Spatial diagram showing a bar magnet approaching a 4-turn copper solenoid connected to a current meter.',
          naturalLanguageSteps: [
            'Left Region (Bar Magnet): A horizontal bar magnet with North pole on the right moves rightward toward the coil at velocity v.',
            'Center Region (Conducting Solenoid): Four circular copper wire loops of cross-sectional area A intercept the diverging magnetic field arrows B.',
            'Right Region (Galvanometer Meter): Induced current I flows counter-clockwise to oppose the incoming North pole, deflecting the meter needle to +2.4 mV.'
          ],
          spatialSummary: 'Left-to-right causal flow diagram: Moving Magnet (Input) → Changing Flux in Coil (Process) → Induced Voltage on Meter (Output).'
        },
        explainSamples: {
          simplify: 'Moving a magnet through a coil of wire pushes electrons along the wire like a water pump—the faster you move the magnet, and the more loops of wire you have, the stronger the electricity.',
          summarize: [
            'Voltage is induced only when magnetic flux changes over time (dΦ_B/dt ≠ 0).',
            'More coil turns (N) directly multiply the generated voltage.',
            'Lenz’s Law ensures the induced current opposes the motion that created it.'
          ],
          practiceQuestions: [
            {
              question: 'What happens to the induced voltage ε if a strong magnet is held completely still inside a 500-turn wire coil?',
              answer: 'The induced voltage ε is 0 Volts because the magnetic flux Φ_B is not changing with respect to time (dΦ_B/dt = 0).'
            }
          ]
        },
        multilingual: {
          'academic-en': {
            languageLabel: 'Academic English',
            nativeName: 'Academic English',
            voiceLang: 'en-US',
            heading: 'Faraday-Lenz Law of Electromagnetic Induction',
            explanation: 'Time-varying magnetic flux Φ_B penetrating a closed conducting contour induces a non-conservative electric field whose line integral yields an electromotive force ε = -N(dΦ_B/dt), with polarity governed by Lenz’s law to satisfy conservation of energy.',
            analogy: 'Acts as the electromagnetic counterpart to mechanical inertia—opposing rapid changes in magnetic flux.',
            keyTerms: [
              { term: 'Magnetic Flux (Φ_B)', meaning: 'Surface integral of magnetic flux density B over loop area A.' },
              { term: 'Lenz’s Law', meaning: 'Induced current opposes the magnetic flux change that produces it.' }
            ]
          },
          'simple-en': {
            languageLabel: 'Simple English',
            nativeName: 'Plain Everyday English',
            voiceLang: 'en-US',
            heading: 'Making Electricity with Moving Magnets',
            explanation: 'When you move a magnet near a loop of wire, the changing magnetic field pushes electrons through the wire and creates voltage. If the magnet stops moving, the electricity stops flowing immediately.',
            analogy: 'Like a bicycle dynamo light that glows brighter the faster you pedal and turns off when the wheel stops.',
            keyTerms: [
              { term: 'Flux', meaning: 'How much magnetism passes through the wire ring.' },
              { term: 'EMF (Voltage)', meaning: 'The electrical push created inside the wire.' }
            ]
          },
          te: {
            languageLabel: 'Telugu',
            nativeName: 'తెలుగు (Telugu)',
            voiceLang: 'te-IN',
            heading: 'ఫారడే విద్యుదయస్కాంత ప్రేరణ నియమం (ε = -N dΦ_B/dt)',
            explanation: 'ఒక తీగ చుట్ట (Coil) గుండా వెళ్లే అయస్కాంత అభివాహం (Magnetic Flux) కాలంతో పాటు మారినప్పుడు, ఆ తీగలో విద్యుత్ చాలక బలం (Voltage) ఉత్పత్తి అవుతుంది. అయస్కాంతాన్ని ఎంత వేగంగా కదిలిస్తే అంత ఎక్కువ విద్యుత్ ఉత్పత్తి అవుతుంది.',
            analogy: 'సైకిల్ డైనమో చక్రం తిరిగినప్పుడు మాత్రమే బల్బు వెలిగే విధానం దీనికి చక్కని ఉదాహరణ.',
            keyTerms: [
              { term: 'అయస్కాంత అభివాహం (Φ_B)', meaning: 'తీగ చుట్ట వైశాల్యం గుండా వెళ్లే అయస్కాంత రేఖల సంఖ్య.' },
              { term: 'లెంజ్ నియమం (Lenz Law)', meaning: 'ప్రేరిత విద్యుత్ ప్రవాహం తనకు కారణమైన మార్పును వ్యతిరేకిస్తుంది.' }
            ]
          },
          hi: {
            languageLabel: 'Hindi',
            nativeName: 'हिन्दी (Hindi)',
            voiceLang: 'hi-IN',
            heading: 'फैराडे का विद्युतचुंबकीय प्रेरण नियम (ε = -N dΦ_B/dt)',
            explanation: 'जब किसी तार की कुंडली (Coil) से गुजरने वाले चुंबकीय फ्लक्स (Φ_B) में समय के साथ परिवर्तन होता है, तो कुंडली में प्रेरित विद्युत वाहक बल (EMF) उत्पन्न होता है। कुंडली में फेरों की संख्या (N) जितनी अधिक होगी, वोल्टेज उतना ही अधिक बनेगा।',
            analogy: 'जैसे बिजली घर के जनरेटर में चुंबक के घूमने से घरों के लिए बिजली बनती है।',
            keyTerms: [
              { term: 'चुंबकीय फ्लक्स (Φ_B)', meaning: 'कुंडली के क्षेत्रफल से गुजरने वाली चुंबकीय बल रेखाएं।' },
              { term: 'लेन्ज़ का नियम', meaning: 'प्रेरित धारा सदैव उस कारण का विरोध करती है जिससे वह उत्पन्न हुई है।' }
            ]
          }
        }
      },
      {
        id: 'sec-3-1',
        chapterNumber: 3,
        chapterTitle: 'Chapter 3: Quantum Wave Mechanics & Potential Barriers',
        sectionCode: '3.1',
        title: 'De Broglie Matter Waves & Wave-Particle Duality',
        pageNumber: 31,
        sourceQuote: 'PDF Page 31, Section 3.1: "Every moving particle of linear momentum p carries an associated matter wavelength λ = h / p = h / (m·v), where h is Planck’s constant (6.626 × 10^-34 J·s)."',
        sourceConfidence: 'Verified PDF Text Layer · Page 31',
        originalMessySnippet: 'Ch 3 Sec 3.1 (pg 31): deBroglie relation lambda = h / p = h / (mv). Electron diffraction proves matter behaves as wave when aperture ~ lambda.',
        accessibleParagraphs: [
          'In classical physics, matter (like electrons or baseballs) and waves (like light or sound) were treated as completely separate categories. Louis de Broglie unified them by proposing that all moving particles also behave as waves.',
          'The wavelength λ of any particle equals Planck’s constant h divided by the particle’s momentum p (mass times velocity). For heavy everyday objects, this wavelength is far too tiny to notice, but for subatomic electrons it is comparable to atomic spacing.',
          'This wave nature explains why electrons orbit atomic nuclei only at specific allowed energy levels where their standing waves fit without destructive interference.'
        ],
        keyTakeaway: 'All matter possesses a wavelength inversely proportional to its momentum (λ = h / mv), governing atomic-scale behavior.',
        formula: {
          raw: 'λ = h / p = h / (m · v)',
          spokenPlainLanguage: 'De Broglie wavelength lambda equals Planck constant h divided by momentum p, which equals h divided by mass m times velocity v.',
          stepByStepDerivation: [
            'Begin with Einstein’s photon momentum relation: p = E / c = (h · f) / c = h / λ.',
            'Rearrange for wavelength λ: λ = h / p.',
            'Substitute classical particle momentum p = m · v for non-relativistic particles: λ = h / (m · v).'
          ],
          variables: [
            { symbol: 'λ', name: 'De Broglie Wavelength', meaning: 'Spatial period of the matter wave', unit: 'Meters (m)' },
            { symbol: 'h', name: 'Planck’s Constant', meaning: 'Fundamental quantum action constant (6.626e-34)', unit: 'J·s' },
            { symbol: 'p', name: 'Linear Momentum', meaning: 'Product of particle mass and velocity', unit: 'kg·m/s' }
          ]
        },
        diagram: {
          type: 'physics-barrier',
          title: 'Electron Matter-Wave Diffraction Pattern',
          caption: 'Comparison of classical particle beam vs quantum electron wave interference across a crystal slit.',
          naturalLanguageSteps: [
            'Left Source: An electron gun emits a steady beam of electrons with momentum p = m·v toward a thin crystalline nickel target.',
            'Center Aperture: The atomic lattice acts as a diffraction grating where slit spacing d matches the electron wavelength λ = h/p.',
            'Right Detector Screen: Instead of a single dot, alternating high-and-low probability rings form a concentric interference pattern.'
          ],
          spatialSummary: 'Three-column horizontal propagation diagram illustrating wave interference fringes on the right detector screen.'
        },
        explainSamples: {
          simplify: 'Tiny particles like electrons do not travel like tiny marbles; they travel like ripples on a pond whose wave size shrinks as they speed up.',
          summarize: [
            'Every moving particle has a wavelength λ = h / (mv).',
            'Smaller mass and slower speed produce a longer, easier-to-detect quantum wavelength.',
            'Electron microscopes use short electron wavelengths to see individual atoms.'
          ],
          practiceQuestions: [
            {
              question: 'If an electron speeds up to twice its initial velocity, what happens to its de Broglie wavelength λ?',
              answer: 'Since λ = h / (m·v), doubling the velocity v cuts the wavelength λ in half.'
            }
          ]
        },
        multilingual: {
          'academic-en': {
            languageLabel: 'Academic English',
            nativeName: 'Academic English',
            voiceLang: 'en-US',
            heading: 'De Broglie Hypothesis and Matter-Wave Duality',
            explanation: 'De Broglie’s relation λ = h/p establishes wave-particle duality for massive quanta, demonstrating that particles with momentum p exhibit phase interference and diffraction when interacting with structures on the order of λ.',
            analogy: 'Just as light waves behave like discrete photons in the photoelectric effect, massive electrons behave like waves during crystal diffraction.',
            keyTerms: [
              { term: 'Planck’s Constant (h)', meaning: 'Fundamental proportionality constant relating quantum energy to frequency.' },
              { term: 'Matter Wave', meaning: 'Probability wave packet associated with a moving particle.' }
            ]
          },
          'simple-en': {
            languageLabel: 'Simple English',
            nativeName: 'Plain Everyday English',
            voiceLang: 'en-US',
            heading: 'How Tiny Particles Move Like Waves',
            explanation: 'At the atomic scale, electrons act both like tiny particles and like waves in water. Their wave size depends on their weight and speed—lightweight electrons have waves big enough to bend around atoms.',
            analogy: 'Like sound waves bending around a doorway while a thrown tennis ball goes straight.',
            keyTerms: [
              { term: 'Wavelength (λ)', meaning: 'The distance from one wave peak to the next.' },
              { term: 'Momentum (p)', meaning: 'How much motion an object has based on weight and speed.' }
            ]
          },
          te: {
            languageLabel: 'Telugu',
            nativeName: 'తెలుగు (Telugu)',
            voiceLang: 'te-IN',
            heading: 'డి బ్రోగ్లీ తరంగ సిద్ధాంతం (λ = h / mv)',
            explanation: 'ఎలక్ట్రాన్ల వంటి సూక్ష్మ కణాలు కేవలం కణాలుగా మాత్రమే కాకుండా తరంగాలుగా కూడా ప్రవర్తిస్తాయి. కణం యొక్క తరంగదైర్ఘ్యం (λ) దాని ద్రవ్యవేగానికి (p = mv) విలోమానుపాతంలో ఉంటుంది.',
            analogy: 'నీటిపై ఏర్పడే అలల వలె ఎలక్ట్రాన్లు కూడా అడ్డంకుల చుట్టూ వంగి ప్రయాణించగలవు.',
            keyTerms: [
              { term: 'తరంగదైర్ఘ్యం (Wavelength λ)', meaning: 'రెండు తరంగ శిఖరాల మధ్య దూరం.' },
              { term: 'ప్లాంక్ స్థిరాంకం (h)', meaning: 'క్వాంటం భౌతిక శాస్త్ర ప్రాథమిక స్థిరాంకం.' }
            ]
          },
          hi: {
            languageLabel: 'Hindi',
            nativeName: 'हिन्दी (Hindi)',
            voiceLang: 'hi-IN',
            heading: 'डी-ब्रोग्ली तरंग सिद्धांत और कण-तरंग द्वैतता (λ = h / mv)',
            explanation: 'प्रत्येक गतिशील कण (जैसे इलेक्ट्रॉन) के साथ एक तरंग जुड़ी होती है जिसे द्रव्य तरंग (Matter Wave) कहते हैं। इसकी तरंगदैर्घ्य λ प्लांक नियतांक h को संवेग (m·v) से भाग देने पर प्राप्त होती है।',
            analogy: 'जैसे प्रकाश कभी तरंग और कभी कण (फोटॉन) की तरह व्यवहार करता है, वैसे ही इलेक्ट्रॉन भी तरंग की तरह फैलते हैं।',
            keyTerms: [
              { term: 'द्रव्य तरंग (Matter Wave)', meaning: 'गतिशील कण से जुड़ी प्रायिकता तरंग।' },
              { term: 'संवेग (Momentum p)', meaning: 'द्रव्यमान और वेग का गुणनफल (m × v)।' }
            ]
          }
        }
      },
      {
        id: 'sec-3-2',
        chapterNumber: 3,
        chapterTitle: 'Chapter 3: Quantum Wave Mechanics & Potential Barriers',
        sectionCode: '3.2',
        title: 'Schrödinger Wave Equation & Quantum Barrier Tunneling',
        pageNumber: 38,
        sourceQuote: 'PDF Page 38, Section 3.2, Para 1: "When a particle of energy E < V_0 encounters a finite potential barrier of width L, the time-independent Schrödinger equation -(ℏ²/2m) d²ψ/dx² + V(x)ψ = Eψ yields a non-zero exponential decay wave ψ(x) = ψ_0 e^(-κx) inside the barrier, enabling quantum tunneling across to x > L."',
        sourceConfidence: 'Verified PDF Text Layer · Page 38 (Competition Demo Target)',
        originalMessySnippet: '[Scanned Page 38 - Low Contrast Ink] Sec 3.2: -(hbar^2 / 2m) d^2 Psi / dx^2 + V(x)Psi = E Psi. Inside barrier (0 < x < L, E < V0): kappa = sqrt(2m(V0 - E)) / hbar. Transmission T ≈ exp(-2 * kappa * L). Diagram Fig 3.4 below shows incident wave -> exponential decay -> transmitted wave!',
        accessibleParagraphs: [
          'In classical mechanics, if you roll a ball with energy E toward a hill of higher potential energy V_0, the ball always rolls back—it can never appear on the other side of the hill. However, quantum particles obey the Schrödinger Wave Equation.',
          'When an electron wave ψ(x) hits a thin energy barrier of width L where particle energy E is less than barrier height V_0, the wave does not drop to zero immediately at the boundary. Instead, the wave amplitude decays exponentially inside the barrier according to decay constant κ (kappa).',
          'If the barrier width L is sufficiently thin, a non-zero tail of the probability wave emerges on the far side (Region III) and continues oscillating as a transmitted wave. This phenomenon—Quantum Tunneling—powers flash memory chips, scanning tunneling microscopes, and nuclear fusion inside the Sun.'
        ],
        keyTakeaway: 'Quantum particles can penetrate thin energy barriers taller than their kinetic energy because their wave function decays exponentially (e^-κx) rather than dropping immediately to zero.',
        formula: {
          raw: '-(ℏ² / 2m) · (d²ψ / dx²) + V(x)ψ = Eψ   and   T ≈ e^(-2κL)',
          spokenPlainLanguage: 'Negative reduced Planck constant h-bar squared divided by two times mass m, multiplied by the second derivative of wave function psi with respect to position x, plus potential energy V of x times psi, equals total energy E times psi. Tunneling transmission probability T approximately equals e raised to negative two times decay constant kappa times barrier width L.',
          stepByStepDerivation: [
            'Region I (Before Barrier, x < 0): Potential V(x) = 0. The wave function ψ_I(x) is a sinusoidal traveling wave approaching from the left plus a reflected wave.',
            'Region II (Inside Barrier, 0 ≤ x ≤ L): Potential V_0 > E. The kinetic term becomes negative, transforming the solution into real exponential decay ψ_II(x) = A · e^(-κx) where κ = √(2m(V_0 - E)) / ℏ.',
            'Region III (Beyond Barrier, x > L): Because ψ_II(L) > 0 at the right edge, a transmitted sinusoidal wave ψ_III(x) continues forward with probability T ≈ e^(-2κL).'
          ],
          variables: [
            { symbol: 'ψ(x)', name: 'Wave Function (Psi)', meaning: 'Quantum probability amplitude at position x', unit: 'm^(-1/2)' },
            { symbol: 'ℏ', name: 'Reduced Planck Constant', meaning: 'Planck’s constant divided by 2π (h / 2π)', unit: 'J·s' },
            { symbol: 'V_0', name: 'Barrier Potential Height', meaning: 'Energy height of the rectangular barrier', unit: 'Electron-volts (eV)' },
            { symbol: 'L', name: 'Barrier Width', meaning: 'Physical thickness of the potential wall', unit: 'Nanometers (nm)' },
            { symbol: 'T', name: 'Transmission Coefficient', meaning: 'Probability that the particle tunnels through', unit: 'Probability (0 to 1)' }
          ]
        },
        diagram: {
          type: 'physics-barrier',
          title: 'Figure 3.4: Quantum Tunneling Across a Finite Potential Barrier (Regions I, II, III)',
          caption: 'Three-zone spatial diagram showing high-amplitude incident wave (left), exponential decay inside the rectangular barrier V_0 (center), and lower-amplitude transmitted wave (right).',
          naturalLanguageSteps: [
            'Region I (Left Zone, x < 0, Free Space): A tall blue sinusoidal wave labeled "Incident Wave ψ_I(x)" oscillates at energy level E, approaching a vertical gray wall of height V_0.',
            'Region II (Center Shaded Wall, 0 ≤ x ≤ L, Barrier V_0 > E): Inside the rectangular barrier of width L, the wave stops oscillating and follows a smooth downward-sloping amber curve labeled "Exponential Decay e^(-κx)".',
            'Region III (Right Zone, x > L, Transmitted Space): Exiting the right edge of the barrier at non-zero height, a smaller teal sinusoidal wave labeled "Transmitted Wave ψ_III(x)" continues moving rightward with probability T = |ψ_III / ψ_I|².'
          ],
          spatialSummary: 'Horizontal 3-region coordinate plot (Position x on horizontal axis, Energy V and Wave Amplitude ψ on vertical axis) with barrier wall from x = 0 to x = L.'
        },
        explainSamples: {
          simplify: 'Imagine throwing a ball at a wall: in everyday life it bounces back, but in the quantum world the electron acts like a ghost wave that fades as it passes through a thin wall—if the wall is thin enough, part of the wave makes it out the other side!',
          summarize: [
            'Classical particles cannot cross a barrier when Energy E < Barrier Height V_0.',
            'The Schrödinger equation shows the quantum wave function ψ(x) decays exponentially as e^(-κx) inside the barrier.',
            'Thinner barriers (smaller L) and lighter particles (smaller m) dramatically increase tunneling probability T ≈ e^(-2κL).'
          ],
          practiceQuestions: [
            {
              question: 'How does doubling the barrier thickness L affect the quantum tunneling transmission probability T ≈ e^(-2κL)?',
              answer: 'Because L is in the negative exponent, doubling L squares the exponential decay factor (e^(-4κL)), exponentially reducing the probability of tunneling.'
            },
            {
              question: 'Why do protons tunnel much less easily than electrons across the same barrier width L?',
              answer: 'A proton is about 1,836 times heavier than an electron. Higher mass m increases κ = √(2m(V_0 - E))/ℏ, causing much steeper exponential decay inside the barrier.'
            }
          ]
        },
        multilingual: {
          'academic-en': {
            languageLabel: 'Academic English',
            nativeName: 'Academic English',
            voiceLang: 'en-US',
            heading: 'Section 3.2: Stationary Schrödinger Equation & Finite Barrier Penetration',
            explanation: 'For a classically forbidden region where total energy E is less than potential barrier V_0, the time-independent Schrödinger equation yields evanescent solutions ψ(x) ∝ e^(-κx). Continuity of ψ(x) and dψ/dx at x = 0 and x = L results in finite transmission probability T ≈ e^(-2κL).',
            analogy: 'Mathematically identical to evanescent total internal reflection of electromagnetic waves across a thin air gap between two glass prisms.',
            keyTerms: [
              { term: 'Wave Function ψ(x)', meaning: 'Complex amplitude whose squared magnitude |ψ(x)|² gives probability density.' },
              { term: 'Decay Constant (κ)', meaning: 'Spatial attenuation rate inside the barrier: κ = √(2m(V_0 - E))/ℏ.' },
              { term: 'Transmission Coefficient (T)', meaning: 'Ratio of transmitted probability flux to incident probability flux.' }
            ]
          },
          'simple-en': {
            languageLabel: 'Simple English',
            nativeName: 'Plain Everyday English',
            voiceLang: 'en-US',
            heading: 'Section 3.2: How Quantum Particles Tunnel Through Solid Energy Walls',
            explanation: 'Normally, an object without enough energy cannot get past a tall barrier. Because an electron is a probability wave, its wave doesn’t stop flat at the wall—it gently fades inside the wall. If the wall is very thin, a small part of the wave pokes through to the other side, allowing the electron to appear past the barrier.',
            analogy: 'Like hearing muffled music through a thin bedroom wall—the sound wave gets quieter inside the wall, but some of it still comes out the other side.',
            keyTerms: [
              { term: 'Quantum Tunneling', meaning: 'When a subatomic particle passes right through a thin energy barrier.' },
              { term: 'Barrier Width (L)', meaning: 'How thick the energy wall is—thinner walls are much easier to tunnel through.' },
              { term: 'Probability Wave (ψ)', meaning: 'A wave that shows how likely you are to find the electron at each spot.' }
            ]
          },
          te: {
            languageLabel: 'Telugu',
            nativeName: 'తెలుగు (Telugu)',
            voiceLang: 'te-IN',
            heading: 'విభాగం 3.2: ష్రోడింగర్ తరంగ సమీకరణం & క్వాంటం టన్నెలింగ్ (Quantum Tunneling)',
            explanation: 'సాధారణ భౌతిక శాస్త్రం ప్రకారం తక్కువ శక్తి (E < V_0) ఉన్న కణం ఎత్తైన అడ్డంకిని దాటలేదు. కానీ ష్రోడింగర్ సమీకరణం ప్రకారం ఎలక్ట్రాన్ తరంగ ప్రమేయం ψ(x) అడ్డంకి లోపల వెంటనే సున్నా అవ్వకుండా ఘాతాంకంగా తగ్గుతుంది (e^-κx). అడ్డంకి మందం (L) చాలా తక్కువగా ఉంటే, ఎలక్ట్రాన్ అవతలి వైపుకు చొచ్చుకుపోతుంది. దీనినే క్వాంటం టన్నెలింగ్ అంటారు.',
            analogy: 'పలుచని గోడ గుండా శబ్ద తరంగాలు కొద్దిగా తగ్గి అవతలి గదిలోకి వినిపించే విధానం లాంటిది.',
            keyTerms: [
              { term: 'తరంగ ప్రమేయం (ψ)', meaning: 'కణం ఒక నిర్దిష్ట ప్రదేశంలో ఉండే సంభావ్యతను తెలిపే తరంగం.' },
              { term: 'క్వాంటం టన్నెలింగ్', meaning: 'తక్కువ శక్తి ఉన్నప్పటికీ సూక్ష్మ కణం శక్తి అడ్డంకిని దాటి వెళ్లే ప్రక్రియ.' },
              { term: 'ప్రసార గుణకం (Transmission T)', meaning: 'కణం అడ్డంకిని విజయవంతంగా దాటే సంభావ్యత (T ≈ e^-2κL).' }
            ]
          },
          hi: {
            languageLabel: 'Hindi',
            nativeName: 'हिन्दी (Hindi)',
            voiceLang: 'hi-IN',
            heading: 'अनुभाग 3.2: श्रोडिंगर तरंग समीकरण और क्वांटम टनलिंग (Quantum Tunneling)',
            explanation: 'चिरसम्मत भौतिकी में यदि कण की ऊर्जा (E) अवरोध की ऊंचाई (V_0) से कम है, तो वह दीवार पार नहीं कर सकता। परंतु श्रोडिंगर समीकरण के अनुसार इलेक्ट्रॉन की प्रायिकता तरंग ψ(x) अवरोध के भीतर तुरंत शून्य नहीं होती, बल्कि घातांकी रूप से घटती है (e^-κx)। यदि अवरोध की चौड़ाई (L) बहुत पतली हो, तो तरंग दूसरी ओर निकल जाती है—इसे क्वांटम टनलिंग कहते हैं।',
            analogy: 'जैसे पतली दीवार के आर-पार धीमी आवाज़ की तरंगें पहुँच जाती हैं, वैसे ही इलेक्ट्रॉन की तरंग पतले ऊर्जा अवरोध को पार कर लेती है।',
            keyTerms: [
              { term: 'तरंग फलन (Wave Function ψ)', meaning: 'किसी स्थान पर इलेक्ट्रॉन के पाए जाने की प्रायिकता दर्शाने वाली तरंग।' },
              { term: 'क्वांटम टनलिंग', meaning: 'कम ऊर्जा होने पर भी कण द्वारा पतले अवरोध को पार कर जाना।' },
              { term: 'पारगमन प्रायिकता (T)', meaning: 'अवरोध के पार निकलने की संभावना (T ≈ e^-2κL)।' }
            ]
          }
        }
      }
    ],
    flashcards: [
      {
        id: 'fc-phys-1',
        category: 'Chapter 1 · Oscillations',
        question: 'What does Hooke’s Law (F = -kx) state about the direction of the restoring force?',
        answer: 'The restoring force always acts in the exact opposite direction of displacement x, pulling the oscillating mass back toward equilibrium.'
      },
      {
        id: 'fc-phys-2',
        category: 'Chapter 2 · Electromagnetism',
        question: 'According to Faraday’s Law, when is voltage induced inside a wire loop?',
        answer: 'Only when the magnetic flux Φ_B passing through the loop is actively changing over time (dΦ_B / dt ≠ 0).'
      },
      {
        id: 'fc-phys-3',
        category: 'Chapter 3.1 · Matter Waves',
        question: 'How is a particle’s de Broglie wavelength λ related to its momentum p?',
        answer: 'They are inversely proportional: λ = h / p. Higher momentum produces a shorter quantum wavelength.'
      },
      {
        id: 'fc-phys-4',
        category: 'Chapter 3.2 · Quantum Tunneling',
        question: 'Why can an electron tunnel through a barrier even when its energy E is less than V_0?',
        answer: 'Because its Schrödinger wave function ψ(x) decays exponentially (e^-κx) inside the barrier rather than dropping instantaneously to zero.'
      }
    ],
    checklist: [
      {
        id: 'chk-phys-1',
        label: 'Understand Linear Restoring Force (F = -kx)',
        detail: 'Verify how spring constant k and mass m determine oscillation frequency ω = √(k/m).'
      },
      {
        id: 'chk-phys-2',
        label: 'Master Faraday’s Flux Induction & Lenz’s Polarity',
        detail: 'Trace how changing magnetic field B induces opposing current ε = -N(dΦ_B/dt).'
      },
      {
        id: 'chk-phys-3',
        label: 'Connect De Broglie Wavelength (λ = h/mv) to Atomic Scale',
        detail: 'Compute why subatomic electrons exhibit strong diffraction while macroscopic objects do not.'
      },
      {
        id: 'chk-phys-4',
        label: 'Decode Section 3.2 Schrödinger Barrier Tunneling Diagram',
        detail: 'Compare Region I (Incident Wave), Region II (Exponential Decay e^-κx), and Region III (Transmitted Wave).'
      }
    ],
    mindMap: [
      { id: 'mm-1', title: 'Wave & Quantum Physics (IC26)', role: 'root', summary: 'Core unification of classical oscillations, field flux, and quantum waves.' },
      { id: 'mm-2', title: 'Ch 1: Harmonic Motion (F = -kx)', role: 'branch', summary: 'Sinusoidal energy exchange governed by ω = √(k/m).' },
      { id: 'mm-3', title: 'Ch 2: Faraday Induction (ε = -N dΦ/dt)', role: 'branch', summary: 'Time-varying magnetic flux drives electromotive force.' },
      { id: 'mm-4', title: 'Ch 3.2: Quantum Tunneling (T ≈ e^-2κL)', role: 'branch', summary: 'Evanescent Schrödinger wave penetrates finite potential barriers.' }
    ]
  },
  {
    id: 'sample-datastructures',
    title: 'Handwritten Data Structures Lecture (AVL Trees & Graph Shortest Paths)',
    shortLabel: 'Handwritten Data Structures Lecture',
    badgeCategory: 'Sample B · Computer Science & Algorithms',
    fileName: 'CS204_Handwritten_AVL_Trees_and_Graphs_Lecture.pdf',
    pageCount: 36,
    sourceFormat: 'Handwritten Notes PDF',
    uploadWarnings: [
      'Handwritten whiteboard arrows detected on Pages 12 & 28 — reconstructed into accessible node-link hierarchy.'
    ],
    sections: [
      {
        id: 'sec-1-1',
        chapterNumber: 1,
        chapterTitle: 'Chapter 1: Asymptotic Complexity & Recurrence Relations',
        sectionCode: '1.1',
        title: 'Divide-and-Conquer Recurrences & Master Theorem',
        pageNumber: 5,
        sourceQuote: 'PDF Page 5, Whiteboard Box 1: "For recurrence T(n) = a·T(n/b) + f(n) with a ≥ 1 and b > 1, compare f(n) against n^(log_b a) to determine asymptotic runtime."',
        sourceConfidence: 'Verified Handwritten OCR · Page 5',
        originalMessySnippet: '[Cursive Margin Note pg 5] T(n) = 2T(n/2) + O(n) -> a=2, b=2 -> n^(log2 2) = n^1 -> Case 2 Master Thm -> Theta(n log n)!',
        accessibleParagraphs: [
          'Divide-and-conquer algorithms solve a large problem of size n by splitting it into a smaller subproblems, each of size n/b, solving them recursively, and combining the answers in f(n) time.',
          'The Master Theorem provides an instant formula to find the Big-Theta runtime of these recursive algorithms by comparing the work done at the root level f(n) against the work done at the leaves n^(log_b a).',
          'For MergeSort, splitting an array into 2 halves (a = 2, b = 2) with linear merging cost f(n) = n balances work equally across all log_2(n) tree levels, yielding O(n log n) total time.'
        ],
        keyTakeaway: 'When recursive subproblem growth matches the combine step f(n) = Θ(n^(log_b a)), total runtime scales as Θ(n^(log_b a) · log n).',
        formula: {
          raw: 'T(n) = a · T(n / b) + f(n)   ⇒   Θ(n^(log_b a) · log n)',
          spokenPlainLanguage: 'Time complexity T of n equals a subproblems times T of n divided by b, plus combine cost f of n; in balanced Case 2 this simplifies to Big-Theta of n raised to log base b of a, times log n.',
          stepByStepDerivation: [
            'Identify parameters: number of recursive calls a, subproblem shrink factor b, and combine step cost f(n).',
            'Compute critical exponent c_crit = log_b(a) and compare n^(c_crit) with f(n).',
            'When f(n) = Θ(n^(c_crit)), multiply the per-level work by tree height log_b(n) to get Θ(n^(log_b a) log n).'
          ],
          variables: [
            { symbol: 'n', name: 'Input Size', meaning: 'Total number of elements to process', unit: 'Items' },
            { symbol: 'a', name: 'Branching Factor', meaning: 'Number of recursive subproblems spawned per step', unit: 'Subproblems' },
            { symbol: 'b', name: 'Division Factor', meaning: 'Factor by which input size shrinks at each level', unit: 'Ratio' },
            { symbol: 'f(n)', name: 'Combine Cost', meaning: 'Non-recursive work to split and merge results', unit: 'Operations' }
          ]
        },
        diagram: {
          type: 'avl-tree',
          title: 'Recursion Tree Depth & Level-by-Level Work Sum',
          caption: 'Three-level binary recursion tree for MergeSort showing n total work per level across log_2(n) levels.',
          naturalLanguageSteps: [
            'Root Node (Level 0): Single array of size n performs c·n merge operations and splits into two children of size n/2.',
            'Internal Nodes (Level 1): Two nodes of size n/2 each perform c·(n/2) operations; horizontal row sum remains c·n.',
            'Leaf Level (Level log_2 n): n base-case nodes of size 1 each perform O(1) work; summing log_2(n) levels yields c·n·log_2(n).'
          ],
          spatialSummary: 'Top-down binary tree hierarchy with level-sum callouts aligned along the right margin.'
        },
        explainSamples: {
          simplify: 'Splitting a big task in half over and over takes log_2(n) steps; if putting the halves back together takes n steps at each layer, the total work is n times log_2(n).',
          summarize: [
            'a = number of recursive calls; b = factor by which problem size shrinks.',
            'Tree height is always log_b(n).',
            'MergeSort and Binary Search follow the Master Theorem directly.'
          ],
          practiceQuestions: [
            {
              question: 'What is the time complexity of Binary Search where a = 1, b = 2, and f(n) = O(1)?',
              answer: 'Here n^(log_2 1) = n^0 = 1, which matches f(n) = O(1) (Case 2), giving Θ(log n).'
            }
          ]
        },
        multilingual: {
          'academic-en': {
            languageLabel: 'Academic English',
            nativeName: 'Academic English',
            voiceLang: 'en-US',
            heading: 'Asymptotic Resolution of Divide-and-Conquer Recurrences',
            explanation: 'The Master Theorem characterizes the asymptotic growth of recurrence T(n) = aT(n/b) + f(n) by partitioning work across a recursion tree of height log_b(n) with a^(log_b n) = n^(log_b a) leaves.',
            analogy: 'Like organizing a tournament bracket where each round halves the remaining teams.',
            keyTerms: [
              { term: 'Recurrence Relation', meaning: 'Equation defining a function in terms of its value on smaller inputs.' },
              { term: 'Critical Exponent', meaning: 'Value log_b(a) governing leaf-level work growth.' }
            ]
          },
          'simple-en': {
            languageLabel: 'Simple English',
            nativeName: 'Plain Everyday English',
            voiceLang: 'en-US',
            heading: 'How Fast Divide-and-Conquer Algorithms Run',
            explanation: 'Instead of sorting a huge pile of cards one by one, divide-and-conquer cuts the pile in half repeatedly, sorts the tiny piles, and zips them back together—saving huge amounts of time.',
            analogy: 'Finding a word in a dictionary by opening to the middle page instead of reading from page 1.',
            keyTerms: [
              { term: 'Subproblem', meaning: 'A smaller piece of the original big problem.' },
              { term: 'Logarithmic Height', meaning: 'How many times you can cut n in half before reaching 1.' }
            ]
          },
          te: {
            languageLabel: 'Telugu',
            nativeName: 'తెలుగు (Telugu)',
            voiceLang: 'te-IN',
            heading: 'డివైడ్ అండ్ కాంకర్ & మాస్టర్ సిద్ధాంతం (T(n) = aT(n/b) + f(n))',
            explanation: 'పెద్ద సమస్యను చిన్న భాగాలుగా విభజించి (Divide), వాటిని సులభంగా పరిష్కరించి, తిరిగి కలపడాన్ని (Combine) డివైడ్ అండ్ కాంకర్ అంటారు. మెర్జ్ సార్ట్ వంటి అల్గారిథమ్‌లు O(n log n) సమయంలో పనిచేస్తాయి.',
            analogy: 'నిఘంటువులో పదాన్ని వెతికేటప్పుడు మధ్య పేజీని తెరిచి సగం భాగాన్ని వదిలివేయడం వంటిది.',
            keyTerms: [
              { term: 'రికరెన్స్ సంబంధం (Recurrence)', meaning: 'చిన్న ఇన్‌పుట్‌ల ఆధారంగా మొత్తం సమయాన్ని లెక్కించే సమీకరణం.' },
              { term: 'ట్రీ ఎత్తు (log n)', meaning: 'సమస్యను సగానికి విభజించే దశల సంఖ్య.' }
            ]
          },
          hi: {
            languageLabel: 'Hindi',
            nativeName: 'हिन्दी (Hindi)',
            voiceLang: 'hi-IN',
            heading: 'डिवाइड-एंड-कॉन्कर और मास्टर प्रमेय (T(n) = aT(n/b) + f(n))',
            explanation: 'डिवाइड-एंड-कॉन्कर एल्गोरिदम किसी बड़ी समस्या (आकार n) को छोटे उप-भागों (n/b) में बाँटकर हल करता है। मास्टर प्रमेय की सहायता से हम बिना पूरा पेड़ बनाए सीधे इसकी समय जटिलता Θ(n log n) निकाल सकते हैं।',
            analogy: 'जैसे शब्दकोश में कोई शब्द खोजते समय हर बार बीच का पन्ना खोलकर आधी किताब छोड़ देना।',
            keyTerms: [
              { term: 'रिकरेंस समीकरण', meaning: 'छोटे इनपुट के आधार पर कुल समय बताने वाला सूत्र।' },
              { term: 'शाखा गुणक (a)', meaning: 'प्रत्येक चरण में बनने वाली उप-समस्याओं की संख्या।' }
            ]
          }
        }
      },
      {
        id: 'sec-3-2',
        chapterNumber: 3,
        chapterTitle: 'Chapter 3: Self-Balancing Search Trees & Rotations',
        sectionCode: '3.2',
        title: 'AVL Tree Balance Factor & Left-Right Rotation Repair',
        pageNumber: 28,
        sourceQuote: 'PDF Page 28, Section 3.2: "In an AVL tree, every node v maintains Balance Factor BF(v) = Height(Left(v)) - Height(Right(v)) ∈ {-1, 0, +1}. If insertion causes |BF(v)| = 2, a single or double rotation restores O(log n) height in O(1) pointer updates."',
        sourceConfidence: 'Verified Handwritten OCR · Page 28 (Section 3.2 Target)',
        originalMessySnippet: '[Handwritten Page 28] Sec 3.2 AVL Rotations: BF(node) = h(L) - h(R). Allowed = {-1, 0, +1}. Unbalanced chain 30 -> 10 -> 20 has BF(30)=+2, BF(10)=-1 -> Left-Right (LR) Double Rotation makes 20 the new balanced root!',
        accessibleParagraphs: [
          'A standard Binary Search Tree (BST) can degrade into a slow linked list of height O(n) if numbers are inserted in sorted order. AVL Trees prevent this by keeping the left and right subtrees of every node nearly the same height.',
          'For every node v, the Balance Factor BF(v) is defined as the height of its left subtree minus the height of its right subtree. As long as BF(v) stays -1, 0, or +1 at every node, the total tree height is guaranteed never to exceed 1.44 · log_2(n).',
          'When inserting a new key pushes a node’s Balance Factor to +2 or -2, we perform a local tree rotation (Left-Left, Right-Right, Left-Right, or Right-Left). This rearranges at most three nodes in O(1) constant time while strictly preserving the left-to-right sorted order of keys.'
        ],
        keyTakeaway: 'AVL trees enforce |Height(Left) - Height(Right)| ≤ 1 at every node via O(1) rotations, guaranteeing worst-case O(log n) search, insert, and delete.',
        formula: {
          raw: 'BF(v) = h(Left(v)) - h(Right(v)) ∈ {-1, 0, +1}   and   h_max < 1.44 · log₂(n + 2)',
          spokenPlainLanguage: 'Balance Factor BF of node v equals height of left subtree minus height of right subtree, which must belong to the set negative one, zero, or positive one; maximum tree height is strictly less than 1.44 times log base 2 of n plus 2.',
          stepByStepDerivation: [
            'Compute subtree heights bottom-up after inserting key k: h(v) = 1 + max(h(Left), h(Right)).',
            'Evaluate BF(v) = h(Left(v)) - h(Right(v)) along the ancestor path back to the root.',
            'At the lowest unbalanced ancestor where |BF(v)| = 2, apply a rotation to drop subtree height by 1 and restore balance.'
          ],
          variables: [
            { symbol: 'BF(v)', name: 'Balance Factor', meaning: 'Height difference between left and right subtrees of node v', unit: 'IntegerLevels' },
            { symbol: 'h(v)', name: 'Node Height', meaning: 'Longest path from node v down to a leaf', unit: 'Edges' },
            { symbol: 'n', name: 'Node Count', meaning: 'Total number of keys stored in the AVL tree', unit: 'Nodes' }
          ]
        },
        diagram: {
          type: 'avl-tree',
          title: 'Figure 3.2: AVL Tree Imbalance (BF = +2) & Rotation Rebalancing',
          caption: 'Before-and-after node-pointer diagram converting an unbalanced 3-node chain (30 → 20 → 10) into a balanced root (20) with left child (10) and right child (30).',
          naturalLanguageSteps: [
            'Left Panel (Unbalanced State before Rotation): Node 30 is at the top with Balance Factor +2 because its left child is Node 20 (BF = +1), which has left child Node 10 (BF = 0), and Node 30 has an empty right subtree.',
            'Center Action Arrow (Right Rotation on Pivot 30): Node 20 rises up to become the new parent root; Node 30 rotates clockwise down to become the right child of Node 20.',
            'Right Panel (Balanced AVL State after Rotation): Node 20 is now the root with BF = 0. Its left child is Node 10 (BF = 0) and its right child is Node 30 (BF = 0). Height dropped from 3 to 2.'
          ],
          spatialSummary: 'Two-column transformation diagram: Left shows skewed 3-level chain; Right shows balanced 2-level triangle with BF = 0 on all nodes.'
        },
        explainSamples: {
          simplify: 'An AVL tree is like a hanging mobile sculpture: whenever adding a new ornament makes one side droop two levels lower than the other, you shift the middle hanger up to the top so both sides hang level again.',
          summarize: [
            'Balance Factor = Left Subtree Height minus Right Subtree Height.',
            'Valid AVL nodes only allow Balance Factors of -1, 0, or +1.',
            'Rotations fix any +2 or -2 imbalance in O(1) time while keeping keys sorted.'
          ],
          practiceQuestions: [
            {
              question: 'If keys 30, 20, and 10 are inserted into an initially empty AVL tree in that order, which node becomes the root after rebalancing?',
              answer: 'Node 20 becomes the root, with 10 as its left child and 30 as its right child, via a single Right Rotation.'
            }
          ]
        },
        multilingual: {
          'academic-en': {
            languageLabel: 'Academic English',
            nativeName: 'Academic English',
            voiceLang: 'en-US',
            heading: 'Section 3.2: Height-Balanced AVL Invariants & Structural Rotations',
            explanation: 'An AVL tree maintains the invariant |h(L(v)) - h(R(v))| ≤ 1 for all vertices v. Upon key insertion or deletion violating this bound, local pointer rotations restore height balance in O(1) amortized restructuring while preserving symmetric in-order traversal.',
            analogy: 'Acts as a self-leveling suspension system that prevents worst-case O(n) degenerate chains.',
            keyTerms: [
              { term: 'Balance Factor (BF)', meaning: 'Difference between left and right subtree heights: h(L) - h(R).' },
              { term: 'Right Rotation', meaning: 'Constant-time pointer transformation promoting a left child to parent.' }
            ]
          },
          'simple-en': {
            languageLabel: 'Simple English',
            nativeName: 'Plain Everyday English',
            voiceLang: 'en-US',
            heading: 'Section 3.2: Keeping Search Trees Balanced with AVL Rotations',
            explanation: 'If a search tree grows lopsided on one side, searching slows down. An AVL tree checks the height of both sides at every branch. Whenever one side becomes 2 steps taller, it rotates the middle item up to the top so both sides stay even.',
            analogy: 'Like adjusting the middle point of a seesaw so neither side touches the ground.',
            keyTerms: [
              { term: 'Balance Factor', meaning: 'Left side height minus right side height (must be -1, 0, or +1).' },
              { term: 'Rotation', meaning: 'Swapping parent and child links to level out a lopsided branch.' }
            ]
          },
          te: {
            languageLabel: 'Telugu',
            nativeName: 'తెలుగు (Telugu)',
            voiceLang: 'te-IN',
            heading: 'విభాగం 3.2: AVL ట్రీ బ్యాలెన్స్ ఫ్యాక్టర్ & రొటేషన్లు',
            explanation: 'బైనరీ సెర్చ్ ట్రీ ఒకే వైపుకు పెరిగిపోతే సెర్చింగ్ నెమ్మదిస్తుంది. అందుకే AVL ట్రీలో ప్రతి నోడ్ వద్ద ఎడమ మరియు కుడి సబ్-ట్రీల ఎత్తు భేదం (Balance Factor) -1, 0, లేదా +1 ఉండేలా చూస్తారు. ఇది +2 లేదా -2 అయినప్పుడు రొటేషన్ (Rotation) ద్వారా ట్రీని మళ్లీ సమతుల్యం చేస్తారు.',
            analogy: 'త్రాసు రెండు వైపులా సమానంగా ఉండేలా మధ్య పాయింట్‌ను సర్దుబాటు చేయడం లాంటిది.',
            keyTerms: [
              { term: 'బ్యాలెన్స్ ఫ్యాక్టర్ (BF)', meaning: 'ఎడమ సబ్-ట్రీ ఎత్తు నుండి కుడి సబ్-ట్రీ ఎత్తును తీసివేయగా వచ్చే విలువ.' },
              { term: 'రొటేషన్ (Rotation)', meaning: 'సార్టెడ్ క్రమం మారకుండా ట్రీ ఎత్తును తగ్గించే ప్రక్రియ.' }
            ]
          },
          hi: {
            languageLabel: 'Hindi',
            nativeName: 'हिन्दी (Hindi)',
            voiceLang: 'hi-IN',
            heading: 'अनुभाग 3.2: AVL ट्री बैलेंस फैक्टर और रोटेशन संतुलन',
            explanation: 'यदि बाइनरी सर्च ट्री एक ही तरफ झुक जाए तो खोजने में अधिक समय लगता है। AVL ट्री हर नोड पर बाएँ और दाएँ सब-ट्री की ऊँचाई का अंतर (Balance Factor) केवल -1, 0 या +1 रखता है। असंतुलन (+2 या -2) होने पर रोटेशन द्वारा बीच वाले नोड को ऊपर लाकर पेड़ को संतुलित किया जाता है।',
            analogy: 'जैसे तराजू के दोनों पलड़ों को बराबर रखने के लिए बीच के बिंदु को संतुलित करना।',
            keyTerms: [
              { term: 'बैलेंस फैक्टर (BF)', meaning: 'बाएँ सब-ट्री की ऊँचाई घटाव दाएँ सब-ट्री की ऊँचाई।' },
              { term: 'रोटेशन (Rotation)', meaning: 'क्रम बदले बिना पेड़ की ऊँचाई कम करने की O(1) प्रक्रिया।' }
            ]
          }
        }
      }
    ],
    flashcards: [
      {
        id: 'fc-ds-1',
        category: 'Chapter 1 · Master Theorem',
        question: 'What is the height of a recursion tree that divides input n by factor b at each step?',
        answer: 'The recursion tree has height log_b(n).'
      },
      {
        id: 'fc-ds-2',
        category: 'Chapter 3.2 · AVL Trees',
        question: 'Which Balance Factor values are permitted in a valid AVL tree node?',
        answer: 'Only -1, 0, and +1. Any node reaching -2 or +2 triggers an immediate rotation.'
      }
    ],
    checklist: [
      {
        id: 'chk-ds-1',
        label: 'Identify Recurrence Parameters (a, b, f(n))',
        detail: 'Extract branching factor and combine cost from recursive code.'
      },
      {
        id: 'chk-ds-2',
        label: 'Compute AVL Balance Factors (BF = h_L - h_R)',
        detail: 'Verify every node in Section 3.2 satisfies |BF(v)| ≤ 1 after rotation.'
      }
    ],
    mindMap: [
      { id: 'mm-ds-1', title: 'Algorithmic Data Structures', role: 'root', summary: 'Logarithmic time guarantees through balanced trees and divide-and-conquer.' },
      { id: 'mm-ds-2', title: 'Ch 1: Master Theorem', role: 'branch', summary: 'T(n) = aT(n/b) + f(n) complexity analysis.' },
      { id: 'mm-ds-3', title: 'Ch 3.2: AVL Tree Rotations', role: 'branch', summary: 'Maintains |BF| ≤ 1 for worst-case O(log n) search.' }
    ]
  },
  {
    id: 'sample-audio',
    title: 'Recorded Classroom Audio Lecture (Cellular Bio-Energetics & The Bohr Effect)',
    shortLabel: 'Recorded Classroom Audio Lecture',
    badgeCategory: 'Sample C · Audio Transcript & Biology',
    fileName: 'BIO302_Classroom_Lecture_Bohr_Effect_Transcript.pdf',
    pageCount: 22,
    sourceFormat: 'Classroom Audio + Transcript PDF',
    uploadWarnings: [
      'Classroom ambient echo filtered; synchronized 22-page slide transcript with chemical equilibrium equations.'
    ],
    sections: [
      {
        id: 'sec-1-1',
        chapterNumber: 1,
        chapterTitle: 'Chapter 1: Hemoglobin Oxygen Transport',
        sectionCode: '1.1',
        title: 'Cooperative Binding & Sigmoidal Saturation Curve',
        pageNumber: 4,
        sourceQuote: 'Lecture Transcript Page 4 [04:12]: "Hemoglobin is a tetramer of four heme subunits; binding the first O2 molecule induces a conformational shift from the T-state (tense) to the R-state (relaxed), increasing affinity 300-fold."',
        sourceConfidence: 'Verified Audio + Slide Page 4',
        originalMessySnippet: '[Audio 04:12 - Slide 4] Hb4 + 4 O2 <-> Hb4(O2)4. Cooperative binding -> S-shaped curve. Lung pO2 = 100 mmHg (98% full), Tissue pO2 = 40 mmHg.',
        accessibleParagraphs: [
          'Hemoglobin is an iron-rich protein inside red blood cells that carries oxygen from your lungs to active muscles and organs. Each hemoglobin molecule has four binding pockets that work together as a team.',
          'When the first oxygen molecule snaps into one pocket in the oxygen-rich lungs, it slightly changes the shape of the protein, making it much easier for the remaining three oxygen molecules to bind. This teamwork is called cooperative binding.',
          'Because of cooperative binding, hemoglobin loads up to 98% capacity in the lungs where oxygen pressure is high (100 mmHg), yet readily releases oxygen when passing through working muscles where oxygen pressure drops.'
        ],
        keyTakeaway: 'Cooperative binding gives hemoglobin an S-shaped saturation curve that maximizes oxygen loading in the lungs and rapid unloading in tissues.',
        formula: {
          raw: 'Y = (pO₂)^n / [ (P₅₀)^n + (pO₂)^n ]   (Hill Equation, n ≈ 2.8)',
          spokenPlainLanguage: 'Fractional oxygen saturation Y equals partial pressure of oxygen p O 2 raised to Hill coefficient n, divided by the sum of P 50 raised to n plus p O 2 raised to n.',
          stepByStepDerivation: [
            'Measure partial pressure of oxygen pO₂ in millimeters of mercury (mmHg).',
            'Identify P₅₀ (around 26 mmHg), the oxygen pressure where 50% of hemoglobin sites are bound.',
            'Apply Hill cooperativity exponent n ≈ 2.8 to produce the steep sigmoidal delivery slope.'
          ],
          variables: [
            { symbol: 'Y', name: 'Fractional Saturation', meaning: 'Proportion of hemoglobin binding sites occupied by O2', unit: 'Fraction (0–1)' },
            { symbol: 'pO₂', name: 'Oxygen Partial Pressure', meaning: 'Local concentration pressure of dissolved oxygen', unit: 'mmHg' },
            { symbol: 'P₅₀', name: 'Half-Saturation Pressure', meaning: 'Oxygen pressure needed for 50% saturation', unit: 'mmHg' },
            { symbol: 'n', name: 'Hill Coefficient', meaning: 'Measure of subunit binding cooperativity (~2.8)', unit: 'Dimensionless' }
          ]
        },
        diagram: {
          type: 'bohr-oxygen',
          title: 'Hemoglobin Cooperative Sigmoidal Curve',
          caption: 'S-shaped oxygen dissociation graph comparing lungs (100 mmHg) vs resting tissues (40 mmHg).',
          naturalLanguageSteps: [
            'Horizontal Axis (pO₂ from 0 to 100 mmHg): Represents oxygen availability from oxygen-starved muscle (left) to alveoli in the lungs (right).',
            'Vertical Axis (O₂ Saturation 0% to 100%): Shows percentage of heme iron sites carrying oxygen.',
            'Sigmoidal Curve Trajectory: Steeply rises between 20 and 50 mmHg so small drops in tissue oxygen trigger large releases of O₂.'
          ],
          spatialSummary: '2D coordinate graph with S-shaped curve rising from bottom-left (0,0) to plateau near top-right (100 mmHg, 98%).'
        },
        explainSamples: {
          simplify: 'Hemoglobin acts like a smart delivery truck that automatically fills up completely at the warehouse (lungs) and opens its doors wide as soon as it reaches busy neighborhoods (muscles).',
          summarize: [
            'Hemoglobin has 4 oxygen-binding heme subunits.',
            'Binding one oxygen makes the other three bind much faster (cooperativity).',
            'P50 is the oxygen pressure where hemoglobin is 50% full.'
          ],
          practiceQuestions: [
            {
              question: 'What does a Hill coefficient of n = 2.8 indicate about hemoglobin?',
              answer: 'Because n > 1, it indicates positive cooperativity: oxygen binding at one subunit increases oxygen affinity at the remaining subunits.'
            }
          ]
        },
        multilingual: {
          'academic-en': {
            languageLabel: 'Academic English',
            nativeName: 'Academic English',
            voiceLang: 'en-US',
            heading: 'Allosteric Cooperativity in Tetrameric Hemoglobin',
            explanation: 'Allosteric transition between the low-affinity deoxygenated T-state and high-affinity oxygenated R-state produces sigmoidal binding kinetics quantified by the Hill equation with n ≈ 2.8.',
            analogy: 'Functions like a molecular switch that flips from low-grip to high-grip once initial ligand binding occurs.',
            keyTerms: [
              { term: 'T-State (Tense)', meaning: 'Low-affinity deoxygenated conformation stabilized by salt bridges.' },
              { term: 'R-State (Relaxed)', meaning: 'High-affinity oxygenated conformation in pulmonary capillaries.' }
            ]
          },
          'simple-en': {
            languageLabel: 'Simple English',
            nativeName: 'Plain Everyday English',
            voiceLang: 'en-US',
            heading: 'How Red Blood Cells Pick Up and Drop Off Oxygen',
            explanation: 'Hemoglobin has four seats for oxygen. Once the first oxygen molecule sits down in the lungs, the other three seats open wide so the protein fills up fast. In tired muscles, all four seats release oxygen quickly.',
            analogy: 'Like a 4-seat carpool where the doors unlock automatically as soon as the first passenger steps in.',
            keyTerms: [
              { term: 'Hemoglobin', meaning: 'The protein in red blood cells that carries oxygen.' },
              { term: 'Cooperative Binding', meaning: 'Teamwork between the four oxygen pockets.' }
            ]
          },
          te: {
            languageLabel: 'Telugu',
            nativeName: 'తెలుగు (Telugu)',
            voiceLang: 'te-IN',
            heading: 'హీమోగ్లోబిన్ ఆక్సిజన్ రవాణా & సహకార బంధం',
            explanation: 'ఎర్ర రక్త కణాలలోని హీమోగ్లోబిన్ నాలుగు ఆక్సిజన్ అణువులను మోసుకెళ్లగలదు. ఊపిరితిత్తులలో మొదటి ఆక్సిజన్ అణువు చేరిన వెంటనే మిగిలిన మూడు ఆక్సిజన్ అణువులు చాలా వేగంగా బంధించబడతాయి.',
            analogy: 'ఇది అవసరాన్ని బట్టి ఆక్సిజన్‌ను నింపి, కండరాలకు అందించే స్మార్ట్ వాహనం లాంటిది.',
            keyTerms: [
              { term: 'హీమోగ్లోబిన్', meaning: 'రక్తంలో ఆక్సిజన్‌ను రవాణా చేసే ప్రోటీన్.' },
              { term: 'సంతృప్త వక్రరేఖ (Saturation Curve)', meaning: 'ఆక్సిజన్ పీడనానికి మరియు బంధానికి మధ్య గల S-ఆకారపు గ్రాఫ్.' }
            ]
          },
          hi: {
            languageLabel: 'Hindi',
            nativeName: 'हिन्दी (Hindi)',
            voiceLang: 'hi-IN',
            heading: 'हीमोग्लोबिन ऑक्सीजन परिवहन और सहकारी बंधन',
            explanation: 'लाल रक्त कोशिकाओं में मौजूद हीमोग्लोबिन प्रोटीन एक साथ चार ऑक्सीजन अणुओं को ले जा सकता है। फेफड़ों में पहला ऑक्सीजन अणु जुड़ते ही बाकी तीन स्थान आसानी से खुल जाते हैं, जिससे पूरा प्रोटीन तुरंत ऑक्सीजन से भर जाता है।',
            analogy: 'यह एक स्मार्ट डिलीवरी वैन की तरह है जो फेफड़ों में तुरंत भरती है और मांसपेशियों में तुरंत ऑक्सीजन उतारती है।',
            keyTerms: [
              { term: 'हीमोग्लोबिन', meaning: 'रक्त में ऑक्सीजन ले जाने वाला मुख्य प्रोटीन।' },
              { term: 'सहकारी बंधन (Cooperativity)', meaning: 'पहले अणु के जुड़ने से बाकी अणुओं का तेजी से जुड़ना।' }
            ]
          }
        }
      },
      {
        id: 'sec-3-2',
        chapterNumber: 3,
        chapterTitle: 'Chapter 3: Metabolic Acidosis & Physiological Regulation',
        sectionCode: '3.2',
        title: 'The Bohr Effect: CO₂, pH Shift & Rightward Curve Displacement',
        pageNumber: 18,
        sourceQuote: 'Lecture Transcript Page 18 [19:45], Section 3.2: "In metabolically active skeletal muscle, elevated CO2 and lactic acid lower blood pH from 7.4 to 7.2. Protons (H+) protonate histidine-146 on hemoglobin, shifting the oxygen dissociation curve to the right and offloading 15–25% extra O2 exactly where needed."',
        sourceConfidence: 'Verified Audio + Slide Page 18 (Section 3.2 Target)',
        originalMessySnippet: '[Audio 19:45 - Slide 18] Sec 3.2 Bohr Effect: CO2 + H2O <-> H2CO3 <-> H+ + HCO3-. Higher [H+] (lower pH 7.2) + Hb(O2)4 -> HbH+ + 4 O2 released! Curve shifts RIGHT (P50 increases from 26 to 34 mmHg).',
        accessibleParagraphs: [
          'When you sprint or exercise hard, your muscle cells burn glucose rapidly and release carbon dioxide (CO₂) and lactic acid into the surrounding capillaries. Inside red blood cells, an enzyme called carbonic anhydrase converts CO₂ and water into carbonic acid, releasing hydrogen ions (H⁺) and lowering blood pH from 7.4 to 7.2.',
          'The Bohr Effect describes how hemoglobin senses this local acidity: extra H⁺ ions bind to specific amino acids on hemoglobin, stabilizing its low-affinity T-state and forcing it to let go of its bound oxygen molecules.',
          'On a graph, lower pH (higher CO₂) shifts the S-shaped oxygen dissociation curve to the right. That rightward shift means that at the exact same tissue oxygen pressure (40 mmHg), hemoglobin unloads significantly more oxygen directly into the working muscles.'
        ],
        keyTakeaway: 'Elevated CO₂ and lower pH (higher H⁺) in active muscles shift the hemoglobin dissociation curve rightward, boosting oxygen release where metabolic demand is highest.',
        formula: {
          raw: 'Hb(O₂)₄ + H⁺ ⇌ HbH⁺ + 4 O₂↑   and   CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻',
          spokenPlainLanguage: 'Oxygenated hemoglobin H b O 2 four plus a hydrogen ion H plus is in reversible equilibrium with protonated deoxyhemoglobin H b H plus and four released oxygen molecules; carbon dioxide plus water forms carbonic acid, which dissociates into H plus and bicarbonate H C O 3 minus.',
          stepByStepDerivation: [
            'Step 1 (Tissue Metabolism): Exercising muscle releases CO₂, which reacts with H₂O to generate H⁺ protons and lower blood pH.',
            'Step 2 (Allosteric Protonation): Excess H⁺ binds to Hemoglobin, driving the equilibrium Hb(O₂)₄ + H⁺ → HbH⁺ + 4 O₂ to the right by Le Chatelier’s principle.',
            'Step 3 (Rightward Curve Shift): Half-saturation pressure P₅₀ rises from 26 mmHg (pH 7.4) to 34 mmHg (pH 7.2), releasing extra O₂ into the muscle.'
          ],
          variables: [
            { symbol: 'Hb(O₂)₄', name: 'Oxyhemoglobin', meaning: 'Fully oxygenated hemoglobin arriving from lungs', unit: 'mmol/L' },
            { symbol: '[H⁺]', name: 'Proton Concentration', meaning: 'Acidity level inversely related to blood pH', unit: 'pH Units' },
            { symbol: 'HCO₃⁻', name: 'Bicarbonate Ion', meaning: 'Dissolved buffer carrying CO2 back to the lungs', unit: 'mmol/L' },
            { symbol: 'ΔP₅₀', name: 'Rightward Affinity Shift', meaning: 'Increase in P50 during exercise acidosis', unit: '+8 mmHg' }
          ]
        },
        diagram: {
          type: 'bohr-oxygen',
          title: 'Figure 3.2: The Bohr Effect Rightward Dissociation Curve Shift (pH 7.4 vs pH 7.2)',
          caption: 'Dual-curve coordinate plot comparing normal arterial blood (blue curve, pH 7.4) against exercising acidic muscle blood (amber dashed curve shifted right, pH 7.2).',
          naturalLanguageSteps: [
            'Solid Teal Curve (Normal Resting Blood, pH 7.4): At tissue pO₂ = 40 mmHg, hemoglobin retains 75% saturation (releasing 25% of its oxygen cargo).',
            'Dashed Amber Curve (Exercising Muscle Blood, pH 7.2 / High CO₂): Shifted to the right. At the same tissue pO₂ = 40 mmHg, saturation drops to 52% (releasing 48% of its oxygen cargo).',
            'Vertical Delta Arrow at pO₂ = 40 mmHg: Highlights the +23% bonus oxygen unloaded directly into active muscle fibers due to proton binding.'
          ],
          spatialSummary: 'Overlay graph of two S-shaped curves showing a downward/rightward delivery gap at pO₂ = 40 mmHg.'
        },
        explainSamples: {
          simplify: 'When muscles work hard, they produce acid and CO₂. Hemoglobin uses that acid as a chemical distress signal to dump extra oxygen right where the tired muscles need it most!',
          summarize: [
            'Active muscles produce CO₂, which forms H⁺ ions and lowers blood pH from 7.4 to 7.2.',
            'H⁺ ions bind to hemoglobin and reduce its grip on oxygen (The Bohr Effect).',
            'The oxygen dissociation curve shifts to the right, delivering extra O₂ to active tissues.'
          ],
          practiceQuestions: [
            {
              question: 'In which direction does the oxygen-hemoglobin dissociation curve shift when blood CO₂ concentration increases during sprinting?',
              answer: 'It shifts to the right (increasing P50), which lowers oxygen affinity and enhances oxygen unloading into the active muscle.'
            }
          ]
        },
        multilingual: {
          'academic-en': {
            languageLabel: 'Academic English',
            nativeName: 'Academic English',
            voiceLang: 'en-US',
            heading: 'Section 3.2: The Bohr Effect & Allosteric Proton-Linked Oxygen Unloading',
            explanation: 'Elevated partial pressure of CO₂ and reduced pH in metabolically active tissues promote protonation of His-146 on β-globin chains, stabilizing the deoxy T-conformation and shifting the O₂ equilibrium curve rightward (increased P₅₀) to augment tissue oxygen extraction.',
            analogy: 'Acts as an automated demand-responsive supply valve regulated by local metabolic byproducts.',
            keyTerms: [
              { term: 'Bohr Effect', meaning: 'Decrease in hemoglobin oxygen affinity caused by lower pH and higher CO2.' },
              { term: 'Rightward Shift', meaning: 'Increase in P50 enabling greater oxygen release at physiological tissue pO2.' }
            ]
          },
          'simple-en': {
            languageLabel: 'Simple English',
            nativeName: 'Plain Everyday English',
            voiceLang: 'en-US',
            heading: 'Section 3.2: How Acid and CO2 Tell Blood to Drop Off Extra Oxygen',
            explanation: 'Hard-working muscles make carbon dioxide, which turns the blood slightly more acidic. That extra acid taps hemoglobin on the shoulder and makes it let go of extra oxygen right inside the muscles that are working the hardest.',
            analogy: 'Like firefighters automatically sending more water hoses to the building with the most smoke.',
            keyTerms: [
              { term: 'Bohr Effect', meaning: 'How acid and CO2 make hemoglobin release more oxygen.' },
              { term: 'pH Shift', meaning: 'A drop from pH 7.4 to 7.2 when muscles exercise hard.' }
            ]
          },
          te: {
            languageLabel: 'Telugu',
            nativeName: 'తెలుగు (Telugu)',
            voiceLang: 'te-IN',
            heading: 'విభాగం 3.2: బోర్ ప్రభావం (The Bohr Effect) & ఆక్సిజన్ విడుదల',
            explanation: 'కండరాలు వేగంగా పనిచేసేటప్పుడు ఎక్కువ కార్బన్ డయాక్సైడ్ (CO₂) విడుదలై రక్తం యొక్క pH 7.4 నుండి 7.2 కు తగ్గుతుంది. ఈ ఆమ్లత్వం వల్ల హీమోగ్లోబిన్ తనలోని ఆక్సిజన్‌ను కండరాలకు మరింత ఎక్కువగా విడుదల చేస్తుంది. గ్రాఫ్‌లో వక్రరేఖ కుడివైపుకు జరగడాన్ని బోర్ ప్రభావం అంటారు.',
            analogy: 'ఎక్కువగా అలసిపోయిన కండరాలకు వెంటనే అదనపు ఆక్సిజన్ అందించే ఆటోమేటిక్ సిగ్నల్ వ్యవస్థ లాంటిది.',
            keyTerms: [
              { term: 'బోర్ ప్రభావం (Bohr Effect)', meaning: 'CO₂ పెరిగినప్పుడు హీమోగ్లోబిన్ నుండి ఆక్సిజన్ సులభంగా విడుదలవడం.' },
              { term: 'కుడివైపు మార్పు (Right Shift)', meaning: 'కణజాలాలకు అదనపు ఆక్సిజన్ అందుతుందని చూపే గ్రాఫ్ మార్పు.' }
            ]
          },
          hi: {
            languageLabel: 'Hindi',
            nativeName: 'हिन्दी (Hindi)',
            voiceLang: 'hi-IN',
            heading: 'अनुभाग 3.2: बोहर प्रभाव (Bohr Effect) और ऑक्सीजन आपूर्ति',
            explanation: 'तेज़ व्यायाम के समय मांसपेशियों में कार्बन डाइऑक्साइड (CO₂) और H⁺ आयन बढ़ते हैं, जिससे रक्त का pH 7.4 से घटकर 7.2 हो जाता है। यह अम्लता हीमोग्लोबिन से जुड़कर उसे अतिरिक्त ऑक्सीजन छोड़ने के लिए प्रेरित करती है और ग्राफ दाईं ओर खिसक जाता है।',
            analogy: 'जैसे जहाँ ज्यादा मेहनत हो रही हो वहाँ अपने-आप अधिक ऑक्सीजन पहुँचाने वाला स्मार्ट सेंसर।',
            keyTerms: [
              { term: 'बोहर प्रभाव (Bohr Effect)', meaning: 'अधिक CO₂ और कम pH के कारण मांसपेशियों में अतिरिक्त ऑक्सीजन का छूटना।' },
              { term: 'दाईं ओर विस्थापन (Right Shift)', meaning: 'ऑक्सीजन वियोजन वक्र का दाईं ओर खिसकना।' }
            ]
          }
        }
      }
    ],
    flashcards: [
      {
        id: 'fc-bio-1',
        category: 'Chapter 1 · Cooperativity',
        question: 'Why does hemoglobin have an S-shaped (sigmoidal) binding curve?',
        answer: 'Because binding the first O2 molecule triggers a shape change from the Tense (T) state to the Relaxed (R) state, making subsequent O2 binding much easier.'
      },
      {
        id: 'fc-bio-2',
        category: 'Chapter 3.2 · The Bohr Effect',
        question: 'How does lower pH (7.2) in exercising muscle change the hemoglobin dissociation curve?',
        answer: 'It shifts the curve to the right (increasing P50), causing hemoglobin to unload extra oxygen into the active muscle.'
      }
    ],
    checklist: [
      {
        id: 'chk-bio-1',
        label: 'Compare Lung pO₂ (100 mmHg) vs Tissue pO₂ (40 mmHg)',
        detail: 'Understand how pressure gradients drive oxygen loading and unloading.'
      },
      {
        id: 'chk-bio-2',
        label: 'Trace Section 3.2 Bohr Effect Chemical Equilibrium',
        detail: 'Follow CO₂ + H₂O ⇌ H⁺ + HCO₃⁻ and verify why H⁺ shifts the curve right.'
      }
    ],
    mindMap: [
      { id: 'mm-bio-1', title: 'Respiratory Bio-Energetics', role: 'root', summary: 'Allosteric oxygen transport from pulmonary alveoli to mitochondria.' },
      { id: 'mm-bio-2', title: 'Ch 1: Cooperative Heme Binding', role: 'branch', summary: 'T-state to R-state transition creates sigmoidal curve.' },
      { id: 'mm-bio-3', title: 'Ch 3.2: Bohr Effect (pH & CO₂)', role: 'branch', summary: 'Acidic tissues shift curve right to boost O2 delivery.' }
    ]
  }
];
