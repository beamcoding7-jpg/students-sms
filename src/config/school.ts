/**
 * ศูนย์กลางข้อมูลและการตั้งค่าสถานศึกษา (School & System Configuration)
 * Single Source of Truth สำหรับข้อมูลโรงเรียน ปีการศึกษา และช่องทางสนับสนุน
 */

export interface SchoolConfig {
  name: string;
  nameEn: string;
  shortName: string;
  systemName: string;
  schoolCode: string;
  affiliation: string;
  academicYear: string;
  semester: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  support: {
    department: string;
    room: string;
    phone: string;
    email: string;
    lineOfficial?: string;
    workingHours: string;
  };
}

export const SCHOOL_CONFIG: SchoolConfig = {
  name: "โรงเรียนสาธิตวิทยาคม",
  nameEn: "Demonstration Wittayakom School",
  shortName: "สาธิตวิทยาคม",
  systemName: "ระบบบริหารจัดการสถานศึกษา",
  schoolCode: "1010820001",
  affiliation: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)",
  academicYear: "2569",
  semester: "1",
  address: "123 ถนนการศึกษา แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพมหานคร 10400",
  phone: "02-123-4567",
  email: "contact@school.ac.th",
  website: "https://students-sms.vercel.app",
  support: {
    department: "กลุ่มบริหารงานวิชาการและงานทะเบียนสารสนเทศ",
    room: "ห้องงานทะเบียนและวัดผล อาคาร 1 ชั้น 1",
    phone: "02-123-4567 ต่อ 101, 102",
    email: "helpdesk@school.ac.th",
    lineOfficial: "@smsschool",
    workingHours: "จันทร์ - ศุกร์ เวลา 08:00 - 16:30 น.",
  },
};
