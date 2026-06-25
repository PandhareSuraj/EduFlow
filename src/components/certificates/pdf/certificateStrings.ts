import type { CertificateLang } from "./pdfUtils";

export interface CertStrings {
  // Header
  collegeCode: (code: string) => string;
  phone: string;
  email: string;
  // Titles
  bonafideTitle: string;
  tcTitle: string;
  domicileTitle: string;
  // Common
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
  // Bonafide (matches sample "बोनाफाईड प्रमाणपत्र" / Character Certificate)
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
  // TC — official Maharashtra "शाळा सोडण्याचे प्रमाणपत्र" 21-point format
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
  // Domicile
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
    `Certified that the above information is as per General Register No. ${g} of this school.`,
  domicileBody: (a) =>
    `This is to certify that Mr./Miss. ${a.name}, son/daughter of ${a.father}, ` +
    `is a permanent resident of Village/Town ${a.village}, Taluka ${a.taluka}, District ${a.district}, ${a.state}. ` +
    `His/Her Date of Birth as per the records is ${a.dob}. ` +
    `He/She has been residing at the above place for ${a.years} years and is a domicile of ${a.state}.`,
  domicileClosing: "This certificate is issued for the purpose of education / official requirements.",
};

const mr: CertStrings = {
  collegeCode: (c) => `महाविद्यालय संकेतांक: ${c}`,
  phone: "दूरध्वनी",
  email: "ईमेल",
  bonafideTitle: "बोनाफाईड प्रमाणपत्र",
  tcTitle: "शाळा सोडण्याचे प्रमाणपत्र",
  domicileTitle: "अधिवास प्रमाणपत्र",
  no: "क्रमांक",
  date: "दिनांक",
  place: "ठिकाण",
  refNo: "क्रमांक",
  registerNo: "प्रवेश क्र.",
  tcNo: "प्रमाणपत्र क्रमांक",
  domicileNo: "अधिवास क्र.",
  principal: "मुख्याध्यापिका",
  classTeacher: "वर्ग शिक्षक",
  clerk: "लिपीक",
  officeSeal: "कार्यालयीन शिक्का",
  blank: "________________",
  bonafideBody: (a) =>
    `प्रमाणित करण्यात येते की, हा/ही विद्यार्थी/विद्यार्थिनी श्री./कु. ${a.name} ` +
    `(प्रवेश क्र. ${a.registerNo}) सन ${a.academicYear} या वर्षी इयत्ता ${a.cls || a.course} ` +
    `या वर्गात शिक्षण घेत आहे/होता. ` +
    `त्याचा/तिचा जन्म दिनांक ${a.dob}${a.dobWords ? " (अक्षरी: " + a.dobWords + ")" : ""} हा आहे ` +
    `व त्याची/तिची जात ${a.caste} आहे. करिता प्रमाणपत्र देण्यात येते. ` +
    `त्याचे/तिचे वर्तन ${a.conduct} आहे.`,
  bonafidePurposeLine: "हा दाखला मागणीनुसार खालील कारणासाठी देण्यात येत आहे:",
  bonafidePurpose: (p) => `कारण / शेरा: ${p}`,
  tcRowName: (n) => `१) विद्यार्थ्याचे नांव: ${n}`,
  tcRowFather: (f) => `   वडिलांचे नांव: ${f}`,
  tcRowMother: (m) => `   आईचे नांव: ${m}`,
  tcNationality: (n) => `२) राष्ट्रीयत्व: ${n}`,
  tcMotherTongue: (mt) => `३) मातृभाषा: ${mt}`,
  tcReligionCasteSub: (r, c, s) => `४) धर्म: ${r}    ५) जात: ${c}    ६) पोटजात: ${s}`,
  tcBirthplaceTaluka: (p, t) => `७) जन्मस्थळ (गांव/शहर): ${p}    ८) तालुका: ${t}`,
  tcDistrictStateCountry: (d, s, c) => `९) जिल्हा: ${d}    १०) राज्य: ${s}    ११) देश: ${c}`,
  tcDobFigures: (d) => `१२) जन्म दिनांक (अंकी): ${d}`,
  tcDobWords: (w) => `    जन्म दिनांक (अक्षरी): ${w}`,
  tcPrevSchool: (s) => `१३) या पूर्वीची शाळा व इयत्ता: ${s}`,
  tcAdmissionClass: (d, c) => `१४) या शाळेत प्रवेश घेतल्याचा दिनांक: ${d}    १५) इयत्ता: ${c}`,
  tcProgressConduct: (p, c) => `१६) अभ्यासातील प्रगती: ${p}    १७) वर्तणूक: ${c}`,
  tcLeavingDate: (d) => `१८) शाळा सोडल्याचा दिनांक: ${d}`,
  tcStudyingSince: (s) => `१९) कोणत्या इयत्तेत शिकत होता व केव्हा पासुन: ${s}`,
  tcLeavingReason: (r) => `२०) शाळा सोडण्याचे कारण: ${r}`,
  tcRemarks: (r) => `२१) शेरा: ${r}`,
  tcClosing: (g) =>
    `दाखला देण्यात येते की, वरील सर्व माहिती शाळेतील जनरल रजिस्टर नं. ${g} प्रमाणे आहे.`,
  domicileBody: (a) =>
    `प्रमाणित करण्यात येते की, श्री./कु. ${a.name}, ${a.father} यांचे/यांची मुलगा/मुलगी, ` +
    `हे/ही गाव/शहर ${a.village}, तालुका ${a.taluka}, जिल्हा ${a.district}, ${a.state} येथील कायमचे रहिवासी आहेत. ` +
    `नोंदीनुसार त्यांची जन्मतारीख ${a.dob} आहे. ` +
    `ते/त्या वरील ठिकाणी ${a.years} वर्षांपासून वास्तव्यास असून ${a.state} राज्याचे अधिवासी आहेत.`,
  domicileClosing: "हा दाखला शैक्षणिक / शासकीय कारणासाठी देण्यात येत आहे.",
};

export function getCertStrings(lang: CertificateLang): CertStrings {
  return lang === "mr" ? mr : en;
}
