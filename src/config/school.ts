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
  name: "โรงเรียนวัดโสธรวรารามวรวิหาร",
  nameEn: "Wat Sothon Wararam Worawihan School",
  shortName: "โสธรฯ",
  systemName: "ระบบบริหารจัดการสถานศึกษา",
  schoolCode: "24012003",
  affiliation: "สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาฉะเชิงเทรา (สพม.ฉะเชิงเทรา)",
  academicYear: "2569",
  semester: "1",
  address: "เลขที่ 134 ถนนเทพคุณากร ตำบลหน้าเมือง อำเภอเมืองฉะเชิงเทรา จังหวัดฉะเชิงเทรา 24000",
  phone: "038-511989",
  email: "contact@wstr.ac.th",
  website: "http://www.wstr.ac.th",
  support: {
    department: "กลุ่มบริหารงานวิชาการและงานทะเบียนสารสนเทศ",
    room: "ห้องงานทะเบียนและวัดผล อาคารเรียน 1 ชั้น 1",
    phone: "038-511989 ต่อ 101, 102",
    email: "helpdesk@wstr.ac.th",
    lineOfficial: "@wstrschool",
    workingHours: "จันทร์ - ศุกร์ เวลา 08:00 - 16:30 น.",
  },
};
