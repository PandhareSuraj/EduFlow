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
  officeSeal: string;
  blank: string;
  // Bonafide
  bonafideBody: (a: {
    name: string;
    registerNo: string;
    course: string;
    cls: string;
    academicYear: string;
    dob: string;
    conduct: string;
  }) => string;
  bonafidePurposeLine: string;
  bonafidePurpose: (purpose: string) => string;
  // TC field rows
  tcName: string;
  tcMother: string;
  tcFather: string;
  tcCaste: (caste: string, religion: string) => string;
  tcNationality: (nat: string, pob: string) => string;
  tcDobFigures: string;
  tcDobWords: string;
  tcAdmission: (date: string, cls: string) => string;
  tcLeaving: (date: string, course: string) => string;
  tcSubjects: string;
  tcConduct: string;
  tcRemarks: string;
  tcRemarkBody: (a: {
    appeared: boolean;
    examName: string;
    session: string;
    result: string;
    seatNo: string;
  }) => string;
  tcClosing: string;
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
  tcTitle: "TRANSFER / LEAVING CERTIFICATE",
  domicileTitle: "DOMICILE CERTIFICATE",
  no: "No",
  date: "Date",
  place: "Place",
  refNo: "No",
  registerNo: "Register No / PRN",
  tcNo: "T.C. No",
  domicileNo: "Domicile No",
  principal: "Principal",
  officeSeal: "Office Seal",
  blank: "________________",
  bonafideBody: (a) =>
    `This is to certify that Mr./Miss. ${a.name}, Register No. ${a.registerNo}, ` +
    `is/was a bonafide student of ${a.course}${a.cls ? " (" + a.cls + ")" : ""} ` +
    `in this institution during the academic year ${a.academicYear}. ` +
    `His/Her Date of Birth as per the college register is ${a.dob}. ` +
    `His/Her character and conduct is ${a.conduct}.`,
  bonafidePurposeLine: "This certificate is issued on request for the purpose mentioned below:",
  bonafidePurpose: (p) => `Purpose / Remarks: ${p}`,
  tcName: "1) Name of the Student: ",
  tcMother: "2) Mother's Name: ",
  tcFather: "3) Father's / Guardian Name: ",
  tcCaste: (c, r) => `4) Caste / Sub-Caste: ${c}    Religion: ${r}`,
  tcNationality: (n, p) => `5) Nationality: ${n}    Place of Birth: ${p}`,
  tcDobFigures: "6) Date of Birth (figures): ",
  tcDobWords: "    Date of Birth (in words): ",
  tcAdmission: (d, c) => `7) Date of Admission: ${d}    Class: ${c}`,
  tcLeaving: (d, c) => `8) Date of Leaving: ${d}    Course: ${c}`,
  tcSubjects: "9) Subjects studied: ",
  tcConduct: "10) Conduct: ",
  tcRemarks: "11) Remarks:",
  tcRemarkBody: (a) =>
    `a) He/She ${a.appeared ? "has appeared" : "has not appeared"} for the ${a.examName} examination held in ${a.session} ${
      a.result ? "and has " + a.result : ""
    } under Seat No. ${a.seatNo}.`,
  tcClosing: "Certified that the above information is true as per the college records.",
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
  tcTitle: "स्थानांतर / शाळा सोडल्याचा दाखला",
  domicileTitle: "अधिवास प्रमाणपत्र",
  no: "क्रमांक",
  date: "दिनांक",
  place: "ठिकाण",
  refNo: "क्रमांक",
  registerNo: "नोंदणी क्र. / पीआरएन",
  tcNo: "दाखला क्र.",
  domicileNo: "अधिवास क्र.",
  principal: "प्राचार्य",
  officeSeal: "कार्यालयीन शिक्का",
  blank: "________________",
  bonafideBody: (a) =>
    `प्रमाणित करण्यात येते की, श्री./कु. ${a.name}, नोंदणी क्र. ${a.registerNo}, ` +
    `हे/ही शैक्षणिक वर्ष ${a.academicYear} मध्ये या संस्थेमध्ये ${a.course}${a.cls ? " (" + a.cls + ")" : ""} ` +
    `या वर्गाचे/चा नियमित विद्यार्थी/विद्यार्थिनी आहेत/होते. ` +
    `महाविद्यालयाच्या नोंदीनुसार त्यांची जन्मतारीख ${a.dob} आहे. ` +
    `त्यांचे चारित्र्य व वर्तणूक ${a.conduct} आहे.`,
  bonafidePurposeLine: "हा दाखला मागणीनुसार खालील कारणासाठी देण्यात येत आहे:",
  bonafidePurpose: (p) => `कारण / शेरा: ${p}`,
  tcName: "१) विद्यार्थ्याचे नाव: ",
  tcMother: "२) आईचे नाव: ",
  tcFather: "३) वडिलांचे / पालकाचे नाव: ",
  tcCaste: (c, r) => `४) जात / पोटजात: ${c}    धर्म: ${r}`,
  tcNationality: (n, p) => `५) राष्ट्रीयत्व: ${n}    जन्मस्थळ: ${p}`,
  tcDobFigures: "६) जन्मतारीख (अंकात): ",
  tcDobWords: "    जन्मतारीख (अक्षरात): ",
  tcAdmission: (d, c) => `७) प्रवेश दिनांक: ${d}    वर्ग: ${c}`,
  tcLeaving: (d, c) => `८) शाळा सोडल्याचा दिनांक: ${d}    अभ्यासक्रम: ${c}`,
  tcSubjects: "९) अभ्यासलेले विषय: ",
  tcConduct: "१०) वर्तणूक: ",
  tcRemarks: "११) शेरा:",
  tcRemarkBody: (a) =>
    `अ) ते/त्या ${a.session} मध्ये घेण्यात आलेल्या ${a.examName} परीक्षेस ${
      a.appeared ? "बसले होते" : "बसले नव्हते"
    } ${a.result ? "व ते " + a.result : ""} आसन क्र. ${a.seatNo} अंतर्गत.`,
  tcClosing: "वरील माहिती महाविद्यालयाच्या नोंदीनुसार खरी असल्याचे प्रमाणित करण्यात येते.",
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
