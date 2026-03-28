import fs from "fs";

const kn = {
  oe_back: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
  oe_pro: "ಪ್ರೊ ವೈಶಿಷ್ಟ್ಯ",
  oe_title: "ಡೈನಾಮಿಕ್ ಕೇಸ್ ವಿಶ್ಲೇಷಕ",
  oe_subtitle: "ಸಂಕೀರ್ಣ ಪ್ರಕರಣಗಳನ್ನು ಸಲ್ಲಿಸಿ. VidhiSetu AI ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅಪರಾಧಗಳು ಮತ್ತು BNS ವಿಭಾಗಗಳನ್ನು ನಕ್ಷೆ ಮಾಡುತ್ತದೆ.",
  oe_label: "ಕೇಸ್ ಸತ್ಯಗಳು / FIR ಸನ್ನಿವೇಶ",
  oe_placeholder: "ಉದಾ: ನ್ಯಾಯಾಲಯದ ವಿಚಾರಣೆಯ ಸಮಯದಲ್ಲಿ ಸಂತ್ರಸ್ತನಿಗೆ ವಿಷಪ್ರಾಶನ ಮಾಡಲಾಗಿದೆ...",
  oe_try: "ಉದಾಹರಣೆ ಪ್ರಯತ್ನಿಸಿ",
  oe_ex1: "ಕೊಲೆ ಮತ್ತು ಆಸ್ತಿ ವಿವಾದ",
  oe_ex2: "ಕಾರ್ಪೊರೇಟ್ ಬ್ಯಾಂಕ್ ವಂಚನೆ",
  oe_run: "ಆಳವಾದ ವಿಶ್ಲೇಷಣೆ ರನ್ ಮಾಡಿ",
  oe_analyzing: "ಕಾನೂನುಗಳ ವಿಶ್ಲೇಷಣೆ...",
  oe_awaiting: "ಕೇಸ್ ವಿವರಗಳಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ",
  oe_awaiting_sub: "ಅತಿಕ್ರಮಿಸುವ ಅಪರಾಧಗಳು ಮತ್ತು ತೀವ್ರತೆಯನ್ನು ನಿರ್ಣಯಿಸಲು ಎಡಭಾಗದಲ್ಲಿ ಸನ್ನಿವೇಶವನ್ನು ನಮೂದಿಸಿ.",
  oe_matrix: "ಸಂಕೀರ್ಣತೆ ಮ್ಯಾಟ್ರಿಕ್ಸ್",
  oe_severity: "ತೀವ್ರತೆ",
  oe_out_of: "10.0 ರಲ್ಲಿ",
  oe_crimes: "ಗುರುತಿಸಲಾದ ಅಪರಾಧಗಳು",
  oe_bns: "BNS ಕಾನೂನುಗಳು",
  oe_factors: "ಉಲ್ಬಣಗೊಳಿಸುವ ಅಂಶಗಳು",
  oe_assessment: "ಕಾರ್ಯತಂತ್ರದ ಮೌಲ್ಯಮಾಪನ"
};

const ks = {
  oe_back: "گھر واپس گژھیتھ",
  oe_pro: "پرو فیچر",
  oe_title: "ڈائینامک کیس اینالائزر",
  oe_subtitle: "پیچیدہ کیسز جمع کریو۔ ودھی سیتو اے آئی خود بخود جرائم اور بھی این ایس سیکشن میپ کری۔",
  oe_label: "کیس حقائق / ایف آئی آر",
  oe_placeholder: "مثال: عدالتس منز... ",
  oe_try: "مثالس پیٹھ تجربہ کریو",
  oe_ex1: "قتل اور جائیداد تنازعہ",
  oe_ex2: "بینک فراڈ",
  oe_run: "گہرا تجزیہ کریو",
  oe_analyzing: "قوانینک تجزیہ گژھان...",
  oe_awaiting: "کیس تفصیلاتک انتظار",
  oe_awaiting_sub: "بائیں طرف پیچیدہ کیس درج کریو۔",
  oe_matrix: "کمپلیکسٹی میٹرکس",
  oe_severity: "شدت",
  oe_out_of: "10.0 منز",
  oe_crimes: "شناخت شدہ جرائم",
  oe_bns: "بی این ایس قوانین",
  oe_factors: "شدید عوامل",
  oe_assessment: "حکمت عملی تشخیص"
};

const mni = {
  oe_back: "ময়ুমদা হল্লু",
  oe_pro: "প্রো ফীচর",
  oe_title: "ডাইনামিক কেস এনালাইজর",
  oe_subtitle: "অরুবা কেসশিং থাজিল্লক্কু। ৱিধিসেতুনা মশা মথন্তনা ক্রাইম অমসুং BNS সেকশনশিং খঙদোক্কনি।",
  oe_label: "কেস ফ্যাক্টস / FIR সিনেরিও",
  oe_placeholder: "খুদম ওইনা: কোর্ট হিয়ারিং মনুংদা... ",
  oe_try: "খুদম অমা চাংয়েং তৌবিয়ু",
  oe_ex1: "মীহাক অমসুং লমগী খৎন-চৈনবা",
  oe_ex2: "কোর্পোরেট ব্যাংক এমবেজলমেন্ট",
  oe_run: "কুপ্না এনালাইসিস তৌবিয়ু",
  oe_analyzing: "কাঙ্গলোনশিং এনালাইজ তৌরি...",
  oe_awaiting: "কেসকী অকুপ্পা ঙাইরি",
  oe_awaiting_sub: "ওইরকপগী ফিভম অদু লেফ্ট সাইডতা ইনবিয়ু।",
  oe_matrix: "কমপ্লেক্সিতি মেত্রিক্স",
  oe_severity: "সিভিয়ারিটি",
  oe_out_of: "10.0 দগী",
  oe_crimes: "খঙদোক্লবা ক্রাইমশিং",
  oe_bns: "BNS কাঙ্গলোনশিং",
  oe_factors: "অগ্রেভেতিং ফেক্টরশিং",
  oe_assessment: "স্ত্রেটেজিক এনালাইসিস"
};

const data = JSON.parse(fs.readFileSync('data/locales_all.json', 'utf-8'));
data.kn = { ...data.kn, ...kn };
data.ks = { ...data.ks, ...ks };
data.mni = { ...data.mni, ...mni };

fs.writeFileSync('data/locales_all.json', JSON.stringify(data, null, 2), 'utf-8');
console.log('Successfully injected Kannada, Kashmiri, and Manipuri offline dictionaries.');
