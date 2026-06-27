import type { CertificateLang } from "./pdfUtils";

export interface AdditionalCertificateText {
  character: {
    title: string;
    certify: string;
    honorific: string;
    bonafide: string;
    studying: string;
    during: string;
    character: string;
    dob: string;
    clerk: string;
    signature: string;
  };
  form15a: {
    form: string;
    title: string;
    certify: string;
    studentOf: string;
    year: string;
    studying: string;
    faculty: string;
    register: string;
    caste: string;
    strike: string;
    place: string;
    date: string;
    signature: string;
  };
  extract: {
    management: string;
    title: string;
    admissionSerial: string;
    extractNo: string;
    pageNo: string;
    fullName: string;
    aadhaar: string;
    fatherGuardian: string;
    motherName: string;
    religion: string;
    caste: string;
    subCaste: string;
    birthPlace: string;
    guardianOccupation: string;
    motherTongue: string;
    admissionDate: string;
    birthDate: string;
    figures: string;
    words: string;
    admissionClass: string;
    previousSchool: string;
    admittingOfficer: string;
    leavingClass: string;
    leavingDate: string;
    leavingReason: string;
    identification: string;
    leavingOfficer: string;
    headSignature: string;
    remarks: string;
    place: string;
    headmistress: string;
  };
}

const en: AdditionalCertificateText = {
  character: {
    title: "Character Certificate",
    certify: "This is to certify that",
    honorific: "Mr./Miss",
    bonafide: "was/is a bonafide student of",
    studying: "and was/is studying in",
    during: "during the academic year",
    character: "To the best of my knowledge, he/she bears a good moral character.",
    dob: "Date of Birth",
    clerk: "Clerk",
    signature: "Headmistress",
  },
  form15a: {
    form: "Form-15A",
    title: "Certificate to be given by Principal of the School/College",
    certify: "This is to certify that Shri/Kum.",
    studentOf: "is a student of this School/College",
    year: "in the academic year",
    studying: "and is studying in",
    faculty: "faculty. The student's name and other information are recorded at number",
    register: "in the General Register.",
    caste: "The caste stated in our General Register is",
    strike: "(Strike out if not applicable)",
    place: "Place",
    date: "Date",
    signature: "Seal and Signature of Principal / Head Master",
  },
  extract: {
    management: "Nath Shikshan Prasarak Mandal, Pingli Tq. & Dist. Parbhani",
    title: "ADMISSION AND LEAVING REGISTER EXTRACT",
    admissionSerial: "Admission Serial No.",
    extractNo: "Extract No.",
    pageNo: "Page No.",
    fullName: "Student's Full Name",
    aadhaar: "Aadhaar Number",
    fatherGuardian: "Father's / Guardian's Name",
    motherName: "Mother's Name",
    religion: "Religion",
    caste: "Caste",
    subCaste: "Sub-Caste",
    birthPlace: "Place of Birth",
    guardianOccupation: "Father's / Guardian's Occupation",
    motherTongue: "Mother Tongue",
    admissionDate: "Date of Admission",
    birthDate: "Date of Birth",
    figures: "In Figures",
    words: "In Words",
    admissionClass: "Class at Admission",
    previousSchool: "Previous School",
    admittingOfficer: "Signature of Admitting Officer",
    leavingClass: "Class at Leaving",
    leavingDate: "Date of Leaving",
    leavingReason: "Reason for Leaving School",
    identification: "Identification Mark",
    leavingOfficer: "Signature of Officer Recording Leaving",
    headSignature: "Headmistress's Signature",
    remarks: "Remarks",
    place: "Place: Pingli, Tq. & Dist. Parbhani",
    headmistress: "Headmistress",
  },
};

const mr: AdditionalCertificateText = {
  character: {
    title: "चारित्र्य प्रमाणपत्र",
    certify: "प्रमाणित करण्यात येते की",
    honorific: "श्री./कु.",
    bonafide: "हा/ही या विद्यालयाचा/विद्यालयाची नियमित विद्यार्थी/विद्यार्थिनी आहे/होता/होती.",
    studying: "तो/ती इयत्ता",
    during: "या शैक्षणिक वर्षात शिक्षण घेत आहे/होता/होती.",
    character: "माझ्या माहितीनुसार त्याचे/तिचे वर्तन चांगले व नैतिक आहे.",
    dob: "जन्म दिनांक",
    clerk: "लिपिक",
    signature: "मुख्याध्यापिका",
  },
  form15a: {
    form: "नमुना-१५ अ",
    title: "शाळा/महाविद्यालयाच्या प्राचार्यांनी द्यावयाचे प्रमाणपत्र",
    certify: "प्रमाणित करण्यात येते की श्री./कु.",
    studentOf: "हा/ही या शाळेचा/महाविद्यालयाचा विद्यार्थी/विद्यार्थिनी आहे.",
    year: "शैक्षणिक वर्ष",
    studying: "मध्ये इयत्ता",
    faculty: "या शाखेत शिक्षण घेत आहे. त्याचे/तिचे नाव व इतर माहिती",
    register: "या क्रमांकावर जनरल रजिस्टरमध्ये नोंदविलेली आहे.",
    caste: "आमच्या जनरल रजिस्टरनुसार त्याची/तिची जात",
    strike: "(लागू नसलेला मजकूर खोडावा)",
    place: "ठिकाण",
    date: "दिनांक",
    signature: "शिक्का व प्राचार्य / मुख्याध्यापक यांची सही",
  },
  extract: {
    management: "नाथ शिक्षण प्रसारक मंडळ, पिंगळी ता. जि. परभणी संचलित",
    title: "प्रवेश निर्गम उतारा",
    admissionSerial: "प्रवेश अनुक्रमांक",
    extractNo: "निर्गम क्रमांक",
    pageNo: "पान क्रमांक",
    fullName: "विद्यार्थ्याचे संपूर्ण नाव",
    aadhaar: "आधार क्रमांक",
    fatherGuardian: "वडिलांचे नाव / वडील हयात नसल्यास पालकाचे नाव",
    motherName: "आईचे नाव",
    religion: "धर्म",
    caste: "जात",
    subCaste: "पोटजात",
    birthPlace: "जन्मस्थळ",
    guardianOccupation: "वडील / पालकाचा व्यवसाय",
    motherTongue: "मातृभाषा",
    admissionDate: "प्रवेश दिनांक",
    birthDate: "जन्म दिनांक",
    figures: "अंकात",
    words: "अक्षरात",
    admissionClass: "प्रवेश समयी वर्ग",
    previousSchool: "पूर्वीच्या शाळेचे नाव",
    admittingOfficer: "प्रवेश देणाऱ्या अधिकाऱ्याची सही",
    leavingClass: "निर्गम समयी वर्ग",
    leavingDate: "निर्गम दिनांक",
    leavingReason: "शाळा सोडण्याचे कारण",
    identification: "परिचय चिन्ह",
    leavingOfficer: "निर्गमाची नोंद घेणाऱ्या अधिकाऱ्याची सही",
    headSignature: "मुख्याध्यापिकेची सही",
    remarks: "शेरा",
    place: "स्थळ : पिंगळी ता. जि. परभणी",
    headmistress: "मुख्याध्यापिका",
  },
};

export const getAdditionalCertificateText = (lang: CertificateLang) =>
  lang === "mr" ? mr : en;
