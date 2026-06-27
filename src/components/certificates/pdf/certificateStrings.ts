import type { CertificateLang } from "./pdfUtils";

export interface CertStrings {
  collegeCode: (code: string) => string;
  phone: string;
  email: string;
  bonafideTitle: string;
  tcTitle: string;
  domicileTitle: string;
  no: string;
  date: string;
  place: string;
  refNo: string;
  registerNo: string;
  tcNo: string;
  domicileNo: string;
  principal: string;
  classTeacher: string;
  clerk: string;
  officeSeal: string;
  blank: string;
  bonafideBody: (a: {
    name: string;
    registerNo: string;
    course: string;
    cls: string;
    academicYear: string;
    dob: string;
    dobWords: string;
    caste: string;
    conduct: string;
  }) => string;
  bonafidePurposeLine: string;
  bonafidePurpose: (purpose: string) => string;
  tcRowName: (name: string) => string;
  tcRowFather: (father: string) => string;
  tcRowMother: (mother: string) => string;
  tcNationality: (nat: string) => string;
  tcMotherTongue: (mt: string) => string;
  tcReligionCasteSub: (religion: string, caste: string, sub: string) => string;
  tcBirthplaceTaluka: (pob: string, taluka: string) => string;
  tcDistrictStateCountry: (district: string, state: string, country: string) => string;
  tcDobFigures: (d: string) => string;
  tcDobWords: (w: string) => string;
  tcPrevSchool: (s: string) => string;
  tcAdmissionClass: (date: string, cls: string) => string;
  tcProgressConduct: (progress: string, conduct: string) => string;
  tcLeavingDate: (d: string) => string;
  tcStudyingSince: (s: string) => string;
  tcLeavingReason: (r: string) => string;
  tcRemarks: (r: string) => string;
  tcClosing: (genReg: string) => string;
  domicileBody: (a: {
    name: string;
    father: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
    years: string;
    dob: string;
  }) => string;
  domicileClosing: string;
}

const en: CertStrings = {
  collegeCode: (c) => `College Code: ${c}`,
  phone: "Phone",
  email: "Email",
  bonafideTitle: "BONAFIDE CERTIFICATE",
  tcTitle: "SCHOOL LEAVING CERTIFICATE",
  domicileTitle: "DOMICILE CERTIFICATE",
  no: "No",
  date: "Date",
  place: "Place",
  refNo: "No",
  registerNo: "Register No / PRN",
  tcNo: "Certificate No",
  domicileNo: "Domicile No",
  principal: "Principal / Head Master",
  classTeacher: "Class Teacher",
  clerk: "Clerk",
  officeSeal: "Office Seal",
  blank: "________________",
  bonafideBody: (a) =>
    `This is to certify that Mr./Miss. ${a.name} was/is a bonafide student of this institution, ` +
    `Register No. ${a.registerNo}, studying in ${a.course}${a.cls ? " (" + a.cls + ")" : ""} ` +
    `during the academic year ${a.academicYear}. ` +
    `His/Her Date of Birth as per the school register is ${a.dob}${a.dobWords ? " (" + a.dobWords + ")" : ""}. ` +
    `His/Her caste as per our register is ${a.caste}. ` +
    `To the best of our knowledge, he/she bears a good moral character (${a.conduct}).`,
  bonafidePurposeLine: "This certificate is issued on request for the purpose mentioned below:",
  bonafidePurpose: (p) => `Purpose / Remarks: ${p}`,
  tcRowName: (n) => `1) Name of the Student: ${n}`,
  tcRowFather: (f) => `   Father's Name: ${f}`,
  tcRowMother: (m) => `   Mother's Name: ${m}`,
  tcNationality: (n) => `2) Nationality: ${n}`,
  tcMotherTongue: (mt) => `3) Mother Tongue: ${mt}`,
  tcReligionCasteSub: (r, c, s) => `4) Religion: ${r}    5) Caste: ${c}    6) Sub-Caste: ${s}`,
  tcBirthplaceTaluka: (p, t) => `7) Place of Birth (Village/Town): ${p}    8) Taluka: ${t}`,
  tcDistrictStateCountry: (d, s, c) => `9) District: ${d}    10) State: ${s}    11) Country: ${c}`,
  tcDobFigures: (d) => `12) Date of Birth (in figures): ${d}`,
  tcDobWords: (w) => `    Date of Birth (in words): ${w}`,
  tcPrevSchool: (s) => `13) Previous School & Class: ${s}`,
  tcAdmissionClass: (d, c) => `14) Date of Admission in this School: ${d}    15) Class: ${c}`,
  tcProgressConduct: (p, c) => `16) Progress in Studies: ${p}    17) Conduct: ${c}`,
  tcLeavingDate: (d) => `18) Date of Leaving School: ${d}`,
  tcStudyingSince: (s) => `19) Class studied in and since when: ${s}`,
  tcLeavingReason: (r) => `20) Reason for Leaving School: ${r}`,
  tcRemarks: (r) => `21) Remarks: ${r}`,
  tcClosing: (g) =>
    `Certified that the above information is as per General Register No. ${g} of this institution.`,
  domicileBody: (a) =>
    `This is to certify that Mr./Miss. ${a.name}, son/daughter of ${a.father}, ` +
    `is a permanent resident of Village/Town ${a.village}, Taluka ${a.taluka}, District ${a.district}, ${a.state}. ` +
    `His/Her Date of Birth as per the records is ${a.dob}. ` +
    `He/She has been residing at the above place for ${a.years} years and is a domicile of ${a.state}.`,
  domicileClosing: "This certificate is issued for education / official requirements.",
};

const mr: CertStrings = {
  collegeCode: (c) => `महाविद्यालय संकेतांक: ${c}`,
  phone: "दूरध्वनी",
  email: "ईमेल",
  bonafideTitle: "बोनाफाईड प्रमाणपत्र",
  tcTitle: "शाळा सोडल्याचे प्रमाणपत्र",
  domicileTitle: "अधिवास प्रमाणपत्र",
  no: "क्रमांक",
  date: "दिनांक",
  place: "ठिकाण",
  refNo: "क्रमांक",
  registerNo: "नोंदणी क्रमांक / पी.आर.एन.",
  tcNo: "प्रमाणपत्र क्रमांक",
  domicileNo: "अधिवास क्रमांक",
  principal: "प्राचार्य / मुख्याध्यापक",
  classTeacher: "वर्गशिक्षक",
  clerk: "लिपिक",
  officeSeal: "कार्यालयीन शिक्का",
  blank: "________________",
  bonafideBody: (a) =>
    `प्रमाणित करण्यात येते की श्री/कु. ${a.name} हा/ही या संस्थेचा/संस्थेची नियमित विद्यार्थी/विद्यार्थिनी आहे/होता/होती. ` +
    `नोंदणी क्रमांक ${a.registerNo} असून तो/ती ${a.course}${a.cls ? " (" + a.cls + ")" : ""} मध्ये शैक्षणिक वर्ष ${a.academicYear} दरम्यान शिकत आहे/होता/होती. ` +
    `शालेय नोंदीनुसार जन्म दिनांक ${a.dob}${a.dobWords ? " (" + a.dobWords + ")" : ""} आहे. ` +
    `नोंदीनुसार जात ${a.caste} आहे. आमच्या माहितीनुसार त्याचे/तिचे वर्तन ${a.conduct} आहे.`,
  bonafidePurposeLine: "सदर प्रमाणपत्र विद्यार्थ्याच्या विनंतीनुसार खालील कारणासाठी देण्यात येत आहे:",
  bonafidePurpose: (p) => `कारण / शेरा: ${p}`,
  tcRowName: (n) => `१) विद्यार्थ्याचे नाव: ${n}`,
  tcRowFather: (f) => `   वडिलांचे / पालकाचे नाव: ${f}`,
  tcRowMother: (m) => `   आईचे नाव: ${m}`,
  tcNationality: (n) => `२) राष्ट्रीयत्व: ${n}`,
  tcMotherTongue: (mt) => `३) मातृभाषा: ${mt}`,
  tcReligionCasteSub: (r, c, s) => `४) धर्म: ${r}    ५) जात: ${c}    ६) पोटजात: ${s}`,
  tcBirthplaceTaluka: (p, t) => `७) जन्मस्थळ (गाव/शहर): ${p}    ८) तालुका: ${t}`,
  tcDistrictStateCountry: (d, s, c) => `९) जिल्हा: ${d}    १०) राज्य: ${s}    ११) देश: ${c}`,
  tcDobFigures: (d) => `१२) जन्म दिनांक (अंकी): ${d}`,
  tcDobWords: (w) => `    जन्म दिनांक (अक्षरी): ${w}`,
  tcPrevSchool: (s) => `१३) पूर्वीची शाळा / महाविद्यालय व वर्ग: ${s}`,
  tcAdmissionClass: (d, c) => `१४) या संस्थेत प्रवेश घेतल्याचा दिनांक: ${d}    १५) वर्ग: ${c}`,
  tcProgressConduct: (p, c) => `१६) अभ्यासातील प्रगती: ${p}    १७) वर्तन: ${c}`,
  tcLeavingDate: (d) => `१८) संस्था सोडल्याचा दिनांक: ${d}`,
  tcStudyingSince: (s) => `१९) कोणत्या वर्गात शिकत होता/होती व केव्हापासून: ${s}`,
  tcLeavingReason: (r) => `२०) संस्था सोडण्याचे कारण: ${r}`,
  tcRemarks: (r) => `२१) शेरा: ${r}`,
  tcClosing: (g) =>
    `प्रमाणित करण्यात येते की वरील सर्व माहिती संस्थेच्या जनरल रजिस्टर क्रमांक ${g} नुसार खरी आहे.`,
  domicileBody: (a) =>
    `प्रमाणित करण्यात येते की श्री/कु. ${a.name}, वडील / पालक ${a.father}, ` +
    `हा/ही गाव/शहर ${a.village}, तालुका ${a.taluka}, जिल्हा ${a.district}, ${a.state} येथील कायमचा/कायमची रहिवासी आहे. ` +
    `नोंदीनुसार जन्म दिनांक ${a.dob} आहे. ` +
    `तो/ती वरील ठिकाणी ${a.years} वर्षांपासून वास्तव्यास असून ${a.state} राज्याचा/राज्याची अधिवासी आहे.`,
  domicileClosing: "सदर प्रमाणपत्र शैक्षणिक / शासकीय कामासाठी विद्यार्थ्याच्या विनंतीनुसार देण्यात येत आहे.",
};

export function getCertStrings(lang: CertificateLang): CertStrings {
  return lang === "mr" ? mr : en;
}
