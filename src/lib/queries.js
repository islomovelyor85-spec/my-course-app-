import { supabase } from './supabaseClient'

// -----------------------------------------------------------------------------
// MVP eslatma: hozircha bitta faol kurs bilan ishlaydi (birinchi is_published=true
// kurs). Kelajakda bir nechta kursga yozilish kerak bo'lsa, bu funksiyaga
// courseId parametr qo'shib, kurslar ro'yxati sahifasi ustiga qurish mumkin.
// -----------------------------------------------------------------------------

export async function getActiveCourse() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getMyPayment(userId, courseId) {
  if (!courseId) return null
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getCourseStructure(courseId) {
  const { data: modules, error: modErr } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', courseId)
    .order('order', { ascending: true })
  if (modErr) throw modErr

  // har bir modul ichidagi darslarni ham tartiblab olamiz
  const sorted = (modules || []).map((m) => ({
    ...m,
    lessons: [...(m.lessons || [])].sort((a, b) => a.order - b.order)
  }))
  return sorted
}

export async function getMySubmissionsMap(userId) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error

  // har bir dars uchun eng oxirgi submissionni saqlaymiz (lesson_id -> submission)
  const map = {}
  for (const s of data || []) {
    if (!map[s.lesson_id]) map[s.lesson_id] = s
  }
  return map
}

/**
 * Butun kurs strukturasini, to'lov holatini va qulflash mantig'ini birlashtiradi.
 * Qaytaradi: { course, isPaid, payment, modules, progressPercent, allLessons }
 * modules[].lessons[] elementlariga `locked`, `status`, `submission` qo'shiladi.
 */
export async function getMyCourseOverview(userId) {
  const course = await getActiveCourse()
  if (!course) {
    return { course: null, isPaid: false, payment: null, modules: [], progressPercent: 0, allLessons: [] }
  }

  const [payment, modules, submissionsMap] = await Promise.all([
    getMyPayment(userId, course.id),
    getCourseStructure(course.id),
    getMySubmissionsMap(userId)
  ])

  const isPaid = payment?.status === 'approved'

  const allLessonsFlat = modules.flatMap((m) => m.lessons)
  let previousApproved = true // birinchi dars har doim ochiladi (to'lov bo'lsa)

  const enrichedModules = modules.map((mod) => ({
    ...mod,
    lessons: mod.lessons.map((lesson) => {
      const submission = submissionsMap[lesson.id] || null
      const locked = !isPaid || !previousApproved
      const status = !isPaid
        ? 'locked'
        : submission?.status === 'approved'
        ? 'completed'
        : previousApproved
        ? 'unlocked'
        : 'locked'

      // keyingi darsni hisoblash uchun holatni yangilab boramiz
      previousApproved = previousApproved && submission?.status === 'approved'

      return { ...lesson, submission, locked, status }
    })
  }))

  const completedCount = allLessonsFlat.filter(
    (l) => submissionsMap[l.id]?.status === 'approved'
  ).length
  const progressPercent = allLessonsFlat.length > 0 ? (completedCount / allLessonsFlat.length) * 100 : 0

  return {
    course,
    isPaid,
    payment,
    modules: enrichedModules,
    progressPercent,
    allLessons: allLessonsFlat,
    completedCount,
    totalLessons: allLessonsFlat.length
  }
}

const MAX_FILE_SIZE_MB = 25

// Umumiy, xato sababini aniq ko'rsatadigan fayl yuklash funksiyasi.
// Muammo "rasm tanlanadi, lekin yuborilmaydi" bo'lsa, sabab deyarli har doim
// quyidagilardan biri bo'ladi (shuning uchun har birini alohida tekshiramiz
// va aniq xabar bilan qaytaramiz):
//  1) Storage bucket mavjud emas / nomi xato yozilgan
//  2) Bucket uchun INSERT RLS policy o'rnatilmagan (401/403 xato)
//  3) Foydalanuvchi sessiyasi yo'q (auth.uid() null) — policy uni bloklaydi
//  4) Fayl juda katta yoki tarmoq uzilib qoladi
async function uploadFileToBucket(bucket, file, userId) {
  if (!file) throw new Error('Fayl tanlanmadi')
  if (!userId) throw new Error('Foydalanuvchi aniqlanmadi — sessiya muddati tugagan bo‘lishi mumkin, qayta kiring')

  const sizeMb = file.size / (1024 * 1024)
  if (sizeMb > MAX_FILE_SIZE_MB) {
    throw new Error(`Fayl hajmi ${MAX_FILE_SIZE_MB}MB dan oshmasligi kerak (hozirgi: ${sizeMb.toFixed(1)}MB)`)
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'dat'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined
  })

  if (uploadError) {
    // Supabase xatosini foydalanuvchiga tushunarli qilib qaytaramiz
    const msg = uploadError.message || String(uploadError)
    if (msg.toLowerCase().includes('bucket not found')) {
      throw new Error(
        `"${bucket}" nomli Storage bucket topilmadi. Supabase → Storage bo‘limida shu nomda bucket yaratilganini tekshiring (schema.sql shu bucketlarni avtomatik yaratadi).`
      )
    }
    if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('policy')) {
      throw new Error(
        `Ruxsat rad etildi (RLS policy). Supabase → Storage → Policies bo‘limida "${bucket}" bucket uchun INSERT policy borligini va auth.uid() talabini tekshiring.`
      )
    }
    throw new Error(`Yuklashda xatolik: ${msg}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  if (!data?.publicUrl) {
    throw new Error('Fayl yuklandi, lekin ochiq havola olinmadi — bucket "public" qilib belgilanganini tekshiring')
  }
  return data.publicUrl
}

export async function uploadSubmissionFile(file, userId) {
  return uploadFileToBucket('submissions', file, userId)
}

export async function uploadReceiptFile(file, userId) {
  return uploadFileToBucket('receipts', file, userId)
}

export async function submitTask({ userId, lessonId, fileUrl, comment }) {
  if (!fileUrl && !comment) {
    throw new Error('Fayl yoki matn kiritilmadi')
  }
  const { error } = await supabase.from('submissions').insert({
    user_id: userId,
    lesson_id: lessonId,
    file_url: fileUrl,
    comment,
    status: 'pending'
  })
  if (error) {
    if (error.message?.toLowerCase().includes('row-level security')) {
      throw new Error('Vazifa saqlanmadi (RLS): submissions jadvalida "submissions_insert_own" policy user_id = auth.uid() ekanini tekshiring')
    }
    throw new Error(error.message || 'Vazifani saqlashda xatolik')
  }
}

export async function submitPayment({ userId, courseId, amount, paymentMethod, receiptUrl }) {
  const { error } = await supabase.from('payments').insert({
    user_id: userId,
    course_id: courseId,
    amount,
    payment_method: paymentMethod,
    receipt_url: receiptUrl,
    status: 'pending'
  })
  if (error) {
    if (error.message?.toLowerCase().includes('row-level security')) {
      throw new Error('To‘lov saqlanmadi (RLS): payments jadvalida "payments_insert_own" policy user_id = auth.uid() ekanini tekshiring')
    }
    throw new Error(error.message || 'To‘lovni saqlashda xatolik')
  }
}
