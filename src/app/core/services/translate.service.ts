import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'en' | 'ar';

type Dict = Record<Lang, Record<string, string>>;

const DICT: Dict = {
  en: {
    dashboard: 'Dashboard',
    groups: 'Groups',
    staff: 'Staff',
    centers: 'Centers',
    courses: 'Courses',
    teachers: 'Teachers',
    students: 'Students',
    contacts: 'Contacts',
    payments: 'Payments',
    settings: 'Settings',
    overview: 'Overview',
    'search.placeholder': 'Search...',
    'theme.light': 'Light mode',
    'theme.dark': 'Dark mode',
    'language.en': 'English',
    'language.ar': 'Arabic',
    'auth.logout': 'Logout',
    'user.role.admin': 'Admin',

    'overview.title': 'Admin Overview',
    'overview.subtitle': 'Snapshot of centers, courses, teachers, students, and payments',
    'actions.viewCenters': 'View centers',
    'actions.viewCourses': 'View courses',
    'recent.title': 'Recent activity',

    'stats.centers': 'Centers',
    'stats.courses': 'Courses',
    'stats.teachers': 'Teachers',
    'stats.students': 'Students',
    'stats.paid': 'Paid',
    'stats.unpaid': 'Unpaid',
    'stats.active': 'Active',
    'stats.online': 'Online',
    'stats.attendanceToday': 'Attendance today',

    'centers.title': 'Centers',
    'centers.subtitle': 'All registered centers with payment status',
    'centers.search': 'Search centers...',
    'centers.add': 'Add center',

    'courses.title': 'Courses',
    'courses.subtitle': 'Available courses and their instructors',
    'courses.search': 'Search courses...',
    'courses.add': 'Add course',

    'teachers.title': 'Teachers',
    'teachers.subtitle': 'All registered teachers',
    'teachers.search': 'Search teachers...',
    'teachers.add': 'Add teacher',

    'students.title': 'Students',
    'students.subtitle': 'Enrolled students and their centers',
    'students.search': 'Search students...',
    'students.add': 'Add student',

    'contacts.title': 'Contacts',
    'contacts.subtitle': 'Key contacts with their roles',
    'contacts.search': 'Search name or email...',
    'contacts.add': 'Add contact',

    'payments.title': 'Payments',
    'payments.subtitle': 'Track which centers are paid or unpaid',
    'payments.add': 'Add payment',
    'filter.all': 'All',
    'filter.paid': 'Paid',
    'filter.unpaid': 'Unpaid',

    'table.name': 'Name',
    'table.location': 'City',
    'table.phone': 'Phone',
    'table.email': 'Email',
    'table.role': 'Role',
    'table.center': 'Center',
    'table.teacher': 'Teacher',
    'table.status': 'Status',
    'table.actions': 'Actions',
    'table.amount': 'Amount',

    'action.view': 'View',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.call': 'Call',

    'status.paid': 'Paid',
    'status.unpaid': 'Unpaid',
    'meta.courses': 'Courses',
    'meta.center': 'Center',
    'meta.phone': 'Phone',
    'course.title': 'Course title',

    'recent.item1': 'New payment received from Skyline Center',
    'recent.item2': 'React bootcamp published for enrollment',
    'recent.item3': 'Attendance sheet updated for today',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    groups: 'المجموعات',
    staff: 'فريق العمل',
    centers: 'المراكز',
    courses: 'الدورات',
    teachers: 'المدربين',
    students: 'الطلاب',
    contacts: 'جهات الاتصال',
    payments: 'المدفوعات',
    settings: 'الإعدادات',
    overview: 'نظرة عامة',
    'search.placeholder': 'بحث...',
    'theme.light': 'وضع النهار',
    'theme.dark': 'وضع الليل',
    'language.en': 'الإنجليزية',
    'language.ar': 'العربية',
    'auth.logout': 'تسجيل الخروج',
    'user.role.admin': 'مسؤول',

    'overview.title': 'نظرة عامة للمدير',
    'overview.subtitle': 'ملخص سريع للمراكز والدورات والمدربين والطلاب والمدفوعات',
    'actions.viewCenters': 'عرض المراكز',
    'actions.viewCourses': 'عرض الدورات',
    'recent.title': 'آخر النشاطات',

    'stats.centers': 'المراكز',
    'stats.courses': 'الدورات',
    'stats.teachers': 'المدربين',
    'stats.students': 'الطلاب',
    'stats.paid': 'مدفوع',
    'stats.unpaid': 'غير مدفوع',
    'stats.active': 'نشط',
    'stats.online': 'متصل',
    'stats.attendanceToday': 'الحضور اليوم',

    'centers.title': 'المراكز',
    'centers.subtitle': 'جميع المراكز المسجلة وحالة السداد',
    'centers.search': 'ابحث عن مركز...',
    'centers.add': 'إضافة مركز',

    'courses.title': 'الدورات',
    'courses.subtitle': 'الدورات المتاحة والمدربين المسؤولين عنها',
    'courses.search': 'ابحث عن دورة...',
    'courses.add': 'إضافة دورة',

    'teachers.title': 'المدربين',
    'teachers.subtitle': 'كل المدربين المسجلين',
    'teachers.search': 'ابحث عن مدرب...',
    'teachers.add': 'إضافة مدرب',

    'students.title': 'الطلاب',
    'students.subtitle': 'الطلاب المسجلين والمراكز الخاصة بهم',
    'students.search': 'ابحث عن طالب...',
    'students.add': 'إضافة طالب',

    'contacts.title': 'جهات الاتصال',
    'contacts.subtitle': 'الأشخاص الرئيسيون وأدوارهم',
    'contacts.search': 'ابحث بالاسم أو البريد...',
    'contacts.add': 'إضافة جهة اتصال',

    'payments.title': 'المدفوعات',
    'payments.subtitle': 'تتبع المراكز المدفوعة وغير المدفوعة',
    'payments.add': 'إضافة دفعة',
    'filter.all': 'الكل',
    'filter.paid': 'مدفوع',
    'filter.unpaid': 'غير مدفوع',

    'table.name': 'الاسم',
    'table.location': 'المدينة',
    'table.phone': 'الهاتف',
    'table.email': 'البريد الإلكتروني',
    'table.role': 'الدور',
    'table.center': 'المركز',
    'table.teacher': 'المدرب',
    'table.status': 'الحالة',
    'table.actions': 'الإجراءات',
    'table.amount': 'المبلغ',

    'action.view': 'عرض',
    'action.edit': 'تعديل',
    'action.delete': 'حذف',
    'action.call': 'اتصال',

    'status.paid': 'مدفوع',
    'status.unpaid': 'غير مدفوع',
    'meta.courses': 'دورات',
    'meta.center': 'المركز',
    'meta.phone': 'هاتف',
    'course.title': 'عنوان الدورة',

    'recent.item1': 'تم استلام دفعة جديدة من مركز سكاي لاين',
    'recent.item2': 'تم نشر معسكر React للتسجيل',
    'recent.item3': 'تم تحديث سجل الحضور لليوم',
  },
};

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private _lang = new BehaviorSubject<Lang>('en');
  lang$ = this._lang.asObservable();

  constructor() {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved) {
      this._lang.next(saved);
    }
    this.applyDoc(this._lang.value);
  }

  setLang(lang: Lang) {
    this._lang.next(lang);
    localStorage.setItem('lang', lang);
    this.applyDoc(lang);
  }

  get lang() {
    return this._lang.value;
  }

  t(key: string): string {
    const map = DICT[this._lang.value] || DICT['en'];
    return map[key] ?? DICT['en'][key] ?? key;
  }

  private applyDoc(lang: Lang) {
    const doc = document.documentElement;
    doc.lang = lang;
    doc.dir = lang === 'ar' ? 'rtl' : 'ltr';
    doc.classList.toggle('rtl', lang === 'ar');
  }
}
