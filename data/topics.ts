import { Gavel, ShieldCheck, UserCheck, Scale, BookOpen, FileText, HelpCircle, Smartphone, Heart, Briefcase, AlertTriangle, Users, Car, Landmark, Leaf, Building2, GraduationCap, Banknote } from 'lucide-react';

export interface LegalTopic {
  id: string;
  title: string;
  category: string;
  icon: any;
  tag: string;
  description: string;
  fullContent: {
    definition: string;
    applicability: string[];
    steps: { title: string; description: string }[];
    misconceptions: { myth: string; fact: string }[];
    resources: { title: string; link: string }[];
  };
}

export const topics: LegalTopic[] = [
  {
    id: 'right-to-legal-representation',
    title: 'Right to Legal Representation',
    category: 'Your Rights',
    icon: Gavel,
    tag: 'Criminal Law',
    description: 'Learn about your fundamental right to have a lawyer present during legal proceedings.',
    fullContent: {
      definition: "The right to legal representation is a fundamental human right that ensures every individual has access to a qualified legal professional to assist them in legal matters, particularly during criminal proceedings. This right is designed to protect individuals from unfair treatment and to ensure that the legal process is balanced and just.",
      applicability: [
        "Criminal investigations and interrogations",
        "Court trials and hearings",
        "Appeals processes",
        "Administrative hearings where significant rights are at stake"
      ],
      steps: [
        {
          title: "Request a Lawyer Immediately",
          description: "If you are detained or questioned by law enforcement, clearly state that you wish to speak with a lawyer before answering any questions."
        },
        {
          title: "Consult Privately",
          description: "You have the right to speak with your lawyer in private, without the presence of law enforcement or other third parties."
        },
        {
          title: "Review Legal Options",
          description: "Work with your lawyer to understand the charges against you, the potential consequences, and the best legal strategy for your defense."
        }
      ],
      misconceptions: [
        {
          myth: "Only guilty people need lawyers.",
          fact: "Lawyers are essential for protecting the rights of the innocent and ensuring that the legal process is followed correctly for everyone."
        },
        {
          myth: "If I can't afford a lawyer, I'm on my own.",
          fact: "In many jurisdictions, the state is required to provide a public defender or legal aid if you cannot afford private representation."
        }
      ],
      resources: [
        { title: "National Legal Aid Directory", link: "#" },
        { title: "Your Rights During Interrogation - Guide", link: "#" },
        { title: "How to Find a Pro Bono Lawyer", link: "#" }
      ]
    }
  },
  {
    id: 'understanding-search-warrants',
    title: 'Understanding Search Warrants',
    category: 'Your Rights',
    icon: ShieldCheck,
    tag: 'Civil Rights',
    description: 'What you need to know when law enforcement requests to search your property.',
    fullContent: {
      definition: "A search warrant is a court order issued by a judge or magistrate that authorizes law enforcement officers to conduct a search of a specific person, location, or vehicle for evidence of a crime and to seize any evidence they find.",
      applicability: [
        "Private residences",
        "Business premises",
        "Personal vehicles",
        "Digital devices (in some jurisdictions)"
      ],
      steps: [
        {
          title: "Ask to See the Warrant",
          description: "Before allowing a search, ask the officers to show you the warrant and verify that it is signed by a judge."
        },
        {
          title: "Check the Scope",
          description: "Read the warrant carefully to see exactly what areas are authorized to be searched and what items are being sought."
        },
        {
          title: "Remain Calm and Silent",
          description: "You do not have to answer questions during the search. You can state that you do not consent to the search, but do not physically interfere with the officers."
        }
      ],
      misconceptions: [
        {
          myth: "Police can search anything if they have a warrant.",
          fact: "Police are limited to the specific areas and items listed in the warrant."
        },
        {
          myth: "I must answer all questions if they have a warrant.",
          fact: "You still maintain your right to remain silent, even during a warranted search."
        }
      ],
      resources: [
        { title: "Know Your Rights: Search and Seizure", link: "#" },
        { title: "What to Do if Police Knock on Your Door", link: "#" }
      ]
    }
  },
  {
    id: 'your-rights-as-a-tenant',
    title: 'Your Rights as a Tenant',
    category: 'Common Laws',
    icon: UserCheck,
    tag: 'Housing Law',
    description: 'Essential information for renters regarding repairs, deposits, and evictions.',
    fullContent: {
      definition: "Tenant rights are a set of legal protections designed to ensure that individuals who rent their homes are treated fairly by landlords and have access to safe, habitable living conditions.",
      applicability: [
        "Residential lease agreements",
        "Month-to-month tenancies",
        "Subletting arrangements",
        "Public housing"
      ],
      steps: [
        {
          title: "Read Your Lease Carefully",
          description: "Understand all terms and conditions before signing, including rules on deposits, repairs, and termination."
        },
        {
          title: "Document Everything",
          description: "Keep records of all communications with your landlord, photos of the property's condition, and receipts for rent and repairs."
        },
        {
          title: "Know the Eviction Process",
          description: "Landlords must follow specific legal procedures to evict a tenant; they cannot simply lock you out or cut off utilities."
        }
      ],
      misconceptions: [
        {
          myth: "A landlord can enter my apartment whenever they want.",
          fact: "In most cases, landlords must provide advance notice (usually 24-48 hours) before entering for non-emergencies."
        },
        {
          myth: "I can stop paying rent if repairs aren't made.",
          fact: "Withholding rent can lead to eviction. There are specific legal ways to handle repair disputes, often involving escrow accounts."
        }
      ],
      resources: [
        { title: "Tenant Rights Handbook", link: "#" },
        { title: "Local Housing Authority Contact", link: "#" },
        { title: "Fair Housing Act Overview", link: "#" }
      ]
    }
  },
  {
    id: 'right-to-information',
    title: 'Right to Information (RTI)',
    category: 'Your Rights',
    icon: FileText,
    tag: 'Civil Rights',
    description: 'How to use the RTI Act to demand transparency and accountability from government bodies.',
    fullContent: {
      definition: "The Right to Information Act, 2005 empowers every Indian citizen to request information from any public authority. It promotes transparency and accountability in the working of every public office, making the government answerable to its citizens.",
      applicability: [
        "Central and state government departments",
        "Public sector undertakings",
        "Bodies substantially financed by government funds",
        "NGOs receiving government grants"
      ],
      steps: [
        {
          title: "Identify the Public Information Officer (PIO)",
          description: "Every public authority has a designated PIO. Identify the correct department and officer before filing your application."
        },
        {
          title: "Write Your RTI Application",
          description: "Write a clear, specific application in English, Hindi, or the official language of the area. Pay the prescribed fee (usually ₹10)."
        },
        {
          title: "Submit and Track",
          description: "Submit in person, by post, or online at rtionline.gov.in. The authority must respond within 30 days."
        },
        {
          title: "File an Appeal if Needed",
          description: "If unsatisfied with the response, file a first appeal with the First Appellate Authority within 30 days, and a second appeal with the Central/State Information Commission."
        }
      ],
      misconceptions: [
        {
          myth: "You need to give a reason for filing an RTI.",
          fact: "You are not required to give any reason or justification for seeking information under the RTI Act."
        },
        {
          myth: "RTI only applies to central government.",
          fact: "RTI applies to all public authorities at central, state, and local government levels."
        }
      ],
      resources: [
        { title: "RTI Online Portal - rtionline.gov.in", link: "#" },
        { title: "Central Information Commission", link: "#" },
        { title: "RTI Application Sample Format", link: "#" }
      ]
    }
  },
  {
    id: 'cyber-crime-rights',
    title: 'Your Rights in Cyber Crime',
    category: 'Your Rights',
    icon: Smartphone,
    tag: 'Cyber Law',
    description: 'What to do if you are a victim of online fraud, harassment, or identity theft.',
    fullContent: {
      definition: "Cyber crimes are offences committed using computers, the internet, or digital devices. Under the Bharatiya Nyaya Sanhita (BNS) and the IT Act 2000, victims have clear legal rights and remedies against online fraud, harassment, hacking, and identity theft.",
      applicability: [
        "Online financial fraud and UPI scams",
        "Social media harassment and cyberbullying",
        "Identity theft and impersonation",
        "Hacking and unauthorized data access",
        "Morphed images and deepfake misuse"
      ],
      steps: [
        {
          title: "Report to Cyber Crime Portal",
          description: "File a complaint immediately at cybercrime.gov.in or call the national helpline 1930. Time is critical in freezing fraudulent transactions."
        },
        {
          title: "Preserve All Evidence",
          description: "Take screenshots of messages, emails, transaction IDs, and URLs. Do not delete any communication with the accused."
        },
        {
          title: "File an FIR",
          description: "Visit your nearest police station or cyber cell to file an FIR. Under BNS Section 318, online cheating is punishable with up to 7 years imprisonment."
        },
        {
          title: "Notify Your Bank",
          description: "For financial fraud, immediately call your bank's helpline to freeze the transaction and initiate a chargeback request."
        }
      ],
      misconceptions: [
        {
          myth: "Cyber crimes can't be traced if the accused is anonymous.",
          fact: "Law enforcement agencies have tools to trace IP addresses, device IDs, and digital footprints even through VPNs."
        },
        {
          myth: "Small amounts aren't worth reporting.",
          fact: "Every report helps build a case against repeat offenders. Even small frauds should be reported at cybercrime.gov.in."
        }
      ],
      resources: [
        { title: "National Cyber Crime Reporting Portal", link: "#" },
        { title: "Cyber Crime Helpline: 1930", link: "#" },
        { title: "IT Act 2000 Overview", link: "#" }
      ]
    }
  },
  {
    id: 'domestic-violence-rights',
    title: 'Protection from Domestic Violence',
    category: 'Your Rights',
    icon: Heart,
    tag: 'Family Law',
    description: 'Legal protections available to victims of domestic abuse under Indian law.',
    fullContent: {
      definition: "The Protection of Women from Domestic Violence Act, 2005 provides civil remedies to women facing physical, emotional, sexual, verbal, or economic abuse from a family member or intimate partner. BNS Section 85 also criminalises cruelty by a husband or his relatives.",
      applicability: [
        "Married women facing spousal abuse",
        "Women in live-in relationships",
        "Daughters, mothers, and sisters facing family abuse",
        "Cases involving dowry harassment"
      ],
      steps: [
        {
          title: "Contact a Protection Officer",
          description: "Every district has a designated Protection Officer. They can help you file a Domestic Incident Report (DIR) and guide you through the legal process."
        },
        {
          title: "Apply for a Protection Order",
          description: "A Magistrate can issue a Protection Order prohibiting the abuser from committing further violence, contacting you, or entering your residence."
        },
        {
          title: "Seek a Residence Order",
          description: "You have the right to remain in the shared household. A Residence Order prevents the abuser from dispossessing you."
        },
        {
          title: "File a Criminal Complaint",
          description: "For physical assault, file an FIR under BNS Section 115 (hurt) or Section 85 (cruelty). Call 112 for immediate police assistance."
        }
      ],
      misconceptions: [
        {
          myth: "Domestic violence is a private family matter.",
          fact: "Domestic violence is a criminal offence. The law mandates police and courts to intervene and protect victims."
        },
        {
          myth: "Only physical abuse counts as domestic violence.",
          fact: "The law covers emotional, verbal, economic, and sexual abuse as well — not just physical harm."
        }
      ],
      resources: [
        { title: "National Women Helpline: 181", link: "#" },
        { title: "Protection of Women from DV Act, 2005", link: "#" },
        { title: "iCall Counselling Services", link: "#" }
      ]
    }
  },
  {
    id: 'consumer-rights',
    title: 'Consumer Rights & Protection',
    category: 'Common Laws',
    icon: Scale,
    tag: 'Consumer Law',
    description: 'Know your rights as a buyer and how to fight defective products or unfair trade practices.',
    fullContent: {
      definition: "The Consumer Protection Act, 2019 gives every buyer the right to be protected against unfair trade practices, defective goods, and deficient services. Consumers can file complaints before District, State, or National Consumer Commissions depending on the value of the claim.",
      applicability: [
        "Purchase of defective products",
        "Deficient or overcharged services",
        "Misleading advertisements",
        "E-commerce and online shopping disputes",
        "Medical negligence claims"
      ],
      steps: [
        {
          title: "Send a Legal Notice",
          description: "Before filing a complaint, send a written legal notice to the seller or service provider giving them 15-30 days to resolve the issue."
        },
        {
          title: "File a Consumer Complaint",
          description: "File online at edaakhil.nic.in or visit your District Consumer Disputes Redressal Commission. Claims up to ₹50 lakh go to the District Commission."
        },
        {
          title: "Attend the Hearing",
          description: "Bring all evidence — bills, receipts, warranty cards, and correspondence. The commission will hear both sides and pass an order."
        },
        {
          title: "Claim Compensation",
          description: "You can claim a refund, replacement, repair, or compensation for mental agony and legal costs."
        }
      ],
      misconceptions: [
        {
          myth: "Consumer courts take years to resolve cases.",
          fact: "Consumer commissions are mandated to resolve complaints within 3-5 months. Many cases are resolved much faster."
        },
        {
          myth: "You need a lawyer to file a consumer complaint.",
          fact: "You can represent yourself in consumer courts. The process is designed to be accessible to ordinary citizens."
        }
      ],
      resources: [
        { title: "E-Daakhil Consumer Portal", link: "#" },
        { title: "Consumer Helpline: 1800-11-4000", link: "#" },
        { title: "Consumer Protection Act 2019 Summary", link: "#" }
      ]
    }
  },
  {
    id: 'labour-rights',
    title: 'Employee & Labour Rights',
    category: 'Common Laws',
    icon: Briefcase,
    tag: 'Labour Law',
    description: 'Understand your rights at the workplace — from wages and leave to wrongful termination.',
    fullContent: {
      definition: "Indian labour laws, including the four Labour Codes enacted between 2019-2020, govern wages, working conditions, social security, and industrial relations. Every employee — formal or informal — has enforceable rights against exploitation, non-payment, and unsafe working conditions.",
      applicability: [
        "Salaried employees in private and public sector",
        "Contract and gig workers",
        "Domestic workers",
        "Factory and construction workers",
        "Cases of sexual harassment at workplace (POSH Act)"
      ],
      steps: [
        {
          title: "Document the Violation",
          description: "Keep records of your employment contract, salary slips, leave records, and any written communication related to the dispute."
        },
        {
          title: "Raise an Internal Grievance",
          description: "Most companies have an HR grievance process. File a formal complaint in writing and keep a copy for your records."
        },
        {
          title: "Approach the Labour Commissioner",
          description: "If internal resolution fails, file a complaint with the Labour Commissioner of your state. They can mediate and enforce payment of dues."
        },
        {
          title: "File Before Labour Court",
          description: "For wrongful termination or major disputes, approach the Labour Court or Industrial Tribunal with the help of a trade union or lawyer."
        }
      ],
      misconceptions: [
        {
          myth: "Contract workers have no labour rights.",
          fact: "Contract workers are entitled to minimum wages, safe working conditions, and ESI/PF benefits under the Contract Labour Act."
        },
        {
          myth: "An employer can terminate you without notice.",
          fact: "Most employees are entitled to a notice period or pay in lieu of notice. Sudden termination without cause is legally challengeable."
        }
      ],
      resources: [
        { title: "Shram Suvidha Portal", link: "#" },
        { title: "Labour Commissioner Contact Directory", link: "#" },
        { title: "POSH Act - Sexual Harassment at Workplace", link: "#" }
      ]
    }
  },
  {
    id: 'bail-and-arrest-rights',
    title: 'Rights During Arrest & Bail',
    category: 'Your Rights',
    icon: AlertTriangle,
    tag: 'Criminal Law',
    description: 'What the law says about your rights the moment you are arrested and how bail works.',
    fullContent: {
      definition: "Under the Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, which replaced the CrPC, every arrested person has clearly defined rights. These include the right to be informed of the grounds of arrest, the right to bail, and the right to inform a family member.",
      applicability: [
        "Persons arrested by police",
        "Persons detained for questioning",
        "Accused in bailable and non-bailable offences",
        "Undertrials in judicial custody"
      ],
      steps: [
        {
          title: "Know Your Grounds of Arrest",
          description: "Police must inform you of the reason for your arrest at the time of arrest. This is a constitutional right under Article 22."
        },
        {
          title: "Inform a Family Member",
          description: "You have the right to have one person of your choice informed of your arrest. Police cannot deny this right."
        },
        {
          title: "Apply for Bail",
          description: "For bailable offences, bail is a right. For non-bailable offences, apply before the Magistrate or Sessions Court. A lawyer can file a bail application on your behalf."
        },
        {
          title: "Produced Before Magistrate Within 24 Hours",
          description: "Police must produce you before the nearest Magistrate within 24 hours of arrest (excluding travel time). Any detention beyond this requires judicial authorisation."
        }
      ],
      misconceptions: [
        {
          myth: "Police can detain you for as long as they want.",
          fact: "Police can only hold you for 24 hours without a Magistrate's order. Extended detention requires judicial approval."
        },
        {
          myth: "You must answer all police questions after arrest.",
          fact: "You have the right to remain silent. Anything you say can be used against you. Always consult a lawyer before making any statement."
        }
      ],
      resources: [
        { title: "BNSS 2023 - Arrest Provisions", link: "#" },
        { title: "NALSA Legal Aid Helpline: 15100", link: "#" },
        { title: "How to Apply for Bail - Guide", link: "#" }
      ]
    }
  },
  {
    id: 'pocso-child-protection',
    title: 'Child Protection under POCSO',
    category: 'Your Rights',
    icon: Users,
    tag: 'Child Rights',
    description: 'Understanding the Protection of Children from Sexual Offences Act and how to report abuse.',
    fullContent: {
      definition: "The Protection of Children from Sexual Offences (POCSO) Act, 2012 is a comprehensive law that protects children under 18 years from sexual abuse and exploitation. It defines various forms of sexual offences and prescribes stringent punishments, while also establishing child-friendly procedures for reporting and trial.",
      applicability: [
        "Any child under 18 years of age",
        "Cases of sexual assault, harassment, or exploitation",
        "Pornography involving minors",
        "Offences committed by family members, teachers, or strangers"
      ],
      steps: [
        {
          title: "Report Immediately",
          description: "Any person aware of a POCSO offence is legally obligated to report it to the Special Juvenile Police Unit (SJPU) or local police. Failure to report is itself an offence."
        },
        {
          title: "Contact Childline",
          description: "Call Childline at 1098 (free, 24/7) for immediate assistance, counselling, and help with reporting."
        },
        {
          title: "Medical Examination",
          description: "The child must be medically examined by a female doctor at a government hospital. The examination must be conducted in a child-friendly manner."
        },
        {
          title: "Special Court Trial",
          description: "POCSO cases are tried in designated Special Courts to ensure speedy justice. The child's identity is kept confidential throughout the process."
        }
      ],
      misconceptions: [
        {
          myth: "POCSO only applies to girl children.",
          fact: "POCSO is gender-neutral and protects all children — boys, girls, and transgender children — under 18 years of age."
        },
        {
          myth: "If the abuser is a family member, it's better to stay quiet.",
          fact: "Most POCSO cases involve known persons. Reporting is mandatory and the law provides full protection to the child and the reporting person."
        }
      ],
      resources: [
        { title: "Childline Helpline: 1098", link: "#" },
        { title: "POCSO Act 2012 Full Text", link: "#" },
        { title: "NCPCR - Child Rights Commission", link: "#" }
      ]
    }
  },
  {
    id: 'motor-vehicle-accident-rights',
    title: 'Rights After a Road Accident',
    category: 'Common Laws',
    icon: Car,
    tag: 'Motor Vehicle Law',
    description: 'What to do legally after a road accident — compensation, FIR, and insurance claims.',
    fullContent: {
      definition: "The Motor Vehicles Act, 1988 and its 2019 amendment provide a comprehensive framework for road accident victims to claim compensation. The Motor Accident Claims Tribunal (MACT) is a fast-track court specifically for accident compensation cases.",
      applicability: [
        "Victims of road accidents involving motor vehicles",
        "Family members of deceased accident victims",
        "Hit-and-run accident victims",
        "Pedestrians and cyclists injured by vehicles"
      ],
      steps: [
        {
          title: "Call 112 and Seek Medical Help",
          description: "Ensure the injured receive immediate medical attention. Any person helping an accident victim is protected from legal liability under the Good Samaritan Law."
        },
        {
          title: "File an FIR",
          description: "Report the accident at the nearest police station. Get a copy of the FIR — it is essential for insurance and tribunal claims."
        },
        {
          title: "Notify the Insurance Company",
          description: "Inform the vehicle's insurance company within 24-48 hours. Collect the third-party insurance details of the offending vehicle."
        },
        {
          title: "File a Claim Before MACT",
          description: "Approach the Motor Accident Claims Tribunal in your district. You can claim compensation for medical expenses, loss of income, pain, and suffering."
        }
      ],
      misconceptions: [
        {
          myth: "You can only claim if the other driver is insured.",
          fact: "Hit-and-run victims can claim from the Solatium Fund managed by the government even if the vehicle is untraced or uninsured."
        },
        {
          myth: "You need a lawyer to file a MACT claim.",
          fact: "You can file a claim yourself before the MACT. However, a lawyer can help maximise your compensation amount."
        }
      ],
      resources: [
        { title: "Motor Vehicles Act 2019 Amendment", link: "#" },
        { title: "MACT Claim Filing Guide", link: "#" },
        { title: "Good Samaritan Law - MoRTH Guidelines", link: "#" }
      ]
    }
  },
  {
    id: 'property-registration-rights',
    title: 'Property Registration & Ownership',
    category: 'Common Laws',
    icon: Building2,
    tag: 'Property Law',
    description: 'How to legally register property, verify ownership, and protect against fraud.',
    fullContent: {
      definition: "The Registration Act, 1908 and the Transfer of Property Act, 1882 govern how immovable property is bought, sold, and transferred in India. Registering a property is mandatory for transactions above ₹100 and is the only legally recognised proof of ownership.",
      applicability: [
        "Purchase or sale of land and buildings",
        "Gift deeds and inheritance transfers",
        "Long-term lease agreements (above 11 months)",
        "Mortgage and loan against property"
      ],
      steps: [
        {
          title: "Verify Title and Encumbrance",
          description: "Before buying, obtain an Encumbrance Certificate (EC) from the Sub-Registrar's office to confirm the property has no pending loans or disputes."
        },
        {
          title: "Pay Stamp Duty",
          description: "Stamp duty (varies by state, typically 4-7% of property value) must be paid before registration. Underpayment can make the document legally invalid."
        },
        {
          title: "Register at Sub-Registrar's Office",
          description: "Both buyer and seller must be present with original documents, identity proof, and two witnesses. The deed is registered and a receipt issued."
        },
        {
          title: "Mutate the Property",
          description: "After registration, apply for mutation at the local municipal body or revenue office to update government records in your name."
        }
      ],
      misconceptions: [
        {
          myth: "A notarised agreement is enough to prove ownership.",
          fact: "Only a registered sale deed is legally valid proof of property ownership. Notarised documents have no legal standing for immovable property."
        },
        {
          myth: "Verbal agreements for property are binding.",
          fact: "Under the Transfer of Property Act, any transfer of immovable property worth more than ₹100 must be in writing and registered."
        }
      ],
      resources: [
        { title: "DORIS - Property Registration Portal", link: "#" },
        { title: "Encumbrance Certificate Guide", link: "#" },
        { title: "Stamp Duty Calculator by State", link: "#" }
      ]
    }
  },
  {
    id: 'right-to-education',
    title: 'Right to Education (RTE)',
    category: 'Your Rights',
    icon: GraduationCap,
    tag: 'Education Law',
    description: 'Every child between 6-14 years has a fundamental right to free and compulsory education.',
    fullContent: {
      definition: "The Right of Children to Free and Compulsory Education Act, 2009 (RTE Act) makes education a fundamental right under Article 21-A of the Constitution for all children aged 6 to 14 years. It mandates free education in neighbourhood schools and reserves 25% seats in private schools for economically weaker sections.",
      applicability: [
        "All children aged 6 to 14 years",
        "Children from economically weaker sections (EWS) seeking private school admission",
        "Out-of-school children who need age-appropriate admission",
        "Children with disabilities seeking inclusive education"
      ],
      steps: [
        {
          title: "Identify Your Neighbourhood School",
          description: "Every child is entitled to admission in a government school within 1 km (for Classes 1-5) or 3 km (for Classes 6-8) of their residence."
        },
        {
          title: "Apply for EWS Quota in Private Schools",
          description: "Apply online through your state's RTE portal during the admission window (usually February-April). Submit income and residence proof."
        },
        {
          title: "Report Denial of Admission",
          description: "If a school denies admission, file a complaint with the District Education Officer or the State Commission for Protection of Child Rights (SCPCR)."
        },
        {
          title: "Ensure No Capitation Fee is Charged",
          description: "Under RTE, no school can charge a capitation fee or conduct a screening test for admission. Report violations to the Block Education Officer."
        }
      ],
      misconceptions: [
        {
          myth: "RTE only applies to government schools.",
          fact: "Private unaided schools must reserve 25% of seats in Class 1 for EWS children and cannot charge them any fees."
        },
        {
          myth: "A child can be expelled for not paying fees.",
          fact: "No child can be expelled, held back, or given corporal punishment under the RTE Act. Schools violating this face penalties."
        }
      ],
      resources: [
        { title: "RTE Portal - rte25.nic.in", link: "#" },
        { title: "NCPCR RTE Grievance Portal", link: "#" },
        { title: "RTE Act 2009 Full Text", link: "#" }
      ]
    }
  },
  {
    id: 'environmental-rights',
    title: 'Environmental Rights & Protection',
    category: 'Your Rights',
    icon: Leaf,
    tag: 'Environmental Law',
    description: 'Your right to a clean environment and how to report pollution and environmental violations.',
    fullContent: {
      definition: "The right to a clean and healthy environment is recognised as part of the right to life under Article 21 of the Indian Constitution. The Environment Protection Act, 1986, along with the Air and Water Pollution Acts, empowers citizens to report violations and seek remedies through the National Green Tribunal (NGT).",
      applicability: [
        "Industrial pollution affecting air, water, or soil",
        "Illegal construction in eco-sensitive zones",
        "Deforestation and encroachment on forest land",
        "Noise pollution beyond permissible limits",
        "Improper disposal of hazardous waste"
      ],
      steps: [
        {
          title: "Document the Violation",
          description: "Collect evidence — photographs, videos, water/air samples if possible, and records of dates and locations of the violation."
        },
        {
          title: "File a Complaint with CPCB/SPCB",
          description: "Report to the Central Pollution Control Board (CPCB) or your State Pollution Control Board (SPCB). Many boards have online complaint portals."
        },
        {
          title: "Approach the National Green Tribunal",
          description: "The NGT is a specialised court for environmental disputes. Any person can file a petition before the NGT without needing to prove personal harm."
        },
        {
          title: "File a PIL",
          description: "For large-scale environmental violations, a Public Interest Litigation (PIL) can be filed in the High Court or Supreme Court by any citizen."
        }
      ],
      misconceptions: [
        {
          myth: "Only directly affected people can complain about pollution.",
          fact: "Any citizen can file a complaint or petition before the NGT for environmental violations, even if they are not personally affected."
        },
        {
          myth: "Environmental cases take decades to resolve.",
          fact: "The NGT is mandated to dispose of cases within 6 months. It has passed several landmark orders within weeks of filing."
        }
      ],
      resources: [
        { title: "National Green Tribunal - greentribunal.gov.in", link: "#" },
        { title: "CPCB Complaint Portal", link: "#" },
        { title: "Environment Protection Act 1986", link: "#" }
      ]
    }
  },
  {
    id: 'banking-financial-rights',
    title: 'Banking & Financial Rights',
    category: 'Common Laws',
    icon: Banknote,
    tag: 'Financial Law',
    description: 'Know your rights as a bank customer — against fraud, mis-selling, and unfair charges.',
    fullContent: {
      definition: "The Reserve Bank of India (RBI) has established a comprehensive framework to protect bank customers. The RBI Integrated Ombudsman Scheme, 2021 provides a free, fast grievance redressal mechanism for complaints against banks, NBFCs, and payment service providers.",
      applicability: [
        "Unauthorised transactions and bank fraud",
        "Mis-selling of insurance or investment products",
        "Unfair loan charges and hidden fees",
        "Failure to credit funds or close accounts",
        "UPI and digital payment disputes"
      ],
      steps: [
        {
          title: "Complain to Your Bank First",
          description: "All banks must have a grievance redressal mechanism. File a written complaint and get an acknowledgement. The bank must respond within 30 days."
        },
        {
          title: "Escalate to Banking Ombudsman",
          description: "If unsatisfied or no response within 30 days, file a complaint at cms.rbi.org.in under the RBI Integrated Ombudsman Scheme — it's free of charge."
        },
        {
          title: "Report UPI Fraud Immediately",
          description: "For UPI fraud, call 1930 (Cyber Crime Helpline) immediately. Also report on your bank's app and the NPCI dispute portal."
        },
        {
          title: "Approach Consumer Forum",
          description: "Banking disputes can also be filed before the Consumer Disputes Redressal Commission as deficiency of service."
        }
      ],
      misconceptions: [
        {
          myth: "Banks are not liable for unauthorised transactions.",
          fact: "RBI guidelines hold banks liable for unauthorised transactions if reported within 3 days. You are entitled to a full refund in most cases."
        },
        {
          myth: "You must accept all bank charges without question.",
          fact: "Banks must disclose all charges upfront. Hidden or undisclosed charges can be challenged before the Banking Ombudsman."
        }
      ],
      resources: [
        { title: "RBI Ombudsman Portal - cms.rbi.org.in", link: "#" },
        { title: "RBI Customer Education - rbi.org.in", link: "#" },
        { title: "Cyber Crime Helpline: 1930", link: "#" }
      ]
    }
  },
  {
    id: 'pil-public-interest-litigation',
    title: 'Filing a Public Interest Litigation',
    category: 'Your Rights',
    icon: Landmark,
    tag: 'Constitutional Law',
    description: 'How any citizen can approach the Supreme Court or High Court for public causes.',
    fullContent: {
      definition: "A Public Interest Litigation (PIL) is a legal tool that allows any citizen to approach the Supreme Court (under Article 32) or a High Court (under Article 226) to seek justice for a public cause — even if they are not personally affected. It is one of the most powerful instruments of judicial activism in India.",
      applicability: [
        "Violation of fundamental rights of a group of people",
        "Environmental degradation and pollution",
        "Government inaction on public health or safety",
        "Corruption and misuse of public funds",
        "Rights of prisoners, bonded labourers, or marginalised communities"
      ],
      steps: [
        {
          title: "Identify the Public Issue",
          description: "The issue must affect the public at large or a disadvantaged group. Personal disputes or private grievances are not eligible for PIL."
        },
        {
          title: "Draft the Petition",
          description: "The PIL petition must clearly state the facts, the fundamental rights violated, and the relief sought. Attach supporting evidence and news reports."
        },
        {
          title: "File Before the Appropriate Court",
          description: "File before the Supreme Court for national issues or the relevant High Court for state-level issues. Pay the nominal court fee."
        },
        {
          title: "Attend Hearings",
          description: "The court will issue notices to the government and hear both sides. Courts can appoint amicus curiae (friend of the court) to assist in complex cases."
        }
      ],
      misconceptions: [
        {
          myth: "Only lawyers can file a PIL.",
          fact: "Any citizen can file a PIL. Courts have even treated letters and postcards from ordinary citizens as PILs in matters of public importance."
        },
        {
          myth: "PILs are only for big national issues.",
          fact: "High Courts regularly admit PILs on local issues like pothole-ridden roads, illegal construction, and hospital negligence."
        }
      ],
      resources: [
        { title: "Supreme Court of India - sci.gov.in", link: "#" },
        { title: "PIL Filing Guide - Bar Council of India", link: "#" },
        { title: "Landmark PIL Judgements in India", link: "#" }
      ]
    }
  }
];
