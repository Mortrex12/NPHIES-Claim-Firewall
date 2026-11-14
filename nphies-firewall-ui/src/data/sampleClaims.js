export const SAMPLE_CLAIMS = [
  {
    id: "CLM-SA-2026-081",
    titleAr: "أشعة رنين مغناطيسي للفقرات القطنية",
    titleEn: "Lumbar Spine MRI with Contrast",
    specialtyAr: "الأشعة التشخيصية",
    specialtyEn: "Radiology",
    patient: {
      name: "سعود فيصل الحربي",
      nationalId: "1083920197",
      age: 42,
      gender: "male"
    },
    provider: {
      name: "مجمع النخبة الطبي المتقدم - الرياض",
      nphiesProviderId: "PRV-RUH-88219",
      practitionerName: "د. أحمد المنصور",
      practitionerLicense: "MD-1082941"
    },
    insurance: {
      payerId: "PAYER-BUPA-01",
      payerName: "Bupa Arabia",
      memberId: "BUP-90218412",
      policyNumber: "POL-CORP-4881",
      policyPeriod: { start: "2026-01-01", end: "2026-12-31" },
      preAuthRef: "", // Trigger Rule 1
      preAuthPeriod: { start: "2026-11-01", end: "2026-11-30" }
    },
    serviceDate: "2026-11-12",
    diagnoses: [
      {
        sequence: 1,
        code: "M54.5",
        description: "Low back pain",
        isPrimary: true
      }
    ],
    items: [
      {
        sequence: 1,
        code: "70553",
        description: "MRI Lumbar Spine with and without contrast",
        quantity: 1,
        unitPrice: 2400.0,
        net: 2400.0
      }
    ],
    supportingInfo: [],
    totalAmount: 2400.0,
    notes: "Patient reports chronic severe lower back radiculopathy > 6 weeks."
  },
  {
    id: "CLM-SA-2026-094",
    titleAr: "عملية استئصال المرارة بالمنظار",
    titleEn: "Laparoscopic Cholecystectomy with Laparotomy",
    specialtyAr: "الجراحة العامة",
    specialtyEn: "General Surgery",
    patient: {
      name: "فاطمة محمد العتيبي",
      nationalId: "1083920197",
      age: 36,
      gender: "female"
    },
    provider: {
      name: "مستشفى السلام الدولي - جدة",
      nphiesProviderId: "PRV-JED-10293",
      practitionerName: "د. هدى القرشي",
      practitionerLicense: "MD-4491028"
    },
    insurance: {
      payerId: "PAYER-TAWUNIYA-02",
      payerName: "Tawuniya",
      memberId: "TAW-88192031",
      policyNumber: "POL-VIP-9002",
      policyPeriod: { start: "2026-01-01", end: "2026-12-31" },
      preAuthRef: "AUTH-TAW-9921-2026",
      preAuthPeriod: { start: "2026-11-01", end: "2026-11-20" }
    },
    serviceDate: "2026-11-10",
    diagnoses: [
      {
        sequence: 1,
        code: "K80.20",
        description: "Calculus of gallbladder without cholecystitis",
        isPrimary: true
      }
    ],
    items: [
      {
        sequence: 1,
        code: "47562",
        description: "Laparoscopy, surgical, cholecystectomy",
        quantity: 1,
        unitPrice: 6500.0,
        net: 6500.0
      },
      {
        sequence: 2,
        code: "49000", // Unbundling
        description: "Exploratory laparotomy (Incompatible unbundled code)",
        quantity: 1,
        unitPrice: 1800.0,
        net: 1800.0
      }
    ],
    supportingInfo: [], // Missing high-cost operative note
    totalAmount: 8300.0,
    notes: "Elective laparoscopy for acute biliary colic."
  },
  {
    id: "CLM-SA-2026-115",
    titleAr: "استشارة طبية مع كود أطفال لشيخ مسن",
    titleEn: "Geriatric Patient with Pediatric Diagnosis Code",
    specialtyAr: "الباطنية",
    specialtyEn: "Internal Medicine",
    patient: {
      name: "عبدالرحمن إبراهيم الدوسري",
      nationalId: "1099999999", // Bad Luhn Checksum
      age: 71,
      gender: "male"
    },
    provider: {
      name: "مجمع العناية الممتدة - الدمام",
      nphiesProviderId: "PRV-DMM-40112",
      practitionerName: "د. طارق السعدون",
      practitionerLicense: "MD-9910283"
    },
    insurance: {
      payerId: "PAYER-MEDGULF-03",
      payerName: "Medgulf",
      memberId: "MED-77129401",
      policyNumber: "POL-SME-1120",
      policyPeriod: { start: "2026-01-01", end: "2026-12-31" },
      preAuthRef: "AUTH-MED-1029",
      preAuthPeriod: { start: "2026-11-01", end: "2026-11-30" }
    },
    serviceDate: "2026-11-14",
    diagnoses: [
      {
        sequence: 1,
        code: "P07.1", // Pediatric neonate preterm code
        description: "Other low birth weight infant",
        isPrimary: true
      }
    ],
    items: [
      {
        sequence: 1,
        code: "99213",
        description: "Office or outpatient visit moderate",
        quantity: 1,
        unitPrice: 350.0,
        net: 350.0
      }
    ],
    supportingInfo: [],
    totalAmount: 350.0,
    notes: "Follow-up consultation."
  },
  {
    id: "CLM-SA-2026-142",
    titleAr: "جلسات علاج طبيعي وتأهيل مكثف",
    titleEn: "Intensive Physical Therapy & Rehab",
    specialtyAr: "العلاج الطبيعي والتأهيل",
    specialtyEn: "Physiotherapy",
    patient: {
      name: "خالد سليمان الغامدي",
      nationalId: "1083920197",
      age: 29,
      gender: "male"
    },
    provider: {
      name: "مركز النخاع للعلاج الطبيعي - الخبر",
      nphiesProviderId: "PRV-KHB-66102",
      practitionerName: "د. فيصل الزهراني",
      practitionerLicense: "MD-3301928"
    },
    insurance: {
      payerId: "PAYER-BUPA-01",
      payerName: "Bupa Arabia",
      memberId: "BUP-44102931",
      policyNumber: "POL-CORP-4881",
      policyPeriod: { start: "2026-01-01", end: "2026-12-31" },
      preAuthRef: "AUTH-BUP-8812-2026",
      preAuthPeriod: { start: "2026-11-01", end: "2026-11-30" }
    },
    serviceDate: "2026-11-13",
    diagnoses: [
      {
        sequence: 1,
        code: "M25.5",
        description: "Pain in joint, unspecified",
        isPrimary: true
      }
    ],
    items: [
      {
        sequence: 1,
        code: "97110",
        description: "Therapeutic exercises, each 15 minutes",
        quantity: 2,
        unitPrice: 300.0,
        net: 600.0
      },
      {
        sequence: 2,
        code: "97010",
        description: "Modality hot/cold packs",
        quantity: 1,
        unitPrice: 150.0,
        net: 150.0
      }
    ],
    supportingInfo: [],
    totalAmount: 750.0,
    notes: "Post-sports injury rehabilitation."
  },
  {
    id: "CLM-SA-2026-189",
    titleAr: "جراحة أسنان وقلع ضرس عقل مطمور",
    titleEn: "Surgical Extraction of Impacted Wisdom Tooth",
    specialtyAr: "طب وجراحة الأسنان",
    specialtyEn: "Dentistry",
    patient: {
      name: "نورة عبدالعزيز القحطاني",
      nationalId: "1083920197",
      age: 25,
      gender: "female"
    },
    provider: {
      name: "عيادات اللؤلؤ لطب الأسنان - الرياض",
      nphiesProviderId: "PRV-RUH-33910",
      practitionerName: "د. ريم الشمري",
      practitionerLicense: "MD-5510293"
    },
    insurance: {
      payerId: "PAYER-ALRAJHI-04",
      payerName: "Al-Rajhi Takaful",
      memberId: "RAJ-11029381",
      policyNumber: "POL-IND-2021",
      policyPeriod: { start: "2026-01-01", end: "2026-12-31" },
      preAuthRef: "AUTH-RAJ-5512",
      preAuthPeriod: { start: "2026-11-01", end: "2026-11-30" }
    },
    serviceDate: "2026-11-12",
    diagnoses: [
      {
        sequence: 1,
        code: "K01.1",
        description: "Impacted teeth",
        isPrimary: true
      }
    ],
    items: [
      {
        sequence: 1,
        code: "D7210",
        description: "Surgical removal of erupted tooth requiring bone removal",
        quantity: 1,
        unitPrice: 1200.0,
        net: 1200.0,
        requiresTooth: true,
        toothNumber: "99" // Invalid FDI
      }
    ],
    supportingInfo: [
      {
        sequence: 1,
        category: "x-ray",
        code: "OPG-XRAY-44",
        description: "Panoramic OPG dental X-ray showing impacted mandibular 3rd molar"
      }
    ],
    totalAmount: 1200.0,
    notes: "Impacted wisdom tooth extraction under local anesthesia."
  },
  {
    id: "CLM-SA-2026-200",
    titleAr: "متابعة قلب وأوعية دموية وتخطيط ECG",
    titleEn: "Cardiology Follow-up with 12-Lead ECG",
    specialtyAr: "أمراض القلب والأوعية الدموية",
    specialtyEn: "Cardiology",
    patient: {
      name: "سلطان عبدالله الدوسري",
      nationalId: "1083920197",
      age: 58,
      gender: "male"
    },
    provider: {
      name: "مركز الملك فهد لأمراض القلب - الرياض",
      nphiesProviderId: "PRV-RUH-00192",
      practitionerName: "استشاري د. ماجد السبيعي",
      practitionerLicense: "MD-1082941"
    },
    insurance: {
      payerId: "PAYER-TAWUNIYA-02",
      payerName: "Tawuniya",
      memberId: "TAW-55019284",
      policyNumber: "POL-CORP-8800",
      policyPeriod: { start: "2026-01-01", end: "2026-12-31" },
      preAuthRef: "AUTH-TAW-7719-2026",
      preAuthPeriod: { start: "2026-11-01", end: "2026-11-30" }
    },
    serviceDate: "2026-11-14",
    diagnoses: [
      {
        sequence: 1,
        code: "I10",
        description: "Essential (primary) hypertension",
        isPrimary: true
      },
      {
        sequence: 2,
        code: "E78.0",
        description: "Pure hypercholesterolaemia",
        isPrimary: false
      }
    ],
    items: [
      {
        sequence: 1,
        code: "99214",
        description: "Office outpatient visit moderate complexity",
        quantity: 1,
        unitPrice: 450.0,
        net: 450.0
      },
      {
        sequence: 2,
        code: "93000",
        description: "Electrocardiogram, routine ECG with at least 12 leads",
        quantity: 1,
        unitPrice: 250.0,
        net: 250.0
      }
    ],
    supportingInfo: [
      {
        sequence: 1,
        category: "ecg-strip",
        code: "ECG-PDF-2026-01",
        description: "12-Lead ECG strip showing normal sinus rhythm"
      },
      {
        sequence: 2,
        category: "lab-report",
        code: "LAB-LIPID-99",
        description: "Fasting lipid profile panel results"
      }
    ],
    totalAmount: 700.0,
    notes: "Routine annual cardiac checkup."
  }
];
